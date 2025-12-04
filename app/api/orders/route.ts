import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import Order from '@/lib/models/Order';
import { extractToken, verifyToken } from '@/lib/middleware/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = extractToken(req);
    let decoded = null;
    let isAdmin = false;

    // Try to authenticate if token is provided
    if (token) {
      decoded = verifyToken(token);
      if (decoded) {
        isAdmin = decoded.role === 'admin';
      }
    }

    // Only return all orders if authenticated as admin, otherwise 401
    if (!isAdmin) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    // Get all orders for admin
    const orders = await Order.find({})
      .populate('user')
      .populate('products.product')
      .populate('tracking.by');

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = extractToken(req);
    let userId = null;

    // Try to get user ID from token if provided
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.id;
      }
    }

    const { items, customerInfo, total, products, totalAmount, paymentMethod } = await req.json();

    // Support both old and new payload formats
    const orderItems = items || products;
    const finalTotal = total || totalAmount;
    const finalPaymentMethod = paymentMethod || 'COD';

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ message: 'No items in order' }, { status: 400 });
    }

    // Validate that total is a number
    if (typeof finalTotal !== 'number' || finalTotal <= 0) {
      console.error('Invalid total:', finalTotal);
      return NextResponse.json({ message: 'Invalid order total' }, { status: 400 });
    }

    // Ensure customerInfo is properly structured
    const finalCustomerInfo = customerInfo ? {
      firstName: customerInfo.firstName || '',
      lastName: customerInfo.lastName || '',
      email: customerInfo.email || '',
      phone: customerInfo.phone || '',
      address: customerInfo.address || '',
      city: customerInfo.city || '',
      postalCode: customerInfo.postalCode || '',
      country: customerInfo.country || '',
    } : {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
    };

    // Log for debugging
    console.log('POST /api/orders - Creating order with:', {
      items: orderItems.length,
      customerInfo: finalCustomerInfo,
      total: finalTotal,
      userId: userId || 'guest',
    });

    // Map items with validation
    const mappedProducts = orderItems.map((item: any) => {
      const productId = item.productId || item.product?._id || item.product;
      if (!productId) {
        throw new Error(`Invalid product ID in item: ${JSON.stringify(item)}`);
      }
      return {
        product: productId,
        quantity: item.quantity || 1,
        price: item.price || 0,
      };
    });

    const order = new Order({
      user: userId || null, // Allow guest orders
      products: mappedProducts,
      totalAmount: finalTotal,
      paymentMethod: finalPaymentMethod,
      status: 'pending',
      customerInfo: finalCustomerInfo, // Save structured customer info from checkout form
    });

    const savedOrder = await order.save();

    console.log('Order created successfully:', {
      _id: savedOrder._id,
      customerInfo: savedOrder.customerInfo,
      storedFields: savedOrder.customerInfo ? Object.keys(savedOrder.customerInfo) : 'no customerInfo',
    });

    return NextResponse.json(savedOrder, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ message: error.message || 'Failed to create order' }, { status: 500 });
  }
}
