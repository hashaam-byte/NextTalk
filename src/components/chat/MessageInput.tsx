'use client';

import { useState, useRef } from 'react';
import { Smile, Paperclip, Camera, Mic, Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onStartRecording?: () => void;
  onSendMedia?: (file: File) => void;
}

export default function MessageInput({ onSendMessage, onStartRecording, onSendMedia }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-lg border border-white/10 rounded-xl px-3 py-2">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {}} // This will be handled by parent
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-gray-300"
        >
          <Smile size={20} />
        </button>
        <button
          onClick={() => {}} // This will be handled by parent
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-gray-300"
        >
          <Paperclip size={20} />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          className="w-full bg-transparent border-none focus:outline-none text-white placeholder-gray-400 text-sm resize-none py-2"
          style={{
            maxHeight: '120px',
            minHeight: '24px',
            height: 'auto',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (message.trim()) {
                onSendMessage(message);
                setMessage('');
              }
            }
          }}
        />
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-gray-300"
        >
          <Camera size={20} />
        </button>

        {!message.trim() ? (
          <button
            onClick={onStartRecording}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-gray-300"
          >
            <Mic size={20} />
          </button>
        ) : (
          <button
            onClick={() => {
              if (message.trim()) {
                onSendMessage(message);
                setMessage('');
              }
            }}
            className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all hover:shadow-lg hover:shadow-purple-500/20"
          >
            <Send size={18} className="text-white" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onSendMedia) {
            onSendMedia(file);
          }
        }}
        className="hidden"
      />
    </div>
  );
}
