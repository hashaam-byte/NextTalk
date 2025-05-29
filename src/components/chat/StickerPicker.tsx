'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Upload } from 'lucide-react';
import Image from 'next/image';

export default function StickerPicker({ onStickerSelect, isOpen, onClose }: StickerPickerProps) {
  const [stickers, setStickers] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'trending' | 'uploads'>('trending');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/media/upload-sticker', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const data = await response.json();
      if (data.success && data.sticker) {
        // Update stickers with new list
        setStickers(prev => [data.sticker, ...prev]);
        // Optional: Show success message
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      // Show error message to user
      alert(error instanceof Error ? error.message : 'Failed to upload sticker');
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch stickers on mount
  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const response = await fetch('/api/media/stickers');
        const data = await response.json();
        setStickers(data.stickers.map((s: any) => s.url));
      } catch (error) {
        console.error('Error fetching stickers:', error);
      }
    };

    fetchStickers();
  }, []);

  return (
    <div className="p-4 bg-gray-900/95 rounded-xl border border-white/10">
      {/* Tab Navigation */}
      <div className="flex mb-4 border-b border-white/10">
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'trending' 
              ? 'text-purple-400 border-b-2 border-purple-400' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('trending')}
        >
          Trending
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === 'uploads' 
              ? 'text-purple-400 border-b-2 border-purple-400' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('uploads')}
        >
          My Uploads
        </button>
      </div>

      {/* Upload Button */}
      <div className="mb-4">
        <label className="relative flex items-center justify-center p-4 border-2 border-dashed border-white/20 rounded-lg hover:border-purple-500/50 transition-colors cursor-pointer group">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
              <span className="text-sm text-gray-400">Uploading...</span>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">Upload Sticker</p>
            </>
          )}
        </label>
      </div>

      {/* Stickers Grid */}
      <div className="grid grid-cols-4 gap-2">
        {stickers.map((sticker, index) => (
          <button
            key={index}
            onClick={() => onStickerSelect(sticker)}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Image
              src={sticker}
              alt="Sticker"
              width={64}
              height={64}
              className="w-full h-auto"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
