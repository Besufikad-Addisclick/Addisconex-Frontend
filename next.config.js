/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
    images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // swcMinify: true,
  devIndicators: false ,
};

module.exports = nextConfig;



// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // Enable experimental features for better performance
//   experimental: {
//     optimizeCss: true,
//     optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
//   },

//   // Image optimization
//   images: {
//     formats: ['image/webp', 'image/avif'],
//     deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
//     imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
//     minimumCacheTTL: 60,
//     dangerouslyAllowSVG: true,
//     contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
//   },

//   // Compiler optimizations
//   compiler: {
//     removeConsole: process.env.NODE_ENV === 'production',
//   },

//   // Bundle analyzer (uncomment to analyze bundle size)
//   // webpack: (config, { isServer }) => {
//   //   if (!isServer) {
//   //     config.resolve.fallback = {
//   //       ...config.resolve.fallback,
//   //       fs: false,
//   //     };
//   //   }
//   //   return config;
//   // },

//   // Headers for better caching
//   async headers() {
//     return [
//       {
//         source: '/(.*)',
//         headers: [
//           {
//             key: 'X-Frame-Options',
//             value: 'DENY',
//           },
//           {
//             key: 'X-Content-Type-Options',
//             value: 'nosniff',
//           },
//           {
//             key: 'Referrer-Policy',
//             value: 'origin-when-cross-origin',
//           },
//         ],
//       },
//       {
//         source: '/api/(.*)',
//         headers: [
//           {
//             key: 'Cache-Control',
//             value: 'public, max-age=0, s-maxage=86400',
//           },
//         ],
//       },
//       {
//         source: '/_next/static/(.*)',
//         headers: [
//           {
//             key: 'Cache-Control',
//             value: 'public, max-age=31536000, immutable',
//           },
//         ],
//       },
//     ];
//   },

//   // Redirects for better SEO
//   async redirects() {
//     return [
//       {
//         source: '/dashboard',
//         destination: '/dashboard/',
//         permanent: true,
//       },
//     ];
//   },

//   // Environment variables
//   env: {
//     CUSTOM_KEY: process.env.CUSTOM_KEY,
//   },

//   // Output configuration
//   output: 'standalone',
  
//   // Enable SWC minification
//   swcMinify: true,

//   // Optimize imports
//   modularizeImports: {
//     'lucide-react': {
//       transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
//     },
//   },
// };

// module.exports = nextConfig;
