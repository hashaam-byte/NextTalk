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
import { useRouter } from 'next/navigation';

interface Post {
  id: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
  visibility: 'public' | 'friends' | 'private';
  category?: string;
  tags?: string[];
}

export default function CameraPage() {
  const { status } = useSession();
  const router = useRouter();
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [filterMode, setFilterMode] = useState<'effect' | 'basic'>('effect');
  const [mediaMode, setMediaMode] = useState<'photo' | 'video' | 'upload'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | 'pending'>('pending');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<File | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef<number>(0);
  const [recordingTime, setRecordingTime] = useState<string>('00:00');
  const messagesEndRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: mediaMode === 'video'
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraPermission(true);
      }
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

  const handleFileUpload = (file: File) => {
    setUploadedMedia(file);
  };

  const handleGooglePhotos = async () => {
    // Google Photos API scope
    const scope = 'https://www.googleapis.com/auth/photoslibrary.readonly';
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    // Redirect to Google auth
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback&response_type=code&scope=${scope}&access_type=offline`;
    
    window.location.href = authUrl;
  };

  const handlePost = async () => {
    if (!uploadedMedia) return;

    const formData = new FormData();
    formData.append('media', uploadedMedia);
    formData.append('type', mediaMode);
    formData.append('visibility', 'public'); // or let user choose

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        router.push('/reels');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black p-4">
      {/* Mode Selection */}
      <div className="mb-4 flex justify-center space-x-4">
        <button
          onClick={() => setMediaMode('photo')}
          className={`px-4 py-2 rounded-full ${
            mediaMode === 'photo' ? 'bg-purple-600' : 'bg-white/10'
          }`}
        >
          Photo
        </button>
        <button
          onClick={() => setMediaMode('video')}
          className={`px-4 py-2 rounded-full ${
            mediaMode === 'video' ? 'bg-purple-600' : 'bg-white/10'
          }`}
        >
          Video
        </button>
        <button
          onClick={() => setMediaMode('upload')}
          className={`px-4 py-2 rounded-full ${
            mediaMode === 'upload' ? 'bg-purple-600' : 'bg-white/10'
          }`}
        >
          Upload
        </button>
      </div>

      {/* Camera/Video Preview */}
      {(mediaMode === 'photo' || mediaMode === 'video') && (
        <div className="relative aspect-[9/16] max-w-md mx-auto rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 bg-red-500 px-2 py-1 rounded-full text-sm">
              {recordingDuration}s
            </div>
          )}
          
          {/* Capture Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-4">
            {mediaMode === 'photo' ? (
              <button
                onClick={takePhoto}
                className="w-16 h-16 rounded-full bg-white"
              />
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-16 h-16 rounded-full ${
                  isRecording ? 'bg-red-500' : 'bg-white'
                }`}
              />
            )}
          </div>
        </div>
      )}

      {/* Upload Section */}
      {mediaMode === 'upload' && (
        <div className="text-center">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-purple-600 rounded-lg mb-4"
          >
            Choose File
          </button>
          <button
            onClick={handleGooglePhotos}
            className="px-6 py-3 bg-blue-600 rounded-lg block w-full"
          >
            Import from Google Photos
          </button>
        </div>
      )}

      {/* Preview & Post */}
      {uploadedMedia && (
        <div className="mt-4">
          {uploadedMedia.type.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(uploadedMedia)}
              alt="Preview"
              className="max-w-md mx-auto rounded-xl"
            />
          ) : (
            <video
              src={URL.createObjectURL(uploadedMedia)}
              controls
              className="max-w-md mx-auto rounded-xl"
            />
          )}
          
          <button
            onClick={handlePost}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg block w-full max-w-md mx-auto"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}

// Add this CSS to your global styles or component
const styles = `
  .mirror {
    transform: scaleX(-1);
  }
`;