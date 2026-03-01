import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// Bundle analyzer (optional - only if package is installed)
let withBundleAnalyzer = (config: NextConfig) => config;
try {
  const bundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  });
  withBundleAnalyzer = bundleAnalyzer;
} catch {
  // Bundle analyzer not installed - skip
}

const nextConfig: NextConfig = {
  // Let Vercel handle compression automatically
  compress: false,

  // Performance optimizations
  poweredByHeader: false,
  generateEtags: true,

  // Ignore lint errors during build for this debug branch (legacy codebase has 400+ errors)
  serverExternalPackages: ['puppeteer', 'puppeteer-core', '@sparticuz/chromium', 'fs', 'path'],

  // Image optimization with advanced settings
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 80, 90], // Support default (75), Hero screenshot (80), and high quality (90)
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Allow images from Supabase Storage and recipe sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Recipe source domains
      {
        protocol: 'https',
        hostname: 'www.allrecipes.com',
      },
      {
        protocol: 'https',
        hostname: 'www.foodnetwork.com',
      },
      {
        protocol: 'https',
        hostname: 'www.epicurious.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.epicurious.com',
      },
      {
        protocol: 'https',
        hostname: 'www.bonappetit.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.bonappetit.com',
      },
      {
        protocol: 'https',
        hostname: 'tasty.co',
      },
      {
        protocol: 'https',
        hostname: 'www.seriouseats.com',
      },
      {
        protocol: 'https',
        hostname: 'food52.com',
      },
      {
        protocol: 'https',
        hostname: 'www.simplyrecipes.com',
      },
      {
        protocol: 'https',
        hostname: 'smittenkitchen.com',
      },
      {
        protocol: 'https',
        hostname: 'www.thekitchn.com',
      },
      {
        protocol: 'https',
        hostname: 'www.delish.com',
      },
      {
        protocol: 'https',
        hostname: 'img.buzzfeed.com',
      },
      // CDN domains for recipe images (common image hosting)
      {
        protocol: 'https',
        hostname: 'cdn.jwplayer.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.imgix.net',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
    ],
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: [
      '@supabase/supabase-js',
      '@vercel/analytics',
      'recharts',
      'lucide-react',
      'framer-motion',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@tanstack/react-query',
    ],
    // Let Next.js handle optimization CSS in production
    optimizeCss: process.env.NODE_ENV === 'production',
  },

  outputFileTracingExcludes: {
    '*': ['data/recipe-database/**/*', './data/recipe-database/**/*'],
  },

  // Remove dev tools from production
  ...(process.env.NODE_ENV === 'production'
    ? {
        webpack: config => {
          // Remove Next.js dev tools from production
          config.resolve.alias = {
            ...config.resolve.alias,
            'next/dist/compiled/next-dev-tools': false,
          };

          return config;
        },
      }
    : {}),

  // Turbopack configuration (moved from experimental)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Webpack configuration with advanced optimizations
  webpack: (config, { dev, isServer }) => {
    // Exclude data/recipe-database from file watching and analysis
    // This prevents Next.js from scanning 99k+ files during build
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        ...(Array.isArray(config.watchOptions?.ignored) ? config.watchOptions.ignored : []),
        '**/data/recipe-database/**',
        '**/node_modules/**',
      ],
    };

    // Production optimizations
    if (!dev && !isServer) {
      // Advanced bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 150000, // Further reduced for better code splitting (was 200KB)
        cacheGroups: {
          // Vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          // Analytics chunk
          analytics: {
            test: /[\\/]node_modules[\\/](@vercel\/analytics|gtag)[\\/]/,
            name: 'analytics',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Supabase chunk (async - only load when needed)
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase',
            chunks: 'async', // Async loading - only load when Supabase is actually used
            priority: 15,
            reuseExistingChunk: true,
          },
          // React chunk
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 25,
            reuseExistingChunk: true,
          },
          // Framer Motion chunk (heavy animation library - lazy loaded in most places)
          framerMotion: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer-motion',
            chunks: 'async', // Only load when needed (page transitions, arcade components)
            priority: 20,
            reuseExistingChunk: true,
          },
          // DnD Kit chunk (drag and drop library - only used in menu-builder)
          dndKit: {
            test: /[\\/]node_modules[\\/]@dnd-kit[\\/]/,
            name: 'dnd-kit',
            chunks: 'async', // Only load when needed (menu-builder route)
            priority: 20,
            reuseExistingChunk: true,
          },
          // Recharts chunk (charting library - already lazy loaded)
          // Higher priority and enforce single chunk to prevent splitting
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'recharts',
            chunks: 'async', // Only load when needed (lazy loaded)
            priority: 30, // Higher priority to ensure single chunk
            enforce: true, // Force single chunk (ignore maxSize)
            reuseExistingChunk: true,
          },
          // React Query chunk (data fetching library - can be async)
          reactQuery: {
            test: /[\\/]node_modules[\\/]@tanstack\/react-query[\\/]/,
            name: 'react-query',
            chunks: 'async', // Only load when React Query is used
            priority: 20,
            reuseExistingChunk: true,
          },
          // Server-only dependencies (exclude from client bundle)
          // Note: These are automatically excluded from client bundle by Next.js
          // No need for special webpack config - Next.js handles server/client separation
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };

      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Module concatenation
      config.optimization.concatenateModules = true;

      // CSS optimization to prevent unused preloads
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss|sass)$/,
        chunks: 'all',
        enforce: true,
        priority: 30,
      };
    }

    // Font optimization handled by Next.js built-in font optimization
    // Removed conflicting file-loader rule that was causing 404 errors

    return config;
  },

  // Redirects for SEO (301 permanent redirects for moved pages)
  async redirects() {
    return [
      // Redirect non-www to www (fixes Auth0 callback URL mismatch)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'prepflow.org',
          },
        ],
        destination: 'https://www.prepflow.org/:path*',
        permanent: true, // 301 redirect
      },
      {
        source: '/webapp/ingredients',
        destination: '/webapp/recipes#ingredients',
        permanent: true, // 301 redirect
      },
      {
        source: '/webapp/cogs',
        destination: '/webapp/recipes#dishes',
        permanent: true, // 301 redirect
      },
      {
        source: '/webapp/dish-builder',
        destination: '/webapp/recipes?builder=true#dishes',
        permanent: true, // 301 redirect
      },
    ];
  },

  // Headers for performance and security
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    const baseHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      // Only include HSTS in actual production deployments (Vercel)
      // This prevents HSTS redirects on localhost which block Lighthouse audits
      ...(isProduction && process.env.VERCEL
        ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains; preload',
            },
          ]
        : []),
      {
        key: 'Content-Security-Policy',
        value: `default-src 'self'; img-src 'self' data: blob: https: *.allrecipes.com *.foodnetwork.com *.epicurious.com *.bonappetit.com *.tasty.co *.seriouseats.com *.food52.com *.simplyrecipes.com *.smittenkitchen.com *.thekitchn.com *.delish.com *.cloudinary.com *.imgix.net *.amazonaws.com *.auth0.com *.googleusercontent.com *.gravatar.com *.gravatar.com *.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://va.vercel-scripts.com; connect-src 'self' https: wss: https://*.supabase.co wss://*.supabase.co https://*.supabase.co/realtime/v1/websocket https://vercel.live https://dev-7myakdl4itf644km.us.auth0.com *.auth0.com *.google-analytics.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io; frame-src 'self' https://vercel.live https://dev-7myakdl4itf644km.us.auth0.com; frame-ancestors 'none'; ${isProduction && process.env.VERCEL ? 'upgrade-insecure-requests;' : ''}`,
      },
    ];

    // Return early with proper structure
    const result: Array<{ source: string; headers: Array<{ key: string; value: string }> }> = [
      {
        source: '/(.*)',
        headers: baseHeaders,
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0, must-revalidate',
          },
        ],
      },
    ];

    // Development: Disable caching for webapp routes to prevent stale component issues
    // TEMPORARILY DISABLED - causing config compilation error
    // TODO: Re-enable with proper syntax after debugging
    // if (process.env.NODE_ENV === 'development') {
    //   baseHeaders.push({
    //     source: '/webapp/(.*)',
    //     headers: [
    //       {
    //         key: 'Cache-Control',
    //         value: 'no-cache, no-store, must-revalidate, max-age=0',
    //       },
    //       {
    //         key: 'Pragma',
    //         value: 'no-cache',
    //       },
    //       {
    //         key: 'Expires',
    //         value: '0',
    //       },
    //     ],
    //   });
    // }

    const additionalHeaders: Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }> = [
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Vary',
            value: 'Accept',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      {
        source: '/webapp/time-attendance',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self)',
          },
        ],
      },
    ];

    return [...result, ...additionalHeaders];
  },
};

const baseConfig = withBundleAnalyzer(nextConfig);

export default withSentryConfig(baseConfig, {
  org: 'kuschmierz',
  project: process.env.SENTRY_PROJECT || 'prepflow-web',
  silent: !process.env.CI,

  // Upload source maps to Sentry for readable stack traces in production
  // Requires SENTRY_AUTH_TOKEN env var in Vercel
  widenClientFileUpload: true,

  // Tree-shake Sentry logger statements in production
  disableLogger: true,

  // Automatically instrument Next.js data fetching methods with Sentry
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
  autoInstrumentAppDirectory: true,

  // Only upload source maps when SENTRY_AUTH_TOKEN is configured
  // Falls back gracefully if not configured (no build failure)
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
