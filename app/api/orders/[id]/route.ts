import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { extractToken, verifyToken } from '@/lib/middleware/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const order = await Order.findById(id)
      .populate('user')
      .populate('products.product')
      .populate('tracking.by');

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Check authorization if token is provided
    const token = extractToken(req);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        // Allow admin or the order's user to view
        const isAdmin = decoded.role === 'admin';
        const isOrderUser = order.user && order.user.toString() === decoded.id;
        if (!isAdmin && !isOrderUser) {
          return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
      }
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Get order error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const order = await Order.findByIdAndUpdate(id, body, { new: true })
      .populate('user')
      .populate('products.product')
      .populate('tracking.by');

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { id } = await params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    console.log('Order deleted:', id);
    return NextResponse.json({ message: 'Order deleted successfully', deletedId: id });
  } catch (error: any) {
    console.error('Delete order error:', error);
    return NextResponse.json({ message: error.message || 'Failed to delete order' }, { status: 500 });
  }
}
