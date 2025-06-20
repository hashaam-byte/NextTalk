'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, Music2, Chrome, Youtube, Tv, MessageCircle, 
  Twitter, Instagram, MessageSquare, FileText, Twitch,
  Play, ShoppingCart, Camera, Phone, Video, 
  Gamepad2, BookOpen, Calculator, Clock, Settings, Figma,
  Calendar, Zap, Cloud, Edit3, Briefcase, Heart, Star, Slack, Mail, Github,
  Headphones, Radio, Palette, Code, Database,
  Shield, Download, Upload, Search, Globe, Lock,
  CreditCard, Truck, Utensils, Coffee, MapPin,
  Wifi, Battery, Volume2, Sun, Moon, Eye,
  Layers, Box, Archive, Folder, Image, Film,
  Mic, Speaker, Pause, SkipForward, Repeat,
  Home, Building, Car, Plane, Train, Ship,
  PenTool, Scissors, Ruler, Compass, Target, Flag,
  Award, Trophy, Medal, Gift, Bookmark, Tag,
  Bell, AlertCircle, CheckCircle, XCircle, Info,
  Plus, Minus, X, Check, ArrowRight, ArrowLeft,
  Maximize, Minimize, Refresh, RotateCcw, Copy,
  Save, Trash2, Edit2, Share, ExternalLink, Link,
  Paperclip, Printer, Monitor, Smartphone,
  Tablet, Watch, Keyboard, Mouse, HardDrive, Cpu,
  Notebook, AppWindow, Map
} from 'lucide-react';

interface App {
  id: string;
  name: string;
  icon: any;
  color: string;
  url: string;
  packageName?: string;
  category: string;
}

export default function AppSelectorPage() {
  const [selectedApps, setSelectedApps] = useState<App[]>([]);
  const [installedApps, setInstalledApps] = useState<Set<string>>(() => new Set());
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<JSX.Element | null>(null);

  const availableApps: App[] = [
    // Social Media
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500', url: 'instagram://', packageName: 'com.instagram.android', category: 'Social' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'bg-blue-400', url: 'twitter://', packageName: 'com.twitter.android', category: 'Social' },
    { id: 'facebook', name: 'Facebook', icon: MessageCircle, color: 'bg-blue-600', url: 'fb://', packageName: 'com.facebook.katana', category: 'Social' },
    { id: 'tiktok', name: 'TikTok', icon: Video, color: 'bg-black', url: 'tiktok://', packageName: 'com.zhiliaoapp.musically', category: 'Social' },
    { id: 'snapchat', name: 'Snapchat', icon: Camera, color: 'bg-yellow-400', url: 'snapchat://', packageName: 'com.snapchat.android', category: 'Social' },
    { id: 'linkedin', name: 'LinkedIn', icon: Briefcase, color: 'bg-blue-700', url: 'linkedin://', packageName: 'com.linkedin.android', category: 'Social' },
    { id: 'reddit', name: 'Reddit', icon: MessageCircle, color: 'bg-orange-600', url: 'reddit://', packageName: 'com.reddit.frontpage', category: 'Social' },
    { id: 'telegram', name: 'Telegram', icon: MessageCircle, color: 'bg-blue-500', url: 'tg://', packageName: 'org.telegram.messenger', category: 'Social' },
    { id: 'discord', name: 'Discord', icon: MessageSquare, color: 'bg-indigo-500', url: 'discord://', packageName: 'com.discord', category: 'Social' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500', url: 'whatsapp://', packageName: 'com.whatsapp', category: 'Social' },
    
    // Entertainment & Media
    { id: 'netflix', name: 'Netflix', icon: Tv, color: 'bg-red-600', url: 'netflix://', packageName: 'com.netflix.mediaclient', category: 'Entertainment' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-red-500', url: 'youtube://', packageName: 'com.google.android.youtube', category: 'Entertainment' },
    { id: 'spotify', name: 'Spotify', icon: Music2, color: 'bg-green-500', url: 'spotify://', packageName: 'com.spotify.music', category: 'Entertainment' },
    { id: 'apple-music', name: 'Apple Music', icon: Music2, color: 'bg-red-500', url: 'music://', packageName: 'com.apple.android.music', category: 'Entertainment' },
    { id: 'disney-plus', name: 'Disney+', icon: Star, color: 'bg-blue-600', url: 'disneyplus://', packageName: 'com.disney.disneyplus', category: 'Entertainment' },
    { id: 'hulu', name: 'Hulu', icon: Tv, color: 'bg-green-400', url: 'hulu://', packageName: 'com.hulu.plus', category: 'Entertainment' },
    { id: 'amazon-prime', name: 'Prime Video', icon: Video, color: 'bg-blue-900', url: 'primevideo://', packageName: 'com.amazon.avod.thirdpartyclient', category: 'Entertainment' },
    { id: 'twitch', name: 'Twitch', icon: Twitch, color: 'bg-purple-600', url: 'twitch://', packageName: 'tv.twitch.android.app', category: 'Entertainment' },
    { id: 'soundcloud', name: 'SoundCloud', icon: Headphones, color: 'bg-orange-500', url: 'soundcloud://', packageName: 'com.soundcloud.android', category: 'Entertainment' },
    { id: 'pandora', name: 'Pandora', icon: Radio, color: 'bg-blue-500', url: 'pandora://', packageName: 'com.pandora.android', category: 'Entertainment' },
    
    // Productivity & Work
    { id: 'notion', name: 'Notion', icon: Notebook, color: 'bg-gray-500', url: 'notion://', packageName: 'notion.id', category: 'Productivity' },
    { id: 'slack', name: 'Slack', icon: Slack, color: 'bg-purple-500', url: 'slack://', packageName: 'com.Slack', category: 'Productivity' },
    { id: 'microsoft-teams', name: 'Teams', icon: Video, color: 'bg-blue-500', url: 'msteams://', packageName: 'com.microsoft.teams', category: 'Productivity' },
    { id: 'zoom', name: 'Zoom', icon: Video, color: 'bg-blue-400', url: 'zoomus://', packageName: 'us.zoom.videomeetings', category: 'Productivity' },
    { id: 'gmail', name: 'Gmail', icon: Mail, color: 'bg-red-500', url: 'googlegmail://', packageName: 'com.google.android.gm', category: 'Productivity' },
    { id: 'outlook', name: 'Outlook', icon: Mail, color: 'bg-blue-600', url: 'ms-outlook://', packageName: 'com.microsoft.office.outlook', category: 'Productivity' },
    { id: 'google-drive', name: 'Drive', icon: Cloud, color: 'bg-blue-500', url: 'googledrive://', packageName: 'com.google.android.apps.docs', category: 'Productivity' },
    { id: 'dropbox', name: 'Dropbox', icon: Cloud, color: 'bg-blue-400', url: 'dbapi-1://', packageName: 'com.dropbox.android', category: 'Productivity' },
    { id: 'onedrive', name: 'OneDrive', icon: Cloud, color: 'bg-blue-600', url: 'ms-onedrive://', packageName: 'com.microsoft.skydrive', category: 'Productivity' },
    { id: 'trello', name: 'Trello', icon: Layers, color: 'bg-blue-500', url: 'trello://', packageName: 'com.trello', category: 'Productivity' },
    { id: 'asana', name: 'Asana', icon: CheckCircle, color: 'bg-red-500', url: 'asana://', packageName: 'com.asana.app', category: 'Productivity' },
    { id: 'evernote', name: 'Evernote', icon: FileText, color: 'bg-green-600', url: 'evernote://', packageName: 'com.evernote', category: 'Productivity' },
    
    // Development & Design
    { id: 'github', name: 'GitHub', icon: Github, color: 'bg-gray-800', url: 'github://', packageName: 'com.github.android', category: 'Development' },
    { id: 'figma', name: 'Figma', icon: Figma, color: 'bg-purple-500', url: 'figma://', packageName: 'com.figma.mirror', category: 'Development' },
    { id: 'vscode', name: 'VS Code', icon: Code, color: 'bg-blue-600', url: 'vscode://', packageName: 'com.microsoft.vscode', category: 'Development' },
    { id: 'adobe-cc', name: 'Adobe CC', icon: Palette, color: 'bg-red-600', url: 'adobe://', packageName: 'com.adobe.creativeapps', category: 'Development' },
    { id: 'sketch', name: 'Sketch', icon: PenTool, color: 'bg-orange-500', url: 'sketch://', packageName: 'com.bohemiancoding.sketch3', category: 'Development' },
    { id: 'canva', name: 'Canva', icon: Palette, color: 'bg-purple-400', url: 'canva://', packageName: 'com.canva.editor', category: 'Development' },
    
    // Shopping & Finance
    { id: 'amazon', name: 'Amazon', icon: ShoppingCart, color: 'bg-orange-500', url: 'amazon://', packageName: 'com.amazon.mShop.android.shopping', category: 'Shopping' },
    { id: 'ebay', name: 'eBay', icon: ShoppingCart, color: 'bg-blue-600', url: 'ebay://', packageName: 'com.ebay.mobile', category: 'Shopping' },
    { id: 'paypal', name: 'PayPal', icon: CreditCard, color: 'bg-blue-500', url: 'paypal://', packageName: 'com.paypal.android.p2pmobile', category: 'Shopping' },
    { id: 'venmo', name: 'Venmo', icon: CreditCard, color: 'bg-blue-400', url: 'venmo://', packageName: 'com.venmo', category: 'Shopping' },
    { id: 'cashapp', name: 'Cash App', icon: CreditCard, color: 'bg-green-500', url: 'cashme://', packageName: 'com.squareup.cash', category: 'Shopping' },
    { id: 'etsy', name: 'Etsy', icon: Heart, color: 'bg-orange-600', url: 'etsy://', packageName: 'com.etsy.android', category: 'Shopping' },
    { id: 'shopify', name: 'Shopify', icon: ShoppingCart, color: 'bg-green-600', url: 'shopify://', packageName: 'com.shopify.mobile', category: 'Shopping' },
    
    // Food & Delivery
    { id: 'uber-eats', name: 'Uber Eats', icon: Utensils, color: 'bg-green-500', url: 'ubereats://', packageName: 'com.ubercab.eats', category: 'Food' },
    { id: 'doordash', name: 'DoorDash', icon: Truck, color: 'bg-red-500', url: 'doordash://', packageName: 'com.dd.doordash', category: 'Food' },
    { id: 'grubhub', name: 'Grubhub', icon: Utensils, color: 'bg-orange-500', url: 'grubhub://', packageName: 'com.grubhub.android', category: 'Food' },
    { id: 'starbucks', name: 'Starbucks', icon: Coffee, color: 'bg-green-600', url: 'starbucks://', packageName: 'com.starbucks.mobilecard', category: 'Food' },
    { id: 'mcdonalds', name: 'McDonald\'s', icon: Utensils, color: 'bg-yellow-500', url: 'mcdonalds://', packageName: 'com.mcdonalds.app', category: 'Food' },
    
    // Transportation
    { id: 'uber', name: 'Uber', icon: Car, color: 'bg-black', url: 'uber://', packageName: 'com.ubercab', category: 'Transportation' },
    { id: 'lyft', name: 'Lyft', icon: Car, color: 'bg-pink-500', url: 'lyft://', packageName: 'me.lyft.android', category: 'Transportation' },
    { id: 'google-maps', name: 'Maps', icon: Map, color: 'bg-green-500', url: 'googlemaps://', packageName: 'com.google.android.apps.maps', category: 'Transportation' },
    { id: 'waze', name: 'Waze', icon: MapPin, color: 'bg-blue-500', url: 'waze://', packageName: 'com.waze', category: 'Transportation' },
    { id: 'apple-maps', name: 'Apple Maps', icon: Map, color: 'bg-blue-600', url: 'maps://', packageName: 'com.apple.Maps', category: 'Transportation' },
    
    // Health & Fitness
    { id: 'fitness', name: 'Fitness', icon: Heart, color: 'bg-red-500', url: 'fitness://', packageName: 'com.apple.Health', category: 'Health' },
    { id: 'nike-run', name: 'Nike Run', icon: Target, color: 'bg-orange-500', url: 'nikerun://', packageName: 'com.nike.plusgps', category: 'Health' },
    { id: 'strava', name: 'Strava', icon: Trophy, color: 'bg-orange-600', url: 'strava://', packageName: 'com.strava', category: 'Health' },
    { id: 'myfitnesspal', name: 'MyFitnessPal', icon: Target, color: 'bg-blue-500', url: 'myfitnesspal://', packageName: 'com.myfitnesspal.android', category: 'Health' },
    
    // Utilities
    { id: 'calculator', name: 'Calculator', icon: Calculator, color: 'bg-gray-600', url: 'calculator://', packageName: 'com.apple.calculator', category: 'Utilities' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'bg-blue-500', url: 'calendar://', packageName: 'com.apple.mobilecal', category: 'Utilities' },
    { id: 'clock', name: 'Clock', icon: Clock, color: 'bg-gray-500', url: 'clock://', packageName: 'com.apple.mobiletimer', category: 'Utilities' },
    { id: 'weather', name: 'Weather', icon: Sun, color: 'bg-blue-400', url: 'weather://', packageName: 'com.apple.weather', category: 'Utilities' },
    { id: 'notes', name: 'Notes', icon: FileText, color: 'bg-yellow-500', url: 'mobilenotes://', packageName: 'com.apple.mobilenotes', category: 'Utilities' },
    { id: 'camera', name: 'Camera', icon: Camera, color: 'bg-gray-700', url: 'camera://', packageName: 'com.apple.camera', category: 'Utilities' },
    { id: 'photos', name: 'Photos', icon: Image, color: 'bg-blue-500', url: 'photos://', packageName: 'com.apple.mobileslideshow', category: 'Utilities' },
    { id: 'settings', name: 'Settings', icon: Settings, color: 'bg-gray-600', url: 'prefs://', packageName: 'com.apple.Preferences', category: 'Utilities' },
    
    // Browsers
    { id: 'chrome', name: 'Chrome', icon: Chrome, color: 'bg-blue-500', url: 'https://google.com', category: 'Browsers' },
    { id: 'safari', name: 'Safari', icon: Globe, color: 'bg-blue-600', url: 'http://', packageName: 'com.apple.mobilesafari', category: 'Browsers' },
    { id: 'firefox', name: 'Firefox', icon: Globe, color: 'bg-orange-500', url: 'firefox://', packageName: 'org.mozilla.firefox', category: 'Browsers' },
    { id: 'edge', name: 'Edge', icon: Globe, color: 'bg-blue-600', url: 'microsoft-edge://', packageName: 'com.microsoft.emmx', category: 'Browsers' },
    
    // Games
    { id: 'steam', name: 'Steam', icon: Gamepad2, color: 'bg-blue-800', url: 'steam://', packageName: 'com.valvesoftware.android.steam.community', category: 'Games' },
    { id: 'epic-games', name: 'Epic Games', icon: Gamepad2, color: 'bg-gray-800', url: 'epic://', packageName: 'com.epicgames.launcher', category: 'Games' },
    { id: 'xbox', name: 'Xbox', icon: Gamepad2, color: 'bg-green-600', url: 'xbox://', packageName: 'com.microsoft.xboxone.smartglass', category: 'Games' },
    { id: 'playstation', name: 'PlayStation', icon: Gamepad2, color: 'bg-blue-700', url: 'playstation://', packageName: 'com.scee.psxandroid', category: 'Games' },
    
    // News & Reading
    { id: 'apple-news', name: 'News', icon: BookOpen, color: 'bg-red-500', url: 'applenews://', packageName: 'com.apple.news', category: 'News' },
    { id: 'kindle', name: 'Kindle', icon: BookOpen, color: 'bg-orange-600', url: 'kindle://', packageName: 'com.amazon.kindle', category: 'News' },
    { id: 'medium', name: 'Medium', icon: Edit3, color: 'bg-green-600', url: 'medium://', packageName: 'com.medium.reader', category: 'News' },
    { id: 'pocket', name: 'Pocket', icon: Bookmark, color: 'bg-red-500', url: 'pocket://', packageName: 'com.ideashower.readitlater.pro', category: 'News' }
  ];

  const categories = ['All', 'Social', 'Entertainment', 'Productivity', 'Development', 'Shopping', 'Food', 'Transportation', 'Health', 'Utilities', 'Browsers', 'Games', 'News'];

  const filteredApps = useMemo(() => {
    let apps = activeCategory === 'All' ? availableApps : availableApps.filter(app => app.category === activeCategory);
    
    if (searchQuery) {
      apps = apps.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return apps;
  }, [activeCategory, availableApps, searchQuery]);

  useEffect(() => {
    // Simulate fetching user apps
    const fetchUserApps = async () => {
      try {
        // In a real app, this would be an API call
        // For demo purposes, we'll use localStorage
        const savedApps = typeof window !== 'undefined' ? localStorage.getItem('userApps') : null;
        if (savedApps) {
          const userAppIds = JSON.parse(savedApps);
          const matchedApps = availableApps.filter(app => userAppIds.includes(app.id));
          setSelectedApps(matchedApps);
        }
      } catch (error) {
        console.error('Error fetching user apps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserApps();
  }, []);

  const saveUserApps = async (apps: App[]) => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll use localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userApps', JSON.stringify(apps.map(app => app.id)));
      }
    } catch (error) {
      console.error('Error saving user apps:', error);
    }
  };

  const toggleApp = (app: App) => {
    const newSelected = selectedApps.find(a => a.id === app.id)
      ? selectedApps.filter(a => a.id !== app.id)
      : [...selectedApps, app];
    
    setSelectedApps(newSelected);
    saveUserApps(newSelected);
  };

  const requestDownload = async (app: App) => {
    if (!installedApps.has(app.id)) {
      const confirmed = await new Promise((resolve) => {
        const modal = (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Download {app.name}?</h3>
              <p className="text-gray-300 mb-6">
                This app isn't installed on your device. Would you like to download it from the store?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => resolve(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => resolve(true)}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                >
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        );
        // Show modal
        setModal(modal);
      });

      if (confirmed) {
        // Determine platform and store URL
        const storeUrl = getPlatformStoreUrl(app);
        window.open(storeUrl, '_blank');
      }
    }
    return installedApps.has(app.id);
  };

  const getPlatformStoreUrl = (app: App) => {
    const platform = /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' : 
                    /Android/.test(navigator.userAgent) ? 'android' : 'web';
    
    switch (platform) {
      case 'ios':
        return `https://apps.apple.com/app/${app.packageName}`;
      case 'android':
        return `https://play.google.com/store/apps/details?id=${app.packageName}`;
      default:
        return app.url;
    }
  };

  const launchApp = async (app: App) => {
    try {
      const isInstalled = await requestDownload(app);
      if (!isInstalled) {
        return;
      }

      // Try to open app using URL scheme
      window.location.href = app.url;
      
      // Fallback for web URLs
      setTimeout(() => {
        if (app.url.startsWith('http')) {
          window.open(app.url, '_blank');
        }
      }, 2500);
    } catch (error) {
      console.error('Error launching app:', error);
    }
  };

  useEffect(() => {
    const installed = new Set<string>();
    const commonApps = ['chrome', 'gmail', 'youtube', 'spotify', 'instagram', 'twitter', 'netflix'];
    for (const appId of commonApps) {
      installed.add(appId);
    }
    setInstalledApps(installed);
  }, []);

  const renderAppGrid = () => {
    return filteredApps.map((app, index) => (
      <motion.div
        key={`${app.id}-${index}`}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3, delay: index * 0.02 }}
        className="relative group"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleApp(app)}
          className={`w-full p-4 rounded-2xl flex flex-col items-center space-y-3 transition-all duration-300 relative ${
            selectedApps.find(a => a.id === app.id)
              ? `${app.color} bg-opacity-20 border-2 border-white/30 shadow-lg`
              : 'bg-white/5 hover:bg-white/10 border-2 border-transparent hover:border-white/10'
          }`}
        >
          <div className="relative">
            <app.icon className={`w-8 h-8 ${
              selectedApps.find(a => a.id === app.id) ? 'text-white' : 'text-gray-400'
            }`} />
            {installedApps.has(app.id) && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            )}
          </div>
          <span className={`text-sm text-center leading-tight ${
            selectedApps.find(a => a.id === app.id) ? 'text-white font-medium' : 'text-gray-400'
          }`}>
            {app.name}
          </span>
          {selectedApps.find(a => a.id === app.id) && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -left-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </motion.button>
      </motion.div>
    ));
  };

  const renderCategories = () => {
    return categories.map(category => (
      <motion.button
        key={category}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setActiveCategory(category)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          activeCategory === category
            ? 'bg-purple-500 text-white shadow-lg'
            : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
        }`}
      >
        {category}
      </motion.button>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading apps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <AppWindow className="w-8 h-8 text-purple-500" />
                App Selector
              </h1>
              <p className="text-gray-400 mt-1">
                Manage your quick access apps ({selectedApps.length} selected)
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3">
            {renderCategories()}
          </div>
        </div>
      </div>

      {/* Selected Apps Quick Access */}
      <AnimatePresence>
        {selectedApps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-32 z-30 bg-gray-800/80 backdrop-blur-xl border-b border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Quick Access ({selectedApps.length})
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {selectedApps.slice(0, 12).map(app => (
                  <motion.button
                    key={`selected-${app.id}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => launchApp(app)}
                    className={`flex-shrink-0 p-3 rounded-xl ${app.color} bg-opacity-20 hover:bg-opacity-30 transition-all border border-white/20`}
                    title={app.name}
                  >
                   <app.icon className="w-6 h-6 text-white" />
                  </motion.button>
                ))}
                {selectedApps.length > 12 && (
                  <div className="flex-shrink-0 p-3 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-sm">
                    +{selectedApps.length - 12}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Apps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {renderAppGrid()}
        </div>

        {/* Empty State */}
        {filteredApps.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No apps found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-16 border-t border-white/10 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div>
              Showing {filteredApps.length} of {availableApps.length} apps
            </div>
            <div className="flex items-center gap-4">
              <span>{selectedApps.length} selected</span>
              <span>•</span>
              <span>{installedApps.size} installed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {modal}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}