import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = params;

    // Check if user is a member of the group
    const membership = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id
      }
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const messages = await prisma.groupMessage.findMany({
      where: { groupId },
      include: {
        sender: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { groupId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { groupId } = params;
    const { content } = await req.json();

    // First, get group info and members
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Create the message
    const message = await prisma.groupMessage.create({
      data: {
        content,
        senderId: session.user.id,
        groupId
      },
      include: {
        sender: true
      }
    });

    // Create notifications for all group members except the sender
    const notifications = await Promise.all(
      group.members
        .filter(member => member.userId !== session.user.id)
        .map(member => 
          prisma.notification.create({
            data: {
              type: 'GROUP_MESSAGE',
              content: `${session.user.name} sent a message in ${group.name}`,
              userId: member.userId,
              senderId: session.user.id,
              fromUserId: session.user.id,
              groupId: group.id,
              read: false
            }
          })
        )
    );

    return NextResponse.json({ 
      message,
      notifications: notifications.length 
    });
  } catch (error) {
    console.error('Error sending group message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' }, 
      { status: 500 }
    );
  }
}
