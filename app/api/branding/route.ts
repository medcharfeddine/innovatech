import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { connectDB } from '@/lib/db/mongodb';
import Branding from '@/lib/models/Branding';

const BRANDING_FILE = join(process.cwd(), 'public', 'branding.json');

// Default branding data
const DEFAULT_BRANDING = {
  _id: '1',
  siteName: 'Nova',
  storeName: 'Nova Store',
  pageTitle: 'Nova - E-commerce Platform',
  pageDescription: 'Premium e-commerce platform for shopping',
  logoUrl: process.env.BRANDING_LOGO_URL || 'https://techink.fwh.is/images/branding/logo-1764704649660.png',
  faviconUrl: process.env.BRANDING_FAVICON_URL || 'https://techink.fwh.is/images/branding/favicon-1765316780539.jpg',
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
    // Try to get from MongoDB first (persistent)
    await connectDB();
    let branding = await Branding.findById('1');
    
    if (branding) {
      return branding.toObject();
    }

    // Fallback: try to read from local file on localhost
    if (!process.env.VERCEL_URL && !process.env.VERCEL) {
      if (existsSync(BRANDING_FILE)) {
        const data = await readFile(BRANDING_FILE, 'utf-8');
        const fileData = JSON.parse(data);
        
        // Save to MongoDB if found in file
        try {
          branding = await Branding.findByIdAndUpdate('1', fileData, { upsert: true, new: true });
          return branding.toObject();
        } catch (err) {
          console.warn('Could not save file data to MongoDB:', err);
          return fileData;
        }
      }
    }

    return DEFAULT_BRANDING;
  } catch (error) {
    console.error('Error reading branding data:', error);
  }
  return DEFAULT_BRANDING;
}

async function saveBrandingData(data: any) {
  try {
    await connectDB();
    const branding = await Branding.findByIdAndUpdate('1', data, { upsert: true, new: true });
    
    // Also save to file on localhost for reference
    if (!process.env.VERCEL_URL && !process.env.VERCEL) {
      try {
        await writeFile(BRANDING_FILE, JSON.stringify(branding.toObject(), null, 2), 'utf-8');
      } catch (err) {
        console.warn('Could not save to file:', err);
      }
    }

    return branding.toObject();
  } catch (error) {
    console.error('Error saving branding data:', error);
    throw error;
  }
}

export async function GET(_request: NextRequest) {
  try {
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
