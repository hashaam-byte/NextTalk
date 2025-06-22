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
      'static.wikia.nocookie.net',
      'media.rawg.io',
      'callofduty.com',
      'www.callofduty.com',
      'cdn.pubgmobile.com',
      'dreamleaguesoccer.dlsgame.com',
      'media.contentapi.ea.com',
      'static-cdn.jtvnw.net',
      'assets-prd.ignimgs.com',
      'cdn.cloudflare.steamstatic.com',
      'pbs.twimg.com',
      'play-lh.googleusercontent.com',
      'ff.garena.com',           // For Free Fire logo
      'www.blood-strike.com',   // For Blood Strike logo
      'pubg.com',               // For PUBG logo
      'www.ftgames.com'         // For Dream League Soccer logo
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
