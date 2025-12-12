import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { Wishlist } from '@/lib/models/Wishlist';
import { extractToken, verifyToken } from '@/lib/middleware/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: decoded.id },
      {
        $pull: {
          items: { productId },
        },
      },
      { new: true }
    );

    return NextResponse.json(wishlist || { items: [] });
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { error: error.message || 'Error removing from wishlist' },
      { status: 500 }
    );
  }
}
