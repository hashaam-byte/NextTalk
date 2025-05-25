'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, MessageCircle, Share2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
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

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[9/16] bg-gray-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {posts.map((post) => (
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
          ))}
        </div>
      )}
    </div>
  );
}
