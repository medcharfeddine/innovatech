import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { Client } from 'basic-ftp';
import { extractToken, verifyToken } from '@/lib/middleware/auth';

const FTP_CONFIG_FILE = join(process.cwd(), 'public', 'ftp-config.json');

// Default FTP config (empty)
const DEFAULT_FTP_CONFIG = {
  enabled: false,
  host: '',
  port: 21,
  username: '',
  password: '',
  basePath: '/images', // Path on FTP server where images will be stored
  baseUrl: '', // Public URL to access images (e.g., https://images.example.com)
  createdAt: new Date().toISOString(),
};

async function getFtpConfig() {
  try {
    // Skip file reading on Vercel
    if (process.env.VERCEL_URL || process.env.VERCEL) {
      return DEFAULT_FTP_CONFIG;
    }

    if (existsSync(FTP_CONFIG_FILE)) {
      const data = await readFile(FTP_CONFIG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading FTP config:', error);
  }
  return DEFAULT_FTP_CONFIG;
}

async function saveFtpConfig(config: any) {
  try {
    // Skip file operations on Vercel
    if (process.env.VERCEL_URL || process.env.VERCEL) {
      console.warn('FTP config not persisted on Vercel (ephemeral filesystem)');
      return;
    }

    await writeFile(FTP_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving FTP config:', error);
  }
}

async function testFtpConnection(config: any) {
  const client = new Client();
  try {
    await client.access({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
    });

    // Try to access the base path
    if (config.basePath) {
      try {
        await client.cd(config.basePath);
      } catch {
        // Path doesn't exist, try to create it
        await client.ensureDir(config.basePath);
      }
    }

    return { success: true, message: 'FTP connection successful' };
  } catch (error: any) {
    return { success: false, message: error.message || 'FTP connection failed' };
  } finally {
    client.close();
  }
}

export async function GET() {
  try {
    const config = await getFtpConfig();
    
    // Don't send password to client
    const safeConfig = {
      ...config,
      password: config.password ? '••••••••' : '',
    };

    return NextResponse.json(safeConfig);
  } catch (error: any) {
    console.error('Error fetching FTP config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch FTP config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { host, port, username, password, basePath, baseUrl, test } = body;

    // Validate required fields
    if (!host || !port || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required FTP credentials' },
        { status: 400 }
      );
    }

    const newConfig = {
      enabled: true,
      host: host.trim(),
      port: parseInt(port, 10),
      username: username.trim(),
      password: password.trim(),
      basePath: (basePath || '/images').trim(),
      baseUrl: (baseUrl || '').trim(),
      createdAt: new Date().toISOString(),
    };

    // Test connection if requested
    if (test) {
      const testResult = await testFtpConnection(newConfig);
      if (!testResult.success) {
        return NextResponse.json(
          { error: testResult.message },
          { status: 400 }
        );
      }
    }

    // Save configuration
    await saveFtpConfig(newConfig);

    return NextResponse.json({
      message: 'FTP configuration saved successfully',
      config: { ...newConfig, password: '••••••••' },
    });
  } catch (error: any) {
    console.error('Error saving FTP config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save FTP config' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Reset to default config
    await saveFtpConfig(DEFAULT_FTP_CONFIG);

    return NextResponse.json({ message: 'FTP configuration reset' });
  } catch (error: any) {
    console.error('Error resetting FTP config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reset FTP config' },
      { status: 500 }
    );
  }
}
