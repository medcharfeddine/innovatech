'use client';

import Link from 'next/link';
import { useCart } from '@/lib/context/CartContext';
import { useToast } from '@/lib/context/ToastContext';
import { useAuth } from '@/lib/context/AuthContext';
import styles from './ProductCard.module.css';
import { memo } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  imageUrl?: string;
  featured?: boolean;
  description?: string;
  rating?: number;
  discount?: number;
}

function ProductCard({ product, onRemoveFromFeatured }: { product: Product; onRemoveFromFeatured?: () => void }) {
  const { userRole } = useAuth();
  const { addToCart } = useCart();
  const { push } = useToast();

  const isAdmin = userRole === 'admin';

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect fill='%23f0f0f0' width='100%' height='100%'/><text x='50%' y='50%' fill='%23999999' font-size='18' font-family='Arial' text-anchor='middle' dominant-baseline='middle'>No image</text></svg>`;
  const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  const imageUrl = product.images?.[0] || product.imageUrl;
  const normalizedUrl = imageUrl ? imageUrl : placeholder;
  const discountedPrice = product.discount && product.discount > 0
    ? (product.price * (1 - product.discount / 100)).toFixed(0)
    : null;

  const handleAddToCart = () => {
    addToCart(product, 1);
    push(`${product.name} added to cart!`, { type: 'success' });
  };

  return (
    <article className={styles.card}>
      <Link href={`/products/${product._id}`} className={styles.media}>
        <div className={styles.backdrop} aria-hidden="true" />
        {product.discount ? product.discount > 0 && (
          <div className={styles.badge}>-{product.discount}%</div>
        ) : null}
        <img 
          src={normalizedUrl}
          alt={product.name} 
          className={styles.thumb}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = placeholder;
          }} 
        />
      </Link>

      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={`/products/${product._id}`} className={styles.titleLink}>
            {product.name}
          </Link>
        </h3>
        
        {product.rating && (
          <div className={styles.rating}>
            ⭐ {product.rating.toFixed(1)} <span className={styles.ratingText}>(Rated)</span>
          </div>
        )}

        <div className={styles.meta}>
          {discountedPrice ? (
            <div className={styles.priceContainer}>
              <span className={styles.originalPrice}>د.ت {product.price}</span>
              <span className={styles.price}>د.ت {discountedPrice}</span>
            </div>
          ) : (
            <span className={styles.price}>د.ت {product.price}</span>
          )}
        </div>

        <div className={styles.actions}>
          <Link href={`/products/${product._id}`} className={styles.btnPrimary}>
            View
          </Link>
          <button onClick={handleAddToCart} className={styles.btnSecondary} aria-label={`Add ${product.name} to cart`}>
            Add to cart
          </button>
          {isAdmin && product.featured && onRemoveFromFeatured && (
            <button
              onClick={onRemoveFromFeatured}
              className={`${styles.btnSecondary} ${styles.removeFeatured}`}
              title="Remove from featured products"
              aria-label="Remove from featured"
            >
              Remove Featured
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
