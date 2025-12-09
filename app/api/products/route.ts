import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import { extractToken, verifyToken } from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Handle category filtering by slug
    if (categorySlug) {
      const category = (await Category.findOne({ slug: categorySlug.toLowerCase() }).lean()) as any;
      if (category && category._id) {
        // Check if this is a parent category (has children)
        const children = (await Category.find({ parent: category._id }).lean().select('name')) as Array<any>;
        
        if (children.length > 0) {
          // Parent category - show products from parent or any of its children
          const categoryNames = [category.name, ...children.map(c => c.name)];
          filter.$or = [
            { categoryParent: category.name },
            { categoryChild: { $in: categoryNames } }
          ];
        } else if (category.parent) {
          // Child category - show products with this parent and child
          const parentCat = (await Category.findById(category.parent).lean().select('name')) as any;
          if (parentCat) {
            filter.categoryParent = parentCat.name;
            filter.categoryChild = category.name;
          }
        } else {
          // Standalone category
          filter.categoryParent = category.name;
        }
      }
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

    // Use lean() for better performance on read-only queries
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('name price discount imageUrl images categoryParent categoryChild rating featured')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
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
