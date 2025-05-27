'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text mb-4">
            404
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Go Back Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
