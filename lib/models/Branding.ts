import mongoose, { Schema } from 'mongoose';

export interface IBranding {
  _id: string;
  siteName: string;
  storeName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  pageTitle: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrandingSchema = new Schema<IBranding>(
  {
    _id: { type: String, default: '1' },
    siteName: { type: String, default: 'Nova' },
    storeName: { type: String, default: 'Nova Store' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#2a317f' },
    accentColor: { type: String, default: '#df172e' },
    description: { type: String, default: 'Premium E-commerce Store' },
    contactEmail: { type: String, default: 'info@nova.com' },
    contactPhone: { type: String, default: '+216 56 664 442' },
    address: { type: String, default: 'Tunisia' },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com' },
      instagram: { type: String, default: 'https://instagram.com' },
      twitter: { type: String, default: 'https://twitter.com' },
    },
    pageTitle: { type: String, default: 'Nova - E-commerce Platform' },
  },
  { timestamps: true }
);

export default mongoose.models.Branding || mongoose.model<IBranding>('Branding', BrandingSchema);
