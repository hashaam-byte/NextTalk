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

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  isOpen,
  onClose,
  recentLimit = 16,
  theme = 'auto'
}) => {
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
    <AnimatePresence>
      <motion.div
        ref={pickerRef}
        className={`emoji-picker fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden ${getThemeClass()}`}
        style={{ width: '320px', height: '400px' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
      >
        {/* Header */}
        <div className="emoji-picker-header flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Emoji Picker</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Search */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search emojis..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full py-2 pl-8 pr-4 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Skin tone selector */}
        <div className="flex items-center justify-end px-3 py-1 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1">
            <button 
              onClick={() => setSelectedSkinTone(0)}
              className={`w-5 h-5 rounded-full ${selectedSkinTone === 0 ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: '#FFCC22' }}
            />
            {skinTones.map((_, index) => (
              <button 
                key={index}
                onClick={() => setSelectedSkinTone(index + 1)}
                className={`w-5 h-5 rounded-full ${selectedSkinTone === index + 1 ? 'ring-2 ring-blue-500' : ''}`}
                style={{ backgroundColor: ['#F7DECE', '#E0BB95', '#BF8F68', '#9B643D', '#594539'][index] }}
              />
            ))}
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {EMOJI_CATEGORIES.map(category => (
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
        
        {/* Emoji grid */}
        <div className="emoji-grid p-2 overflow-y-auto" style={{ height: 'calc(100% - 170px)' }}>
          {currentEmojis.length > 0 ? (
            <div className="grid grid-cols-7 gap-1">
              {currentEmojis.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  onClick={() => handleEmojiClick(applySkinTone(emoji))}
                  className="flex items-center justify-center p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <span className="text-2xl">{applySkinTone(emoji)}</span>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              No emojis found for "{searchQuery}"
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              No emojis in this category
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmojiPicker;