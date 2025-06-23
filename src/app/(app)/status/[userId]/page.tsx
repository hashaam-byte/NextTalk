'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Share2, Eye, MoreHorizontal, Trash2, Download } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface StatusPost {
  id: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'TEXT' | 'AUDIO' | 'LOCATION';
  caption?: string;
  textContent?: string;
  backgroundColor?: string;
  location?: {
    name: string;
    coordinates: { lat: number; lng: number };
  };
  createdAt: Date;
  expiresAt: Date;
  likes: number;
  viewedBy: Array<{
    id: string;
    name: string;
    image?: string;
    viewedAt: Date;
  }>;
  likedBy: Array<{
    id: string;
    name: string;
    image?: string;
  }>;
}

interface StatusUser {
  id: string;
  name: string;
  image?: string;
  isCurrentUser: boolean;
}

export default function StatusPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;
  
  const { data: session } = useSession();
  
  const [user, setUser] = useState<StatusUser | null>(null);
  const [statusPosts, setStatusPosts] = useState<StatusPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showViewers, setShowViewers] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchUserStatus();
  }, [userId]);

  useEffect(() => {
    // Auto-advance stories every 5 seconds
    if (statusPosts.length > 0) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 2; // 2% every 100ms = 5 seconds total
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [currentIndex, statusPosts.length]);

  const fetchUserStatus = async () => {
    try {
      // Fetch statuses using the correct analytics endpoint
      const response = await fetch(`/api/reels/status?userId=${userId}`);
      const data = await response.json();
      // Assume data.posts is the array of status posts
      setStatusPosts(Array.isArray(data.posts) ? data.posts : []);
      // Optionally fetch user info separately if needed
      if (data.posts && data.posts.length > 0) {
        setUser({
          id: data.posts[0].user.id,
          name: data.posts[0].user.name,
          image: data.posts[0].user.profileImage,
          isCurrentUser: session?.user?.id === data.posts[0].user.id,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      setUser(null);
      setStatusPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < statusPosts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      router.back();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleLike = async () => {
    // Implement like functionality
    console.log('Like status:', statusPosts[currentIndex].id);
  };

  const handleDelete = async (postId: string) => {
    // Implement delete functionality
    console.log('Delete status:', postId);
    setShowOptions(false);
  };

  const handleDownload = async (postId: string) => {
    // Implement download functionality
    console.log('Download status:', postId);
    setShowOptions(false);
  };

  // Determine if current user is the owner
  const isOwner = session?.user?.id === userId;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
      </div>
    );
  }

  if (!user || statusPosts.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h2 className="text-xl font-semibold mb-2">No Status Found</h2>
        <p className="text-gray-400 mb-4">This user hasn't posted any status updates.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-purple-600 rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentPost = statusPosts[currentIndex];

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Progress bars */}
      <div className="absolute top-4 left-4 right-4 z-20 flex space-x-1">
        {statusPosts.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-12 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <span className="text-xs">{user.name[0]}</span>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-xs text-gray-300">
                {new Date(currentPost.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>

        {user.isCurrentUser && (
          <button
            onClick={() => setShowOptions(true)}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="absolute inset-0">
        {/* Touch areas for navigation */}
        <div className="absolute inset-0 flex">
          <div className="flex-1" onClick={handlePrevious} />
          <div className="flex-1" onClick={handleNext} />
        </div>

        {currentPost.mediaType === 'IMAGE' && (
          <Image
            src={currentPost.mediaUrl}
            alt="Status"
            fill
            className="object-cover"
          />
        )}

        {currentPost.mediaType === 'VIDEO' && (
          <video
            src={currentPost.mediaUrl}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
          />
        )}

        {currentPost.mediaType === 'TEXT' && (
          <div className={`w-full h-full bg-gradient-to-br ${currentPost.backgroundColor} flex items-center justify-center p-8`}>
            <p className="text-2xl font-bold text-center">{currentPost.textContent}</p>
          </div>
        )}

        {/* Caption */}
        {currentPost.caption && (
          <div className="absolute bottom-20 left-4 right-4">
            <p className="text-white text-sm bg-black/30 backdrop-blur-sm rounded-lg p-3">
              {currentPost.caption}
            </p>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="absolute bottom-8 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={handleLike} className="flex items-center space-x-1">
            <Heart className="w-6 h-6" />
            <span className="text-sm">{currentPost.likes}</span>
          </button>
          <button className="flex items-center space-x-1">
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="flex items-center space-x-1">
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        {isOwner && (
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span className="text-xs">{currentPost.likes}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">{currentPost.comments?.length ?? 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs">{currentPost.viewedBy?.length ?? 0}</span>
            </span>
          </div>
        )}

        {user.isCurrentUser && (
          <button
            onClick={() => setShowViewers(true)}
            className="flex items-center space-x-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">{currentPost.viewedBy.length}</span>
          </button>
        )}
      </div>

      {/* Owner: Show all statuses */}
      {isOwner && (
        <div className="absolute top-24 right-4 z-30 bg-black/80 rounded-xl p-4 max-w-xs">
          <h4 className="font-bold mb-2">Your Statuses</h4>
          <ul>
            {statusPosts.map((post, idx) => (
              <li key={post.id} className="mb-2">
                <button
                  className={`text-left w-full ${idx === currentIndex ? 'font-bold text-purple-400' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {post.mediaType} - {new Date(post.createdAt).toLocaleString()}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Viewers Modal */}
      <AnimatePresence>
        {showViewers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={() => setShowViewers(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-gray-900 rounded-t-2xl p-6 w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                Viewed by {currentPost.viewedBy.length}
              </h3>
              
              <div className="space-y-3">
                {currentPost.viewedBy.map((viewer) => (
                  <div key={viewer.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                      {viewer.image ? (
                        <Image
                          src={viewer.image}
                          alt={viewer.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-sm">{viewer.name[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{viewer.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(viewer.viewedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options Modal */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-3">
                <button
                  onClick={() => handleDownload(currentPost.id)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </button>
                
                <button
                  onClick={() => handleDelete(currentPost.id)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </button>
              </div>
              
              <button
                onClick={() => setShowOptions(false)}
                className="w-full mt-4 p-3 rounded-lg bg-gray-800 text-gray-300"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}