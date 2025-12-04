import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Category from '@/lib/models/Category';
import { extractToken, verifyToken } from '@/lib/middleware/auth';

export async function GET() {
  try {
    await connectDB();

    // Get parent categories
    const parentCategories = await Category.find({ parent: null })
      .sort('order')
      .lean()
      .exec();

    console.log('Parent categories found:', parentCategories.length);

    // For each parent, fetch its subcategories
    const categoriesWithSubcategories = await Promise.all(
      parentCategories.map(async (parent: any) => {
        const subcategories = await Category.find({ parent: parent._id })
          .sort('order')
          .lean()
          .exec();
        return {
          ...parent,
          subcategories: subcategories || [],
        };
      })
    );

    console.log('Returning categories with subcategories:', categoriesWithSubcategories.length);
    return NextResponse.json(categoriesWithSubcategories);
  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const { name, description, slug, parent, order } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const category = new Category({
      name,
      description,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      parent: parent || null,
      order: order || 0,
    });

    await category.save();

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
