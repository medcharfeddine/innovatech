'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './CategoryBanner.module.css';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parent?: string;
  subcategories?: Category[];
}

const CategoryBanner = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          // Get only parent categories (no parent field set)
          const parentCategories = (data.data || []).filter((cat: Category) => !cat.parent);
          setCategories(parentCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className={styles.banner} />;
  }

  return (
    <div className={styles.banner}>
      <div className={styles.container}>
        <h2 className={styles.title}>Shop by Category</h2>
        <div className={styles.categoryGrid}>
          {categories.map(category => (
            <div
              key={category._id}
              className={styles.categoryCard}
              onMouseEnter={() => setExpandedCategory(category._id)}
              onMouseLeave={() => setExpandedCategory(null)}
            >
              {/* Parent Category */}
              <Link
                href={`/products?category=${category.slug}`}
                className={styles.categoryLink}
              >
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className={styles.categoryImage}
                  />
                )}
                <span className={styles.categoryName}>{category.name}</span>
              </Link>

              {/* Dropdown for Subcategories */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div
                  className={`${styles.dropdown} ${
                    expandedCategory === category._id ? styles.expanded : ''
                  }`}
                >
                  <div className={styles.dropdownContent}>
                    {category.subcategories.map(subcategory => (
                      <Link
                        key={subcategory._id}
                        href={`/products?category=${subcategory.slug}`}
                        className={styles.dropdownItem}
                      >
                        {subcategory.image && (
                          <img
                            src={subcategory.image}
                            alt={subcategory.name}
                            className={styles.dropdownIcon}
                          />
                        )}
                        <span>{subcategory.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Indicator for categories with subcategories */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className={styles.indicator}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBanner;
