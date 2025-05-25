import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { type, receiverId, roomId } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caller = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!caller) {
      return NextResponse.json({ error: 'Caller not found' }, { status: 404 });
    }

    // Create a new call record
    const call = await prisma.call.create({
      data: {
        type,
        status: 'RINGING',
        callerId: caller.id,
        receiverId,
        roomId
      },
      include: {
        caller: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'CALL',
        content: `Incoming ${type} call from ${caller.name}`,
        fromUserId: caller.id,
        callId: call.id
      }
    });

    // Emit socket event for incoming call
    if (global.io) {
      global.io.to(receiverId).emit('call:incoming', {
        callId: call.id,
        type: call.type,
        roomId: call.roomId,
        caller: {
          id: caller.id,
          name: caller.name,
          image: caller.profileImage
        }
      });
    }

    return NextResponse.json({ call });
  } catch (error) {
    console.error('[CALLS_POST]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const calls = await prisma.call.findMany({
      where: {
        OR: [
          { callerId: user.id },
          { receiverId: user.id }
        ]
      },
      include: {
        caller: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ calls });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calls' }, 
      { status: 500 }
    );
  }
}
