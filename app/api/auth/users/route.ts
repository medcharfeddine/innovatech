import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Here you would verify the token and check if user is admin
    // For now, we'll just verify the token exists
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Build filter query
    const filter: any = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch users with filters
    const users = await User.find(
      filter,
      { password: 0 } // Exclude password field
    )
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    return NextResponse.json(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

