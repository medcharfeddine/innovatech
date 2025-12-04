'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [branding, setBranding] = useState({ siteName: 'Nova', logoUrl: '', faviconUrl: '' });
  const [user, setUser] = useState<any>(null);

  // Load user from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }, []);

  // Fetch branding settings
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch('/api/branding');
        if (response.ok) {
          const data = await response.json();
          setBranding(data);
          document.title = data.siteName || 'Nova';
        }
      } catch (error) {
        console.error('Error fetching branding:', error);
      }
    };

    fetchBranding();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          // Data is already an array of parent categories with subcategories
          const parentCategories = Array.isArray(data) ? data : (data.data || []);
          console.log('Categories fetched successfully:', {
            count: parentCategories.length,
            categories: parentCategories.map((c: any) => ({ name: c.name, id: c._id }))
          });
          setCategories(parentCategories.slice(0, 8));
        } else {
          console.error('Failed to fetch categories:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <span>📞 (+216) 56 664 442</span>
          <span>🕒 Mon-Sun: 08:30 - 16:00</span>
        </div>
        <div className={styles.topBarRight}>
          <Link href="/contact">Contact</Link>
          {user ? (
            <Link href="/dashboard">My Account</Link>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </div>
      </div>

      {/* Main Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          {/* Logo */}
          <div className={styles.logo}>
            <Link href="/" aria-label="Nova Home">
              {branding.logoUrl ? (
                <img 
                  src={branding.logoUrl} 
                  alt={branding.siteName}
                  className={styles.logoImage}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className={styles.brand}>{branding.siteName}</span>
              )}
            </Link>
          </div>

          {/* Search Bar */}
          <div className={styles.search}>
            <div className={styles.searchWrapper}>
              <input
                type="search"
                placeholder="Search products..."
                className={styles.searchInput}
              />
              <button className={styles.searchButton} aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Navigation */}
          <div className={styles.rightNav}>
            {isAdmin && (
              <Link href="/admin" className={styles.adminButton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
              </Link>
            )}

            <Link href="/cart" className={styles.cartButton} aria-label="Shopping Cart">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className={styles.cartBadge}>0</span>
            </Link>

            {user ? (
              <>
                <Link href="/dashboard" className={styles.navButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Account
                </Link>
                <button className={styles.navButton} aria-label="Logout" onClick={handleLogout}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <div className={styles.authButtons}>
                <Link href="/login" className={styles.navButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
                <Link href="/register" className={`${styles.navButton} ${styles.registerButton}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className={styles.mobileToggle}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Categories Menu with Dropdowns */}
      <nav className={styles.categoryNav}>
        <div className={styles.categoryContainer}>
          <div className={styles.categoryList}>
            {categories && categories.length > 0 ? (
              <>
                {categories.map(category => (
                  <div key={category._id} className={styles.categoryItemWrapper}>
                    <Link
                      href={`/products?category=${category.slug}`}
                      className={styles.categoryItem}
                    >
                      {category.image && (
                        <img 
                          src={category.image}
                          alt={category.name}
                          className={styles.categoryIcon}
                        />
                      )}
                      <span>{category.name}</span>
                    </Link>
                    
                    {/* Subcategories Dropdown */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className={styles.categoryDropdown}>
                        {category.subcategories.map((subcategory: any) => (
                          <Link
                            key={subcategory._id}
                            href={`/products?category=${subcategory.slug}`}
                            className={styles.dropdownLink}
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
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div style={{ padding: '0.75rem 1rem', color: '#999', fontSize: '0.9rem', width: '100%' }}>
                {categories.length === 0 ? 'Loading categories...' : 'No categories found'}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
