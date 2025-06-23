import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function GET() {
  // Fetch all reels (public posts)
  try {
    const reels = await prisma.post.findMany({
      where: { visibility: 'PUBLIC' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, profileImage: true } },
        likes: true,
        comments: true,
      },
    });
    return NextResponse.json({ reels });
  } catch (error) {
    return NextResponse.json({ reels: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Create a new reel (public post)
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.formData();
    const mediaUrl = data.get('mediaUrl') as string;
    const caption = data.get('caption') as string;
    const mediaType = data.get('mediaType') as string;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const post = await prisma.post.create({
      data: {
        content: caption || '',
        mediaUrl,
        userId: user.id,
        visibility: 'PUBLIC',
        // Optionally, add mediaType if you want to store it
      },
    });
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create reel' }, { status: 500 });
  }
}
