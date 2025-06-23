import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

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
        type: 'STATUS',
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
  // Create a new status (story)
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.formData();
    const mediaUrl = data.get('mediaUrl') as string;
    const caption = data.get('caption') as string;
    // Save as type: 'STATUS'
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const post = await prisma.post.create({
      data: {
        content: caption || '',
        mediaUrl,
        userId: user.id,
        type: 'STATUS',
        visibility: 'CONTACTS',
      },
    });
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create status' }, { status: 500 });
  }
}
