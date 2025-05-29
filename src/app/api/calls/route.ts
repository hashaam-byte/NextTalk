import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { StreamVideoClient } from '@stream-io/video-client';

// Initialize Stream Video client with server configuration
const streamVideo = new StreamVideoClient({
  apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY!,
  secret: process.env.STREAM_VIDEO_SECRET!,
  userId: 'server', // Server-side user ID
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, receiverId, chatId } = await request.json();

    // Create call record
    const call = await prisma.call.create({
      data: {
        type,
        status: 'initiated',
        callerId: session.user.id,
        receiverId,
        chatId,
      }
    });

    // Generate Stream call token for the user
    const token = streamVideo.createToken(session.user.id);

    // Create notification
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'CALL',
        content: `Incoming ${type} call`,
        senderId: session.user.id,
        chatId,
      }
    });

    return NextResponse.json({ 
      callId: call.id,
      token,
      apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY
    });

  } catch (error) {
    console.error('Call error:', error);
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
