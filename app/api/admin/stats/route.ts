import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';

export async function GET() {
  try {
    await connectDB();

    // Get stats from database
    const [totalProducts, totalOrders, totalUsers, orders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.find().select('totalAmount').lean(),
    ]);

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue.toFixed(2),
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
