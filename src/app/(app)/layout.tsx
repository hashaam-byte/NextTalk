'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, createContext, useContext } from 'react';
import { SessionProvider } from 'next-auth/react';
import { SocketProvider } from '@/hooks/useSocket';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';

interface RootLayoutProps {
  children: React.ReactNode;
}

const BlurContext = createContext<{ setBlur: (blur: boolean) => void }>({ setBlur: () => {} });

export function useBlurOverlay() {
  return useContext(BlurContext);
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

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

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';
  
  // Check if current page is a chat ID page (e.g., /chat/123, /chat/user-456)
  const isChatIdPage = pathname.startsWith('/chat/') && pathname !== '/chat';

  return (
    <html lang="en">
      <head>
        <title>NextTalkWeb - Modern Chat Application</title>
        <meta name="description" content="A modern chat application built with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gradient-to-br from-gray-900 via-gray-950 to-black overflow-hidden">
        <SessionProvider>
          <AuthProvider>
            <SocketProvider>
              <BlurContext.Provider value={{ setBlur: () => {} }}>
                <div className="relative h-screen flex">
                  {/* Background elements for futuristic design */}
                  <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                    {/* Gradient blobs */}
                    <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-purple-700/20 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-1/2 right-0 w-1/4 h-1/4 bg-indigo-700/30 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                    <div className="absolute bottom-0 left-1/4 w-1/3 h-1/3 bg-cyan-700/20 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    
                    {/* Animated grid background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25"></div>
                  </div>
                  
                  {/* Desktop Layout */}
                  {!isMobile && (
                    <div className="flex w-full h-screen relative z-10">
                      {/* Desktop Sidebar */}
                      {!isAuthPage && (
                        <div className="h-screen flex-shrink-0">
                          <Sidebar />
                        </div>
                      )}
                      
                      {/* Main Content */}
                      <main className="flex-1 min-w-0 h-screen overflow-y-auto">
                        {!isAuthPage && <Navbar />}
                        <div className="w-full">
                          {children}
                        </div>
                      </main>
                    </div>
                  )}

                  {/* Mobile Layout */}
                  {isMobile && (
                    <div className="flex flex-col w-full h-screen relative z-10">
                      {/* Mobile Navbar */}
                      {!isAuthPage && (
                        <div className="flex-shrink-0 relative z-20">
                          <Navbar />
                        </div>
                      )}
                      
                      {/* Main Content with proper spacing for bottom nav - always scrollable */}
                      <main className={`flex-1 overflow-y-auto relative z-10 ${
                        !isAuthPage && !isChatIdPage ? 'pb-28' : 'pb-safe'
                      }`}>
                        <div className="w-full min-h-full">
                          {children}
                        </div>
                      </main>

                      {/* Mobile Bottom Navigation - Fixed and always on top */}
                      {!isAuthPage && !isChatIdPage && (
                        <div className="relative z-50">
                          <Sidebar />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </BlurContext.Provider>
            </SocketProvider>
          </AuthProvider>
        </SessionProvider>
        
        {/* Enhanced Global Styles */}
        <style jsx global>{`
          /* Support for iOS safe areas */
          :root {
            --sat: env(safe-area-inset-top);
            --sar: env(safe-area-inset-right);
            --sab: env(safe-area-inset-bottom);
            --sal: env(safe-area-inset-left);
          }
          
          .pb-safe {
            padding-bottom: max(1rem, env(safe-area-inset-bottom));
          }
          
          .h-safe {
            height: env(safe-area-inset-bottom);
          }
          
          /* Blob animations */
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          
          .animate-blob {
            animation: blob 25s infinite alternate;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          
          /* Enhanced scrollbar styling */
          ::-webkit-scrollbar {
            width: 5px;
            height: 5px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.5);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.8);
          }
          
          ::-webkit-scrollbar-corner {
            background: transparent;
          }
          
          /* Mobile-specific optimizations */
          @media (max-width: 768px) {
            body {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              user-select: none;
              overscroll-behavior: none;
              position: fixed;
              width: 100%;
              height: 100%;
            }
            
            /* Prevent zoom on input focus */
            input, textarea, select {
              font-size: 16px !important;
            }
            
            /* Smooth scrolling for mobile */
            * {
              -webkit-overflow-scrolling: touch;
            }
            
            /* Ensure content can scroll behind fixed bottom nav */
            main {
              scroll-behavior: smooth;
            }
            
            /* Fix any potential scroll issues */
            .overflow-y-auto {
              overscroll-behavior-y: contain;
            }
          }
          
          /* Backdrop blur support fallback */
          @supports not (backdrop-filter: blur(12px)) {
            .backdrop-blur-lg {
              background-color: rgba(0, 0, 0, 0.8);
            }
            
            .backdrop-blur-2xl {
              background-color: rgba(0, 0, 0, 0.9);
            }
          }
          
          /* Focus states for accessibility */
          .focus\\:ring-2:focus {
            outline: 2px solid rgba(139, 92, 246, 0.5);
            outline-offset: 2px;
          }
          
          /* Reduced motion preference */
          @media (prefers-reduced-motion: reduce) {
            .animate-blob {
              animation: none;
            }
            
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </body>
    </html>
  );
}