import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
        NOT: {
          email: session.user.email // Exclude current user
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('[USERS_SEARCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
