'use client';

import React, { useState, useEffect } from 'react';
import styles from './AdminProductFeaturing.module.css';

interface Product {
  _id: string;
  name: string;
  price: number;
  featured: boolean;
  rating: number;
  sales: number;
  createdAt: string;
}

const AdminProductFeaturing: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('featured');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterType]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products?adminView=true', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType === 'featured') {
      filtered = filtered.filter(p => p.featured);
    } else if (filterType === 'topRated') {
      filtered = filtered.filter(p => p.rating >= 4);
    } else if (filterType === 'trending') {
      filtered = filtered.sort((a, b) => b.sales - a.sales);
    } else if (filterType === 'new') {
      filtered = filtered.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    setFilteredProducts(filtered.slice(0, 20));
  };

  const toggleFeatured = async (productId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured: !currentStatus }),
      });

      if (response.ok) {
        setProducts(prev =>
          prev.map(p =>
            p._id === productId ? { ...p, featured: !currentStatus } : p
          )
        );
        setMessage(
          `Product ${!currentStatus ? 'featured' : 'unfeatured'} successfully!`
        );
      } else {
        setMessage('Error updating product');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error updating product');
    }
  };

  return (
    <div className={styles.container}>
      <h3>Product Featuring</h3>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Products</option>
          <option value="featured">Featured</option>
          <option value="trending">Trending (by sales)</option>
          <option value="topRated">Top Rated (4+ stars)</option>
          <option value="new">New Arrivals</option>
        </select>
      </div>

      {message && (
        <div className={styles.message}>
          {message}
          <button
            onClick={() => setMessage('')}
            className={styles.messageClose}
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading products...</div>
      ) : (
        <div className={styles.productsTable}>
          <div className={styles.tableHeader}>
            <div className={styles.col1}>Product Name</div>
            <div className={styles.col2}>Price</div>
            <div className={styles.col3}>Rating</div>
            <div className={styles.col4}>Sales</div>
            <div className={styles.col5}>Featured</div>
          </div>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div key={product._id} className={styles.tableRow}>
                <div className={styles.col1}>{product.name}</div>
                <div className={styles.col2}>د.ت {product.price.toFixed(2)}</div>
                <div className={styles.col3}>
                  <span className={styles.rating}>⭐ {product.rating ? product.rating.toFixed(1) : '0.0'}</span>
                </div>
                <div className={styles.col4}>{product.sales || 0} sales</div>
                <div className={styles.col5}>
                  <button
                    className={`${styles.toggleBtn} ${
                      product.featured ? styles.featured : styles.notFeatured
                    }`}
                    onClick={() => toggleFeatured(product._id, product.featured)}
                  >
                    {product.featured ? '✓ Featured' : 'Not Featured'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.empty}>No products found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProductFeaturing;
