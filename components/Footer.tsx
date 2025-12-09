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
              <li><Link href="/deals">Deals</Link></li>
              <li><Link href="/featured">Featured</Link></li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Support</h4>
            <ul className={styles.links}>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/shipping">Shipping Info</Link></li>
              <li><Link href="/returns">Returns</Link></li>
            </ul>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Company</h4>
            <ul className={styles.links}>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
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
