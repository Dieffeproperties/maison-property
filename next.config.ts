import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// ─── Security Headers (Blue Team — OWASP A05) ─────────────────────────────────
// Applied globally; tightened further for /admin and /api routes.

const CSP = [
  "default-src 'self'",
  // Next.js requires unsafe-eval in dev; unsafe-inline required by Tailwind v4 / framer-motion
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // blob: needed by @react-pdf/renderer canvas; data: for base64 images in PDF
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // blob:/worker-src needed by PDF worker
  "worker-src 'self' blob:",
  "frame-src 'self' blob:",
  // Allow Supabase API calls; Anthropic is server-side only (no client fetch needed)
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Prevent this page from being embedded in any iframe
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

const GLOBAL_HEADERS = [
  // Enforce HTTPS for 2 years; include subdomains; opt into HSTS preload list
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Prevent browsers from MIME-sniffing away from declared Content-Type
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block this page from being embedded in iframes (clickjacking protection)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Control referrer information sent to third parties
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict browser feature access
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()' },
  // Content Security Policy
  { key: 'Content-Security-Policy', value: CSP },
  // Remove server fingerprinting
  { key: 'X-Powered-By', value: '' }, // overrides the Next.js default
];

const API_HEADERS = [
  // No caching of API responses (prevents sensitive data in browser/proxy cache)
  { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
  { key: 'Pragma', value: 'no-cache' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Prevent API routes from being indexed
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
];

const ADMIN_HEADERS = [
  // Tighten CSP for admin: no need for external connect
  { key: 'Cache-Control', value: 'no-store, private' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
];

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
  async headers() {
    return [
      // Apply to all routes
      {
        source: '/(.*)',
        headers: GLOBAL_HEADERS,
      },
      // Extra lockdown for API routes
      {
        source: '/api/(.*)',
        headers: API_HEADERS,
      },
      // Extra lockdown for admin area
      {
        source: '/admin-immobiliare(.*)',
        headers: ADMIN_HEADERS,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
