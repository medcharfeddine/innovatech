'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './CategoriesMenu.module.css';

interface Category {
  _id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  subcategories?: Category[];
  parent?: string | null;
}

export default function CategoriesMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          // Data is already an array of parent categories with subcategories
          const parentCategories = Array.isArray(data) ? data : (data.data || []);
          setCategories(parentCategories.slice(0, 8));
        } else {
          console.error('CategoriesMenu - Failed to fetch categories:', response.status);
        }
      } catch (error) {
        console.error('CategoriesMenu - Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleMobileClose = () => {
    setShowMobileMenu(false);
    setExpandedCategory(null);
  };

  return (
    <>
      {/* Desktop Category Navigation */}
      <nav className={styles.categoryNav}>
        <div className={styles.categoryContainer}>
          <ul className={styles.categoryList}>
            {categories.map(category => (
              <li
                key={category._id}
                className={styles.categoryListItem}
                onMouseEnter={() => setHoveredCategory(category._id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link href={`/products?category=${category.slug}`} className={styles.categoryItem}>
                  {category.iconUrl && (
                    <img
                      src={category.iconUrl}
                      alt={`${category.name} icon`}
                      className={styles.categoryIcon}
                      loading="lazy"
                    />
                  )}
                  <span>{category.name}</span>
                  {category.subcategories?.length ? (
                    <span className={styles.chevron}>▼</span>
                  ) : null}
                </Link>

                {/* Submenu for subcategories */}
                {category.subcategories?.length ? (
                  hoveredCategory === category._id && (
                    <div className={styles.subcategoryWrapper}>
                      <ul className={styles.subcategoryList}>
                        {category.subcategories.map(subcat => (
                          <li key={subcat._id} className={styles.subcategoryListItem}>
                            <Link
                              href={`/products?category=${subcat.slug}`}
                              className={styles.subcategoryItem}
                            >
                              {subcat.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile: Hamburger Menu Button */}
      <nav className={styles.categoryNavMobile}>
        <div className={styles.mobileMenuHeader}>
          <button
            className={styles.bottomSheetToggle}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menu categories"
            title="Categories"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Bottom Sheet Modal for Mobile */}
      {showMobileMenu && (
        <>
          <div
            className={styles.bottomSheetBackdrop}
            onClick={handleMobileClose}
          />
          <div className={styles.bottomSheet}>
            <div className={styles.bottomSheetHeader}>
              <h3 className={styles.bottomSheetTitle}>Categories</h3>
              <button
                className={styles.bottomSheetClose}
                onClick={handleMobileClose}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className={styles.bottomSheetContent}>
              {categories.map(category => (
                <div key={category._id} className={styles.bottomSheetCategory}>
                  <button
                    className={styles.bottomSheetCategoryLink}
                    onClick={() => setExpandedCategory(
                      expandedCategory === category._id ? null : category._id
                    )}
                  >
                    {category.iconUrl && (
                      <img
                        src={category.iconUrl}
                        alt={`${category.name} icon`}
                        className={styles.categoryIconMobile}
                      />
                    )}
                    <span>{category.name}</span>
                    {category.subcategories?.length ? (
                      <span className={`${styles.expandIcon} ${expandedCategory === category._id ? styles.expanded : ''}`}>
                        ›
                      </span>
                    ) : null}
                  </button>

                  {/* Expandable Subcategories */}
                  {category.subcategories?.length && expandedCategory === category._id && (
                    <div className={styles.bottomSheetSubcategories}>
                      {category.subcategories.map(subcat => (
                        <Link
                          key={subcat._id}
                          href={`/products?category=${subcat.slug}`}
                          className={styles.bottomSheetSubcategoryLink}
                          onClick={handleMobileClose}
                        >
                          {subcat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
