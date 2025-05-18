'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      <div className="sticky top-0 z-10 bg-black/30 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors mr-3"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Notifications</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 mb-6">
          Notifications
        </h1>

        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`p-4 rounded-xl border ${
                  notification.read 
                    ? 'bg-black/20 border-white/5' 
                    : 'bg-purple-500/10 border-purple-500/20'
                }`}
                onClick={() => !notification.read && markNotificationAsRead(notification.id)}
              >
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

                  {!notification.read && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  )}
                </div>
                {renderNotificationActions(notification)}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Bell size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-400">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
