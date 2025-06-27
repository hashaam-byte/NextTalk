'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  User, Mail, Calendar, MapPin, Edit, Camera, 
  Trash2, Save, X, Phone, Link as LinkIcon, 
  MessageSquare, Users, UserPlus, Bell
} from 'lucide-react';

interface UserStats {
  messages: number;
  contacts: number;
  groups: number;
  mediaShared: number;
}

interface Activity {
  type: string;
  content: string;
  time: Date;
  fromUser?: string;
}

interface OnlineFriend {
  id: string;
  name: string;
  profileImage?: string;
  status: string;
}

interface Stats {
  stats: UserStats;
  activities: Activity[];
  onlineFriends: OnlineFriend[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  reward?: string;
}

interface Spark {
  id: string;
  userId: string;
  count: number;
  lastInteraction: Date;
  streak: number;
  level: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    profileImage: '',
    createdAt: new Date()
  });
  
  const [editForm, setEditForm] = useState({...userData});
  const [stats, setStats] = useState<Stats | null>(null);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [blurProfile, setBlurProfile] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/stats')
        ]);

        const [profileData, statsData] = await Promise.all([
          profileRes.json(),
          statsRes.json()
        ]);

        if (profileData.user) {
          setUserData({
            ...profileData.user,
            createdAt: new Date(profileData.user.createdAt)
          });
          setEditForm({
            ...profileData.user,
            createdAt: new Date(profileData.user.createdAt)
          });
        }

        if (statsData) {
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (session?.user?.email) {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    if (userData.privacyLevel === 'private' && session?.user?.id !== userData.id) {
      setBlurProfile(true);
    } else {
      setBlurProfile(false);
    }
  }, [userData, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    setUserData({...editForm});
    setIsEditing(false);
    // In a real app, this would send the data to an API
  };
  
  const handleCancel = () => {
    setEditForm({...userData});
    setIsEditing(false);
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file); // Make sure to use 'file' as the field name

    try {
      const response = await fetch('/api/user/profile-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };
  
  const StatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: "Messages", value: stats?.stats.messages || 0 },
        { label: "Friends", value: stats?.stats.contacts || 0 },
        { label: "Groups", value: stats?.stats.groups || 0 },
        { label: "Media Shared", value: stats?.stats.mediaShared || 0 }
      ].map((stat, index) => (
        <div 
          key={stat.label}
          className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-4 text-center"
        >
          <h3 className="text-gray-400 text-sm">{stat.label}</h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text mt-1">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );

  const ActivitiesList = () => (
    <div className="space-y-4">
      {stats?.activities.map((activity, index) => (
        <div key={index} className="flex items-start p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="p-2 bg-gray-800 rounded-full">
            {getActivityIcon(activity.type)}
          </div>
          <div className="ml-3">
            <p className="text-white text-sm">{activity.content}</p>
            <p className="text-gray-400 text-xs mt-1">
              {formatActivityTime(activity.time)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const FriendsList = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {stats?.onlineFriends.map((friend) => (
        <div key={friend.id} className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-indigo-800/50 to-purple-900/50 p-0.5">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
              {friend.profileImage ? (
                <Image
                  src={friend.profileImage}
                  alt={friend.name}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white font-medium">
                  {friend.name[0]}
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-white text-sm">{friend.name}</p>
          <p className="text-xs text-green-400">{friend.status}</p>
        </div>
      ))}
    </div>
  );

  const SparksSection = () => (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Your Sparks ⚡
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sparks.map(spark => (
          <div key={spark.id} className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400 mr-3">
                  <Image
                    src={`/path/to/spark-icon-${spark.level}.png`}
                    alt={`Spark Level ${spark.level}`}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium">{spark.userId}</h3>
                  <p className="text-gray-400 text-xs">
                    {spark.count} interactions
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-500">Streak: {spark.streak}</p>
                <p className="text-xs text-gray-500">Level: {spark.level}</p>
              </div>
            </div>
            
            <div className="h-2.5 bg-gray-700 rounded-full">
              <div 
                className="bg-purple-600 rounded-full"
                style={{ width: `${(spark.count / 100) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AchievementsSection = () => (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Achievements 🏆
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(achievement => (
          <div key={achievement.id} className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-4">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-400 mr-3">
                <Image
                  src={achievement.icon}
                  alt={achievement.title}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              
              <div>
                <h3 className="text-white text-sm font-medium">{achievement.title}</h3>
                <p className="text-gray-400 text-xs">
                  {achievement.progress} / {achievement.maxProgress}
                </p>
              </div>
            </div>
            
            <p className="text-gray-300 text-sm mb-2">
              {achievement.description}
            </p>
            
            {achievement.reward && (
              <div className="text-xs text-green-400">
                Reward: {achievement.reward}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
      <div className="min-h-full relative">
        {/* Background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl"></div>
          <div className="absolute top-3/4 left-1/3 w-40 h-40 bg-indigo-600/20 rounded-full filter blur-3xl"></div>
          
          {/* Animated grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="container mx-auto max-w-6xl px-4 py-6 pt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Profile Info */}
              <div className="col-span-1">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden"
                >
                  {/* Cover Photo */}
                  <div className="h-32 bg-gradient-to-r from-purple-600/30 to-cyan-600/30 relative">
                    {isEditing && (
                      <button className="absolute right-3 top-3 bg-black/50 p-2 rounded-full">
                        <Camera size={16} className="text-white" />
                      </button>
                    )}
                  </div>
                  
                  {/* Profile Picture */}
                  <div className="flex justify-center -mt-16">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-900 bg-gradient-to-br from-indigo-800/50 to-purple-900/50 p-0.5">
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                          {userData.profileImage ? (
                            <Image
                              src={userData.profileImage}
                              alt={userData.name || 'User'}
                              width={128}
                              height={128}
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-white font-medium text-4xl">
                              {userData.name?.[0] || 'U'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <label className="absolute bottom-0 right-0 cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`bg-purple-600 p-2 rounded-full text-white ${isUploading ? 'opacity-50' : ''}`}
                        >
                          {isUploading ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Camera size={16} />
                          )}
                        </motion.div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Profile Info */}
                  <div className="p-6 text-center">
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleInputChange}
                        className="text-2xl font-bold text-center w-full mb-2 bg-white/10 text-white border border-white/20 rounded-lg p-2"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-white mb-1">{userData.name}</h2>
                    )}
                    
                    <div className="space-y-4 mt-6">
                      {/* Email */}
                      <div className="flex items-center text-gray-300">
                        <Mail size={16} className="text-purple-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleInputChange}
                            className="flex-1 bg-white/10 text-white border border-white/20 rounded-lg p-2 text-sm"
                          />
                        ) : (
                          <span className="text-sm">{userData.email}</span>
                        )}
                      </div>
                      
                      {/* Phone */}
                      <div className="flex items-center text-gray-300">
                        <Phone size={16} className="text-cyan-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="phone"
                            value={editForm.phone}
                            onChange={handleInputChange}
                            className="flex-1 bg-white/10 text-white border border-white/20 rounded-lg p-2 text-sm"
                          />
                        ) : (
                          <span className="text-sm">{userData.phone}</span>
                        )}
                      </div>
                      
                      {/* Location */}
                      <div className="flex items-center text-gray-300">
                        <MapPin size={16} className="text-indigo-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="location"
                            value={editForm.location}
                            onChange={handleInputChange}
                            className="flex-1 bg-white/10 text-white border border-white/20 rounded-lg p-2 text-sm"
                          />
                        ) : (
                          <span className="text-sm">{userData.location}</span>
                        )}
                      </div>
                      
                      {/* Website */}
                      <div className="flex items-center text-gray-300">
                        <LinkIcon size={16} className="text-green-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            name="website"
                            value={editForm.website}
                            onChange={handleInputChange}
                            className="flex-1 bg-white/10 text-white border border-white/20 rounded-lg p-2 text-sm"
                          />
                        ) : (
                          <span className="text-sm">{userData.website}</span>
                        )}
                      </div>
                      
                      {/* Join Date */}
                      <div className="flex items-center text-gray-300">
                        <Calendar size={16} className="text-amber-400 mr-2" />
                        <span className="text-sm">Joined {userData.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Bio */}
                    <div className="mt-6">
                      <h3 className="text-white text-left mb-2 font-medium">Bio</h3>
                      {isEditing ? (
                        <textarea
                          name="bio"
                          value={editForm.bio}
                          onChange={handleInputChange}
                          className="w-full h-24 bg-white/10 text-white border border-white/20 rounded-lg p-3 text-sm"
                        />
                      ) : (
                        <p className="text-gray-300 text-sm text-left">{userData.bio}</p>
                      )}
                    </div>
                    
                    {/* Edit/Save Buttons */}
                    <div className="mt-6">
                      {isEditing ? (
                        <div className="flex gap-3 justify-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSave}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-purple-500/20"
                          >
                            <Save size={16} className="mr-2" />
                            Save
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCancel}
                            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
                          >
                            <X size={16} className="mr-2" />
                            Cancel
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(true)}
                          className="bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
                        >
                          <Edit size={16} className="mr-2" />
                          Edit Profile
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Right Column - Stats & Activity */}
              <div className="col-span-1 md:col-span-2 space-y-6">
                {/* Stats Cards */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <StatsCards />
                </motion.div>
                
                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                  <ActivitiesList />
                </motion.div>
                
                {/* Friends */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Friends</h3>
                    <button className="text-sm text-purple-400 hover:text-purple-300">View All</button>
                  </div>
                  
                  <FriendsList />
                </motion.div>

                {/* Sparks Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-6"
                >
                  <SparksSection />
                </motion.div>

                {/* Achievements Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-6"
                >
                  <AchievementsSection />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'MESSAGE':
      return <MessageSquare size={16} className="text-cyan-400" />;
    case 'GROUP':
      return <Users size={16} className="text-purple-400" />;
    case 'CONTACT_REQUEST':
      return <UserPlus size={16} className="text-green-400" />;
    default:
      return <Bell size={16} className="text-blue-400" />;
  }
};

const formatActivityTime = (time: Date) => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleDateString();
};