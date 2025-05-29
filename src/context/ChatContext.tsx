'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface ChatContextType {
  activeTab: 'message' | 'emoji' | 'sticker' | 'gif';
  setActiveTab: (tab: 'message' | 'emoji' | 'sticker' | 'gif') => void;
  sendMessage: (content: string, type?: 'text' | 'sticker' | 'gif') => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children, chatId }: { children: ReactNode; chatId: string }) {
  const [activeTab, setActiveTab] = useState<'message' | 'emoji' | 'sticker' | 'gif'>('message');
  const { data: session } = useSession();

  const sendMessage = async (content: string, type: 'text' | 'sticker' | 'gif' = 'text') => {
    if (!content.trim() || !session?.user) return;

    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type }),
      });

      if (!response.ok) throw new Error('Failed to send message');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <ChatContext.Provider value={{ activeTab, setActiveTab, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
