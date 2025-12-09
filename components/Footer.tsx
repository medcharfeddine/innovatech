'use client';

import Link from 'next/link';
import styles from './Footer.module.css';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [branding, setBranding] = useState<any>({ logoUrl: '', siteName: 'Nova' });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch('/api/branding', { next: { revalidate: 3600 } });
        if (response.ok) {
          const data = await response.json();
          setBranding(data);
        }
      } catch (error) {
        // Silently fail
      }
    };

    fetchBranding();
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.logoSection}>
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className={styles.logoImage} />
              ) : (
                <h3 className={styles.title}>{branding.siteName || 'Nova'}</h3>
              )}
            </div>
            <p className={styles.description}>Premium e-commerce platform for all your needs</p>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Shop</h4>
            <ul className={styles.links}>
              <li><Link href="/products">Products</Link></li>
              <li><Link href="/categories">Categories</Link></li>
              <li><Link href="/cart">Shopping Cart</Link></li>
              <li><Link href="/login">Login</Link></li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Customer</h4>
            <ul className={styles.links}>
              <li><Link href="/register">Create Account</Link></li>
              <li><Link href="/dashboard">My Dashboard</Link></li>
              <li><a href="mailto:support@nova.com">Email Support</a></li>
              <li><a href="tel:+1234567890">Call Us</a></li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Company</h4>
            <ul className={styles.links}>
              <li><a href="#about">About Nova</a></li>
              <li><a href="#mission">Our Mission</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; 2025 {branding.siteName || 'Nova'} E-commerce. All rights reserved.</p>
          <div className={styles.social}>
            <a href="#" title="Facebook">f</a>
            <a href="#" title="Twitter">𝕏</a>
            <a href="#" title="Instagram">📷</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
