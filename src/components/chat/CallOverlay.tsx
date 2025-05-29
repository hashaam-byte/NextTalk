'use client';

import { useState, useEffect } from 'react';
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from '@stream-io/video-react-sdk';
import { motion } from 'framer-motion';

interface CallOverlayProps {
  type: 'audio' | 'video';
  callId: string;
  participants: Array<{ id: string; name: string; image?: string }>;
  onEnd: () => void;
}

export default function CallOverlay({
  type,
  callId,
  participants,
  onEnd
}: CallOverlayProps) {
  const [call, setCall] = useState<StreamCall | null>(null);

  useEffect(() => {
    const client = StreamVideoClient.getInstance(
      process.env.NEXT_PUBLIC_STREAM_VIDEO_KEY!
    );

    const initCall = async () => {
      const newCall = client.call('default', callId);
      await newCall.join({ create: true });
      setCall(newCall);
    };

    initCall();

    return () => {
      call?.leave();
    };
  }, [callId]);

  if (!call) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90"
    >
      <StreamVideo call={call}>
        <div className="relative h-full">
          {/* Video Grid */}
          <div className="absolute inset-0">
            {type === 'video' ? (
              <StreamCall.VideoGrid />
            ) : (
              <StreamCall.AudioGrid />
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center space-x-4">
            <StreamCall.ToggleMicrophoneButton />
            {type === 'video' && <StreamCall.ToggleVideoButton />}
            <button
              onClick={onEnd}
              className="p-3 bg-red-500 rounded-full hover:bg-red-600"
            >
              End Call
            </button>
          </div>
        </div>
      </StreamVideo>
    </motion.div>
  );
}
