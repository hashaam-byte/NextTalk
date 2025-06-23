import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function deleteExpiredStatuses() {
  const now = new Date();
  const expired = await prisma.post.findMany({
    where: {
      expiresAt: { lte: now },
      visibility: 'CONTACTS',
    },
  });

  for (const post of expired) {
    // Remove from Cloudinary if mediaUrl exists
    if (post.mediaUrl) {
      // Extract public_id from URL
      const match = post.mediaUrl.match(/\/nexttalk_status\/([^\.\/]+)/);
      if (match) {
        try {
          await cloudinary.uploader.destroy(`nexttalk_status/${match[1]}`, {
            resource_type: post.mediaType === 'VIDEO' || post.mediaType === 'AUDIO' ? 'video' : 'image',
          });
        } catch (e) {
          // Ignore errors
        }
      }
    }
    // Remove from DB
    await prisma.post.delete({ where: { id: post.id } });
  }
}

deleteExpiredStatuses().then(() => {
  console.log('Expired statuses deleted');
  process.exit(0);
});
