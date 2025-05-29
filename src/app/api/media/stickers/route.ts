import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get trending stickers
    const trendingStickers = await prisma.userMedia.findMany({
      where: { type: 'sticker' },
      orderBy: { useCount: 'desc' },
      take: 20,
    });

    // Get user's stickers
    const userStickers = await prisma.userMedia.findMany({
      where: {
        userId: session.user.id,
        type: 'sticker',
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      trending: trendingStickers,
      userStickers: userStickers
    });

  } catch (error) {
    console.error('Error fetching stickers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stickers' }, 
      { status: 500 }
    );
  }
}
