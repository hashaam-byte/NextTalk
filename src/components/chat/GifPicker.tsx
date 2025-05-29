'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Upload, Play } from 'lucide-react';
import Image from 'next/image';

interface GifPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onGifSelect: (gifUrl: string) => void;
}

export default function GifPicker({ isOpen, onClose, onGifSelect }: GifPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'trending'|'favorites'|'yours'>('trending');
  const [gifs, setGifs] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGifUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('gif', file);

      const response = await fetch('/api/gifs/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setGifs(prev => [...prev, data.url]);
      
    } catch (error) {
      console.error('Error uploading GIF:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only accept GIFs
    if (file.type !== 'image/gif') {
      alert('Please upload a GIF file');
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/media/upload-gif', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      setGifs(prev => [...prev, data.url]);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload GIF');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-[350px] bg-black/90 backdrop-blur-xl rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <h3 className="text-sm font-medium text-white">GIFs</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Search bar */}
      <div className="p-2 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search GIFs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'trending', label: 'Trending' },
          { id: 'favorites', label: 'Favorites' },
          { id: 'yours', label: 'Your GIFs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* GIFs Grid */}
      <div className="grid grid-cols-2 gap-2 p-2 overflow-y-auto h-[calc(100%-180px)]">
        {activeTab === 'yours' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setUploadModalOpen(true)}
            className="aspect-video rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center hover:bg-white/5"
          >
            <Plus className="text-gray-400" size={24} />
          </motion.button>
        )}
        
        {gifs.map((gif, index) => (
          <motion.button
            key={index}
            onClick={() => onGifSelect(gif)}
            className="relative aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all group"
          >
            <Image
              src={gif}
              alt="GIF"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-8 h-8 text-white" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Upload Your GIF</h3>
              <input
                type="file"
                accept="image/gif,video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleGifUpload(file);
                }}
                className="hidden"
                id="gifUpload"
              />
              <label
                htmlFor="gifUpload"
                className="block w-full p-12 border-2 border-dashed border-white/20 rounded-lg text-center cursor-pointer hover:bg-white/5"
              >
                <Upload className="mx-auto mb-2" size={24} />
                <p className="text-sm text-gray-400">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">GIF or video up to 15MB</p>
              </label>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
