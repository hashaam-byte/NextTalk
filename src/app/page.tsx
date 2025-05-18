'use client'
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// 3D Tilt Card Component
const TiltCard = ({ children, className }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setPosition({ x, y });
  };

  return (
    <div
      ref={ref}
      className={`transition-transform duration-200 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setPosition({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${position.y * 10}deg) rotateY(${position.x * -10}deg) scale3d(1.05, 1.05, 1.05)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      }}
    >
      {children}
    </div>
  );
};

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-0 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl"></div>
        <div className="absolute top-2/3 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl"></div>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10 bg-black/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-sm rounded-full"></div>
              <Image src="/logo.svg" alt="NextTalk Logo" width={40} height={40} className="relative" />
            </div>
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              NextTalk
            </span>
          </motion.div>
          
          <div className="hidden md:flex space-x-6 text-sm">
            {["Features", "Privacy", "Help Center", "Blog", "For Business", "Download"].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
              >
                <Link 
                  href={`#${item.toLowerCase().replace(" ", "")}`} 
                  className="hover:text-cyan-300 transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 group-hover:w-full transition-all"></span>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="space-x-2 md:space-x-4">
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-sm border border-white/10 shadow-lg hover:shadow-cyan-500/20"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 hover:opacity-90 transition-all text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-8 pb-16 relative z-10">
        {/* Hero Section */}
        <motion.main 
          style={{ scale, opacity, y }}
          className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20 pt-8"
        >
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Connect with friends in a <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">whole new way</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              NextTalk brings your conversations to life with real-time messaging, voice calls, status updates, and more—all in one beautiful app.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/register" 
                className="relative px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-all"></span>
                <span className="relative">Get Started</span>
              </Link>
              <Link 
                href="#download" 
                className="px-6 py-3 rounded-full border border-white/30 backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all text-sm"
              >
                Download App
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <TiltCard className="relative w-full max-w-md mx-auto">
              <div className="relative h-96 w-full md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                {/* Glow effects */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl opacity-30"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cyan-400 rounded-full filter blur-3xl opacity-30"></div>
                
                {/* Glass effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl"></div>
                
                {/* WhatsApp-style Chat Interface */}
                <div className="absolute top-0 left-0 w-full h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="p-3 bg-gradient-to-r from-indigo-800/80 to-purple-800/80 border-b border-white/20 flex items-center backdrop-blur-md">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex-shrink-0 shadow-lg shadow-purple-500/30"></div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-semibold">Sarah Johnson</div>
                      <div className="text-xs text-gray-300">Online</div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-lg">📞</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-lg">📹</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-lg">⋮</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-indigo-900/20 to-purple-900/20 backdrop-blur-sm">
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-700/60 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%] shadow-lg">
                        <p className="text-sm">Hey! How is your day going?</p>
                        <p className="text-xs text-gray-400 text-right">10:12 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end mb-4">
                      <div className="bg-gradient-to-r from-cyan-500/70 to-blue-500/70 backdrop-blur-sm rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%] shadow-lg shadow-cyan-500/10">
                        <p className="text-sm">Pretty good! Just checking out this new chat app called NextTalk.</p>
                        <p className="text-xs text-gray-200 text-right">10:15 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-700/60 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%] shadow-lg">
                        <p className="text-sm">Oh nice! I heard it has all the features from WhatsApp plus more!</p>
                        <p className="text-xs text-gray-400 text-right">10:16 AM</p>
                      </div>
                    </div>
                    <div className="flex justify-end mb-4">
                      <div className="bg-gradient-to-r from-cyan-500/70 to-blue-500/70 backdrop-blur-sm rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%] shadow-lg shadow-cyan-500/10">
                        <p className="text-sm">Yeah! The UI is gorgeous and it has all these cool social features.</p>
                        <p className="text-xs text-gray-200 text-right">10:17 AM</p>
                      </div>
                    </div>
                    <motion.div 
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1 }}
                    >
                      <div className="bg-gray-700/60 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%] shadow-lg">
                        <p className="text-sm">Plus it is super secure with end-to-end encryption!</p>
                        <p className="text-xs text-gray-400 text-right">10:18 AM</p>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-3 bg-indigo-900/60 backdrop-blur-md border-t border-white/20 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-2">
                      <span className="text-lg">😊</span>
                    </div>
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-300">Type a message</div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center ml-2 shadow-lg shadow-cyan-500/30">
                      <span className="text-lg">🎤</span>
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </motion.main>

        {/* Features Section */}
        <section id="features" className="py-16 border-t border-white/10">
          <motion.h2 
            className="text-3xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Why choose NextTalk?
            </span>
          </motion.h2>
          
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
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                  <span>Instant message delivery</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                  <span>Read receipts</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                  <span>Typing indicators</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <TiltCard className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden">
                <div className="relative h-64 w-full border border-white/20 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/10">
                  {/* Glow effects */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-400 rounded-full filter blur-3xl opacity-20"></div>
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
                  
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-md"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-xs bg-black/30 rounded-xl p-3 backdrop-blur-md border border-white/20 shadow-lg">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 shadow-md shadow-purple-500/30"></div>
                        <div className="ml-2 flex-1">
                          <div className="text-sm font-semibold">Alex</div>
                          <div className="text-xs text-gray-400">typing...</div>
                        </div>
                        <div className="text-xs text-gray-400">10:42 AM</div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-sm rounded-xl rounded-tr-none p-2 ml-auto max-w-[80%] shadow-md shadow-blue-500/10">
                          <p className="text-sm">I am heading to the coffee shop. Want to join?</p>
                        </div>
                        <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl rounded-tl-none p-2 max-w-[80%] shadow-md">
                          <p className="text-sm">Sounds good! I will be there in 15 minutes.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
          
          {/* Row 2: Image and Text Features */}
          <div className="flex flex-col-reverse md:flex-row items-center mb-20">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <TiltCard className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden">
                <div className="relative h-64 w-full border border-white/20 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/10">
                  {/* Glow effects */}
                  <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
                  <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-600 rounded-full filter blur-3xl opacity-20"></div>
                  
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-md"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-xs bg-black/30 rounded-xl p-3 backdrop-blur-md border border-white/20 shadow-lg">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">📞</div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">Group Call: Team Project</p>
                        <p className="text-sm text-gray-300">3 participants • 12:45</p>
                        <div className="flex justify-center mt-4 space-x-4">
                          <div className="w-12 h-12 rounded-full bg-red-500/80 flex items-center justify-center shadow-lg shadow-red-500/30">🔴</div>
                          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">🔊</div>
                          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">📹</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
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
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                  <span>Group video calls with up to 8 people</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                  <span>Screen sharing</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                  <span>Background blur</span>
                </li>
              </ul>
            </motion.div>
          </div>
          
          {/* Feature Grid - More Features */}
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
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <TiltCard className="h-full bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all shadow-lg relative overflow-hidden group">
                  {/* Glow effect on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-20 rounded-2xl blur-lg transition-all"></div>
                  <div className="relative">
                    <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <span className="text-xl">{feature.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* Privacy Section */}
        <section id="privacy" className="py-16 border-t border-white/10">
          <motion.h2 
            className="text-3xl font-bold text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Privacy you can trust
            </span>
          </motion.h2>
          <motion.p 
            className="text-center text-gray-300 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Your messages and calls are secured with end-to-end encryption, which means they stay between you and the people you choose to communicate with.
          </motion.p>
          
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <TiltCard className="h-full bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-10 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <span className="text-xl">🔒</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">End-to-End Encryption</h3>
                  // Continuing from where the code was cut off in the Privacy section
                  <p className="text-gray-300">
                    Messages and calls are secured so only you and the person you're communicating with can read or listen to them, and nobody in between, not even NextTalk.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                      <span>No one can read your messages</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                      <span>No one can listen to your calls</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                      <span>No logs or transcripts stored</span>
                    </li>
                  </ul>
                </div>
              </TiltCard>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <TiltCard className="h-full bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-10 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <div className="w-12 h-12 mb-4 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <span className="text-xl">🛡️</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Your Data, Your Control</h3>
                  <p className="text-gray-300">
                    We give you control over your data with customizable privacy settings and the ability to delete messages and media after sending.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                      <span>Disappearing messages</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                      <span>Message deletion</span>
                    </li>
                    <li className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                      <span>Custom privacy settings</span>
                    </li>
                  </ul>
                </div>
              </TiltCard>
            </motion.div>
          </div>
          
          <motion.div
            className="relative rounded-2xl overflow-hidden backdrop-blur-lg border border-white/20 shadow-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {/* Glow effects */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-cyan-500 rounded-full filter blur-3xl opacity-20"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-semibold mb-4 text-center">Our Privacy Commitment</h3>
              <p className="text-gray-300 text-center max-w-3xl mx-auto">
                We believe privacy isn't optional. NextTalk is built from the ground up with privacy in mind, not as an afterthought. 
                We collect only the minimum information needed to provide our service, and we never sell your data to third parties.
              </p>
              <div className="mt-6 flex justify-center">
                <Link 
                  href="/privacy-policy" 
                  className="flex items-center px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm backdrop-blur-sm border border-white/10"
                >
                  <span>Learn more about our privacy policy</span>
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* Download Section */}
        <section id="download" className="py-16 border-t border-white/10">
          <motion.h2 
            className="text-3xl font-bold text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Get NextTalk on all your devices
            </span>
          </motion.h2>
          <motion.p 
            className="text-center text-gray-300 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Download NextTalk on your phone, tablet, or computer and stay connected across all your devices.
          </motion.p>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <TiltCard className="relative p-6 bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg overflow-hidden group">
                {/* Glow effect on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-20 rounded-2xl blur-lg transition-all"></div>
                <div className="relative">
                  <div className="flex items-center justify-center mb-6">
                    <div className="text-4xl mr-3">📱</div>
                    <h3 className="text-xl font-semibold">Mobile App</h3>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Link 
                      href="#" 
                      className="px-4 py-2 rounded-full bg-black flex items-center shadow-lg border border-white/10"
                    >
                      <div className="mr-2">
                        <div className="text-2xl">🍎</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Download on the</div>
                        <div className="text-sm font-semibold">App Store</div>
                      </div>
                    </Link>
                    <Link 
                      href="#" 
                      className="px-4 py-2 rounded-full bg-black flex items-center shadow-lg border border-white/10"
                    >
                      <div className="mr-2">
                        <div className="text-2xl">🤖</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">GET IT ON</div>
                        <div className="text-sm font-semibold">Google Play</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <TiltCard className="relative p-6 bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg overflow-hidden group">
                {/* Glow effect on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-20 rounded-2xl blur-lg transition-all"></div>
                <div className="relative">
                  <div className="flex items-center justify-center mb-6">
                    <div className="text-4xl mr-3">💻</div>
                    <h3 className="text-xl font-semibold">Desktop App</h3>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Link 
                      href="#" 
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                      <div className="text-sm font-semibold">Windows</div>
                    </Link>
                    <Link 
                      href="#" 
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                      <div className="text-sm font-semibold">macOS</div>
                    </Link>
                    <Link 
                      href="#" 
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                      <div className="text-sm font-semibold">Linux</div>
                    </Link>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
          
          <motion.div
            className="relative rounded-2xl overflow-hidden backdrop-blur-lg border border-white/20 shadow-xl p-8 bg-gradient-to-r from-indigo-900/30 to-purple-900/30"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {/* 3D floating devices visualization */}
            <div className="hidden md:block absolute right-8 top-1/2 transform -translate-y-1/2 w-64 h-64">
              <div className="relative w-full h-full">
                <motion.div 
                  className="absolute top-0 left-0 w-40 h-64 rounded-2xl bg-black/80 border-4 border-white/20 shadow-xl"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: 'rotateY(-15deg) rotateX(5deg) translateZ(20px)'
                  }}
                  animate={{ 
                    rotateY: [-15, -10, -15],
                    translateY: [0, -10, 0] 
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                  }}
                >
                  <div className="absolute inset-2 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl overflow-hidden flex items-center justify-center">
                    <div className="text-2xl">📱</div>
                  </div>
                </motion.div>
                <motion.div 
                  className="absolute bottom-0 right-0 w-48 h-36 rounded-2xl bg-black/80 border-4 border-white/20 shadow-xl"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: 'rotateY(15deg) rotateX(-5deg) translateZ(40px)'
                  }}
                  animate={{ 
                    rotateY: [15, 10, 15],
                    translateY: [0, 10, 0] 
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut'
                  }}
                >
                  <div className="absolute inset-2 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 rounded-xl overflow-hidden flex items-center justify-center">
                    <div className="text-2xl">💻</div>
                  </div>
                </motion.div>
              </div>
            </div>
            
            <div className="md:max-w-lg">
              <h3 className="text-2xl font-bold mb-4">
                <span className="bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">Sync across all your devices</span>
              </h3>
              <p className="text-gray-300 mb-6">
                Start a conversation on your phone and continue seamlessly on your desktop. NextTalk keeps all your chats in sync across your devices.
              </p>
              <ul className="space-y-2 mb-8">
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                  <span>Real-time synchronization</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                  <span>Multiple device support</span>
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 flex items-center justify-center mr-2 shadow-md shadow-purple-500/30">✓</span>
                  <span>Seamless transition between devices</span>
                </li>
              </ul>
              <Link 
                href="/register" 
                className="relative px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm overflow-hidden group inline-flex items-center"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-all"></span>
                <span className="relative">Get Started Now</span>
                <span className="ml-2 relative">→</span>
              </Link>
            </div>
          </motion.div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 border-t border-white/10">
          <motion.h2 
            className="text-3xl font-bold text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              What our users say
            </span>
          </motion.h2>
          <motion.p 
            className="text-center text-gray-300 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Millions of people around the world are already using NextTalk to stay connected.
          </motion.p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah J.",
                role: "Graphic Designer",
                avatar: "bg-gradient-to-br from-pink-400 to-rose-500",
                content: "NextTalk completely changed how I collaborate with clients. The clean interface and seamless file sharing make it easy to share designs and get feedback quickly."
              },
              {
                name: "Michael L.",
                role: "Remote Team Lead",
                avatar: "bg-gradient-to-br from-blue-400 to-indigo-500",
                content: "Managing a remote team has never been easier. The group call quality is amazing and the screen sharing feature helps us collaborate like we're in the same room."
              },
              {
                name: "Elena R.",
                role: "International Student",
                avatar: "bg-gradient-to-br from-purple-400 to-violet-500",
                content: "NextTalk helps me stay connected with my family across the world. The voice messages and free international calls make it feel like they're right next door."
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <TiltCard className="h-full bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all shadow-lg relative overflow-hidden group">
                  {/* Glow effect on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-20 rounded-2xl blur-lg transition-all"></div>
                  <div className="relative">
                    <div className="flex items-start mb-4">
                      <div className={`w-10 h-10 rounded-full ${testimonial.avatar} flex-shrink-0 shadow-lg shadow-purple-500/30`}></div>
                      <div className="ml-3">
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-xs text-gray-400">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-gray-300">"{testimonial.content}"</p>
                    <div className="mt-4 flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="py-16 border-t border-white/10">
          <motion.h2 
            className="text-3xl font-bold text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </motion.h2>
          <motion.p 
            className="text-center text-gray-300 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Have questions about NextTalk? We've got answers.
          </motion.p>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "Is NextTalk really free?",
                answer: "Yes, NextTalk is completely free for personal use. We offer all core features—messaging, voice and video calls, file sharing, and more—at no cost. We also have premium plans for businesses with additional features."
              },
              {
                question: "How secure is NextTalk?",
                answer: "NextTalk uses end-to-end encryption for all messages, calls, and shared media. This means only you and the person you're communicating with can access the content—not even NextTalk can read your messages or listen to your calls."
              },
              {
                question: "Can I use NextTalk on multiple devices?",
                answer: "Absolutely! NextTalk syncs seamlessly across all your devices. You can start a conversation on your phone and continue it on your computer without missing a beat."
              },
              {
                question: "Does NextTalk work internationally?",
                answer: "Yes, NextTalk works worldwide. You can send messages and make calls to anyone, anywhere, as long as you both have an internet connection. There are no additional fees for international communication."
              },
              {
                question: "How many people can join a group chat or call?",
                answer: "You can create group chats with up to 250 people, and group video calls can accommodate up to 8 participants simultaneously for crystal-clear communication."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-300">{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="mt-10 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-300 mb-4">Still have questions?</p>
            <Link 
              href="/help" 
              className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-sm inline-flex items-center border border-white/10"
            >
              <span>Visit our Help Center</span>
              <span className="ml-2">→</span>
            </Link>
          </motion.div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 border-t border-white/10">
          <div className="relative rounded-2xl overflow-hidden p-8 lg:p-12">
            {/* Background gradient and effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-pink-600/30"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-25"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-400 rounded-full filter blur-3xl opacity-25"></div>
            <div className="absolute inset-0 backdrop-blur-sm border border-white/20 rounded-2xl"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="lg:w-2/3">
                <motion.h2 
                  className="text-3xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <span className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-purple-400 bg-clip-text text-transparent">
                    Ready to transform how you connect?
                  </span>
                </motion.h2>
                <motion.p 
                  className="text-gray-300 mb-6 lg:mb-0"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Join millions of people who trust NextTalk for secure, reliable, and beautiful communication. It takes less than a minute to sign up.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <TiltCard>
                  <Link 
                    href="/register" 
                    className="relative px-8 py-4 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-white font-semibold text-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all overflow-hidden group inline-flex items-center"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-all"></span>
                    <span className="relative">Get Started Free</span>
                    <span className="ml-2 relative">→</span>
                  </Link>
                </TiltCard>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <footer className="backdrop-blur-lg border-t border-white/10 bg-black/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Download</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Desktop App</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Mobile App</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Press</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Guidelines</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Facebook</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Instagram</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">LinkedIn</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">YouTube</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Discord</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="mr-2 text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">NextTalk</div>
              <div className="text-sm text-gray-400">© {new Date().getFullYear()} NextTalk. All rights reserved.</div>
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

