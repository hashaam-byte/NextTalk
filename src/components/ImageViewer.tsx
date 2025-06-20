'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { X, Download } from 'lucide-react';

interface ImageViewerProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ImageViewer({ imageUrl, onClose }: ImageViewerProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        onClick={onClose}
      >
        <X className="text-white" size={24} />
      </button>

      <button 
        className="absolute top-4 left-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}
      >
        <Download className="text-white" size={24} />
      </button>

      <div 
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageUrl}
          alt="Full screen view"
          width={1200}
          height={1200}
          className="object-contain rounded-lg"
          priority
        />
      </div>
    </motion.div>
  );
}
