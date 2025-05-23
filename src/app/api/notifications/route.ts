import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ notifications: [], error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ notifications: [], error: "User not found" }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      include: {
        sender: {
          select: {
            name: true,
            profileImage: true,
          }
        },
        group: {
          select: {
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return NextResponse.json({ notifications: [], error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, callId, receiverId } = await req.json();

    if (type === 'CALL_INCOMING') {
      const call = await prisma.call.findUnique({
        where: { id: callId },
        include: {
          caller: {
            select: {
              name: true,
              image: true
            }
          }
        }
      });

      if (!call) {
        return NextResponse.json({ error: 'Call not found' }, { status: 404 });
      }

      // Create notification
      const notification = await prisma.notification.create({
        data: {
          type: 'CALL_INCOMING',
          content: `${call.caller.name} is calling you`,
          userId: receiverId,
          senderId: call.callerId,
          callId: call.id
        }
      });

      // Emit socket event
      global.io?.to(receiverId).emit('call:incoming', {
        notification,
        call
      });

      return NextResponse.json({ success: true });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { groupId, content, type = 'GROUP_MESSAGE', timestamp } = await req.json();

    // Get group info for notification content
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Get group members excluding the sender
    const groupMembers = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: {
          not: currentUser.id
        }
      }
    });

    // Create notifications for all group members
    const notifications = await Promise.all(
      groupMembers.map(member =>
        prisma.notification.create({
          data: {
            userId: member.userId,
            senderId: currentUser.id,
            fromUserId: currentUser.id,
            groupId,
            type,
            content: `${currentUser.name} sent a message in ${group.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
            createdAt: new Date(timestamp),
            read: false
          }
        })
      )
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('[NOTIFICATIONS_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
