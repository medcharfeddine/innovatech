# Vercel Deployment Guide: Solving the 404 Upload Issue

## The Problem

Vercel uses an **ephemeral filesystem**, meaning files uploaded to `public/uploads/` during runtime are not persisted between deployments or restarts. This is why your logo and banner images show 404 errors in production.

**Console Error:**
```
GET https://techink.vercel.app/uploads/logo-1764704649660.png 404 (Not Found)
```

## Solutions

### Option 1: AWS S3 (Recommended for Production)

Most scalable and cost-effective for high-traffic applications.

#### Setup Steps:

1. **Create AWS S3 Bucket:**
   - Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
   - Create a new bucket (e.g., `techink-uploads`)
   - Enable public read access via bucket policy

2. **Install Dependencies:**
   ```bash
   npm install @aws-sdk/client-s3
   ```

3. **Add AWS Credentials to `.env.local`:**
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=techink-uploads
   AWS_S3_URL=https://techink-uploads.s3.amazonaws.com
   ```

4. **Update `app/api/upload/route.ts`:**
   ```typescript
   import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
   import { NextRequest, NextResponse } from "next/server";
   import { verifyToken } from "@/lib/middleware/auth";

   const s3Client = new S3Client({
     region: process.env.AWS_REGION || "us-east-1",
     credentials: {
       accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
     },
   });

   export async function POST(request: NextRequest) {
     try {
       // Verify authentication
       const decoded = verifyToken(request);
       if (!decoded) {
         return NextResponse.json(
           { error: "Unauthorized" },
           { status: 401 }
         );
       }

       const formData = await request.formData();
       const file = formData.get("file") as File;
       const type = formData.get("type") as string;

       if (!file) {
         return NextResponse.json(
           { error: "No file provided" },
           { status: 400 }
         );
       }

       const buffer = await file.arrayBuffer();
       const filename = `${type}-${Date.now()}.${file.name.split(".").pop()}`;

       const command = new PutObjectCommand({
         Bucket: process.env.AWS_S3_BUCKET,
         Key: `uploads/${filename}`,
         Body: Buffer.from(buffer),
         ContentType: file.type,
         ACL: "public-read",
       });

       await s3Client.send(command);

       const fileUrl = `${process.env.AWS_S3_URL}/uploads/${filename}`;
       return NextResponse.json({ url: fileUrl }, { status: 200 });
     } catch (error) {
       console.error("S3 Upload error:", error);
       return NextResponse.json(
         { error: "Upload failed" },
         { status: 500 }
       );
     }
   }
   ```

**Pros:**
- Most reliable for production
- Auto-scales with traffic
- CDN-ready with CloudFront
- Fine-grained access control

**Cons:**
- Requires AWS account
- Costs based on storage + requests

---

### Option 2: Cloudinary (Easiest Setup)

Best for quick integration with built-in image optimization.

#### Setup Steps:

1. **Sign up at [Cloudinary](https://cloudinary.com/)**
   - Free tier includes 25GB storage + 25 credits/month

2. **Install Dependencies:**
   ```bash
   npm install next-cloudinary
   ```

3. **Add Credentials to `.env.local`:**
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Update `app/api/upload/route.ts`:**
   ```typescript
   import { v2 as cloudinary } from "cloudinary";
   import { NextRequest, NextResponse } from "next/server";
   import { verifyToken } from "@/lib/middleware/auth";

   cloudinary.config({
     cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });

   export async function POST(request: NextRequest) {
     try {
       const decoded = verifyToken(request);
       if (!decoded) {
         return NextResponse.json(
           { error: "Unauthorized" },
           { status: 401 }
         );
       }

       const formData = await request.formData();
       const file = formData.get("file") as File;
       const type = formData.get("type") as string;

       if (!file) {
         return NextResponse.json(
           { error: "No file provided" },
           { status: 400 }
         );
       }

       const bytes = await file.arrayBuffer();
       const buffer = Buffer.from(bytes);

       const result = await new Promise((resolve, reject) => {
         const uploadStream = cloudinary.uploader.upload_stream(
           {
             folder: `techink/${type}`,
             resource_type: "auto",
           },
           (error, result) => {
             if (error) reject(error);
             else resolve(result);
           }
         );

         uploadStream.end(buffer);
       });

       return NextResponse.json({
         url: (result as any).secure_url,
       }, { status: 200 });
     } catch (error) {
       console.error("Cloudinary error:", error);
       return NextResponse.json(
         { error: "Upload failed" },
         { status: 500 }
       );
     }
   }
   ```

5. **Use CldImage in Components:**
   ```typescript
   import { CldImage } from 'next-cloudinary';

   <CldImage
     src={branding.logoUrl}
     alt="Logo"
     width={150}
     height={50}
   />
   ```

**Pros:**
- Automatic image optimization
- Built-in CDN
- Easy integration
- Generous free tier

**Cons:**
- Cloudinary vendor lock-in
- Limited free tier bandwidth

---

### Option 3: Supabase Storage

Good middle-ground with PostgreSQL + storage.

#### Setup Steps:

1. **Sign up at [Supabase](https://supabase.com/)**

2. **Install Dependencies:**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Add Credentials to `.env.local`:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Create Storage Bucket:**
   - In Supabase dashboard: Storage → Create new bucket → `techink-uploads`
   - Set to public

5. **Update `app/api/upload/route.ts`:**
   ```typescript
   import { createClient } from "@supabase/supabase-js";
   import { NextRequest, NextResponse } from "next/server";
   import { verifyToken } from "@/lib/middleware/auth";

   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   );

   export async function POST(request: NextRequest) {
     try {
       const decoded = verifyToken(request);
       if (!decoded) {
         return NextResponse.json(
           { error: "Unauthorized" },
           { status: 401 }
         );
       }

       const formData = await request.formData();
       const file = formData.get("file") as File;
       const type = formData.get("type") as string;

       if (!file) {
         return NextResponse.json(
           { error: "No file provided" },
           { status: 400 }
         );
       }

       const filename = `${type}-${Date.now()}.${file.name.split(".").pop()}`;

       const { data, error } = await supabase.storage
         .from("techink-uploads")
         .upload(`uploads/${filename}`, file);

       if (error) throw error;

       const {
         data: { publicUrl },
       } = supabase.storage
         .from("techink-uploads")
         .getPublicUrl(data.path);

       return NextResponse.json({
         url: publicUrl,
       }, { status: 200 });
     } catch (error) {
       console.error("Supabase error:", error);
       return NextResponse.json(
         { error: "Upload failed" },
         { status: 500 }
       );
     }
   }
   ```

**Pros:**
- Integrated with PostgreSQL
- Good for complex apps
- Affordable pricing

**Cons:**
- More setup required
- Slightly higher learning curve

---

## Current Workaround (Local Development Only)

For development, your current setup works fine:

```typescript
// components/Header.tsx
onError={(e) => {
  console.error('Logo failed to load:', branding.logoUrl);
  e.currentTarget.style.display = 'none';
  const fallback = document.createElement('span');
  fallback.className = styles.brand;
  fallback.textContent = branding.siteName;
  e.currentTarget.parentElement?.appendChild(fallback);
}}
```

This gracefully falls back to showing the site name when image fails.

## Migration Checklist

- [ ] Choose cloud storage provider
- [ ] Create account and configure credentials
- [ ] Install required npm packages
- [ ] Update `.env.local` with credentials
- [ ] Update `app/api/upload/route.ts`
- [ ] Test upload in admin panel locally
- [ ] Deploy to Vercel
- [ ] Set environment variables in Vercel dashboard
- [ ] Test uploads on production
- [ ] Update branding (logo/banners) on production admin

## Environment Variables for Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `innovatech`
3. Settings → Environment Variables
4. Add all variables from your chosen solution
5. Redeploy: `git push`

## Testing

**Local (works with current setup):**
```bash
npm run dev
# Go to admin panel
# Upload logo/banner
# Check public/uploads/ folder
```

**Production (after cloud integration):**
```bash
# Upload logo/banner in production admin
# Image should appear immediately without 404
```

## Recommended: AWS S3 with CloudFront

For best performance:

1. Set up S3 bucket as above
2. Create CloudFront distribution pointing to S3
3. Use CloudFront URL in database (faster delivery globally)
4. Cost: ~$0.085/GB transfer + storage

```
Before: https://techink-uploads.s3.amazonaws.com/uploads/logo.png
After:  https://d123.cloudfront.net/uploads/logo.png
```

---

## Quick Comparison Table

| Solution | Setup Time | Cost | Performance | Ease |
|----------|-----------|------|-------------|------|
| AWS S3   | 30 min    | Low  | Excellent   | Good |
| Cloudinary | 10 min  | Low  | Excellent   | Easy |
| Supabase | 20 min    | Low  | Good        | Good |
| Local FS | Instant   | Free | Poor (Vercel) | Easy |

## Need Help?

Contact your hosting provider or refer to:
- AWS S3 Docs: https://docs.aws.amazon.com/s3/
- Cloudinary Docs: https://cloudinary.com/documentation
- Supabase Docs: https://supabase.com/docs
