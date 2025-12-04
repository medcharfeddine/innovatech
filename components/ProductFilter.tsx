'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/productFilter.module.css';

interface FilterProps {
  onFilterChange: (filters: any) => void;
}

export default function ProductFilter({ onFilterChange }: FilterProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    priceMin: 0,
    priceMax: 100000,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories/all');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    const fetchBrands = async () => {
      try {
        const res = await fetch('/api/products?adminView=true');
        if (res.ok) {
          const data = await res.json();
          const uniqueBrands = Array.from(
            new Set(data.map((p: any) => p.brand).filter((b: any) => typeof b === 'string'))
          );
          setBrands(uniqueBrands as string[]);
        }
      } catch (err) {
        console.error('Error fetching brands:', err);
      }
    };

    fetchCategories();
    fetchBrands();
  }, []);

  const handleChange = (name: string, value: any) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      category: '',
      brand: '',
      priceMin: 0,
      priceMax: 100000,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className={styles.filter}>
      <h3 className={styles.title}>Filters</h3>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Category</label>
        <select 
          value={filters.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className={styles.select}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Brand</label>
        <select 
          value={filters.brand}
          onChange={(e) => handleChange('brand', e.target.value)}
          className={styles.select}
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Price Range</label>
        <div className={styles.priceInputs}>
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => handleChange('priceMin', parseInt(e.target.value) || 0)}
            className={styles.input}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => handleChange('priceMax', parseInt(e.target.value) || 100000)}
            className={styles.input}
          />
        </div>
      </div>

      <button 
        onClick={handleReset}
        className={styles.resetBtn}
      >
        Reset Filters
      </button>
    </div>
  );
}
