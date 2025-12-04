'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/context/CartContext';
import { useToast } from '@/lib/context/ToastContext';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from '@/styles/productDetail.module.css';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  image?: string;
  category: string;
  stock: number;
  rating?: number;
  reviews?: any[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { push } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        push('Failed to load product', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, push]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || product.image,
      quantity,
    });

    push(`${product.name} added to cart!`, { type: 'success' });
    setQuantity(1);
  };

  if (loading) {
    return <div className={styles.loading}>Loading product...</div>;
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1>Product not found</h1>
        <Link href="/products">Back to Products</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className={styles.productDetailPage}>
      <Link href="/products" className={styles.backLink}>
        ← Back to Products
      </Link>

      <div className={styles.container}>
        <div className={styles.imageSection}>
          {(product.imageUrl || product.image) && (
            <img src={product.imageUrl || product.image || ''} alt={product.name} />
          )}
        </div>

        <div className={styles.detailsSection}>
          <h1>{product.name}</h1>

          {product.rating && (
            <div className={styles.rating}>
              <span className={styles.stars}>⭐ {product.rating.toFixed(1)}</span>
              <span className={styles.reviewCount}>({product.reviews?.length || 0} reviews)</span>
            </div>
          )}

          <div className={styles.priceSection}>
            <h2 className={styles.price}>${product.price.toFixed(2)}</h2>
            <p className={isOutOfStock ? styles.outOfStock : styles.inStock}>
              {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
            </p>
          </div>

          <p className={styles.description}>{product.description}</p>

          <div className={styles.category}>
            <strong>Category:</strong> {product.category}
          </div>

          <div className={styles.actions}>
            <div className={styles.quantityControl}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isOutOfStock}
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isOutOfStock}
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={isOutOfStock}
              >
                +
              </button>
            </div>

            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {product.reviews && product.reviews.length > 0 && (
        <div className={styles.reviews}>
          <h2>Customer Reviews</h2>
          <div className={styles.reviewsList}>
            {product.reviews.map((review: any, idx: number) => (
              <div key={idx} className={styles.review}>
                <h4>{review.author}</h4>
                <p className={styles.reviewRating}>⭐ {review.rating}</p>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
