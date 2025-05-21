'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Send, Smile, Video, Phone, MoreVertical, 
  Users, Settings, LogOut, Image as ImageIcon, Plus,
  User as UserIcon
} from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import EmojiPicker from '@/components/chat/EmojiPicker';

interface GroupMessage {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  isOnline: boolean;
  lastSeen?: Date;
}

interface GroupInfo {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  createdAt: Date;
  members: GroupMember[];
  admins: string[];
  isPublic: boolean;
}

const formatMessageTime = (timestamp: Date | string) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

const formatMessageDate = (timestamp: Date | string) => {
  try {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isToday(messageDate)) {
      return 'Today';
    } else if (isYesterday(messageDate)) {
      return 'Yesterday';
    } else if (isSameWeek(messageDate)) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'long' });
    }
    return messageDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export default function GroupChatPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [message, setMessage] = useState('');
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add scroll to bottom functionality
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch group messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}/messages`);
        const data = await response.json();
        setMessages(data.messages || []);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (groupId) {
      fetchMessages();
      // Poll for new messages
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [groupId]);

  // Fetch group info
  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const response = await fetch(`/api/groups/${groupId}`);
        const data = await response.json();
        setGroupInfo(data);
      } catch (error) {
        console.error('Error fetching group info:', error);
      }
    };

    if (groupId) {
      fetchGroupInfo();
    }
  }, [groupId]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      content: message,
      senderId: session?.user?.id,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    scrollToBottom();

    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Create notification for group message
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'GROUP_MESSAGE',
          content: `New message in ${groupInfo?.name}: ${message}`,
          groupId,
          timestamp: new Date()
        }),
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center p-3 sm:p-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-200"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center flex-1 ml-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
              {groupInfo?.avatar ? (
                <Image
                  src={groupInfo.avatar}
                  alt={groupInfo.name || 'Group'}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-indigo-600/30 flex items-center justify-center">
                  <Users size={20} className="text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="ml-3 flex-1">
            <h2 className="text-white font-medium">{groupInfo?.name || 'Loading...'}</h2>
            <p className="text-xs text-gray-400">
              {groupInfo?.members?.length || 0} members
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-200">
              <Phone size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-200">
              <Video size={20} />
            </button>
            <button
              onClick={() => setShowGroupInfo(!showGroupInfo)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-200"
            >
              <Users size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end space-x-2 max-w-[75%] ${
              msg.senderId === session?.user?.id ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              {msg.senderId !== session?.user?.id && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center text-white text-sm">
                    {msg.sender?.name?.[0] || '?'}
                  </div>
                </div>
              )}

              <div className={`${
                msg.senderId === session?.user?.id 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                  : 'bg-white/10 text-white'
              } px-4 py-2 rounded-2xl`}>
                {msg.senderId !== session?.user?.id && (
                  <p className="text-xs text-gray-300 mb-1">{msg.sender?.name}</p>
                )}
                <p className="break-words">{msg.content}</p>
                <p className="text-xs text-white/60 mt-1">
                  {formatMessageTime(msg.timestamp)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Group Info Sidebar */}
      <AnimatePresence>
        {showGroupInfo && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-lg border-l border-white/10 z-50"
          >
            {/* Group info content */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Group Info</h2>
                <button
                  onClick={() => setShowGroupInfo(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400"
                >
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Group Details */}
              <div className="space-y-6">
                {/* Group Avatar and Name */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3">
                    {groupInfo?.avatar ? (
                      <Image
                        src={groupInfo.avatar}
                        alt={groupInfo.name || ''}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                        <Users size={32} className="text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-white">{groupInfo?.name}</h3>
                  {groupInfo?.description && (
                    <p className="text-sm text-gray-400 mt-2">{groupInfo.description}</p>
                  )}
                </div>

                {/* Member List */}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Members ({groupInfo?.members?.length || 0})</h4>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {groupInfo?.members?.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center p-2 rounded-lg hover:bg-white/5"
                      >
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                            {member.avatar ? (
                              <Image
                                src={member.avatar}
                                alt={member.name}
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center text-white">
                                {member.name[0]}
                              </div>
                            )}
                          </div>
                          {member.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Actions */}
                {groupInfo?.admins?.includes(session?.user?.id as string) && (
                  <div className="space-y-2">
                    <button className="w-full p-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-all">
                      Add Members
                    </button>
                    <button className="w-full p-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-all">
                      Delete Group
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="sticky bottom-0 z-20 p-3 sm:p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400"
            >
              <Smile size={20} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0">
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  isOpen={showEmojiPicker}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border-none rounded-full px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50"
          />
          
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
