import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if running on Vercel - more reliable detection
    const isVercel = !!process.env.VERCEL_URL || process.env.VERCEL === 'true';
    
    if (isVercel) {
      return NextResponse.json(
        { 
          error: 'File uploads are not supported on Vercel due to ephemeral filesystem. Configure cloud storage (AWS S3, Cloudinary, Supabase) instead.',
          helpUrl: 'https://vercel.com/docs/storage/overview'
        },
        { status: 501 }
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

    // Validate file size (max 10MB on production, 50MB on development)
    const maxSize = isVercel ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${maxSize / 1024 / 1024}MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)` },
        { status: 413 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${type}-${timestamp}.${ext}`;
    const filepath = join(uploadsDir, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    // Return public URL
    const url = `/uploads/${filename}`;

    return NextResponse.json(
      { url, filename },
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
