# Quick Reference: Admin Dashboard Data Sync

## Tab Handlers Overview

| Tab | Data Fetch | Save Handler | Storage | Frontend Update |
|-----|-----------|--------------|---------|-----------------|
| **Products** | `fetchTabData('products')` | `handleProductSave()` | MongoDB | Admin: Immediate<br/>Frontend: 10s ISR |
| **Categories** | `fetchTabData('categories')` | `handleCategorySave()` | MongoDB | Admin: Immediate<br/>Frontend: 10s ISR |
| **Orders** | `fetchTabData('orders')` | N/A | MongoDB | Admin: On fetch |
| **Banners** | `fetchTabData('banners')` | `handleBannerUpload()` | MongoDB | Admin: Immediate<br/>Frontend: 10s ISR |
| **Users** | `fetchTabData('users')` | N/A | MongoDB | Admin: On fetch |
| **Branding** | `fetchTabData('branding')` | `handleSaveBranding()` | MongoDB | Admin: Immediate<br/>Header: Immediate* |

*Header is client component, fetches branding on mount

---

## Admin Data Flow

### When You Click a Tab:
```
1. handleTabChange('products')
   ↓
2. fetchTabData('products')
   ↓
3. GET /api/products?adminView=true
   ↓
4. setProducts([...]) → UI updates
```

### When You Save a Product:
```
1. handleProductSave(e)
   ↓
2. Validate form data
   ↓
3. PUT /api/products/:id (or POST for new)
   ↓
4. Refetch: GET /api/products?adminView=true (NEW!)
   ↓
5. setProducts([...]) → Admin UI updates immediately
   ↓
6. Modal closes + success message
   ↓
7. Home page updates within 10 seconds (ISR)
```

---

## State Variables by Tab

### Products Tab
```typescript
const [products, setProducts] = useState<any[]>([]);
const [productModalOpen, setProductModalOpen] = useState(false);
const [productForm, setProductForm] = useState({
  name: '',
  description: '',
  price: 0,
  category: '',
  stock: 0,
  featured: false,
  discount: 0,
});
const [editingProductId, setEditingProductId] = useState<string | null>(null);
const [productImageFile, setProductImageFile] = useState<File | null>(null);
```

### Categories Tab
```typescript
const [categories, setCategories] = useState<any[]>([]);
const [categoryModalOpen, setCategoryModalOpen] = useState(false);
const [categoryForm, setCategoryForm] = useState({
  name: '',
  slug: '',
  description: '',
  parent: '',
});
const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
```

### Banners Tab
```typescript
const [banners, setBanners] = useState<any[]>([]);
const [bannerModalOpen, setBannerModalOpen] = useState(false);
const [bannerForm, setBannerForm] = useState({
  title: '',
  description: '',
  location: 'hero',
  ctaText: '',
  ctaLink: '',
  isActive: true,
});
const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
```

### Branding Tab
```typescript
const [branding, setBranding] = useState<any>({
  siteName: 'Nova',
  logoUrl: '',
  faviconUrl: '',
  tagline: '',
  description: '',
});
```

---

## API Endpoints Used in Admin

### Fetch Operations
```typescript
// Products
GET /api/products?adminView=true

// Categories
GET /api/categories/all

// Orders
GET /api/orders

// Users
GET /api/auth/users

// Banners
GET /api/banners

// Branding
GET /api/branding

// Stats
GET /api/admin/stats
```

### Save Operations
```typescript
// Create
POST /api/products
POST /api/categories
POST /api/banners

// Update (with refetch)
PUT /api/products/:id
PUT /api/categories/:id
PUT /api/banners/:id
PUT /api/branding

// Delete
DELETE /api/products/:id
DELETE /api/categories/:id
DELETE /api/banners/:id
DELETE /api/orders/:id
DELETE /api/auth/users/:id
```

### File Upload
```typescript
POST /api/upload
- Headers: Authorization: Bearer {token}
- Body: FormData { file, type: 'product|banner|category|logo' }
- Response: { url: 'https://...', filename: 'product-123456.jpg' }
```

---

## Refetch Strategy (NEW)

All handlers now follow this pattern:

```typescript
const handleSave = async () => {
  try {
    // 1. Save to database
    const response = await fetch('/api/resource', { method: 'PUT' });
    
    if (response.ok) {
      // 2. REFETCH from database (NEW!)
      const refreshRes = await fetch('/api/resource');
      
      if (refreshRes.ok) {
        const refreshedData = await refreshRes.json();
        setStateVariable(refreshedData);  // Update UI
      }
    }
  } catch (error) {
    // Fallback to local state update if refetch fails
  }
};
```

**Benefits:**
- ✅ Admin UI always shows latest data
- ✅ Multiple admins see each other's changes
- ✅ Prevents stale data bugs
- ✅ Single source of truth (database)

---

## Frontend Cache Strategy

### ISR (Incremental Static Regeneration)
```typescript
// app/page.tsx
export const revalidate = 10;  // Revalidate every 10 seconds

export default async function Home() {
  const homeData = await getHomeData();  // Server-side fetch
  return <HomePage {...homeData} />;
}
```

**How it works:**
- First user: Gets cached page
- Second user (before 10s): Gets same cached page
- Background: Next.js checks if 10s passed
- If yes: Generates new page with fresh data
- Next user: Gets fresh page

**Timeline:**
```
00:00 - Admin edits product
00:00 - Home page still shows old data (cache valid)
00:10 - First user after 10s triggers revalidation
00:11 - Fresh data available for all users
```

---

## Debugging Checklist

When edits don't appear:

- [ ] Check browser console (F12) for JavaScript errors
- [ ] Verify API response status (should be 200 OK)
- [ ] Check network tab: Is refetch request being sent?
- [ ] MongoDB connection: Check server console for errors
- [ ] For frontend: Wait 10 seconds, then hard refresh (Ctrl+Shift+R)
- [ ] Check if on Vercel: ISR needs full deploy to take effect
- [ ] Image upload: Verify file accessible at returned URL

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Admin list not updating after save | Refetch failed | Check API response, refresh page |
| Frontend not updating after 10s | ISR cache not revalidating | Hard refresh, or wait for next deploy |
| Image shows 404 | Vercel ephemeral FS | Use cloud storage (AWS S3, Cloudinary) |
| Modal stays open | Save success but modal not closing | Check if alert() is firing, refetch succeeded |
| Old data persists in list | State not clearing properly | Check if setStateVariable() called correctly |
| Upload fails | File too large or wrong type | Check file size (<50MB), type (JPEG/PNG/GIF) |

---

## Performance Tips

1. **Admin Dashboard Loading:** ~500-800ms (fetches all tabs on first load)
2. **Save Operation:** ~300-500ms (includes DB update + refetch)
3. **Image Upload:** ~1-3s (depends on file size + network)
4. **Frontend Update:** 10s max (ISR revalidation interval)

To optimize:
- Implement pagination in admin lists (currently fetches all)
- Add search/filter to reduce API response size
- Use React Query for intelligent caching
- Compress images before upload

---

## Key Files

| File | Purpose |
|------|---------|
| `app/admin/page.tsx` | Admin dashboard (2,053 lines) |
| `app/page.tsx` | Home page with ISR |
| `app/api/products/route.ts` | Product CRUD endpoints |
| `app/api/categories/route.ts` | Category endpoints |
| `app/api/banners/route.ts` | Banner endpoints |
| `app/api/branding/route.ts` | Branding endpoints |
| `lib/models/Product.ts` | Product schema |
| `lib/models/Category.ts` | Category schema |
| `lib/models/Banner.ts` | Banner schema |

---

## Test the Fix

1. **Local Development:**
   ```bash
   npm run dev
   # Go to /admin
   # Edit a product
   # Product list should update immediately
   # Go to home page
   # Should see change immediately (no ISR delay)
   ```

2. **Production (Vercel):**
   ```bash
   git push
   # Wait for deploy
   # Edit product in admin
   # Admin dashboard updates immediately
   # Home page updates within 10 seconds
   ```

---

## Related Files

- 📄 `ADMIN_DATA_FLOW.md` - Detailed explanation
- 📄 `VERCEL_DEPLOYMENT_GUIDE.md` - Cloud storage setup
- 📄 `UPLOADS_CONFIG.md` - Upload system details
- 📄 `PRODUCTION_DEPLOYMENT.md` - Deployment guide

