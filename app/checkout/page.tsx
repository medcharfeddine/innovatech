'use client';

import { useCart } from '@/lib/context/CartContext';
import { useToast } from '@/lib/context/ToastContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '@/styles/checkout.module.css';

export default function CheckoutPage() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { push } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      push('Your cart is empty', { type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const totalAmount = getTotalPrice() * 1.1; // including tax
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item._id,
            quantity: item.quantity,
            price: item.price,
          })),
          customerInfo: formData,
          totalAmount: totalAmount,
          paymentMethod: 'COD',
        }),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        push('Order placed successfully!', { type: 'success' });
        router.push(`/order-confirmation/${order._id}`);
      } else {
        const error = await response.json();
        push(error.message || 'Failed to place order', { type: 'error' });
      }
    } catch (error: any) {
      push(error.message || 'Error placing order', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCheckout}>
        <h1>Checkout</h1>
        <p>Your cart is empty</p>
        <Link href="/products">Continue Shopping</Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className={styles.checkoutPage}>
      <h1>Checkout</h1>
      
      <div className={styles.checkoutContainer}>
        <form onSubmit={handleSubmit} className={styles.checkoutForm}>
          <section className={styles.section}>
            <h2>Shipping Information</h2>
            <div className={styles.formRow}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Street Address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
            <div className={styles.formRow}>
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="postalCode"
                placeholder="Postal Code"
                value={formData.postalCode}
                onChange={handleInputChange}
                required
              />
            </div>
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleInputChange}
              required
            />
          </section>

          <section className={styles.section}>
            <h2>Payment Information</h2>
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={formData.cardNumber}
              onChange={handleInputChange}
              maxLength={16}
              required
            />
            <div className={styles.formRow}>
              <input
                type="text"
                name="cardExpiry"
                placeholder="MM/YY"
                value={formData.cardExpiry}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="cardCVC"
                placeholder="CVC"
                value={formData.cardCVC}
                onChange={handleInputChange}
                maxLength={4}
                required
              />
            </div>
          </section>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </form>

        <div className={styles.orderSummary}>
          <h2>Order Summary</h2>
          <div className={styles.items}>
            {cart.map(item => (
              <div key={item._id} className={styles.item}>
                <span>{item.name} x {item.quantity}</span>
                <span>د.ت {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className={styles.divider}></div>
          <div className={styles.summary}>
            <div className={styles.row}>
              <span>Subtotal:</span>
              <span>د.ت {subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.row}>
              <span>Tax (10%):</span>
              <span>د.ت {tax.toFixed(2)}</span>
            </div>
            <div className={styles.row + ' ' + styles.total}>
              <span>Total:</span>
              <span>د.ت {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
