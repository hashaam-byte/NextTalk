import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { StreamVideoClient } from '@stream-io/video-client';

const videoClient = new StreamVideoClient({
  apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY!,
  secret: process.env.STREAM_VIDEO_SECRET!,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { callId, type, callerId } = await request.json();

    // Generate Stream token for the call
    const token = videoClient.createToken(callerId);

    // Notify other participants (using your existing notification system)
    // ...

    return NextResponse.json({ 
      callId,
      token,
      apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY 
    });

  } catch (error) {
    console.error('Call error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
