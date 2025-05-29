'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Phone, Video } from 'lucide-react';

interface CallConfirmDialogProps {
  isOpen: boolean;
  type: 'audio' | 'video';
  contact: {
    name: string;
    avatar?: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CallConfirmDialog({
  isOpen,
  type,
  contact,
  onConfirm,
  onCancel
}: CallConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Dialog */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-gray-900/90 backdrop-blur-xl p-6 rounded-xl w-full max-w-sm mx-4 border border-white/10"
      >
        <div className="flex flex-col items-center">
          {/* Contact Avatar */}
          <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-purple-500/20">
            {contact.avatar ? (
              <Image
                src={contact.avatar}
                alt={contact.name}
                width={80}
                height={80}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl text-white">
                {contact.name[0]}
              </div>
            )}
          </div>
          
          {/* Call Type Icon */}
          <div className="mb-4">
            {type === 'audio' ? (
              <Phone className="w-8 h-8 text-purple-400" />
            ) : (
              <Video className="w-8 h-8 text-purple-400" />
            )}
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            Call {contact.name}?
          </h3>
          <p className="text-gray-300 text-sm mb-6 text-center">
            Start a {type} call with {contact.name}
          </p>
          
          {/* Action Buttons */}
          <div className="flex space-x-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
            >
              Call
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
