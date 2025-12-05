'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from '@/styles/orderConfirmation.module.css';

interface OrderConfirmation {
  _id: string;
  products?: any[];
  items?: any[];
  totalAmount?: number;
  total?: number;
  status: string;
  createdAt: string;
  estimatedDelivery?: string;
  customerInfo?: any;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });

        if (response.ok) {
          const data = await response.json();
          setOrder(data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return <div className={styles.loading}>Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className={styles.notFound}>
        <h1>Order not found</h1>
        <Link href="/">Return to Home</Link>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);
  const deliveryDate = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

  return (
    <div className={styles.confirmationPage}>
      <div className={styles.successMessage}>
        <h1>✓ Order Confirmed!</h1>
        <p>Thank you for your purchase</p>
      </div>

      <div className={styles.container}>
        <section className={styles.section}>
          <h2>Order Details</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detail}>
              <label>Order Number</label>
              <p className={styles.value}>{order._id}</p>
            </div>
            <div className={styles.detail}>
              <label>Order Date</label>
              <p className={styles.value}>{orderDate.toLocaleDateString()}</p>
            </div>
            <div className={styles.detail}>
              <label>Status</label>
              <p className={styles.value}>
                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
              </p>
            </div>
            <div className={styles.detail}>
              <label>Estimated Delivery</label>
              <p className={styles.value}>{deliveryDate.toLocaleDateString()}</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Shipping To</h2>
          <div className={styles.shippingInfo}>
            {order.customerInfo ? (
              <>
                <p>{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                <p>{order.customerInfo.address}</p>
                <p>{order.customerInfo.city}, {order.customerInfo.postalCode}</p>
                <p>{order.customerInfo.country}</p>
                <p>Email: {order.customerInfo.email}</p>
                <p>Phone: {order.customerInfo.phone}</p>
              </>
            ) : (
              <p>No shipping information available</p>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Order Items</h2>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || order.products || []).map((item: any, idx: number) => (
                <tr key={idx}>
                  <td>{item.name || item.product?.name || 'Product'}</td>
                  <td>{item.quantity}</td>
                  <td>د.ت {(item.price || 0).toFixed(2)}</td>
                  <td>د.ت {((item.price || 0) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.total}>
            <p>Total: <strong>د.ت {(order.total || order.totalAmount || 0).toFixed(2)}</strong></p>
          </div>
        </section>

        <div className={styles.actions}>
          <Link href="/products" className={styles.continueShoppingBtn}>
            Continue Shopping
          </Link>
          <Link href="/" className={styles.homeBtn}>
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
