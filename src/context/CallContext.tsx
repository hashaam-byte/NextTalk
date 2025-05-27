'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { webRTCConfig } from '@/config/webrtc';

interface CallState {
  isInCall: boolean;
  callId: string | null;
  peer: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callType: 'audio' | 'video' | null;
  callStatus: 'ringing' | 'connecting' | 'connected' | 'ended' | null;
  error: string | null;
}

const CallContext = createContext<{
  state: CallState;
  startCall: (recipientId: string, type: 'audio' | 'video') => Promise<void>;
  answerCall: (callId: string) => Promise<void>;
  endCall: () => void;
} | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket();
  const [state, dispatch] = useReducer(callReducer, initialState);

  // ... implement call logic here

  return (
    <CallContext.Provider value={{
      state,
      startCall,
      answerCall,
      endCall
    }}>
      {children}
    </CallContext.Provider>
  );
}

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
