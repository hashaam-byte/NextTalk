'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Phone, MessageCircle, AlertCircle, Book, 
  CheckCircle2, Search, ChevronDown, ArrowRight, HelpCircle
} from 'lucide-react';
import Link from 'next/link';

const helpCategories = [
  { 
    title: 'Getting Started',
    icon: CheckCircle2,
    color: 'from-green-400 to-emerald-500',
    articles: [
      'How to create an account',
      'Setting up your profile',
      'Adding contacts',
      'Starting your first chat'
    ]
  },
  {
    title: 'Messages & Calls',
    icon: MessageCircle,
    color: 'from-blue-400 to-cyan-500',
    articles: [
      'Sending messages',
      'Making voice and video calls',
      'Group chat features',
      'Message privacy settings'
    ]
  },
  {
    title: 'Privacy & Security',
    icon: AlertCircle,
    color: 'from-purple-400 to-indigo-500',
    articles: [
      'End-to-end encryption',
      'Two-factor authentication',
      'Blocking contacts',
      'Privacy settings'
    ]
  },
  {
    title: 'Troubleshooting',
    icon: HelpCircle,
    color: 'from-orange-400 to-red-500',
    articles: [
      'Connection issues',
      'Notification problems',
      'Audio/Video problems',
      'App crashes'
    ]
  }
];

const commonQuestions = [
  {
    question: 'How do I reset my password?',
    answer: 'You can reset your password by clicking the "Forgot Password" link on the login page and following the instructions sent to your email.'
  },
  {
    question: 'Can I use NextTalk on multiple devices?',
    answer: 'Yes, you can use NextTalk on multiple devices simultaneously. Your chats will sync across all your devices automatically.'
  },
  {
    question: 'How do I create a group chat?',
    answer: 'To create a group chat, tap the "New Chat" button and select "New Group". Then, choose the contacts you want to add and set a group name.'
  },
  // ...add more FAQs...
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-400/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h1 
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              How can we help you?
            </span>
          </motion.h1>
          <motion.p 
            className="text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Search our help center or browse categories below to find answers
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            className="relative max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white placeholder-gray-400 backdrop-blur-sm"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {helpCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedCategory(category.title)}
              className="cursor-pointer group"
            >
              <div className="h-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{category.title}</h3>
                <ul className="space-y-2">
                  {category.articles.map((article, i) => (
                    <li key={i} className="text-gray-400 text-sm flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 text-gray-500" />
                      {article}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-4"
            >
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-3 rounded-xl">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Email Support</h3>
                <p className="text-gray-400 text-sm mb-2">Available 24/7</p>
                <a href="mailto:hashaamustafa@gmail.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                  hashaamustafa@gmail.com
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-xl">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Phone Support</h3>
                <p className="text-gray-400 text-sm mb-2">Mon-Fri, 9am-5pm</p>
                <a href="tel:08077291745" className="text-purple-400 hover:text-purple-300 transition-colors">
                  080-772-91745
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start space-x-4"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl">
                <Book className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Knowledge Base</h3>
                <p className="text-gray-400 text-sm mb-2">Find quick answers</p>
                <Link href="/docs" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Browse Articles →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Common Questions */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Common Questions</h2>
          <div className="space-y-4">
            {commonQuestions.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  onClick={() => setSelectedCategory(item.question)}
                >
                  <span className="text-white font-medium">{item.question}</span>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </button>
                <AnimatePresence>
                  {selectedCategory === item.question && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-gray-300">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
