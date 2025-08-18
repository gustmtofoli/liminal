import { useState, useEffect, useCallback } from 'react';
import { audioApi } from '../services/audioApi';
import { useAPIHealth } from './useAPIHealth';

export const useAudioEnvironments = () => {
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  
  // Monitor API health continuously
  const { isOnline, lastCheckTime, consecutiveFailures, manualCheck } = useAPIHealth(30000);

  // Fallback data in case backend is not available
  const fallbackEnvironments = [
    {
      id: 1,
      backendId: 'rain',
      name: 'Chuva Suave',
      description: 'Som relaxante de chuva leve caindo',
      icon: '🌧️',
      gradient: 'from-blue-600 to-indigo-800'
    },
    {
      id: 2,
      backendId: 'forest',
      name: 'Floresta Tropical',
      description: 'Pássaros cantando e folhas balançando',
      icon: '🌲',
      gradient: 'from-green-600 to-emerald-800'
    },
    {
      id: 3,
      backendId: 'ocean',
      name: 'Oceano Calmo',
      description: 'Ondas suaves tocando a praia',
      icon: '🌊',
      gradient: 'from-cyan-600 to-blue-800'
    },
    {
      id: 4,
      backendId: 'fire',
      name: 'Fogueira Noturna',
      description: 'Crepitar reconfortante das chamas',
      icon: '🔥',
      gradient: 'from-orange-600 to-red-700'
    },
    {
      id: 5,
      backendId: 'wind',
      name: 'Vento Suave',
      description: 'Brisa gentil através das árvores',
      icon: '💨',
      gradient: 'from-slate-600 to-gray-800'
    },
    {
      id: 6,
      backendId: 'frequency',
      name: 'Frequência 432Hz',
      description: 'Tom puro para meditação profunda',
      icon: '🎼',
      gradient: 'from-purple-600 to-violet-800'
    },
    {
      id: 7,
      backendId: 'cafe',
      name: 'Café Urbano',
      description: 'Ambiente aconchegante de cafeteria',
      icon: '☕',
      gradient: 'from-amber-700 to-brown-800'
    },
    {
      id: 8,
      backendId: 'storm',
      name: 'Tempestade Distante',
      description: 'Trovões suaves ao longe',
      icon: '⚡',
      gradient: 'from-gray-700 to-slate-900'
    }
  ];

  const loadEnvironments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the health status from continuous monitoring
      if (!isOnline) {
        throw new Error('API is offline');
      }
      
      setBackendConnected(true);

      // If backend is available, fetch environments
      const backendEnvironments = await audioApi.getEnvironments();
      
      // Map backend data to frontend format with proper ID mapping
      const idMapping = {
        'rain': 1,
        'forest': 2, 
        'ocean': 3,
        'fire': 4,
        'wind': 5,
        'frequency': 6,
        'cafe': 7,
        'storm': 8
      };
      
      const mappedEnvironments = backendEnvironments.map((env) => ({
        id: idMapping[env.id] || 1, // Use consistent ID mapping
        backendId: env.id, // Keep original string ID for API calls
        name: env.name,
        description: env.description,
        icon: env.icon,
        gradient: env.gradient,
        type: env.type
      }));

      setEnvironments(mappedEnvironments);
    } catch (error) {
      console.warn('Backend not available, using fallback data:', error.message);
      setBackendConnected(false);
      setEnvironments(fallbackEnvironments);
      setError(isOnline ? 'Failed to load environments' : 'API offline - using offline mode');
    } finally {
      setLoading(false);
    }
  }, [isOnline, fallbackEnvironments]);

  useEffect(() => {
    loadEnvironments();
  }, [loadEnvironments]);

  const retryConnection = async () => {
    await manualCheck(); // Trigger manual health check
    loadEnvironments();
  };

  // Update backend connection status based on health monitoring
  useEffect(() => {
    setBackendConnected(isOnline);
    if (!isOnline && environments.length > 0 && environments[0].backendId) {
      // Switch to fallback when API goes offline
      setEnvironments(fallbackEnvironments);
      setError('API offline - switched to offline mode');
    } else if (isOnline && !backendConnected) {
      // Reload environments when API comes back online
      loadEnvironments();
    }
  }, [isOnline, backendConnected, environments, fallbackEnvironments, loadEnvironments]);

  return {
    environments,
    loading,
    error,
    backendConnected: isOnline,
    retryConnection,
    apiHealth: {
      isOnline,
      lastCheckTime,
      consecutiveFailures
    }
  };
};