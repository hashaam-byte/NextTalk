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
  priority?: 'high' | 'medium' | 'low';
  actionUrl?: string;
  category?: string;
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

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST'
      });
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
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

  const renderNotificationActions = (notification: Notification) => {
    if (notification.type === 'CONTACT_REQUEST') {
      return (
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAction(notification.id, true)}
            className="p-2 bg-green-500 rounded-full text-white"
          >
            <Check size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAction(notification.id, false)}
            className="p-2 bg-red-500 rounded-full text-white"
          >
            <X size={16} />
          </motion.button>
        </div>
      );
    }
    return null;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4 sm:p-6">
      {/* Enhanced Header Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Notifications
              </span>
            </h1>
            <p className="text-gray-400">Stay updated with your latest activities and interactions</p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm text-gray-300 border border-white/10"
          >
            Mark all as read
          </motion.button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800">
            {/* ...existing filter buttons... */}
          </div>
          
          <div className="flex items-center space-x-2">
            <select 
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300"
              onChange={(e) => console.log(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="unread">Unread First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Notifications List */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence>
          {loading ? (
            // ...existing loading state...
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`group relative overflow-hidden rounded-xl backdrop-blur-lg transition-all ${
                    notification.read ? 'bg-white/5' : 'bg-white/10'
                  } hover:bg-white/20`}
                >
                  {/* Priority Indicator */}
                  {notification.priority && (
                    <div className={`absolute top-0 left-0 w-1 h-full ${
                      notification.priority === 'high' ? 'bg-red-500' :
                      notification.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                  )}

                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative p-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'CONTACT_REQUEST' 
                          ? 'bg-cyan-500/20' 
                          : 'bg-purple-500/20'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1">
                        <p className="text-white">{notification.content}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {notification.actionUrl && (
                          <button className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-400">
                            View
                          </button>
                        )}
                        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400">
                          Dismiss
                        </button>
                      </div>
                    </div>

                    {/* Category tag */}
                    {notification.category && (
                      <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs bg-white/5 text-gray-400">
                        {notification.category}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Bell size={40} className="mx-auto mb-4 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
