import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Banner from '@/lib/models/Banner';

export async function GET() {
  try {
    await connectDB();
    
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();

    return NextResponse.json(banners);
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching banners' },
      { status: 500 }
    );
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

    const body = await request.json();
    await connectDB();

    const banner = new Banner({
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
      location: body.location || 'featured',
      ctaText: body.ctaText,
      ctaLink: body.ctaLink,
      isActive: body.isActive !== false,
      order: body.order || 0,
    });

    try {
      await banner.save();
    } catch (saveError: any) {
      // Handle E11000 duplicate key error from old index
      if (saveError.code === 11000) {
        console.log('E11000 error detected, attempting to drop problematic index...');
        try {
          const collection = Banner.collection;
          await collection.dropIndex('type_1');
          console.log('Dropped type_1 index successfully');
          // Retry the save
          await banner.save();
        } catch (indexError: any) {
          console.error('Could not drop index:', indexError.message);
          throw new Error('Database index conflict. Please contact support.');
        }
      } else {
        throw saveError;
      }
    }

    return NextResponse.json(banner, { status: 201 });
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating banner' },
      { status: 500 }
    );
  }
}
