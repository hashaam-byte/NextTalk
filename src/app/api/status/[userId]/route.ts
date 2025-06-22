import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        profileImage: true
      }
    });

    if (!user) {
      return NextResponse.json({ user: null, statusPosts: [] }, { status: 404 });
    }

    // Get posts from last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const posts = await prisma.post.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: since }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        likes: true,
        // Add more relations as needed (e.g., viewedBy, comments)
      }
    });

    // Map posts to expected frontend structure
    const statusPosts = posts.map(post => ({
      id: post.id,
      mediaUrl: post.mediaUrl,
      mediaType: post.mediaUrl?.endsWith('.mp4') ? 'VIDEO' : 'IMAGE', // Adjust as needed
      caption: post.content,
      createdAt: post.createdAt,
      expiresAt: new Date(post.createdAt.getTime() + 24 * 60 * 60 * 1000),
      likes: post.likes.length,
      viewedBy: [], // Implement if you track views
      likedBy: post.likes.map(like => ({ id: like.userId })),
      // Add textContent, backgroundColor, location, etc. if you support them
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        image: user.profileImage,
        isCurrentUser: false // Set true if session user matches
      },
      statusPosts
    });
  } catch (error) {
    console.error('[STATUS_USER_GET]', error);
    return NextResponse.json({ user: null, statusPosts: [] }, { status: 500 });
  }
}
