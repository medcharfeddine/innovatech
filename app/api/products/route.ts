import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Product from '@/lib/models/Product';
import { extractToken, verifyToken } from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categoryParent = searchParams.get('categoryParent');
    const categoryChild = searchParams.get('categoryChild');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');
    const adminView = searchParams.get('adminView');

    const filter: any = {};

    if (categoryParent) {
      filter.categoryParent = categoryParent;
    }
    if (categoryChild) {
      filter.categoryChild = categoryChild;
    }
    if (brand) {
      filter.brand = brand;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (featured === 'true') {
      filter.featured = true;
    }

    let query = Product.find(filter);
    
    // Admin view returns all products with minimal filtering
    if (adminView === 'true') {
      query = Product.find({});
    }

    // Use lean() first, then only populate if needed
    const products = await query.lean().exec();

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
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

    const body = await req.json();
    const product = new Product(body);
    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
