'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2,
  Trash2,
  Download,
  Upload,
  Waveform
} from 'lucide-react';
import io from 'socket.io-client';

interface AudioRecording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  createdAt: Date;
}

export default function AudioCreationPage() {
  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const socketRef = useRef<any>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentRecording, setCurrentRecording] = useState<AudioRecording | null>(null);
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [caption, setCaption] = useState('');
  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // Request microphone permission
    requestMicrophonePermission();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io({ path: '/api/socket/io', transports: ['websocket'] });
    }
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionGranted(false);
    }
  };

  const startRecording = async () => {
    if (!permissionGranted) {
      await requestMicrophonePermission();
      if (!permissionGranted) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Setup audio context for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start visualization
      visualizeAudio();

      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        const url = URL.createObjectURL(blob);
        const newRecording: AudioRecording = {
          id: Date.now().toString(),
          blob,
          url,
          duration: recordingTime,
          createdAt: new Date(),
        };
        
        setCurrentRecording(newRecording);
        setRecordings(prev => [newRecording, ...prev]);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const draw = () => {
      if (!isRecording) return;
      
      analyserRef.current!.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / dataArray.length;
      let x = 0;
      
      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#8B5CF6');
        gradient.addColorStop(1, '#EC4899');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const playRecording = (recording: AudioRecording) => {
    if (audioRef.current) {
      if (isPlaying && currentRecording?.id === recording.id) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.src = recording.url;
        audioRef.current.play();
        setIsPlaying(true);
        setCurrentRecording(recording);
      }
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(rec => rec.id !== id));
    if (currentRecording?.id === id) {
      setCurrentRecording(null);
      setIsPlaying(false);
    }
  };

  const downloadRecording = (recording: AudioRecording) => {
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `recording-${recording.id}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetRecording = () => {
    setRecordingTime(0);
    setCurrentRecording(null);
    setIsRecording(false);
    setIsPaused(false);
    setIsPlaying(false);
  };

  const handlePost = async () => {
    if (!currentRecording) return;

    try {
      const formData = new FormData();
      formData.append('media', currentRecording.blob, `audio-${currentRecording.id}.webm`);
      formData.append('caption', caption);
      formData.append('mediaType', 'AUDIO');
      formData.append('duration', currentRecording.duration.toString());

      console.log('Posting audio status:', {
        duration: currentRecording.duration,
        caption,
        type: 'AUDIO'
      });

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
      console.error('Error posting audio status:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!permissionGranted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-center p-8">
          <Mic className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Microphone Access Required</h2>
          <p className="text-gray-400 mb-6">Please allow microphone access to record audio</p>
          <button
            onClick={requestMicrophonePermission}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-medium"
          >
            Allow Microphone
          </button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold">Record Audio</h1>
          </div>
          
          {currentRecording && (
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
        {/* Recording Interface */}
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/10">
          {/* Audio Visualizer */}
          <div className="mb-6">
            <canvas
              ref={canvasRef}
              width={400}
              height={100}
              className="w-full h-24 bg-gray-800/50 rounded-lg"
            />
          </div>

          {/* Recording Timer */}
          <div className="text-center mb-6">
            <div className="text-4xl font-mono font-bold text-purple-400 mb-2">
              {formatTime(recordingTime)}
            </div>
            {isRecording && (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">
                  {isPaused ? 'Paused' : 'Recording...'}
                </span>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4">
            {!isRecording ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Mic className="w-8 h-8 text-white" />
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pauseRecording}
                  className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center"
                >
                  {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopRecording}
                  className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center"
                >
                  <Square className="w-8 h-8 text-white" />
                </motion.button>
              </>
            )}
          </div>

          {/* Reset Button */}
          {!isRecording && recordingTime > 0 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={resetRecording}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-full hover:bg-gray-600"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm">Reset</span>
              </button>
            </div>
          )}
        </div>

        {/* Caption Input */}
        {currentRecording && (
          <div className="mb-6">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption to your audio..."
              className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl resize-none focus:outline-none focus:border-purple-500"
              rows={3}
            />
          </div>
        )}

        {/* Recordings List */}
        {recordings.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-400">Your Recordings</h3>
            {recordings.map((recording) => (
              <motion.div
                key={recording.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => playRecording(recording)}
                      className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700"
                    >
                      {isPlaying && currentRecording?.id === recording.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div>
                      <p className="font-medium">
                        Recording {recording.id}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatTime(recording.duration)} • {recording.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadRecording(recording)}
                      className="p-2 bg-blue-600 rounded-full hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="p-2 bg-red-600 rounded-full hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setPlaybackTime(e.currentTarget.currentTime)}
      />
    </div>
  );
}