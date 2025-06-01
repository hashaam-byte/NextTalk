export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface SelectedMedia {
  type: 'image' | 'video' | 'document';
  url: string;
  title?: string;
  timestamp: Date;
  sender?: {
    name: string;
    avatar?: string;
  };
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  title?: string;
  size?: number;
  duration?: number;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
}
