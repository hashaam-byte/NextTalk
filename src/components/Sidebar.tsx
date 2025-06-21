// src/components/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Users, Video, Camera, User, 
  Settings, LogOut, Plus, Home, Menu, ChevronRight, Sparkles
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
    { name: 'Reels', icon: Sparkles, path: '/reels' },
    { name: 'Apps', icon: Menu, path: '/apps' },
  ];

  const profileItems = [
    { name: 'Profile', icon: User, path: '/profile' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const checkActive = (path: string) => {
    if (path === '/chat' && pathname.startsWith('/chat')) return true;
    if (path === '/groups' && pathname.startsWith('/groups')) return true;
    if (path === '/reels' && pathname.startsWith('/reels')) return true;
    return pathname === path;
  };
  
  // Mobile navigation bar - Completely redesigned
  if (isMobile) {
    // Hide sidebar on specific routes
    const hideSidebarRoutes = ['/call', '/camera', '/login', '/register'];
    if (hideSidebarRoutes.some(route => pathname?.startsWith(route))) {
      return null;
    }

    return (
      <div className="fixed bottom-0 left-0 right-0 z-50">
        {/* Modern Glass Morphism Bottom Navigation */}
        <div className="relative">
          {/* Background blur effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-2xl" />
          
          {/* Navigation container */}
          <div className="relative px-4 pt-2 pb-safe">
            {/* Main navigation icons */}
            <div className="flex items-center justify-around max-w-sm mx-auto">
              {navItems.map((item, index) => {
                const isActive = checkActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="relative flex flex-col items-center group"
                  >
                    {/* Active background indicator */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="activeMobile"
                          className="absolute -inset-3 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl border border-purple-400/30"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Icon container */}
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className={`relative z-10 p-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'text-white shadow-lg shadow-purple-500/25'
                          : 'text-gray-400 group-active:text-purple-400'
                      }`}
                    >
                      <item.icon 
                        size={22} 
                        className={`transition-all duration-200 ${
                          isActive ? 'drop-shadow-sm' : ''
                        }`} 
                      />
                    </motion.div>

                    {/* Label */}
                    <span className={`text-xs font-medium mt-1 transition-colors duration-200 ${
                      isActive ? 'text-purple-300' : 'text-gray-500'
                    }`}>
                      {item.name}
                    </span>

                    {/* Active dot indicator */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute -top-1 w-1 h-1 bg-purple-400 rounded-full"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>

            {/* Floating Action Button - New Chat */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/contacts')}
              className="absolute right-4 -top-6 w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg shadow-purple-600/40 flex items-center justify-center text-white"
            >
              <Plus size={20} />
            </motion.button>

            {/* Modern indicator line */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full opacity-50" />
          </div>

          {/* Safe area spacing */}
          <div className="h-safe bg-gradient-to-t from-black/90 to-transparent" />
        </div>
      </div>
    );
  }
  
  // Desktop sidebar - Keep existing design
  return (
    <>
      <motion.div 
        className={`h-full bg-black/30 backdrop-blur-lg border-r border-white/10 flex flex-col ${
          isExpanded ? 'w-56' : 'w-20'
        }`}
        initial={false}
        animate={{ width: isExpanded ? '14rem' : '5rem' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10">
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
    </>
  );
}