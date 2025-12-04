'use client';

import React, { useState, useEffect } from 'react';
import styles from './AdminHomeSettings.module.css';

interface HomeSettings {
  heroTitle: string;
  heroSubtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButtonText: string;
  showTrending: boolean;
  showNewArrivals: boolean;
  showTopRated: boolean;
  maxFeaturedProducts: number;
  maxTrendingProducts: number;
  maxNewProducts: number;
  maxTopRatedProducts: number;
}

interface AdminHomeSettingsProps {
  onSave?: () => void;
}

const AdminHomeSettings: React.FC<AdminHomeSettingsProps> = ({ onSave }) => {
  const [settings, setSettings] = useState<HomeSettings>({
    heroTitle: 'Welcome to Nova',
    heroSubtitle: 'Discover amazing products',
    ctaTitle: 'Exclusive Deals & Offers',
    ctaSubtitle: 'Subscribe to our newsletter and get up to 20% off your first order',
    ctaButtonText: 'Shop Now',
    showTrending: true,
    showNewArrivals: true,
    showTopRated: true,
    maxFeaturedProducts: 12,
    maxTrendingProducts: 8,
    maxNewProducts: 6,
    maxTopRatedProducts: 6,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/home-settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...settings, ...data });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/home-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setMessage('Settings saved successfully!');
        onSave?.();
      } else {
        setMessage('Error saving settings');
      }
    } catch (error) {
      setMessage('Error saving settings');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3>Homepage Settings</h3>

      <div className={styles.section}>
        <h4>Hero Section</h4>
        <div className={styles.formGroup}>
          <label>Hero Title</label>
          <input
            type="text"
            name="heroTitle"
            value={settings.heroTitle}
            onChange={handleChange}
            placeholder="Hero title"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Hero Subtitle</label>
          <textarea
            name="heroSubtitle"
            value={settings.heroSubtitle}
            onChange={handleChange}
            placeholder="Hero subtitle"
          />
        </div>
      </div>

      <div className={styles.section}>
        <h4>Product Sections Visibility</h4>
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              name="showTrending"
              checked={settings.showTrending}
              onChange={handleChange}
            />
            Show Trending Products
          </label>
        </div>
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              name="showNewArrivals"
              checked={settings.showNewArrivals}
              onChange={handleChange}
            />
            Show New Arrivals
          </label>
        </div>
        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              name="showTopRated"
              checked={settings.showTopRated}
              onChange={handleChange}
            />
            Show Top Rated Products
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h4>Product Section Limits</h4>
        <div className={styles.formGroup}>
          <label>Featured Products Limit</label>
          <input
            type="number"
            name="maxFeaturedProducts"
            value={settings.maxFeaturedProducts}
            onChange={handleChange}
            min="1"
            max="30"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Trending Products Limit</label>
          <input
            type="number"
            name="maxTrendingProducts"
            value={settings.maxTrendingProducts}
            onChange={handleChange}
            min="1"
            max="30"
          />
        </div>
        <div className={styles.formGroup}>
          <label>New Arrivals Limit</label>
          <input
            type="number"
            name="maxNewProducts"
            value={settings.maxNewProducts}
            onChange={handleChange}
            min="1"
            max="30"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Top Rated Limit</label>
          <input
            type="number"
            name="maxTopRatedProducts"
            value={settings.maxTopRatedProducts}
            onChange={handleChange}
            min="1"
            max="30"
          />
        </div>
      </div>

      <div className={styles.section}>
        <h4>CTA Section</h4>
        <div className={styles.formGroup}>
          <label>CTA Title</label>
          <input
            type="text"
            name="ctaTitle"
            value={settings.ctaTitle}
            onChange={handleChange}
            placeholder="CTA title"
          />
        </div>
        <div className={styles.formGroup}>
          <label>CTA Subtitle</label>
          <textarea
            name="ctaSubtitle"
            value={settings.ctaSubtitle}
            onChange={handleChange}
            placeholder="CTA subtitle"
          />
        </div>
        <div className={styles.formGroup}>
          <label>CTA Button Text</label>
          <input
            type="text"
            name="ctaButtonText"
            value={settings.ctaButtonText}
            onChange={handleChange}
            placeholder="CTA button text"
          />
        </div>
      </div>

      {message && <div className={styles.message}>{message}</div>}

      <button
        className={styles.saveButton}
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

export default AdminHomeSettings;
