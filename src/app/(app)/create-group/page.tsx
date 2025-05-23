'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Camera, X, Check, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  isSelected?: boolean;
}

export default function CreateGroupPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null);
  const [groupBio, setGroupBio] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts');
        const data = await response.json();
        setContacts(data.contacts || []);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const handleContactSelect = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isAlreadySelected = prev.find(c => c.id === contact.id);
      if (isAlreadySelected) {
        return prev.filter(c => c.id !== contact.id);
      }
      return [...prev, contact];
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedContacts.length === 0) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          avatar: groupAvatar,
          bio: groupBio,
          members: selectedContacts.map(c => c.id)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create group');
      }

      const data = await response.json();
      router.push('/groups');
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-t-purple-500 border-r-transparent border-b-indigo-500 border-l-transparent animate-spin"></div>
          <p className="mt-4 text-white text-lg">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/10 bg-black/30 backdrop-blur-lg">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-200"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
            Create Group
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col p-4">
        {/* Group Info Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div 
                onClick={handleImageClick}
                className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden cursor-pointer transition-all hover:bg-white/20"
              >
                {groupAvatar ? (
                  <Image
                    src={groupAvatar}
                    alt="Group avatar"
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Users size={32} className="text-gray-400" />
                )}
              </div>
              <button 
                onClick={handleImageClick}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg transition-all hover:scale-110"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 mb-3"
              />
              <textarea
                placeholder="Group bio (optional)"
                value={groupBio}
                onChange={(e) => setGroupBio(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-24 resize-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Selected Contacts */}
        {selectedContacts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {selectedContacts.map(contact => (
              <motion.div
                key={contact.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1 flex items-center space-x-2"
              >
                <span className="text-sm text-white">{contact.name}</span>
                <button
                  onClick={() => handleContactSelect(contact)}
                  className="text-purple-300 hover:text-purple-100"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {filteredContacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center p-3 rounded-xl mb-2 cursor-pointer transition-all ${
                  selectedContacts.find(c => c.id === contact.id)
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'hover:bg-white/5'
                }`}
                onClick={() => handleContactSelect(contact)}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                    {contact.avatar ? (
                      <Image
                        src={contact.avatar}
                        alt={contact.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center text-white">
                        {contact.name[0]}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-white font-medium">{contact.name}</p>
                  <p className="text-gray-400 text-sm">{contact.email}</p>
                </div>
                {selectedContacts.find(c => c.id === contact.id) && (
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Button */}
      <div className="p-4 border-t border-white/10 bg-black/30 backdrop-blur-lg">
        <button
          onClick={handleCreateGroup}
          disabled={!groupName || selectedContacts.length === 0}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/20 transition-all"
        >
          Create Group ({selectedContacts.length} members)
        </button>
      </div>
    </div>
  );
}
