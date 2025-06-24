'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Trash2, Eye, Heart, MessageCircle, Users, Blocks } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [blockUserId, setBlockUserId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      // Fetch only posts created by the current user
      fetch(`/api/posts?userId=${session.user.id}&mine=1`)
        .then(res => res.json())
        .then(data => setPosts(Array.isArray(data.posts) ? data.posts : []))
        .finally(() => setLoading(false));
    }
  }, [session?.user?.id]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    setPosts(posts => posts.filter(p => p.id !== postId));
  };

  const handleBlock = async (postId: string, userId: string) => {
    await fetch(`/api/posts/${postId}/block`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
      headers: { 'Content-Type': 'application/json' }
    });
    setBlockUserId(null);
    // Optionally refetch posts or update state
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  // Analytics
  const totalReels = posts.length;
  const totalViews = posts.reduce((sum, p) => sum + (p.viewedBy?.length || 0), 0);
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">My Reels & Status Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center">
          <Users className="w-6 h-6 mb-2" />
          <span className="text-lg font-bold">{totalReels}</span>
          <span className="text-xs text-gray-400">Total Posts</span>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center">
          <Eye className="w-6 h-6 mb-2" />
          <span className="text-lg font-bold">{totalViews}</span>
          <span className="text-xs text-gray-400">Total Views</span>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center">
          <Heart className="w-6 h-6 mb-2" />
          <span className="text-lg font-bold">{totalLikes}</span>
          <span className="text-xs text-gray-400">Total Likes</span>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 flex flex-col items-center">
          <MessageCircle className="w-6 h-6 mb-2" />
          <span className="text-lg font-bold">{totalComments}</span>
          <span className="text-xs text-gray-400">Total Comments</span>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-gray-900 rounded-xl p-4 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48 h-64 relative rounded-lg overflow-hidden bg-gray-700">
              {post.mediaType === 'VIDEO' ? (
                <video src={post.mediaUrl} className="w-full h-full object-cover" controls />
              ) : (
                <Image src={post.mediaUrl} alt="" fill className="object-cover" />
              )}
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</span>
                  <span className="ml-2 px-2 py-1 rounded bg-gray-700 text-xs">{post.visibility}</span>
                </div>
                <div className="mb-2">{post.content}</div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                  <span><Eye className="inline w-4 h-4" /> {post.viewedBy?.length ?? 0} views</span>
                  <span><Heart className="inline w-4 h-4" /> {post.likes?.length ?? 0} likes</span>
                  <span><MessageCircle className="inline w-4 h-4" /> {post.comments?.length ?? 0} comments</span>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 rounded hover:bg-red-700"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
                <button
                  className="flex items-center gap-1 px-3 py-2 bg-gray-700 rounded hover:bg-gray-800"
                  onClick={() => setBlockUserId(post.id)}
                >
                  <Blocks className="w-4 h-4" /> Block User
                </button>
              </div>
              {/* Block modal */}
              {blockUserId === post.id && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                  <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full">
                    <h3 className="text-lg font-bold mb-4">Block a viewer from this post</h3>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {(post.viewedBy ?? []).map(viewer => (
                        <li key={viewer.id} className="flex items-center gap-2">
                          <Image src={viewer.image || '/default-avatar.png'} alt={viewer.name} width={32} height={32} className="rounded-full" />
                          <span>{viewer.name}</span>
                          <button
                            className="ml-auto px-2 py-1 bg-red-600 rounded text-xs"
                            onClick={() => handleBlock(post.id, viewer.id)}
                          >
                            Block
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      className="mt-4 w-full px-4 py-2 bg-gray-700 rounded"
                      onClick={() => setBlockUserId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
