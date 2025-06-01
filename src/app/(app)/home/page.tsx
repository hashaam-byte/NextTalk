'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Users, Video, Bell, 
  ArrowRight, Calendar, Heart, Sparkles, 
  Activity, BookOpen, UserPlus, Star, Camera, Cpu, Film, Gamepad, Tv, Trophy, Code
} from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { TOPIC_CATEGORIES } from '@/config/topics';

const DEFAULT_AVATAR = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="100%25" height="100%25" fill="%234B5563"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em"%3E?%3C/text%3E%3C/svg%3E';

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  lastSeen?: string;
}

interface Activity {
  id: string;
  type: 'message' | 'call' | 'event' | 'group' | 'like';
  content: string;
  timestamp: Date;
  user: {
    name: string;
    avatar?: string;
  };
}

interface RecentTopicActivity {
  title: string;
  topic: string;
  timeAgo: string;
  icon: any;
  color: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      messages: 0,
      contacts: 0,
      groups: 0
    },
    onlineContacts: [],
    activities: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        setDashboardData({
          stats: data.stats || { messages: 0, contacts: 0, groups: 0 },
          onlineContacts: data.onlineContacts || [],
          activities: data.activities || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData({
          stats: { messages: 0, contacts: 0, groups: 0 },
          onlineContacts: [],
          activities: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session]);

  const formatTimestamp = (timestamp: Date | string | undefined) => {
    if (!timestamp) return 'Unknown time';
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);

      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
  };

  const formatActivityTime = (timestamp: Date | string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);

      if (minutes < 60) {
        return `${minutes}m ago`;
      }
      
      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return `${hours}h ago`;
      }
      
      const days = Math.floor(hours / 24);
      if (days < 7) {
        return `${days}d ago`;
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting activity time:', error);
      return '';
    }
  };

  const getIconForActivity = (type: string) => {
    switch (type) {
      case 'message': return <MessageSquare className="text-cyan-400" size={16} />;
      case 'call': return <Video className="text-green-400" size={16} />;
      case 'event': return <Calendar className="text-orange-400" size={16} />;
      case 'group': return <Users className="text-indigo-400" size={16} />;
      case 'like': return <Heart className="text-red-400" size={16} />;
      default: return <Bell className="text-purple-400" size={16} />;
    }
  };

  const QuickAccessButtons = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[
        { title: "New Chat", icon: MessageSquare, color: "from-cyan-600 to-blue-600", path: "/contacts" },
        { title: "New Group", icon: Users, color: "from-purple-600 to-indigo-600", path: "/create-group" },
        { title: "Start Call", icon: Video, color: "from-amber-600 to-orange-600", path: "/videos" },
        { title: "Find People", icon: UserPlus, color: "from-emerald-600 to-green-600", path: "/contacts" }
      ].map((button, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.97 }}
          className="cursor-pointer"
          onClick={() => router.push(button.path)}
        >
          <div className={`bg-gradient-to-br ${button.color} p-4 rounded-xl shadow-lg shadow-${button.color.split('-')[1]}/20 h-full`}>
            <div className="flex flex-col items-center justify-center text-white">
              <button.icon size={24} className="mb-2" />
              <span className="text-sm font-medium">{button.title}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const ActivityFeed = () => (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Activity</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              activeTab === 'all' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded-full transition-all ${
              activeTab === 'unread' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'
            }`}
            onClick={() => setActiveTab('unread')}
          >
            Unread
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/5 rounded animate-pulse w-3/4 mb-2"></div>
                <div className="h-3 bg-white/5 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {dashboardData.activities.map((activity: Activity) => (
            <motion.div 
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-3 border-b border-white/5 pb-3"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full overflow-hidden relative border border-white/10">
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {activity?.user?.name?.[0] || '?'}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-200">
                  <span className="font-medium">{activity.content}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatActivityTime(activity.timestamp)}
                </p>
              </div>
              {activity.type === 'message' && (
                <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white">
                  <ArrowRight size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="mt-3">
        <button className="w-full py-2 text-center text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View all activity
        </button>
      </div>
    </div>
  );

  const StatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { 
          title: "Messages", 
          value: dashboardData.stats.messages, 
          icon: MessageSquare, 
          color: "from-cyan-500 to-blue-500" 
        },
        { 
          title: "Friends", 
          value: dashboardData.stats.contacts, 
          icon: Users, 
          color: "from-purple-500 to-indigo-500" 
        },
        { 
          title: "Groups", 
          value: dashboardData.stats.groups,
          icon: Users, 
          color: "from-emerald-500 to-green-500",
          tooltip: "Groups you're a member of"
        }
      ].map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          whileHover={{ scale: 1.03, y: -5 }}
          className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4 relative group"
          title={stat.tooltip}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
            <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg text-white shadow-lg shadow-${stat.color.split('-')[1]}/20`}>
              <stat.icon size={20} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const OnlineFriendsList = () => (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Online Friends</h2>
        <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center">
          View all <ArrowRight size={14} className="ml-1" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/5 rounded animate-pulse w-1/2 mb-2"></div>
                <div className="h-3 bg-white/5 rounded animate-pulse w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {dashboardData.onlineContacts.map((friend: Friend) => (
            <motion.div 
              key={friend.id}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer"
              onClick={() => router.push(`/chat/${friend.id}`)}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                  {friend.avatar ? (
                    <Image
                      src={friend.avatar || DEFAULT_AVATAR}
                      alt={friend.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                      {friend.name[0]}
                    </div>
                  )}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                  friend.status === 'online' ? 'bg-green-500' : 
                  friend.status === 'away' ? 'bg-amber-500' : 'bg-gray-500'
                }`}></div>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{friend.name}</p>
                <p className="text-xs text-gray-400">
                  {friend.status === 'online' ? 'Online' : friend.lastSeen}
                </p>
              </div>
              <div className="ml-auto">
                <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-all">
                  <MessageSquare size={16} className="text-purple-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const recentTopicActivity: RecentTopicActivity[] = [
    {
      title: "New AI Framework Released",
      topic: "Programming",
      timeAgo: "2h ago",
      icon: Code,
      color: "bg-cyan-500/20 text-cyan-400"
    },
    {
      title: "Advanced ML Workshop",
      topic: "Education",
      timeAgo: "3h ago",
      icon: BookOpen,
      color: "bg-blue-500/20 text-blue-400"
    },
    {
      title: "Latest Movie Reviews",
      topic: "Movies",
      timeAgo: "4h ago",
      icon: Film,
      color: "bg-red-500/20 text-red-400"
    },
    {
      title: "Sports Championship",
      topic: "Sports",
      timeAgo: "5h ago",
      icon: Trophy,
      color: "bg-green-500/20 text-green-400"
    }
  ];

  const SuggestedContent = () => (
    <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Explore Topics</h2>
        <button
          onClick={() => router.push('/topics')}
          className="text-xs text-purple-400 hover:text-purple-300 flex items-center"
        >
          View All <ArrowRight size={14} className="ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TOPIC_CATEGORIES.slice(0, 2).flatMap(category => 
          category.topics.slice(0, 2).map(topic => (
            <motion.div
              key={topic.id}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/topics/${topic.id}`)}
              className="flex items-center p-3 rounded-lg cursor-pointer border border-white/5"
            >
              <div className={`p-2 rounded-lg mr-3 ${topic.color}`}>
                <topic.icon size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{topic.name}</p>
                <p className="text-xs text-gray-400 truncate">{topic.description}</p>
              </div>
              <ArrowRight size={16} className="ml-2 text-gray-400 flex-shrink-0" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  if (status === 'loading') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin"></div>
          <p className="mt-4 text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Please Sign In</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to view this page</p>
          <button 
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg shadow-purple-600/20"
            onClick={() => router.push('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background glowing elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25"></div>
      </div>

      <div className="relative z-10 h-full overflow-y-auto p-6">
        {/* Welcome message */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">{session.user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-gray-400">Here's what's happening today</p>
        </div>

        {/* Quick access buttons */}
        <QuickAccessButtons />

        {/* Stats */}
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Activity feed */}
            <ActivityFeed />
            
            {/* Suggested content */}
            <SuggestedContent />
          </div>

          <div>
            {/* Online friends */}
            <OnlineFriendsList />
          </div>
        </div>
      </div>
    </div>
  );
}