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
    const { postId, content, type } = await req.json();
    if (!postId || !content) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    // Save comment (type can be 'text', 'emoji', 'sticker')
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: session.user.id,
        content,
        // Optionally, add a 'type' field to your Comment model if you want to distinguish
      },
      include: {
        user: { select: { id: true, name: true, profileImage: true } }
      }
    });

    // Fetch all comments for this post
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: { user: { select: { id: true, name: true, profileImage: true } } },
      orderBy: { createdAt: 'asc' }
    });

    // Emit socket event
    if (global.io) {
      global.io.emit('status:comment', { postId, comments });
    }

    return NextResponse.json({ comment, comments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to comment on status' }, { status: 500 });
  }
}
