import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function GET(
  req: Request,
  { params }: { params: { topic: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topic } = params;
    const searchParams = new URL(req.url).searchParams;
    const filter = searchParams.get('filter') || 'trending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const posts = await prisma.post.findMany({
      where: {
        topic: topic.toLowerCase(),
        published: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        ...(filter === 'trending' && { likes: { _count: 'desc' } }),
        ...(filter === 'recent' && { createdAt: 'desc' }),
        ...(filter === 'popular' && { views: 'desc' })
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('[TOPIC_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
