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
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File must be an image (${validImageTypes.join(', ')})` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than 10MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)` },
        { status: 400 }
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

    // Return public URL with full domain on Vercel
    let url = `/uploads/${filename}`;
    
    // Get full URL for Vercel deployment
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    
    if (host && host !== 'localhost:3000') {
      // On Vercel or production
      url = `${protocol}://${host}/uploads/${filename}`;
    } else if (process.env.VERCEL_URL) {
      // Vercel environment variable
      url = `https://${process.env.VERCEL_URL}/uploads/${filename}`;
    }

    return NextResponse.json(
      { url, filename },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
