'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Search, Settings, ChevronDown, LogOut, Users, Plus, Sparkles,
  Archive, Pin, MoreVertical, Check, CheckCheck, Volume2, VolumeX,
  Star, Trash2, MessageSquare, Phone, Video, Info, Edit, Camera,
  Mic, Send, Filter, SortAsc, Bell, BellOff, Eye, EyeOff, Lock,
  Shield, Moon, Sun, Palette, Globe, HelpCircle, Bug, Heart
} from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import LoadingPage from '@/components/chat/LoadingPage';
import ImageViewer from '@/components/ImageViewer';
import { useBlurOverlay } from '../layout';

// Enhanced Chat type definition
interface Chat {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastActive?: Date;
  lastMessage: {
    id: string;
    content: string;
    mediaUrl?: string;
    createdAt: Date;
    senderId: string;
    chatId: string;
    isRead: boolean;
    status: 'sent' | 'delivered' | 'read';
    timestamp: Date;
    sender?: {
      name: string;
      avatar?: string;
    };
    type?: 'text' | 'image' | 'video' | 'audio' | 'document';
  };
  timestamp: Date;
  unread: number;
  isGroup: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isMuted?: boolean;
  isTyping?: boolean;
  participants?: number;
  lastSeen?: Date;
  encryptionStatus?: 'encrypted' | 'unencrypted';
}

const formatTimestamp = (timestamp: Date | string) => {
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const day = 24 * 60 * 60 * 1000;
    
    if (diff < 60000) { // Less than 1 minute
      return 'now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m`;
    } else if (diff < day) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 7 * day) {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
};

const getMessageStatusIcon = (status: string, isOwn: boolean) => {
  if (!isOwn) return null;
  
  switch (status) {
    case 'sent':
      return <Check size={12} className="text-gray-400" />;
    case 'delivered':
      return <CheckCheck size={12} className="text-gray-400" />;
    case 'read':
      return <CheckCheck size={12} className="text-blue-400" />;
    default:
      return null;
  }
};

const getMessageTypeIcon = (type?: string) => {
  switch (type) {
    case 'image':
      return <Camera size={12} className="text-green-400" />;
    case 'video':
      return <Video size={12} className="text-purple-400" />;
    case 'audio':
      return <Mic size={12} className="text-orange-400" />;
    case 'document':
      return <MessageSquare size={12} className="text-blue-400" />;
    default:
      return null;
  }
};

export default function ChatListPage() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<'time' | 'unread' | 'name'>('time');
  const [filterBy, setFilterBy] = useState<'all' | 'unread' | 'groups' | 'contacts'>('all');
  const [contextMenu, setContextMenu] = useState<{chatId: string, x: number, y: number} | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedProfileImage, setSelectedProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBlur, setShowBlur] = useState(false); // Blur overlay state for dropdown
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { setBlur } = useBlurOverlay();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/chats');
        if (!response.ok) {
          throw new Error('Failed to fetch chats');
        }
        const data = await response.json();
        
        if (!data.chats) {
          console.error('No chats data received:', data);
          setChats([]);
          setFilteredChats([]);
          return;
        }

        const processedChats = data.chats.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp),
          lastMessage: chat.lastMessage ? {
            ...chat.lastMessage,
            timestamp: new Date(chat.lastMessage.timestamp),
            createdAt: new Date(chat.lastMessage.createdAt)
          } : null
        }));
        
        setChats(processedChats);
        setFilteredChats(processedChats);
      } catch (error) {
        console.error('Error fetching chats:', error);
        setChats([]);
        setFilteredChats([]);
      } finally {
        // Add delay for smooth transition
        setTimeout(() => setIsLoading(false), 1500);
      }
    };

    fetchChats();
  }, [session]);

  // Enhanced filtering and sorting
  useEffect(() => {
    let filtered = chats.filter(chat => {
      // Search filter
      const matchesSearch = !searchQuery || 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Archive filter
      const matchesArchive = showArchived ? chat.isArchived : !chat.isArchived;
      
      // Category filter
      let matchesCategory = true;
      switch (filterBy) {
        case 'unread':
          matchesCategory = chat.unread > 0;
          break;
        case 'groups':
          matchesCategory = chat.isGroup;
          break;
        case 'contacts':
          matchesCategory = !chat.isGroup;
          break;
      }
      
      return matchesSearch && matchesArchive && matchesCategory;
    });

    // Sort chats
    filtered.sort((a, b) => {
      // Pinned chats always come first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      switch (sortBy) {
        case 'unread':
          return b.unread - a.unread;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'time':
        default:
          return b.timestamp.getTime() - a.timestamp.getTime();
      }
    });

    setFilteredChats(filtered);
  }, [searchQuery, chats, showArchived, sortBy, filterBy]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.menu-container')) {
        setIsMenuOpen(false);
      }
      if (contextMenu && !target.closest('.context-menu')) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, contextMenu]);

  // When menu opens, show blur overlay
  useEffect(() => {
    setShowBlur(isMenuOpen);
    return () => setShowBlur(false);
  }, [isMenuOpen]);

  const handleChatSelect = (chatId: string) => {
    if (isSelectionMode) {
      const newSelected = new Set(selectedChats);
      if (newSelected.has(chatId)) {
        newSelected.delete(chatId);
      } else {
        newSelected.add(chatId);
      }
      setSelectedChats(newSelected);
      
      if (newSelected.size === 0) {
        setIsSelectionMode(false);
      }
    } else {
      router.push(`/chat/${chatId}`);
    }
  };

  const handleLongPress = (chatId: string) => {
    setIsSelectionMode(true);
    setSelectedChats(new Set([chatId]));
  };

  const handleContextMenu = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    setContextMenu({
      chatId,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleChatAction = async (action: string, chatId?: string) => {
    const targetChats = chatId ? [chatId] : Array.from(selectedChats);
    
    try {
      switch (action) {
        case 'pin':
          await Promise.all(targetChats.map(id => 
            fetch(`/api/chats/${id}/pin`, { method: 'POST' })
          ));
          break;
        case 'unpin':
          await Promise.all(targetChats.map(id => 
            fetch(`/api/chats/${id}/unpin`, { method: 'POST' })
          ));
          break;
        case 'archive':
          await Promise.all(targetChats.map(id => 
            fetch(`/api/chats/${id}/archive`, { method: 'POST' })
          ));
          break;
        case 'unarchive':
          await Promise.all(targetChats.map(id => 
            fetch(`/api/chats/${id}/unarchive`, { method: 'POST' })
          ));
          break;
        case 'mute':
          await Promise.all(targetChats.map(id => 
            fetch(`/api/chats/${id}/mute`, { method: 'POST' })
          ));
          break;
        case 'unmute':
          await Promise.all(targetChats.map(id => 
            fetch(`/api/chats/${id}/unmute`, { method: 'POST' })
          ));
          break;
        case 'markRead':
          await Promise.all(targetChats.map(id => 
            fetch(`/api/chats/${id}/mark-read`, { method: 'POST' })
          ));
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this chat?')) {
            await Promise.all(targetChats.map(id => 
              fetch(`/api/chats/${id}`, { method: 'DELETE' })
            ));
          }
          break;
      }
      
      // Refresh chats after action
      const response = await fetch('/api/chats');
      const data = await response.json();
      if (data.chats) {
        const processedChats = data.chats.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp),
          lastMessage: chat.lastMessage ? {
            ...chat.lastMessage,
            timestamp: new Date(chat.lastMessage.timestamp),
            createdAt: new Date(chat.lastMessage.createdAt)
          } : null
        }));
        setChats(processedChats);
      }
    } catch (error) {
      console.error('Error performing chat action:', error);
    }
    
    setContextMenu(null);
    setIsSelectionMode(false);
    setSelectedChats(new Set());
  };

  const handleNewChat = () => {
    router.push('/contacts');
  };

  const handleCreateGroup = () => {
    router.push('/create-group');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleCall = (chatId: string, type: 'voice' | 'video') => {
    router.push(`/call/${chatId}?type=${type}`);
  };

  if (status === 'loading' || isLoading) {
    return <LoadingPage />;
  }

  if (!session) {
    return <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">Please sign in</div>;
  }

  const archivedCount = chats.filter(chat => chat.isArchived).length;
  const unreadCount = chats.filter(chat => chat.unread > 0).length;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative">
      {/* Blur overlay for dropdown */}
      {showBlur && (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-all duration-300" />
      )}

      {/* Background glowing elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25"></div>
      </div>

      {/* Header */}
      <div className={`relative flex items-center justify-between p-4 border-b border-white/10 bg-black/30 backdrop-blur-lg z-50`}>
        {isSelectionMode ? (
          /* Selection Mode Header */
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedChats(new Set());
                }}
                className="mr-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                ✕
              </button>
              <span className="text-xl font-semibold text-white">
                {selectedChats.size} selected
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleChatAction('pin')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Pin size={20} className="text-gray-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleChatAction('archive')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Archive size={20} className="text-gray-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleChatAction('mute')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <VolumeX size={20} className="text-gray-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleChatAction('markRead')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <CheckCheck size={20} className="text-gray-300" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleChatAction('delete')}
                className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
              >
                <Trash2 size={20} className="text-red-400" />
              </motion.button>
            </div>
          </div>
        ) : (
          /* Normal Header */
          <>
            <div className="flex items-center menu-container relative">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                  Chats
                </h1>
                
                {unreadCount > 0 && (
                  <div className="ml-3 px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="ml-2 p-1.5 rounded-full hover:bg-white/10 transition-all text-gray-400"
              >
                <ChevronDown size={18} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-14 left-0 w-64 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50"
                    style={{ boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.1), 0 8px 10px -6px rgba(124, 58, 237, 0.1)' }}
                  >
                    <div className="p-3 border-b border-white/10">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-cyan-400 p-0.5">
                          <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                            {session?.user?.image ? (
                              <Image
                                src={session.user.image}
                                alt={session.user.name || 'User'}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                                {session?.user?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-white">{session?.user?.name || 'User'}</p>
                          <p className="text-xs text-gray-400">{session?.user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-1">
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateGroup}
                        className="flex items-center w-full p-2 rounded-lg transition-colors text-gray-200"
                      >
                        <Users size={18} className="mr-2 text-purple-400" />
                        Create Group
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowArchived(!showArchived)}
                        className="flex items-center w-full p-2 rounded-lg transition-colors text-gray-200"
                      >
                        <Archive size={18} className="mr-2 text-orange-400" />
                        Archived ({archivedCount})
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSettings}
                        className="flex items-center w-full p-2 rounded-lg transition-colors text-gray-200"
                      >
                        <Settings size={18} className="mr-2 text-cyan-400" />
                        Settings
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 0, 0, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/api/auth/signout')}
                        className="flex items-center w-full p-2 text-red-400 rounded-lg transition-colors"
                      >
                        <LogOut size={18} className="mr-2" />
                        Sign Out
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all text-gray-200 border border-white/10"
                onClick={() => setShowQuickActions(!showQuickActions)}
              >
                <Filter size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all text-gray-200 border border-white/10"
                onClick={handleSettings}
              >
                <Settings size={20} />
              </motion.button>
            </div>
          </>
        )}
      </div>

      {/* Search and Filters */}
      <div className="px-4 py-3 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 bg-white/10 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-md transition-all text-white placeholder-gray-400"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Filters */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center space-x-3 mt-3 overflow-x-auto"
            >
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-3 py-1 bg-white/10 border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="all">All Chats</option>
                <option value="unread">Unread</option>
                <option value="groups">Groups</option>
                <option value="contacts">Contacts</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 bg-white/10 border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="time">Recent</option>
                <option value="unread">Unread First</option>
                <option value="name">Name</option>
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 relative z-10">
        {filteredChats.length > 0 ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ 
                    scale: 1.01, 
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    boxShadow: "0 0 20px rgba(124, 58, 237, 0.1)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center p-4 border-b border-white/5 cursor-pointer ${
                    chat.unread > 0 ? 'bg-purple-500/10' : ''
                  } ${selectedChats.has(chat.id) ? 'bg-blue-500/20' : ''} ${
                    chat.isPinned ? 'border-l-4 border-l-yellow-500' : ''
                  }`}
                  onClick={() => handleChatSelect(chat.id)}
                  onContextMenu={(e) => handleContextMenu(e, chat.id)}
                  onTouchStart={(e) => {
                    const touchTimeout = setTimeout(() => handleLongPress(chat.id), 500);
                    const handleTouchEnd = () => {
                      clearTimeout(touchTimeout);
                      document.removeEventListener('touchend', handleTouchEnd);
                    };
                    document.addEventListener('touchend', handleTouchEnd);
                  }}
                >
                  {/* Selection Checkbox */}
                  {isSelectionMode && (
                    <div className="mr-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedChats.has(chat.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                      }`}>
                        {selectedChats.has(chat.id) && <Check size={12} className="text-white" />}
                      </div>
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-indigo-800/50 to-purple-900/50 p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                        {chat.avatar ? (
                          <Image
                            src={chat.avatar}
                            alt={chat.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-white font-medium">
                            {chat.name[0]}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {chat.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
                    )}
                    {chat.isGroup && (
                      <div className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1 border-2 border-gray-900">
                        <Users size={10} className="text-white" />
                      </div>
                    )}
                    {chat.encryptionStatus === 'encrypted' && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-gray-900">
                        <Shield size={8} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-medium text-white">{chat.name}</h2>
                        {chat.isPinned && <Pin size={14} className="text-yellow-500" />}
                        {chat.isMuted && <VolumeX size={14} className="text-gray-500" />}
                        {chat.isTyping && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(chat.timestamp)}
                        </span>
                        {chat.lastMessage && (
                          <div className="flex items-center mt-1 space-x-1">
                            {getMessageTypeIcon(chat.lastMessage.type)}
                            {getMessageStatusIcon(chat.lastMessage.status, chat.lastMessage.senderId === session?.user?.id)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center space-x-2 flex-1">
                        {chat.isGroup && chat.lastMessage?.sender && (
                          <span className="text-xs text-gray-500">
                            {chat.lastMessage.sender.name}:
                          </span>
                        )}
                        <p className="text-sm text-gray-400 truncate flex-1">
                          {chat.isTyping ? 'typing...' : (chat.lastMessage?.content || 'No messages yet')}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {chat.unread > 0 && (
                          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-lg shadow-purple-500/20 px-1">
                            {chat.unread > 99 ? '99+' : chat.unread}
                          </div>
                        )}
                        
                        {/* Quick Action Buttons (visible on hover) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCall(chat.id, 'voice');
                            }}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                          >
                            <Phone size={14} className="text-green-400" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCall(chat.id, 'video');
                            }}
                            className="p-1 hover:bg-white/10 rounded-full transition-colors"
                          >
                            <Video size={14} className="text-blue-400" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Info Row */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {chat.isGroup && (
                          <span className="flex items-center">
                            <Users size={10} className="mr-1" />
                            {chat.participants || 0}
                          </span>
                        )}
                        {chat.lastSeen && !chat.isOnline && (
                          <span>
                            last seen {formatTimestamp(chat.lastSeen)}
                          </span>
                        )}
                        {chat.encryptionStatus === 'encrypted' && (
                          <span className="flex items-center text-green-400">
                            <Lock size={10} className="mr-1" />
                            E2E
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {chat.isPinned && <Star size={10} className="text-yellow-500" />}
                        {chat.isArchived && <Archive size={10} className="text-gray-500" />}
                        {chat.isMuted && <BellOff size={10} className="text-gray-500" />}
                      </div>
                    </div>
                  </div>

                  {/* Context Menu Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e, chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-full transition-all ml-2"
                  >
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-6 mb-6 border border-white/10"
            >
              <Sparkles size={40} className="text-purple-500" />
            </motion.div>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-medium text-white"
            >
              {searchQuery ? 'No results found' : 'No conversations yet'}
            </motion.p>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm mt-2 mb-6 text-gray-400"
            >
              {searchQuery ? `No chats match "${searchQuery}"` : 'Start a new chat to begin messaging'}
            </motion.p>
            {!searchQuery && (
              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewChat}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl flex items-center shadow-lg shadow-purple-500/20"
              >
                <Plus size={18} className="mr-2" />
                Start a new chat
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 context-menu"
            style={{
              left: Math.min(contextMenu.x, window.innerWidth - 200),
              top: Math.min(contextMenu.y, window.innerHeight - 300),
            }}
          >
            <div className="p-2 min-w-[180px]">
              {(() => {
                const chat = chats.find(c => c.id === contextMenu.chatId);
                return (
                  <>
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                      onClick={() => handleChatAction(chat?.isPinned ? 'unpin' : 'pin', contextMenu.chatId)}
                      className="flex items-center w-full p-2 rounded-lg transition-colors text-gray-200 text-sm"
                    >
                      <Pin size={16} className="mr-3 text-yellow-400" />
                      {chat?.isPinned ? 'Unpin' : 'Pin'} Chat
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                      onClick={() => handleChatAction(chat?.isMuted ? 'unmute' : 'mute', contextMenu.chatId)}
                      className="flex items-center w-full p-2 rounded-lg transition-colors text-gray-200 text-sm"
                    >
                      {chat?.isMuted ? 
                        <Volume2 size={16} className="mr-3 text-green-400" /> :
                        <VolumeX size={16} className="mr-3 text-orange-400" />
                      }
                      {chat?.isMuted ? 'Unmute' : 'Mute'} Chat
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                      onClick={() => handleChatAction('markRead', contextMenu.chatId)}
                      className="flex items-center w-full p-2 rounded-lg transition-colors text-gray-200 text-sm"
                    >
                      <CheckCheck size={16} className="mr-3 text-blue-400" />
                      Mark as Read
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                      onClick={() => handleChatAction(chat?.isArchived ? 'unarchive' : 'archive', contextMenu.chatId)}
                      className="flex items-center w-full p-2 rounded-lg transition-colors text-gray-200 text-sm"
                    >
                      <Archive size={16} className="mr-3 text-purple-400" />
                      {chat?.isArchived ? 'Unarchive' : 'Archive'} Chat
                    </motion.button>
                    
                    <div className="border-t border-white/10 my-1"></div>
                    
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(255, 0, 0, 0.1)" }}
                      onClick={() => router.push(`/chat/${contextMenu.chatId}/info`)}
                      className="flex items-center w-full p-2 rounded-lg transition-colors text-gray-200 text-sm"
                    >
                      <Info size={16} className="mr-3 text-cyan-400" />
                      Chat Info
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(255, 0, 0, 0.1)" }}
                      onClick={() => handleChatAction('delete', contextMenu.chatId)}
                      className="flex items-center w-full p-2 rounded-lg transition-colors text-red-400 text-sm"
                    >
                      <Trash2 size={16} className="mr-3" />
                      Delete Chat
                    </motion.button>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button for new chat */}
      <motion.div 
        className="absolute bottom-6 right-6 z-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
      >
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(124, 58, 237, 0.5)" }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNewChat}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-full shadow-xl shadow-purple-500/30 text-white transition-all"
        >
          <User size={24} />
        </motion.button>
      </motion.div>

      {/* Quick Actions Panel */}
      <AnimatePresence>
        {isSelectionMode && selectedChats.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-white/10 p-4 z-30"
          >
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChatAction('pin')}
                className="flex flex-col items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Pin size={20} className="text-yellow-400 mb-1" />
                <span className="text-xs text-gray-300">Pin</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChatAction('mute')}
                className="flex flex-col items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <VolumeX size={20} className="text-orange-400 mb-1" />
                <span className="text-xs text-gray-300">Mute</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChatAction('archive')}
                className="flex flex-col items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Archive size={20} className="text-purple-400 mb-1" />
                <span className="text-xs text-gray-300">Archive</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChatAction('markRead')}
                className="flex flex-col items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <CheckCheck size={20} className="text-blue-400 mb-1" />
                <span className="text-xs text-gray-300">Read</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChatAction('delete')}
                className="flex flex-col items-center p-3 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={20} className="text-red-400 mb-1" />
                <span className="text-xs text-gray-300">Delete</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer */}
      <AnimatePresence>
        {selectedImage && (
          <ImageViewer
            imageUrl={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>

      {/* Profile Image Viewer */}
      <AnimatePresence>
        {selectedProfileImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center"
            onClick={() => setSelectedProfileImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <Image
                src={selectedProfileImage}
                alt="Profile"
                width={800}
                height={800}
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}