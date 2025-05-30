'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, UserPlus, Mail, AlertCircle, Check } from 'lucide-react';

export default function AddContactPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add contact');
      }

      setSuccess(
        data.status === 'INVITED' 
          ? 'Invitation sent to join NexTalk!' 
          : 'Contact request sent successfully!'
      );
      setEmail('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-400/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-2/3 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25"></div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 bg-black/30 backdrop-blur-lg border-b border-white/10"
      >
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-16">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-white/10 transition-colors mr-3"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
              Add Contact
            </h1>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-md mx-auto px-4 py-12">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl"
        >
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                <UserPlus size={24} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Add New Contact</h2>
            <p className="text-gray-400 text-sm">
              Enter the email address to send a contact request
            </p>
          </div>

          <form onSubmit={handleAddContact} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="contact@example.com"
                required
              />
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <AlertCircle size={18} className="text-red-400 mr-2" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl"
                >
                  <Check size={18} className="text-green-400 mr-2" />
                  <p className="text-sm text-green-400">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Sending...' : 'Send Request'}</span>
              {!loading && <Send size={18} />}
            </motion.button>
          </form>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
        >
          <h3 className="text-sm font-medium text-gray-300 mb-2">Quick Tips:</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li className="flex items-center">
              <div className="w-1 h-1 bg-purple-400 rounded-full mr-2"></div>
              The contact will receive an email invitation
            </li>
            <li className="flex items-center">
              <div className="w-1 h-1 bg-cyan-400 rounded-full mr-2"></div>
              They must accept your request to connect
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
