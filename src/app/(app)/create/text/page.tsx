'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Type, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Italic,
  Underline,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface TextStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  backgroundType: 'solid' | 'gradient';
  gradientDirection: string;
}

export default function TextCreationPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [text, setText] = useState('');
  const [textStyle, setTextStyle] = useState<TextStyle>({
    fontSize: 24,
    fontFamily: 'Inter',
    color: '#ffffff',
    backgroundColor: '#8b5cf6',
    textAlign: 'center',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    backgroundType: 'gradient',
    gradientDirection: 'from-purple-500 to-pink-500',
  });

  const fontFamilies = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Playfair', value: 'Playfair Display, serif' },
    { name: 'Dancing Script', value: 'Dancing Script, cursive' },
    { name: 'Courier', value: 'Courier New, monospace' },
  ];

  const gradientBackgrounds = [
    'from-purple-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-teal-500',
    'from-orange-500 to-red-500',
    'from-yellow-500 to-orange-500',
    'from-indigo-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-gray-800 to-gray-900',
    'from-black to-gray-800',
  ];

  const solidColors = [
    '#8b5cf6', '#ef4444', '#10b981', '#3b82f6',
    '#f59e0b', '#ec4899', '#06b6d4', '#84cc16',
    '#6366f1', '#f97316', '#14b8a6', '#a855f7',
  ];

  const textColors = [
    '#ffffff', '#000000', '#ef4444', '#10b981',
    '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6',
  ];

  const updateStyle = (updates: Partial<TextStyle>) => {
    setTextStyle(prev => ({ ...prev, ...updates }));
  };

  const handlePost = async () => {
    if (!text.trim()) return;

    try {
      const postData = {
        type: 'TEXT',
        textContent: text,
        textStyle: textStyle,
      };

      console.log('Posting text status:', postData);
      
      // Always redirect to reels page after posting
      router.push('/reels');
    } catch (error) {
      console.error('Error posting text status:', error);
    }
  };

  const resetStyles = () => {
    setTextStyle({
      fontSize: 24,
      fontFamily: 'Inter',
      color: '#ffffff',
      backgroundColor: '#8b5cf6',
      textAlign: 'center',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      backgroundType: 'gradient',
      gradientDirection: 'from-purple-500 to-pink-500',
    });
  };

  const getBackgroundStyle = () => {
    if (textStyle.backgroundType === 'gradient') {
      return `bg-gradient-to-br ${textStyle.gradientDirection}`;
    }
    return '';
  };

  const getInlineBackgroundStyle = () => {
    if (textStyle.backgroundType === 'solid') {
      return { backgroundColor: textStyle.backgroundColor };
    }
    return {};
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/30 backdrop-blur-lg p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Create Text Post</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={resetStyles}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handlePost}
              disabled={!text.trim()}
              className={`px-4 py-2 rounded-full font-medium transition-opacity ${
                text.trim()
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-gray-600 opacity-50 cursor-not-allowed'
              }`}
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Preview */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div 
            className={`w-full max-w-md aspect-[9/16] rounded-2xl flex items-center justify-center p-8 ${getBackgroundStyle()}`}
            style={getInlineBackgroundStyle()}
          >
            <div
              className="w-full text-center break-words"
              style={{
                fontSize: `${textStyle.fontSize}px`,
                fontFamily: textStyle.fontFamily,
                color: textStyle.color,
                textAlign: textStyle.textAlign,
                fontWeight: textStyle.fontWeight,
                fontStyle: textStyle.fontStyle,
                textDecoration: textStyle.textDecoration,
                lineHeight: 1.4,
              }}
            >
              {text || 'Type your message...'}
            </div>
          </div>
        </div>

        {/* Text Input */}
        <div className="p-4 border-t border-gray-800">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl resize-none focus:outline-none focus:border-purple-500 text-white placeholder-gray-400"
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">
              {text.length}/500 characters
            </span>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400">Express yourself!</span>
            </div>
          </div>
        </div>

        {/* Style Controls */}
        <div className="p-4 space-y-6 bg-gray-900 border-t border-gray-800 max-h-80 overflow-y-auto">
          {/* Font Controls */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Type className="w-4 h-4 mr-2" />
              Font Style
            </h3>
            
            {/* Font Family */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-2 block">Font Family</label>
              <select
                value={textStyle.fontFamily}
                onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              >
                {fontFamilies.map((font) => (
                  <option key={font.name} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-2 block">
                Font Size: {textStyle.fontSize}px
              </label>
              <input
                type="range"
                min="16"
                max="48"
                value={textStyle.fontSize}
                onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Text Style Buttons */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => updateStyle({ 
                  fontWeight: textStyle.fontWeight === 'bold' ? 'normal' : 'bold' 
                })}
                className={`p-2 rounded-lg border ${
                  textStyle.fontWeight === 'bold'
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                <Bold className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => updateStyle({ 
                  fontStyle: textStyle.fontStyle === 'italic' ? 'normal' : 'italic' 
                })}
                className={`p-2 rounded-lg border ${
                  textStyle.fontStyle === 'italic'
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                <Italic className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => updateStyle({ 
                  textDecoration: textStyle.textDecoration === 'underline' ? 'none' : 'underline' 
                })}
                className={`p-2 rounded-lg border ${
                  textStyle.textDecoration === 'underline'
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>

            {/* Text Alignment */}
            <div className="flex space-x-2">
              {[
                { align: 'left', icon: AlignLeft },
                { align: 'center', icon: AlignCenter },
                { align: 'right', icon: AlignRight },
              ].map(({ align, icon: Icon }) => (
                <button
                  key={align}
                  onClick={() => updateStyle({ textAlign: align as any })}
                  className={`p-2 rounded-lg border ${
                    textStyle.textAlign === align
                      ? 'bg-purple-600 border-purple-500'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Text Color */}
          <div>
            <h3 className="text-sm font-medium mb-3">Text Color</h3>
            <div className="grid grid-cols-8 gap-2">
              {textColors.map((color) => (
                <button
                  key={color}
                  onClick={() => updateStyle({ color })}
                  className={`w-8 h-8 rounded-full border-2 ${
                    textStyle.color === color ? 'border-white' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Background Controls */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              Background
            </h3>
            
            {/* Background Type Toggle */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => updateStyle({ backgroundType: 'gradient' })}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  textStyle.backgroundType === 'gradient'
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                Gradient
              </button>
              <button
                onClick={() => updateStyle({ backgroundType: 'solid' })}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  textStyle.backgroundType === 'solid'
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                Solid
              </button>
            </div>

            {/* Background Options */}
            {textStyle.backgroundType === 'gradient' ? (
              <div className="grid grid-cols-3 gap-2">
                {gradientBackgrounds.map((gradient) => (
                  <button
                    key={gradient}
                    onClick={() => updateStyle({ gradientDirection: gradient })}
                    className={`h-12 rounded-lg bg-gradient-to-br ${gradient} border-2 ${
                      textStyle.gradientDirection === gradient ? 'border-white' : 'border-gray-600'
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {solidColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateStyle({ backgroundColor: color })}
                    className={`w-12 h-12 rounded-lg border-2 ${
                      textStyle.backgroundColor === color ? 'border-white' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}