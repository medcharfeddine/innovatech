'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import styles from './MainHeader.module.css';

interface Branding {
  siteName: string;
  storeName?: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor?: string;
  accentColor?: string;
}

export default function MainHeader() {
  const [branding, setBranding] = useState<Branding>({ 
    siteName: 'Nova', 
    logoUrl: '', 
    faviconUrl: '' 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, userRole, logout } = useAuth();
  const { cart } = useCart();

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        // Cache branding for 1 hour - it changes infrequently
        const response = await fetch('/api/branding', {
          next: { revalidate: 3600 },
        });
        
        if (!response.ok) {
          return;
        }
        
        const data = await response.json();
        if (data && typeof data === 'object') {
          setBranding({
            siteName: data.siteName || 'Nova',
            storeName: data.storeName || '',
            logoUrl: data.logoUrl || '',
            faviconUrl: data.faviconUrl || '',
            primaryColor: data.primaryColor,
            accentColor: data.accentColor,
          });
          if (data.siteName) {
            document.title = data.siteName;
          }
          
          // Set favicon if available
          if (data.faviconUrl) {
            let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
            if (!favicon) {
              favicon = document.createElement('link');
              favicon.rel = 'icon';
              favicon.type = 'image/x-icon';
              document.head.appendChild(favicon);
            }
            // Add timestamp to bypass cache when favicon changes
            favicon.href = `${data.faviconUrl}?t=${Date.now()}`;
          }
        }
      } catch (error) {
        // Silently fail - keep default branding
      }
    };

    fetchBranding();
    
    // Poll for branding changes every 5 minutes for admin users
    const interval = setInterval(fetchBranding, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const isAdmin = userRole === 'admin';
  const cartCount = cart.length;

  return (
    <div className={styles.mainHeader}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <Link href="/" aria-label={branding.siteName || branding.storeName || 'Home'} className={styles.logoLink}>
            {branding.logoUrl && branding.logoUrl.trim() ? (
              <img 
                src={branding.logoUrl}
                alt={branding.siteName || branding.storeName || 'Logo'}
                className={styles.logoImage}
                loading="eager"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}
          </Link>
        </div>

        {/* Search Bar */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn} aria-label="Search">
            🔍
          </button>
        </form>

        {/* Right Actions */}
        <div className={styles.actions}>
          {/* Admin Link */}
          {isAdmin && (
            <Link href="/admin" className={styles.adminLink} title="Admin Panel">
              👨‍💼 Admin
            </Link>
          )}

          {/* Cart */}
          <Link href="/cart" className={styles.cartLink}>
            <span className={styles.cartIcon}>🛒</span>
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>

          {/* User Menu */}
          <div className={styles.userMenu}>
            <button 
              className={styles.userBtn}
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
            >
              👤
            </button>
            
            {showUserMenu && (
              <div className={styles.userDropdown}>
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" className={styles.dropdownItem}>
                      My Dashboard
                    </Link>
                    <Link href="/cart" className={styles.dropdownItem}>
                      My Cart
                    </Link>
                    <button 
                      className={styles.logoutBtn}
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={styles.dropdownItem}>
                      Login
                    </Link>
                    <Link href="/register" className={styles.dropdownItem}>
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
