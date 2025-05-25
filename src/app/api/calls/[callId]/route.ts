import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authConfig';

export async function GET(
  req: Request,
  { params }: { params: { callId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const call = await prisma.call.findUnique({
      where: { id: params.callId },
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
      }
    });

    if (!call) {
      return NextResponse.json({ error: 'Call not found' }, { status: 404 });
    }

    return NextResponse.json({ call });
  } catch (error) {
    console.error('[CALL_GET]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

// Update call status
export async function PATCH(
  req: Request,
  { params }: { params: { callId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();

    const call = await prisma.call.update({
      where: { id: params.callId },
      data: {
        status,
        answeredAt: status === 'ongoing' ? new Date() : undefined,
        endedAt: status === 'ended' ? new Date() : undefined,
      },
      include: {
        caller: true,
        receiver: true
      }
    });

    // Emit socket event
    if (global.io) {
      const targetId = session.user.email === call.caller.email 
        ? call.receiverId 
        : call.callerId;

      global.io.to(targetId).emit('call:status', {
        callId: call.id,
        status,
        timestamp: new Date()
      });
    }

    return NextResponse.json({ call });
  } catch (error) {
    console.error('[CALL_UPDATE]', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
