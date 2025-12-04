'use client';

import Link from 'next/link';
import styles from './TopBar.module.css';

export default function TopBar() {
  return (
    <div className={styles.topBar}>
      <div className={styles.topBarLeft}>
        <span className={styles.contact}>📞 (+216) 56 664 442</span>
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
