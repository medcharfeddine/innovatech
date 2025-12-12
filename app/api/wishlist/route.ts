import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Wishlist } from '@/lib/models/Wishlist';
import { extractToken, verifyToken } from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const wishlist = await Wishlist.findOne({ userId: decoded.id });
    
    if (!wishlist) {
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json(wishlist);
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching wishlist' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const { productId, name, price, imageUrl } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: decoded.id },
      {
        $addToSet: {
          items: {
            productId,
            name,
            price,
            imageUrl,
            addedAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(wishlist);
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { error: error.message || 'Error adding to wishlist' },
      { status: 500 }
    );
  }
}
