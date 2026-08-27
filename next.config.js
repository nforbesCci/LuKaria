/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@3dlook/camera-widget-react', 'preact', 'three'],
  experimental: {
    // Smaller server/client graphs; avoids flaky missing vendor-chunks like `@mui.js` after interrupted dev compiles
    optimizePackageImports: ['@mui/material', '@mui/icons-material', '@mui/x-date-pickers'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [70, 72, 75, 80],
    /** Public `/images/*` URLs are content-addressed by query; safe to cache optimized variants longer */
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
  env: {
    AUTH0_SECRET: process.env.AUTH0_SECRET,
    AUTH0_BASE_URL: process.env.AUTH0_BASE_URL,
    AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    MS365_CLIENT_ID: process.env.MS365_CLIENT_ID,
    MS365_CLIENT_SECRET: process.env.MS365_CLIENT_SECRET,
    MS365_TENANT_ID: process.env.MS365_TENANT_ID,
    MS365_EMAIL_FROM: process.env.MS365_EMAIL_FROM,
    MS365_EMAIL_TO: process.env.MS365_EMAIL_TO,
    MS365_SHAREPOINT_SITE_ID: process.env.MS365_SHAREPOINT_SITE_ID,
  },
  webpack: (config) => {
    // 3DLOOK camera widget is Preact; keep its require('preact') resolving correctly.
    config.resolve.alias = {
      ...config.resolve.alias,
      preact: require.resolve('preact'),
      'preact/compat': require.resolve('preact/compat'),
      'preact/hooks': require.resolve('preact/hooks'),
    };
    return config;
  },
}

module.exports = nextConfig
