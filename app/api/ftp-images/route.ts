import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { Client } from 'basic-ftp';
import { extractToken, verifyToken } from '@/lib/middleware/auth';

const FTP_CONFIG_FILE = join(process.cwd(), 'public', 'ftp-config.json');

async function getFtpConfig() {
  try {
    // On Vercel, read from environment variables
    if (process.env.VERCEL_URL || process.env.VERCEL) {
      if (process.env.FTP_HOST && process.env.FTP_USERNAME && process.env.FTP_PASSWORD) {
        return {
          enabled: true,
          host: process.env.FTP_HOST,
          port: parseInt(process.env.FTP_PORT || '21', 10),
          username: process.env.FTP_USERNAME,
          password: process.env.FTP_PASSWORD,
          basePath: process.env.FTP_BASE_PATH || '/images',
          baseUrl: process.env.FTP_BASE_URL || '',
        };
      }
      return null;
    }

    // On localhost, read from file
    if (existsSync(FTP_CONFIG_FILE)) {
      const data = await readFile(FTP_CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading FTP config:', error);
  }
  return null;
}

interface FTPFile {
  name: string;
  type: 'file' | 'directory';
  size: number;
  modifiedAt: Date;
  isDirectory: boolean;
}

async function listFtpImages(ftpConfig: any, folder?: string): Promise<FTPFile[]> {
  let client: Client | null = null;
  try {
    client = new Client();
    await client.access({
      host: ftpConfig.host,
      port: ftpConfig.port || 21,
      user: ftpConfig.username,
      password: ftpConfig.password,
    });

    const basePath = ftpConfig.basePath || '/images';
    const targetPath = folder ? `${basePath}/${folder}` : basePath;

    // List files in the directory
    const files = await client.list(targetPath);

    // Filter to only image files and subdirectories
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'];
    const filtered: FTPFile[] = files
      .filter(
        (file) =>
          file.isDirectory ||
          imageExtensions.includes(file.name.split('.').pop()?.toLowerCase() || '')
      )
      .map((file) => ({
        name: file.name,
        type: (file.isDirectory ? 'directory' : 'file') as 'file' | 'directory',
        size: file.size || 0,
        modifiedAt: file.modifiedAt || new Date(),
        isDirectory: file.isDirectory,
      }));

    return filtered;
  } catch (error) {
    console.error('FTP list error:', error);
    throw error;
  } finally {
    if (client) {
      client.close();
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get FTP config
    const ftpConfig = await getFtpConfig();
    if (!ftpConfig || !ftpConfig.enabled || !ftpConfig.host) {
      return NextResponse.json(
        { error: 'FTP not configured' },
        { status: 400 }
      );
    }

    // Get folder parameter from query
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';

    // List FTP images
    const images = await listFtpImages(ftpConfig, folder);

    // Build full URLs for the images
    const baseUrl = ftpConfig.baseUrl || '';
    const imagesWithUrls = images.map((img) => ({
      ...img,
      url: img.isDirectory
        ? null
        : `${baseUrl}${folder ? `/${folder}` : ''}/images/${img.name}`,
    }));

    return NextResponse.json({
      images: imagesWithUrls,
      basePath: ftpConfig.basePath,
      baseUrl: ftpConfig.baseUrl,
      currentFolder: folder,
    });
  } catch (error: any) {
    console.error('Error fetching FTP images:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch FTP images' },
      { status: 500 }
    );
  }
}
