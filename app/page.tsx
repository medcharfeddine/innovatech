import Link from 'next/link';
import styles from '@/styles/home.module.css';
import ProductCard from '@/components/ProductCard';
import Hero from '@/components/Hero';
import FeaturedCategory from '@/components/FeaturedCategory';
import { connectDB } from '@/lib/db/mongodb';
import Product from '@/lib/models/Product';
import Category from '@/lib/models/Category';
import Banner from '@/lib/models/Banner';

async function getHomeData() {
  try {
    await connectDB();

    // Fetch optimized data with selective fields
    const [
      featuredProducts,
      trendingProducts,
      newProducts,
      categories,
      topRatedProducts,
      heroBanner,
      allBanners,
      flashDealProducts,
    ] = await Promise.all([
      Product.find({ featured: true })
        .select('_id name price imageUrl featured slug rating discount')
        .limit(12)
        .lean()
        .exec(),
      Product.find()
        .select('_id name price imageUrl slug rating sales discount')
        .sort({ sales: -1 })
        .limit(8)
        .lean()
        .exec(),
      Product.find()
        .select('_id name price imageUrl slug discount')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean()
        .exec(),
      Category.find({ isActive: true })
        .select('_id name slug image isActive')
        .limit(10)
        .lean()
        .exec(),
      Product.find({ rating: { $gte: 4 } })
        .select('_id name price imageUrl slug rating discount')
        .limit(6)
        .lean()
        .exec(),
      Banner.findOne({ isActive: true, location: 'hero' })
        .lean()
        .exec(),
      Banner.find({ isActive: true })
        .sort({ location: 1, order: 1 })
        .lean()
        .exec(),
      Product.find({ discount: { $gte: 20 } })
        .select('_id name price imageUrl slug discount rating')
        .sort({ discount: -1 })
        .limit(8)
        .lean()
        .exec(),
    ]);

    return {
      featuredProducts: JSON.parse(JSON.stringify(featuredProducts || [])),
      trendingProducts: JSON.parse(JSON.stringify(trendingProducts || [])),
      newProducts: JSON.parse(JSON.stringify(newProducts || [])),
      categories: JSON.parse(JSON.stringify(categories || [])),
      topRatedProducts: JSON.parse(JSON.stringify(topRatedProducts || [])),
      heroBanner: heroBanner ? JSON.parse(JSON.stringify(heroBanner)) : null,
      allBanners: JSON.parse(JSON.stringify(allBanners || [])),
      flashDealProducts: JSON.parse(JSON.stringify(flashDealProducts || [])),
    };
  } catch (error) {
    console.error('Error fetching home data:', error);
    return {
      featuredProducts: [],
      trendingProducts: [],
      newProducts: [],
      categories: [],
      topRatedProducts: [],
      heroBanner: null,
      allBanners: [],
      flashDealProducts: [],
    };
  }
}

export const revalidate = 10;  // ISR: Revalidate cached pages every 10 seconds

export default async function Home() {
  const {
    featuredProducts,
    trendingProducts,
    newProducts,
    categories,
    topRatedProducts,
    heroBanner,
    allBanners,
    flashDealProducts,
  } = await getHomeData();

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <Hero banner={heroBanner} />

      {/* Benefits Strip - Industry Standard */}
      <section className={styles.benefitsStrip}>
        <div className={styles.benefit}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.benefitIcon} viewBox="0 0 24 24">
            <path d="M3.5 18.5L6 22l2.5-3.5L6 15l-2.5 3.5zM20 8h-3V4H3c-1.1 0-2 .9-2 2v3h2V6h14v2h-4l2 2h3l-3 3 3 3h-3l-2 2h4v2H3v-2.8h-2V20c0 1.1.9 2 2 2h14v-4h3l-3-3 3-3h-3l2-2h4V8z" fill="currentColor" />
          </svg>
          <span>Free Shipping</span>
          <small>On orders over $99</small>
        </div>
        <div className={styles.benefit}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.benefitIcon} viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h12v2H6zm0-3h12v2H6zm0 6h12v2H6z" fill="currentColor" />
          </svg>
          <span>Official Guarantee</span>
          <small>100% Authentic Products</small>
        </div>
        <div className={styles.benefit}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.benefitIcon} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.89-8.9c-1.78-.59-2.64-.96-2.64-1.9 0-1.02 1.11-1.39 1.81-1.39 1.31 0 1.79.99 1.9 1.34l1.58-.67c-.15-.44-.82-1.91-2.66-2.23V5h-1.75v1.26c-2.15.38-2.53 2.08-2.53 2.85 0 2.28 2.02 2.92 3.64 3.52 1.53.56 2.28 1.07 2.28 2.03 0 .81-.57 1.54-2.03 1.54-.98 0-2.03-.49-2.42-1.81L8.3 14.9c.14.51.99 2.33 3.45 2.65V19h1.75v-1.45c1.86-.38 2.77-1.69 2.77-2.89 0-2.29-1.98-2.97-3.38-3.46z" fill="currentColor" />
          </svg>
          <span>Secure Payment</span>
          <small>Multiple payment options</small>
        </div>
        <div className={styles.benefit}>
          <svg xmlns="http://www.w3.org/2000/svg" className={styles.benefitIcon} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92c-.5.51-.86.97-1.04 1.69-.08.32-.13.68-.13 1.14h-2v-.5c0-.46.08-.9.22-1.31.2-.58.53-1.1.95-1.52l1.24-1.26c.46-.44.68-1.1.55-1.8-.13-.72-.69-1.33-1.39-1.53-1.11-.31-2.14.32-2.47 1.27-.12.37-.43.65-.82.65h-.3C8.4 9 8 8.44 8.16 7.88c.43-1.47 1.68-2.59 3.23-2.83.31-.05.62-.07.93-.07 1.07 0 2.07.34 2.83.91.9.67 1.49 1.71 1.49 2.88C16.64 9.92 15.47 10.97 15.07 11.25z" fill="currentColor" />
          </svg>
          <span>24/7 Support</span>
          <small>Dedicated customer support</small>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🌟 Featured Products</h2>
          <Link href="/products?featured=true" className={styles.seeAll}>View All</Link>
        </div>
        {featuredProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {featuredProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>No featured products available</div>
        )}
      </section>

      {/* Featured Banner */}
      {allBanners.filter((b: any) => b.location === 'featured').length > 0 && (
        <section className={styles.bannerSection}>
          {(() => {
            const banner = allBanners.find((b: any) => b.location === 'featured');
            return banner ? (
              <div className={styles.bannerContainer}>
                {banner.imageUrl && (
                  <img src={banner.imageUrl} alt={banner.title} className={styles.bannerImage} />
                )}
                <div className={styles.bannerContent}>
                  <h3>{banner.title}</h3>
                  {banner.description && <p>{banner.description}</p>}
                  {banner.ctaText && banner.ctaLink && (
                    <Link href={banner.ctaLink} className={styles.bannerCTA}>
                      {banner.ctaText}
                    </Link>
                  )}
                </div>
              </div>
            ) : null;
          })()}
        </section>
      )}

      {/* Flash Deals / Limited Time Offers Section */}
      {flashDealProducts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>⚡ Flash Deals - Limited Time Only!</h2>
            <Link href="/products?discount=20" className={styles.seeAll}>View All Deals</Link>
          </div>
          <div className={styles.flashDealsGrid}>
            {flashDealProducts.slice(0, 8).map((product: any) => (
              <div key={product._id} className={styles.flashDealCard}>
                <ProductCard product={product} />
                {product.discount && (
                  <div className={styles.discountBadge}>
                    <span className={styles.discountPercent}>{product.discount}%</span>
                    <span className={styles.discountText}>OFF</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending Products Section - NEW */}
      {trendingProducts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🔥 Trending Now</h2>
            <Link href="/products?sort=trending" className={styles.seeAll}>View All</Link>
          </div>
          <div className={styles.productGrid}>
            {trendingProducts.slice(0, 8).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Categories Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🛍️ Shop by Category</h2>
          <Link href="/categories" className={styles.seeAll}>View All</Link>
        </div>
        <div className={`${styles.categoryGrid} ${categories.length > 4 ? styles.overflowing : ''}`}>
          {categories.length > 0 ? (
            categories.map((category: any) => (
              <FeaturedCategory key={category._id} category={category} />
            ))
          ) : (
            <div className={styles.empty}>No featured categories available</div>
          )}
        </div>
      </section>

      {/* New Arrivals Section */}
      {newProducts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>✨ New Arrivals</h2>
            <Link href="/products?sort=newest" className={styles.seeAll}>View All</Link>
          </div>
          <div className={styles.productGrid}>
            {newProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Top Rated Products Section */}
      {topRatedProducts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>⭐ Top Rated Products</h2>
            <Link href="/products?rating=4" className={styles.seeAll}>View All</Link>
          </div>
          <div className={styles.productGrid}>
            {topRatedProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Promo Banners */}
      {allBanners.filter((b: any) => ['promo1', 'promo2'].includes(b.location)).length > 0 && (
        <section className={styles.promoBannersSection}>
          {allBanners
            .filter((b: any) => ['promo1', 'promo2'].includes(b.location))
            .map((banner: any) => (
              <div key={banner._id} className={styles.promoBanner}>
                {banner.imageUrl && (
                  <img src={banner.imageUrl} alt={banner.title} className={styles.bannerImage} />
                )}
                <div className={styles.bannerContent}>
                  <h3>{banner.title}</h3>
                  {banner.description && <p>{banner.description}</p>}
                  {banner.ctaText && banner.ctaLink && (
                    <Link href={banner.ctaLink} className={styles.bannerCTA}>
                      {banner.ctaText}
                    </Link>
                  )}
                </div>
              </div>
            ))}
        </section>
      )}

      {/* Bottom Banner */}
      {allBanners.filter((b: any) => b.location === 'bottom').length > 0 && (
        <section className={styles.bannerSection}>
          {(() => {
            const banner = allBanners.find((b: any) => b.location === 'bottom');
            return banner ? (
              <div className={styles.bannerContainer}>
                {banner.imageUrl && (
                  <img src={banner.imageUrl} alt={banner.title} className={styles.bannerImage} />
                )}
                <div className={styles.bannerContent}>
                  <h3>{banner.title}</h3>
                  {banner.description && <p>{banner.description}</p>}
                  {banner.ctaText && banner.ctaLink && (
                    <Link href={banner.ctaLink} className={styles.bannerCTA}>
                      {banner.ctaText}
                    </Link>
                  )}
                </div>
              </div>
            ) : null;
          })()}
        </section>
      )}

      {/* CTA Section - Industry Best Practice */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Exclusive Deals & Offers</h2>
          <p>Subscribe to our newsletter and get up to 20% off your first order</p>
          <Link href="/products" className={styles.ctaButton}>Shop Now</Link>
        </div>
      </section>
    </div>
  );
}
