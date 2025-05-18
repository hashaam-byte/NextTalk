'use client';

import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean | null;
  latency: number | null;
  throughput: number | null;
}

interface Connection {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
}

export function useNetworkStatus(): NetworkStatusAPI {
  // Default network status state
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
    connectionType: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
    saveData: null,
    latency: null,
    throughput: null
  });

  // Check if the Navigator API is available
  const isNavigatorAvailable = typeof navigator !== 'undefined';
  
  // Function to check connection by pinging the server
  const pingServer = async (): Promise<number> => {
    try {
      const startTime = performance.now();
      
      // Make a minimal fetch request to server
      const response = await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error('Server ping failed');
      }
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      // Update latency state
      setNetworkStatus(prev => ({
        ...prev,
        latency
      }));
      
      return latency;
    } catch (error) {
      console.error('Error pinging server:', error);
      setNetworkStatus(prev => ({
        ...prev,
        latency: null
      }));
      return -1;
    }
  };

  // Function to check connection status
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Basic check for navigator.onLine
      const onlineStatus = isNavigatorAvailable ? navigator.onLine : true;
      
      // If basic check says we're offline, no need to ping server
      if (!onlineStatus) {
        setNetworkStatus(prev => ({
          ...prev,
          isOnline: false
        }));
        return false;
      }
      
      // Double check with ping
      const pingResult = await pingServer();
      const isConnected = pingResult > 0;
      
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: isConnected
      }));
      
      return isConnected;
    } catch (error) {
      console.error('Error checking connection:', error);
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false
      }));
      return false;
    }
  }, []);

  // Function to get detailed network information
  const getNetworkCapabilities = useCallback((): NetworkStatus => {
    // If Navigator API is not available, return current state
    if (!isNavigatorAvailable) {
      return networkStatus;
    }

    // Get Network Information API if available
    const connection = (navigator as any).connection as Connection;
    
    if (!connection) {
      return {
        ...networkStatus,
        isOnline: navigator.onLine
      };
    }
    
    // Build enhanced network status object
    const enhancedStatus: NetworkStatus = {
      isOnline: navigator.onLine,
      connectionType: connection.type || null,
      effectiveType: connection.effectiveType || null,
      downlink: connection.downlink || null,
      rtt: connection.rtt || null,
      saveData: connection.saveData || null,
      latency: networkStatus.latency,
      throughput: connection.downlink ? connection.downlink * 1000 / 8 : null // Convert Mbps to KBps
    };
    
    // Update state with the new information
    setNetworkStatus(enhancedStatus);
    
    return enhancedStatus;
  }, [isNavigatorAvailable, networkStatus]);

  // Effect for initial setup and event listeners
  useEffect(() => {
    if (!isNavigatorAvailable) {
      return;
    }
    
    // Check connection immediately
    checkConnection();
    
    // Get detailed information
    getNetworkCapabilities();
    
    // Set up offline/online event listeners
    const handleOnline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: true
      }));
      pingServer(); // Update latency
      getNetworkCapabilities(); // Update other metrics
    };
    
    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false
      }));
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen to network information changes if available
    const connection: Connection = (navigator as any).connection || 
                            (navigator as any).mozConnection || 
                            (navigator as any).webkitConnection;
                            
    if (connection) {
      connection.addEventListener('change', getNetworkCapabilities);
    }
    
    // Set up periodic checking
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        pingServer();
        getNetworkCapabilities();
      }
    }, 30000); // Check every 30 seconds
    
    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', getNetworkCapabilities);
      }
      
      clearInterval(intervalId);
    };
  }, [isNavigatorAvailable, checkConnection, getNetworkCapabilities]);

  return {
    ...networkStatus,
    checkConnection,
    pingServer,
    getNetworkCapabilities
  };
}

export default useNetworkStatus;