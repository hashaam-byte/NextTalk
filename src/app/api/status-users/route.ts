import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ statusUsers: [] }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ statusUsers: [] }, { status: 404 });
    }

    // Get all users who have posted a status in the last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        profileImage: true,
        posts: {
          where: { createdAt: { gte: since } },
          select: { id: true, createdAt: true }
        }
      }
    });

    const statusUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      image: u.profileImage,
      hasPostedToday: u.posts.length > 0,
      isCurrentUser: u.id === currentUser.id,
      lastPosted: u.posts.length > 0 ? u.posts[0].createdAt : undefined
    }));

    // Ensure current user is always first
    statusUsers.sort((a, b) => (a.isCurrentUser ? -1 : 1));

    return NextResponse.json({ statusUsers });
  } catch (error) {
    console.error('[STATUS_USERS_GET]', error);
    return NextResponse.json({ statusUsers: [] }, { status: 500 });
  }
}
