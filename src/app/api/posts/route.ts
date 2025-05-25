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
    const visibility = formData.get('visibility') as string;
    const viewersIds = formData.get('viewersIds') as string;

    // Convert file to base64
    const buffer = await media.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const dataURI = `data:${media.type};base64,${base64String}`;

    // Upload to Cloudinary
    const mediaUrl = await uploadToCloudinary(dataURI);

    // Create post
    const post = await prisma.post.create({
      data: {
        mediaUrl,
        caption,
        mediaType: media.type.startsWith('video') ? 'VIDEO' : 'IMAGE',
        visibility,
        viewersIds: viewersIds ? JSON.parse(viewersIds) : [],
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
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
          { visibility: 'CONTACTS', userId: { in: user.contacts.map(c => c.id) } },
          { visibility: 'PRIVATE', viewersIds: { has: user.id } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
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
