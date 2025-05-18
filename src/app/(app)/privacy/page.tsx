'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Key, Database, FileText, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function PrivacyPage() {
  const { data: session, status } = useSession();

  const sections = [
    {
      icon: Shield,
      title: "Data Protection",
      content: "We implement strong encryption and security measures to protect your personal information. All data is encrypted both in transit and at rest using industry-standard protocols."
    },
    {
      icon: Lock,
      title: "Information Collection",
      content: "We collect only essential information needed to provide our services, including your name, email, and usage data to improve your experience."
    },
    {
      icon: Eye,
      title: "Data Usage",
      content: "Your data is used solely for providing and improving our services. We never sell your personal information to third parties."
    },
    {
      icon: Key,
      title: "Your Rights",
      content: "You have the right to access, modify, or delete your personal data. You can also request a copy of all data we hold about you."
    },
    {
      icon: Database,
      title: "Data Storage",
      content: "Your data is stored securely in encrypted databases. We regularly backup data while ensuring its security and privacy."
    },
    {
      icon: FileText,
      title: "Cookie Policy",
      content: "We use essential cookies to maintain your session and preferences. You can control or disable non-essential cookies."
    }
  ];

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      {/* Background Elements - Make them fixed */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25"></div>
      </div>

      <div className="relative max-w-4xl mx-auto py-8 px-4 sm:px-6 z-10">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400"
          >
            Privacy Policy
          </motion.h1>
          <motion.p 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-gray-400"
          >
            Your privacy is important to us. Learn how we collect, use, and protect your data.
          </motion.p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm mb-8"
        >
          <div className="flex items-center space-x-3 text-indigo-400 mb-4">
            <AlertCircle size={20} />
            <h2 className="text-lg font-medium">Last Updated: {new Date().toLocaleDateString()}</h2>
          </div>
          <p className="text-gray-300">
            This privacy policy explains how we handle your personal information and data. We update this policy occasionally, so please review it regularly.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * (index + 3) }}
              className="bg-white/5 rounded-xl p-6 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10">
                  <section.icon size={20} className="text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-white">{section.title}</h3>
              </div>
              <p className="text-gray-300">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-4">
            Have questions about our privacy policy?
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg shadow-purple-500/20">
            Contact Support
          </button>
        </motion.div>
      </div>
    </div>
  );
}
