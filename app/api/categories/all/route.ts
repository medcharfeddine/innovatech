import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Category from '@/lib/models/Category';

export async function GET() {
  try {
    await connectDB();

    // Get all categories with parent populated
    const categories = await Category.find({})
      .populate('parent', 'name slug')
      .sort('order')
      .lean();

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Get all categories error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
