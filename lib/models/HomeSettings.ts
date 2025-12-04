import mongoose from 'mongoose';

const homeSettingsSchema = new mongoose.Schema(
  {
    // Hero section
    heroTitle: { type: String, default: 'Welcome to Nova' },
    heroSubtitle: { type: String, default: 'Discover amazing products at unbeatable prices' },

    // Product sections visibility
    showTrendingProducts: { type: Boolean, default: true },
    showNewArrivals: { type: Boolean, default: true },
    showTopRatedProducts: { type: Boolean, default: true },

    // Product section limits
    trendingProductsLimit: { type: Number, default: 8, min: 1, max: 30 },
    newArrivalsLimit: { type: Number, default: 6, min: 1, max: 30 },
    topRatedProductsLimit: { type: Number, default: 6, min: 1, max: 30 },

    // CTA section
    ctaTitle: { type: String, default: 'Stay Updated' },
    ctaSubtitle: { type: String, default: 'Subscribe to our newsletter for exclusive offers and updates' },
    ctaButtonText: { type: String, default: 'Subscribe' },

    // Track last update
    lastUpdatedBy: { type: String, default: 'system' },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const HomeSettings = mongoose.models.HomeSettings || mongoose.model('HomeSettings', homeSettingsSchema);

export default HomeSettings;
