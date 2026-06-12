import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  webpack: (config) => {
    // Prevent canvas from being bundled (needed by @react-pdf/renderer)
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

export default withNextIntl(nextConfig);
