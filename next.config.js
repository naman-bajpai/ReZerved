/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // These packages use Node.js APIs — keep them out of the edge runtime
    serverComponentsExternalPackages: ['bullmq', 'ioredis', 'twilio', 'openai', 'winston', 'better-auth', '@better-auth/core', '@better-auth/infra', '@better-auth/sso', 'stripe', 'resend', 'jose'],
  },
};

module.exports = nextConfig;
