import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const media = formData.get('media') as File;
    const caption = formData.get('caption') as string;
    const mediaType = formData.get('mediaType') as string;

    // Convert file to base64
    const buffer = await media.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const dataURI = `data:${media.type};base64,${base64String}`;

    // Upload to Cloudinary
    const mediaUrl = await uploadToCloudinary(dataURI);

    // Create post in database
    const post = await prisma.post.create({
      data: {
        caption,
        mediaUrl,
        mediaType: mediaType.toUpperCase(),
        userId: session.user.id,
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
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = 10;

    const posts = await prisma.post.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({
      posts,
      nextCursor: posts[limit - 1]?.id,
    });
  } catch (error) {
    console.error('[POSTS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
