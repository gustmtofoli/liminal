import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Timer, Shuffle, Grid, List, SkipBack, SkipForward, Minimize2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Componente de Card para cada ambiente sonoro (Grid View)
const SoundCardGrid = ({ sound, isActive, onSelect, isPlaying }) => (
  <div 
    onClick={() => onSelect(sound)}
    className={`
      group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-105
      ${isActive ? 'ring-3 ring-blue-400 shadow-2xl shadow-blue-500/25' : 'hover:shadow-xl hover:shadow-black/20'}
      bg-gradient-to-br ${sound.gradient} aspect-square flex flex-col justify-between p-4 sm:p-5 lg:p-6
      before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/30 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
      min-h-[200px] sm:min-h-[220px] lg:min-h-[240px] xl:min-h-[260px]
    `}
  >
    <div className="relative z-10 flex justify-between items-start">
      <div className="text-white/60 text-2xl sm:text-3xl lg:text-4xl group-hover:scale-110 transition-transform duration-300">
        {sound.icon}
      </div>
      {isActive && (
        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-white/80'} transition-all duration-300`} />
      )}
    </div>
    
    <div className="relative z-10 transform group-hover:translate-y-0 transition-transform duration-300">
      <h3 className="text-white font-bold text-base sm:text-lg lg:text-xl mb-1 sm:mb-2 leading-tight">{sound.name}</h3>
      <p className="text-white/80 text-xs sm:text-sm lg:text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {sound.description}
      </p>
    </div>

    {/* Animated background pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
    </div>
  </div>
);

// Componente de Card para vista em lista
const SoundCardList = ({ sound, isActive, onSelect, isPlaying }) => (
  <div 
    onClick={() => onSelect(sound)}
    className={`
      group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
      ${isActive ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/25 bg-white/10' : 'bg-white/5 hover:bg-white/10'}
      backdrop-blur-sm border border-white/10 hover:border-white/20 p-4 sm:p-5 lg:p-6 flex items-center gap-4 sm:gap-5 lg:gap-6
    `}
  >
    <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-xl bg-gradient-to-br ${sound.gradient} flex items-center justify-center text-xl sm:text-2xl lg:text-3xl transition-transform duration-300 group-hover:scale-110`}>
      {sound.icon}
    </div>
    
    <div className="flex-1">
      <h3 className="text-white font-semibold text-base sm:text-lg lg:text-xl mb-1">{sound.name}</h3>
      <p className="text-white/70 text-sm sm:text-base lg:text-lg">{sound.description}</p>
    </div>

    <div className="flex items-center gap-2 sm:gap-3">
      {isActive && (
        <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-white/60'}`} />
      )}
      <div className="text-white/40 group-hover:text-white/60 transition-colors">
        {isActive && isPlaying ? 
          <Pause className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> : 
          <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        }
      </div>
    </div>
  </div>
);

// Componente do Player de Áudio simplificado
const AudioPlayer = ({ 
  currentSound, 
  isPlaying, 
  onTogglePlay, 
  volume, 
  onVolumeChange, 
  duration, 
  onDurationChange,
  isExpanded,
  onPreviousSound,
  onNextSound,
  isFloating = false,
  onToggleExpansion,
  sounds,
  onSoundSelect
}) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev >= duration ? 0 : prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / duration) * 100;

  // Diferentes visualizações baseadas no ambiente (desabilitado)
  const getVisualization = () => {
    return null; // Animações de fundo removidas
  };

  // Layout horizontal para player flutuante
  if (isFloating && !isExpanded) {
    return (
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 transition-all duration-500 p-3 relative">
        {/* Playing Indicator - Discrete inside top right (Only when playing) */}
        {isPlaying && currentSound && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400 opacity-70 animate-pulse" />
        )}
        
        <div className="flex items-center gap-4">
          {/* Sound Info - Clickable */}
          <div 
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
            onClick={onToggleExpansion}
          >
            <div className={`
              w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl font-bold transition-all duration-300 group-hover:scale-110
              ${currentSound ? currentSound.gradient : 'from-gray-600 to-gray-800'}
            `}>
              {currentSound?.icon || '🎵'}
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-sm truncate group-hover:text-blue-300 transition-colors">
                {currentSound ? currentSound.name : 'Selecione um ambiente'}
              </h2>
            </div>
          </div>

          {/* Controls - Horizontal */}
          {currentSound && (
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button 
                onClick={onPreviousSound}
                className="rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110 p-2"
              >
                <SkipBack className="text-white w-4 h-4" />
              </button>

              {/* Play/Pause Button */}
              <button 
                onClick={onTogglePlay}
                className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl p-2.5"
              >
                {isPlaying ? 
                  <Pause className="text-white w-4 h-4" /> : 
                  <Play className="text-white ml-0.5 w-4 h-4" />
                }
              </button>

              {/* Next Button */}
              <button 
                onClick={onNextSound}
                className="rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110 p-2"
              >
                <SkipForward className="text-white w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Layout original para outros casos
  return (
    <div className={`
      bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 transition-all duration-500 relative
      ${isExpanded ? 'p-12 min-h-[500px]' : 'p-4'}
    `}>
      {/* Playing Indicator - Top Right Corner */}
      {isPlaying && currentSound && (
        <div className={`absolute rounded-full bg-green-400 animate-pulse ${
          isExpanded 
            ? 'top-4 right-4 w-4 h-4 shadow-lg shadow-green-400/50' 
            : 'top-2 right-2 w-2 h-2 opacity-70'
        }`} />
      )}

      {/* Visualization Background - Only for expanded */}
      {isExpanded && currentSound && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          {getVisualization()}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className={`flex items-center gap-4 ${isExpanded ? 'mb-8' : 'mb-4'}`}>
          <div 
            className={`
              rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold transition-all duration-300
              ${isExpanded ? 'w-20 h-20 text-4xl' : 'w-12 h-12 text-2xl'}
              ${currentSound ? currentSound.gradient : 'from-gray-600 to-gray-800'}
              ${!isExpanded && onToggleExpansion ? 'cursor-pointer group hover:scale-110' : ''}
            `}
            onClick={!isExpanded && onToggleExpansion ? onToggleExpansion : undefined}
          >
            {currentSound?.icon || '🎵'}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 
              className={`
                text-white font-bold truncate 
                ${isExpanded ? 'text-3xl mb-2' : 'text-lg mb-1'}
                ${!isExpanded && onToggleExpansion ? 'cursor-pointer hover:text-blue-300 transition-colors' : ''}
              `}
              onClick={!isExpanded && onToggleExpansion ? onToggleExpansion : undefined}
            >
              {currentSound ? currentSound.name : 'Selecione um ambiente'}
            </h2>
            {(isExpanded || currentSound) && (
              <p className={`text-white/70 ${isExpanded ? 'text-lg' : 'text-sm'}`}>
                {currentSound?.description || 'Escolha um som para começar'}
              </p>
            )}
          </div>
        </div>

        {currentSound && (
          <>
            {/* Progress Bar */}
            <div className={`relative ${isExpanded ? 'mb-6' : 'mb-3'}`}>
              <div className={`w-full bg-white/20 rounded-full overflow-hidden ${isExpanded ? 'h-3' : 'h-2'}`}>
                <div 
                  className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 relative overflow-hidden h-full"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
              </div>
            </div>

            {/* Time Display - Only show in expanded or when there's enough space */}
            {isExpanded && (
              <div className="flex justify-between text-white/70 mb-8 text-lg">
                <span className="font-mono">{formatTime(currentTime)}</span>
                <span className="font-mono">{formatTime(duration)}</span>
              </div>
            )}

            {/* Main Controls */}
            <div className={`flex items-center justify-center gap-3 ${isExpanded ? 'mb-8' : 'mb-4'}`}>
              {/* Previous Button */}
              <button 
                onClick={onPreviousSound}
                className={`
                  rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110
                  ${isExpanded ? 'p-4' : 'p-2'}
                `}
              >
                <SkipBack className={`text-white ${isExpanded ? 'w-6 h-6' : 'w-4 h-4'}`} />
              </button>

              {/* Restart Button (only in expanded) */}
              {isExpanded && (
                <button 
                  onClick={() => setCurrentTime(0)}
                  className="rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110 p-4"
                >
                  <RotateCcw className="text-white w-6 h-6" />
                </button>
              )}

              {/* Play/Pause Button */}
              <button 
                onClick={onTogglePlay}
                className={`
                  rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                  transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl
                  ${isExpanded ? 'p-6' : 'p-3'}
                `}
              >
                {isPlaying ? 
                  <Pause className={`text-white ${isExpanded ? 'w-8 h-8' : 'w-5 h-5'}`} /> : 
                  <Play className={`text-white ml-1 ${isExpanded ? 'w-8 h-8' : 'w-5 h-5'}`} />
                }
              </button>

              {/* Shuffle Button (only in expanded) */}
              {isExpanded && (
                <button className="rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110 p-4">
                  <Shuffle className="text-white w-6 h-6" />
                </button>
              )}

              {/* Next Button */}
              <button 
                onClick={onNextSound}
                className={`
                  rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110
                  ${isExpanded ? 'p-4' : 'p-2'}
                `}
              >
                <SkipForward className={`text-white ${isExpanded ? 'w-6 h-6' : 'w-4 h-4'}`} />
              </button>
            </div>

            {/* Volume and Duration Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-white/70 flex-shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => onVolumeChange(e.target.value)}
                  className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-white/70 text-xs w-10 flex-shrink-0">{volume}%</span>
              </div>

              {isExpanded && (
                <div className="flex items-center gap-3">
                  <Timer className="w-4 h-4 text-white/70 flex-shrink-0" />
                  <input
                    type="range"
                    min="60"
                    max="3600"
                    step="60"
                    value={duration}
                    onChange={(e) => onDurationChange(e.target.value)}
                    className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-white/70 text-xs w-12 flex-shrink-0">{Math.floor(duration / 60)}min</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Componente principal da aplicação
const LiminalApp = () => {
  const [currentSound, setCurrentSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [duration, setDuration] = useState(1800);
  const [viewMode, setViewMode] = useState('grid');
  const [showSounds, setShowSounds] = useState(true);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [playerBottomOffset, setPlayerBottomOffset] = useState(24); // 6 * 4 = 24px (bottom-6)
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const carouselRef = useRef(null);
  const [isSliderActive, setIsSliderActive] = useState(false);

  // Controle de scroll para mostrar/esconder header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or near top - show header
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold - hide header
        setShowHeader(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Detectar tamanho da tela
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1440 && window.innerHeight >= 1207);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Controle de posição do player flutuante baseado no footer
  useEffect(() => {
    const handlePlayerPosition = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const minBottomOffset = 24; // bottom-6 em pixels

      if (footerRect.top < windowHeight) {
        // Footer está visível, calcular nova posição
        const footerVisibleHeight = windowHeight - footerRect.top;
        const newBottomOffset = Math.max(minBottomOffset, footerVisibleHeight + 24);
        setPlayerBottomOffset(newBottomOffset);
      } else {
        // Footer não está visível, usar posição padrão
        setPlayerBottomOffset(minBottomOffset);
      }
    };

    handlePlayerPosition();
    window.addEventListener('scroll', handlePlayerPosition, { passive: true });
    window.addEventListener('resize', handlePlayerPosition);
    
    return () => {
      window.removeEventListener('scroll', handlePlayerPosition);
      window.removeEventListener('resize', handlePlayerPosition);
    };
  }, []);


  // Dados dos ambientes sonoros
  const sounds = [
    {
      id: 1,
      name: 'Chuva Suave',
      description: 'Som relaxante de chuva leve caindo',
      icon: '🌧️',
      gradient: 'from-blue-600 to-indigo-800'
    },
    {
      id: 2,
      name: 'Floresta Tropical',
      description: 'Pássaros cantando e folhas balançando',
      icon: '🌲',
      gradient: 'from-green-600 to-emerald-800'
    },
    {
      id: 3,
      name: 'Oceano Calmo',
      description: 'Ondas suaves tocando a praia',
      icon: '🌊',
      gradient: 'from-cyan-600 to-blue-800'
    },
    {
      id: 4,
      name: 'Fogueira Noturna',
      description: 'Crepitar reconfortante das chamas',
      icon: '🔥',
      gradient: 'from-orange-600 to-red-700'
    },
    {
      id: 5,
      name: 'Vento Suave',
      description: 'Brisa gentil através das árvores',
      icon: '💨',
      gradient: 'from-slate-600 to-gray-800'
    },
    {
      id: 6,
      name: 'Frequência 432Hz',
      description: 'Tom puro para meditação profunda',
      icon: '🎼',
      gradient: 'from-purple-600 to-violet-800'
    },
    {
      id: 7,
      name: 'Café Urbano',
      description: 'Ambiente aconchegante de cafeteria',
      icon: '☕',
      gradient: 'from-amber-700 to-brown-800'
    },
    {
      id: 8,
      name: 'Tempestade Distante',
      description: 'Trovões suaves ao longe',
      icon: '⚡',
      gradient: 'from-gray-700 to-slate-900'
    }
  ];

  // Auto-scroll do carrossel para centralizar o player expandido na tela
  useEffect(() => {
    if (isPlayerExpanded && currentSound && carouselRef.current) {
      setTimeout(() => {
        const container = carouselRef.current;
        
        // Encontrar o elemento do player expandido
        const expandedPlayerElement = container.querySelector(`[data-sound-id="${currentSound.id}"]`);
        
        if (expandedPlayerElement) {
          // Obter posições reais
          const playerRect = expandedPlayerElement.getBoundingClientRect();
          
          // Centro da tela
          const screenCenter = window.innerWidth / 2;
          
          // Centro atual do player na tela
          const playerCenterInScreen = playerRect.left + (playerRect.width / 2);
          
          // Calcular quanto precisa mover
          const offsetNeeded = screenCenter - playerCenterInScreen;
          
          // Aplicar o scroll
          container.scrollBy({
            left: -offsetNeeded,
            behavior: 'smooth'
          });
        }
      }, 200); // Aumentei o delay
    }
  }, [currentSound, isPlayerExpanded]);

  // Gerenciar interação com sliders para evitar conflito com scroll do carrossel
  useEffect(() => {
    if (!isPlayerExpanded || !carouselRef.current) return;

    const carousel = carouselRef.current;
    
    const handleSliderStart = (e) => {
      // Verificar se o evento veio de um slider
      const isSlider = e.target.type === 'range' || e.target.classList.contains('slider');
      
      if (isSlider) {
        setIsSliderActive(true);
      }
    };

    const handleSliderEnd = () => {
      // Pequeno delay para garantir que a interação terminou completamente
      setTimeout(() => {
        setIsSliderActive(false);
      }, 100);
    };

    // Event listeners para mouse
    carousel.addEventListener('mousedown', handleSliderStart);
    carousel.addEventListener('mouseup', handleSliderEnd);
    carousel.addEventListener('mouseleave', handleSliderEnd);

    // Event listeners para touch
    carousel.addEventListener('touchstart', handleSliderStart, { passive: false });
    carousel.addEventListener('touchend', handleSliderEnd);
    carousel.addEventListener('touchcancel', handleSliderEnd);

    return () => {
      carousel.removeEventListener('mousedown', handleSliderStart);
      carousel.removeEventListener('mouseup', handleSliderEnd);
      carousel.removeEventListener('mouseleave', handleSliderEnd);
      carousel.removeEventListener('touchstart', handleSliderStart);
      carousel.removeEventListener('touchend', handleSliderEnd);
      carousel.removeEventListener('touchcancel', handleSliderEnd);
    };
  }, [isPlayerExpanded]);

  // Filtrar sons baseado na busca
  const filteredSounds = sounds.filter(sound => 
    sound.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sound.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSoundSelect = (sound) => {
    if (currentSound?.id === sound.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSound(sound);
      setIsPlaying(true);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePreviousSound = () => {
    if (!currentSound) return;
    
    const currentIndex = sounds.findIndex(sound => sound.id === currentSound.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : sounds.length - 1;
    
    setCurrentSound(sounds[previousIndex]);
    setIsPlaying(true);
  };

  const handleNextSound = () => {
    if (!currentSound) return;
    
    const currentIndex = sounds.findIndex(sound => sound.id === currentSound.id);
    const nextIndex = currentIndex < sounds.length - 1 ? currentIndex + 1 : 0;
    
    setCurrentSound(sounds[nextIndex]);
    setIsPlaying(true);
  };

  const togglePlayerExpansion = () => {
    setIsPlayerExpanded(!isPlayerExpanded);
    if (!isPlayerExpanded) {
      setShowSounds(false);
    } else {
      setShowSounds(true);
      // Recalcular posição do player flutuante quando sair do modo expandido
      setTimeout(() => {
        const footer = document.querySelector('footer');
        if (!footer) return;

        const footerRect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const minBottomOffset = 24; // bottom-6 em pixels

        if (footerRect.top < windowHeight) {
          // Footer está visível, calcular nova posição
          const footerVisibleHeight = windowHeight - footerRect.top;
          const newBottomOffset = Math.max(minBottomOffset, footerVisibleHeight + 24);
          setPlayerBottomOffset(newBottomOffset);
        } else {
          // Footer não está visível, usar posição padrão
          setPlayerBottomOffset(minBottomOffset);
        }
      }, 50); // Small delay to ensure DOM has updated
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className={`
        fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out
        bg-black/30 backdrop-blur-xl border-b border-white/10
        ${showHeader ? 'translate-y-0' : '-translate-y-full'}
      `}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title - Hidden when search is active */}
            {!showSearch && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <div>
                  <h1 className="text-white text-2xl font-bold">Liminal</h1>
                  <p className="text-white/60 text-sm">Seu refúgio sonoro</p>
                </div>
              </div>
            )}

            {/* Search Input - Full width when active */}
            {showSearch && !isPlayerExpanded && (
              <div className="flex-1 mr-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-white/40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar ambientes sonoros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    autoFocus
                  />
                  {/* Clear Button */}
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white/70 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* View Controls */}
            <div className="flex items-center gap-4">
              {!isPlayerExpanded && (
                <>
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setShowSearch(!showSearch);
                      if (showSearch) {
                        setSearchTerm(''); // Clear search when hiding
                      }
                    }}
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      showSearch ? 'bg-blue-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </>
              )}

              {isPlayerExpanded && (
                <button
                  onClick={togglePlayerExpansion}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
                >
                  <Minimize2 className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-24 sm:pt-28">
        <div className={`
          transition-all duration-700 ease-in-out
          ${isPlayerExpanded ? 'grid grid-cols-1' : isLargeScreen ? 'grid lg:grid-cols-4 gap-8' : 'w-full'}
        `}>
          
          {/* Sounds Grid/List OR Carousel (when expanded) */}
          {showSounds && !isPlayerExpanded && (
            <div className={`${isLargeScreen ? 'lg:col-span-3' : 'w-full'} ${!isLargeScreen ? 'mb-32' : ''}`}>
              <div className="mb-8 sm:mb-10 lg:mb-12 text-center sm:text-left">
                <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">Ambientes Sonoros</h2>
                <p className="text-white/70 text-base sm:text-lg lg:text-xl">Encontre o som perfeito para cada momento</p>
              </div>

              <div className={`
                transition-all duration-500
                ${viewMode === 'grid' 
                  ? isLargeScreen 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8'
                  : 'space-y-4 max-w-4xl mx-auto'
                }
              `}>
                {filteredSounds.map((sound) => (
                  viewMode === 'grid' ? (
                    <SoundCardGrid
                      key={sound.id}
                      sound={sound}
                      isActive={currentSound?.id === sound.id}
                      onSelect={handleSoundSelect}
                      isPlaying={isPlaying && currentSound?.id === sound.id}
                    />
                  ) : (
                    <SoundCardList
                      key={sound.id}
                      sound={sound}
                      isActive={currentSound?.id === sound.id}
                      onSelect={handleSoundSelect}
                      isPlaying={isPlaying && currentSound?.id === sound.id}
                    />
                  )
                ))}
              </div>
            </div>
          )}

          {/* Carousel - When player is expanded */}
          {isPlayerExpanded && (
            <div className="mb-8">
              <div className="relative max-w-6xl mx-auto">
                <div 
                  ref={carouselRef}
                  className={`scrollbar-hide ${isSliderActive ? 'overflow-x-hidden' : 'overflow-x-auto'}`}
                >
                  <div 
                    className="flex gap-6 pb-4"
                    style={{ 
                      width: `${sounds.length * 350 + (sounds.length - 1) * 24}px`,
                      paddingLeft: '50%',
                      paddingRight: '50%'
                    }}
                  >
                    {sounds.map((sound) => (
                      <div
                        key={sound.id}
                        data-sound-id={sound.id}
                        className={`flex-shrink-0 transition-all duration-500 ${
                          currentSound?.id === sound.id ? 'w-[480px]' : 'w-72'
                        }`}
                      >
                        {currentSound?.id === sound.id ? (
                          // Expanded Player replacing the selected card
                          <div className="w-full">
                            <AudioPlayer
                              currentSound={currentSound}
                              isPlaying={isPlaying}
                              onTogglePlay={handleTogglePlay}
                              volume={volume}
                              onVolumeChange={setVolume}
                              duration={duration}
                              onDurationChange={setDuration}
                              isExpanded={true}
                              onPreviousSound={handlePreviousSound}
                              onNextSound={handleNextSound}
                              sounds={sounds}
                              onSoundSelect={handleSoundSelect}
                            />
                          </div>
                        ) : (
                          // Regular sound card
                          <div
                            className="cursor-pointer scale-95 opacity-70 hover:scale-100 hover:opacity-90 transition-all duration-500"
                            onClick={() => handleSoundSelect(sound)}
                          >
                            <div className={`
                              relative overflow-hidden rounded-2xl bg-gradient-to-br ${sound.gradient} 
                              aspect-square flex flex-col justify-between p-6
                              before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/30 before:to-transparent
                              hover:shadow-xl transition-shadow duration-300
                            `}>
                              <div className="relative z-10 flex justify-between items-start">
                                <div className="text-white/80 text-4xl">
                                  {sound.icon}
                                </div>
                              </div>
                              
                              <div className="relative z-10">
                                <h3 className="text-white font-bold text-xl mb-2 leading-tight">{sound.name}</h3>
                                <p className="text-white/80 text-sm">
                                  {sound.description}
                                </p>
                              </div>

                              {/* Background pattern */}
                              <div className="absolute inset-0 opacity-10">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({
                        left: -350, // Adjusted for larger expanded player
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => {
                    if (carouselRef.current) {
                      carouselRef.current.scrollBy({
                        left: 350, // Adjusted for larger expanded player
                        behavior: 'smooth'
                      });
                    }
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* Integrated Player for Large Screens */}
          {isLargeScreen && !isPlayerExpanded && (
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <AudioPlayer
                  currentSound={currentSound}
                  isPlaying={isPlaying}
                  onTogglePlay={handleTogglePlay}
                  volume={volume}
                  onVolumeChange={setVolume}
                  duration={duration}
                  onDurationChange={setDuration}
                  isExpanded={false}
                  onPreviousSound={handlePreviousSound}
                  onNextSound={handleNextSound}
                  onToggleExpansion={togglePlayerExpansion}
                  sounds={sounds}
                  onSoundSelect={handleSoundSelect}
                />
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Floating Player - Only for Small Screens */}
      {!isPlayerExpanded && !isLargeScreen && (
        <div 
          className="fixed left-6 right-6 z-[60] transition-all duration-300"
          style={{ bottom: `${playerBottomOffset}px` }}
        >
          <div className="max-w-md mx-auto">
            <AudioPlayer
              currentSound={currentSound}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              volume={volume}
              onVolumeChange={setVolume}
              duration={duration}
              onDurationChange={setDuration}
              isExpanded={false}
              onPreviousSound={handlePreviousSound}
              onNextSound={handleNextSound}
              isFloating={true}
              onToggleExpansion={togglePlayerExpansion}
              sounds={sounds}
              onSoundSelect={handleSoundSelect}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
              <span className="text-white text-lg font-semibold">Liminal</span>
            </div>
            <p className="text-white/60 mb-4">Criando momentos de paz através do poder transformador do som</p>
            <div className="flex justify-center gap-6 text-white/40 text-sm">
              <a href="#" className="hover:text-white/70 transition-colors">Sobre</a>
              <a href="#" className="hover:text-white/70 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white/70 transition-colors">Termos</a>
              <a href="#" className="hover:text-white/70 transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          transition: all 0.3s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          transition: all 0.3s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Melhorar experiência touch para sliders */
        .slider {
          touch-action: pan-y;
        }

        /* Desabilitar scroll horizontal quando slider está ativo */
        .overflow-x-hidden {
          touch-action: pan-y;
        }

        .overflow-x-auto {
          touch-action: pan-x pan-y;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default LiminalApp;