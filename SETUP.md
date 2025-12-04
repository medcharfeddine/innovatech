# Nova Next.js - Setup Instructions

## ✅ Project Created Successfully!

Your Nova e-commerce platform has been successfully migrated to **Next.js 15** with TypeScript support.

## 📁 Project Location

```
d:\nova\NewTech\
```

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
cd d:\nova\NewTech
npm install
```

This will install:
- **Frontend**: React, React Router DOM, React Icons, Axios
- **Backend**: Express, Mongoose, bcryptjs, JWT, Multer
- **Framework**: Next.js 15, TypeScript

### 2. Set Up Environment Variables

Create `.env.local` file in the NewTech directory:

```env
MONGO_URI=mongodb://localhost:27017/nova
JWT_SECRET=your-secret-key-here-change-in-production
NODE_ENV=development
PORT=3000
```

**Important**: Change `JWT_SECRET` to a secure random string for production.

### 3. Start Development Server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
NewTech/
├── app/
│   ├── api/                    # API Routes (replaced Express)
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── register/route.ts
│   │   │   └── login/route.ts
│   │   ├── products/          # Product endpoints
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── category/route.ts
│   │   ├── categories/        # Category endpoints
│   │   └── orders/            # Order endpoints
│   │
│   ├── (pages)/               # Application pages (replaced React pages)
│   │   ├── login/
│   │   ├── register/
│   │   ├── products/
│   │   └── ...
│   │
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
│
├── components/                 # Reusable React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── ...
│
├── lib/                       # Backend utilities
│   ├── db/
│   │   └── mongodb.ts        # MongoDB connection
│   ├── models/               # Mongoose models
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   └── Order.ts
│   ├── middleware/           # Auth & encryption
│   │   ├── auth.ts
│   │   └── encryption.ts
│   └── services/             # Business logic
│
├── public/                   # Static files & uploads
│   └── uploads/
│
├── styles/                   # Global styles
├── package.json
├── next.config.js
├── tsconfig.json
├── .env.local.example
└── README.md
```

## 📝 Key Features Implemented

### ✅ Authentication
- User registration: `POST /api/auth/register`
- User login: `POST /api/auth/login`
- JWT-based authentication
- bcryptjs password hashing

### ✅ Products
- List all products: `GET /api/products`
- Get product by ID: `GET /api/products/:id`
- Create product (admin): `POST /api/products`
- Update product (admin): `PATCH /api/products/:id`
- Delete product (admin): `DELETE /api/products/:id`
- Get products by category: `GET /api/products/category?slug=...`

### ✅ Categories
- List categories: `GET /api/categories`
- Create category (admin): `POST /api/categories`

### ✅ Orders
- List user orders: `GET /api/orders`
- Create order: `POST /api/orders`
- Get order details: `GET /api/orders/:id`
- Update order (admin): `PATCH /api/orders/:id`

### ✅ Database
- MongoDB integration
- Mongoose models with TypeScript
- Auto-connection pooling

## 🔧 Available Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## 🔌 API Endpoints

All API endpoints from the original backend are now available as Next.js API Routes:

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
```

### Products
```
GET    /api/products            - List all products
GET    /api/products/:id        - Get product details
POST   /api/products            - Create product (admin)
PATCH  /api/products/:id        - Update product (admin)
DELETE /api/products/:id        - Delete product (admin)
GET    /api/products/category   - Get products by category
```

### Categories
```
GET    /api/categories          - List all categories
POST   /api/categories          - Create category (admin)
```

### Orders
```
GET    /api/orders              - List user orders
POST   /api/orders              - Create order
GET    /api/orders/:id          - Get order details
PATCH  /api/orders/:id          - Update order (admin)
```

## 🗄️ Database Setup

Make sure MongoDB is running:

```powershell
# If using MongoDB locally
mongod

# If using MongoDB Atlas, update MONGO_URI in .env.local
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nova
```

## 📚 Migration Notes

- **Old backend URL**: `http://localhost:5000` → **New**: `http://localhost:3000/api`
- **Old frontend URL**: `http://localhost:5173` → **New**: `http://localhost:3000`
- React components can be used as-is with `'use client'` directive
- All Express middleware moved to Next.js API route handlers
- Mongoose models converted to TypeScript

## 🎯 Next Steps

1. **Migrate remaining components**: Copy React components from `d:\nova\frontend\src\components` to `d:\nova\NewTech\components`

2. **Migrate pages**: Copy pages from `d:\nova\frontend\src\pages` to `d:\nova\NewTech\app\(pages)`

3. **Migrate styles**: Convert CSS modules or add Tailwind CSS

4. **Copy static assets**: Move images/files to `public/` folder

5. **Test all features**: Test authentication, products, cart, orders

6. **Setup environment variables** for production

7. **Deploy**: Use Vercel, Netlify, or self-hosted solution

## 📖 Documentation

- [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) - Detailed migration guide
- [README.md](./README.md) - Project README
- [Next.js Docs](https://nextjs.org/docs)
- [Mongoose Docs](https://mongoosejs.com/docs)

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Find and kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### MongoDB Connection Error
- Make sure MongoDB is running
- Check `MONGO_URI` in `.env.local`
- Verify network connection if using Atlas

### TypeScript Errors
```powershell
npm run type-check  # Check for TypeScript errors
npm install         # Reinstall dependencies
```

### API Routes Not Working
- Ensure files are in `app/api/` directory
- Check file naming: `route.ts` (not `.ts`)
- Verify request method (GET, POST, PATCH, DELETE)

## 📞 Support

Refer to:
- [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) for detailed migration info
- Next.js official documentation
- Original project documentation

---

**Happy coding! 🚀**
