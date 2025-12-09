import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { Client } from 'basic-ftp';

const FTP_CONFIG_FILE = join(process.cwd(), 'public', 'ftp-config.json');

async function getFtpConfig() {
  try {
    if (process.env.VERCEL_URL || process.env.VERCEL) {
      return null;
    }

    if (existsSync(FTP_CONFIG_FILE)) {
      const data = await readFile(FTP_CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading FTP config:', error);
  }
  return null;
}

async function uploadToFtp(file: File, filename: string, ftpConfig: any): Promise<string | null> {
  let client: Client | null = null;
  try {
    client = new Client();
    await client.access({
      host: ftpConfig.host,
      port: ftpConfig.port || 21,
      user: ftpConfig.username,
      password: ftpConfig.password,
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const basePath = ftpConfig.basePath || '/images';
    const remotePath = `${basePath}/${filename}`;

    // Convert buffer to Readable stream for FTP upload
    const { Readable } = require('stream');
    const readableStream = Readable.from(buffer);
    
    await client.uploadFrom(readableStream, remotePath);

    const baseUrl = ftpConfig.baseUrl || '';
    if (!baseUrl) {
      console.warn('FTP baseUrl not configured, file uploaded but URL unavailable');
      return null;
    }

    return `${baseUrl}/${filename}`;
  } catch (error) {
    console.error('FTP upload error:', error);
    return null;
  } finally {
    if (client) {
      client.close();
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon'];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File must be an image (${validImageTypes.join(', ')})` },
        { status: 400 }
      );
    }

    // Check if running on Vercel
    const isVercel = !!process.env.VERCEL_URL || process.env.VERCEL === 'true';
    
    // Validate file size based on environment
    const maxSize = isVercel ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${maxSize / 1024 / 1024}MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)` },
        { status: 413 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${type}-${timestamp}.${ext}`;

    // Try FTP upload first if configured
    const ftpConfig = await getFtpConfig();
    if (ftpConfig?.enabled && ftpConfig?.host && ftpConfig?.username && ftpConfig?.password) {
      const ftpUrl = await uploadToFtp(file, filename, ftpConfig);
      if (ftpUrl) {
        return NextResponse.json(
          { url: ftpUrl, filename, uploadedTo: 'ftp' },
          { status: 200 }
        );
      }
      // If FTP fails and we're on Vercel, return error
      if (isVercel) {
        return NextResponse.json(
          { 
            error: 'FTP upload failed and local storage not available on Vercel',
            helpUrl: 'https://vercel.com/docs/storage/overview'
          },
          { status: 501 }
        );
      }
      // Otherwise fall through to local storage
      console.warn('FTP upload failed, falling back to local storage');
    }

    // If on Vercel and no FTP configured, return error
    if (isVercel) {
      return NextResponse.json(
        { 
          error: 'No FTP configured. Configure FTP server in Admin Dashboard > Settings > FTP Server, or use cloud storage.',
          helpUrl: 'https://vercel.com/docs/storage/overview'
        },
        { status: 501 }
      );
    }

    // Fallback to local storage (development/localhost)
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filepath = join(uploadsDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const url = `/uploads/${filename}`;
    return NextResponse.json(
      { url, filename, uploadedTo: 'local' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error uploading file:', error);
    
    // Return appropriate status code for different errors
    const status = error.code === 'ENOSPC' ? 507 : 500;
    
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status }
    );
  }
}
