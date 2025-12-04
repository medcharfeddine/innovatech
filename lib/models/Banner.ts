import { Schema, model, models } from 'mongoose';

const BannerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      enum: ['hero', 'featured', 'promo1', 'promo2', 'bottom'],
      default: 'featured',
    },
    ctaText: {
      type: String,
      trim: true,
    },
    ctaLink: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default models.Banner || model('Banner', BannerSchema);
