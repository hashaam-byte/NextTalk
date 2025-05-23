import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';

interface CallOverlayProps {
  type: 'audio' | 'video';
  callerName: string;
  callerImage?: string;
  isIncoming: boolean;
  callStatus: 'ringing' | 'ongoing' | 'ended' | 'missed' | 'no-answer';
  onAnswer: (withVideo: boolean) => void;
  onDecline: () => void;
  onEnd: () => void;
  startTime?: Date;
}

export default function CallOverlay({
  type,
  callerName,
  callerImage,
  isIncoming,
  callStatus,
  onAnswer,
  onDecline,
  onEnd,
  startTime
}: CallOverlayProps) {
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Only start playing ringtone if call is ringing
    if (callStatus === 'ringing' && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [callStatus]);

  useEffect(() => {
    // Only start timer if call is ongoing
    if (callStatus === 'ongoing' && startTime) {
      const interval = setInterval(() => {
        const duration = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setCallDuration(duration);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callStatus, startTime]);

  useEffect(() => {
    // Handle video preview for outgoing video calls
    if (type === 'video' && !isIncoming) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(console.error);
    }

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [type, isIncoming]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderCallStatus = () => {
    switch (callStatus) {
      case 'ringing':
        return isIncoming ? 'Incoming call...' : 'Ringing...';
      case 'ongoing':
        return formatDuration(callDuration);
      case 'ended':
        return 'Call ended';
      case 'missed':
        return 'Missed call';
      case 'no-answer':
        return 'No answer';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl">
      <audio
        ref={audioRef}
        src="/sounds/ringtone.mp3"
        loop
        hidden
      />

      {type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Local video preview */}
          {localStream && (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="absolute top-4 right-4 w-32 h-48 object-cover rounded-lg border border-white/20"
            />
          )}
          
          {/* Remote video (when connected) */}
          {remoteStream && callStatus === 'ongoing' && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Call UI */}
      <div className="absolute bottom-0 inset-x-0 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{callerName}</h2>
          <p className="text-purple-400">{renderCallStatus()}</p>
        </div>

        <div className="flex justify-center space-x-6">
          {callStatus === 'ringing' && isIncoming ? (
            <>
              <button
                onClick={() => onAnswer(type === 'video')}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white"
              >
                {type === 'video' ? <Video size={24} /> : <Phone size={24} />}
              </button>
              <button
                onClick={onDecline}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white"
              >
                <PhoneOff size={24} />
              </button>
            </>
          ) : callStatus === 'ongoing' ? (
            <button
              onClick={onEnd}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white"
            >
              <PhoneOff size={24} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
