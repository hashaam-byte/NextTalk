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

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'trending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const posts = await prisma.topicPost.findMany({
      where: {
        topic: {
          slug: params.topic
        }
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
        ...(filter === 'popular' && { comments: { _count: 'desc' } })
      },
      skip: (page - 1) * limit,
      take: limit
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('[TOPIC_POSTS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { topic: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, mediaUrl } = await req.json();

    const topic = await prisma.topic.findUnique({
      where: { slug: params.topic }
    });

    if (!topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    }

    const post = await prisma.topicPost.create({
      data: {
        title,
        content,
        mediaUrl,
        topic: { connect: { id: topic.id } },
        author: { connect: { email: session.user.email } }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('[TOPIC_POSTS_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
