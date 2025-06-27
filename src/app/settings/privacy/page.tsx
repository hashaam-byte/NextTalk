'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EyeOff, Lock, Bell, MessageSquare, Save, Key, ArrowLeft, Shield } from 'lucide-react';

export default function PrivacySettingsPage() {
  const router = useRouter();
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'friends' | 'private'>('friends');
  const [notificationPassword, setNotificationPassword] = useState('');
  const [chatPassword, setChatPassword] = useState('');
  const [requirePasswordForNotifications, setRequirePasswordForNotifications] = useState(false);
  const [requirePasswordForChats, setRequirePasswordForChats] = useState(false);
  const [privacySettingsPassword, setPrivacySettingsPassword] = useState('');
  const [requirePasswordForPrivacySettings, setRequirePasswordForPrivacySettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await fetch('/api/settings/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privacyLevel,
          requirePasswordForNotifications,
          notificationPassword,
          requirePasswordForChats,
          chatPassword,
          requirePasswordForPrivacySettings,
          privacySettingsPassword,
        }),
      });
      setSuccess(true);
    } catch (error) {
      // Handle error
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Privacy & Security Settings</h1>
        </div>

        <div className="bg-black/30 backdrop-blur-lg rounded-xl border border-white/10 p-6 space-y-8">
          {/* Privacy Level */}
          <div>
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <EyeOff className="w-5 h-5 mr-2" />
              Profile Privacy
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setPrivacyLevel('public')}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  privacyLevel === 'public'
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setPrivacyLevel('friends')}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  privacyLevel === 'friends'
                    ? 'bg-green-600 border-green-500'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                Friends Only
              </button>
              <button
                onClick={() => setPrivacyLevel('private')}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  privacyLevel === 'private'
                    ? 'bg-purple-600 border-purple-500'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                Private
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Choose who can see your profile and posts.
            </p>
          </div>

          {/* Password for Notifications */}
          <div>
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notification Privacy
            </h2>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={requirePasswordForNotifications}
                onChange={e => setRequirePasswordForNotifications(e.target.checked)}
                className="form-checkbox accent-purple-500"
              />
              <span>Require password to view notifications</span>
            </label>
            {requirePasswordForNotifications && (
              <div className="flex items-center space-x-2 mt-2">
                <Key className="w-4 h-4" />
                <input
                  type="password"
                  value={notificationPassword}
                  onChange={e => setNotificationPassword(e.target.value)}
                  placeholder="Set notification password"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white w-64"
                />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Add an extra layer of security to your notifications.
            </p>
          </div>

          {/* Password for Chats */}
          <div>
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat Privacy
            </h2>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={requirePasswordForChats}
                onChange={e => setRequirePasswordForChats(e.target.checked)}
                className="form-checkbox accent-purple-500"
              />
              <span>Require password to open chats</span>
            </label>
            {requirePasswordForChats && (
              <div className="flex items-center space-x-2 mt-2">
                <Lock className="w-4 h-4" />
                <input
                  type="password"
                  value={chatPassword}
                  onChange={e => setChatPassword(e.target.value)}
                  placeholder="Set chat password"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white w-64"
                />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Protect your chats with a password.
            </p>
          </div>

          {/* Password for Privacy Settings */}
          <div>
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Privacy Settings Protection
            </h2>
            <label className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={requirePasswordForPrivacySettings}
                onChange={e => setRequirePasswordForPrivacySettings(e.target.checked)}
                className="form-checkbox accent-purple-500"
              />
              <span>Require password to view privacy settings</span>
            </label>
            {requirePasswordForPrivacySettings && (
              <div className="flex items-center space-x-2 mt-2">
                <Key className="w-4 h-4" />
                <input
                  type="password"
                  value={privacySettingsPassword}
                  onChange={e => setPrivacySettingsPassword(e.target.value)}
                  placeholder="Set privacy settings password"
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white w-64"
                />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Add a password to protect access to your privacy settings.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-medium text-white disabled:opacity-50"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
            {success && (
              <span className="text-green-400 font-medium">Saved!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
