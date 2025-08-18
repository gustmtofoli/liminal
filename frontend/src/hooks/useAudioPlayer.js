import { useState, useRef, useCallback } from 'react';
import { audioApi } from '../services/audioApi';

export const useAudioPlayer = (backendConnected = false) => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [audioGenerationTime, setAudioGenerationTime] = useState(null);
  const audioRef = useRef(null);

  const playEnvironment = useCallback(async (environment, duration = 30) => {
    try {
      console.log('🚀 playEnvironment called with:', { 
        environmentName: environment.name, 
        environmentId: environment.id, 
        backendId: environment.backendId,
        backendConnected 
      });
      setLoading(true);
      setLoadingMessage('Gerando áudio...');
      const startTime = Date.now();
      
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      setCurrentAudio(environment);
      
      // Try to get real audio from backend
      if (backendConnected && environment.backendId) {
        try {
          console.log(`🎵 Requesting real audio for ${environment.name}`);
          setLoadingMessage('Sintetizando áudio...');
          
          const audioBlob = await audioApi.generateAudio(environment.backendId, duration, volume / 100);
          const generationTime = Date.now() - startTime;
          setAudioGenerationTime(generationTime);
          
          // Check if we got real audio data (WAV file) or just text
          if (audioBlob && audioBlob.size > 1000) {
            console.log(`✅ Got real audio data (${audioBlob.size} bytes) in ${generationTime}ms`);
            setLoadingMessage('Carregando áudio...');
            
            // Create audio element and play
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.volume = volume / 100;
            audio.loop = true;
            
            audio.onloadeddata = () => {
              console.log('🎵 Audio loaded, starting playback');
              setLoadingMessage('Iniciando reprodução...');
              audio.play();
              setIsPlaying(true);
            };
            
            audio.onerror = (error) => {
              console.error('Audio playback error:', error);
              setIsPlaying(false);
            };
            
            audio.onended = () => {
              setIsPlaying(false);
            };
            
            audioRef.current = audio;
            
          } else {
            console.log('📝 Backend returned text, falling back to simulation');
            setIsPlaying(true);
          }
          
        } catch (error) {
          console.warn('Backend call failed, using simulation:', error.message);
          setIsPlaying(true);
        }
      } else {
        console.log(`🎵 Playing ${environment.name} (simulation mode)`);
        setIsPlaying(true);
      }
      
    } catch (error) {
      console.error('Error in playEnvironment:', error);
      setCurrentAudio(environment);
      setIsPlaying(true);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  }, [backendConnected, volume]);

  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      console.log('⏸️ Audio paused');
    } else {
      console.log('⏸️ Audio paused (simulated)');
    }
    setIsPlaying(false);
  }, []);

  const resumeAudio = useCallback(async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        console.log('▶️ Audio resumed');
      } catch (error) {
        console.error('Error resuming audio:', error);
      }
    } else {
      console.log('▶️ Audio resumed (simulated)');
    }
    setIsPlaying(true);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      console.log('⏹️ Audio stopped');
    } else {
      console.log('⏹️ Audio stopped (simulated)');
    }
    setIsPlaying(false);
    setCurrentAudio(null);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else if (currentAudio) {
      resumeAudio();
    }
  }, [isPlaying, currentAudio, pauseAudio, resumeAudio]);

  const changeVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  }, []);

  const changeEnvironment = useCallback((environment, duration = 30) => {
    // Stop current audio
    stopAudio();
    // Play new environment
    playEnvironment(environment, duration);
  }, [stopAudio, playEnvironment]);

  return {
    currentAudio,
    isPlaying,
    volume,
    loading,
    loadingMessage,
    audioGenerationTime,
    playEnvironment,
    pauseAudio,
    resumeAudio,
    stopAudio,
    togglePlay,
    changeVolume,
    changeEnvironment
  };
};