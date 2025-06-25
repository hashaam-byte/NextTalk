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
    if (!postId) {
      return NextResponse.json({ error: 'Missing postId' }, { status: 400 });
    }

    // Fetch the post and its viewedBy field
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { viewedBy: true, userId: true }
    });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Do not count the owner as a viewer
    if (session.user.id === post.userId) {
      return NextResponse.json({ ok: true });
    }

    // Prepare the new viewer object
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, profileImage: true }
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse viewedBy, ensure it's an array
    let viewedBy = Array.isArray(post.viewedBy) ? post.viewedBy : [];
    // Only add if not already present
    if (!viewedBy.some((v: any) => v.id === user.id)) {
      viewedBy.push({
        id: user.id,
        name: user.name,
        image: user.profileImage,
        viewedAt: new Date()
      });
      await prisma.post.update({
        where: { id: postId },
        data: { viewedBy }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark as viewed' }, { status: 500 });
  }
}
