import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Banner from '@/lib/models/Banner';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const bannerId = id;

    if (!bannerId) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await Banner.findByIdAndDelete(bannerId);

    if (!result) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Banner deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: error.message || 'Error deleting banner' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const bannerId = id;
    const body = await request.json();

    if (!bannerId) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const banner = await Banner.findByIdAndUpdate(
      bannerId,
      {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        location: body.location,
        ctaText: body.ctaText,
        ctaLink: body.ctaLink,
        isActive: body.isActive,
        order: body.order,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(banner, { status: 200 });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: error.message || 'Error updating banner' },
      { status: 500 }
    );
  }
}
