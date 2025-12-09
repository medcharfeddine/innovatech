'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

interface Order {
  _id: string;
  user?: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  products: any[];
  customerInfo?: any;
}

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (!storedUser || !token) {
        router.push('/login');
        return;
      }

      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // Fetch user's orders
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const allOrders = await response.json();
          // API already filters by user role, so just use the returned orders
          setOrders(Array.isArray(allOrders) ? allOrders : []);
        } else if (response.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          console.error('Failed to fetch orders:', response.status, response.statusText);
          setOrders([]);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.spinner}>Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1>My Dashboard</h1>
            <p className={styles.subtitle}>Welcome back, {user?.name}</p>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* User Info Card */}
        <div className={styles.userCard}>
          <h2>Account Information</h2>
          <div className={styles.userInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{user?.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{user?.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Member Since:</span>
              <span className={styles.value}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className={styles.ordersSection}>
          <h2>My Orders ({orders.length})</h2>
          
          {orders.length === 0 ? (
            <div className={styles.emptyState}>
              <p>You haven't placed any orders yet.</p>
              <a href="/products" className={styles.shopButton}>
                Start Shopping
              </a>
            </div>
          ) : (
            <div className={styles.ordersTable}>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.toString().slice(-12)}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{order.products?.length || 0} item(s)</td>
                      <td>د.ت {(order.totalAmount || 0).toFixed(2)}</td>
                      <td>
                        <span className={`${styles.status} ${styles[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={styles.viewBtn}
                          onClick={() => handleViewOrder(order)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {showOrderDetail && selectedOrder && (
          <div className={styles.modalOverlay} onClick={() => setShowOrderDetail(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Order #({selectedOrder._id.toString().slice(-12)})</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowOrderDetail(false)}
                >
                  ✕
                </button>
              </div>

              <div className={styles.modalBody}>
                {/* Order Info */}
                <div className={styles.section}>
                  <h3>Order Information</h3>
                  <div className={styles.grid}>
                    <div>
                      <p><strong>Status:</strong> <span className={`${styles.statusBadge} ${styles[selectedOrder.status]}`}>{selectedOrder.status}</span></p>
                      <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p><strong>Total:</strong> <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937' }}>د.ت {(selectedOrder.totalAmount || 0).toFixed(2)}</span></p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className={styles.section}>
                  <h3>Items ({selectedOrder.products?.length || 0})</h3>
                  {selectedOrder.products && selectedOrder.products.length > 0 ? (
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
                        {selectedOrder.products.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td>{item.product?.name || 'Product'}</td>
                            <td>{item.quantity}</td>
                            <td>د.ت {(item.price || 0).toFixed(2)}</td>
                            <td>د.ت {((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No items in this order</p>
                  )}
                </div>

                {/* Close Button */}
                <button
                  className={styles.closeModalBtn}
                  onClick={() => setShowOrderDetail(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
