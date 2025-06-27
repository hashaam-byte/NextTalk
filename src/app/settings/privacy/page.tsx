'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeOff, Lock, Bell, MessageSquare, Save, Key, ArrowLeft, Shield, Zap, Scan, Globe, Users, UserX } from 'lucide-react';

export default function FuturisticPrivacySettingsPage() {
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'friends' | 'private'>('friends');
  const [notificationPassword, setNotificationPassword] = useState('');
  const [chatPassword, setChatPassword] = useState('');
  const [requirePasswordForNotifications, setRequirePasswordForNotifications] = useState(false);
  const [requirePasswordForChats, setRequirePasswordForChats] = useState(false);
  const [privacySettingsPassword, setPrivacySettingsPassword] = useState('');
  const [requirePasswordForPrivacySettings, setRequirePasswordForPrivacySettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [scanningEffect, setScanningEffect] = useState(false);

  // Animated background grid
  const [gridLines, setGridLines] = useState<Array<{id: number, delay: number, duration: number}>>([]);

  useEffect(() => {
    const lines = Array.from({length: 20}, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3
    }));
    setGridLines(lines);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setScanningEffect(true);
    
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
      setScanningEffect(false);
      setTimeout(() => setSuccess(false), 2000);
    }
  };

  const privacyOptions = [
    { 
      value: 'public', 
      label: 'Public', 
      icon: Globe, 
      color: 'from-cyan-500 to-blue-500',
      description: 'Visible to everyone'
    },
    { 
      value: 'friends', 
      label: 'Friends Only', 
      icon: Users, 
      color: 'from-emerald-500 to-teal-500',
      description: 'Visible to friends'
    },
    { 
      value: 'private', 
      label: 'Private', 
      icon: UserX, 
      color: 'from-purple-500 to-pink-500',
      description: 'Only you can see'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.05)_25px,rgba(255,255,255,0.05)_26px,transparent_27px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:25px_25px]"></div>
        {gridLines.map(line => (
          <motion.div
            key={line.id}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            style={{
              top: `${(line.id * 5) % 100}%`,
              left: 0,
              right: 0,
            }}
            animate={{
              opacity: [0, 1, 0],
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: line.duration,
              delay: line.delay,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        ))}
      </div>

      {/* Scanning effect overlay */}
      <AnimatePresence>
        {scanningEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent"
              animate={{
                y: ['-100%', '100%', '100%'],
              }}
              transition={{
                duration: 2,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center mb-8"
          >
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:border-cyan-400/50 mr-4 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Privacy & Security Protocol
              </h1>
              <p className="text-sm text-gray-400 mt-1">Advanced security configuration interface</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-purple-900/20 overflow-hidden"
          >
            {/* Glowing top border */}
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
            
            <div className="p-8 space-y-10">
              {/* Privacy Level */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-purple-500/20 mr-3">
                    <EyeOff className="w-5 h-5 text-cyan-400" />
                  </div>
                  Profile Visibility Matrix
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {privacyOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        onClick={() => setPrivacyLevel(option.value as any)}
                        className={`relative p-4 rounded-xl border transition-all duration-300 group ${
                          privacyLevel === option.value
                            ? `bg-gradient-to-r ${option.color} border-white/30 shadow-lg shadow-current/25`
                            : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <Icon className="w-6 h-6 mb-2" />
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-gray-400 mt-1">{option.description}</span>
                        </div>
                        {privacyLevel === option.value && (
                          <motion.div
                            layoutId="privacy-indicator"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-white/5 pointer-events-none"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Security Sections */}
              {[
                {
                  title: 'Notification Security Layer',
                  icon: Bell,
                  checked: requirePasswordForNotifications,
                  setChecked: setRequirePasswordForNotifications,
                  password: notificationPassword,
                  setPassword: setNotificationPassword,
                  placeholder: 'Neural-link access code',
                  description: 'Quantum-encrypted notification gateway'
                },
                {
                  title: 'Communication Encryption',
                  icon: MessageSquare,
                  checked: requirePasswordForChats,
                  setChecked: setRequirePasswordForChats,
                  password: chatPassword,
                  setPassword: setChatPassword,
                  placeholder: 'Secure channel passphrase',
                  description: 'End-to-end encrypted messaging protocol'
                },
                {
                  title: 'System Configuration Lock',
                  icon: Shield,
                  checked: requirePasswordForPrivacySettings,
                  setChecked: setRequirePasswordForPrivacySettings,
                  password: privacySettingsPassword,
                  setPassword: setPrivacySettingsPassword,
                  placeholder: 'Administrator override key',
                  description: 'Biometric-level settings protection'
                }
              ].map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="relative"
                  >
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 mr-3">
                        <Icon className="w-5 h-5 text-purple-400" />
                      </div>
                      {section.title}
                    </h2>
                    
                    <motion.label 
                      className="flex items-center space-x-3 mb-4 cursor-pointer group"
                      whileHover={{ x: 5 }}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={section.checked}
                          onChange={e => section.setChecked(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-300 ${
                          section.checked 
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 border-white/30' 
                            : 'border-gray-600 group-hover:border-gray-500'
                        }`}>
                          {section.checked && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-full h-full flex items-center justify-center"
                            >
                              <Scan className="w-4 h-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                      <span className="text-lg">Enable Security Protocol</span>
                    </motion.label>
                    
                    <AnimatePresence>
                      {section.checked && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center space-x-3 mt-4 mb-2">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                              <Key className="w-4 h-4 text-amber-400" />
                            </div>
                            <div className="relative flex-1">
                              <input
                                type="password"
                                value={section.password}
                                onChange={e => section.setPassword(e.target.value)}
                                placeholder={section.placeholder}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                              />
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <p className="text-sm text-gray-400 mt-2 flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      {section.description}
                    </p>
                  </motion.div>
                );
              })}

              {/* Save Button */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-between pt-6 border-t border-white/10"
              >
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  className="relative px-8 py-4 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-xl font-semibold text-white disabled:opacity-50 overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative flex items-center">
                    {saving ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                        />
                        Synchronizing...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-3" />
                        Deploy Configuration
                      </>
                    )}
                  </div>
                </motion.button>
                
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, x: -20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -20 }}
                      className="flex items-center text-emerald-400 font-medium"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center mr-2"
                      >
                        <motion.div
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      </motion.div>
                      Configuration Deployed
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}