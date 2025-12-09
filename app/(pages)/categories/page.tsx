'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/categories.module.css';

interface Category {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  parentCategory?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        // Filter to only parent categories (no parentCategory field)
        const parentCategories = data.filter((cat: Category) => !cat.parentCategory);
        setCategories(parentCategories);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Shop by Category</h1>
        <p>Explore our wide range of products organized by category</p>
      </div>

      {categories.length === 0 ? (
        <div className={styles.empty}>
          <p>No categories available at this time.</p>
          <Link href="/products" className={styles.browseLink}>
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/products?category=${category._id}`}
              className={styles.categoryCard}
            >
              {category.image && (
                <div className={styles.imageContainer}>
                  <img
                    src={category.image}
                    alt={category.name}
                    className={styles.image}
                  />
                </div>
              )}
              <div className={styles.content}>
                <h2 className={styles.name}>{category.name}</h2>
                {category.description && (
                  <p className={styles.description}>{category.description}</p>
                )}
                <span className={styles.viewMore}>View Products →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
