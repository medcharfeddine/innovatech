'use client';

import { useState, useEffect, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import styles from '@/styles/products.module.css';

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  category?: string;
  categoryParent?: string;
  categoryChild?: string;
  rating?: number;
  discount?: number;
  featured?: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?adminView=false');
        if (response.ok) {
          const data = await response.json();
          setProducts(Array.isArray(data) ? data : data.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.categoryParent) cats.add(p.categoryParent);
    });
    return ['all', ...Array.from(cats).sort()];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryParent === selectedCategory);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      // Keep original order (assumes API returns newest first)
      filtered = [...filtered];
    }

    return filtered;
  }, [products, selectedCategory, sortBy, searchTerm]);

  if (loading) {
    return <div className={styles.loading}>Loading products...</div>;
  }

  return (
    <div className={styles.productsPage}>
      <h1>Our Products</h1>

      <div className={styles.controlsContainer}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              aria-label="Search products"
            />
          </div>

          <h3>Category</h3>
          <div className={styles.categoryFilter}>
            {categories.map(cat => (
              <label key={cat}>
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={selectedCategory === cat}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label={`Filter by ${cat} category`}
                />
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                <span className={styles.count}>
                  ({products.filter(p => cat === 'all' || p.categoryParent === cat).length})
                </span>
              </label>
            ))}
          </div>

          <h3>Sort By</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
            aria-label="Sort products by"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div className={styles.productsGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))
          ) : (
            <div className={styles.noProducts}>
              <p>No products found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={styles.resetButton}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
