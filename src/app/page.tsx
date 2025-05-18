'use client'
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-800 text-white">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-10 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image src="/logo.svg" alt="NextTalk Logo" width={40} height={40} />
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              NextTalk
            </span>
          </div>
          
          <div className="hidden md:flex space-x-6 text-sm">
            <Link href="#features" className="hover:text-cyan-300 transition-colors">Features</Link>
            <Link href="#privacy" className="hover:text-cyan-300 transition-colors">Privacy</Link>
            <Link href="#help" className="hover:text-cyan-300 transition-colors">Help Center</Link>
            <Link href="#blog" className="hover:text-cyan-300 transition-colors">Blog</Link>
            <Link href="#business" className="hover:text-cyan-300 transition-colors">For Business</Link>
            <Link href="#download" className="hover:text-cyan-300 transition-colors">Download</Link>
          </div>
          
          <div className="space-x-2 md:space-x-4">
            <Link href="/login" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-90 transition-all text-sm">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-8 pb-16">
        {/* Hero Section */}
        <main className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20 pt-8">
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
              Connect with friends in a <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">whole new way</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              NextTalk brings your conversations to life with real-time messaging, voice calls, status updates, and more—all in one beautiful app.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/register" 
                className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm"
              >
                Get Started
              </Link>
              <Link 
                href="#download" 
                className="px-6 py-3 rounded-full border border-white/30 hover:bg-white/10 transition-all text-sm"
              >
                Download App
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative w-full max-w-md mx-auto">
              <div className="relative h-96 w-full md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20">
                <div className="absolute top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl"></div>
                
                {/* WhatsApp-style Chat Interface */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="p-3 bg-gradient-to-r from-indigo-800/90 to-purple-800/90 border-b border-white/10 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex-shrink-0"></div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-semibold">Sarah Johnson</div>
                      <div className="text-xs text-gray-300">Online</div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-lg">📞</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-lg">📹</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-lg">⋮</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-indigo-900/30 to-purple-900/30">
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-700/80 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                        <p className="text-sm">Hey! How is your day going?</p>
                        <p className="text-xs text-gray-400 text-right">10:12 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end mb-4">
                      <div className="bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                        <p className="text-sm">Pretty good! Just checking out this new chat app called NextTalk.</p>
                        <p className="text-xs text-gray-200 text-right">10:15 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-700/80 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                        <p className="text-sm">Oh nice! I heard it has all the features from WhatsApp plus more!</p>
                        <p className="text-xs text-gray-400 text-right">10:16 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end mb-4">
                      <div className="bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                        <p className="text-sm">Yeah! The UI is gorgeous and it has all these cool social features.</p>
                        <p className="text-xs text-gray-200 text-right">10:17 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-700/80 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                        <p className="text-sm">Plus it is super secure with end-to-end encryption!</p>
                        <p className="text-xs text-gray-400 text-right">10:18 AM</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-3 bg-indigo-900/60 border-t border-white/10 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
                      <span className="text-lg">😊</span>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm text-gray-300">Type a message</div>
                    <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center ml-2">
                      <span className="text-lg">🎤</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Features Section - WhatsApp style */}
        <section id="features" className="py-16 border-t border-white/10">
          <h2 className="text-3xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Why choose NextTalk?
            </span>
          </h2>
          
          {/* Row 1: Text and Image Features */}
          <div className="flex flex-col md:flex-row items-center mb-20">
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0 md:pr-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4">Real-time Messaging</h3>
              <p className="text-gray-300 mb-6">
                Experience lightning-fast message delivery with read receipts and typing indicators. 
                Stay connected with friends and family no matter where they are in the world.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mr-2">✓</span>
                  <span>Instant message delivery</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mr-2">✓</span>
                  <span>Read receipts</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mr-2">✓</span>
                  <span>Typing indicators</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="relative h-64 w-full border border-white/10 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 backdrop-blur-sm"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full max-w-xs bg-black/40 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500"></div>
                      <div className="ml-2 flex-1">
                        <div className="text-sm font-semibold">Alex</div>
                        <div className="text-xs text-gray-400">typing...</div>
                      </div>
                      <div className="text-xs text-gray-400">10:42 AM</div>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-gradient-to-r from-cyan-500/40 to-blue-500/40 rounded-xl rounded-tr-none p-2 ml-auto max-w-[80%]">
                        <p className="text-sm">I am heading to the coffee shop. Want to join?</p>
                      </div>
                      <div className="bg-gray-700/40 rounded-xl rounded-tl-none p-2 max-w-[80%]">
                        <p className="text-sm">Sounds good! I will be there in 15 minutes.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Row 2: Image and Text Features */}
          <div className="flex flex-col-reverse md:flex-row items-center mb-20">
            <motion.div 
              className="md:w-1/2 bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="relative h-64 w-full border border-white/10 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 backdrop-blur-sm"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full max-w-xs bg-black/40 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-2xl">📞</div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">Group Call: Team Project</p>
                      <p className="text-sm text-gray-300">3 participants • 12:45</p>
                      <div className="flex justify-center mt-4 space-x-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/80 flex items-center justify-center">🔴</div>
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">🔊</div>
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">📹</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0 md:pl-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4">Crystal-Clear Calls</h3>
              <p className="text-gray-300 mb-6">
                Enjoy high-quality voice and video calls with individuals or groups.
                Stay connected with crystal-clear audio and smooth video streaming.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mr-2">✓</span>
                  <span>Group video calls with up to 8 people</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mr-2">✓</span>
                  <span>Screen sharing</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mr-2">✓</span>
                  <span>Background blur</span>
                </li>
              </ul>
            </motion.div>
          </div>
          
          {/* Feature Grid - More WhatsApp-Style Features */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔒",
                title: "Enhanced Privacy",
                description: "End-to-end encryption for all messages, calls, and media. Your conversations stay between you and the people you're talking to."
              },
              {
                icon: "📱",
                title: "Multi-Platform",
                description: "Use NextTalk seamlessly across all your devices, with perfect syncing between mobile and desktop."
              },
              {
                icon: "🌟",
                title: "Status Updates",
                description: "Share moments with friends that disappear after 24 hours. Express yourself with photos, videos, and text."
              },
              {
                icon: "💬",
                title: "Rich Media Sharing",
                description: "Share photos, videos, documents, and voice messages easily with friends and groups."
              },
              {
                icon: "🔍",
                title: "Powerful Search",
                description: "Find messages, media, and links quickly with our advanced search functionality."
              },
              {
                icon: "👥",
                title: "Community Features",
                description: "Create and join communities to connect with larger groups and organizations."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                  <span className="text-xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Privacy Section - WhatsApp style */}
        <section id="privacy" className="py-16 border-t border-white/10">
          <h2 className="text-3xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Privacy you can trust
            </span>
          </h2>
          <p className="text-center text-gray-300 max-w-2xl mx-auto mb-12">
            Your messages and calls are secured with end-to-end encryption, which means they stay between you and the people you choose to communicate with.
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <motion.div 
              className="md:w-1/2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">End-to-End Encryption</h3>
              <p className="text-gray-300">
                Messages and calls are secured so only you and the person you're communicating with can read or listen to them, and nobody in between, not even NextTalk.
              </p>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-xl">⏱️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Disappearing Messages</h3>
              <p className="text-gray-300">
                Set messages to disappear from chats after you send them. Choose how long messages stay visible: 24 hours, 7 days, or 90 days.
              </p>
            </motion.div>
          </div>
          
          <div className="flex items-center justify-center">
            <Link href="/privacy" className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm">
              Learn more about our privacy policy
            </Link>
          </div>
        </section>
        
        {/* Download Section - WhatsApp style */}
        <section id="download" className="py-16 border-t border-white/10">
          <h2 className="text-3xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Download NextTalk
            </span>
          </h2>
          <p className="text-center text-gray-300 max-w-2xl mx-auto mb-12">
            Available on all your devices. Keep your conversations going wherever you are.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div 
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile App</h3>
              <p className="text-gray-300 mb-4">
                Download for iOS and Android devices.
              </p>
              <div className="flex gap-4 mt-2">
                <Link href="#" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                  App Store
                </Link>
                <Link href="#" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                  Google Play
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Desktop App</h3>
              <p className="text-gray-300 mb-4">
                Download for Windows, Mac, and Linux.
              </p>
              <div className="flex gap-4 mt-2">
                <Link href="#" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                  Windows
                </Link>
                <Link href="#" className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                  macOS
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Web Version</h3>
              <p className="text-gray-300 mb-4">
                Use NextTalk directly in your browser.
              </p>
              <Link href="#" className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all mt-2">
                Open Web App
              </Link>
            </motion.div>
          </div>
        </section>
        
        {/* Business Section - WhatsApp style */}
        <section id="business" className="py-16 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                  NextTalk for Business
                </span>
              </h2>
              <p className="text-gray-300 mb-6">
                Connect with your customers in a more personal way with NextTalk Business tools. Build stronger relationships and provide better customer service.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mr-2 mt-1">✓</span>
                  <div>
                    <h4 className="font-semibold">Business Profile</h4>
                    <p className="text-sm text-gray-300">Create a professional presence with detailed business information</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mr-2 mt-1">✓</span>
                  <div>
                    <h4 className="font-semibold">Automated Responses</h4>
                    <p className="text-sm text-gray-300">Set up quick replies and away messages for common questions</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mr-2 mt-1">✓</span>
                  <div>
                    <h4 className="font-semibold">Customer Analytics</h4>
                    <p className="text-sm text-gray-300">Gain insights into customer interactions and messages</p>
                  </div>
                </li>
              </ul>
              <Link href="/business" className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-90
              transition-all text-sm">
                Get NextTalk Business
              </Link>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 overflow-hidden">
                <div className="relative">
                  <div className="bg-gradient-to-r from-indigo-800/80 to-purple-800/80 rounded-t-xl p-3 border-b border-white/10">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                        <span className="text-lg">🛍️</span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold">NextTalk Fashion Store</div>
                        <div className="text-xs text-gray-300">Typically replies within an hour</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-b from-indigo-900/40 to-purple-900/40 p-4 h-72 overflow-y-auto">
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-700/80 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                        <p className="text-sm">Welcome to NextTalk Fashion! How can I help you today?</p>
                        <p className="text-xs text-gray-400 text-right">11:22 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end mb-4">
                      <div className="bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                        <p className="text-sm">Hi! I'm looking for the new summer collection. Do you have it in stock?</p>
                        <p className="text-xs text-gray-200 text-right">11:23 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-700/80 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                        <p className="text-sm">Yes, our Summer 2025 collection just arrived! Would you like to see our catalog?</p>
                        <p className="text-xs text-gray-400 text-right">11:24 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end mb-4">
                      <div className="bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%]">
                        <p className="text-sm">That would be great!</p>
                        <p className="text-xs text-gray-200 text-right">11:24 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-700/80 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%]">
                        <p className="text-sm">Here's our latest collection! [Catalog Attached]</p>
                        <div className="mt-2 bg-white/10 rounded-lg p-2 flex items-center">
                          <span className="text-lg mr-2">📑</span>
                          <span className="text-sm">Summer_2025_Catalog.pdf</span>
                        </div>
                        <p className="text-xs text-gray-400 text-right">11:25 AM</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-900/60 p-3 rounded-b-xl border-t border-white/10 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-2">
                      <span className="text-lg">+</span>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm text-gray-300">Type a message</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center ml-2">
                      <span className="text-lg">🎤</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Blog Section - WhatsApp style */}
        <section id="blog" className="py-16 border-t border-white/10">
          <h2 className="text-3xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Blog & Updates
            </span>
          </h2>
          <p className="text-center text-gray-300 max-w-2xl mx-auto mb-12">
            Stay updated with the latest features, tips, and news about NextTalk.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                title: "Introducing Video Filters",
                date: "April 15, 2025",
                excerpt: "Express yourself better with our new range of video call filters and effects.",
                image: "🎬"
              },
              {
                title: "Enhanced Security Features",
                date: "April 2, 2025",
                excerpt: "We've added new privacy options to give you more control over your chats.",
                image: "🔐"
              },
              {
                title: "NextTalk Communities Launch",
                date: "March 22, 2025",
                excerpt: "Connect with larger groups through our new Communities feature.",
                image: "👥"
              }
            ].map((post, i) => (
              <motion.div
                key={i}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="h-40 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 flex items-center justify-center">
                  <span className="text-6xl">{post.image}</span>
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-400 mb-2">{post.date}</div>
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-300 mb-4">{post.excerpt}</p>
                  <Link href="#" className="text-cyan-300 hover:text-cyan-200 transition-colors">
                    Read more →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex items-center justify-center">
            <Link href="/blog" className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm">
              View all blog posts
            </Link>
          </div>
        </section>
        
        {/* Help Center Section - WhatsApp style */}
        <section id="help" className="py-16 border-t border-white/10">
          <h2 className="text-3xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Help Center
            </span>
          </h2>
          <p className="text-center text-gray-300 max-w-2xl mx-auto mb-12">
            Find answers to common questions and learn how to get the most out of NextTalk.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <motion.div 
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
              initial={{ opacity: 0, y: this }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {[
                  {
                    question: "How do I set up my profile?",
                    answer: "Tap on your profile picture > Edit Profile and fill in your information."
                  },
                  {
                    question: "How do I start a group chat?",
                    answer: "Tap the new chat button > New Group > select contacts and create."
                  },
                  {
                    question: "Is NextTalk free to use?",
                    answer: "Yes, NextTalk is free to download and use. Data charges may apply."
                  }
                ].map((faq, i) => (
                  <div key={i} className="border-b border-white/10 pb-4 last:border-0">
                    <h4 className="font-semibold mb-2">{faq.question}</h4>
                    <p className="text-sm text-gray-300">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-4">Contact Support</h3>
              <p className="text-gray-300 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                    <span className="text-xl">📧</span>
                  </div>
                  <h4 className="font-semibold mb-1">Email Support</h4>
                  <p className="text-sm text-gray-300">help@nexttalk.com</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                    <span className="text-xl">💬</span>
                  </div>
                  <h4 className="font-semibold mb-1">Live Chat</h4>
                  <p className="text-sm text-gray-300">Available 24/7</p>
                </div>
              </div>
              <Link href="/support" className="block w-full py-3 text-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm">
                Visit Help Center
              </Link>
            </motion.div>
          </div>
        </section>
        
        {/* Footer - WhatsApp style */}
        <footer className="mt-12 pt-12 pb-8 border-t border-white/10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-4">
                <Image src="/logo.svg" alt="NextTalk Logo" width={32} height={32} />
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                  NextTalk
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Connect with friends in a whole new way with NextTalk's powerful messaging platform.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <span>𝕏</span>
                </Link>
                <Link href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <span>f</span>
                </Link>
                <Link href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <span>in</span>
                </Link>
                <Link href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                  <span>ig</span>
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">Press</Link></li>
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">Messaging</Link></li>
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">Voice & Video</Link></li>
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">Status Updates</Link></li>
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">Privacy & Security</Link></li>
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">NextTalk Business</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4">Help & Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">FAQs</Link></li>
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-cyan-300 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="text-center text-gray-400 text-sm border-t border-white/10 pt-8">
            <p>© 2025 NextTalk. All rights reserved.</p>
            <p className="mt-2">Do not forget to check your messages.</p>
            <div className="flex justify-center space-x-4 mt-4">
              <Link href="#" className="hover:text-cyan-300 transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-cyan-300 transition-colors">Terms</Link>
              <Link href="#" className="hover:text-cyan-300 transition-colors">Cookies</Link>
              <Link href="#" className="hover:text-cyan-300 transition-colors">Imprint</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}