'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/hooks/useSocket';
import { CallProvider } from '@/context/CallContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <SocketProvider>
          <CallProvider>
            {children}
          </CallProvider>
        </SocketProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
