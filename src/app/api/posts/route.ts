import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('media') as File;
    const caption = formData.get('caption') as string;
    const visibility = formData.get('visibility') as string;
    const viewersIds = formData.get('viewersIds') as string;

    if (!file) {
      return NextResponse.json({ error: 'No media file provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: 'nexttalk_posts',
    });

    // Create post with Cloudinary URL
    const post = await prisma.post.create({
      data: {
        mediaUrl: uploadResponse.secure_url,
        caption: caption || null,
        mediaType: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        visibility: visibility || 'public',
        viewersIds: viewersIds ? JSON.parse(viewersIds) : [],
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit('new:post', post);
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('[POSTS_POST]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, contacts: { select: { id: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { visibility: 'PUBLIC' },
          {
            visibility: 'CONTACTS',
            userId: { in: user.contacts.map(c => c.id) }
          },
          {
            visibility: 'PRIVATE',
            viewersIds: { has: user.id }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,  // Changed from image to profileImage
          }
        },
        _count: {
          select: { likes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('[POSTS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
