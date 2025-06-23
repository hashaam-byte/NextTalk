'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Upload, 
  Music, 
  Search, 
  Heart,
  Download,
  Volume2,
  VolumeX,
  RotateCcw,
  FastForward,
  Rewind
} from 'lucide-react';
import Image from 'next/image';
import io from 'socket.io-client';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  coverUrl?: string;
  audioUrl: string;
  genre: string;
  isPopular?: boolean;
}

interface MusicCategory {
  id: string;
  name: string;
  tracks: MusicTrack[];
}

export default function MusicCreationPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<any>(null);
  
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [caption, setCaption] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Mock music data
  const musicCategories: MusicCategory[] = [
    {
      id: 'trending',
      name: 'Trending',
      tracks: [
        {
          id: '1',
          title: 'Summer Vibes',
          artist: 'DJ Cool',
          duration: 180,
          coverUrl: '/api/placeholder/300/300',
          audioUrl: '/api/placeholder/audio/1',
          genre: 'Electronic',
          isPopular: true,
        },
        {
          id: '2',
          title: 'Midnight Drive',
          artist: 'Synthwave Pro',
          duration: 210,
          coverUrl: '/api/placeholder/300/300',
          audioUrl: '/api/placeholder/audio/2',
          genre: 'Synthwave',
          isPopular: true,
        },
      ],
    },
    {
      id: 'pop',
      name: 'Pop',
      tracks: [
        {
          id: '3',
          title: 'Dancing Queen',
          artist: 'Pop Star',
          duration: 195,
          coverUrl: '/api/placeholder/300/300',
          audioUrl: '/api/placeholder/audio/3',
          genre: 'Pop',
        },
      ],
    },
    {
      id: 'electronic',
      name: 'Electronic',
      tracks: [
        {
          id: '4',
          title: 'Digital Dreams',
          artist: 'Electro Beats',
          duration: 240,
          coverUrl: '/api/placeholder/300/300',
          audioUrl: '/api/placeholder/audio/4',
          genre: 'Electronic',
        },
      ],
    },
  ];

  const categories = ['trending', 'pop', 'electronic', 'hip-hop', 'rock', 'jazz'];
  
  const filteredTracks = musicCategories
    .find(cat => cat.id === selectedCategory)?.tracks
    .filter(track => 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [selectedTrack]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io({ path: '/api/socket/io', transports: ['websocket'] });
    }
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !selectedTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value);
    
    if (audio) {
      audio.volume = newVolume;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const selectTrack = (track: MusicTrack) => {
    setSelectedTrack(track);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadedFile(file);
      const customTrack: MusicTrack = {
        id: 'custom',
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'You',
        duration: 0,
        audioUrl: URL.createObjectURL(file),
        genre: 'Custom',
      };
      setSelectedTrack(customTrack);
      setShowUploadModal(false);
    }
  };

  const handlePost = async () => {
    if (!selectedTrack) return;

    try {
      const formData = new FormData();
      if (uploadedFile) {
        formData.append('media', uploadedFile, uploadedFile.name);
        formData.append('mediaType', 'AUDIO');
      } else {
        // If using a sample/URL, you may want to handle differently
        formData.append('mediaUrl', selectedTrack.audioUrl);
        formData.append('mediaType', 'AUDIO');
      }
      formData.append('caption', caption);

      // Here you would upload the music post
      const postData = {
        type: 'MUSIC',
        musicId: selectedTrack.id,
        caption: caption,
        audioFile: uploadedFile,
      };

      console.log('Posting music status:', postData);
      
      await fetch('/api/reels/status', {
        method: 'POST',
        body: formData,
      });

      if (socketRef.current) {
        socketRef.current.emit('new:status');
      }

      // Always redirect to reels page after posting
      router.push('/reels');
    } catch (error) {
      console.error('Error posting music status:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
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
            <h1 className="text-xl font-bold">Add Music</h1>
          </div>
          
          {selectedTrack && (
            <button
              onClick={handlePost}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-medium"
            >
              Post
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for music..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Upload Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUploadModal(true)}
          className="w-full mb-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span className="font-medium">Upload Your Music</span>
        </motion.button>

        {/* Categories */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Music List */}
        <div className="space-y-3 mb-6">
          {filteredTracks.map((track) => (
            <motion.div
              key={track.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectTrack(track)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedTrack?.id === track.id
                  ? 'bg-purple-600/20 border-purple-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                  {track.coverUrl ? (
                    <Image
                      src={track.coverUrl}
                      alt={track.title}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{track.title}</h3>
                  <p className="text-sm text-gray-400">{track.artist}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {track.isPopular && (
                    <Heart className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-400">
                    {formatTime(track.duration)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Music Player */}
        {selectedTrack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-4 bg-gray-900/95 backdrop-blur-lg rounded-2xl p-4 border border-gray-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700">
                {selectedTrack.coverUrl ? (
                  <Image
                    src={selectedTrack.coverUrl}
                    alt={selectedTrack.title}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium">{selectedTrack.title}</h3>
                <p className="text-sm text-gray-400">{selectedTrack.artist}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                  <Rewind className="w-4 h-4" />
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="p-3 rounded-full bg-purple-600 hover:bg-purple-700"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </motion.button>
                
                <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700">
                  <FastForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Caption Input */}
            <div className="mt-4">
              <textarea
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:outline-none focus:border-purple-500"
                rows={2}
              />
            </div>

            {/* Audio Element */}
            <audio
              ref={audioRef}
              src={selectedTrack.audioUrl}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setDuration(audioRef.current.duration);
                }
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-center">Upload Music</h3>
              
              <div className="space-y-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-gray-600 rounded-xl hover:border-purple-500 transition-colors flex flex-col items-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-gray-400">Choose audio file</span>
                  <span className="text-xs text-gray-500">MP3, WAV, M4A supported</span>
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-full mt-4 p-3 rounded-xl bg-gray-800 text-gray-300 font-medium"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}