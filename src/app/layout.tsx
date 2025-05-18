import type { Metadata } from "next";
import { GeistMono } from 'geist/font/mono';
import AuthProvider from '@/components/providers/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'NextTalkWeb - Real-Time Media Messaging App',
  description: 'A full-stack, real-time, media-rich messaging app inspired by WhatsApp, Snapchat, and TikTok.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistMono.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}