import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';  // Fixed import
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';  // Make sure this path is correct

export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
                status: true,
                lastSeen: true
              }
            }
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
