import type { NextConfig } from 'next';

const SVG_RULE_REGEX = /\.svg$/;
const NODE_MODULES_REGEX = /[\\/]node_modules[\\/]/;
const RADIX_UI_REGEX = /[\\/]node_modules[\\/]@radix-ui[\\/]/;
const ANALYTICS_REGEX =
  /[\\/]node_modules[\\/](@amplitude|@datadog)[\\/]/;

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  experimental: {
    // Optimize package imports for better bundle splitting
    optimizePackageImports: [
      '@lastro-co/design-system',
      '@radix-ui/react-tooltip',
      '@hookform/resolvers',
    ],
  },
  compiler: {
    // Remove console.log in production
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },
  images: {
    remotePatterns: [],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31_536_000, // 1 year
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Server-side external packages (don't bundle these)
  serverExternalPackages: ['msw'],

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Add SVG support with @svgr/webpack
    config.module.rules.push({
      test: SVG_RULE_REGEX,
      use: ['@svgr/webpack'],
    });

    if (!dev && !isServer) {
      // Split vendor chunks more aggressively
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: NODE_MODULES_REGEX,
            name: 'vendors',
            priority: 10,
            chunks: 'all',
          },
          radixui: {
            test: RADIX_UI_REGEX,
            name: 'radix-ui',
            priority: 20,
            chunks: 'all',
          },
          analytics: {
            test: ANALYTICS_REGEX,
            name: 'analytics',
            priority: 20,
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
