import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { StreamChat } from 'stream-chat';
import { authOptions } from '@/lib/authConfig';

// Initialize Stream client
const streamClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY!,
  process.env.STREAM_VIDEO_SECRET!
);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, receiverId, chatId } = body;

    // Verify the receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 });
    }

    // Create call record with transaction
    const call = await prisma.$transaction(async (tx) => {
      // Create call
      const newCall = await tx.call.create({
        data: {
          type,
          status: 'initiated',
          callerId: session.user.id,
          receiverId,
          chatId,
          startTime: new Date(),
        }
      });

      // Create notification
      await tx.notification.create({
        data: {
          type: 'CALL',
          content: `Incoming ${type} call`,
          userId: receiverId,
          senderId: session.user.id,
          chatId: chatId
        }
      });

      return newCall;
    });

    // Generate token using Stream client
    const token = streamClient.createToken(session.user.id);

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
