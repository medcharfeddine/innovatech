'use client';

import Link from 'next/link';
import styles from '@/styles/home.module.css';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export default function FeaturedCategory({ category }: { category: Category }) {
  return (
    <Link href={`/products?category=${category.slug}`} className={styles.categoryCardItem}>
      <div className={styles.categoryCardImage}>
        {category.image ? (
          <img src={category.image} alt={category.name} />
        ) : (
          <div className={styles.categoryCardPlaceholder}>📦</div>
        )}
      </div>
      <h3 className={styles.categoryCardName}>{category.name}</h3>
    </Link>
  );
}
