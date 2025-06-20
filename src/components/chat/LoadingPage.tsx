import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingPage() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 relative overflow-hidden">
      {/* Background glowing elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25"></div>
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Main loading spinner container */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            {/* First thick semi-circle */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-purple-400 border-r-purple-400 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 50%, rgba(168, 85, 247, 0.8) 100%)'
              }}
            />
            
            {/* Second thick semi-circle */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 w-20 h-20 border-4 border-transparent border-b-purple-600 border-l-purple-600 rounded-full"
              style={{
                background: 'conic-gradient(from 180deg, transparent 50%, rgba(147, 51, 234, 0.9) 100%)'
              }}
            />
            
            {/* Inner pulsing core */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-6 w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-700 rounded-full shadow-lg shadow-purple-500/50"
            />
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut"
                }}
                className="absolute w-2 h-2 bg-purple-400 rounded-full"
                style={{
                  left: `${45 + Math.cos(i * Math.PI / 3) * 60}%`,
                  top: `${50 + Math.sin(i * Math.PI / 3) * 60}%`,
                }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-gray-800 rounded-full mb-6 overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
            />
          </div>

          {/* Loading text */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-medium text-white mb-2"
          >
            Loading Chat...
          </motion.p>

          {/* Subtitle with typing effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-gray-400"
          >
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Initializing secure connection
          </motion.span>
          </motion.div>

          {/* DNA helix loading indicator */}
          <div className="mt-8 flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeInOut"
                }}
                className="w-1 h-4 bg-gradient-to-t from-purple-600 to-purple-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}