'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Book, 
  Search, 
  ArrowRight, 
  ChevronRight, 
  ExternalLink,
  Mail,
  Phone
} from 'lucide-react';
import Link from 'next/link';

const docCategories = {
  'Getting Started': {
    icon: '🚀',
    articles: [
      {
        title: 'Creating Your Account',
        slug: 'creating-account',
        description: 'Learn how to create and set up your NextTalk account.'
      },
      {
        title: 'Setting Up Your Profile',
        slug: 'profile-setup',
        description: 'Customize your profile with pictures and information.'
      },
      {
        title: 'Adding Contacts',
        slug: 'adding-contacts',
        description: 'Find and connect with friends on NextTalk.'
      }
    ]
  },
  'Messaging': {
    icon: '💬',
    articles: [
      {
        title: 'Sending Messages',
        slug: 'sending-messages',
        description: 'Learn about message types and features.'
      },
      {
        title: 'Group Chats',
        slug: 'group-chats',
        description: 'Create and manage group conversations.'
      },
      {
        title: 'Media Sharing',
        slug: 'media-sharing',
        description: 'Share photos, videos, and files securely.'
      }
    ]
  },
  'Calls & Video': {
    icon: '📞',
    articles: [
      {
        title: 'Voice Calls',
        slug: 'voice-calls',
        description: 'Make high-quality voice calls.'
      },
      {
        title: 'Video Calls',
        slug: 'video-calls',
        description: 'Start and manage video calls.'
      },
      {
        title: 'Group Calls',
        slug: 'group-calls',
        description: 'Host calls with multiple participants.'
      }
    ]
  },
  'Privacy & Security': {
    icon: '🔒',
    articles: [
      {
        title: 'End-to-End Encryption',
        slug: 'encryption',
        description: 'Understanding message security.'
      },
      {
        title: 'Privacy Settings',
        slug: 'privacy-settings',
        description: 'Control your privacy preferences.'
      },
      {
        title: 'Blocking & Reporting',
        slug: 'blocking-reporting',
        description: 'Managing unwanted contacts.'
      }
    ]
  },
  'Offline Features': {
    icon: '📱',
    articles: [
      {
        title: 'Offline Messaging',
        slug: 'offline-messaging',
        description: 'Send and receive messages without internet connection.'
      },
      {
        title: 'Message Sync',
        slug: 'message-sync',
        description: 'How messages sync when connection is restored.'
      },
      {
        title: 'Data Management',
        slug: 'offline-data',
        description: 'Managing storage and cached messages.'
      }
    ]
  },
  'Parental Controls': {
    icon: '👨‍👩‍👧‍👦',
    articles: [
      {
        title: 'Screen Time Management',
        slug: 'screen-time',
        description: 'Set and manage app usage limits for children.'
      },
      {
        title: 'Content Filtering',
        slug: 'content-filters',
        description: 'Control and monitor content visibility.'
      },
      {
        title: 'Activity Reports',
        slug: 'activity-monitoring',
        description: 'View detailed usage statistics and patterns.'
      },
      {
        title: 'Safe Mode',
        slug: 'safe-mode',
        description: 'Enhanced protection settings for young users.'
      }
    ]
  },
  'Family Safety': {
    icon: '🛡️',
    articles: [
      {
        title: 'Setting Up Family Account',
        slug: 'family-setup',
        description: 'Create and manage family accounts.'
      },
      {
        title: 'Location Sharing',
        slug: 'family-location',
        description: 'Safe location sharing between family members.'
      },
      {
        title: 'Emergency Contacts',
        slug: 'emergency-contacts',
        description: 'Set up and manage emergency contacts.'
      }
    ]
  }
};

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery) {
      const results: any[] = [];
      Object.entries(docCategories).forEach(([category, data]) => {
        data.articles.forEach(article => {
          if (
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.description.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            results.push({ ...article, category });
          }
        });
      });
      setFilteredArticles(results);
    } else {
      setFilteredArticles([]);
    }
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-400/20 rounded-full filter blur-3xl"></div>
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
              Documentation
            </span>
          </motion.h1>
          <motion.p 
            className="text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Explore our guides and documentation to get the most out of NextTalk
          </motion.p>

          {/* Search */}
          <motion.div 
            className="relative max-w-2xl mx-auto mb-12"
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
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>

          {/* Search Results */}
          {searchQuery && (
            <div className="max-w-2xl mx-auto mb-12">
              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article, index) => (
                    <Link 
                      key={index}
                      href={`/docs/${article.slug}`}
                      className="block p-4 hover:bg-white/5 border-b border-white/5 last:border-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-medium">{article.title}</h3>
                          <p className="text-sm text-gray-400">{article.description}</p>
                          <span className="text-xs text-purple-400 mt-1 block">
                            in {article.category}
                          </span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400">
                    No articles found matching your search
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Documentation Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(docCategories).map(([category, { icon, articles }], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{icon}</span>
                <h2 className="text-xl font-semibold text-white">{category}</h2>
              </div>
              <div className="space-y-3">
                {articles.map((article, i) => (
                  <Link
                    key={i}
                    href={`/docs/${article.slug}`}
                    className="block p-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-medium">{article.title}</h3>
                        <p className="text-sm text-gray-400">{article.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl border border-white/10 p-8 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">Need More Help?</h2>
          <p className="text-gray-300 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="mailto:hashaamustafa@gmail.com"
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all flex items-center"
            >
              <Mail className="h-5 w-5 mr-2" />
              Email Support
            </Link>
            <Link
              href="tel:08077291745"
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all flex items-center"
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
