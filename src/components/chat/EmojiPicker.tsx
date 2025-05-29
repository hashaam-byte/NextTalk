'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onClose: () => void;
  recentLimit?: number;
  theme?: 'light' | 'dark' | 'auto';
}

// Emoji categories with sample emojis
const EMOJI_CATEGORIES = [
  {
    name: 'Recent',
    icon: '🕒',
    emojis: [] // Will be populated from localStorage
  },
  {
    name: 'Smileys',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '🥲', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳']
  },
  {
    name: 'Gestures',
    icon: '👋',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏']
  },
  {
    name: 'People',
    icon: '👨',
    emojis: ['👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👱‍♀️', '👱', '👵', '🧓', '👴', '👲', '👳‍♀️', '👳', '🧕', '👮‍♀️', '👮', '👷‍♀️', '👷', '💂‍♀️', '💂', '🕵️‍♀️', '🕵️', '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾']
  },
  {
    name: 'Animals',
    icon: '🐶',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅']
  },
  {
    name: 'Food',
    icon: '🍔',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕']
  },
  {
    name: 'Travel',
    icon: '✈️',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸']
  },
  {
    name: 'Symbols',
    icon: '💯',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️']
  }
];

export default function EmojiPicker({ onEmojiSelect, isOpen, onClose }) {
  const [currentCategory, setCurrentCategory] = useState(EMOJI_CATEGORIES[0].name);
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedSkinTone, setSelectedSkinTone] = useState(0);
  const skinTones = ['🏻', '🏼', '🏽', '🏾', '🏿'];
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent emojis from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRecents = localStorage.getItem('recentEmojis');
      if (storedRecents) {
        setRecentEmojis(JSON.parse(storedRecents));
        
        // Update the recent category
        const categoriesCopy = [...EMOJI_CATEGORIES];
        categoriesCopy[0].emojis = JSON.parse(storedRecents);
        // We don't need to update EMOJI_CATEGORIES
      }
    }
  }, []);

  // Handle click outside to close picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when opened
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle emoji selection
  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    
    // Update recent emojis
    const updatedRecents = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, recentLimit);
    setRecentEmojis(updatedRecents);
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('recentEmojis', JSON.stringify(updatedRecents));
    }
    
    // Update the recent category
    const categoriesCopy = [...EMOJI_CATEGORIES];
    categoriesCopy[0].emojis = updatedRecents;
    
    onClose();
  };
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    // Search through all categories
    const results: string[] = [];
    EMOJI_CATEGORIES.forEach(category => {
      if (category.name !== 'Recent') {
        const matchingEmojis = category.emojis.filter(emoji => {
          // This is a simple search approach - in production you'd want emoji metadata
          return emoji.includes(query);
        });
        results.push(...matchingEmojis);
      }
    });
    
    setSearchResults(Array.from(new Set(results))); // Remove duplicates
  };
  
  // Get current emoji list based on selected category or search
  const getCurrentEmojis = () => {
    if (searchQuery.trim() !== '') {
      return searchResults;
    }
    
    const category = EMOJI_CATEGORIES.find(c => c.name === currentCategory);
    return category ? category.emojis : [];
  };
  
  // Apply selected skin tone to an emoji (for emojis that support it)
  const applySkinTone = (emoji: string): string => {
    // This is a simplified approach - in production you'd use a proper emoji library
    // that knows which emojis support skin tones
    const supportsSkinTone = /^(👋|👌|✌️|🤞|👍|👎|👊|🤛|🤜|👏|🙌|👐|🤲|🙏)$/.test(emoji);
    
    if (supportsSkinTone && selectedSkinTone > 0) {
      return `${emoji}${skinTones[selectedSkinTone - 1]}`;
    }
    
    return emoji;
  };
  
  // Determine theme class
  const getThemeClass = () => {
    if (theme === 'auto') {
      return 'emoji-picker-auto';
    }
    return theme === 'dark' ? 'emoji-picker-dark' : 'emoji-picker-light';
  };
  
  // If picker is closed, don't render
  if (!isOpen) {
    return null;
  }
  
  // Current emojis to display
  const currentEmojis = getCurrentEmojis();
  
  return (
    <div className="h-full flex flex-col bg-black/90 backdrop-blur-lg rounded-t-xl overflow-hidden">
      {/* Tabs for Emojis/Stickers/GIFs */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex space-x-4">
          <button className="text-white border-b-2 border-purple-500 px-2 py-1">Emojis</button>
          <button className="text-gray-400 hover:text-white px-2 py-1">Stickers</button>
          <button className="text-gray-400 hover:text-white px-2 py-1">GIFs</button>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-white/10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search emojis..."
            className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto p-2 border-b border-white/10">
        {EMOJI_CATEGORIES.map((category) => (
          <button
            key={category.name}
            onClick={() => {
              setCurrentCategory(category.name);
              setSearchQuery('');
            }}
            className={`flex-shrink-0 p-2 rounded-md transition ${
              currentCategory === category.name && searchQuery === '' 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title={category.name}
          >
            <span className="text-xl">{category.icon}</span>
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-1">
          {getCurrentEmojis().map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(applySkinTone(emoji))}
              className="flex items-center justify-center p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <span className="text-2xl">{applySkinTone(emoji)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}