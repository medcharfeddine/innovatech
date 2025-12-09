import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Category from '@/lib/models/Category';

export async function GET() {
  try {
    await connectDB();

    // Get parent categories with their subcategories
    const parentCategories = (await Category.find({ parent: null })
      .sort('order')
      .lean()
      .exec()) as Array<any>;

    const categoriesWithChildren = await Promise.all(
      parentCategories.map(async (parent: any) => {
        const children = (await Category.find({ parent: parent._id })
          .sort('order')
          .lean()
          .exec()) as Array<any>;
        return {
          ...parent,
          subcategories: children || [],
        };
      })
    );

    return NextResponse.json(categoriesWithChildren);
  } catch (error: any) {
    console.error('Get all categories error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
