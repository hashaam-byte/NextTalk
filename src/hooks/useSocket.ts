'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
    });

    setSocket(socketInstance);

    socket.on('call:incoming', (data) => {
      // Handle incoming call
    });

    socket.on('call:accepted', (data) => {
      // Handle call accepted
    });

    socket.on('call:rejected', () => {
      // Handle call rejected
    });

    socket.on('call:ended', () => {
      // Handle call ended
    });

    socket.on('webrtc:offer', async (data) => {
      // Handle WebRTC offer
    });

    socket.on('webrtc:answer', async (data) => {
      // Handle WebRTC answer
    });

    socket.on('webrtc:ice-candidate', async (data) => {
      // Handle ICE candidate
    });

    return () => {
      socketInstance.close();
    };
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
};
