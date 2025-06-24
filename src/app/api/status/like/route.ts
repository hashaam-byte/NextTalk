import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { postId } = await req.json();
    if (!postId) return NextResponse.json({ error: 'Missing postId' }, { status: 400 });

    // Upsert like
    await prisma.like.upsert({
      where: { userId_postId: { userId: session.user.id, postId } },
      update: {},
      create: { userId: session.user.id, postId }
    });

    // Count likes
    const likes = await prisma.like.count({ where: { postId } });

    // Emit socket event (if using socket.io on server)
    if (global.io) {
      global.io.emit('status:like', { postId, likes });
    }

    return NextResponse.json({ likes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to like status' }, { status: 500 });
  }
}
