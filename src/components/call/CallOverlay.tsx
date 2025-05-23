import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';

interface CallOverlayProps {
  type: 'audio' | 'video';
  callerName: string;
  callerImage?: string;
  isIncoming: boolean;
  onAnswer: (withVideo: boolean) => void;
  onDecline: () => void;
  onEnd: () => void;
}

export default function CallOverlay({
  type,
  callerName,
  callerImage,
  isIncoming,
  onAnswer,
  onDecline,
  onEnd
}: CallOverlayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isIncoming) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isIncoming]);

  useEffect(() => {
    // Start camera for outgoing video calls
    if (type === 'video' && !isIncoming) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error('Error accessing camera:', err));
    }

    // Play ringtone
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.error('Error playing ringtone:', err));
    }

    return () => {
      // Cleanup camera stream
      if (localVideoRef.current?.srcObject) {
        const tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [type, isIncoming]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl">
      {/* Ringtone audio */}
      <audio
        ref={audioRef}
        src="/sounds/ringtone.mp3"
        loop
        hidden
      />

      <div className="flex flex-col items-center justify-center h-full">
        {type === 'video' && !isIncoming && (
          <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden mb-8 bg-gray-900">
            {/* Local video preview */}
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Remote video (when connected) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              hidden={isRinging}
            />

            {/* Local video pip */}
            <div className="absolute bottom-4 right-4 w-48 aspect-video rounded-xl overflow-hidden border-2 border-white/20 bg-black/50">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Caller Info */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white/20">
            {callerImage ? (
              <img src={callerImage} alt={callerName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-4xl text-white">
                {callerName[0]}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{callerName}</h2>
          {isIncoming ? (
            <p className="text-red-400 animate-pulse">Incoming {type} call...</p>
          ) : (
            <p className="text-gray-400">{formatDuration(callDuration)}</p>
          )}
        </motion.div>

        {/* Call Controls */}
        <div className="flex items-center space-x-6">
          {isIncoming ? (
            // Incoming call controls
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onAnswer(type === 'video')}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/50"
              >
                {type === 'video' ? <Video size={24} /> : <Phone size={24} />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onDecline}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/50"
              >
                <PhoneOff size={24} />
              </motion.button>
            </>
          ) : (
            // Active call controls
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full ${
                  isMuted ? 'bg-red-500' : 'bg-white/10'
                } flex items-center justify-center text-white`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </motion.button>

              {type === 'video' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`w-12 h-12 rounded-full ${
                    isVideoOff ? 'bg-red-500' : 'bg-white/10'
                  } flex items-center justify-center text-white`}
                >
                  {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEnd}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/50"
              >
                <PhoneOff size={24} />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
