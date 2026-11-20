/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces a minimal .next/standalone server — much smaller Docker image
  // than copying the whole node_modules tree in.
  output: 'standalone',
  images: {
    domains: [],
  },
};

module.exports = nextConfig;
