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

export async function GET() {
  // Fetch statuses (stories) from contacts only
  try {
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
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const statuses = await prisma.post.findMany({
      where: {
        visibility: 'CONTACTS',
        userId: { in: contactIds },
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        likes: true,
        comments: true,
      },
    });
    return NextResponse.json({ statuses });
  } catch (error) {
    return NextResponse.json({ statuses: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.formData();
    const mediaType = data.get('mediaType') as string;
    const caption = data.get('caption') as string;
    const textContent = data.get('textContent') as string;
    const textStyle = data.get('textStyle') as string;
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
        mediaType: mediaType?.toUpperCase() || 'IMAGE',
        visibility: 'CONTACTS',
        userId: user.id,
        textContent: textContent || undefined,
        textStyle: textStyle || undefined,
        expiresAt,
      },
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
