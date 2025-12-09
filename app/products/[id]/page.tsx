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
  images?: string[];
  image?: string;
  category: string;
  stock: number;
  rating?: number;
  reviews?: any[];
  discount?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount ? product.price * (1 - (product.discount || 0) / 100) : product.price;
  
  // Combine all images: primary image first, then additional images
  const allImages = [
    product.imageUrl || product.image,
    ...(product.images || [])
  ].filter(Boolean) as string[];
  
  const currentImage = allImages[currentImageIndex] || product.imageUrl || product.image;
  const totalImages = allImages.length;

  return (
    <div className={styles.productDetailPage}>
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/products">Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className={styles.container}>
        {/* Left: Image Gallery Section */}
        <div className={styles.gallerySection}>
          <div className={styles.mainImageContainer}>
            {currentImage && (
              <>
                <img 
                  src={currentImage}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className={styles.mainImage}
                />
                {hasDiscount && (
                  <div className={styles.discountBadge}>
                    -{product.discount}%
                  </div>
                )}
              </>
            )}
          </div>

          {allImages.length > 0 && (
            <>
              <div className={styles.imageNav}>
                <button 
                  className={styles.navButton}
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  disabled={currentImageIndex === 0}
                >
                  ← Previous
                </button>
                <span className={styles.imageCount}>{currentImageIndex + 1} / {totalImages}</span>
                <button 
                  className={styles.navButton}
                  onClick={() => setCurrentImageIndex(Math.min(totalImages - 1, currentImageIndex + 1))}
                  disabled={currentImageIndex === totalImages - 1}
                >
                  Next →
                </button>
              </div>

              {totalImages > 1 && (
                <div className={styles.imageThumbnails}>
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      className={`${styles.thumbnail} ${idx === currentImageIndex ? styles.active : ''}`}
                      onClick={() => setCurrentImageIndex(idx)}
                      title={`Image ${idx + 1}`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Product Info Section */}
        <div className={styles.infoSection}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>{product.name}</h1>
            <Link href={`/products?category=${product.category}`} className={styles.brand}>
              {product.category}
            </Link>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className={styles.ratingSection}>
              <span className={styles.stars}>⭐ {product.rating.toFixed(1)}</span>
              <span className={styles.reviewCount}>({product.reviews?.length || 0} reviews)</span>
              <button className={styles.rateBtn}>Rate this product</button>
            </div>
          )}

          {/* Price & Availability */}
          <div className={styles.priceAvailability}>
            <div className={styles.priceBlock}>
              {hasDiscount ? (
                <>
                  <span className={styles.originalPrice}>د.ت {product.price.toFixed(2)}</span>
                  <span className={styles.currentPrice}>د.ت {discountedPrice.toFixed(2)}</span>
                </>
              ) : (
                <span className={styles.currentPrice}>د.ت {product.price.toFixed(2)}</span>
              )}
            </div>

            <div className={styles.availabilityBlock}>
              <strong>Availability:</strong>
              <p className={isOutOfStock ? styles.outOfStock : styles.inStock}>
                {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
              </p>
            </div>
          </div>

          {/* Delivery Info */}
          <div className={styles.deliveryInfo}>
            <div className={styles.deliveryItem}>
              <span className={styles.icon}>🚚</span>
              <span>Free Delivery Available</span>
            </div>
            <div className={styles.deliveryItem}>
              <span className={styles.icon}>✓</span>
              <span>Secure Payment</span>
            </div>
          </div>

          {/* Description */}
          <p className={styles.description}>{product.description}</p>

          {/* Quantity & Actions */}
          <div className={styles.actionsSection}>
            <div className={styles.quantityControl}>
              <label>Quantity:</label>
              <div className={styles.quantityInput}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                  className={styles.quantityBtn}
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
                  className={styles.quantityValue}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={isOutOfStock}
                  className={styles.quantityBtn}
                >
                  +
                </button>
              </div>
            </div>

            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {/* Secondary Actions */}
          <div className={styles.secondaryActions}>
            <button className={styles.secondaryBtn}>Request Quote</button>
            <button className={styles.secondaryBtn}>Add to Wishlist</button>
            <button className={styles.secondaryBtn}>Compare</button>
          </div>

          {/* Trust Badges */}
          <div className={styles.trustBadges}>
            <div className={styles.badge}>
              <strong>✓</strong> Trusted Seller
            </div>
            <div className={styles.badge}>
              <strong>✓</strong> Authentic Products
            </div>
            <div className={styles.badge}>
              <strong>✓</strong> Money Back Guarantee
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specs Section */}
      <div className={styles.specsSection}>
        <h2>Technical Specifications</h2>
        <div className={styles.specsList}>
          <div className={styles.specItem}>
            <strong>Category:</strong> {product.category}
          </div>
          <div className={styles.specItem}>
            <strong>Stock:</strong> {product.stock} units
          </div>
          {product.discount && (
            <div className={styles.specItem}>
              <strong>Discount:</strong> {product.discount}% off
            </div>
          )}
        </div>
      </div>

      {/* Customer Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className={styles.reviewsSection}>
          <h2>Customer Reviews</h2>
          <div className={styles.reviewsList}>
            {product.reviews.map((review: any, idx: number) => (
              <div key={idx} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <h4>{review.author}</h4>
                  <span className={styles.reviewRating}>⭐ {review.rating}</span>
                </div>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
