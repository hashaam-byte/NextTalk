'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft } from 'lucide-react';
import { TOPIC_CATEGORIES } from '@/config/topics';

export default function TopicsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTopics = TOPIC_CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.topics.some(topic => 
      topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-xl font-bold text-white">Explore Topics</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="max-w-xl mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="p-4">
                <h2 className="text-lg font-semibold text-white mb-2">{category.name}</h2>
                <div className="space-y-2">
                  {category.topics.map((topic) => (
                    <motion.button
                      key={topic.id}
                      whileHover={{ x: 5 }}
                      onClick={() => router.push(`/topics/${topic.id}`)}
                      className="flex items-center w-full p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className={`p-2 rounded-lg mr-3 ${topic.color}`}>
                        <topic.icon size={18} className="text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{topic.name}</p>
                        <p className="text-xs text-gray-400">{topic.description}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
