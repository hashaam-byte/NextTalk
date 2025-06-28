'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  ArrowLeft,
  Send,
  Mic,
  BellOff,
  Download,
  Upload,
  Trash,
  Flag,
  Camera,
  Paperclip,
  User,
  Smile,
  Phone,
  Video,
  MoreVertical,
  Search,
  Pin,
  Trash2,
  Reply,
  Share,
  Heart,
  ThumbsUp,
  Clock,
  Lock,
  Sparkles,
  Palette,
  Bot,
  Globe,
  Eye,
  EyeOff,
  Play,
  Pause,
  Volume2,
  Image as ImageIcon,
  FileText,
  Link,
  Calendar,
  CheckCircle,
  Users,
  Music,
  MapPin,
  MessageSquare,
  Plus,
  Settings
} from 'lucide-react';

import { useCall } from '@/hooks/useCall';
import EmojiPicker from '@/components/chat/EmojiPicker';
import StickerPicker from '@/components/chat/StickerPicker';
import GifPicker from '@/components/chat/GifPicker';
import CallOverlay from '@/components/call/CallOverlay';
import ContactDrawer from '@/components/chat/ContactDrawer';
import CallConfirmDialog from '@/components/chat/CallConfirmDialog';
import MediaViewer from '@/components/chat/MediaViewer';
import { videoClient } from '@/lib/stream';
import type { SelectedMedia } from '@/types/chat';
import dynamic from 'next/dynamic';

const PICKER_ITEMS = [
  { type: 'emoji', icon: '😊', label: 'Emojis' },
  { type: 'sticker', icon: '🎯', label: 'Stickers' },
  { type: 'gif', icon: '🎬', label: 'GIFs' }
] as const;

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

// Dynamically import the ThemeModal (from /theme page)
const ThemeModal = dynamic(() => import('@/app/theme/ThemeModal'), { ssr: false });

export default function ChatPage() {
  const { chatId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherTypingUser, setOtherTypingUser] = useState<{ id: string; name: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const messageActionsRef = useRef<HTMLDivElement>(null);
  const [messageActionsPosition, setMessageActionsPosition] = useState({ x: 0, y: 0 });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'message' | 'emoji' | 'sticker' | 'gif'>('message');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [incomingCall, setIncomingCall] = useState<CallNotification | null>(null);
  const [activeCall, setActiveCall] = useState<{
    id: string;
    type: 'audio' | 'video';
    status: 'ringing' | 'ongoing' | 'ended';
    startTime?: Date;
  } | null>(null);
  const call = useCall(global.io);
  const [expressionType, setExpressionType] = useState<'emoji' | 'sticker' | 'gif' | null>(null);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });
  const [showCallConfirm, setShowCallConfirm] = useState(false);
  const [pendingCallType, setPendingCallType] = useState<'audio' | 'video' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showMediaGrid, setShowMediaGrid] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [wallpaperColor, setWallpaperColor] = useState<string>('default');
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
  const [showWallpaperPicker, setShowWallpaperPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPin, setUnlockPin] = useState('');
  const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [chatLocked, setChatLocked] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showPrivacyPanel, setShowPrivacyPanel] = useState(false);
  const [vanishMode, setVanishMode] = useState(false);
  const [showMediaSearch, setShowMediaSearch] = useState(false);
  const [showApplets, setShowApplets] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [voiceBubbleActive, setVoiceBubbleActive] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([]);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('normal');

  const WALLPAPER_COLORS = [
    { 
      name: 'Default', 
      value: 'from-gray-900 via-gray-800 to-gray-900',
      pattern: 'bg-gradient-to-r'
    },
    { 
      name: 'Aurora', 
      value: 'from-purple-600/30 via-blue-500/30 to-green-400/30',
      pattern: 'bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from),_var(--tw-gradient-via),_var(--tw-gradient-to))]'
    },
    { 
      name: 'Sunset', 
      value: 'from-orange-500/30 via-pink-500/30 to-purple-600/30',
      pattern: 'bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-from),_var(--tw-gradient-via),_var(--tw-gradient-to))]'
    },
    { 
      name: 'Ocean', 
      value: 'from-cyan-400/30 via-blue-500/30 to-indigo-600/30',
      pattern: 'bg-[linear-gradient(45deg,_var(--tw-gradient-from),_var(--tw-gradient-via),_var(--tw-gradient-to))]'
    },
    { 
      name: 'Forest', 
      value: 'from-green-400/30 via-emerald-500/30 to-teal-600/30',
      pattern: 'bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-from),_var(--tw-gradient-via),_var(--tw-gradient-to))]'
    },
    { 
      name: 'Dusk', 
      value: 'from-rose-400/30 via-fuchsia-500/30 to-indigo-500/30',
      pattern: 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-from),_var(--tw-gradient-via),_var(--tw-gradient-to))]'
    }
  ];

  const aiSuggestions = [
    "Sounds great! When can we schedule a call?",
    "I'd love to see more details about this",
    "Let me check my calendar and get back to you"
  ];

  const demoMediaItems = [
    { type: 'image', name: 'design_mockup.jpg', date: 'Today' },
    { type: 'video', name: 'project_demo.mp4', date: 'Yesterday' },
    { type: 'document', name: 'requirements.pdf', date: '2 days ago' },
    { type: 'link', name: 'figma.com/design-system', date: '3 days ago' }
  ];

  const applets = [
    { name: 'Polls', icon: '📊', description: 'Create quick polls' },
    { name: 'Todo', icon: '✅', description: 'Shared task lists' },
    { name: 'Calendar', icon: '📅', description: 'Schedule events' },
    { name: 'Music', icon: '🎵', description: 'Share playlists' },
    { name: 'Location', icon: '📍', description: 'Share locations' },
    { name: 'Weather', icon: '🌤️', description: 'Weather updates' }
  ];

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
      // Play ringtone
      const audio = new Audio('/sounds/ringtone.mp3');
      audio.loop = true;
      audio.play().catch(console.error);
    });

    // Handle call accepted
    global.io.on('call:accepted', (data: { callId: string; startTime: Date }) => {
      setActiveCall(prev => prev ? {
        ...prev,
        status: 'ongoing',
        startTime: new Date(data.startTime)
      } : null);
      
      // Stop ringtone if playing
      const audioElements = document.getElementsByTagName('audio');
      Array.from(audioElements).forEach(audio => audio.pause());
    });

    // Handle call rejected/ended
    global.io.on('call:rejected', () => {
      setActiveCall(null);
      // Stop ringtone if playing
      const audioElements = document.getElementsByTagName('audio');
      Array.from(audioElements).forEach(audio => audio.pause());
    });

    return () => {
      global.io?.off('call:incoming');
      global.io?.off('call:accepted');
      global.io?.off('call:rejected');
    };
  }, []);

  const sendMessage = async (msgContent?: string) => {
    const content = msgContent || message;
    if (!content.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      content,
      senderId: session?.user?.id,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter((msg) => msg.id !== newMessage.id));
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

    try {
      switch (action) {
        case 'copy':
          await navigator.clipboard.writeText(selectedMessage.content);
          break;

        case 'delete':
          const deleteRes = await fetch(`/api/chat/${chatId}/messages/${selectedMessage.id}`, {
            method: 'DELETE'
          });
          if (deleteRes.ok) {
            setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
          }
          break;

        case 'forward':
          // Store message in localStorage for forwarding
          localStorage.setItem('forwardMessage', JSON.stringify(selectedMessage));
          router.push('/forward');
          break;

        case 'star':
          const starRes = await fetch(`/api/chat/${chatId}/messages/${selectedMessage.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: selectedMessage.isStarred ? 'unstar' : 'star' })
          });
          if (starRes.ok) {
            setMessages(prev => prev.map(msg => 
              msg.id === selectedMessage.id 
                ? { ...msg, isStarred: !msg.isStarred }
                : msg
            ));
          }
          break;

        case 'pin':
          const pinRes = await fetch(`/api/chat/${chatId}/messages/${selectedMessage.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: selectedMessage.isPinned ? 'unpin' : 'pin' })
          });
          if (pinRes.ok) {
            setMessages(prev => prev.map((msg) => 
              msg.id === selectedMessage.id 
                ? { ...msg, isPinned: !msg.isPinned }
                : msg
            ));
          }
          break;

        case 'report':
          const reportRes = await fetch(`/api/messages/${selectedMessage.id}/report`, {
            method: 'POST'
          });
          if (reportRes.ok) {
            // Show success notification
          }
          break;
      }
    } catch (error) {
      console.error(`Error handling ${action} action:`, error);
    } finally {
      setShowMessageActions(false);
      setSelectedMessage(null);
    }
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
    setPendingCallType(type);
    setShowCallConfirm(true);
  };

  const handleConfirmCall = async () => {
    if (!pendingCallType || !chatInfo || !session?.user) return;

    try {
      // Create call record in database
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: pendingCallType,
          receiverId: chatInfo.id,
          chatId: chatId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create call');
      
      const { callId, streamToken } = await response.json();

      // Initialize Stream call
      const streamCall = await videoClient.call('default', callId);
      await streamCall.getOrCreate({ 
        members: [session.user.id, chatInfo.id],
        options: { ring: true }
      });

      setActiveCall({
        id: callId,
        type: pendingCallType,
        status: 'ongoing'
      });

    } catch (error) {
      console.error('Error starting call:', error);
      // Show error notification
    } finally {
      setShowCallConfirm(false);
      setPendingCallType(null);
    }
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

  const handleExpressionSelect = (type: 'emoji' | 'sticker' | 'gif', content: string) => {
    let messageContent = '';
    switch (type) {
      case 'emoji':
        messageContent = content;
        break;
      case 'sticker':
        messageContent = `[sticker:${content}]`;
        break;
      case 'gif':
        messageContent = `[gif:${content}]`;
        break;
    }
    sendMessage(messageContent);
    setExpressionType(null);
  };

  const handleExpressionButtonClick = (type: 'emoji' | 'sticker' | 'gif', event: React.MouseEvent) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    setPickerPosition({ x: rect.left, y: rect.top - 450 }); // Adjust 450 based on your picker height
    setExpressionType(prev => prev === type ? null : type);
  };

  const handleClearChat = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}/clear`, {
        method: 'POST'
      });
      if (response.ok) {
        setMessages([]);
        // Show success toast
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleExportChat = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}/export`);
      const data = await response.json();
      
      // Create text file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${chatId}-${new Date().toISOString()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting chat:', error);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}/search?q=${query}`);
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error searching messages:', error);
    }
  };

  const handleFetchMedia = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}/media`);
      const data = await response.json();
      setMediaItems(data.media);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const handleSetWallpaper = async (wallpaper: string) => {
    try {
      await fetch(`/api/chat/${chatId}/wallpaper`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaper })
      });
    } catch (error) {
      console.error('Error setting wallpaper:', error);
    }
  };

  const handleWallpaperChange = async (color: string) => {
    // Update local state
    setWallpaperColor(color);
    setCustomWallpaper(null);
    setShowWallpaperPicker(false);

    try {
      // Persist to database
      await fetch(`/api/chat/${chatId}/wallpaper`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaper: color })
      });
    } catch (error) {
      console.error('Error saving wallpaper:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setCustomWallpaper(localUrl);
      setShowWallpaperPicker(false);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/chat/wallpaper/upload', {
          method: 'POST',
          body: formData
        });

        const { url } = await response.json();
        
        // Update local state
        setCustomWallpaper(url);
        setWallpaperColor('default');
        
        // Persist to database
        await fetch(`/api/chat/${chatId}/wallpaper`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallpaper: url })
        });

        URL.revokeObjectURL(localUrl);
      } catch (error) {
        console.error('Error uploading wallpaper:', error);
        setCustomWallpaper(null);
        URL.revokeObjectURL(localUrl);
      }
    }
  }, [chatId]);

  // Add useDropzone hook for wallpaper picker
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop,
  });

  // Add effect to fetch saved wallpaper
  useEffect(() => {
    const fetchWallpaper = async () => {
      try {
        const response = await fetch(`/api/chat/${chatId}/wallpaper`);
        const data = await response.json();
        if (data.wallpaper) {
          if (data.wallpaper.startsWith('http')) {
            setCustomWallpaper(data.wallpaper);
            setWallpaperColor('default');
          } else {
            setWallpaperColor(data.wallpaper);
            setCustomWallpaper(null);
          }
        }
      } catch (error) {
        console.error('Error fetching wallpaper:', error);
      }
    };

    if (chatId) {
      fetchWallpaper();
    }
  }, [chatId]);

  // Listen for theme changes (fetch from API on mount)
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const res = await fetch(`/api/chat/${chatId}/theme`);
        const data = await res.json();
        if (data.theme) setSelectedTheme(data.theme);
      } catch {}
    };
    if (chatId && session?.user) fetchTheme();
  }, [chatId, session?.user]);

  // Handler to set theme (called from modal)
  const handleThemeChange = async (themeId: string) => {
    setSelectedTheme(themeId);
    setShowThemeModal(false);
    try {
      await fetch(`/api/chat/${chatId}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeId }),
      });
    } catch {}
  };

  // Theme bubble classes (should match bundles in /theme page)
  const THEME_BUNDLES = {
    normal: {
      mine: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-l-2xl rounded-tr-2xl',
      other: 'bg-white/10 text-white rounded-r-2xl rounded-tl-2xl',
    },
    'purple-ash': {
      mine: 'bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-l-2xl rounded-tr-2xl',
      other: 'bg-neutral-900 text-gray-200 rounded-r-2xl rounded-tl-2xl',
    },
    'blue-green': {
      mine: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-l-2xl rounded-tr-2xl',
      other: 'bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-r-2xl rounded-tl-2xl',
    },
    'orange-dark': {
      mine: 'bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-l-2xl rounded-tr-2xl',
      other: 'bg-gray-800 text-white rounded-r-2xl rounded-tl-2xl',
    },
    'emerald-teal': {
      mine: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-l-2xl rounded-tr-2xl',
      other: 'bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-r-2xl rounded-tl-2xl',
    },
    'rose-gold': {
      mine: 'bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-l-2xl rounded-tr-2xl',
      other: 'bg-gradient-to-r from-amber-200 to-yellow-200 text-gray-900 rounded-r-2xl rounded-tl-2xl',
    },
  };
  const getBubbleClass = (isMine: boolean) => {
    const theme = THEME_BUNDLES[selectedTheme] || THEME_BUNDLES.normal;
    return isMine ? theme.mine : theme.other;
  };

  useEffect(() => {
    const handleThemeChangeEvent = (e: CustomEvent) => {
      const { theme } = e.detail;
      setSelectedTheme(theme);
    };

    window.addEventListener('themeChange', handleThemeChangeEvent as EventListener);

    return () => {
      window.removeEventListener('themeChange', handleThemeChangeEvent as EventListener);
    };
  }, []);

  const getBackgroundStyle = () => {
    if (customWallpaper) {
      return {
        backgroundImage: `url(${customWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }

    const selectedColor = WALLPAPER_COLORS.find(c => c.value === wallpaperColor);
    if (!selectedColor) return {};

    return {
      background: `${selectedColor.pattern} ${selectedColor.value}`,
      backgroundSize: '200% 200%',
      animation: 'gradient 15s ease infinite',
      transition: 'all 0.3s ease-in-out' // Add smooth transition
    };
  };

  // Modify the wallpaper picker dialog:
  const renderWallpaperPicker = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg flex items-center justify-center"
    >
      <div
        className="bg-gray-900/95 rounded-xl border border-white/10 p-4 w-96 max-h-[90vh] overflow-y-auto"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-medium">Choose Wallpaper</h3>
          <button
            onClick={() => setShowWallpaperPicker(false)}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Custom Wallpaper Upload */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Custom Wallpaper</p>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors
                     ${isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500/50'}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-2">
              <Upload size={24} className="text-gray-400" />
              <p className="text-sm text-gray-400">
                {isDragActive
                  ? "Drop the image here"
                  : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500">Max size: 5MB</p>
            </div>
          </div>
        </div>

        {/* Preset Colors */}
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Preset Colors</p>
          <div className="grid grid-cols-2 gap-3">
            {WALLPAPER_COLORS.map(color => (
              <button
                key={color.value}
                onClick={() => {
                  handleWallpaperChange(color.value);
                  setCustomWallpaper(null);
                }}
                className={`h-24 rounded-lg border-2 transition-all ${
                  wallpaperColor === color.value && !customWallpaper
                    ? 'border-purple-500 scale-95'
                    : 'border-transparent hover:border-white/20'
                } ${color.pattern} ${color.value}`}
              >
                <span className="text-xs text-white/70 font-medium">{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Update the main container div:
  return (
    <div 
      className="h-[100dvh] flex flex-col relative"
      style={getBackgroundStyle()}
    >
      {/* Add an overlay to ensure content readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      
      {/* Wrap existing content in a relative container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Fixed Chat Header */}
        <div className={`sticky top-0 z-30 bg-black/20 backdrop-blur-lg border-b border-white/10 transition-all duration-300
          ${showThemeModal ? 'pointer-events-none blur-[3px] opacity-60' : ''}`}>
          <div className="flex items-center p-3 sm:p-4">
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
                      <>
                        {/* Overlay for blur and closing */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm"
                          onClick={() => setIsMenuOpen(false)}
                        />
                        {/* Dropdown: open downwards below the button (mt-2 instead of bottom-12) */}
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.97 }}
                          className="absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 max-h-[calc(100vh-100px)] overflow-y-auto z-[80]"
                        >
                          <div className="p-1 space-y-1">
                            <button
                              onClick={() => {
                                setShowContactInfo(true);
                                setIsMenuOpen(false);
                              }}
                              className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg text-gray-200"
                            >
                              <User size={18} className="mr-3 text-purple-400" />
                              View Contact
                            </button>

                            <button
                              onClick={() => {
                                handleFetchMedia();
                                setShowMediaGrid(true);
                                setIsMenuOpen(false);
                              }}
                              className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg text-gray-200"
                            >
                              <ImageIcon size={18} className="mr-3 text-purple-400" />
                              Media, Links, and Docs
                            </button>

                            <button
                              onClick={() => setShowSearch(true)}
                              className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg text-gray-200"
                            >
                              <Search size={18} className="mr-3 text-blue-400" />
                              Search in Chat
                            </button>

                            <button
                              onClick={handleMuteContact}
                              className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg text-gray-200"
                            >
                              <BellOff size={18} className="mr-3 text-yellow-400" />
                              Mute Notifications
                            </button>

                            <button
                              onClick={() => setShowDatePicker(true)}
                              className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg text-gray-200"
                            >
                              <Calendar size={18} className="mr-3 text-blue-400" />
                              Jump to Date
                            </button>

                            <button
                              onClick={() => setShowWallpaperPicker(true)}
                              className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg text-gray-200"
                            >
                              <Palette size={18} className="mr-3 text-purple-400" />
                              Change Wallpaper
                            </button>

                            <hr className="border-white/10" />

                            <button
                              onClick={handleExportChat}
                              className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg text-gray-200"
                            >
                              <Download size={18} className="mr-3 text-blue-400" />
                              Export Chat
                            </button>

                            <button
                              onClick={handleClearChat}
                              className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg text-red-400"
                            >
                              <Trash size={18} className="mr-3" />
                              Clear Chat
                            </button>

                            <button
                              onClick={handleBlockContact}
                              className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg text-red-400"
                            >
                              <User size={18} className="mr-3" />
                              Block Contact
                            </button>

                            <button
                              onClick={handleReportContact}
                              className="flex items-center w-full p-3 hover:bg-white/10 rounded-lg text-red-400"
                            >
                              <Flag size={18} className="mr-3" />
                              Report Contact
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
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
                  onClick={() => handleAnswerCall(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                >
                  Answer
                </button>
                <button
                  onClick={() => handleAnswerCall(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Messages Container */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4">
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

                      <div className={`max-w-[75%] ${getBubbleClass(isMine)} px-4 py-2`}>
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

        {/* Expression Picker Overlay */}
        <AnimatePresence>
          {expressionType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed z-50"
              style={{
                left: pickerPosition.x,
                top: pickerPosition.y,
                width: '350px'
              }}
            >
              <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
                {/* Picker Navigation */}
                <div className="flex border-b border-white/10">
                  {PICKER_ITEMS.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => setExpressionType(item.type)}
                      className={`flex-1 py-2 text-sm font-medium ${
                        expressionType === item.type
                          ? 'text-purple-400 border-b-2 border-purple-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="p-4">
                  {expressionType === 'emoji' && (
                    <EmojiPicker
                      onEmojiSelect={(emoji) => handleExpressionSelect('emoji', emoji)}
                      isOpen={true}
                      onClose={() => setExpressionType(null)}
                    />
                  )}
                  {expressionType === 'sticker' && (
                    <StickerPicker
                      onStickerSelect={(sticker) => handleExpressionSelect('sticker', sticker)}
                      isOpen={true}
                      onClose={() => setExpressionType(null)}
                    />
                  )}
                  {expressionType === 'gif' && (
                    <GifPicker
                      onGifSelect={(gif) => handleExpressionSelect('gif', gif)}
                      isOpen={true}
                      onClose={() => setExpressionType(null)}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed Bottom Input Section */}
        <div className="sticky bottom-0 z-30 bg-black/20 backdrop-blur-lg border-t border-white/10 p-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => handleExpressionButtonClick('emoji', e)}
                className={`p-2 rounded-full transition-colors ${
                  expressionType === 'emoji' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'text-gray-400 hover:bg-white/10'
                }`}
              >
                <Smile size={20} />
              </button>
              <button
                onClick={(e) => handleExpressionButtonClick('sticker', e)}
                className={`p-2 rounded-full transition-colors ${
                  expressionType === 'sticker' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'text-gray-400 hover:bg-white/10'
                }`}
              >
                <MessageSquare size={20} />
              </button>
              <button
                onClick={(e) => handleExpressionButtonClick('gif', e)}
                className={`p-2 rounded-full transition-colors ${
                  expressionType === 'gif' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'text-gray-400 hover:bg-white/10'
                }`}
              >
                <Plus size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center space-x-2 flex-1"
            >
              {/* Message Input */}
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/10 border-none rounded-full px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50"
              />
              
              {/* Send Button */}
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
                  <Trash size={16} className="mr-2" />
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
          {call.isInCall && (
            <CallOverlay
              type={call.callType!}
              callState={call.callState!}
              caller={call.caller!}
              duration={call.duration}
              onAnswer={() => call.answerCall(chatId)}
              onDecline={() => call.declineCall(chatId)}
              onEndCall={call.endCall}
            />
          )}
        </AnimatePresence>

        {/* Contact Info Drawer */}
        <AnimatePresence>
          {showContactInfo && chatInfo && (
            <ContactDrawer
              chatId={chatId as string}
              contact={{
                ...chatInfo,
                id: chatId as string,
                profileImage: chatInfo.avatar,
                status: chatInfo.status || 'offline',
                lastSeen: chatInfo.lastSeen,
                deviceType: chatInfo.deviceType,
                isTyping: chatInfo.isTyping
              }}
              commonGroups={[]} // Fetch from API
              onClose={() => setShowContactInfo(false)}
              onMute={handleMuteContact}
              onBlock={handleBlockContact}
              onReport={handleReportContact}
            />
          )}
        </AnimatePresence>

        {/* Call Confirm Dialog */}
        <CallConfirmDialog
          isOpen={showCallConfirm}
          type={pendingCallType || 'audio'}
          contact={{
            name: chatInfo?.name || 'User',
            avatar: chatInfo?.avatar
          }}
          onConfirm={handleConfirmCall}
          onCancel={() => {
            setShowCallConfirm(false);
            setPendingCallType(null);
          }}
        />

        {/* Search Overlay */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center"
            >
              <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl p-4 w-full max-w-md">
                <div className="flex items-center mb-4">
                  <h3 className="text-white font-medium text-lg flex-1">
                    Search in Chat
                  </h3>
                  <button
                    onClick={() => setShowSearch(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type your search query..."
                    className="w-full bg-white/10 border-none rounded-full px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div className="space-y-2">
                  {searchResults.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4">
                      No results found.
                    </p>
                  )}
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-3 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <p className="text-white break-words">{result.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                        <span>
                          {new Date(result.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                        <span className="flex items-center space-x-1">
                          {result.isStarred && (
                            <Star size={14} className="text-yellow-400" />
                          )}
                          {result.isPinned && (
                            <Pin size={14} className="text-purple-400" />
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media Grid Overlay */}
        <AnimatePresence>
          {showMediaGrid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center"
            >
              <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl p-4 w-full max-w-3xl">
                <div className="flex items-center mb-4">
                  <h3 className="text-white font-medium text-lg flex-1">
                    Media, Links, and Docs
                  </h3>
                  <button
                    onClick={() => setShowMediaGrid(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {mediaItems.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-4 col-span-2">
                      No media found.
                    </p>
                  )}
                  {mediaItems.map((item) => (
                    <div
                      key={item.url}
                      className="group relative rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => {
                        // Open media in full screen or modal
                      }}
                    >
                      {item.type === 'image' ? (
                        <Image
                          src={item.url}
                          alt="Media"
                          width={200}
                          height={200}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <Play size={40} className="text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="text-white text-sm font-medium">
                          {item.type === 'image' ? 'Image' : 'Video'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wallpaper Picker */}
        <AnimatePresence>
          {showWallpaperPicker && renderWallpaperPicker()}
        </AnimatePresence>

        {/* Date Picker */}
        <AnimatePresence>
          {showDatePicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg flex items-center justify-center"
            >
              <div className="bg-gray-900/95 rounded-xl border border-white/10 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-medium">Jump to Date</h3>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                {/* Add your preferred date picker component here */}
                <input
                  type="date"
                  onChange={(e) => handleJumpToDate(new Date(e.target.value))}
                  className="w-full bg-white/10 border-none rounded-lg px-4 py-2 text-white"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media Viewer */}
        <AnimatePresence>
          {selectedMedia && (
            <MediaViewer
              media={selectedMedia}
              onClose={() => setSelectedMedia(null)}
            />
          )}
        </AnimatePresence>

        {/* Lock Screen */}
        {isLocked && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
            <div className="bg-gray-900 p-6 rounded-xl border border-white/10 shadow-lg text-center">
              <h2 className="text-xl font-bold mb-4">Chat Locked</h2>
              <p className="mb-4">{unlockError || 'This chat is locked. Only participants can view.'}</p>
            </div>
          </div>
        )}

        {/* Unlock Prompt */}
        {showUnlockPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
            <div className="bg-gray-900 p-6 rounded-xl border border-white/10 shadow-lg text-center">
              <h2 className="text-xl font-bold mb-4">Unlock Chat</h2>
              <input
                type="password"
                value={unlockPin}
                onChange={e => setUnlockPin(e.target.value)}
                placeholder="Enter chat PIN"
                className="mb-4 px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
              />
              <button
                onClick={handleUnlock}
                className="px-6 py-2 bg-purple-600 rounded-lg font-medium"
              >
                Unlock
              </button>
              {unlockError && <p className="text-red-400 mt-2">{unlockError}</p>}
            </div>
          </div>
        )}

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* AI Panel */}
        {showAIPanel && (
          <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 border-b border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="text-yellow-400" size={16} />
                <span className="text-sm font-medium">AI Assistant</span>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 rounded bg-white/10 hover:bg-white/20 transition-all">
                  <Globe size={14} />
                </button>
                <button className="p-1 rounded bg-white/10 hover:bg-white/20 transition-all">
                  <Bot size={14} />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-300 mb-2">Smart Suggestions:</div>
            <div className="space-y-1">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(suggestion)}
                  className="w-full text-left text-xs p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-105"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Panel */}
        {showPrivacyPanel && (
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 p-4 border-b border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Lock className="text-red-400" size={16} />
                <span className="text-sm font-medium">Privacy Controls</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setVanishMode(!vanishMode)}
                className={`p-2 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  vanishMode ? 'bg-red-500/30 text-red-300' : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {vanishMode ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>Vanish Mode</span>
              </button>
              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center space-x-1">
                <Clock size={14} />
                <span>Timer</span>
              </button>
            </div>
          </div>
        )}

        {/* Pinned Messages */}
        {pinnedMessages.length > 0 && (
          <div className="bg-yellow-900/30 p-3 border-b border-white/10">
            <div className="flex items-center space-x-2 mb-2">
              <Pin className="text-yellow-400" size={14} />
              <span className="text-xs font-medium">Pinned Messages</span>
            </div>
            <div className="text-xs text-gray-300">
              {pinnedMessages.length} message(s) pinned
            </div>
          </div>
        )}

        {/* Quick Actions Bar */}
        <div className="px-4 py-2 bg-black/20 backdrop-blur-md border-t border-white/10">
          <div className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setShowMediaSearch(!showMediaSearch)}
              className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs whitespace-nowrap"
            >
              <Search size={12} />
              <span>Media</span>
            </button>
            <button
              onClick={() => setShowApplets(!showApplets)}
              className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs whitespace-nowrap"
            >
              <Settings size={12} />
              <span>Apps</span>
            </button>
            <button
              onClick={() => setShowThemeModal(true)}
              className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs whitespace-nowrap"
            >
              <Palette size={12} />
              <span>Theme</span>
            </button>
          </div>
        </div>

        {/* Add Theme Modal (loads /theme page as a modal) */}
        <AnimatePresence>
          {showThemeModal && (
            <ThemeModal
              isOpen={showThemeModal}
              currentTheme={selectedTheme}
              onSelect={async (themeId: string) => {
                setSelectedTheme(themeId);
                setShowThemeModal(false);
                // Save to DB for this chat
                await fetch(`/api/chat/${chatId}/theme`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ theme: themeId }),
                });
              }}
              onClose={() => setShowThemeModal(false)}
            />
          )}
        </AnimatePresence>

        {/* Media Search Panel */}
        {showMediaSearch && (
          <div className="bg-black/30 backdrop-blur-md p-4 border-t border-white/10 max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Media & Files</span>
              <button
                onClick={() => setShowMediaSearch(false)}
                className="text-gray-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoMediaItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                    {item.type === 'image' && <ImageIcon size={16} />}
                    {item.type === 'video' && <Play size={16} />}
                    {item.type === 'document' && <FileText size={16} />}
                    {item.type === 'link' && <Link size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white truncate">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applets Panel */}
        {showApplets && (
          <div className="bg-black/30 backdrop-blur-md p-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Chat Applets</span>
              <button
                onClick={() => setShowApplets(false)}
                className="text-gray-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {applets.map((applet, index) => (
                <button
                  key={index}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-105 text-center"
                >
                  <div className="text-2xl mb-1">{applet.icon}</div>
                  <div className="text-xs font-medium">{applet.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
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

// Add this CSS animation to your global styles or component
const styles = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;