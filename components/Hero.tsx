'use client';

import Link from 'next/link';
import styles from '@/styles/home.module.css';

interface HeroBannerProps {
  banner: any;
}

export default function Hero({ banner }: HeroBannerProps) {
  const defaultBanner = {
    imageUrl: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22400%22%3E%3Crect fill=%22%232a317f%22 width=%221200%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 font-weight=%22bold%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EWelcome to Nova%3C/text%3E%3C/svg%3E',
    title: 'Welcome to Nova',
    ctaText: 'Shop Now',
    ctaLink: '/products'
  };

  const displayBanner = banner || defaultBanner;
  const { imageUrl, title, ctaText, ctaLink } = displayBanner;

  return (
    <section className={styles.hero} aria-label="Main banner">
      <div 
        className={styles.heroBackgroundImage} 
        style={{ backgroundImage: `url('${imageUrl}')` }}
      />
      {(title || ctaText) && (
        <div className={styles.heroContent}>
          {title && <h1 className={styles.heroTitle}>{title}</h1>}
          {ctaText && ctaLink && (
            <Link href={ctaLink} className={styles.heroButton}>
              {ctaText}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
