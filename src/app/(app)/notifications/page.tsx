'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, UserPlus, MessageSquare, Users, ArrowLeft, Check, X, Zap, Eye, EyeOff } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  type: string;
  content: string;
  fromUserId: string | null;
  read: boolean;
  createdAt: string;
  fromUser?: {
    id: string;
    name: string;
    profileImage: string | null;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredNotification, setHoveredNotification] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pinPrompt, setPinPrompt] = useState(false);
  const [notificationPin, setNotificationPin] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const headers: any = {};
        if (notificationPin) headers['x-notification-pin'] = notificationPin;
        const response = await fetch('/api/notifications', { headers });
        
        if (!response.ok) {
          if (response.status === 401) setPinPrompt(true);
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        setError('Failed to load notifications');
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [notificationPin]);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleAction = async (notificationId: string, accept: boolean) => {
    setActionLoading(notificationId);
    try {
      const response = await fetch('/api/contacts/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, accept })
      });

      if (!response.ok) throw new Error('Failed to process action');

      // Animate out before removing
      setTimeout(() => {
        setNotifications(prev => 
          prev.filter(n => n.id !== notificationId)
        );
      }, 500);
    } catch (error) {
      console.error('Error handling notification action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconProps = { size: 20 };
    switch (type) {
      case 'CONTACT_REQUEST':
        return <UserPlus {...iconProps} className="text-cyan-400" />;
      case 'MESSAGE':
        return <MessageSquare {...iconProps} className="text-purple-400" />;
      case 'GROUP':
        return <Users {...iconProps} className="text-indigo-400" />;
      default:
        return <Bell {...iconProps} className="text-gray-400" />;
    }
  };

  const getNotificationGlow = (type: string) => {
    switch (type) {
      case 'CONTACT_REQUEST':
        return 'shadow-cyan-500/50';
      case 'MESSAGE':
        return 'shadow-purple-500/50';
      case 'GROUP':
        return 'shadow-indigo-500/50';
      default:
        return 'shadow-gray-500/50';
    }
  };

  const renderNotificationActions = (notification: Notification) => {
    if (notification.type === 'CONTACT_REQUEST') {
      const isLoading = actionLoading === notification.id;
      
      return (
        <motion.div 
          className="flex space-x-3 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction(notification.id, true)}
            disabled={isLoading}
            className="relative group p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white
                     shadow-lg shadow-green-500/25 border border-green-400/30
                     hover:from-green-400 hover:to-emerald-400 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Zap size={18} />
                </motion.div>
              ) : (
                <motion.div key="check">
                  <Check size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction(notification.id, false)}
            disabled={isLoading}
            className="relative group p-3 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl text-white
                     shadow-lg shadow-red-500/25 border border-red-400/30
                     hover:from-red-400 hover:to-rose-400 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Zap size={18} />
                </motion.div>
              ) : (
                <motion.div key="x">
                  <X size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-transparent border-t-purple-500 border-r-cyan-500 
                            rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-8 h-8 border-2 border-transparent border-b-indigo-500 
                            border-l-pink-500 rounded-full animate-spin animate-reverse"></div>
            </div>
            <motion.p 
              className="text-white text-lg font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Loading notifications...
            </motion.p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <X size={32} className="text-red-400" />
          </div>
          <p className="text-red-400 text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl animate-pulse"></div>
        
        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Enhanced header */}
      <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-white/10 p-4
                    shadow-lg shadow-black/50">
        <div className="flex items-center">
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="p-3 rounded-full hover:bg-white/10 transition-all duration-300 mr-4
                     border border-white/5 shadow-lg shadow-black/25"
          >
            <ArrowLeft size={20} className="text-white" />
          </motion.button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg shadow-lg">
              <Bell size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Notifications</h1>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6">
        {/* Enhanced title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent 
                       bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-400 mb-2">
            Your Notifications
          </h1>
          <p className="text-gray-400">Stay updated with your latest activities</p>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, x: -100 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100 
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className={`group relative p-6 rounded-2xl border backdrop-blur-sm
                           cursor-pointer overflow-hidden transition-all duration-300
                           ${notification.read 
                             ? 'bg-black/20 border-white/5 hover:bg-black/30' 
                             : 'bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 border-purple-500/20 hover:border-purple-400/30'
                           } ${getNotificationGlow(notification.type)}`}
                  onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                  onMouseEnter={() => setHoveredNotification(notification.id)}
                  onMouseLeave={() => setHoveredNotification(null)}
                >
                  {/* Animated border glow */}
                  {!notification.read && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-cyan-500/20 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  )}

                  {/* Content */}
                  <div className="flex items-start space-x-4 relative z-10">
                    {/* Enhanced icon with glow effect */}
                    <motion.div 
                      className={`relative p-3 rounded-xl shadow-lg transition-all duration-300
                               ${notification.type === 'CONTACT_REQUEST' 
                                 ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' 
                                 : notification.type === 'MESSAGE'
                                 ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30'
                                 : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30'
                               }`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {getNotificationIcon(notification.type)}
                      
                      {/* Pulsing ring for unread notifications */}
                      {!notification.read && (
                        <div className="absolute inset-0 rounded-xl border-2 border-purple-400/50 
                                      animate-ping opacity-75"></div>
                      )}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <motion.p 
                        className="text-white font-medium leading-relaxed"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 1 }}
                      >
                        {notification.content}
                      </motion.p>
                      
                      <div className="flex items-center space-x-3 mt-2">
                        <p className="text-sm text-gray-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                        
                        {/* Read status indicator */}
                        <div className="flex items-center space-x-1">
                          {notification.read ? (
                            <Eye size={12} className="text-gray-500" />
                          ) : (
                            <EyeOff size={12} className="text-purple-400" />
                          )}
                          <span className="text-xs text-gray-500">
                            {notification.read ? 'Read' : 'New'}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced action buttons */}
                      {renderNotificationActions(notification)}
                    </div>

                    {/* Unread indicator with enhanced styling */}
                    {!notification.read && (
                      <motion.div 
                        className="relative"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full
                                      shadow-lg shadow-purple-500/50"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-purple-500 to-cyan-500 
                                      rounded-full animate-ping opacity-75"></div>
                      </motion.div>
                    )}
                  </div>

                  {/* Hover effect overlay */}
                  {hoveredNotification === notification.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-2xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="relative mx-auto mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500/20 to-cyan-500/20 
                              rounded-full flex items-center justify-center backdrop-blur-sm
                              border border-white/10 shadow-2xl">
                  <Bell size={32} className="text-gray-400" />
                </div>
                
                {/* Animated rings around empty state */}
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border border-cyan-500/20 animate-pulse"></div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
              <p className="text-gray-400">No new notifications at the moment</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* PIN Prompt UI */}
      {pinPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">Notifications Locked</h2>
            <input
              type="password"
              value={notificationPin}
              onChange={e => setNotificationPin(e.target.value)}
              placeholder="Enter notifications PIN"
              className="mb-4 px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <button
              onClick={() => { setPinPrompt(false); fetchNotifications(); }}
              className="px-6 py-2 bg-purple-600 rounded-lg font-medium"
            >
              Unlock
            </button>
            {pinError && <p className="text-red-400 mt-2">{pinError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}