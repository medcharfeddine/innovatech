import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'basic-ftp';
import { Readable } from 'stream';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { extractToken, verifyToken } from '@/lib/middleware/auth';

const FTP_CONFIG_FILE = join(process.cwd(), 'public', 'ftp-config.json');

async function getFtpConfig() {
  try {
    // Skip file reading on Vercel
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

export async function POST(request: NextRequest) {
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
    if (!ftpConfig || !ftpConfig.enabled) {
      return NextResponse.json(
        { error: 'FTP not configured' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (images only)
    const validMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 413 }
      );
    }

    // Generate filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${timestamp}_${sanitizedFileName}`;
    const remotePath = folder ? `${folder}/${filename}` : filename;

    // Upload to FTP
    const client = new Client();
    try {
      await client.access({
        host: ftpConfig.host,
        port: ftpConfig.port,
        user: ftpConfig.username,
        password: ftpConfig.password,
      });

      // Ensure base path exists
      try {
        await client.cd(ftpConfig.basePath);
      } catch {
        await client.ensureDir(ftpConfig.basePath);
        await client.cd(ftpConfig.basePath);
      }

      // Create folder if needed
      if (folder) {
        try {
          await client.ensureDir(folder);
        } catch {
          // Folder might already exist
        }
      }

      // Upload file
      const buffer = await file.arrayBuffer();
      const stream = Readable.from(Buffer.from(buffer));
      await client.uploadFrom(stream, remotePath);

      // Generate accessible URL
      const baseUrl = ftpConfig.baseUrl || `ftp://${ftpConfig.host}`;
      const fileUrl = `${baseUrl}${ftpConfig.basePath}/${remotePath}`.replace(/\/+/g, '/');

      return NextResponse.json({
        success: true,
        filename: filename,
        url: fileUrl,
        path: `${ftpConfig.basePath}/${remotePath}`,
      });
    } finally {
      client.close();
    }
  } catch (error: any) {
    console.error('FTP upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
