import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import HomeSettings from '@/lib/models/HomeSettings';

// Verify admin token
async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  
  // In a production app, verify JWT token here
  // For now, we'll accept any non-empty token
  // You should implement proper JWT verification
  return token ? { role: 'admin', id: 'admin' } : null;
}

export async function GET() {
  try {
    await connectDB();

    // Get the current home settings (there should only be one document)
    let settings = await HomeSettings.findOne();
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = new HomeSettings();
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching home settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await req.json();

    // Get or create settings document
    let settings = await HomeSettings.findOne();
    
    if (!settings) {
      settings = new HomeSettings();
    }

    // Update fields
    Object.keys(body).forEach((key) => {
      if (key !== '_id' && key !== 'createdAt') {
        settings[key] = body[key];
      }
    });

    settings.lastUpdatedBy = admin.id;
    settings.lastUpdatedAt = new Date();

    await settings.save();

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating home settings:', error);
    return NextResponse.json(
      { error: 'Failed to update home settings' },
      { status: 500 }
    );
  }
}
