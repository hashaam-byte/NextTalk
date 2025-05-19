// src/components/Navbar.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Search, Settings, ChevronDown, 
  LogOut, User, Users, MessageSquare, Shield 
} from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Get page title from pathname
  const getTitle = () => {
    if (pathname.startsWith('/chat')) {
      return 'Chats';
    } else if (pathname.startsWith('/groups')) {
      return 'Groups';
    } else if (pathname.startsWith('/videos')) {
      return 'Videos';
    } else if (pathname === '/camera') {
      return 'Camera';
    } else if (pathname === '/profile') {
      return 'Profile';
    } else if (pathname === '/settings') {
      return 'Settings';
    } else if (pathname === '/home') {
      return 'Home';
    }
    return 'NextTalkWeb';
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mock notifications
  const notifications = [
    {
      id: '1',
      content: 'Alex sent you a message',
      time: '2 min ago',
      read: false,
      type: 'message'
    },
    {
      id: '2',
      content: 'Team meeting at 4:00 PM',
      time: '1 hour ago',
      read: true,
      type: 'reminder'
    },
    {
      id: '3',
      content: 'Sarah mentioned you in a group',
      time: 'Yesterday',
      read: true,
      type: 'mention'
    }
  ];
  
  return (
    <div className="sticky top-0 z-20 px-4 py-2 bg-black/30 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between h-14">
        {/* Page Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
            {getTitle()}
          </h1>
        </div>

        {/* Search Bar */}
        <div className={`hidden md:block relative w-96 transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 bg-white/10 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-md transition-all text-white placeholder-gray-400"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* Right section: Notifications & Profile */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-gray-200 border border-white/10"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-purple-600 rounded-full">
                2
              </span>
            </motion.button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 w-80 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50 overflow-hidden"
                  style={{ boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.1), 0 8px 10px -6px rgba(124, 58, 237, 0.1)' }}
                >
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                      {notifications.filter(n => !n.read).length} new
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-3 border-b border-white/5 ${notification.read ? '' : 'bg-purple-500/10'}`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {notification.type === 'message' && (
                              <div className="p-2 bg-cyan-500/20 rounded-full">
                                <MessageSquare size={16} className="text-cyan-400" />
                              </div>
                            )}
                            {notification.type === 'reminder' && (
                              <div className="p-2 bg-purple-500/20 rounded-full">
                                <Bell size={16} className="text-purple-400" />
                              </div>
                            )}
                            {notification.type === 'mention' && (
                              <div className="p-2 bg-indigo-500/20 rounded-full">
                                <Users size={16} className="text-indigo-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm text-gray-200">{notification.content}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-black/20">
                    <button className="w-full py-2 text-center text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 p-1.5 pl-2 pr-3 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-indigo-800/50 to-purple-900/50 p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                  {session?.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white font-medium">
                      {session?.user?.name?.[0] || 'U'}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-white text-sm hidden sm:block">{session?.user?.name || 'User'}</span>
              <ChevronDown 
                size={16} 
                className={`text-gray-400 hidden sm:block transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} 
              />
            </motion.button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 w-64 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50"
                  style={{ boxShadow: '0 10px 25px -5px rgba(124, 58, 237, 0.1), 0 8px 10px -6px rgba(124, 58, 237, 0.1)' }}
                >
                  <div className="p-4 border-b border-white/10">
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
                              {session?.user?.name?.[0].toUpperCase() || 'U'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-white">{session?.user?.name || 'User'}</p>
                        <p className="text-xs text-gray-400">{session?.user?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1">
                    <Link href="/profile">
                      <motion.div
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center w-full p-2 rounded-lg transition-colors text-gray-200"
                      >
                        <User size={18} className="mr-2 text-purple-400" />
                        My Profile
                      </motion.div>
                    </Link>
                    <Link href="/settings">
                      <motion.div
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center w-full p-2 rounded-lg transition-colors text-gray-200"
                      >
                        <Settings size={18} className="mr-2 text-cyan-400" />
                        Settings
                      </motion.div>
                    </Link>
                    <Link href="/privacy">
                      <motion.div
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center w-full p-2 rounded-lg transition-colors text-gray-200"
                      >
                        <Shield size={18} className="mr-2 text-green-400" />
                        Privacy
                      </motion.div>
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 0, 0, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSignOut}
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
        </div>
      </div>
    </div>
  );
}