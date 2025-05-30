import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { StreamVideoClient } from '@stream-io/video-client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      console.log('No authenticated session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, receiverId, chatId } = body;

    // Validate input
    if (!type || !receiverId || !chatId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find current user
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

    // Verify chat exists and both users are participants
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: {
          some: {
            userId: {
              in: [caller.id, receiverId]
            }
          }
        }
      }
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
    }

    // Create call record with transaction
    const call = await prisma.$transaction(async (tx) => {
      // Create call
      const newCall = await tx.call.create({
        data: {
          type,
          status: 'initiated',
          callerId: caller.id,
          receiverId: receiver.id,
          chatId,
          startTime: new Date(),
        }
      });

      // Create notification
      await tx.notification.create({
        data: {
          type: 'CALL',
          content: `Incoming ${type} call`,
          userId: receiver.id,
          senderId: caller.id,
          chatId: chat.id
        }
      });

      return newCall;
    });

    // Initialize Stream call
    const streamClient = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY!,
      token: process.env.STREAM_VIDEO_SECRET!,
      userId: 'server',
    });

    const streamToken = streamClient.createToken(caller.id);

    return NextResponse.json({
      success: true,
      callId: call.id,
      streamToken,
      apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY
    });

  } catch (error) {
    console.error('Call initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate call', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const calls = await prisma.call.findMany({
      where: {
        OR: [
          { callerId: session.user.id },
          { receiverId: session.user.id }
        ]
      },
      include: {
        caller: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
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
