import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'i3.ytimg.com',      // YouTube thumbnails
      'i.pravatar.cc',     // Avatar placeholders
      'i.ytimg.com',       // Alternative YouTube domain
      'img.youtube.com',   // Another YouTube domain
      'res.cloudinary.com' // Cloudinary images
    ],
  }
};

export default nextConfig;
