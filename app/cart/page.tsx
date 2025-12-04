'use client';

import { useCart } from '@/lib/context/CartContext';
import Link from 'next/link';
import styles from '@/styles/cart.module.css';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, updateQty, getTotalPrice } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (productId: string, newQty: number) => {
    if (newQty > 0) {
      updateQty(productId, newQty);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    setIsCheckingOut(true);
    // Redirect to checkout
    window.location.href = '/checkout';
  };

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h1>Your Cart is Empty</h1>
        <p>Start shopping to add items to your cart</p>
        <Link href="/products" className={styles.continueShoppingBtn}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <h1>Shopping Cart ({cart.length} items)</h1>
      
      <div className={styles.cartContainer}>
        <div className={styles.cartItems}>
          {cart.map((item) => (
            <div key={item._id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                {(item.imageUrl || item.image) && <img src={item.imageUrl || item.image || ''} alt={item.name} />}
              </div>
              
              <div className={styles.itemDetails}>
                <h3>{item.name}</h3>
                <p className={styles.price}>${item.price.toFixed(2)}</p>
              </div>

              <div className={styles.itemQty}>
                <button onClick={() => handleQuantityChange(item._id, item.quantity - 1)}>
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                />
                <button onClick={() => handleQuantityChange(item._id, item.quantity + 1)}>
                  +
                </button>
              </div>

              <div className={styles.itemTotal}>
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                className={styles.removeBtn}
                onClick={() => removeFromCart(item._id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className={styles.cartSummary}>
          <h2>Order Summary</h2>
          <div className={styles.summaryRow}>
            <span>Subtotal:</span>
            <span>${getTotalPrice().toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Tax:</span>
            <span>${(getTotalPrice() * 0.1).toFixed(2)}</span>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.summaryRow + ' ' + styles.total}>
            <span>Total:</span>
            <span>${(getTotalPrice() * 1.1).toFixed(2)}</span>
          </div>

          <button
            className={styles.checkoutBtn}
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
          </button>

          <Link href="/products" className={styles.continueShoppingLink}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
