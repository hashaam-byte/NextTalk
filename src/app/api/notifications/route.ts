import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';
import { compare } from 'bcryptjs';

export async function GET(req: Request) {
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

    if (user.notificationPassword) {
      const pin = req.headers.get('x-notification-pin');
      if (!pin) {
        return NextResponse.json({ notifications: [], error: "Notifications locked. PIN required." }, { status: 401 });
      }
      const isValid = await compare(pin, user.notificationPassword);
      if (!isValid) {
        return NextResponse.json({ notifications: [], error: "Invalid PIN" }, { status: 403 });
      }
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

    const requestData = await req.json();
    const { recipientId, notificationType, callId } = requestData;

    // Handle call notifications
    if (notificationType === 'CALL_INCOMING') {
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
          userId: recipientId,
          senderId: call.callerId,
          callId: call.id
        }
      });

      // Emit socket event
      global.io?.to(recipientId).emit('call:incoming', {
        notification,
        call
      });

      return NextResponse.json({ success: true });
    }

    // Handle group message notifications
    if (notificationType === 'GROUP_MESSAGE') {
      const { groupId, content, timestamp } = requestData;
      
      // Get group info for notification content
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          members: true
        }
      });

      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }

      // Create notifications for all group members except sender
      const notifications = await Promise.all(
        group.members
          .filter(member => member.id !== session.user.id)
          .map(member =>
            prisma.notification.create({
              data: {
                type: 'GROUP_MESSAGE',
                content: `New message in ${group.name}: ${content}`,
                userId: member.id,
                senderId: session.user.id,
                groupId
              }
            })
          )
      );

      // Emit socket events to all members
      group.members.forEach(member => {
        if (member.id !== session.user.id) {
          global.io?.to(member.id).emit('notification:new', {
            type: 'GROUP_MESSAGE',
            content: `New message in ${group.name}`,
            sender: session.user,
            groupId,
            timestamp
          });
        }
      });

      return NextResponse.json({ success: true });
    }

    // Handle regular message notifications
    const notification = await prisma.notification.create({
      data: {
        type: notificationType,
        content: requestData.content,
        userId: recipientId,
        senderId: session.user.id
      }
    });

    // Emit socket event
    global.io?.to(recipientId).emit('notification:new', notification);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[NOTIFICATIONS_POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- AI Assistant Notification Helper (for real-time AI suggestions) ---
export async function GET_AI_SUGGESTIONS(userId: string) {
  // Example: Fetch AI suggestions for a user from the database
  // You can adjust this logic as needed for your schema
  try {
    const suggestions = await prisma.aiSuggestion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    return suggestions;
  } catch (error) {
    return [];
  }
}

// --- Real-time AI suggestion event emitter (for use in POST if needed) ---
export async function emitAISuggestion(userId: string) {
  const suggestions = await GET_AI_SUGGESTIONS(userId);
  global.io?.to(userId).emit('ai:suggestion', { suggestions });
}
