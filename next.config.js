/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    domains: [
      'localhost',
      'res.cloudinary.com',
      'i3.ytimg.com',
      'i.pravatar.cc',
      'cdn.myanimelist.net',
      'api.jikan.moe',
      'media.kitsu.io',
      'cdn.anilist.co',
      'artworks.thetvdb.com',
      'image.tmdb.org',
      'images.unsplash.com',
      'avatars.githubusercontent.com',
      'media.kitsu.app',
      'static.wikia.nocookie.net'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.myanimelist.net',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      }
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
