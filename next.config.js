/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // These packages use Node.js APIs — keep them out of the edge runtime
    serverComponentsExternalPackages: ['bullmq', 'ioredis', 'twilio', 'openai', 'winston'],
  },
};

module.exports = nextConfig;
