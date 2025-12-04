# Upload Configuration

## Overview

The application stores uploaded files in the `public/uploads/` directory, which is the standard approach for Next.js applications. This allows files to be served as static assets.

## Directory Structure

```
public/
├── uploads/          # Upload directory (git-ignored except .gitkeep)
│   ├── banner-*.jpg
│   ├── logo-*.png
│   ├── product-*.jpg
│   └── .gitkeep      # Ensures directory exists in git
```

## Upload Endpoint

**Route:** `/api/upload`
**Method:** `POST`
**Authentication:** Required (Bearer token)

### Request Format

```javascript
const formData = new FormData();
formData.append('file', file); // File object from input
formData.append('type', 'logo'); // Type: 'logo', 'banner', 'product'

fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
```

## File Constraints

- **Types:** JPEG, PNG, GIF, WebP, SVG
- **Max Size:** 50MB
- **Location:** `public/uploads/`
- **URL Pattern:** `/uploads/{type}-{timestamp}.{ext}`

## Examples

### Banner Upload
```
POST /api/upload
Body: { file: bannerImage, type: 'banner' }
Response: { url: '/uploads/banner-1764704649660.png' }
```

### Logo Upload
```
POST /api/upload
Body: { file: logoImage, type: 'logo' }
Response: { url: '/uploads/logo-1764704649660.png' }
```

### Product Upload
```
POST /api/upload
Body: { file: productImage, type: 'product' }
Response: { url: '/uploads/product-1764704649660.jpg' }
```

## How Files Are Served

Files in `public/uploads/` are automatically served as static assets:
- `/uploads/logo-1764704649660.png` → `public/uploads/logo-1764704649660.png`
- Direct HTTP access without server processing

## Local Development

Files persist during development in `public/uploads/`. You can:
- Upload new files through the admin panel
- Files are immediately available at `/uploads/{filename}`
- Files persist across browser refreshes and server restarts

## Production Deployment (Vercel)

### Current Setup
- Uploads saved to `public/uploads/`
- Works during development
- **Not recommended for production** - serverless platforms have ephemeral filesystems

### For Production, Consider:
1. **AWS S3** - Persistent, scalable cloud storage
2. **Cloudinary** - Easy integration, CDN included
3. **Supabase Storage** - Database-backed file storage
4. See `PRODUCTION_DEPLOYMENT.md` for detailed setup

## Cleanup

To remove uploaded files:
```bash
# Remove all uploads except .gitkeep
rm public/uploads/*
git checkout public/uploads/.gitkeep
```

## Implementation Details

### Files Handling Uploads
- `/app/api/upload/route.ts` - Upload endpoint
- `/app/admin/page.tsx` - Admin file input handlers
- `/components/Header.tsx` - Logo display with fallback
- `/app/api/admin/page.tsx` - Banner upload in settings

### Configuration
- Endpoint: `app/api/upload/route.ts`
- Directory creation: Automatic via `mkdir` if not exists
- Filename generation: `{type}-{timestamp}.{ext}`
- Validation: File type and size checks
