// src/components/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Users, Video, Camera, User, 
  Settings, LogOut, Plus, Home, Menu, ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if current route should show mobile navigation
  const showMobileNav = pathname.startsWith('/chat') || 
                       pathname.startsWith('/groups') || 
                       pathname.startsWith('/videos') || 
                       pathname.startsWith('/camera');
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  const navItems = [
    { name: 'Home', icon: Home, path: '/home' },
    { name: 'Chats', icon: MessageSquare, path: '/chat' },
    { name: 'Groups', icon: Users, path: '/groups' },
    { name: 'Videos', icon: Video, path: '/videos' },
    { name: 'Camera', icon: Camera, path: '/camera' },
  ];

  const profileItems = [
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const checkActive = (path: string) => {
    if (path === '/chat' && pathname.startsWith('/chat')) return true;
    if (path === '/groups' && pathname.startsWith('/groups')) return true;
    if (path === '/videos' && pathname.startsWith('/videos')) return true;
    return pathname === path;
  };
  
  // Early return for mobile navigation
  if (isMobile && showMobileNav) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            { [
                { icon: MessageSquare, label: 'Chats', path: '/chat' },
                { icon: Users, label: 'Groups', path: '/groups' },
                { icon: Video, label: 'Videos', path: '/videos' },
                { icon: Camera, label: 'Camera', path: '/camera' }
              ].map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  pathname.startsWith(item.path)
                    ? 'text-purple-400 bg-white/10'
                    : 'text-gray-400 hover:text-purple-400'
                }`}
              >
                <item.icon size={24} className="mb-1" />
                <span className="text-xs">{item.label}</span>
                {pathname.startsWith(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"
                  />
                )}
              </Link>
            )) }
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      className={`flex flex-col h-full bg-black/30 backdrop-blur-lg border-r border-white/10 z-20 transition-all duration-300 overflow-hidden ${
        isExpanded ? 'w-56' : 'w-20'
      }`}
      initial={false}
      animate={{ width: isExpanded ? '14rem' : '5rem' }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {isExpanded ? (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <MessageSquare size={16} className="text-white" />
            </div>
            <span className="ml-2 font-bold bg-gradient-to-r from-purple-400 to-cyan-400 text-transparent bg-clip-text">
              NextTalk
            </span>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <MessageSquare size={18} className="text-white" />
          </div>
        )}
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-full p-1 text-gray-400 hover:bg-white/10 transition-all"
        >
          <ChevronRight size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {/* Main Navigation */}
      <div className="flex-1 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-3 py-3 mx-2 rounded-lg transition-all group ${
              checkActive(item.path)
                ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-purple-400'
            }`}
          >
            <item.icon size={20} className={`${isExpanded ? 'mr-3' : 'mx-auto'}`} />
            {isExpanded && <span>{item.name}</span>}
            
            {!isExpanded && (
              <div className="fixed left-20 -mt-10 px-2 py-1 bg-gray-900 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 text-xs text-white">
                {item.name}
              </div>
            )}
          </Link>
        ))}
      </div>
      
      {/* Bottom section */}
      <div className="p-4 space-y-1 border-t border-white/10">
        {profileItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center px-3 py-3 rounded-lg transition-all group ${
              checkActive(item.path)
                ? 'bg-gradient-to-r from-purple-600/20 to-cyan-600/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:bg-white/5 hover:text-purple-400'
            }`}
          >
            <item.icon size={20} className={`${isExpanded ? 'mr-3' : 'mx-auto'}`} />
            {isExpanded && <span>{item.name}</span>}
            
            {!isExpanded && (
              <div className="fixed left-20 px-2 py-1 bg-gray-900 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 text-xs text-white">
                {item.name}
              </div>
            )}
          </Link>
        ))}
        
        {/* Logout button */}
        <button
          className="flex items-center w-full px-3 py-3 rounded-lg transition-all group text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={20} className={`${isExpanded ? 'mr-3' : 'mx-auto'}`} />
          {isExpanded && <span>Logout</span>}
          
          {!isExpanded && (
            <div className="fixed left-20 px-2 py-1 bg-gray-900 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50 text-xs text-white">
              Logout
            </div>
          )}
        </button>
      </div>
      
      {/* Create new chat button */}
      <div className="p-4 border-t border-white/10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/contacts')}
          className={`flex items-center justify-center w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all`}
        >
          <Plus size={18} className="mr-2" />
          {isExpanded ? 'New Chat' : ''}
        </motion.button>
      </div>
    </motion.div>
  );
}