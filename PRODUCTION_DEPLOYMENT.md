# Production Deployment Guide - Image Uploads

## Current Issue

The application shows `404 Not Found` errors for uploaded images when deployed on Vercel because:
- File uploads are stored locally in `/public/uploads/`
- Vercel's serverless environment has an ephemeral filesystem
- Uploaded files don't persist between deployments

## Solutions for Production

### Option 1: AWS S3 (Recommended for Scale)

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
AWS_S3_REGION=us-east-1
AWS_S3_URL=https://your-bucket.s3.amazonaws.com
```

Install AWS SDK:
```bash
npm install @aws-sdk/client-s3
```

### Option 2: Cloudinary (Easiest Setup)

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Install Cloudinary SDK:
```bash
npm install cloudinary next-cloudinary
```

### Option 3: Supabase Storage

```env
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

## Implementation Steps

1. Choose your cloud storage provider
2. Set up the service and get API credentials
3. Create new API route for uploads that uses the cloud service
4. Update file upload handlers in admin to use new route
5. Store file URLs in database instead of local paths
6. Test locally before deploying to Vercel

## Files That Handle Uploads

- `/app/api/upload` - Main upload endpoint
- `/app/admin/page.tsx` - File input handlers
- `/components/Header.tsx` - Logo image display

## Current Implementation (Local - Development Only)

- Uploads stored in: `/public/uploads/`
- Branding data saved in: `/public/branding.json`
- Works fine locally but doesn't scale to production

## Recommended Approach for Your Use Case

1. **Short-term**: Use default logo/images if custom logo fails to load (current implementation)
2. **Medium-term**: Implement Cloudinary (easiest, free tier available)
3. **Long-term**: Move to AWS S3 for better control and scalability

## Testing on Local Machine

Currently working correctly - file uploads persist during dev sessions because the filesystem is persistent locally.

## Testing on Vercel

To verify the fix works:
1. Deploy without custom logo (use default site name)
2. Or use absolute URLs to external images
3. Don't rely on local file paths in production
