'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Send, X, Users, Clock, Star, Zap, Check, ChevronRight } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  isGroup?: boolean;
  memberCount?: number;
  category: 'recent' | 'frequent' | 'starred' | 'all';
}

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio';
  timestamp: string;
}

const ForwardPage: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'recent' | 'frequent' | 'starred' | 'all'>('all');
  const [isForwarding, setIsForwarding] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch contacts (user's contacts) and forwarded message from localStorage
  useEffect(() => {
    // Fetch all contacts for the user
    async function fetchContacts() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/contacts');
        const data = await res.json();
        // Map contacts to Contact[]
        const mapped: Contact[] = (data.contacts || []).map((contact: any) => ({
          id: contact.id,
          name: contact.name || 'Unknown',
          avatar: contact.profileImage || '💬',
          status: contact.status === 'online' ? 'online' : contact.status === 'away' ? 'away' : 'offline',
          lastSeen: contact.lastSeen ? new Date(contact.lastSeen).toLocaleString() : 'Never',
          isGroup: false,
          memberCount: undefined,
          category: 'all'
        }));
        setContacts(mapped);
      } catch {
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchContacts();

    // Get the message to forward from localStorage
    const msg = localStorage.getItem('forwardMessage');
    if (msg) {
      try {
        const parsed = JSON.parse(msg);
        setForwardMessage({
          id: parsed.id,
          content: parsed.content,
          type: parsed.type || 'text',
          timestamp: parsed.timestamp || ''
        });
      } catch {
        setForwardMessage(null);
      }
    }
  }, []);

  // Filter contacts by search and tab
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    // For now, all contacts are 'all' category
    const matchesTab = activeTab === 'all' || contact.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Forward the message to selected contacts (chats)
  const handleForward = async () => {
    if (!forwardMessage || selectedContacts.length === 0) return;
    setIsForwarding(true);
    try {
      await Promise.all(
        selectedContacts.map(contactId =>
          fetch(`/api/chat/${contactId}/forward`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messageId: forwardMessage.id,
              targetChatIds: [contactId]
            })
          })
        )
      );
      setIsForwarding(false);
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        router.back();
      }, 2500);
      setSelectedContacts([]);
      localStorage.removeItem('forwardMessage');
    } catch {
      setIsForwarding(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-400';
      case 'away':
        return 'bg-amber-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return '📷';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      default:
        return '💬';
    }
  };

  const tabIcons = {
    recent: Clock,
    frequent: Zap,
    starred: Star,
    all: Users
  };

  const tabLabels = {
    recent: 'Recent',
    frequent: 'Frequent',
    starred: 'Starred',
    all: 'All'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative z-10 max-w-md mx-auto bg-black/20 backdrop-blur-xl border border-white/10 min-h-screen shadow-2xl">
        {/* Enhanced Header */}
        <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95" 
              onClick={() => router.back()}
            >
              <X size={24} />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Forward Message
            </h1>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <Send size={16} className="text-white" />
            </div>
          </div>

          {/* Enhanced Message Preview */}
          {forwardMessage && (
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20 shadow-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-blue-300 uppercase tracking-wide">Forwarding</span>
                </div>
                <div className="text-lg">{getMessageTypeIcon(forwardMessage.type)}</div>
              </div>
              <p className="text-sm text-white/90 leading-relaxed mb-2">{forwardMessage.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{forwardMessage.timestamp}</span>
                <div className="px-2 py-1 bg-white/10 rounded-full">
                  <span className="text-xs text-white/70 capitalize">{forwardMessage.type}</span>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-white/15"
            />
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex space-x-2 p-4 bg-black/20">
          {(Object.keys(tabIcons) as Array<keyof typeof tabIcons>).map(tab => {
            const Icon = tabIcons[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-200 font-medium ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:scale-105'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm">{tabLabels[tab]}</span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-400">Loading contacts...</span>
            </div>
          </div>
        )}

        {/* Enhanced Contacts List */}
        <div className="flex-1 p-4 space-y-3">
          {!isLoading && filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-400">No contacts found</p>
            </div>
          )}
          
          {filteredContacts.map((contact, index) => (
            <div
              key={contact.id}
              onClick={() => handleContactToggle(contact.id)}
              className={`flex items-center space-x-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                selectedContacts.includes(contact.id)
                  ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-2 border-blue-400/50 shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-xl border-2 border-white/20 shadow-lg">
                  {contact.avatar}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(contact.status)} rounded-full border-2 border-black shadow-sm`}></div>
                {selectedContacts.includes(contact.id) && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold truncate text-white">{contact.name}</h3>
                  {contact.isGroup && (
                    <div className="flex items-center space-x-1 text-xs text-gray-400 bg-white/10 px-2 py-1 rounded-full">
                      <Users size={10} />
                      <span>{contact.memberCount}</span>
                    </div>
                  )}
                  {contact.category === 'starred' && (
                    <Star size={12} className="text-yellow-400 fill-current" />
                  )}
                </div>
                <p className="text-sm text-gray-400 truncate flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(contact.status)}`}></span>
                  <span>{contact.status === 'online' ? 'Online' : `Last seen ${contact.lastSeen}`}</span>
                </p>
              </div>
              
              <ChevronRight size={16} className={`text-gray-400 transition-transform duration-200 ${selectedContacts.includes(contact.id) ? 'rotate-90' : ''}`} />
            </div>
          ))}
        </div>

        {/* Enhanced Forward Button */}
        {selectedContacts.length > 0 && (
          <div className="sticky bottom-0 p-4 bg-black/40 backdrop-blur-xl border-t border-white/10">
            <div className="mb-3 text-center">
              <span className="text-sm text-gray-300">
                {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <button
              onClick={handleForward}
              disabled={isForwarding}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isForwarding ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Forwarding...</span>
                </>
              ) : (
                <>
                  <Send size={20} />
                  <span>Forward Message</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Enhanced Success Confirmation */}
        {showConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-8 rounded-3xl shadow-2xl transform animate-bounce">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Check size={32} className="text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg mb-1">Success!</h3>
                  <p className="text-white/90">Message forwarded to {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForwardPage;