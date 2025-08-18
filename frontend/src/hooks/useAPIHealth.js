import { useState, useEffect, useRef, useCallback } from 'react';
import { audioApi } from '../services/audioApi';

export const useAPIHealth = (checkInterval = 30000) => { // Check every 30 seconds
  const [isOnline, setIsOnline] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const intervalRef = useRef(null);
  const isCheckingRef = useRef(false);

  const performHealthCheck = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) return;
    
    isCheckingRef.current = true;
    
    try {
      console.log('🏥 Performing health check...');
      await audioApi.healthCheck();
      
      // Success - reset failure count and mark as online
      setConsecutiveFailures(0);
      setIsOnline(true);
      setLastCheckTime(new Date());
      console.log('✅ Health check passed');
      
    } catch (error) {
      console.warn('❌ Health check failed:', error.message);
      
      setConsecutiveFailures(prev => {
        const newCount = prev + 1;
        
        // Mark as offline after 2 consecutive failures
        if (newCount >= 2) {
          setIsOnline(false);
          console.warn('🚨 API marked as offline after', newCount, 'consecutive failures');
        }
        
        return newCount;
      });
      
      setLastCheckTime(new Date());
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  // Start health check monitoring
  const startMonitoring = useCallback(() => {
    if (intervalRef.current) return; // Already monitoring

    console.log('🔄 Starting API health monitoring (every', checkInterval / 1000, 'seconds)');
    
    // Perform initial check
    performHealthCheck();
    
    // Set up periodic checks
    intervalRef.current = setInterval(performHealthCheck, checkInterval);
  }, [performHealthCheck, checkInterval]);

  // Stop health check monitoring
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      console.log('⏹️ Stopping API health monitoring');
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Manual health check (for retry button)
  const manualCheck = useCallback(async () => {
    console.log('🔄 Manual health check triggered');
    await performHealthCheck();
  }, [performHealthCheck]);

  // Start monitoring on mount
  useEffect(() => {
    startMonitoring();
    
    // Cleanup on unmount
    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  // Also check when browser comes back online
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Browser came back online, checking API health');
      performHealthCheck();
    };

    const handleOffline = () => {
      console.log('🚫 Browser went offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [performHealthCheck]);

  return {
    isOnline,
    lastCheckTime,
    consecutiveFailures,
    manualCheck,
    startMonitoring,
    stopMonitoring
  };
};