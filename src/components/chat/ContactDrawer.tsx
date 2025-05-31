import { motion } from 'framer-motion';
import { BellOff, UserX, Flag, X, Users, User as UserIcon, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ChatInfo {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date | null;
  status: string;
  deviceType?: 'mobile' | 'desktop' | 'web';
  isTyping?: boolean;
}

interface ContactDrawerProps {
  chatId: string; // Add this prop
  contact: {
    id: string;
    name: string;
    profileImage?: string;
    bio?: string;
    status: string;
    lastSeen?: Date;
    isBlocked?: boolean;
    deviceType?: 'mobile' | 'desktop' | 'web';
    isTyping?: boolean;
  };
  commonGroups: {
    id: string;
    name: string;
    avatar?: string;
    membersCount: number;
  }[];
  onClose: () => void;
  onMute: () => void;
  onBlock: () => void;
  onReport: () => void;
}

export default function ContactDrawer({
  chatId, // Add this prop
  contact,
  commonGroups,
  onClose,
  onMute,
  onBlock,
  onReport
}: ContactDrawerProps) {
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);

  // Fetch chat details
  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const response = await fetch(`/api/chat/${chatId}/details`);
        const data = await response.json();
        setChatInfo(data);
      } catch (error) {
        console.error('Error fetching chat details:', error);
      }
    };

    fetchChatDetails();
    // Poll for updates
    const interval = setInterval(fetchChatDetails, 10000);
    return () => clearInterval(interval);
  }, [chatId]);

  const formatLastSeen = (lastSeen: Date | null) => {
    if (!lastSeen) return 'Offline';
    
    const now = new Date();
    const diff = now.getTime() - new Date(lastSeen).getTime();
    
    const seconds = Math.floor(diff / 1000);
    if (seconds < 30) return 'Just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    
    return new Date(lastSeen).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed right-0 top-0 h-full w-96 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 z-50"
    >
      {/* Profile Header - Updated to match chat header */}
      <div className="relative h-64">
        <div className="absolute inset-0">
          {chatInfo?.avatar && !contact.isBlocked && (
            <Image
              src={chatInfo.avatar}
              alt=""
              fill
              className="object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-gray-900/95 to-gray-900/95 backdrop-blur-xl" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-white/10 transition-all z-10"
        >
          <X size={20} className="text-white/80" />
        </button>

        {/* Profile info - Updated to match chat header */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/20">
                {!contact.isBlocked && chatInfo?.avatar ? (
                  <Image
                    src={chatInfo.avatar}
                    alt={chatInfo.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Online Status Indicator */}
              {!contact.isBlocked && chatInfo?.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-900 bg-green-500" />
              )}
            </div>

            {/* Name and Status */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">{chatInfo?.name || contact.name}</h2>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className={`${
                  chatInfo?.isOnline ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {contact.isBlocked 
                    ? 'Blocked Contact'
                    : chatInfo?.isOnline
                    ? 'Online'
                    : chatInfo?.lastSeen
                    ? `Last seen ${formatLastSeen(chatInfo.lastSeen)}`
                    : 'Offline'}
                </span>
                {chatInfo?.deviceType && !contact.isBlocked && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">on {chatInfo.deviceType}</span>
                  </>
                )}
                {chatInfo?.isTyping && !contact.isBlocked && (
                  <>
                    <span className="text-gray-500">•</span>
                    <span className="text-purple-400">typing...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto h-[calc(100%-16rem)]">
        {/* Bio Section - Enhanced */}
        {contact.bio && !contact.isBlocked && (
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-medium text-gray-400 mb-2">About</h3>
            <p className="text-white text-sm leading-relaxed">{contact.bio}</p>
          </div>
        )}

        {/* Shared Groups */}
        {commonGroups.length > 0 && (
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              {commonGroups.length} Groups in Common
            </h3>
            <div className="space-y-3">
              {commonGroups.map(group => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                    {group.avatar ? (
                      <Image
                        src={group.avatar}
                        alt={group.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
                        <Users size={20} className="text-white/60" />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium">{group.name}</p>
                    <p className="text-sm text-gray-400">{group.membersCount} members</p>
                  </div>
                  <ChevronRight size={20} className="ml-auto text-gray-500" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 space-y-2">
          <button
            onClick={onMute}
            className="w-full flex items-center p-3 rounded-lg hover:bg-white/5 text-left"
          >
            <BellOff size={20} className="text-gray-400 mr-3" />
            <span className="text-white">Mute notifications</span>
          </button>
          <button
            onClick={onBlock}
            className="w-full flex items-center p-3 rounded-lg hover:bg-white/5 text-left"
          >
            <UserX size={20} className="text-red-400 mr-3" />
            <span className="text-red-400">Block contact</span>
          </button>
          <button
            onClick={onReport}
            className="w-full flex items-center p-3 rounded-lg hover:bg-white/5 text-left"
          >
            <Flag size={20} className="text-red-400 mr-3" />
            <span className="text-red-400">Report contact</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
