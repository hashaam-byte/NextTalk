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

    // Get group info and members
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
    const notificationPromises = group.members
      .filter(member => member.userId !== session.user.id)
      .map(member => 
        prisma.notification.create({
          data: {
            userId: member.userId,
            type: 'GROUP_MESSAGE',
            content: `${session.user.name} sent a message in ${group.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
            senderId: session.user.id,
            groupId: group.id,
            read: false
          }
        })
      );

    await Promise.all(notificationPromises);

    // Emit socket event for real-time updates
    // This assumes you have socket.io set up
    if (global.io) {
      group.members.forEach(member => {
        if (member.userId !== session.user.id) {
          global.io.to(`user_${member.userId}`).emit('notification', {
            type: 'GROUP_MESSAGE',
            groupId: group.id,
            message: {
              sender: session.user.name,
              content: content.substring(0, 50),
              groupName: group.name
            }
          });
        }
      });
    }

    return NextResponse.json({ message, notifications: 'sent' });
  } catch (error) {
    console.error('Error sending group message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
