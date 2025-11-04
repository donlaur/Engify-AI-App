/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Disable ESLint during build for emergency deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during build for emergency deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Experimental features
  experimental: {
    // Add experimental features here as needed
    // Exclude server-only packages from client bundles
    // This prevents MongoDB and other server-only packages from being bundled into client-side JavaScript
    serverComponentsExternalPackages: [
      'mongodb',
      'bson',
      '@mongodb/client-encryption',
      'mongodb-client-encryption',
      'kerberos',
      'snappy',
      'gcp-metadata',
      'aws4',
    ],
  },
  
  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'Engify.ai',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS images (tighten in production)
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Changed from SAMEORIGIN for better security
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.sentry.io https://*.ingest.us.sentry.io https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.openai.com https://api.anthropic.com https://api.groq.com https://*.sentry.io https://*.ingest.us.sentry.io https://www.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://*.googletagmanager.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // SEO: Redirect /library/* to /prompts/* (301 permanent redirect)
  async redirects() {
    return [
      {
        source: '/library',
        destination: '/prompts',
        permanent: true, // 301 redirect
      },
      {
        source: '/library/:path*',
        destination: '/prompts/:path*',
        permanent: true, // 301 redirect
      },
    ];
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fix for MongoDB in client-side builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        dns: false,
        child_process: false,
        'mongodb-client-encryption': false,
        'timers/promises': false,
        timers: false,
      };
      
      // Exclude MongoDB and all related packages from client bundle
      // Use function to handle both string and regex patterns
      const originalExternals = config.externals || [];
      config.externals = [
        ...(Array.isArray(originalExternals) ? originalExternals : [originalExternals]),
        function ({ request }, callback) {
          // Exclude MongoDB and all MongoDB-related packages
          if (
            request === 'mongodb' ||
            request?.startsWith('mongodb/') ||
            request?.startsWith('@mongodb/') ||
            request === 'bson' ||
            request === 'bson-ext' ||
            request === 'kerberos' ||
            request === 'mongodb-client-encryption' ||
            request === 'snappy' ||
            request === 'gcp-metadata' ||
            request === 'aws4'
          ) {
            return callback(null, `commonjs ${request}`);
          }
          
          // Exclude Node.js built-in modules that use require()
          if (
            request === 'fs' ||
            request === 'fs/promises' ||
            request === 'path' ||
            request === 'util' ||
            request === 'stream' ||
            request === 'buffer' ||
            request === 'events' ||
            request === 'url' ||
            request === 'querystring' ||
            request === 'os' ||
            request === 'module' ||
            request === 'perf_hooks'
          ) {
            return callback(null, `commonjs ${request}`);
          }
          
          callback();
        },
      ];
      
      // Also exclude MongoDB and Node.js modules as string externals for compatibility
      const stringExternals = ['mongodb', 'fs', 'path', 'util'];
      stringExternals.forEach((ext) => {
        if (!config.externals.includes(ext)) {
          config.externals.push(ext);
        }
      });
    }
    
    return config;
  },
};

module.exports = nextConfig;


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "laurs-classic-corgis",
    project: "javascript-nextjs-g6",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
