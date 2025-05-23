import { Phone, Video, PhoneOff, PhoneMissed } from 'lucide-react';

interface CallMessageProps {
  type: 'audio' | 'video';
  status: 'ongoing' | 'ended' | 'missed' | 'no-answer';
  callId: string;
  onJoin: (callId: string) => void;
}

export default function CallMessage({ type, status, callId, onJoin }: CallMessageProps) {
  return (
    <div className="flex items-center p-2 rounded-lg bg-gray-800/50 border border-white/10">
      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
        {type === 'video' ? <Video size={20} /> : <Phone size={20} />}
      </div>
      
      <div className="flex-1">
        <p className="text-sm text-white">
          {status === 'ongoing' ? `Ongoing ${type} call` : 
           status === 'missed' ? 'Missed call' :
           status === 'no-answer' ? 'No answer' :
           'Call ended'}
        </p>
        <p className="text-xs text-gray-400">
          Tap to {status === 'ongoing' ? 'join' : 'view details'}
        </p>
      </div>

      {status === 'ongoing' && (
        <button
          onClick={() => onJoin(callId)}
          className="px-4 py-1.5 rounded-full bg-purple-500 text-white text-sm"
        >
          Join
        </button>
      )}
    </div>
  );
}
