'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Search, ArrowLeft, Filter, Grid, List, Share2, Star 
} from 'lucide-react';
import Image from 'next/image';

interface TopicInfo {
  title: string;
  type: string;
  description?: string;
  image?: string;
  rating?: number;
  status?: string;
  releaseDate?: string;
  episodes?: number;
  genres?: string[];
  subItems?: TopicInfo[];
}

export default function TopicPage() {
  const { topic } = useParams();
  const router = useRouter();
  const [info, setInfo] = useState<TopicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubTopic, setSelectedSubTopic] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchTopicInfo = async () => {
      try {
        setLoading(true);
        const url = selectedSubTopic 
          ? `/api/topics/${topic}/info?subTopic=${selectedSubTopic}`
          : `/api/topics/${topic}/info`;
        const response = await fetch(url);
        const data = await response.json();
        
        // Ensure we always set an array, even if empty
        if (Array.isArray(data.data?.items)) {
          setInfo(data.data.items);
        } else if (data.data) {
          // If single item, convert to array
          setInfo([data.data]);
        } else {
          setInfo([]);
        }
      } catch (error) {
        setError('Failed to load information');
        console.error('Error fetching topic info:', error);
        setInfo([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchTopicInfo();
  }, [topic, selectedSubTopic]);

  const renderTopicContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
        </div>
      );
    }

    return (
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
        {info.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden
                      ${viewMode === 'grid' ? '' : 'flex items-center space-x-4'}`}
            onClick={() => setSelectedSubTopic(item.title)}
          >
            {item.image && (
              <div className={viewMode === 'grid' ? 'aspect-video' : 'w-48'}>
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
              )}
              
              {/* Additional metadata based on topic type */}
              {item.type === 'anime' && (
                <div className="mt-2 flex items-center space-x-4 text-sm">
                  <span className="text-purple-400">{item.episodes} episodes</span>
                  <span className="text-cyan-400">{item.status}</span>
                  {item.rating && (
                    <span className="flex items-center text-yellow-400">
                      <Star size={14} className="mr-1" />
                      {item.rating}
                    </span>
                  )}
                </div>
              )}

              {/* Tags/Genres */}
              {item.genres && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.genres.map((genre, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-full bg-white/10 text-gray-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => selectedSubTopic ? setSelectedSubTopic(null) : router.back()}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <h1 className="text-xl font-bold text-white capitalize">
                {selectedSubTopic || topic}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                {viewMode === 'grid' ? (
                  <List size={20} className="text-white" />
                ) : (
                  <Grid size={20} className="text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`Search in ${selectedSubTopic || topic}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border-none rounded-full px-4 py-2 pl-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Filter size={20} className="text-gray-400" />
          </button>
          
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Share2 size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        {renderTopicContent()}
      </div>
    </div>
  );
}
