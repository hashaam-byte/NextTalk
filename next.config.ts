import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'i3.ytimg.com',        // YouTube thumbnails
      'i.pravatar.cc',       // Avatar placeholders
      'i.ytimg.com',         // Alternative YouTube domain
      'img.youtube.com',     // Another YouTube domain
      'res.cloudinary.com',  // Cloudinary images
      'cdn.myanimelist.net', // MyAnimeList images
      'api.jikan.moe',       // Jikan API images
      'media.kitsu.io',      // Kitsu API images
      'artworks.thetvdb.com', // TVDB images
      'image.tmdb.org',      // TMDB images
      'images.unsplash.com', // Unsplash images
      'avatars.githubusercontent.com', // GitHub avatars
      'picsum.photos',       // Lorem Picsum
      'storage.googleapis.com', // Google Cloud Storage
      'lh3.googleusercontent.com' // Google user avatars
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
  }
};

export default nextConfig;
