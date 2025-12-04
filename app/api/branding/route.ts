import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const BRANDING_FILE = join(process.cwd(), 'public', 'branding.json');

// Default branding data
const DEFAULT_BRANDING = {
  _id: '1',
  siteName: 'Nova',
  storeName: 'Nova Store',
  logoUrl: '',
  faviconUrl: '/favicon.ico',
  primaryColor: '#2a317f',
  accentColor: '#df172e',
  description: 'Premium E-commerce Store',
  contactEmail: 'info@nova.com',
  contactPhone: '+216 56 664 442',
  address: 'Tunisia',
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com'
  }
};

async function getBrandingData() {
  try {
    if (existsSync(BRANDING_FILE)) {
      const data = await readFile(BRANDING_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading branding file:', error);
  }
  return DEFAULT_BRANDING;
}

async function saveBrandingData(data: any) {
  try {
    await writeFile(BRANDING_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving branding file:', error);
    throw error;
  }
}

export async function GET(_request: NextRequest) {
  try {
    await connectDB();
    const branding = await getBrandingData();
    
    // Ensure valid JSON response
    if (!branding) {
      return NextResponse.json(DEFAULT_BRANDING);
    }
    
    return NextResponse.json(branding);
  } catch (error) {
    console.error('Error fetching branding:', error);
    // Return default branding on error instead of error status
    return NextResponse.json(DEFAULT_BRANDING);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    await connectDB();

    // Get existing branding and merge with new data
    const existingBranding = await getBrandingData();
    const updatedBranding = {
      ...existingBranding,
      ...body,
      _id: existingBranding._id // Preserve ID
    };

    // Save to file
    await saveBrandingData(updatedBranding);

    return NextResponse.json(updatedBranding, { status: 200 });
  } catch (error: any) {
    console.error('Error updating branding:', error);
    return NextResponse.json(
      { error: error.message || 'Error updating branding' },
      { status: 500 }
    );
  }
}
