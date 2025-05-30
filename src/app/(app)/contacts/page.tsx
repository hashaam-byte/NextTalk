'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, UserPlus, Users, Check, X } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  status?: string;
  lastSeen?: Date | string | null;
}

interface ContactRequest {
  id: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
}

const formatLastSeen = (lastSeen: Date | string | null | undefined) => {
  if (!lastSeen) return 'Never';
  try {
    return new Date(lastSeen).toLocaleString();
  } catch (error) {
    return 'Unknown';
  }
};

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts');
        const data = await response.json();
        if (data.contacts) {
          setContacts(data.contacts.map((contact: any) => ({
            ...contact,
            lastSeen: contact.lastSeen ? new Date(contact.lastSeen) : null
          })));
          setFilteredContacts(data.contacts);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    const fetchContactRequests = async () => {
      try {
        const response = await fetch('/api/contacts/requests');
        const data = await response.json();
        setContactRequests(data.requests || []);
      } catch (error) {
        console.error('Error fetching contact requests:', error);
      }
    };

    if (session?.user) {
      fetchContacts();
      fetchContactRequests();
      // Poll for online status every 30 seconds
      const interval = setInterval(fetchContacts, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredContacts(
        contacts.filter(contact =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const handleStartChat = async (contactId: string) => {
    try {
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const { chatId } = await response.json();
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleAddContact = async (email: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch('/api/contacts/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send request');
      }

      setSuccess('Contact request sent successfully');
      // Reset form or update UI as needed
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contacts/requests/${requestId}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      // Remove the request from the list
      setContactRequests(prev => prev.filter(req => req.id !== requestId));

      // Show success notification
      // You can implement your notification system here
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contacts/requests/${requestId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reject request');
      }

      // Remove the request from the list
      setContactRequests(prev => prev.filter(req => req.id !== requestId));

      // Show success notification
      // You can implement your notification system here
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in</div>;
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      {/* Adjust header padding for mobile */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 mr-2 rounded-full hover:bg-white/10 transition-all text-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
            Contacts
          </h1>
        </div>

        <div className="flex space-x-2">
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-all text-gray-200"
            onClick={() => router.push('/add-contact')}
          >
            <UserPlus size={20} />
          </button>
        </div>
      </div>

      {/* Adjust search padding for mobile */}
      <div className="px-3 sm:px-4 py-3 bg-black/10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 bg-white/10 border-none rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 backdrop-blur-sm"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Contact list with responsive grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-2 sm:gap-3 p-3 sm:p-4">
          <div className="sticky top-0 bg-black/20 backdrop-blur-sm z-10 p-2">
            <h2 className="text-sm font-medium text-gray-400 px-2 py-1">All Contacts</h2>
          </div>

          {filteredContacts.length > 0 ? (
            <div className="divide-y divide-white/5">
              {filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center p-4 cursor-pointer hover:bg-white/5"
                  onClick={() => handleStartChat(contact.id)}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-indigo-800/50 to-purple-900/50">
                    {contact.avatar ? (
                      <Image
                        src={contact.avatar}
                        alt={contact.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white font-medium">
                        {contact.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-medium text-white">{contact.name}</h2>
                      {contact.lastSeen && (
                        <span className="text-xs text-gray-400">
                          {formatLastSeen(contact.lastSeen)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {contact.status || contact.email || ''}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 h-full">
              <div className="rounded-full bg-white/5 p-4 mb-4">
                <Users size={32} className="text-purple-500" />
              </div>
              <p className="text-lg font-medium text-white">No contacts found</p>
              <p className="text-sm mt-1 mb-4">Add new contacts to start chatting</p>
              <button 
                onClick={() => router.push('/add-contact')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
              >
                <UserPlus size={18} className="mr-2" />
                Add new contact
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Contact requests section */}
      <div className="px-3 sm:px-4 py-3 bg-black/10 border-t border-white/10">
        <h2 className="text-lg font-semibold text-white mb-3">Contact Requests</h2>
        {contactRequests.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence>
              {contactRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                          {request.sender.profileImage ? (
                            <Image
                              src={request.sender.profileImage}
                              alt={request.sender.name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-lg">
                              {request.sender.name[0]}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{request.sender.name}</h3>
                        <p className="text-gray-400 text-sm">{request.sender.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAcceptRequest(request.id)}
                        disabled={loading}
                        className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors"
                      >
                        <Check size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={loading}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {contactRequests.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <UserPlus size={40} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No pending contact requests</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-2">No new contact requests</p>
        )}
      </div>
    </div>
  );
}