'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

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
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      <div className="sticky top-0 z-10 bg-black/30 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors mr-3"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
            Add Contact
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-6 mt-10">
        <h1 className="text-2xl font-bold text-white mb-6">Add Contact</h1>

        <form onSubmit={handleAddContact} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Enter email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 text-white"
              placeholder="contact@example.com"
              required
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-500 bg-green-500/10 rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Add Contact'}
          </button>
        </form>
      </div>
    </div>
  );
}
