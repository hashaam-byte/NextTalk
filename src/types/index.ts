export interface Message {
  id: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  chatId: string;
  createdAt: string;
  isRead: boolean;
  effect?: string | null;
  spatialData?: any;
  sentiment?: number | null;
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
  lastSeen: string;
}
