import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';
import Image from 'next/image';

interface CallOverlayProps {
  type: 'audio' | 'video';
  callState: 'outgoing' | 'incoming' | 'connected';
  caller: {
    id: string;
    name: string;
    image?: string;
  };
  duration?: number;
  onAnswer?: () => void;
  onDecline?: () => void;
  onEndCall?: () => void;
  onToggleVideo?: () => void;
  onToggleMute?: () => void;
}

export default function CallOverlay({
  type,
  callState,
  caller,
  duration,
  onAnswer,
  onDecline,
  onEndCall,
  onToggleVideo,
  onToggleMute
}: CallOverlayProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [formattedDuration, setFormattedDuration] = useState('00:00');

  useEffect(() => {
    if (duration && callState === 'connected') {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      setFormattedDuration(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }
  }, [duration, callState]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Caller Info */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 bg-gradient-to-br from-purple-600/30 to-cyan-600/30 p-0.5">
          <div className="w-full h-full rounded-full overflow-hidden bg-black">
            {caller.image ? (
              <Image
                src={caller.image}
                alt={caller.name}
                width={96}
                height={96}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                {caller.name[0]}
              </div>
            )}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{caller.name}</h3>
        <p className="text-gray-400">
          {callState === 'incoming' && 'Incoming call...'}
          {callState === 'outgoing' && 'Calling...'}
          {callState === 'connected' && formattedDuration}
        </p>
      </div>

      {/* Call Controls */}
      <div className="flex items-center space-x-6">
        {callState === 'incoming' ? (
          <>
            {/* Incoming Call Controls */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDecline}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30"
            >
              <PhoneOff size={24} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onAnswer}
              className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30"
            >
              {type === 'video' ? <Video size={24} /> : <Phone size={24} />}
            </motion.button>
          </>
        ) : (
          <>
            {/* Active Call Controls */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIsMuted(!isMuted);
                onToggleMute?.();
              }}
              className={`w-14 h-14 rounded-full ${
                isMuted ? 'bg-red-500' : 'bg-gray-700'
              } flex items-center justify-center text-white`}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </motion.button>

            {type === 'video' && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setIsVideoOff(!isVideoOff);
                  onToggleVideo?.();
                }}
                className={`w-14 h-14 rounded-full ${
                  isVideoOff ? 'bg-red-500' : 'bg-gray-700'
                } flex items-center justify-center text-white`}
              >
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onEndCall}
              className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30"
            >
              <PhoneOff size={20} />
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}
