// src/components/Navbar.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Search, Settings, ChevronDown, 
  LogOut, User, Shield 
} from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleNotificationsClick = async () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen && unreadCount > 0) {
      try {
        // Mark all notifications as read
        await fetch('/api/notifications/mark-all-read', {
          method: 'POST'
        });
        setUnreadCount(0);
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
  };

  const formatNotificationTime = (date: string | Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now.getTime() - messageDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return messageDate.toLocaleDateString();
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

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/unread-count');
        const data = await response.json();
        setUnreadCount(data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    if (session?.user) {
      fetchUnreadCount();
      // Poll for new notifications every minute
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
    };

    if (session?.user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);
  
  return (
    <nav className="sticky top-0 z-50 px-4 py-2 bg-black/30 backdrop-blur-md border-b border-white/10">
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
              onClick={handleNotificationsClick}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-purple-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <>
                  {/* Backdrop overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    onClick={() => setIsNotificationsOpen(false)}
                  />

                  {/* Notifications dropdown */}
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 w-80 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-[70]"
                  >
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification: any) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${
                              !notification.read ? 'bg-purple-500/10' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                                  <Bell size={14} className="text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-200">{notification.content}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatNotificationTime(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400">
                          No notifications
                        </div>
                      )}
                    </div>

                    <div className="p-3 border-t border-white/10">
                      <button
                        onClick={() => {
                          router.push('/notifications');
                          setIsNotificationsOpen(false);
                        }}
                        className="w-full text-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                </>
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
                <>
                  {/* Backdrop overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    onClick={() => setIsProfileOpen(false)}
                  />

                  {/* Profile dropdown */}
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 w-64 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-[70]"
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
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}