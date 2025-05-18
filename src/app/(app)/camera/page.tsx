'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera as CameraIcon, Video, RotateCcw,
  Image as ImageIcon, X, Download, Share, Trash2,
  Sparkles, AlertCircle, Camera, CheckCircle2, XCircle, Layers
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import FiltersComponent from '@/components/FiltersComponent';
import ARFilter from '@/components/ARFilter';

export default function CameraPage() {
  const { status } = useSession();
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [filterMode, setFilterMode] = useState<'effect' | 'basic'>('effect');
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | 'pending'>('pending');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef<number>(0);
  const [recordingTime, setRecordingTime] = useState<string>('00:00');
  const messagesEndRef = useRef<HTMLCanvasElement>(null);

  const filterOptions = [
    { name: 'Normal', value: 'none' },
    { name: 'Grayscale', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Invert', value: 'invert(80%)' },
    { name: 'Blur', value: 'blur(2px)' },
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setPermissionState('granted'))
      .catch((err) => {
        if (err.name === 'NotAllowedError') {
          setPermissionState('denied');
        }
      });
  }, []);

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissionState('granted');
      initCamera(); // Initialize camera after permission is granted
    } catch (error) {
      console.error('Camera permission denied:', error);
      setPermissionState('denied');
    }
  };

  const initCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPermission(true);
    } catch (error) {
      console.error('Error initializing camera:', error);
      setCameraPermission(false);
    }
  };

  useEffect(() => {
    if (cameraPermission === 'pending' || facingMode) {
      initCamera();
    }

    // Clean up function to stop camera when component unmounts
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [cameraPermission, facingMode, initCamera]);

  useEffect(() => {
    const currentVideo = videoRef.current;
    return () => {
      if (currentVideo && currentVideo.srcObject) {
        const stream = currentVideo.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';

    // Stop current stream
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }

    setFacingMode(newFacingMode);
  };

  const toggleFilterMode = () => {
    setFilterMode(prev => prev === 'effect' ? 'basic' : 'effect');
    // Reset filters when switching modes
    setSelectedFilter('none');
  };

  const takePhoto = () => {
    if (countdown !== null) {
      setCountdown(null);
      return;
    }

    // Start countdown from 3
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          capturePhoto();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Apply filter effects if any
        if (selectedFilter !== 'none') {
          ctx.filter = selectedFilter;
        }

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
      }
    }
  };

  const startRecording = () => {
    if (!videoRef.current) return;

    const stream = videoRef.current.srcObject as MediaStream;
    chunksRef.current = [];

    try {
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(blob);
        setCapturedVideo(videoUrl);
        setIsRecording(false);
        recordingTimeRef.current = 0;
        setRecordingTime('00:00');

        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Start recording timer
      timerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        const minutes = Math.floor(recordingTimeRef.current / 60);
        const seconds = recordingTimeRef.current % 60;
        setRecordingTime(
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleRecordingButton = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const discardCapture = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
  };

  const downloadCapture = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `nexttalk-photo-${Date.now()}.png`;
      link.click();
    } else if (capturedVideo) {
      const link = document.createElement('a');
      link.href = capturedVideo;
      link.download = `nexttalk-video-${Date.now()}.mp4`;
      link.click();
    }
  };

  const shareCapture = () => {
    // This is a simplified implementation
    // In a real app, you'd use the Web Share API or custom sharing options
    alert('Sharing functionality would be implemented here!');
  };

  const applyFilter = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.filter = selectedFilter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 overflow-y-auto">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-full">
        {permissionState === 'prompt' ? (
          <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
            <div className="text-center p-8 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 max-w-md mx-4">
              <div className="mb-6 w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                <Camera size={32} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Camera Access Required</h2>
              <p className="text-gray-300 mb-6">
                NexTalk needs access to your camera for photos and video calls. 
                Would you like to allow camera access?
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => requestCameraPermission()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl flex items-center"
                >
                  <CheckCircle2 size={18} className="mr-2" />
                  Allow Access
                </button>
                <button
                  onClick={() => setPermissionState('denied')}
                  className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl flex items-center"
                >
                  <XCircle size={18} className="mr-2" />
                  Deny
                </button>
              </div>
            </div>
          </div>
        ) : permissionState === 'denied' ? (
          <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
            <div className="text-center p-8 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 max-w-md mx-4">
              <div className="mb-6 w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Camera Access Denied</h2>
              <p className="text-gray-300 mb-6">
                Camera access is required to use this feature. Please enable camera access in your browser settings and reload the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl"
              >
                Reload Page
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 flex flex-col items-center">
            {/* Camera Preview Container */}
            <div className="w-full max-w-2xl mx-auto mb-6">
              <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover mirror"
                />
                {selectedFilter !== 'none' && (
                  <div 
                    className="absolute inset-0"
                    style={{ filter: selectedFilter }}
                  />
                )}
                {filterMode === 'ar' && (
                  <canvas
                    ref={messagesEndRef}
                    className="absolute inset-0 w-full h-full"
                  />
                )}
              </div>
            </div>

            {/* Controls Section */}
            <div className="w-full max-w-md mx-auto bg-black/30 backdrop-blur-md rounded-2xl p-4 mb-6">
              {/* Filter Mode Toggle */}
              <div className="flex justify-center mb-4">
                <div className="bg-black/40 rounded-full p-1 flex space-x-2">
                  <button
                    onClick={() => setFilterMode('effect')}
                    className={`px-4 py-2 rounded-full transition ${
                      filterMode === 'effect'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400'
                    }`}
                  >
                    Effects
                  </button>
                  <button
                    onClick={() => setFilterMode('ar')}
                    className={`px-4 py-2 rounded-full transition ${
                      filterMode === 'ar'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400'
                    }`}
                  >
                    AR Filters
                  </button>
                </div>
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-4 gap-3">
                {filterMode === 'effect' ? (
                  filterOptions.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setSelectedFilter(filter.value)}
                      className={`p-3 rounded-xl border ${
                        selectedFilter === filter.value
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <span className="text-sm text-white">
                        {filter.name}
                      </span>
                    </button>
                  ))
                ) : (
                  ['dogears', 'glasses', 'crown', 'bunny', 'heart', 'mustache'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedARFilter(filter)}
                      className={`p-3 rounded-xl border ${
                        selectedARFilter === filter
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <span className="text-sm text-white capitalize">
                        {filter}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Camera Controls */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleCamera}
                className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-gray-200"
              >
                <RotateCcw size={24} />
              </motion.button>
              
              {mode === 'photo' ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={takePhoto}
                  className="p-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white opacity-20 rounded-full scale-125 animate-ping"></div>
                  <CameraIcon size={28} className="text-white" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRecordingButton}
                  className={`p-5 rounded-full relative ${
                    isRecording
                      ? 'bg-red-600'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                  }`}
                >
                  {isRecording && (
                    <div className="absolute inset-0 bg-red-500 opacity-20 rounded-full scale-125 animate-ping"></div>
                  )}
                  {isRecording ? (
                    <X size={28} className="text-white" />
                  ) : (
                    <Video size={28} className="text-white" />
                  )}
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-gray-200"
              >
                <ImageIcon size={24} />
              </motion.button>
            </div>

            {/* AR Filter Component */}
            {filterMode === 'ar' && (
              <ARFilter
                filterId={selectedARFilter}
                videoRef={videoRef}
                canvasRef={messagesEndRef}
                isActive={filterMode === 'ar'}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Add this CSS to your global styles or component
const styles = `
  .mirror {
    transform: scaleX(-1);
  }
`;