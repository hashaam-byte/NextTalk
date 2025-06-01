import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const topics = await prisma.topic.findMany({
      include: {
        _count: {
          select: {
            posts: true,
            followers: true
          }
        }
      }
    });

    return NextResponse.json({ topics });
  } catch (error) {
    console.error('[TOPICS_GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
