'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
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

export default function ReelsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

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
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
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

        {/* Posts grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-4 pb-20 md:pb-0 ${
          isMobile ? 'auto-rows-[calc(100vh-12rem)]' : ''
        }`}>
          {loading ? (
            // Loading skeletons
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-gray-800/50 rounded-xl animate-pulse" />
            ))
          ) : posts.length > 0 ? (
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
    </div>
  );
}
