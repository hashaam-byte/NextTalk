'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Smile, Video, Phone, MoreVertical, Copy, Forward, Star, Pin, Trash2, Flag, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import EmojiPicker from '@/components/chat/EmojiPicker';
import CallOverlay from '@/components/call/CallOverlay';
import ContactDrawer from '@/components/chat/ContactDrawer';

interface Message {
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
  status: 'sent' | 'delivered' | 'read' | 'sending' | 'failed';
  isPinned?: boolean;
  isStarred?: boolean;
}

interface ChatInfo {
  avatar?: string;
  name?: string;
  isOnline: boolean;
  lastSeen: Date | null;
  isTyping?: boolean;
  status?: 'online' | 'offline' | 'away';
  deviceType?: 'mobile' | 'desktop' | 'web';
}

interface ContactInfo {
  bio?: string;
  sharedMedia: {
    type: 'image' | 'video';
    url: string;
    timestamp: Date;
  }[];
}

interface CallNotification {
  callId: string;
  type: 'audio' | 'video';
  caller: {
    id: string;
    name: string;
    image?: string;
  };
  startTime?: Date;
}

export default function ChatPage() {
  const { chatId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const messageActionsRef = useRef<HTMLDivElement>(null);
  const [messageActionsPosition, setMessageActionsPosition] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [incomingCall, setIncomingCall] = useState<CallNotification | null>(null);
  const [activeCall, setActiveCall] = useState<{
    id: string;
    type: 'audio' | 'video';
    status: 'ringing' | 'ongoing' | 'ended';
    startTime?: Date;
  } | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatMessageDate = (timestamp: Date | string) => {
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
  };

  const formatMessageTime = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  };

  const isSameWeek = (date: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${chatId}/messages`);
        const data = await response.json();
        
        if (!data.messages) {
          console.error('No messages received:', data);
          setMessages([]);
          return;
        }
        
        // Ensure all messages have proper date objects
        const processedMessages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.createdAt || Date.now())
        }));
        
        setMessages(processedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    if (chatId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [chatId]);

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const response = await fetch(`/api/chat/${chatId}/details`);
        const data = await response.json();
        setChatInfo(data);
      } catch (error) {
        console.error('Error fetching chat details:', error);
      }
    };

    if (chatId) {
      fetchChatDetails();
      const detailsInterval = setInterval(fetchChatDetails, 10000);
      return () => clearInterval(detailsInterval);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (message && !isUserTyping) {
      setIsUserTyping(true);
      // Notify server that user started typing
      fetch(`/api/chat/${chatId}/typing`, {
        method: 'POST',
        body: JSON.stringify({ typing: true })
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (isUserTyping) {
        setIsUserTyping(false);
        // Notify server that user stopped typing
        fetch(`/api/chat/${chatId}/typing`, {
          method: 'POST',
          body: JSON.stringify({ typing: false })
        });
      }
    }, 2000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, chatId, isUserTyping]);

  useEffect(() => {
    const fetchContactInfo = async () => {
      if (showContactInfo) {
        try {
          const response = await fetch(`/api/user/${chatInfo?.id}/info`);
          const data = await response.json();
          setContactInfo(data);
        } catch (error) {
          console.error('Error fetching contact info:', error);
        }
      }
    };

    fetchContactInfo();
  }, [showContactInfo, chatInfo?.id]);

  useEffect(() => {
    if (!global.io) return;

    // Handle incoming call
    global.io.on('call:incoming', (data: CallNotification) => {
      setIncomingCall(data);
      const audio = new Audio('/sounds/ringtone.mp3');
      audio.loop = true;
      audio.play().catch(console.error);
    });

    // Handle call accepted
    global.io.on('call:accepted', (data: { callId: string; startTime: Date }) => {
      // Stop ringtone
      const audioElements = document.getElementsByTagName('audio');
      Array.from(audioElements).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });

      setActiveCall(prev => prev ? {
        ...prev,
        status: 'ongoing',
        startTime: new Date(data.startTime)
      } : null);
    });

    // Handle call ended
    global.io.on('call:ended', (data: { callId: string }) => {
      // Stop ringtone
      const audioElements = document.getElementsByTagName('audio');
      Array.from(audioElements).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });

      setActiveCall(prev => prev ? { ...prev, status: 'ended' } : null);
      setTimeout(() => setActiveCall(null), 2000);
    });

    global.io.on('call:rejected', () => {
      setActiveCall(null);
      // Stop ringtone
      const audioElements = document.getElementsByTagName('audio');
      Array.from(audioElements).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    });

    return () => {
      global.io?.off('call:incoming');
      global.io?.off('call:accepted');
      global.io?.off('call:ended');
      global.io?.off('call:rejected');
    };
  }, [chatId]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      content: message,
      senderId: session?.user?.id,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    }
  };

  const formatLastSeen = (lastSeen: Date | null) => {
    if (!lastSeen) return 'Offline';
    
    const now = new Date();
    const diff = now.getTime() - new Date(lastSeen).getTime();
    
    // Convert to seconds
    const seconds = Math.floor(diff / 1000);
    if (seconds < 30) return 'Just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    
    // Convert to minutes
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Convert to hours
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Convert to days
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // If more than a week ago, show the date and time
    return new Date(lastSeen).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleMessageAction = async (action: string) => {
    if (!selectedMessage) return;

    switch (action) {
      case 'copy':
        await navigator.clipboard.writeText(selectedMessage.content);
        break;
      case 'delete':
        // Add delete API call
        break;
      case 'forward':
        router.push(`/forward-message?messageId=${selectedMessage.id}`);
        break;
      case 'star':
        // Add star API call
        break;
      case 'pin':
        // Add pin API call
        break;
      case 'report':
        // Add report API call
        break;
    }
    setShowMessageActions(false);
  };

  const handleMessageContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    setSelectedMessage(message);
    setMessageActionsPosition({ x: e.clientX, y: e.clientY });
    setShowMessageActions(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const handleStartCall = async (type: 'audio' | 'video') => {
    try {
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          receiverId: chatId,
          roomId: `${chatId}-${Date.now()}` // Unique room ID for WebRTC
        })
      });

      const data = await response.json();
      if (response.ok) {
        setActiveCall({
          id: data.id,
          type,
          status: 'ringing',
          startTime: new Date()
        });

        // Start playing ringtone for caller
        const audio = new Audio('/sounds/outgoing-ring.mp3');
        audio.loop = true;
        audio.play().catch(console.error);
      }
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const handleAnswerCall = async (callId: string, accepted: boolean) => {
    try {
      await fetch(`/api/calls/${callId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accepted })
      });

      if (accepted && incomingCall) {
        setActiveCall({
          id: callId,
          type: incomingCall.type,
          status: 'ongoing',
          startTime: new Date()
        });
      }
      setIncomingCall(null);
    } catch (error) {
      console.error('Error answering call:', error);
    }
  };

  const handleDeclineCall = () => {
    // Emit socket event to decline call
    if (global.io) {
      global.io.emit('call:answer', {
        accepted: false
      });
    }
    setActiveCall(null);
  };

  const handleEndCall = () => {
    // Emit socket event to end call
    if (global.io) {
      global.io.emit('call:end');
    }
    setActiveCall(null);
  };

  // Handle contact actions
  const handleMuteContact = async () => {
    try {
      await fetch(`/api/contacts/${chatInfo?.id}/mute`, {
        method: 'POST'
      });
      // Update local state or show notification
    } catch (error) {
      console.error('Error muting contact:', error);
    }
  };

  const handleBlockContact = async () => {
    try {
      await fetch(`/api/contacts/${chatInfo?.id}/block`, {
        method: 'POST'
      });
      router.push('/chat');
    } catch (error) {
      console.error('Error blocking contact:', error);
    }
  };

  const handleReportContact = async () => {
    try {
      await fetch(`/api/contacts/${chatInfo?.id}/report`, {
        method: 'POST'
      });
      router.push('/chat');
    } catch (error) {
      console.error('Error reporting contact:', error);
    }
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
          {/* Contact Info */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
              {chatInfo?.avatar ? (
                <Image
                  src={chatInfo.avatar}
                  alt={chatInfo.name || 'Contact'}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600/30 to-indigo-600/30">
                  <span className="text-white font-medium">
                    {chatInfo?.name?.[0] || '?'}
                  </span>
                </div>
              )}
            </div>
            {chatInfo?.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
            )}
          </div>

          <div className="ml-3 flex-1">
            <h2 className="text-white font-medium">
              {chatInfo?.name || 'Loading...'}
            </h2>
            <div className="flex items-center text-xs space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                chatInfo?.isOnline 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-gray-400'
              }`} />
              <span className={`${
                chatInfo?.isOnline ? 'text-green-400' : 'text-gray-400'
              }`}>
                {chatInfo?.isOnline 
                  ? 'Online' 
                  : chatInfo?.lastSeen 
                    ? formatLastSeen(chatInfo.lastSeen)
                    : 'Offline'}
              </span>
              {chatInfo?.isTyping && (
                <span className="text-purple-400 ml-1">• typing...</span>
              )}
              {chatInfo?.deviceType && (
                <span className="text-gray-500 ml-1">
                  • from {chatInfo.deviceType}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStartCall('audio')}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-200"
            >
              <Phone size={20} />
            </button>
            <button
              onClick={() => handleStartCall('video')}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-200"
            >
              <Video size={20} />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-200"
              >
                <MoreVertical size={20} />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/10"
                  >
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setShowContactInfo(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full p-2 hover:bg-white/10 rounded-lg text-gray-200"
                      >
                        View Contact
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Call Notification */}
      {incomingCall && (
        <div className="sticky top-16 z-30 p-4 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                {incomingCall.type === 'video' ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-white font-medium">{incomingCall.caller.name}</p>
                <p className="text-sm text-white/80">Incoming {incomingCall.type} call...</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleAnswerCall(incomingCall.callId, true)}
                className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                Answer
              </button>
              <button
                onClick={() => handleAnswerCall(incomingCall.callId, false)}
                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container - Adjust padding for mobile */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        <div className="flex flex-col min-h-0">
          {Array.isArray(messages) && messages.map((msg, index) => {
            const isMine = msg.senderId === session?.user?.id;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showDateDivider = index === 0 || !isSameDay(new Date(msg.timestamp), new Date(prevMsg?.timestamp));

            return (
              <div
                key={msg.id}
                onContextMenu={(e) => handleMessageContextMenu(e, msg)}
                onClick={() => setSelectedMessage(msg)}
                className={`relative ${msg.isPinned ? 'bg-white/5' : ''}`}
              >
                {showDateDivider && (
                  <div className="flex justify-center my-4">
                    <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-gray-300">
                      {formatMessageDate(msg.timestamp)}
                    </div>
                  </div>
                )}

                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
                  <div className={`flex items-end space-x-2 ${isMine ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                    {!isMine && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center text-white text-sm">
                          {msg.sender?.name?.[0] || '?'}
                        </div>
                      </div>
                    )}

                    <div className={`max-w-[75%] ${
                      isMine 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-l-2xl rounded-tr-2xl' 
                        : 'bg-white/10 text-white rounded-r-2xl rounded-tl-2xl'
                    } px-4 py-2`}>
                      <p className="break-words">{msg.content}</p>
                      <div className={`flex items-center mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-white/60">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                        {isMine && msg.status && (
                          <div className="ml-2">
                            {getStatusIcon(msg.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Actions Menu */}
      <AnimatePresence>
        {showMessageActions && selectedMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-gray-900/95 backdrop-blur-lg rounded-xl border border-white/10 shadow-xl p-1 w-48"
            style={{
              left: Math.min(messageActionsPosition.x, window.innerWidth - 192),
              top: Math.min(messageActionsPosition.y, window.innerHeight - 200)
            }}
            ref={messageActionsRef}
          >
            <button
              onClick={() => handleMessageAction('copy')}
              className="flex items-center w-full p-2 hover:bg-white/10 rounded-lg text-gray-200"
            >
              <Copy size={16} className="mr-2" />
              Copy
            </button>
            {selectedMessage.senderId === session?.user?.id && (
              <button
                onClick={() => handleMessageAction('delete')}
                className="flex items-center w-full p-2 hover:bg-white/10 rounded-lg text-red-400"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            )}
            <button
              onClick={() => handleMessageAction('forward')}
              className="flex items-center w-full p-2 hover:bg-white/10 rounded-lg text-gray-200"
            >
              <Forward size={16} className="mr-2" />
              Forward
            </button>
            <button
              onClick={() => handleMessageAction('star')}
              className="flex items-center w-full p-2 hover:bg-white/10 rounded-lg text-gray-200"
            >
              <Star size={16} className="mr-2" />
              {selectedMessage.isStarred ? 'Unstar' : 'Star'}
            </button>
            <button
              onClick={() => handleMessageAction('pin')}
              className="flex items-center w-full p-2 hover:bg-white/10 rounded-lg text-gray-200"
            >
              <Pin size={16} className="mr-2" />
              {selectedMessage.isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              onClick={() => handleMessageAction('report')}
              className="flex items-center w-full p-2 hover:bg-white/10 rounded-lg text-red-400"
            >
              <Flag size={16} className="mr-2" />
              Report
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call Overlay */}
      <AnimatePresence>
        {activeCall && (
          <CallOverlay
            type={activeCall.type}
            callerName={chatInfo?.name || 'User'}
            callerImage={chatInfo?.avatar}
            isIncoming={activeCall.isIncoming}
            onAnswer={handleAnswerCall}
            onDecline={handleDeclineCall}
            onEnd={handleEndCall}
          />
        )}
      </AnimatePresence>

      {/* Contact Info Drawer */}
      <AnimatePresence>
        {showContactInfo && chatInfo && (
          <ContactDrawer
            contact={chatInfo}
            commonGroups={[]} // Fetch from API
            onClose={() => setShowContactInfo(false)}
            onMute={handleMuteContact}
            onBlock={handleBlockContact}
            onReport={handleReportContact}
          />
        )}
      </AnimatePresence>

      {/* Input - Adjust padding and spacing for mobile */}
      <div className="sticky bottom-0 z-20 p-3 sm:p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
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

// Helper function to format date header
function formatDateHeader(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
  });
}

// Helper function to check if two dates are the same day
function isSameDay(date1: Date, date2: Date) {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

// Helper function to get status icon
function getStatusIcon(status: string) {
  switch (status) {
    case 'sent':
      return <div className="h-2 w-2 rounded-full bg-gray-400" />;
    case 'delivered':
      return <div className="h-2 w-2 rounded-full bg-blue-400" />;
    case 'read':
      return <div className="h-2 w-2 rounded-full bg-green-400" />;
    default:
      return null;
  }
}
