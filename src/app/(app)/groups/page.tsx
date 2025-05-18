'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, UserPlus, Settings, Filter, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Group type definition
interface Group {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  memberCount: number;
  lastActivity: Date;
  isAdmin: boolean;
}

export default function GroupsPage() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        if (!response.ok) throw new Error('Failed to fetch groups');
        
        const data = await response.json();
        if (!data.groups) throw new Error('No groups data received');
        
        const groupsWithDates = data.groups.map((group: any) => ({
          ...group,
          lastActivity: new Date(group.lastActivity)
        }));
        
        setGroups(groupsWithDates);
        setFilteredGroups(groupsWithDates);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]);
        setFilteredGroups([]);
      }
    };

    if (session?.user) {
      fetchGroups();
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchGroups, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery) {
      setFilteredGroups(
        groups.filter(group =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredGroups(groups);
    }
  }, [searchQuery, groups]);

  const handleGroupSelect = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  const handleCreateGroup = () => {
    router.push('/create-group');
  };

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    
    if (diff < minute) {
      return 'Just now';
    } else if (diff < hour) {
      const minutes = Math.floor(diff / minute);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diff < day) {
      const hours = Math.floor(diff / hour);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diff < 7 * day) {
      const days = Math.floor(diff / day);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
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
      {/* Header with mobile padding */}
      <div className="sticky top-0 z-20 flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center menu-container relative">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
            Groups
          </h1>
        </div>

        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all text-gray-200 border border-white/10"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={20} />
          </motion.button>
        </div>
      </div>

      {/* Search with mobile padding */}
      <div className="px-3 sm:px-4 py-3 bg-black/10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 bg-white/10 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-md transition-all"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Groups list with responsive grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-2 sm:gap-3 p-3 sm:p-4">
          {filteredGroups.length > 0 ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {filteredGroups.map((group, index) => (
                  <motion.div
                    key={group.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ 
                      scale: 1.01, 
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      boxShadow: "0 0 20px rgba(124, 58, 237, 0.1)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="relative flex items-center p-4 border-b border-white/5 cursor-pointer"
                    onClick={() => handleGroupSelect(group.id)}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-indigo-800/50 to-purple-900/50 p-0.5">
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                          {group.avatar ? (
                            <Image
                              src={group.avatar}
                              alt={group.name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gradient-to-br from-indigo-600/30 to-purple-600/30 text-white font-medium">
                              <Users size={24} />
                            </div>
                          )}
                        </div>
                      </div>
                      {group.isAdmin && (
                        <div className="absolute -bottom-1 -right-1 bg-indigo-500 rounded-full p-1 border-2 border-gray-900">
                          <Settings size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <h2 className="text-lg font-medium text-white">{group.name}</h2>
                        <span className="text-xs text-gray-400">
                          {formatLastActivity(group.lastActivity)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-gray-400 truncate max-w-[200px]">
                          {group.description}
                        </p>
                        <div className="bg-white/10 text-gray-300 text-xs rounded-full px-2 py-0.5 flex items-center">
                          <Users size={12} className="mr-1" />
                          {group.memberCount}
                        </div>
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
                className="rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 mb-6 border border-white/10"
              >
                <Users size={40} className="text-indigo-500" />
              </motion.div>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-medium text-white"
              >
                No groups found
              </motion.p>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm mt-2 mb-6 text-gray-400"
              >
                Create a new group or join existing ones
              </motion.p>
              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(124, 58, 237, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateGroup}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl flex items-center shadow-lg shadow-indigo-500/20"
              >
                <Plus size={18} className="mr-2" />
                Create a new group
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* FAB with mobile positioning */}
      <motion.div 
        className="fixed bottom-6 right-4 sm:right-6 z-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
      >
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(124, 58, 237, 0.5)" }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCreateGroup}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-full shadow-xl shadow-indigo-500/30 text-white transition-all"
        >
          <UserPlus size={24} />
        </motion.button>
      </motion.div>
    </div>
  );
}