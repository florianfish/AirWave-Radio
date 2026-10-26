import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  AlertCircle, 
  Radio as RadioIcon,
  Wifi,
  Music2
} from 'lucide-react';
import { RadioStation, NowPlayingInfo } from '../types';
import { StationLogo } from './StationLogo';

interface AudioPlayerProps {
  currentRadio: RadioStation | null;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onNextRadio?: () => void;
  onPrevRadio?: () => void;
  nowPlaying: NowPlayingInfo | null;
  onSelectRadio: (radio: RadioStation) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentRadio,
  isPlaying,
  onPlayToggle,
  onNextRadio,
  onPrevRadio,
  nowPlaying,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('radio_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(0.8);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle stream source switch
  useEffect(() => {
    if (!currentRadio) return;

    setStreamError(null);
    setUsingFallback(false);

    if (audioRef.current) {
      const activeUrl = currentRadio.streamUrl;
      audioRef.current.src = activeUrl;
      audioRef.current.load();

      if (isPlaying) {
        setIsLoading(true);
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsLoading(false);
              setStreamError(null);
            })
            .catch((err) => {
              console.warn('Playback initial error:', err);
              setIsLoading(false);
              // Try fallback if available
              if (currentRadio.fallbackStreamUrl && !usingFallback) {
                setUsingFallback(true);
                if (audioRef.current) {
                  audioRef.current.src = currentRadio.fallbackStreamUrl;
                  audioRef.current.play().catch(() => {
                    setStreamError('Impossible de lire le flux.');
                  });
                }
              } else {
                setStreamError('Cliquez sur Lecture pour démarrer.');
              }
            });
        }
      } else {
        audioRef.current.pause();
        setIsLoading(false);
      }
    }
  }, [currentRadio?.id, currentRadio?.streamUrl]);

  // Handle play / pause state transitions
  useEffect(() => {
    if (!audioRef.current || !currentRadio) return;

    if (isPlaying) {
      setIsLoading(true);
      setStreamError(null);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsLoading(false);
          })
          .catch((err) => {
            console.error('Audio play error:', err);
            setIsLoading(false);
            if (currentRadio.fallbackStreamUrl && !usingFallback) {
              setUsingFallback(true);
              audioRef.current!.src = currentRadio.fallbackStreamUrl;
              audioRef.current!.play().catch(() => {
                setStreamError('Flux indisponible actuellement.');
              });
            } else {
              setStreamError('Échec de la lecture.');
            }
          });
      }
    } else {
      audioRef.current.pause();
      setIsLoading(false);
    }
  }, [isPlaying]);

  // Keyboard shortcut listener (Space = play/pause, M = mute, ArrowUp/Down = volume)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onPlayToggle();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleMuteToggle();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume((v) => {
          const next = Math.min(1, Math.round((v + 0.05) * 100) / 100);
          localStorage.setItem('radio_volume', String(next));
          return next;
        });
        setIsMuted(false);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume((v) => {
          const next = Math.max(0, Math.round((v - 0.05) * 100) / 100);
          localStorage.setItem('radio_volume', String(next));
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayToggle, isMuted, volume]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    localStorage.setItem('radio_volume', String(newVol));
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume || 0.5);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
    }
  };

  const effectiveVolume = isMuted ? 0 : volume;

  // Station monogram code (e.g. Europe 2 -> E2, RFM -> RF, etc.)
  const monogram = currentRadio 
    ? currentRadio.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'RD';

  return (
    <footer id="sticky-audio-player" className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1c] border-t border-slate-800 px-4 sm:px-8 py-3.5 shadow-2xl transition-all">
      <audio
        ref={audioRef}
        preload="none"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setStreamError(null);
        }}
        onError={() => {
          setIsLoading(false);
          if (currentRadio?.fallbackStreamUrl && !usingFallback) {
            setUsingFallback(true);
            if (audioRef.current) {
              audioRef.current.src = currentRadio.fallbackStreamUrl;
              audioRef.current.play().catch(() => {
                setStreamError('Erreur de flux.');
              });
            }
          } else {
            setStreamError('Erreur de flux.');
          }
        }}
      />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
        
        {/* Left: Station Identity */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/60 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <StationLogo
              name={currentRadio ? currentRadio.name : 'Radio'}
              logoUrl={currentRadio?.logoUrl}
              size="sm"
              className="w-full h-full"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">
              {currentRadio ? currentRadio.name : 'Sélectionnez une station'}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {nowPlaying?.title ? (
                <span className="text-slate-400">{nowPlaying.title}</span>
              ) : (
                <span>Direct</span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Live stream indicator & Controls */}
        <div className="flex flex-col items-center gap-2 w-full md:w-2/4">
          <div className="flex items-center gap-4">
            {onPrevRadio && (
              <button
                id="prev-radio-btn"
                onClick={onPrevRadio}
                title="Précédente"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <SkipBack className="w-5 h-5" />
              </button>
            )}

            <button
              id="play-pause-main-btn"
              onClick={onPlayToggle}
              disabled={!currentRadio}
              title={isPlaying ? 'Pause (Espace)' : 'Lecture (Espace)'}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-lg cursor-pointer disabled:opacity-40"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {onNextRadio && (
              <button
                id="next-radio-btn"
                onClick={onNextRadio}
                title="Suivante"
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Live Progress Bar */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] text-slate-500 font-mono">00:00</span>
            <div className="flex-1 h-1 bg-slate-800 rounded-full relative overflow-hidden">
              <div className={`absolute top-0 left-0 h-full ${isPlaying ? 'w-3/4 bg-blue-500' : 'w-0'} transition-all duration-300`}></div>
            </div>
            <span className="text-[10px] text-blue-500 font-mono font-bold uppercase tracking-wider">
              {isPlaying ? 'Live' : 'Prêt'}
            </span>
          </div>
        </div>

        {/* Right: Volume & Bitrate */}
        <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
          <button
            id="mute-toggle-btn"
            onClick={handleMuteToggle}
            title={isMuted ? 'Rétablir le son (M)' : 'Couper le son (M)'}
            className="text-slate-500 hover:text-white transition-colors cursor-pointer p-1"
          >
            {effectiveVolume === 0 ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : effectiveVolume < 0.5 ? (
              <Volume1 className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <div className="w-24 sm:w-28 relative flex items-center">
            <input
              id="volume-slider-input"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={effectiveVolume}
              onChange={handleVolumeChange}
              aria-label="Volume"
              className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            />
          </div>

          <span className="text-[11px] text-slate-500 font-mono w-7 text-right">
            {Math.round(effectiveVolume * 100)}%
          </span>
        </div>

      </div>
    </footer>
  );
};
