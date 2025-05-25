'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, X, Mic, MicOff, Camera, CameraOff } from 'lucide-react';

interface CallHandlerProps {
  callId: string;
  type: 'audio' | 'video';
  caller: {
    id: string;
    name: string;
    image?: string;
  };
  isIncoming?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd?: () => void;
}

export default function CallHandler({
  callId,
  type,
  caller,
  isIncoming,
  onAccept,
  onDecline,
  onEnd
}: CallHandlerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState<'ringing' | 'ongoing' | 'ended'>('ringing');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'ongoing') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
    >
      <div className="text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 mx-auto mb-6 flex items-center justify-center">
          {type === 'video' ? <Video size={40} /> : <Phone size={40} />}
        </div>
        
        <h2 className="text-2xl font-bold text-white">{caller.name}</h2>
        <p className="text-gray-400">
          {status === 'ringing' 
            ? isIncoming ? 'Incoming call...' : 'Calling...'
            : formatDuration(callDuration)
          }
        </p>

        <div className="flex justify-center space-x-6 mt-8">
          {status === 'ringing' ? (
            isIncoming ? (
              <>
                <button
                  onClick={onAccept}
                  className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                >
                  {type === 'video' ? <Video size={24} /> : <Phone size={24} />}
                </button>
                <button
                  onClick={onDecline}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </>
            ) : (
              <button
                onClick={onEnd}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              >
                <X size={24} />
              </button>
            )
          ) : (
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              {type === 'video' && (
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isVideoOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isVideoOff ? <CameraOff size={20} /> : <Camera size={20} />}
                </button>
              )}
              <button
                onClick={onEnd}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              >
                <X size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
