'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, UserPlus, MessageSquare, Users, ArrowLeft, Check, X } from 'lucide-react';

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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) throw new Error('Failed to fetch notifications');
        
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
  }, []);

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
    try {
      const response = await fetch('/api/contacts/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, accept })
      });

      if (!response.ok) throw new Error('Failed to process action');

      // Remove the notification from local state
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'CONTACT_REQUEST':
        return <UserPlus size={20} className="text-cyan-400" />;
      case 'MESSAGE':
        return <MessageSquare size={20} className="text-purple-400" />;
      case 'GROUP':
        return <Users size={20} className="text-indigo-400" />;
      default:
        return <Bell size={20} className="text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-400/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-2/3 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
            Notifications
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {/* handle clear all */}}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm"
          >
            Clear All
          </motion.button>
        </motion.div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`group relative overflow-hidden rounded-xl backdrop-blur-lg border transition-all ${
                  notification.read 
                    ? 'bg-black/20 border-white/5' 
                    : 'bg-purple-500/10 border-purple-500/20'
                }`}
              >
                {/* Highlight effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 blur-xl"></div>
                </div>

                {/* Content */}
                <div className="relative p-4 flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 p-[2px]">
                      <div className="w-full h-full rounded-full bg-black/50 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium mb-1">{notification.content}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{formatTimestamp(notification.createdAt)}</span>
                      {!notification.read && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                          New
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAction(notification.id, true)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <Check size={16} className="text-gray-400" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAction(notification.id, false)}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X size={16} className="text-gray-400" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
