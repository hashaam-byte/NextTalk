'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export function useSocket() {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return socket;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
        reconnectionDelay: 1000,
        reconnection: true,
        reconnectionAttempts: 10,
        transports: ['websocket'],
        agent: false,
        upgrade: false,
        rejectUnauthorized: false,
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.close();
      };
    }
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
