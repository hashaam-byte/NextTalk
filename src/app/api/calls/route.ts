import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authConfig';
import { prisma } from '@/lib/prisma';
import { StreamVideoClient } from '@stream-io/video-client';

export async function POST(request: Request) {
  try {
    // Get session with authOptions
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('Session:', session);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      console.log('User not found for email:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { type, receiverId, chatId } = body;

    // Validate required fields
    if (!type || !receiverId || !chatId) {
      console.log('Missing fields:', { type, receiverId, chatId });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create call using transaction
    const call = await prisma.$transaction(async (tx) => {
      // Create call record
      const newCall = await tx.call.create({
        data: {
          type,
          status: 'initiated',
          callerId: user.id,
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
          senderId: user.id,
          chatId
        }
      });

      return newCall;
    });

    // Initialize Stream Video client
    const streamClient = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY!,
      token: process.env.STREAM_VIDEO_SECRET!,
      userId: user.id,
    });

    const streamToken = streamClient.createToken(user.id);

    return NextResponse.json({
      success: true,
      callId: call.id,
      streamToken,
      apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY
    });

  } catch (error: any) {
    console.error('Call initiation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate call', 
        details: error.message,
        code: error.code 
      }, 
      { status: error.code === 'P2025' ? 404 : 500 }
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
