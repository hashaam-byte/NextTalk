import { motion } from 'framer-motion';
import { BellOff, UserX, Flag, X, Users } from 'lucide-react';
import Image from 'next/image';

interface ContactDrawerProps {
  contact: {
    id: string;
    name: string;
    profileImage?: string;
    bio?: string;
    status: string;
    lastSeen?: Date;
    isBlocked?: boolean;
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
  contact,
  commonGroups,
  onClose,
  onMute,
  onBlock,
  onReport
}: ContactDrawerProps) {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed right-0 top-0 h-full w-96 bg-gray-900/95 backdrop-blur-xl border-l border-white/10 z-50"
    >
      {/* Profile Header */}
      <div className="relative h-64">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 to-gray-900/95"></div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/20 backdrop-blur-sm hover:bg-white/10 transition-all"
        >
          <X size={20} className="text-white/80" />
        </button>

        {/* Profile info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end space-x-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/20">
                {!contact.isBlocked && contact.profileImage ? (
                  <Image
                    src={contact.profileImage}
                    alt={contact.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              {!contact.isBlocked && (
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-900 ${
                  contact.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                }`}></div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{contact.name}</h2>
              <p className="text-sm text-gray-300">
                {contact.isBlocked 
                  ? 'Blocked Contact'
                  : contact.status === 'online'
                  ? 'Online'
                  : contact.lastSeen
                  ? `Last seen ${formatLastSeen(contact.lastSeen)}`
                  : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto h-[calc(100%-16rem)]">
        {/* Bio Section */}
        {contact.bio && (
          <div className="p-4 border-b border-white/10">
            <h3 className="text-sm font-medium text-gray-400 mb-2">About</h3>
            <p className="text-white">{contact.bio}</p>
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
