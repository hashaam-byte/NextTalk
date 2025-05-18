'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Calendar, Clock, Search, Filter, VideoIcon, Tv, Star, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Video type definition
interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string; // Add video URL
  duration: string;
  creator: string;
  creatorAvatar?: string;
  dateAdded: string | Date; // Allow both string and Date
  views: number;
  category: string;
  isLive?: boolean;
  platform: 'youtube' | 'tiktok' | 'vimeo'; // Add platform type
}

export default function VideosPage() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        const data = await response.json();
        // Parse dates when receiving data
        const videosWithDates = data.videos.map((video: Video) => ({
          ...video,
          dateAdded: new Date(video.dateAdded)
        }));
        setVideos(videosWithDates);
        setFilteredVideos(videosWithDates);
      } catch (error) {
        console.error('Error fetching videos:', error);
        // For development, we'll use mock data
        const mockVideos = generateMockVideos();
        setVideos(mockVideos);
        setFilteredVideos(mockVideos);
      }
    };

    fetchVideos();
  }, [session]);

  // Add video sources
  const videoSources = {
    Educational: [
      {
        thumbnail: 'https://img.youtube.com/vi/w7ejDZ8SWv8/maxresdefault.jpg',
        videoUrl: 'https://www.youtube.com/embed/w7ejDZ8SWv8',
        platform: 'youtube'
      },
      {
        thumbnail: 'https://img.youtube.com/vi/Tn6-PIqc4UM/maxresdefault.jpg',
        videoUrl: 'https://www.youtube.com/embed/Tn6-PIqc4UM',
        platform: 'youtube'
      },
      {
        thumbnail: 'https://img.youtube.com/vi/bMknfKXIFA8/maxresdefault.jpg',
        videoUrl: 'https://www.youtube.com/embed/bMknfKXIFA8',
        platform: 'youtube'
      }
    ],
    Entertainment: [
      {
        thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
        videoUrl: 'https://www.youtube.com/embed/jNQXAC9IVRw',
        platform: 'youtube'
      },
      {
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        platform: 'youtube'
      }
    ],
    Meetings: [
      {
        thumbnail: 'https://img.youtube.com/vi/Z1RJmh_OqeA/maxresdefault.jpg',
        videoUrl: 'https://www.youtube.com/embed/Z1RJmh_OqeA',
        platform: 'youtube'
      },
      {
        thumbnail: 'https://img.youtube.com/vi/YQHsXMglC9A/maxresdefault.jpg',
        videoUrl: 'https://www.youtube.com/embed/YQHsXMglC9A',
        platform: 'youtube'
      }
    ]
  };

  // Generate mock video data for development
  const generateMockVideos = (): Video[] => {
    const categories = ['Personal', 'Meetings', 'Entertainment', 'Educational'];
    const creators = ['Alex Johnson', 'Sarah Smith', 'Team Alpha', 'Tech Channel', 'Chris Wong'];

    const mockData = [];

    for (let i = 1; i <= 12; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const creator = creators[Math.floor(Math.random() * creators.length)];
      const isLive = Math.random() > 0.8;
      const videoSource = videoSources[category as keyof typeof videoSources];
      const randomVideo = videoSource[Math.floor(Math.random() * videoSource.length)];

      mockData.push({
        id: `video-${i}`,
        title: `${category} Video - ${isLive ? 'LIVE: ' : ''}${i % 3 === 0 ? 'How to use the new features' : i % 2 === 0 ? 'Weekly update meeting' : 'Tutorial session'}`,
        thumbnail: randomVideo.thumbnail,
        videoUrl: randomVideo.videoUrl,
        duration: isLive ? 'LIVE' : `${Math.floor(Math.random() * 59) + 1}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`,
        creator: creator,
        creatorAvatar: `https://i.pravatar.cc/150?img=${i}`, // Random avatar
        dateAdded: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        views: Math.floor(Math.random() * 1000) + 5,
        category: category,
        isLive: isLive,
        platform: randomVideo.platform
      });
    }

    return mockData;
  };

  // Handle search and filter functionality
  useEffect(() => {
    let results = videos;

    // Apply category filter
    if (activeCategory !== 'all') {
      results = results.filter(video => video.category === activeCategory);
    }

    // Apply search filter
    if (searchQuery) {
      results = results.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVideos(results);
  }, [searchQuery, activeCategory, videos]);

  // Format date for display
  const formatDate = (date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;

    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  const VideoModal = ({ video, onClose }: { video: Video; onClose: () => void }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          className="relative w-full max-w-4xl p-2 mx-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden">
            {video.platform === 'youtube' && (
              <iframe
                width="100%"
                height="100%"
                src={video.videoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            {video.platform === 'tiktok' && (
              <iframe
                width="100%"
                height="100%"
                src={video.videoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 bg-white/10 p-2 rounded-full backdrop-blur-sm"
          >
            <X size={20} className="text-white" />
          </button>
        </motion.div>
      </motion.div>
    );
  };

  // Category list
  const categories = [
    { id: 'all', name: 'All Videos', icon: VideoIcon },
    { id: 'Personal', name: 'Personal', icon: VideoIcon },
    { id: 'Meetings', name: 'Meetings', icon: Tv },
    { id: 'Entertainment', name: 'Entertainment', icon: Star },
    { id: 'Educational', name: 'Educational', icon: VideoIcon }
  ];

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    // Handle unauthenticated state
    return <div>Please sign in</div>;
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative">
      {/* Background glowing elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"></div>

        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25"></div>
      </div>

      <div className="relative z-10 p-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full py-2 pl-10 pr-4 bg-white/10 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-md transition-all text-white"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-white/10 rounded-xl border border-white/5 text-white flex items-center gap-2 backdrop-blur-md"
          >
            <Filter size={16} />
            <span>Filter</span>
          </motion.button>
        </div>

        {/* Categories */}
        <div className="overflow-x-auto pb-2 mb-6">
          <div className="flex space-x-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-xl flex items-center space-x-2 whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-white/10 text-gray-300 border border-white/5'
                }`}
              >
                <category.icon size={16} />
                <span>{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  boxShadow: "0 0 20px rgba(124, 58, 237, 0.1)"
                }}
                onClick={() => handlePlayVideo(video)}
                className="cursor-pointer bg-black/30 rounded-xl overflow-hidden border border-white/5 backdrop-blur-sm"
              >
                <div className="relative">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    width={320}
                    height={180}
                    className="w-full h-40 object-cover"
                  />
                  {video.isLive ? (
                    <div className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                      LIVE
                    </div>
                  ) : (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                      {video.duration}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-purple-600 text-white p-3 rounded-full"
                    >
                      <Play size={24} fill="white" />
                    </motion.button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-white font-medium line-clamp-2">{video.title}</h3>
                  </div>

                  <div className="flex items-center mt-3 space-x-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-indigo-800/50 to-purple-900/50 p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                        {video.creatorAvatar ? (
                          <Image
                            src={video.creatorAvatar}
                            alt={video.creator}
                            width={24}
                            height={24}
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                            {video.creator[0]}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">{video.creator}</span>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      <span>{formatDate(video.dateAdded)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      <span>{video.views} views</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-center p-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-6 mb-6 border border-white/10"
              >
                <VideoIcon size={40} className="text-purple-500" />
              </motion.div>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-medium text-white"
              >
                No videos found
              </motion.p>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm mt-2 mb-6 text-gray-400"
              >
                Try adjusting your search or filters
              </motion.p>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && selectedVideo && (
          <VideoModal
            video={selectedVideo}
            onClose={() => setIsVideoModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button for new video */}
      <motion.div
        className="absolute bottom-6 right-6 z-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
      >
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(124, 58, 237, 0.5)" }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-full shadow-xl shadow-purple-500/30 text-white transition-all"
        >
          <Plus size={24} />
        </motion.button>
      </motion.div>
    </div>
  );
}