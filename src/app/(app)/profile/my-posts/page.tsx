'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Trash2, Eye, Heart, MessageCircle, Users, Blocks, Filter, 
  TrendingUp, Calendar, Search, MoreVertical, Share2, Edit3,
  Download, BarChart3, Clock, ArrowUpRight
} from 'lucide-react';
import Image from 'next/image';

interface Post {
  id: string;
  mediaUrl: string;
  mediaType: string;
  content: string;
  visibility: string;
  createdAt: string;
  likes: { id: string }[];
  comments: { id: string }[];
  viewedBy?: { id: string; name: string; image?: string }[];
  viewersIds?: string[];
}

export default function MyPostsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockUserId, setBlockUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/posts?userId=${session.user.id}&mine=1`)
        .then(res => res.json())
        .then(data => {
          const postsData = Array.isArray(data.posts) ? data.posts : [];
          setPosts(postsData);
          setFilteredPosts(postsData);
        })
        .finally(() => setLoading(false));
    }
  }, [session?.user?.id]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = posts.filter(post => {
      const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || 
        (filterType === 'video' && post.mediaType === 'VIDEO') ||
        (filterType === 'image' && post.mediaType === 'IMAGE') ||
        (filterType === 'public' && post.visibility === 'PUBLIC') ||
        (filterType === 'private' && post.visibility === 'PRIVATE');
      
      return matchesSearch && matchesFilter;
    });

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-liked':
          return (b.likes?.length || 0) - (a.likes?.length || 0);
        case 'most-viewed':
          return (b.viewedBy?.length || 0) - (a.viewedBy?.length || 0);
        default:
          return 0;
      }
    });

    setFilteredPosts(filtered);
  }, [posts, searchTerm, filterType, sortBy]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    try {
      await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      setPosts(posts => posts.filter(p => p.id !== postId));
    } catch (error) {
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleBlock = async (postId: string, userId: string) => {
    try {
      await fetch(`/api/posts/${postId}/block`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
        headers: { 'Content-Type': 'application/json' }
      });
      setBlockUserId(null);
      // Update the post's viewedBy list
      setPosts(posts => posts.map(post => 
        post.id === postId 
          ? { ...post, viewedBy: post.viewedBy?.filter(v => v.id !== userId) }
          : post
      ));
    } catch (error) {
      alert('Failed to block user. Please try again.');
    }
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out my post',
          text: post.content,
          url: window.location.origin + `/post/${post.id}`
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
        alert('Link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white">Loading your content...</p>
        </div>
      </div>
    );
  }

  // Analytics calculations
  const totalReels = posts.length;
  const totalViews = posts.reduce((sum, p) => sum + (p.viewedBy?.length || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);
  const avgEngagement = totalReels > 0 ? ((totalLikes + totalComments) / totalReels).toFixed(1) : '0';
  const topPost = posts.reduce((max, post) => 
    (post.viewedBy?.length || 0) > (max.viewedBy?.length || 0) ? post : max, 
    posts[0] || null
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-6 z-40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Content Analytics
            </h1>
            <p className="text-gray-400 mt-1">Track your posts performance and engagement</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              {showAnalytics ? 'Hide' : 'Show'} Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Analytics Cards */}
        {showAnalytics && (
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-4 border border-blue-800/30">
                <Users className="w-6 h-6 mb-2 text-blue-400" />
                <span className="text-2xl font-bold block">{totalReels}</span>
                <span className="text-xs text-gray-400">Total Posts</span>
              </div>
              <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-4 border border-green-800/30">
                <Eye className="w-6 h-6 mb-2 text-green-400" />
                <span className="text-2xl font-bold block">{totalViews}</span>
                <span className="text-xs text-gray-400">Total Views</span>
              </div>
              <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 rounded-xl p-4 border border-red-800/30">
                <Heart className="w-6 h-6 mb-2 text-red-400" />
                <span className="text-2xl font-bold block">{totalLikes}</span>
                <span className="text-xs text-gray-400">Total Likes</span>
              </div>
              <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-4 border border-purple-800/30">
                <MessageCircle className="w-6 h-6 mb-2 text-purple-400" />
                <span className="text-2xl font-bold block">{totalComments}</span>
                <span className="text-xs text-gray-400">Total Comments</span>
              </div>
              <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 rounded-xl p-4 border border-yellow-800/30">
                <TrendingUp className="w-6 h-6 mb-2 text-yellow-400" />
                <span className="text-2xl font-bold block">{avgEngagement}</span>
                <span className="text-xs text-gray-400">Avg Engagement</span>
              </div>
              <div className="bg-gradient-to-br from-indigo-900/50 to-indigo-800/30 rounded-xl p-4 border border-indigo-800/30">
                <ArrowUpRight className="w-6 h-6 mb-2 text-indigo-400" />
                <span className="text-xl font-bold block">{topPost ? (topPost.viewedBy?.length || 0) : 0}</span>
                <span className="text-xs text-gray-400">Top Post Views</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-gray-800">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search your posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="image">Images</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most-liked">Most Liked</option>
                <option value="most-viewed">Most Viewed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No posts found</h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Start creating content to see your analytics'}
              </p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <div key={post.id} className="bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Media Preview */}
                    <div className="w-full lg:w-80 h-64 relative rounded-lg overflow-hidden bg-gray-800 group">
                      {post.mediaType === 'VIDEO' ? (
                        <video 
                          src={post.mediaUrl} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          controls 
                        />
                      ) : (
                        <Image 
                          src={post.mediaUrl} 
                          alt={post.content} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                        <span className="text-xs font-medium">{post.mediaType}</span>
                      </div>
                    </div>

                    {/* Content and Stats */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Clock className="w-4 h-4" />
                              {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              post.visibility === 'PUBLIC' 
                                ? 'bg-green-900/50 text-green-300 border border-green-800' 
                                : 'bg-orange-900/50 text-orange-300 border border-orange-800'
                            }`}>
                              {post.visibility}
                            </span>
                          </div>
                          <div className="relative">
                            <button
                              onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {selectedPost === post.id && (
                              <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 min-w-48 z-50">
                                <button
                                  onClick={() => handleShare(post)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Share2 className="w-4 h-4" />
                                  Share Post
                                </button>
                                <button
                                  onClick={() => router.push(`/edit-post/${post.id}`)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  Edit Post
                                </button>
                                <button
                                  onClick={() => setBlockUserId(post.id)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-2"
                                >
                                  <Blocks className="w-4 h-4" />
                                  Manage Viewers
                                </button>
                                <hr className="border-gray-700 my-2" />
                                <button
                                  onClick={() => handleDelete(post.id)}
                                  className="w-full px-4 py-2 text-left hover:bg-red-900/50 text-red-400 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Post
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-100 mb-4 leading-relaxed">{post.content}</p>

                        {/* Engagement Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="p-2 bg-blue-900/30 rounded-lg">
                              <Eye className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <div className="font-semibold">{post.viewedBy?.length ?? 0}</div>
                              <div className="text-xs text-gray-400">Views</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="p-2 bg-red-900/30 rounded-lg">
                              <Heart className="w-4 h-4 text-red-400" />
                            </div>
                            <div>
                              <div className="font-semibold">{post.likes?.length ?? 0}</div>
                              <div className="text-xs text-gray-400">Likes</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="p-2 bg-purple-900/30 rounded-lg">
                              <MessageCircle className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                              <div className="font-semibold">{post.comments?.length ?? 0}</div>
                              <div className="text-xs text-gray-400">Comments</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Block User Modal */}
                {blockUserId === post.id && (
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full max-h-96 flex flex-col">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Blocks className="w-5 h-5" />
                        Manage Post Viewers
                      </h3>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-gray-400 text-sm mb-4">Block users from viewing this post</p>
                        <div className="space-y-2 overflow-y-auto max-h-48">
                          {(post.viewedBy ?? []).length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No viewers yet</p>
                          ) : (
                            (post.viewedBy ?? []).map(viewer => (
                              <div key={viewer.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                                <Image 
                                  src={viewer.image || '/default-avatar.png'} 
                                  alt={viewer.name} 
                                  width={32} 
                                  height={32} 
                                  className="rounded-full" 
                                />
                                <span className="flex-1 text-sm">{viewer.name}</span>
                                <button
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors"
                                  onClick={() => handleBlock(post.id, viewer.id)}
                                >
                                  Block
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <button
                        className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        onClick={() => setBlockUserId(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}