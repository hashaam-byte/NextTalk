import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, receiverId, roomId } = await req.json();

    // Find caller
    const caller = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!caller) {
      return NextResponse.json({ error: 'Caller not found' }, { status: 404 });
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    // Create call record
    const call = await prisma.call.create({
      data: {
        type,
        status: 'ringing',
        roomId,
        callerId: caller.id,
        receiverId: receiver.id,
        startedAt: new Date(),
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

    // Emit socket event for incoming call
    if (global.io) {
      global.io.to(receiver.id).emit('call:incoming', {
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

    const calls = await prisma.call.findMany({
      where: {
        OR: [
          { caller: { email: session.user.email } },
          { receiver: { email: session.user.email } }
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
        startedAt: 'desc'
      }
    });

    return NextResponse.json({ calls });
  } catch (error) {
    console.error('[CALLS_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
