/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Allow images from Canvas LMS and common CDN domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.instructure.com',
      },
      {
        protocol: 'https',
        hostname: 'canvas.**.edu',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth avatars
      },
    ],
  },

  // Ensure server-only packages are not bundled for the browser
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma', 'bullmq', 'ioredis', 'twilio'],
  },

  // Redirect /dashboard to require auth (handled by middleware, but noted here)
  async redirects() {
    return [];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
