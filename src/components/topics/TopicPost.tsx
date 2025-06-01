'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';

interface TopicPostProps {
  post: {
    id: string;
    title?: string;
    content: string;
    mediaUrl?: string;
    author: {
      id: string;
      name: string;
      profileImage?: string;
    };
    _count: {
      likes: number;
      comments: number;
    };
    createdAt: string;
  };
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onSave: (id: string) => void;
}

export default function TopicPost({
  post,
  onLike,
  onComment,
  onShare,
  onSave
}: TopicPostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-4"
    >
      {/* Author Info */}
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
          {post.author.profileImage ? (
            <Image
              src={post.author.profileImage}
              alt={post.author.name}
              width={40}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 flex items-center justify-center">
              <span className="text-white font-medium">
                {post.author.name[0]}
              </span>
            </div>
          )}
        </div>
        <div className="ml-3">
          <p className="text-white font-medium">{post.author.name}</p>
          <p className="text-sm text-gray-400">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      {post.title && (
        <h3 className="text-lg font-semibold text-white mb-2">{post.title}</h3>
      )}
      <p className="text-gray-200 mb-4">{post.content}</p>

      {/* Media */}
      {post.mediaUrl && (
        <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
          <Image
            src={post.mediaUrl}
            alt="Post media"
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setIsLiked(!isLiked);
              onLike(post.id);
            }}
            className={`flex items-center space-x-1.5 ${
              isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart
              size={20}
              className={isLiked ? 'fill-current' : 'transition-colors'}
            />
            <span>{post._count.likes}</span>
          </button>

          <button
            onClick={() => onComment(post.id)}
            className="flex items-center space-x-1.5 text-gray-400 hover:text-blue-500"
          >
            <MessageSquare size={20} />
            <span>{post._count.comments}</span>
          </button>

          <button
            onClick={() => onShare(post.id)}
            className="flex items-center space-x-1.5 text-gray-400 hover:text-purple-500"
          >
            <Share2 size={20} />
          </button>
        </div>

        <button
          onClick={() => {
            setIsSaved(!isSaved);
            onSave(post.id);
          }}
          className={`${
            isSaved ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
          }`}
        >
          <Bookmark size={20} className="transition-colors" />
        </button>
      </div>
    </motion.div>
  );
}
