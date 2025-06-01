'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Forward, Star } from 'lucide-react';
import Image from 'next/image';
import { SelectedMedia } from '@/types/chat';

interface MediaViewerProps {
  media: SelectedMedia;
  onClose: () => void;
}

export default function MediaViewer({ media, onClose }: MediaViewerProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `media-${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading media:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-lg"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          {/* Sender Info */}
          <div className="flex items-center space-x-3">
            {media.sender?.avatar && (
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={media.sender.avatar}
                  alt={media.sender.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-white font-medium">{media.sender?.name}</h3>
              <p className="text-sm text-gray-400">
                {media.timestamp.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <Download className="w-6 h-6 text-white" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Media Content */}
      <div className="h-full flex items-center justify-center p-4">
        {media.type === 'image' ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative max-w-full max-h-full"
          >
            <Image
              src={media.url}
              alt={media.title || 'Media'}
              width={1200}
              height={800}
              className="object-contain rounded-lg"
            />
          </motion.div>
        ) : media.type === 'video' ? (
          <motion.video
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            controls
            className="max-w-full max-h-full rounded-lg"
          >
            <source src={media.url} type="video/mp4" />
            Your browser does not support the video tag.
          </motion.video>
        ) : (
          <div className="text-white">Unsupported media type</div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex justify-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-white/80 hover:text-white"
          >
            <Share2 className="w-6 h-6" />
            <span className="text-xs mt-1">Share</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-white/80 hover:text-white"
          >
            <Forward className="w-6 h-6" />
            <span className="text-xs mt-1">Forward</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center text-white/80 hover:text-white"
          >
            <Star className="w-6 h-6" />
            <span className="text-xs mt-1">Star</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
