import type { Metadata } from "next";
import { GeistMono } from 'geist/font/mono';
import Providers from '@/components/providers/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'NextTalkWeb - Real-Time Media Messaging App',
  description: 'A full-stack, real-time, media-rich messaging app inspired by WhatsApp, Snapchat, and TikTok.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistMono.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}