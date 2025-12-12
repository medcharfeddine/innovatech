'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './TopBar.module.css';

export default function TopBar() {
  const [branding, setBranding] = useState<any>({
    contactPhone: '',
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch('/api/branding');
        if (response.ok) {
          const data = await response.json();
          setBranding(data);
        }
      } catch (error) {
        console.error('Error fetching branding:', error);
      }
    };

    fetchBranding();
  }, []);

  return (
    <div className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <span className={styles.contact}>📞 {branding.contactPhone || ''}</span>
        <span className={styles.hours}>🕒 Mon-Sun: 08:30 - 16:00</span>
      </div>
      <div className={styles.topBarRight}>
        <Link href="/contact" className={styles.link}>Contact</Link>
        <span className={styles.divider}>|</span>
        <Link href="/login" className={styles.link}>Login</Link>
      </div>
    </div>
  );
}
