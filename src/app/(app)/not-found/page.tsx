'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black relative overflow-hidden flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient blobs */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-3/4 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)] opacity-25"></div>
      </div>

      <div className="relative z-10 text-center px-4">
        {/* Glowing 404 text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 blur-xl">
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              404
            </h1>
          </div>
          <h1 className="text-8xl md:text-9xl font-bold relative bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            404
          </h1>
        </motion.div>

        {/* Error message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4 mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Page Not Found
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Check the URL or try navigating back.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-white flex items-center group"
          >
            <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
            Go Back
          </motion.button>

          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center"
            >
              <Home size={18} className="mr-2" />
              Return Home
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-white flex items-center group"
          >
            <RefreshCcw size={18} className="mr-2 transition-transform group-hover:rotate-180" />
            Refresh Page
          </motion.button>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-gray-500 text-sm"
          >
            Error Code: 404_PAGE_NOT_FOUND
          </motion.div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
