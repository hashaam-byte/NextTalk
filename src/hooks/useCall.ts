import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { WebRTCService } from '@/services/WebRTCService';

interface CallState {
  isInCall: boolean;
  callType: 'audio' | 'video' | null;
  callState: 'outgoing' | 'incoming' | 'connected' | null;
  caller: {
    id: string;
    name: string;
    image?: string;
  } | null;
  duration: number;
}

export const useCall = (socket: Socket | null) => {
  const [webRTC, setWebRTC] = useState<WebRTCService | null>(null);
  const [callState, setCallState] = useState<CallState>({
    isInCall: false,
    callType: null,
    callState: null,
    caller: null,
    duration: 0
  });

  useEffect(() => {
    if (socket) {
      const rtcService = new WebRTCService(socket);
      setWebRTC(rtcService);
    }
  }, [socket]);

  const initializeCall = useCallback(async (recipientId: string, type: 'audio' | 'video') => {
    if (!webRTC || !socket) return;

    try {
      await webRTC.startLocalStream(type);
      socket.emit('call:initiate', { recipientId, type });
      setCallState({
        isInCall: true,
        callType: type,
        callState: 'outgoing',
        caller: { id: recipientId, name: '', image: '' },
        duration: 0
      });
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  }, [webRTC, socket]);

  const answerCall = useCallback(async (callId: string) => {
    try {
      await fetch(`/api/calls/${callId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accepted: true })
      });

      setCallState(prev => ({
        ...prev,
        callState: 'connected'
      }));

      socket?.emit('call:answer', { callId, accepted: true });
    } catch (error) {
      console.error('Error answering call:', error);
    }
  }, [socket]);

  const declineCall = useCallback((callId: string) => {
    socket?.emit('call:answer', { callId, accepted: false });
    setCallState({
      isInCall: false,
      callType: null,
      callState: null,
      caller: null,
      duration: 0
    });
  }, [socket]);

  const endCall = useCallback(() => {
    socket?.emit('call:end');
    setCallState({
      isInCall: false,
      callType: null,
      callState: null,
      caller: null,
      duration: 0
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('call:incoming', (data) => {
      setCallState({
        isInCall: true,
        callType: data.type,
        callState: 'incoming',
        caller: data.caller,
        duration: 0
      });
    });

    socket.on('call:accepted', () => {
      setCallState(prev => ({
        ...prev,
        callState: 'connected'
      }));
    });

    socket.on('call:rejected', () => {
      setCallState({
        isInCall: false,
        callType: null,
        callState: null,
        caller: null,
        duration: 0
      });
    });

    socket.on('call:ended', () => {
      setCallState({
        isInCall: false,
        callType: null,
        callState: null,
        caller: null,
        duration: 0
      });
    });

    return () => {
      socket.off('call:incoming');
      socket.off('call:accepted');
      socket.off('call:rejected');
      socket.off('call:ended');
    };
  }, [socket]);

  // Duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (callState.callState === 'connected') {
      interval = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState.callState]);

  return {
    ...callState,
    initializeCall,
    answerCall,
    declineCall,
    endCall
  };
};
