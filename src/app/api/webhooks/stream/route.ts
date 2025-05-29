import { NextRequest, NextResponse } from 'next/server';
import { StreamVideoClient } from '@stream-io/video-client';

const videoClient = new StreamVideoClient({
  apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY!,
  secret: process.env.STREAM_VIDEO_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    // Get the raw body and headers
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature');

    // Verify webhook signature
    if (!signature || !videoClient.verifyWebhook(rawBody, signature)) {
      return new Response('Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { type } = payload;

    // Handle different webhook events
    switch (type) {
      case 'call.live_started':
        await handleCallStarted(payload);
        break;
      
      case 'call.ended':
        await handleCallEnded(payload);
        break;
      
      case 'call.participant_joined':
        await handleParticipantJoined(payload);
        break;
      
      case 'call.participant_left':
        await handleParticipantLeft(payload);
        break;

      default:
        console.log('Unhandled webhook event:', type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 500 });
  }
}

// Webhook event handlers
async function handleCallStarted(payload: any) {
  const { call } = payload;
  console.log('Call started:', call.id);
  // Add your call start logic here
}

async function handleCallEnded(payload: any) {
  const { call } = payload;
  console.log('Call ended:', call.id);
  // Add your call end logic here
}

async function handleParticipantJoined(payload: any) {
  const { call, participant } = payload;
  console.log('Participant joined:', participant.id, 'in call:', call.id);
  // Add your participant joined logic here
}

async function handleParticipantLeft(payload: any) {
  const { call, participant } = payload;
  console.log('Participant left:', participant.id, 'in call:', call.id);
  // Add your participant left logic here
}
