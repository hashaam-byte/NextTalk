'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Search, Settings, ChevronDown, LogOut, Users, Plus, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Chat type definition
interface Chat {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;  // Add isOnline status
  lastActive?: Date;  // Add lastActive timestamp
  lastMessage: {
    id: string;
    content: string;
    mediaUrl?: string;
    createdAt: Date;
    senderId: string;
    chatId: string;
    isRead: boolean;
    status: string;
    timestamp: Date;
    sender?: {
      name: string;
      avatar?: string;
    };
  };
  timestamp: Date;
  unread: number;
  isGroup: boolean;
}

const formatTimestamp = (timestamp: Date | string) => {
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const day = 24 * 60 * 60 * 1000;
    
    if (diff < day) {
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

export default function ChatListPage() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

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
      }
    };

    fetchChats();
  }, [session]);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery) {
      setFilteredChats(
        chats.filter(chat =>
          chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
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

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    // Handle unauthenticated state
    return <div>Please sign in</div>;
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25"></div>
      </div>

      {/* Header with dropdown */}
      <div className="relative z-30">
        <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/10 bg-black/30 backdrop-blur-lg">
          <div className="flex items-center menu-container relative">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
              Chats
            </h1>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-2 p-1.5 rounded-full hover:bg-white/10 transition-all text-gray-400"
            >
              <ChevronDown size={18} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all text-gray-200 border border-white/10"
              onClick={handleSettings}
            >
              <Settings size={20} />
            </motion.button>
          </div>
        </div>

        {/* Dropdown Menu with Backdrop */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Dropdown Menu */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-14 left-4 w-64 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50"
              >
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur"></div>
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-cyan-400 p-0.5 relative">
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
                              {session?.user?.name?.[0].toUpperCase() || '?'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {session?.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateGroup}
                    className="flex items-center w-full p-2.5 rounded-lg transition-all text-gray-200 hover:bg-white/5"
                  >
                    <Users size={18} className="mr-3 text-purple-400" />
                    <span className="text-sm">Create Group</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSettings}
                    className="flex items-center w-full p-2.5 rounded-lg transition-all text-gray-200 hover:bg-white/5"
                  >
                    <Settings size={18} className="mr-3 text-cyan-400" />
                    <span className="text-sm">Settings</span>
                  </motion.button>

                  <div className="my-2 border-t border-white/10"></div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/api/auth/signout')}
                    className="flex items-center w-full p-2.5 text-red-400 rounded-lg transition-all hover:bg-red-950/20"
                  >
                    <LogOut size={18} className="mr-3" />
                    <span className="text-sm">Sign Out</span>
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="px-3 sm:px-4 py-3 bg-black/20 backdrop-blur-sm">
        <div className="relative max-w-lg mx-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 bg-white/10 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-md transition-all"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 z-10">
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
                  }`}
                  onClick={() => handleChatSelect(chat.id)}
                >
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
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-medium text-white">{chat.name}</h2>
                      <span className="text-xs text-gray-400">
                        {formatTimestamp(chat.timestamp)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-sm text-gray-400 truncate max-w-[200px]">
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      {chat.unread > 0 && (
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-purple-500/20">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
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
              No conversations yet
            </motion.p>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm mt-2 mb-6 text-gray-400"
            >
              Start a new chat to begin messaging
            </motion.p>
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
          </div>
        )}
      </div>

      {/* Floating Action Button for new chat */}
      <motion.div 
        className="fixed bottom-6 right-4 sm:right-6 z-20"
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
    </div>
  );
}