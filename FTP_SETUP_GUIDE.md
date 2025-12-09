# FTP Server Integration Guide

## Overview

Your e-commerce platform now supports centralized image management through FTP (File Transfer Protocol). This allows you to manage all product images, logos, favicons, and banners from a single FTP server, which is particularly useful for:

- **Centralized Management**: All images stored in one place
- **Scalability**: Handle large numbers of images without local storage limits
- **Persistence**: Images persist across deployments (crucial for Vercel)
- **Performance**: Serve images from a fast CDN or dedicated image server
- **Backup**: Easy backup and disaster recovery

## Prerequisites

You need:
1. An FTP server (local or remote)
2. FTP credentials (host, port, username, password)
3. A public URL to access the images (optional but recommended)

## Recommended FTP Solutions

### Option 1: Local FTP Server (Development/Testing)
- **Software**: FileZilla Server, vsftpd, or Windows IIS FTP
- **Cost**: Free
- **Best for**: Local development and testing
- **Steps**:
  1. Install FileZilla Server
  2. Create user account
  3. Set home directory to your images folder
  4. Note down: host (localhost or 127.0.0.1), port (21), username, password

### Option 2: Cloud FTP Hosting (Production)
Popular options:
- **AWS SFTP Transfer Family**
- **Azure File Share with FTP**
- **Bunny CDN with FTP access**
- **Dropbox (with FTP gateway)**
- **Google Cloud Storage (with FTP gateway)**

### Option 3: Dedicated FTP Provider
- **Bluehost**, **HostGator**, **SiteGround** (usually include FTP with hosting)
- **FTP.com** or similar managed FTP services
- Typically $5-15/month

## Setup Instructions

### Step 1: Access Admin Panel

1. Go to your admin dashboard at `/admin`
2. Log in with your admin credentials
3. Navigate to **Settings → Branding** (or look for FTP settings tab)

### Step 2: Configure FTP Server

You should see an FTP Configuration section. Enter:

- **FTP Host**: e.g., `ftp.example.com` or `127.0.0.1`
- **Port**: Usually `21` (default) or `22` (SFTP)
- **Username**: Your FTP account username
- **Password**: Your FTP account password
- **Base Path**: Where images will be stored on FTP (e.g., `/images` or `/public/images`)
- **Public Base URL**: How to access images publicly (e.g., `https://images.example.com`)

### Step 3: Test Connection

Click the **"Test Connection"** button to verify your FTP credentials:
- ✅ Green message = Connection successful
- ❌ Red message = Check your credentials and try again

### Step 4: Save Configuration

Once the test passes, click **"Save Configuration"** to store your FTP settings.

## How It Works

### Uploading Images

Once FTP is configured:

1. **When uploading products**: Images are automatically sent to your FTP server
2. **When uploading logos/favicons**: Branding images go to FTP
3. **When uploading banners**: Banner images are stored on FTP
4. All uploads return a public URL that's saved in your database

### Image URLs

Images are accessed via:
```
{baseUrl}/{basePath}/{folder}/{filename}
```

Example:
```
https://images.example.com/images/products/1234567890_product-name.jpg
```

### Fallback Behavior

If FTP is not configured:
- **Local Development**: Images stored in `/public/uploads` (works fine locally)
- **Vercel Production**: Upload feature returns helpful error message guiding users to set up FTP or cloud storage

## Managing Images

### Updating an Image

1. Edit the product/banner/category
2. Upload a new image
3. The system:
   - Uploads to FTP server
   - Returns new URL
   - Updates database automatically

### Deleting an Image

Images on the FTP server are **not automatically deleted** when you delete a product. To clean up:

1. Connect to your FTP server directly using an FTP client
2. Navigate to the configured base path
3. Manually delete old image files

Consider keeping old images for archive purposes before deleting.

## Troubleshooting

### "FTP Connection Failed"
- ✅ Verify host address is correct
- ✅ Check username and password
- ✅ Confirm FTP server is running
- ✅ Check firewall allows FTP traffic (port 21 or 22)
- ✅ Try with explicit IP address instead of domain

### "Upload Failed"
- ✅ Ensure base path exists on FTP server
- ✅ Check FTP user has write permissions
- ✅ Verify image file size < 10MB
- ✅ Confirm image format (JPEG, PNG, GIF, WebP)

### "Images show broken link"
- ✅ Verify public base URL is correct
- ✅ Check images actually exist on FTP server
- ✅ Ensure public base URL is accessible (firewall/permissions)
- ✅ Test URL directly in browser

### "FTP not persisting on Vercel"
- This is expected! Vercel has an ephemeral filesystem
- FTP configuration is only stored locally for testing
- For production on Vercel, use a cloud storage solution (see Setup Guide)

## Best Practices

### Performance
- Use a CDN in front of your FTP server for faster image delivery
- Compress images before uploading
- Use appropriate image formats (WebP for modern browsers)

### Organization
Recommended folder structure on FTP:
```
/images/
  ├── /products/        (all product images)
  ├── /banners/         (promotional banners)
  ├── /categories/      (category thumbnails)
  ├── /branding/        (logos, favicons, etc.)
  └── /archive/         (old images for reference)
```

### Security
- Use strong FTP passwords
- Consider SFTP (SSH FTP) instead of plain FTP for encryption
- Restrict FTP access by IP if possible
- Keep FTP credentials secure, never commit to git

### Backups
- Regularly backup your FTP server
- Keep local copies of important images
- Consider versioning strategy for image updates

## Advanced: SFTP (SSH File Transfer Protocol)

For better security, use SFTP instead of standard FTP:
- Port: Usually `22` instead of `21`
- More secure (encrypted connection)
- Most cloud FTP providers recommend SFTP

The system supports both FTP and SFTP transparently.

## API Reference

### Get FTP Configuration
```bash
GET /api/ftp-config
Authorization: Bearer {token}
```

### Update FTP Configuration
```bash
PUT /api/ftp-config
Authorization: Bearer {token}
Content-Type: application/json

{
  "host": "ftp.example.com",
  "port": 21,
  "username": "user",
  "password": "pass",
  "basePath": "/images",
  "baseUrl": "https://images.example.com",
  "test": false  // Set to true to test connection before saving
}
```

### Upload Image to FTP
```bash
POST /api/ftp-upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (image file)
folder: "products"  // optional
```

Response:
```json
{
  "success": true,
  "filename": "1234567890_product-name.jpg",
  "url": "https://images.example.com/images/products/1234567890_product-name.jpg",
  "path": "/images/products/1234567890_product-name.jpg"
}
```

## Need Help?

If you encounter issues:

1. Check the **Test Connection** result for specific error messages
2. Verify FTP credentials with your FTP provider
3. Ensure the FTP base path exists on the server
4. Check that your FTP user has write permissions
5. Review the browser console for detailed error logs (F12 → Console tab)

For production deployments, consider using Cloudinary, AWS S3, or similar cloud storage services instead, which have better performance and reliability.
