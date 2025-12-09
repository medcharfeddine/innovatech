'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import styles from '@/styles/products.module.css';

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  categoryParent?: string;
  categoryChild?: string;
  rating?: number;
  discount?: number;
  featured?: boolean;
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [allCategories, setAllCategories] = useState<any[]>([]);

  // Fetch categories on mount - get all parent categories with subcategories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories', {
          next: { revalidate: 3600 }, // Cache for 1 hour on server
        });
        if (response.ok) {
          const data = await response.json();
          setAllCategories(Array.isArray(data) ? data : data.categories || []);
        }
      } catch (error) {
        // Silently fail - use default empty state
      }
    };

    fetchCategories();
  }, []);

  // Handle URL category parameter
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Fetch products based on selected category
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = '/api/products';
        
        if (selectedCategory) {
          url += `?category=${encodeURIComponent(selectedCategory)}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Handle both old format (array) and new format (with pagination)
          if (Array.isArray(data)) {
            setProducts(data);
          } else {
            setProducts(data.products || []);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Filter and sort products locally
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  }, [products, sortBy, searchTerm]);

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
            <label>
              <input
                type="radio"
                name="category"
                value=""
                checked={!selectedCategory}
                onChange={() => setSelectedCategory(null)}
                aria-label="Show all products"
              />
              All Products
            </label>
            {allCategories.map(cat => (
              <label key={cat.slug}>
                <input
                  type="radio"
                  name="category"
                  value={cat.slug}
                  checked={selectedCategory === cat.slug}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label={`Filter by ${cat.name} category`}
                />
                {cat.name}
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading products...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
