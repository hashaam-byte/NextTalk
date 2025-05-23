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

    // Verify both users exist
    const [caller, receiver] = await Promise.all([
      prisma.user.findUnique({
        where: { email: session.user.email }
      }),
      prisma.user.findUnique({
        where: { id: receiverId }
      })
    ]);

    if (!caller) {
      return NextResponse.json({ error: 'Caller not found' }, { status: 404 });
    }

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    // Check if there's already an active call
    const existingCall = await prisma.call.findFirst({
      where: {
        OR: [
          { 
            AND: [
              { callerId: caller.id },
              { status: 'ONGOING' }
            ]
          },
          {
            AND: [
              { receiverId: caller.id },
              { status: 'ONGOING' }
            ]
          },
          {
            AND: [
              { callerId: receiverId },
              { status: 'ONGOING' }
            ]
          },
          {
            AND: [
              { receiverId: receiverId },
              { status: 'ONGOING' }
            ]
          }
        ]
      }
    });

    if (existingCall) {
      return NextResponse.json(
        { error: 'One of the users is already in a call' }, 
        { status: 400 }
      );
    }

    // Create new call
    const call = await prisma.call.create({
      data: {
        type,
        status: 'RINGING',
        callerId: caller.id,
        receiverId: receiver.id,
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

    // Emit socket event for incoming call
    global.io?.to(receiverId).emit('call:incoming', {
      callId: call.id,
      type: call.type,
      caller: {
        id: call.caller.id,
        name: call.caller.name,
        image: call.caller.profileImage
      },
      roomId: call.roomId
    });

    return NextResponse.json(call);
  } catch (error) {
    console.error('Error initiating call:', error);
    return NextResponse.json(
      { error: 'Failed to initiate call' }, 
      { status: 500 }
    );
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
