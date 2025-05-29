import { StreamChat } from 'stream-chat';
import { StreamVideoClient } from '@stream-io/video-client';

export const streamClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_KEY!
);

export const videoClient = new StreamVideoClient({
  apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY!,
  token: undefined, // Will be set after user authentication
  userData: undefined, // Will be set after user authentication
});
