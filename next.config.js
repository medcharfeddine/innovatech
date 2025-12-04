/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimize production builds
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  
  // Enable static optimization
  staticPageGenerationTimeout: 60,
  
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'your-domain.com',
        pathname: '/uploads/**',
      },
    ],
    // Cache images for 1 year
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
    return config;
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    // Optimize package imports
    optimizePackageImports: [
      'react-icons',
      'react-modal',
    ],
  },
};

module.exports = nextConfig;
