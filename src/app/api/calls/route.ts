import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { prisma } from '@/lib/prisma';
import { StreamVideoClient } from '@stream-io/video-client';

// Initialize Stream Video client
const streamVideo = new StreamVideoClient({
  apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY!,
  token: process.env.STREAM_VIDEO_SECRET!,
  userId: 'server',
});

export async function POST(request: Request) {
  try {
    // Get session with auth options
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.error('Unauthorized: No session or email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.error('User not found:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { type, receiverId, chatId } = body;

    if (!type || !receiverId || !chatId) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Create call record
    const call = await prisma.call.create({
      data: {
        type,
        status: 'initiated',
        callerId: user.id,
        receiverId,
        chatId,
        startTime: new Date(),
      }
    });

    // Generate Stream call token
    const token = streamVideo.createToken(user.id);

    // Create notification
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'CALL',
        content: `Incoming ${type} call`,
        senderId: user.id,
      }
    });

    return NextResponse.json({
      success: true,
      callId: call.id,
      token,
      apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY
    });

  } catch (error) {
    console.error('Call initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate call' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
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
