# Nova E-commerce Platform - Next.js

A modern e-commerce platform built with Next.js, combining the full-stack capabilities of a Node.js/Express backend with a React frontend into a unified Next.js application.

## Features

- User authentication and authorization
- Product management with categories
- Shopping cart and orders
- Admin dashboard
- MongoDB integration
- JWT-based authentication
- API routes

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file with the following variables:
```env
MONGO_URI=mongodb://localhost:27017/nova
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
NewTech/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   │   ├── auth/       # Authentication endpoints
│   │   ├── products/   # Product endpoints
│   │   ├── categories/ # Category endpoints
│   │   └── orders/     # Order endpoints
│   ├── (pages)/        # Application pages
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/          # React components
├── lib/                # Utility functions and modules
│   ├── db/            # Database connection
│   ├── models/        # Mongoose models
│   ├── middleware/    # Authentication & encryption
│   └── services/      # Business logic services
├── public/            # Static files
├── styles/            # Global styles
├── next.config.js     # Next.js configuration
└── tsconfig.json      # TypeScript configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `GET /api/products/:id` - Get product details
- `PATCH /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)
- `GET /api/products/category?slug=category-slug` - Get products by category

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id` - Update order (admin)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Technologies Used

- **Frontend**: React, Next.js
- **Backend**: Node.js, Express (within Next.js API routes)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Password Hashing**: bcryptjs

## Migration Notes

This project was migrated from a separate backend/frontend architecture to a unified Next.js full-stack application:

- Express backend routes are now Next.js API routes
- React frontend components are integrated into the Next.js app directory
- MongoDB models are migrated to TypeScript with Mongoose
- Authentication middleware works with Next.js request handlers

## License

ISC
