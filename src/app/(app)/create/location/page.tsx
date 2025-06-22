'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Search, 
  Navigation, 
  Clock,
  Users,
  Star,
  Camera,
  Type,
  Settings
} from 'lucide-react';
import Image from 'next/image';

interface Location {
  id: string;
  name: string;
  address: string;
  type: 'restaurant' | 'park' | 'mall' | 'hospital' | 'school' | 'custom';
  coordinates: {
    lat: number;
    lng: number;
  };
  distance?: number;
  rating?: number;
  photos?: string[];
  isPopular?: boolean;
}

interface LocationPost {
  locationId: string;
  caption: string;
  privacy: 'public' | 'friends' | 'close_friends';
  photo?: File;
  backgroundColor?: string;
  textContent?: string;
}

export default function LocationCreationPage() {
  const router = useRouter();
  
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState<Location[]>([]);
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'close_friends'>('friends');
  const [postType, setPostType] = useState<'location_only' | 'with_photo' | 'with_text'>('location_only');
  const [textContent, setTextContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('from-blue-500 to-purple-500');
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const backgroundColors = [
    'from-blue-500 to-purple-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-teal-500',
    'from-yellow-500 to-orange-500',
    'from-red-500 to-pink-500',
    'from-indigo-500 to-purple-500',
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (currentLocation) {
      fetchNearbyLocations(currentLocation.lat, currentLocation.lng);
    }
  }, [currentLocation]);

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });

      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setLocationPermission('granted');
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationPermission('denied');
    }
  };

  const fetchNearbyLocations = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/locations/nearby?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      setNearbyLocations(Array.isArray(data.locations) ? data.locations : []);
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      setNearbyLocations([]);
    }
  };

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      if (currentLocation) {
        fetchNearbyLocations(currentLocation.lat, currentLocation.lng);
      }
      return;
    }
    try {
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setNearbyLocations(Array.isArray(data.locations) ? data.locations : []);
    } catch (error) {
      console.error('Error searching locations:', error);
      setNearbyLocations([]);
    }
  };

  useEffect(() => {
    searchLocations(searchQuery);
  }, [searchQuery]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handlePost = async () => {
    if (!selectedLocation) return;

    setLoading(true);
    try {
      const postData: LocationPost = {
        locationId: selectedLocation.id,
        caption,
        privacy,
        textContent: postType === 'with_text' ? textContent : undefined,
        backgroundColor: postType === 'with_text' ? backgroundColor : undefined,
      };

      console.log('Posting location status:', postData);
      
      // Always redirect to reels page after posting
      router.push('/reels');
    } catch (error) {
      console.error('Error posting location status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return '🍽️';
      case 'park': return '🌳';
      case 'mall': return '🛍️';
      case 'hospital': return '🏥';
      case 'school': return '🏫';
      default: return '📍';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/30 backdrop-blur-lg p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Share Location</h1>
          </div>
          
          {selectedLocation && (
            <button
              onClick={handlePost}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full font-medium disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Share'}
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Current Location */}
        {locationPermission === 'granted' && currentLocation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium">Current Location</h3>
                <p className="text-sm text-gray-300">
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Location Permission Denied */}
        {locationPermission === 'denied' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-600/20 rounded-xl border border-red-500/30"
          >
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-red-400" />
              <div>
                <h3 className="font-medium text-red-400">Location Access Denied</h3>
                <p className="text-sm text-gray-300">Enable location to see nearby places</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Post Type Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">How do you want to share?</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPostType('location_only')}
              className={`p-3 rounded-lg border transition-all ${
                postType === 'location_only'
                  ? 'bg-blue-600/20 border-blue-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <MapPin className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Location Only</span>
            </button>
            
            <button
              onClick={() => setPostType('with_photo')}
              className={`p-3 rounded-lg border transition-all ${
                postType === 'with_photo'
                  ? 'bg-blue-600/20 border-blue-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <Camera className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">With Photo</span>
            </button>
            
            <button
              onClick={() => setPostType('with_text')}
              className={`p-3 rounded-lg border transition-all ${
                postType === 'with_text'
                  ? 'bg-blue-600/20 border-blue-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <Type className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">With Text</span>
            </button>
          </div>
        </div>

        {/* Text Content (if selected) */}
        {postType === 'with_text' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 space-y-4"
          >
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="What's happening at this location?"
              className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
              rows={3}
            />
            
            {/* Background Colors */}
            <div>
              <h4 className="text-sm font-medium mb-2">Background Color</h4>
              <div className="flex space-x-2">
                {backgroundColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackgroundColor(color)}
                    className={`w-10 h-10 rounded-full bg-gradient-to-r ${color} border-2 ${
                      backgroundColor === color ? 'border-white' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Privacy Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Who can see this?</h3>
          <div className="space-y-2">
            <button
              onClick={() => setPrivacy('public')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                privacy === 'public'
                  ? 'bg-blue-600/20 border-blue-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-medium">Public</p>
                <p className="text-sm text-gray-400">Anyone can see this</p>
              </div>
            </button>
            
            <button
              onClick={() => setPrivacy('friends')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                privacy === 'friends'
                  ? 'bg-blue-600/20 border-blue-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-medium">Friends</p>
                <p className="text-sm text-gray-400">Only your friends can see this</p>
              </div>
            </button>
            
            <button
              onClick={() => setPrivacy('close_friends')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                privacy === 'close_friends'
                  ? 'bg-blue-600/20 border-blue-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-medium">Close Friends</p>
                <p className="text-sm text-gray-400">Only close friends can see this</p>
              </div>
            </button>
          </div>
        </div>

        {/* Caption */}
        <div className="mb-6">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            className="w-full p-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            rows={2}
          />
        </div>

        {/* Nearby Locations */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Nearby Places</h3>
          
          {nearbyLocations.map((location) => (
            <motion.div
              key={location.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLocationSelect(location)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedLocation?.id === location.id
                  ? 'bg-blue-600/20 border-blue-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-2xl">
                  {getLocationIcon(location.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{location.name}</h4>
                    {location.isPopular && (
                      <div className="px-2 py-1 bg-red-500 rounded-full text-xs">
                        Popular
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{location.address}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    {location.distance && (
                      <span className="text-xs text-gray-500">
                        {location.distance} km away
                      </span>
                    )}
                    {location.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500">{location.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}