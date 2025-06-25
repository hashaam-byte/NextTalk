'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  MoreHorizontal, 
  Trash2, 
  Download,
  Send,
  Smile,
  Volume2,
  VolumeX,
  Play,
  Pause
} from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';

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
  comments?: Array<{
    id: string;
    content: string;
    type: 'text' | 'emoji' | 'sticker';
    user: {
      id: string;
      name: string;
      profileImage?: string;
    };
    createdAt: Date;
  }>;
  reactions?: Array<{
    id: string;
    emoji: string;
    user: {
      id: string;
      name: string;
    };
  }>;
}

interface StatusUser {
  id: string;
  name: string;
  image?: string;
  isCurrentUser: boolean;
}

const STORY_DURATION = 5000; // 5 seconds per story
const PROGRESS_INTERVAL = 50; // Update progress every 50ms

// Helper to normalize likes/comments to a number
const getCount = (val: any) => {
  if (typeof val === 'number') return val;
  if (Array.isArray(val)) return val.length;
  if (typeof val === 'object' && val !== null && '_count' in val) return val._count;
  return 0;
};

export default function StatusPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;
  
  const { data: session } = useSession();
  const socketRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // State management
  const [user, setUser] = useState<StatusUser | null>(null);
  const [statusPosts, setStatusPosts] = useState<StatusPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showViewers, setShowViewers] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  
  // Comment/reaction state
  const [commentInput, setCommentInput] = useState('');
  const [commentType, setCommentType] = useState<'text' | 'emoji' | 'sticker'>('text');
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed values
  const currentPost = useMemo(() => 
    statusPosts[currentIndex] || null, 
    [statusPosts, currentIndex]
  );
  
  const isOwner = useMemo(() => 
    user?.isCurrentUser || false, 
    [user?.isCurrentUser]
  );

  // Socket connection
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io({ 
        path: '/api/socket/io', 
        transports: ['websocket'],
        timeout: 5000,
        retries: 3
      });
    }

    const socket = socketRef.current;

    // Real-time event listeners
    socket.on('status:like', ({ postId, likes, likedBy }) => {
      setStatusPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, likes, likedBy } : post
        )
      );
      if (currentPost?.id === postId) {
        setLocalLikes(likes);
      }
    });

    socket.on('status:comment', ({ postId, comments }) => {
      setStatusPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, comments } : post
        )
      );
    });

    socket.on('status:reaction', ({ postId, reactions }) => {
      setStatusPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, reactions } : post
        )
      );
    });

    socket.on('status:view', ({ postId, viewedBy }) => {
      setStatusPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, viewedBy } : post
        )
      );
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.off('status:like');
      socket.off('status:comment');
      socket.off('status:reaction');
      socket.off('status:view');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [currentPost?.id]);

  // Fetch user status
  const fetchUserStatus = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/reels/status?userId=${userId}`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }
      
      const data = await response.json();
      const posts = Array.isArray(data.posts) ? data.posts : [];
      
      setStatusPosts(posts);
      
      if (posts.length > 0) {
        const firstPost = posts[0];
        setUser({
          id: firstPost.user?.id || userId,
          name: firstPost.user?.name || 'Unknown User',
          image: firstPost.user?.profileImage,
          isCurrentUser: session?.user?.id === firstPost.user?.id,
        });
        
        // Mark as viewed if not owner
        if (session?.user?.id !== firstPost.user?.id) {
          markAsViewed(firstPost.id);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      setError(error instanceof Error ? error.message : 'Failed to load status');
      setUser(null);
      setStatusPosts([]);
    } finally {
      setLoading(false);
    }
  }, [userId, session?.user?.id]);

  // Mark status as viewed
  const markAsViewed = useCallback(async (postId: string) => {
    try {
      await fetch('/api/status/view', {
        method: 'POST',
        body: JSON.stringify({ postId }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (socketRef.current) {
        socketRef.current.emit('status:view', { postId });
      }
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  }, []);

  // Progress timer management
  const startProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }

    progressTimerRef.current = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          const increment = (PROGRESS_INTERVAL / STORY_DURATION) * 100;
          const newProgress = prev + increment;
          
          if (newProgress >= 100) {
            handleNext();
            return 0;
          }
          return newProgress;
        });
      }
    }, PROGRESS_INTERVAL);
  }, [isPaused]);

  const stopProgressTimer = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(0);
    stopProgressTimer();
    startProgressTimer();
  }, [startProgressTimer, stopProgressTimer]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentIndex < statusPosts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetProgress();
    } else {
      // No more statuses, go back to reels page
      router.push('/reels');
    }
  }, [currentIndex, statusPosts.length, router, resetProgress]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetProgress();
    }
  }, [currentIndex, resetProgress]);

  // Interaction handlers
  const handleLike = useCallback(async () => {
    if (!currentPost || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setIsLiked(!isLiked);
      setLocalLikes(prev => isLiked ? prev - 1 : prev + 1);
      
      const response = await fetch('/api/status/like', {
        method: 'POST',
        body: JSON.stringify({ postId: currentPost.id }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to like');
      
      if (socketRef.current) {
        socketRef.current.emit('status:like', { postId: currentPost.id });
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update
      setIsLiked(isLiked);
      setLocalLikes(currentPost.likes);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentPost, isLiked, isSubmitting]);

  const handleSendComment = useCallback(async (content: string, type: 'text' | 'emoji' | 'sticker') => {
    if (!currentPost || !content.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/status/comment', {
        method: 'POST',
        body: JSON.stringify({ postId: currentPost.id, content, type }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to send comment');
      
      if (socketRef.current) {
        socketRef.current.emit('status:comment', { postId: currentPost.id });
      }
      
      setCommentInput('');
    } catch (error) {
      console.error('Error sending comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentPost, isSubmitting]);

  const handleShare = useCallback(async () => {
    if (!currentPost) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${user?.name}'s Status`,
          text: currentPost.caption || 'Check out this status!',
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // You could show a toast notification here
      }
      
      if (socketRef.current) {
        socketRef.current.emit('status:share', { postId: currentPost.id });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [currentPost, user?.name]);

  const handleDelete = useCallback(async (postId: string) => {
    if (!confirm('Are you sure you want to delete this status?')) return;
    
    try {
      const response = await fetch(`/api/status/${postId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      // Remove from local state
      setStatusPosts(prev => prev.filter(post => post.id !== postId));
      
      // Navigate if this was the current post
      if (statusPosts.length <= 1) {
        router.back();
      } else if (currentIndex >= statusPosts.length - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
      
      setShowOptions(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  }, [currentIndex, statusPosts.length, router]);

  const handleDownload = useCallback(async (postId: string) => {
    const post = statusPosts.find(p => p.id === postId);
    if (!post) return;
    
    try {
      const response = await fetch(post.mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `status-${postId}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowOptions(false);
    } catch (error) {
      console.error('Error downloading:', error);
    }
  }, [statusPosts]);

  // Video controls
  const toggleVideoPlayback = useCallback(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsPaused(true);
      } else {
        videoRef.current.play();
        setIsPaused(false);
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  }, [isVideoPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Initialize component
  useEffect(() => {
    fetchUserStatus();
  }, [fetchUserStatus]);

  // Handle current post changes
  useEffect(() => {
    if (currentPost) {
      setLocalLikes(currentPost.likes);
      setIsLiked(currentPost.likedBy?.some(like => like.id === session?.user?.id) || false);
      resetProgress();
      
      // Mark as viewed if not owner
      if (!isOwner) {
        markAsViewed(currentPost.id);
      }
    }
  }, [currentPost, session?.user?.id, isOwner, markAsViewed, resetProgress]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopProgressTimer();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [stopProgressTimer]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          router.back();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNext, handlePrevious, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
          <p className="text-white text-sm">Loading status...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-xl font-semibold mb-2">Error Loading Status</h2>
        <p className="text-gray-400 mb-4 text-center">{error}</p>
        <div className="flex space-x-3">
          <button
            onClick={fetchUserStatus}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No status found
  if (!user || !statusPosts || statusPosts.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h2 className="text-xl font-semibold mb-2">No Status Found</h2>
        <p className="text-gray-400 mb-4">This user hasn't posted any status updates.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Defensive: always use currentPost.viewedBy.length for viewers count
  const viewersCount = currentPost.viewedBy?.length ?? 0;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
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
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
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
                  <span className="text-xs font-medium">{user.name[0]?.toUpperCase()}</span>
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

        <div className="flex items-center space-x-2">
          {/* Viewers count for owner */}
          {isOwner && (
            <button
              onClick={() => setShowViewers(true)}
              className="flex items-center space-x-1 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-xs">{viewersCount}</span>
            </button>
          )}

          {/* Options menu for owner */}
          {isOwner && (
            <button
              onClick={() => setShowOptions(true)}
              className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0">
        {/* Touch areas for navigation */}
        <div className="absolute inset-0 flex z-10">
          <div 
            className="flex-1 cursor-pointer" 
            onClick={handlePrevious}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onMouseLeave={() => setIsPaused(false)}
          />
          <div 
            className="flex-1 cursor-pointer" 
            onClick={handleNext}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onMouseLeave={() => setIsPaused(false)}
          />
        </div>

        {/* Media content */}
        {currentPost.mediaType === 'IMAGE' && (
          <Image
            src={currentPost.mediaUrl}
            alt="Status"
            fill
            className="object-cover"
            priority
          />
        )}

        {currentPost.mediaType === 'VIDEO' && (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={currentPost.mediaUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
            />
            
            {/* Video controls */}
            <div className="absolute top-20 right-4 flex flex-col space-y-2">
              <button
                onClick={toggleVideoPlayback}
                className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
              >
                {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleMute}
                className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {currentPost.mediaType === 'TEXT' && (
          <div className={`w-full h-full bg-gradient-to-br ${currentPost.backgroundColor || 'from-purple-600 to-blue-600'} flex items-center justify-center p-8`}>
            <p className="text-2xl font-bold text-center leading-relaxed">
              {currentPost.textContent}
            </p>
          </div>
        )}

        {/* Caption overlay */}
        {currentPost.caption && (
          <div className="absolute bottom-24 left-4 right-4 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/40 backdrop-blur-sm rounded-xl p-4"
            >
              <p className="text-white text-sm leading-relaxed">{currentPost.caption}</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <motion.div 
        className="absolute bottom-8 left-4 right-4 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Action buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              disabled={isSubmitting}
              className={`flex items-center space-x-2 p-2 rounded-full transition-all ${
                isLiked 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-black/30 backdrop-blur-sm hover:bg-black/50'
              } ${isSubmitting ? 'opacity-50' : ''}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{getCount(localLikes)}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          
          {/* Quick reactions */}
          <div className="flex items-center space-x-2">
            {['❤️', '😂', '😮', '😢', '👏'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendComment(emoji, 'emoji')}
                className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Comment input */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center space-x-2 bg-black/40 backdrop-blur-sm rounded-xl p-3"
            >
              <button
                onClick={() => setCommentType(commentType === 'emoji' ? 'text' : 'emoji')}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={commentType === 'emoji' ? 'Send an emoji...' : 'Send a message...'}
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && commentInput.trim()) {
                    handleSendComment(commentInput, commentType);
                  }
                }}
                disabled={isSubmitting}
              />
              
              <button
                onClick={() => {
                  if (commentInput.trim()) {
                    handleSendComment(commentInput, commentType);
                  }
                }}
                disabled={!commentInput.trim() || isSubmitting}
                className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Comments display for owner */}
      {isOwner && currentPost.comments && getCount(currentPost.comments) > 0 && (
        <motion.div 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-xl p-4 max-w-xs max-h-64 overflow-y-auto"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h4 className="font-semibold mb-3 text-sm">Recent Reactions</h4>
          <div className="space-y-2">
            {(Array.isArray(currentPost.comments) ? currentPost.comments : []).slice(-5).map((comment) => (
              <div key={comment.id} className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                  {comment.user?.profileImage ? (
                    <Image
                      src={comment.user.profileImage}
                      alt={comment.user.name}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  ) : (
                   <div className="w-full h-full flex items-center justify-center text-xs">
                      {comment.user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {comment.user?.name}
                  </p>
                  <div className="flex items-center space-x-1">
                    {comment.type === 'emoji' ? (
                      <span className="text-lg">{comment.content}</span>
                    ) : (
                      <p className="text-xs text-gray-300 break-words">
                        {comment.content}
                      </p>
                    )}
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {new Date(comment.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Viewed by {viewersCount}
                </h3>
                <button
                  onClick={() => setShowViewers(false)}
                  className="p-1 rounded-full hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                {currentPost.viewedBy?.map((viewer) => (
                  <div key={viewer.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
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
                          <span className="text-sm font-medium">{viewer.name[0]?.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{viewer.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(viewer.viewedAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {viewersCount === 0 && (
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No views yet</p>
                  </div>
                )}
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
              <h3 className="text-lg font-semibold mb-4">Options</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleDownload(currentPost.id)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </button>
                
                <button
                  onClick={() => handleDelete(currentPost.id)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </button>
              </div>
              
              <button
                onClick={() => setShowOptions(false)}
                className="w-full mt-4 p-3 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio status controls */}
      {currentPost.mediaType === 'AUDIO' && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Audio Message</h3>
            <p className="text-gray-300 text-sm">Tap to play</p>
            <audio
              src={currentPost.mediaUrl}
              controls
              className="mt-4 w-full max-w-sm"
              autoPlay
            />
          </div>
        </div>
      )}

      {/* Location status */}
      {currentPost.mediaType === 'LOCATION' && currentPost.location && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-teal-900 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Location</h3>
            <p className="text-gray-300 text-lg">{currentPost.location.name}</p>
            <p className="text-gray-400 text-sm mt-2">
              {currentPost.location.coordinates.lat.toFixed(4)}, {currentPost.location.coordinates.lng.toFixed(4)}
            </p>
          </div>
        </div>
      )}

      {/* Reactions display */}
      {currentPost.reactions && currentPost.reactions.length > 0 && (
        <motion.div 
          className="absolute right-4 bottom-32 bg-black/60 backdrop-blur-sm rounded-xl p-3 max-w-xs"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex flex-wrap gap-2">
            {currentPost.reactions.slice(0, 5).map((reaction) => (
              <div key={reaction.id} className="flex items-center space-x-1 bg-white/10 rounded-full px-2 py-1">
                <span className="text-sm">{reaction.emoji}</span>
                {isOwner && (
                  <span className="text-xs text-gray-300">{reaction.user.name}</span>
                )}
              </div>
            ))}
            {currentPost.reactions.length > 5 && (
              <div className="bg-white/10 rounded-full px-2 py-1">
                <span className="text-xs text-gray-300">+{currentPost.reactions.length - 5} more</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Pause indicator */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-full p-4">
              <Pause className="w-8 h-8 text-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status expiry warning */}
      {currentPost && new Date(currentPost.expiresAt) < new Date(Date.now() + 60 * 60 * 1000) && isOwner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-4 right-4 z-20"
        >
          <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg p-3 border border-orange-500/30">
            <p className="text-orange-300 text-sm text-center">
              ⚠️ This status will expire in less than an hour
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}