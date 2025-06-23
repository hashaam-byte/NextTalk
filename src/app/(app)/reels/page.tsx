'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, User, Heart, MessageCircle, Share2, Camera, Music, Mic, MapPin, Type, Video } from 'lucide-react';
import Image from 'next/image';

interface Post {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
  likes: number;
  viewedBy: string[];
  createdAt: Date;
}

interface StatusUser {
  id: string;
  name: string;
  image?: string;
  hasPostedToday: boolean;
  isCurrentUser: boolean;
  lastPosted?: Date;
}

interface PostOption {
  icon: React.ElementType;
  label: string;
  action: string;
  gradient: string;
}

export default function ReelsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [statusUsers, setStatusUsers] = useState<StatusUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showPostOptions, setShowPostOptions] = useState(false);
  const router = useRouter();

  const postOptions: PostOption[] = [
    { icon: Camera, label: 'Photo', action: 'photo', gradient: 'from-blue-500 to-purple-500' },
    { icon: Video, label: 'Video', action: 'video', gradient: 'from-red-500 to-pink-500' },
    { icon: Music, label: 'Music', action: 'music', gradient: 'from-green-500 to-teal-500' },
    { icon: Type, label: 'Text', action: 'text', gradient: 'from-yellow-500 to-orange-500' },
    { icon: Mic, label: 'Audio', action: 'audio', gradient: 'from-purple-500 to-indigo-500' },
    { icon: MapPin, label: 'Location', action: 'location', gradient: 'from-cyan-500 to-blue-500' },
  ];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    fetchReels();
    fetchStatusUsers();
  }, []);

  const fetchReels = async () => {
    try {
      const response = await fetch('/api/reels');
      const data = await response.json();
      setPosts(data.reels);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusUsers = async () => {
    try {
      // Fetch statuses (stories) from contacts only
      const response = await fetch('/api/reels/status');
      const data = await response.json();
      // Map to StatusUser shape as before
      setStatusUsers(
        (data.statuses || []).map((status: any) => ({
          id: status.user.id,
          name: status.user.name,
          image: status.user.profileImage,
          hasPostedToday: true,
          isCurrentUser: false, // Set true if matches session user
          lastPosted: status.createdAt ? new Date(status.createdAt) : undefined,
        }))
      );
    } catch (error) {
      setStatusUsers([]);
    }
  };

  const handleStatusClick = (user: StatusUser) => {
    if (user.isCurrentUser && !user.hasPostedToday) {
      setShowPostOptions(true);
    } else {
      // Navigate to status view page
      router.push(`/status/${user.id}`);
    }
  };

  const handlePostOptionSelect = (action: string) => {
    setShowPostOptions(false);
    // Navigate to appropriate creation page based on action
    switch (action) {
      case 'photo':
        router.push('/camera?mode=photo');
        break;
      case 'video':
        router.push('/camera?mode=video');
        break;
      case 'music':
        router.push('/create/music');
        break;
      case 'text':
        router.push('/create/text');
        break;
      case 'audio':
        router.push('/create/audio');
        break;
      case 'location':
        router.push('/create/location');
        break;
      default:
        router.push('/camera');
    }
  };

  const handleAddPost = () => {
    router.push('/camera');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      {/* Mobile-optimized header */}
      <div className="md:hidden sticky top-0 z-30 bg-black/30 backdrop-blur-lg p-4 border-b border-white/10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Reels
        </h1>
      </div>

      {/* Content wrapper with mobile padding */}
      <div className="p-4 md:p-4">
        {/* Desktop header */}
        <div className="hidden md:flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Reels
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddPost}
            className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.button>
        </div>

        {/* Status Stories Section */}
        <div className="mb-6">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {(statusUsers ?? []).map((user) => (
              <motion.div
                key={user.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStatusClick(user)}
                className="flex-shrink-0 cursor-pointer"
              >
                <div className="relative">
                  {/* Status Circle */}
                  <div className={`w-16 h-16 rounded-full p-1 ${
                    user.hasPostedToday 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : user.isCurrentUser 
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                      : 'bg-gray-700'
                  }`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 border-2 border-gray-900">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Plus icon for current user if no story */}
                  {user.isCurrentUser && !user.hasPostedToday && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-900">
                      <Plus className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* User name */}
                <p className="text-xs text-gray-300 mt-2 text-center max-w-16 truncate">
                  {user.isCurrentUser ? 'Your Story' : user.name}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Posts grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-4 pb-20 md:pb-0 ${
          isMobile ? 'auto-rows-[calc(100vh-16rem)]' : ''
        }`}>
          {loading ? (
            // Loading skeletons
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-gray-800/50 rounded-xl animate-pulse" />
            ))
          ) : (Array.isArray(posts) && posts.length > 0) ? (
            // Actual posts
            posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-[9/16] rounded-xl overflow-hidden"
              >
                {post.mediaType === 'VIDEO' ? (
                  <video
                    src={post.mediaUrl}
                    className="w-full h-full object-cover"
                    controls={false}
                    loop
                    muted
                  />
                ) : (
                  <Image
                    src={post.mediaUrl}
                    alt={post.caption || ''}
                    fill
                    className="object-cover"
                  />
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 p-4 flex flex-col justify-end">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 border border-white/20">
                      {post.user.image ? (
                        <Image
                          src={post.user.image}
                          alt={post.user.name}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      ) : (
                        <User className="w-full h-full p-1 text-gray-400" />
                      )}
                    </div>
                    <span className="ml-2 text-sm font-medium truncate">
                      {post.user.name}
                    </span>
                  </div>
                  
                  <p className="text-sm line-clamp-2">{post.caption}</p>
                  
                  {/* Action buttons */}
                  <div className="flex items-center mt-2 space-x-4">
                    <button className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            // Empty state
            <div className="col-span-full flex flex-col items-center justify-center text-center p-8">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 mb-4 rounded-full bg-purple-500/20 flex items-center justify-center"
              >
                <Plus className="w-8 h-8 text-purple-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">No Reels Yet</h3>
              <p className="text-gray-400 mb-6">Be the first to create a reel!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddPost}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
              >
                Create Reel
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile floating action button */}
      {isMobile && (
        <motion.button
          className="fixed bottom-20 right-4 z-20 p-4 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddPost}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      )}

      {/* Post Options Modal */}
      {showPostOptions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPostOptions(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              What do you want to share?
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {postOptions.map((option) => (
                <motion.button
                  key={option.action}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePostOptionSelect(option.action)}
                  className={`p-4 rounded-xl bg-gradient-to-r ${option.gradient} text-white flex flex-col items-center space-y-2`}
                >
                  <option.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{option.label}</span>
                </motion.button>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPostOptions(false)}
              className="w-full mt-4 p-3 rounded-xl bg-gray-800 text-gray-300 font-medium"
            >
              Cancel
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}