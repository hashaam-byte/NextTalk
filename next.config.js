/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    missingSuspenseWithCSRError: false
  },
  images: {
    domains: [
      'localhost',
      'res.cloudinary.com',
      'i3.ytimg.com',
      'i.pravatar.cc'
    ]
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'canvas', 'jsdom'];
    return config;
  },
  generateBuildId: async () => {
    // Generate a unique build ID
    return 'nexttalk-' + Date.now();
  },
  // Add this to force routes manifest generation
  async rewrites() {
    return [];
  }
};

module.exports = nextConfig;
