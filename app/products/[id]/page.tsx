'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCart } from '@/lib/context/CartContext';
import { useToast } from '@/lib/context/ToastContext';
import { useWishlist } from '@/lib/context/WishlistContext';
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
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isInWish, setIsInWish] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
          setIsInWish(isInWishlist(data._id));
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
  }, [productId, push, isInWishlist]);

  // Memoized calculations
  const isOutOfStock = useMemo(() => product?.stock === 0, [product?.stock]);
  const hasDiscount = useMemo(() => product?.discount && product.discount > 0, [product?.discount]);
  const discountedPrice = useMemo(
    () => hasDiscount ? product!.price * (1 - (product!.discount || 0) / 100) : product?.price,
    [hasDiscount, product?.price, product?.discount]
  );
  
  const allImages = useMemo(() => [
    product?.imageUrl || product?.image,
    ...(product?.images || [])
  ].filter(Boolean) as string[], [product?.imageUrl, product?.image, product?.images]);
  
  const currentImage = useMemo(() => allImages[currentImageIndex] || product?.imageUrl || product?.image, [allImages, currentImageIndex, product?.imageUrl, product?.image]);
  const totalImages = useMemo(() => allImages.length, [allImages]);

  // Memoized callbacks
  const handleAddToCart = useCallback(() => {
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
  }, [product, quantity, addToCart, push]);

  const handleToggleWishlist = useCallback(async () => {
    if (!product) return;

    try {
      if (isInWish) {
        await removeFromWishlist(product._id);
        setIsInWish(false);
        push(`${product.name} removed from wishlist`, { type: 'info' });
      } else {
        await addToWishlist({
          productId: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl || product.image,
        });
        setIsInWish(true);
        push(`${product.name} added to wishlist!`, { type: 'success' });
      }
    } catch (error) {
      push('Error updating wishlist. Please try again.', { type: 'error' });
    }
  }, [product, isInWish, addToWishlist, removeFromWishlist, push]);

  const handlePreviousImage = useCallback(() => {
    setCurrentImageIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex(prev => Math.min(totalImages - 1, prev + 1));
  }, [totalImages]);

  const handleSelectImage = useCallback((idx: number) => {
    setCurrentImageIndex(idx);
  }, []);

  const handleQuantityChange = useCallback((value: number) => {
    setQuantity(Math.max(1, Math.min(product?.stock || 0, value)));
  }, [product?.stock]);

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
                  loading="lazy"
                  decoding="async"
                />
                {hasDiscount ? (
                  <div className={styles.discountBadge}>
                    -{product.discount}%
                  </div>
                ) : null}
              </>
            )}
          </div>

          {allImages.length > 0 && (
            <>
              <div className={styles.imageNav}>
                <button 
                  className={styles.navButton}
                  onClick={handlePreviousImage}
                  disabled={currentImageIndex === 0}
                  aria-label="Previous image"
                >
                  ← Previous
                </button>
                <span className={styles.imageCount}>{currentImageIndex + 1} / {totalImages}</span>
                <button 
                  className={styles.navButton}
                  onClick={handleNextImage}
                  disabled={currentImageIndex === totalImages - 1}
                  aria-label="Next image"
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
                      onClick={() => handleSelectImage(idx)}
                      title={`Image ${idx + 1}`}
                      aria-label={`Select image ${idx + 1}`}
                      aria-current={idx === currentImageIndex}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} loading="lazy" />
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

          {/* Rating - Only render if product has a rating */}
          {product.rating ? (
            <div className={styles.ratingSection}>
              <span className={styles.stars}>⭐ {product.rating.toFixed(1)}</span>
              <span className={styles.reviewCount}>({product.reviews?.length || 0} reviews)</span>
              <button className={styles.rateBtn}>Rate this product</button>
            </div>
          ) : null}

          {/* Price & Availability */}
          <div className={styles.priceAvailability}>
            <div className={styles.priceBlock}>
              {hasDiscount ? (
                <>
                  <span className={styles.originalPrice}>د.ت {product.price.toFixed(2)}</span>
                  <span className={styles.currentPrice}>د.ت {discountedPrice?.toFixed(2)}</span>
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
              <label htmlFor="quantity">Quantity:</label>
              <div className={styles.quantityInput}>
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={isOutOfStock || quantity === 1}
                  className={styles.quantityBtn}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  disabled={isOutOfStock}
                  className={styles.quantityValue}
                  aria-label="Product quantity"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={isOutOfStock || quantity === product.stock}
                  className={styles.quantityBtn}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <button
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {/* Secondary Actions */}
          <div className={styles.secondaryActions}>
            <button className={styles.secondaryBtn}>Request Quote</button>
            <button 
              className={`${styles.secondaryBtn} ${isInWish ? styles.active : ''}`}
              onClick={handleToggleWishlist}
              aria-label={isInWish ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isInWish ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              {isInWish ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
            </button>
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
          {product.discount && product.discount > 0 ? (
            <div className={styles.specItem}>
              <strong>Discount:</strong> {product.discount}% off
            </div>
          ) : null}
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
