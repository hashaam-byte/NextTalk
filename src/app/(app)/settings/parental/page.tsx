'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Shield, Eye, AlertTriangle, Calendar,
  BarChart, Lock, BellRing, Users, MessageCircle
} from 'lucide-react';

export default function ParentalControlPage() {
  const [screenTimeLimit, setScreenTimeLimit] = useState(60); // minutes
  const [notifications, setNotifications] = useState(true);
  const [contentFilter, setContentFilter] = useState('strict');
  const [monitoredApps, setMonitoredApps] = useState(['chat', 'video', 'groups']);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 mb-4"
          >
            <Shield size={32} className="text-purple-400" />
          </motion.div>
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Parental Controls
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400"
          >
            Coming Soon - Manage and monitor your child's app usage
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Clock className="mr-2 text-purple-400" />
              Screen Time Limits
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 block mb-2">Daily limit (minutes)</label>
                <input
                  type="range"
                  min="15"
                  max="240"
                  value={screenTimeLimit}
                  onChange={(e) => setScreenTimeLimit(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-white mt-2">{screenTimeLimit} minutes</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Eye className="mr-2 text-cyan-400" />
              Content Filtering
            </h2>
            <div className="space-y-4">
              <select
                value={contentFilter}
                onChange={(e) => setContentFilter(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-lg p-2 text-white"
              >
                <option value="strict">Strict</option>
                <option value="moderate">Moderate</option>
                <option value="light">Light</option>
              </select>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl p-8 border border-white/10 backdrop-blur-sm text-center"
        >
          <AlertTriangle className="mx-auto mb-4 text-yellow-400" size={32} />
          <h2 className="text-xl font-semibold text-white mb-2">Coming Soon</h2>
          <p className="text-gray-300 mb-4">
            These features are currently in development and will be available in Q3 2025.
          </p>
          <button
            className="px-6 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            Join Waitlist
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
            <BellRing className="mb-4 text-purple-400" />
            <h3 className="text-white font-semibold mb-2">Activity Alerts</h3>
            <p className="text-gray-400">Get real-time notifications about your child's app activity.</p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
            <BarChart className="mb-4 text-cyan-400" />
            <h3 className="text-white font-semibold mb-2">Usage Reports</h3>
            <p className="text-gray-400">Weekly reports detailing app usage patterns and activity.</p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
            <Lock className="mb-4 text-indigo-400" />
            <h3 className="text-white font-semibold mb-2">Safe Mode</h3>
            <p className="text-gray-400">Enhanced protection and restricted access to sensitive content.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
