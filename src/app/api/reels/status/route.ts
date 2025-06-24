import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  try {
    if (userId) {
      // Fetch all statuses for a user, including analytics
      const posts = await prisma.post.findMany({
        where: {
          userId,
          visibility: 'CONTACTS',
          expiresAt: { gt: new Date() }
        },
        include: {
          likes: true,
          comments: true,
          user: { select: { id: true, name: true, profileImage: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ posts });
    } else {
      // Fetch statuses (stories) from contacts only
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ statuses: [] }, { status: 401 });
      }
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { contacts: true },
      });
      if (!user) return NextResponse.json({ statuses: [] }, { status: 404 });

      const contactIds = user.contacts.map(c => c.id);

      const statuses = await prisma.post.findMany({
        where: {
          visibility: 'CONTACTS',
          userId: { in: contactIds },
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, profileImage: true } },
          likes: true,
          comments: true,
        },
      });
      return NextResponse.json({ statuses });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch statuses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.formData();
    const mediaType = data.get('mediaType') as string | undefined;
    const caption = data.get('caption') as string | undefined;
    const textContent = data.get('textContent') as string | undefined;
    const textStyle = data.get('textStyle') as string | undefined;
    const backgroundColor = data.get('backgroundColor') as string | undefined;
    const locationName = data.get('locationName') as string | undefined;
    const locationLat = data.get('locationLat') ? parseFloat(data.get('locationLat') as string) : undefined;
    const locationLng = data.get('locationLng') ? parseFloat(data.get('locationLng') as string) : undefined;
    let mediaUrl: string | null = null;

    // Handle media upload if present
    const file = data.get('media') as File | null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;
      const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
        folder: 'nexttalk_status',
        resource_type: file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'video' : 'image',
      });
      mediaUrl = uploadResponse.secure_url;
    } else if (data.get('mediaUrl')) {
      mediaUrl = data.get('mediaUrl') as string;
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Set expiry 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Save status as a Post with CONTACTS visibility and expiry
    const post = await prisma.post.create({
      data: {
        mediaUrl,
        content: caption || '',
        mediaType: mediaType?.toUpperCase(),
        textContent,
        textStyle: textStyle ? JSON.parse(textStyle) : undefined,
        backgroundColor,
        locationName,
        locationLat,
        locationLng,
        visibility: 'CONTACTS',
        userId: user.id,
        expiresAt,
      },
      include: {
        likes: true,
        comments: true,
        user: { select: { id: true, name: true, profileImage: true } }
      }
    });

    // Emit real-time event if needed (if using socket.io on server)
    if (global.io) {
      global.io.emit('new:status');
    }

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create status' }, { status: 500 });
  }
}
