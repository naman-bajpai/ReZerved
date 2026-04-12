/** @type {import('next').NextConfig} */

/**
 * EMBED_ALLOWED_ORIGINS — comma-separated list of allowed frame ancestors.
 * Defaults to '*' (any origin) for MVP. Set in .env to restrict:
 *   EMBED_ALLOWED_ORIGINS=https://myclient.com,https://studio.squarespace.com
 */
const embedFrameAncestors = process.env.EMBED_ALLOWED_ORIGINS
  ? process.env.EMBED_ALLOWED_ORIGINS.split(',').map((o) => o.trim()).join(' ')
  : '*';

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // These packages use Node.js APIs — keep them out of the edge runtime
    serverComponentsExternalPackages: ['bullmq', 'ioredis', 'twilio', 'openai', 'winston', 'better-auth', '@better-auth/core', '@better-auth/infra', '@better-auth/sso', 'stripe', 'resend', 'jose'],
  },

  async headers() {
    return [
      {
        // Allow /embed/* pages to be framed by any origin (or configured origins).
        // X-Frame-Options is kept for older browsers; CSP frame-ancestors takes
        // precedence in modern browsers and overrides it.
        source: '/embed/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors ${embedFrameAncestors}`,
          },
          {
            // Legacy: Chrome 4–79 and some older proxies respect this.
            // ALLOWALL is non-standard but widely supported as "allow all origins".
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
