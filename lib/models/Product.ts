import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    categoryParent: String, // Parent category name
    categoryChild: String, // Child category name (optional)
    brand: String,
    sku: String,
    stock: { type: Number, default: 0 },
    imageUrl: String, // Primary/thumbnail image
    images: [String], // Array of additional product images
    featured: { type: Boolean, default: false },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    dealPrice: Number,
    dealStarts: Date,
    dealEnds: Date,
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    specifications: [
      {
        name: String,
        value: String,
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to extract categoryParent and categoryChild from category field
productSchema.pre('save', function (next) {
  if (this.categoryParent && !this.categoryChild) {
    // If categoryParent is set but categoryChild is not, it's a simple category
    // This is fine, just continue
  }
  next();
});

productSchema.index({ categoryParent: 1 });
productSchema.index({ categoryChild: 1 });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
