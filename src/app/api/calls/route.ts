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

    // Check if there's already an active call
    const existingCall = await prisma.call.findFirst({
      where: {
        OR: [
          { callerId: session.user.id, status: 'ONGOING' },
          { receiverId: session.user.id, status: 'ONGOING' },
          { callerId: receiverId, status: 'ONGOING' },
          { receiverId: receiverId, status: 'ONGOING' }
        ]
      }
    });

    if (existingCall) {
      return NextResponse.json({ error: 'User is in another call' }, { status: 400 });
    }

    // Create new call
    const call = await prisma.call.create({
      data: {
        type,
        status: 'RINGING',
        callerId: session.user.id,
        receiverId,
        roomId
      },
      include: {
        caller: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Emit socket event for incoming call
    global.io?.to(receiverId).emit('call:incoming', {
      callId: call.id,
      type: call.type,
      caller: call.caller,
      roomId: call.roomId
    });

    return NextResponse.json(call);
  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json({ error: 'Failed to initiate call' }, { status: 500 });
  }
}
