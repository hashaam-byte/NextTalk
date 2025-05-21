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
      }
    };

    fetchGroups();
  }, []);

  const filteredGroups = searchQuery
    ? groups.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groups;

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      <div className="p-4 border-b border-white/10 bg-black/30 backdrop-blur-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredGroups.map((group) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
            onClick={() => router.push(`/groups/${group.id}`)}
          >
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10">
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
              <div className="ml-4 flex-1">
                <h3 className="text-white font-medium">{group.name}</h3>
                <p className="text-sm text-gray-400">
                  {group.members.length} members
                </p>
              </div>
              {group.messages.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {new Date(group.messages[0].createdAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
        onClick={() => router.push('/create-group')}
      >
        <Plus size={24} />
      </motion.button>
    </div>
  );
}