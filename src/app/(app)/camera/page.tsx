'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Camera, 
  Video, 
  RotateCcw, 
  Flashlight, 
  FlashlightOff,
  Circle,
  Square,
  Smile,
  Palette,
  Type,
  Music,
  Timer,
  Grid3X3,
  Download,
  Share2,
  Image as ImageIcon,
} from 'lucide-react';

type CameraMode = 'photo' | 'video';
type FlashMode = 'off' | 'on' | 'auto';

function CameraPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<CameraMode>((searchParams?.get('mode') as CameraMode) || 'photo');
  const [isRecording, setIsRecording] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(3);
  const [countdown, setCountdown] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [pickedMedia, setPickedMedia] = useState<string | null>(null);

  const filters = [
    { name: 'none', label: 'None', style: '' },
    { name: 'sepia', label: 'Sepia', style: 'sepia(100%)' },
    { name: 'grayscale', label: 'B&W', style: 'grayscale(100%)' },
    { name: 'vintage', label: 'Vintage', style: 'sepia(50%) contrast(120%) brightness(110%)' },
    { name: 'cool', label: 'Cool', style: 'hue-rotate(180deg) saturate(150%)' },
    { name: 'warm', label: 'Warm', style: 'hue-rotate(30deg) saturate(120%) brightness(110%)' },
  ];

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: mode === 'video',
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const cycleFlash = () => {
    setFlashMode(prev => {
      switch (prev) {
        case 'off': return 'on';
        case 'on': return 'auto';
        case 'auto': return 'off';
        default: return 'off';
      }
    });
  };

  const startCountdown = (callback: () => void) => {
    if (!showTimer) {
      callback();
      return;
    }

    setCountdown(timerSeconds);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          callback();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const capturePhoto = () => {
    startCountdown(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Apply filter
      if (selectedFilter !== 'none') {
        const filter = filters.find(f => f.name === selectedFilter);
        context.filter = filter?.style || '';
      }

      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedMedia(imageData);
      setMediaType('photo');
    });
  };

  const startVideoRecording = () => {
    if (!stream) return;

    startCountdown(() => {
      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(blob);
          setCapturedMedia(videoUrl);
          setMediaType('video');
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingDuration(0);
      } catch (error) {
        console.error('Error starting video recording:', error);
      }
    });
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCapture = () => {
    if (mode === 'photo') {
      capturePhoto();
    } else {
      if (isRecording) {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
    }
  };

  const retakeMedia = () => {
    setCapturedMedia(null);
    setMediaType(null);
    startCamera();
  };

  const handlePost = async () => {
    if (!capturedMedia) return;

    try {
      // Here you would upload the media
      const formData = new FormData();
      
      if (mediaType === 'photo') {
        // Convert data URL to blob
        const response = await fetch(capturedMedia);
        const blob = await response.blob();
        formData.append('media', blob, 'photo.jpg');
      } else if (mediaType === 'video') {
        // Handle video blob
        const response = await fetch(capturedMedia);
        const blob = await response.blob();
        formData.append('media', blob, 'video.webm');
      }

      formData.append('type', mediaType || '');
      formData.append('filter', selectedFilter);

      console.log('Posting media...');
      
      // Always redirect to reels page after posting
      router.push('/reels');
    } catch (error) {
      console.error('Error posting media:', error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Save snapped photo to device storage
  const saveToDevice = (dataUrl: string, filename = 'photo.jpg') => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // When a photo is captured, offer to save to device
  useEffect(() => {
    if (capturedMedia && mediaType === 'photo') {
      // Optionally, auto-save or show a button to save
      // saveToDevice(capturedMedia);
    }
  }, [capturedMedia, mediaType]);

  // Handle picking from gallery
  const handlePickFromGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPickedMedia(url);
    setCapturedMedia(url);
    setMediaType(file.type.startsWith('video') ? 'video' : 'photo');
  };

  if (capturedMedia) {
    return (
      <div className="min-h-screen bg-black text-white relative">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <button
            onClick={retakeMedia}
            className="p-3 rounded-full bg-black/50 backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={handlePost}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-medium"
          >
            Post
          </button>
        </div>

        {/* Media Preview */}
        <div className="absolute inset-0">
          {mediaType === 'photo' ? (
            <img
              src={capturedMedia}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={capturedMedia}
              className="w-full h-full object-cover"
              controls
            />
          )}
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-8 left-4 right-4 z-20 flex justify-center space-x-4">
          <button
            onClick={retakeMedia}
            className="p-4 rounded-full bg-gray-800/80 backdrop-blur-sm"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          
          <button className="p-4 rounded-full bg-gray-800/80 backdrop-blur-sm">
            <Download className="w-6 h-6" />
          </button>
          
          <button className="p-4 rounded-full bg-gray-800/80 backdrop-blur-sm">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Camera Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${
          selectedFilter !== 'none' 
            ? `filter ${filters.find(f => f.name === selectedFilter)?.style}` 
            : ''
        }`}
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Grid Overlay */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3">
            {Array(9).fill(0).map((_, i) => (
              <div key={i} className="border border-white/20" />
            ))}
          </div>
        </div>
      )}

      {/* Countdown Overlay */}
      {countdown > 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <motion.div
            key={countdown}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="text-8xl font-bold text-white"
          >
            {countdown}
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="p-3 rounded-full bg-black/50 backdrop-blur-sm"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={cycleFlash}
            className="p-3 rounded-full bg-black/50 backdrop-blur-sm"
          >
            {flashMode === 'off' ? (
              <FlashlightOff className="w-6 h-6" />
            ) : (
              <Flashlight className="w-6 h-6" />
            )}
          </button>
          
          <button
            onClick={() => setShowTimer(!showTimer)}
            className={`p-3 rounded-full backdrop-blur-sm ${
              showTimer ? 'bg-yellow-500/50' : 'bg-black/50'
            }`}
          >
            <Timer className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-3 rounded-full backdrop-blur-sm ${
              showGrid ? 'bg-white/20' : 'bg-black/50'
            }`}
          >
            <Grid3X3 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Recording Duration */}
      {isRecording && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-red-600 px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="font-mono">{formatDuration(recordingDuration)}</span>
          </div>
        </div>
      )}

      {/* Mode Switcher */}
      <div className="absolute top-20 left-4 right-4 z-20 flex justify-center">
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-1">
          <button
            onClick={() => setMode('photo')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              mode === 'photo' 
                ? 'bg-white text-black' 
                : 'text-white'
            }`}
          >
            Photo
          </button>
          <button
            onClick={() => setMode('video')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              mode === 'video' 
                ? 'bg-white text-black' 
                : 'text-white'
            }`}
          >
            Video
          </button>
        </div>
      </div>

      {/* Side Controls */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 space-y-4">
        <button
          onClick={switchCamera}
          className="p-4 rounded-full bg-black/50 backdrop-blur-sm"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-4 rounded-full backdrop-blur-sm ${
            showFilters ? 'bg-purple-500/50' : 'bg-black/50'
          }`}
        >
          <Palette className="w-6 h-6" />
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-20 top-1/2 transform -translate-y-1/2 z-20"
          >
            <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-4 space-y-3">
              {filters.map((filter) => (
                <button
                  key={filter.name}
                  onClick={() => setSelectedFilter(filter.name)}
                  className={`block w-16 h-16 rounded-lg border-2 text-xs font-medium ${
                    selectedFilter === filter.name
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-800/50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Settings */}
      {showTimer && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-4 flex space-x-2">
            {[3, 5, 10].map((seconds) => (
              <button
                key={seconds}
                onClick={() => setTimerSeconds(seconds)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  timerSeconds === seconds
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 text-white'
                }`}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-4 right-4 z-20 flex items-center justify-between">
        <button
          className="p-4 rounded-full bg-black/50 backdrop-blur-sm"
          onClick={() => fileInputRef.current?.click()}
          title="Pick from Gallery"
        >
          <ImageIcon className="w-6 h-6" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handlePickFromGallery}
          />
        </button>

        {/* Capture Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCapture}
          className={`relative p-2 rounded-full ${
            isRecording 
              ? 'bg-red-600' 
              : 'bg-white'
          }`}
        >
          {mode === 'photo' ? (
            <Circle className="w-16 h-16 text-black" />
          ) : isRecording ? (
            <Square className="w-16 h-16 text-white" />
          ) : (
            <Circle className="w-16 h-16 text-black" />
          )}
        </motion.button>

        {mediaType === 'photo' && capturedMedia && (
          <button
            className="p-4 rounded-full bg-black/50 backdrop-blur-sm ml-2"
            onClick={() => saveToDevice(capturedMedia)}
            title="Save to Device"
          >
            <Download className="w-6 h-6" />
          </button>
        )}

        <button className="p-4 rounded-full bg-black/50 backdrop-blur-sm">
          <Music className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

// Wrap the page in Suspense to fix the useSearchParams error
export default function CameraPage() {
  return (
    <Suspense fallback={null}>
      <CameraPageInner />
    </Suspense>
  );
}