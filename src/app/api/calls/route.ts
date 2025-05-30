import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { StreamVideoClient } from '@stream-io/video-client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, type } = await request.json();

    // Validate required fields
    if (!chatId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get chat participants to find the receiver
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Find caller and receiver from chat participants
    const caller = chat.participants.find(p => p.user.email === session.user.email);
    const receiver = chat.participants.find(p => p.user.email !== session.user.email);

    if (!caller || !receiver) {
      return NextResponse.json({ error: 'Invalid chat participants' }, { status: 400 });
    }

    // Create call using transaction
    const call = await prisma.$transaction(async (tx) => {
      // Create the call
      const newCall = await tx.call.create({
        data: {
          type,
          status: 'initiated',
          callerId: caller.userId,
          receiverId: receiver.userId,
          chatId: chat.id,
          startTime: new Date(),
        }
      });

      // Create notification for receiver
      await tx.notification.create({
        data: {
          type: 'CALL',
          content: `Incoming ${type} call`,
          userId: receiver.userId,
          senderId: caller.userId,
          chatId: chat.id,
        }
      });

      return newCall;
    });

    // Initialize Stream call
    const streamClient = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY!,
      token: process.env.STREAM_VIDEO_SECRET!,
      userId: caller.userId,
    });

    const token = streamClient.createToken(caller.userId);

    return NextResponse.json({
      success: true,
      callId: call.id,
      token,
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
