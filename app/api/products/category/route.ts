import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Product from '@/lib/models/Product';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    await connectDB();

    const categorySlug = slug;
    const parts = decodeURIComponent(categorySlug)
      .split('-')
      .filter(Boolean)
      .map((part) => part.trim());

    const variations = [
      parts.join(' '),
      parts.join(' > '),
      parts.join(''),
      parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' '),
      parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' > '),
    ];

    const products = await Product.find({
      $or: [
        { categoryParent: { $in: variations } },
        { categoryChild: { $in: variations } },
        { category: { $in: variations } },
      ],
    }).populate('reviews.user');

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Get products by category error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
