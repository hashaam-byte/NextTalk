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

    const { type, receiverId } = await req.json();

    const call = await prisma.call.create({
      data: {
        type,
        status: 'ONGOING',
        callerId: session.user.id,
        receiverId
      },
      include: {
        caller: true,
        receiver: true
      }
    });

    // Emit socket event for incoming call
    global.io?.to(receiverId).emit('incomingCall', {
      callId: call.id,
      type,
      caller: call.caller
    });

    return NextResponse.json(call);
  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json({ error: 'Failed to initiate call' }, { status: 500 });
  }
}
