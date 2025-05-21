import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId, content, type = 'GROUP_MESSAGE', timestamp } = await req.json();

    // Get group members excluding sender
    const groupMembers = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: {
          not: session.user.id
        }
      }
    });

    // Create notifications for all group members
    const notifications = await Promise.all(
      groupMembers.map(member =>
        prisma.notification.create({
          data: {
            userId: member.userId,
            senderId: session.user.id,
            groupId,
            type,
            content,
            createdAt: new Date(timestamp),
            read: false
          }
        })
      )
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
