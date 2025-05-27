'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Bell, Lock, Moon, Sun, Palette, Globe, 
  Volume2, Shield, HelpCircle, Save, Camera, Users
} from 'lucide-react';
import Link from 'next/link';

interface UserSettings {
  profile: {
    name: string;
    email: string;
    bio: string;
    profileImage: string | null;
    joinDate: Date;
  };
  preferences: {
    darkMode: boolean;
    language: string;
    timezone: string;
    notifications: boolean;
    status: string;
    theme: string;
    soundEnabled: boolean;
    privacyLevel: string;
  };
  stats: {
    contacts: number;
    messages: number;
    groups: number;
  };
}

const fetchSettings = async () => {
  try {
    const response = await fetch('/api/user/settings');
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    const data = await response.json();
    return data.settings;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('Dark');
  const [privacyLevel, setPrivacyLevel] = useState('Friends only');
  const [selectedTab, setSelectedTab] = useState('General');

  const tabs = ['General', 'Appearance', 'Notifications', 'Privacy', 'Parental Controls', 'Help'];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await fetchSettings();
        setSettings(settings);
        
        // Initialize state with fetched settings
        setDarkMode(settings.preferences.theme === 'dark');
        setNotificationsEnabled(settings.preferences.notifications);
        setSoundsEnabled(settings.preferences.soundEnabled);
        setLanguage(settings.preferences.language);
        setTheme(settings.preferences.theme);
        setPrivacyLevel(settings.preferences.privacyLevel);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.email) {
      loadSettings();
    }
  }, [session]);

  const handleSaveSettings = async (updatedData: Partial<UserSettings>) => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error('Failed to update settings');
      const data = await response.json();
      
      setSettings(prev => prev ? {
        ...prev,
        ...updatedData
      } : null);

    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch(selectedTab) {
      case 'General':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold text-white mb-6">General Settings</h2>
            
            <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
              
              <div className="flex flex-col md:flex-row md:items-center mb-8">
                <div className="relative mb-4 md:mb-0 md:mr-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-cyan-400 p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                      {settings?.profile.profileImage ? (
                        <Image
                          src={settings.profile.profileImage}
                          alt={settings.profile.name}
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-2xl font-semibold">
                          {settings?.profile.name?.[0].toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full shadow-lg border border-white/10"
                  >
                    <Camera size={16} className="text-white" />
                  </motion.button>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      className="w-full py-2 px-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
                      defaultValue={settings?.profile.name}
                      onChange={(e) => handleSaveSettings({ profile: { ...settings?.profile, name: e.target.value } })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full py-2 px-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
                      defaultValue={settings?.profile.email}
                      onChange={(e) => handleSaveSettings({ profile: { ...settings?.profile, email: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                <textarea
                  className="w-full py-2 px-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white h-24"
                  defaultValue={settings?.profile.bio}
                  onChange={(e) => handleSaveSettings({ profile: { ...settings?.profile, bio: e.target.value } })}
                ></textarea>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-sm text-gray-400">Total Messages</h4>
                <p className="text-2xl font-bold text-white">{settings?.stats.messages.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-sm text-gray-400">Contacts</h4>
                <p className="text-2xl font-bold text-white">{settings?.stats.contacts.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-sm text-gray-400">Groups</h4>
                <p className="text-2xl font-bold text-white">{settings?.stats.groups.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white shadow-lg shadow-purple-500/20"
              >
                <Save size={18} className="mr-2" />
                Save Changes
              </motion.button>
            </div>
          </div>
        );
      
      case 'Appearance':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold text-white mb-6">Appearance</h2>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Theme Options</h3>
              
              <div className="mb-6">
                <label className="block text-lg font-medium text-white mb-2">Color Theme</label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme('Dark')}
                    className={`cursor-pointer p-4 rounded-xl border ${
                      theme === 'Dark' 
                        ? 'border-purple-500 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900' 
                        : 'border-white/10 bg-gray-900/60'
                    }`}
                  >
                    <div className="h-12 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 rounded-lg mb-2 border border-white/5"></div>
                    <div className="text-center text-sm font-medium text-white">Dark</div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme('Light')}
                    className={`cursor-pointer p-4 rounded-xl border ${
                      theme === 'Light' 
                        ? 'border-purple-500 bg-white/10' 
                        : 'border-white/10 bg-gray-900/40'
                    }`}
                  >
                    <div className="h-12 bg-gray-100 rounded-lg mb-2 border border-gray-200"></div>
                    <div className="text-center text-sm font-medium text-white">Light</div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTheme('System')}
                    className={`cursor-pointer p-4 rounded-xl border ${
                      theme === 'System' 
                        ? 'border-purple-500 bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-indigo-900/30' 
                        : 'border-white/10 bg-gray-900/40'
                    }`}
                  >
                    <div className="h-12 bg-gradient-to-r from-gray-900 to-gray-100 rounded-lg mb-2 border border-white/5"></div>
                    <div className="text-center text-sm font-medium text-white">System</div>
                  </motion.div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-lg font-medium text-white mb-2">Accent Color</label>
                <div className="grid grid-cols-6 gap-3 mt-2">
                  {['purple', 'blue', 'cyan', 'green', 'amber', 'red'].map((color) => (
                    <motion.div
                      key={color}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`h-10 rounded-full cursor-pointer ${
                        color === 'purple' 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900' 
                          : color === 'blue' 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600' 
                          : color === 'cyan' 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                          : color === 'green' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                          : color === 'amber' 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600' 
                          : 'bg-gradient-to-r from-red-600 to-rose-600'
                      }`}
                    ></motion.div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4">
                    <Moon size={24} className="text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <label className="font-medium text-white">Dark Mode</label>
                    <p className="text-sm text-gray-400">Enable dark mode for the app interface</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-indigo-600"></div>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white shadow-lg shadow-purple-500/20"
              >
                <Save size={18} className="mr-2" />
                Save Preferences
              </motion.button>
            </div>
          </div>
        );
      
      case 'Notifications':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold text-white mb-6">Notifications</h2>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Bell size={20} className="text-purple-400 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-white">Push Notifications</h3>
                    <p className="text-sm text-gray-400">Receive notifications when you're not using the app</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-indigo-600"></div>
                </label>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Message Notifications</h4>
                    <p className="text-sm text-gray-400">Get notified when you receive new messages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Group Notifications</h4>
                    <p className="text-sm text-gray-400">Get notified about activity in your groups</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Mentions</h4>
                    <p className="text-sm text-gray-400">Get notified when you're mentioned in a group</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Volume2 size={20} className="text-cyan-400 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-white">Sounds</h3>
                    <p className="text-sm text-gray-400">Configure sound notifications</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={soundsEnabled}
                    onChange={() => setSoundsEnabled(!soundsEnabled)}
                  />
                  <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-indigo-600"></div>
                </label>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Message Sounds</h4>
                    <p className="text-sm text-gray-400">Play sound when receiving messages</p>
                  </div>
                  <select className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                    <option value="default">Default</option>
                    <option value="subtle">Subtle</option>
                    <option value="cheerful">Cheerful</option>
                    <option value="none">None</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">Call Ringtone</h4>
                    <p className="text-sm text-gray-400">Ringtone for incoming calls</p>
                  </div>
                  <select className="bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                    <option value="classic">Classic</option>
                    <option value="modern">Modern</option>
                    <option value="minimal">Minimal</option>
                    <option value="retro">Retro</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white shadow-lg shadow-purple-500/20"
              >
                <Save size={18} className="mr-2" />
                Save Settings
              </motion.button>
            </div>
          </div>
        );
      
      case 'Privacy':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold text-white mb-6">Privacy Settings</h2>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <div className="flex items-center mb-6">
                <Lock size={20} className="text-purple-400 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-white">Account Privacy</h3>
                  <p className="text-sm text-gray-400">Control who can see your profile and content</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Profile Visibility</label>
                  <select
                    className="w-full py-2 px-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
                    value={privacyLevel}
                    onChange={(e) => setPrivacyLevel(e.target.value)}
                  >
                    <option value="Public">Public - Anyone can view your profile</option>
                    <option value="Friends only">Friends only - Only your connections can view your profile</option>
                    <option value="Private">Private - Only you can view your profile</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Online Status</h4>
                    <p className="text-sm text-gray-400">Show when you're active on the platform</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-indigo-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Read Receipts</h4>
                    <p className="text-sm text-gray-400">Let others know when you've read their messages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center mb-6">
                <Shield size={20} className="text-green-400 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-white">Security</h3>
                  <p className="text-sm text-gray-400">Manage your account security settings</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-white/5 text-white"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mr-3">
                      <Lock size={16} className="text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-gray-400">Update your account password</p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    &rarr;
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-white/5 text-white"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                      <Shield size={16} className="text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-400">Add an extra layer of security</p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    &rarr;
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-between p-4 rounded-lg border border-white/5 text-white"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center mr-3">
                      <HelpCircle size={16} className="text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Login History</h4>
                      <p className="text-sm text-gray-400">View your recent login activity</p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    &rarr;
                  </div>
                </motion.button>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white shadow-lg shadow-purple-500/20"
              >
                <Save size={18} className="mr-2" />
                Save Privacy Settings
              </motion.button>
            </div>
          </div>
        );
      
      case 'Parental Controls':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold text-white mb-6">Parental Controls</h2>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Shield size={24} className="text-purple-400 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-white">Parental Control Settings</h3>
                    <p className="text-sm text-gray-400">Manage and monitor app usage</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Link
                  href="/settings/parental"
                  className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium mb-1">Configure Parental Controls</h4>
                      <p className="text-sm text-gray-400">Set up content filters, screen time limits, and monitoring</p>
                    </div>
                    <div className="text-gray-400">&rarr;</div>
                  </div>
                </Link>

                {/* Quick Settings Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Screen Time</h5>
                    <p className="text-white">60 minutes/day</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Content Filter</h5>
                    <p className="text-white">Strict</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Help':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-semibold text-white mb-6">Help & Support</h2>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <div className="flex items-center mb-6">
                <HelpCircle size={20} className="text-purple-400 mr-3" />
                <h3 className="text-lg font-medium text-white">Frequently Asked Questions</h3>
              </div>
              
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  className="border border-white/10 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-4 text-left text-white font-medium"
                    onClick={() => document.getElementById('faq1').classList.toggle('hidden')}
                  >
                    <span>How do I change my profile picture?</span>
                    <span className="text-gray-400 text-lg">+</span>
                  </button>
                  <div id="faq1" className="hidden bg-white/5 p-4 border-t border-white/10">
                    <p className="text-gray-300">
                      To change your profile picture, go to the General settings tab and click the camera icon
                      on your current profile image. You can upload a new image from your device.
                    </p>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  className="border border-white/10 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-4 text-left text-white font-medium"
                    onClick={() => document.getElementById('faq2').classList.toggle('hidden')}
                  >
                    <span>How do I enable two-factor authentication?</span>
                    <span className="text-gray-400 text-lg">+</span>
                  </button>
                  <div id="faq2" className="hidden bg-white/5 p-4 border-t border-white/10">
                    <p className="text-gray-300">
                      To enable two-factor authentication, navigate to the Privacy tab and click on "Two-Factor Authentication".
                      Follow the instructions to set up an authenticator app or receive SMS codes.
                    </p>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  className="border border-white/10 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-4 text-left text-white font-medium"
                    onClick={() => document.getElementById('faq3').classList.toggle('hidden')}
                  >
                    <span>Can I download my account data?</span>
                    <span className="text-gray-400 text-lg">+</span>
                  </button>
                  <div id="faq3" className="hidden bg-white/5 p-4 border-t border-white/10">
                    <p className="text-gray-300">
                      Yes, you can request a download of your account data by going to Privacy settings
                      and clicking on "Download Your Data". The process may take up to 48 hours to complete.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center mb-6">
                <HelpCircle size={20} className="text-cyan-400 mr-3" />
                <h3 className="text-lg font-medium text-white">Contact Support</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                  <select className="w-full py-2 px-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white">
                    <option value="">Select a topic</option>
                    <option value="account">Account Issues</option>
                    <option value="billing">Billing Questions</option>
                    <option value="technical">Technical Problems</option>
                    <option value="feature">Feature Requests</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                  <textarea
                    className="w-full py-2 px-3 bg-white/10 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white h-32"
                    placeholder="Describe your issue or question in detail..."
                  ></textarea>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="attach-logs"
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="attach-logs" className="text-sm text-gray-300">
                    Include system logs to help diagnose the issue
                  </label>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg shadow-purple-500/20"
                >
                  Submit Support Request
                </motion.button>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-lg">
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-indigo-300">
                    Need immediate assistance? Our support team is available 24/7 via live chat. Click the chat icon in the bottom right corner to connect with a support agent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      {/* Mobile-specific header */}
      <div className="md:hidden sticky top-0 z-30 bg-black/30 backdrop-blur-lg p-4 border-b border-white/10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Settings
        </h1>
      </div>

      {/* Content wrapper with mobile padding */}
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        {/* Mobile-optimized tabs */}
        <div className="md:hidden overflow-x-auto flex space-x-2 mb-4 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Existing desktop layout remains unchanged */}
        <div className="hidden md:flex">
          {/* ...existing desktop layout... */}
        </div>

        {/* Mobile content */}
        <div className="md:hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}