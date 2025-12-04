import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: String,
    categoryParent: { type: String, index: true },
    categoryChild: { type: String, index: true },
    brand: String,
    sku: String,
    stock: { type: Number, default: 0 },
    imageUrl: String,
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

productSchema.index({ categoryParent: 1, categoryChild: 1 });

productSchema.pre('save', function (next) {
  try {
    if (this.category && !this.categoryParent && !this.categoryChild) {
      const parts = this.category
        .split('>')
        .map((p: string) => p && p.trim())
        .filter(Boolean);
      if (parts.length === 1) {
        this.categoryParent = parts[0];
        this.categoryChild = undefined;
      } else if (parts.length >= 2) {
        this.categoryParent = parts[0];
        this.categoryChild = parts.slice(1).join(' > ');
      }
    }
    next();
  } catch (error) {
    next(error as any);
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
