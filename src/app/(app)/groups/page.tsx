'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Search, Plus } from 'lucide-react';
import Image from 'next/image';

interface Group {
  id: string;
  name: string;
  avatar?: string;
  members: {
    user: {
      id: string;
      name: string;
      image?: string;
    };
    role: string;
  }[];
  messages: {
    id: string;
    content: string;
    createdAt: Date;
    sender: {
      name: string;
    };
  }[];
}

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/groups');
        const data = await response.json();
        setGroups(data.groups || []);
      } catch (error) {
        console.error('Error fetching groups:', error);
        setGroups([]);
      }
    };

    fetchGroups();
    // Poll for new groups every 30 seconds
    const interval = setInterval(fetchGroups, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGroupClick = (groupId: string) => {
    router.push(`/groups/${groupId}`);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* Search header */}
      <div className="p-4 border-b border-white/10 bg-black/30 backdrop-blur-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400"
            placeholder="Search groups..."
          />
        </div>
      </div>

      {/* Groups list */}
      <div className="flex-1 overflow-y-auto p-4">
        {groups.map((group) => (
          <motion.div
            key={group.id}
            onClick={() => handleGroupClick(group.id)}
            className="mb-4 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10"
          >
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                {group.avatar ? (
                  <Image
                    src={group.avatar}
                    alt={group.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-indigo-600/30 flex items-center justify-center">
                    <Users className="text-white" size={24} />
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-white font-medium">{group.name}</h3>
                <p className="text-sm text-gray-400">
                  {group.members.length} members
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create group button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push('/create-group')}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
      >
        <Plus size={24} />
      </motion.button>
    </div>
  );
}