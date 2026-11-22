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
import { Equalizer } from './Equalizer';

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
    <footer id="sticky-audio-player" className="fixed bottom-0 left-0 right-0 z-40 px-3 sm:px-6 pb-3 sm:pb-5 pointer-events-none">
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

      <div className="pointer-events-auto relative max-w-5xl mx-auto rounded-[28px] bg-ink-850/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Live signal line */}
        <div className="absolute top-0 inset-x-0 h-px bg-white/5">
          <div className={`h-full bg-gradient-to-r from-transparent via-accent to-transparent transition-opacity duration-500 ${isPlaying ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
        </div>

        <div className="flex items-center gap-3 sm:gap-6 px-3 sm:px-4 py-3">

          {/* Left: Station Identity */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-12 h-12 rounded-2xl bg-black/40 border border-white/10 p-1.5 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <StationLogo
                name={currentRadio ? currentRadio.name : 'Radio'}
                logoUrl={currentRadio?.logoUrl}
                size="sm"
                className="w-full h-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white truncate">
                  {currentRadio ? currentRadio.name : 'Sélectionnez une station'}
                </span>
                {streamError ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium truncate" title={streamError}>
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {streamError}
                  </span>
                ) : (
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded ${
                    isPlaying ? 'bg-[#ff3355] text-white' : 'bg-white/5 text-slate-500'
                  }`}>
                    {isPlaying ? 'Live' : 'Prêt'}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 truncate mt-0.5">
                {nowPlaying?.title ? (
                  <>
                    {nowPlaying.title}
                    {nowPlaying.artist && nowPlaying.artist !== nowPlaying.title && (
                      <span className="text-slate-600"> · {nowPlaying.artist}</span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-500">Direct</span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center gap-1 sm:gap-3">
            {onPrevRadio && (
              <button
                id="prev-radio-btn"
                onClick={onPrevRadio}
                title="Précédente"
                aria-label="Station précédente"
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
            )}

            <button
              id="play-pause-main-btn"
              onClick={onPlayToggle}
              disabled={!currentRadio}
              title={isPlaying ? 'Pause (Espace)' : 'Lecture (Espace)'}
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-ink-950 hover:scale-105 active:scale-95 transition-transform shadow-[0_6px_24px_-6px_var(--accent)] cursor-pointer disabled:opacity-40"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
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
                aria-label="Station suivante"
                className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            )}
          </div>

          {/* Right: Spectrum & Volume */}
          <div className="hidden md:flex items-center justify-end gap-4 flex-1">
            <Equalizer
              playing={isPlaying && !isLoading}
              bars={14}
              className="h-6 gap-[3px] opacity-80"
              barClassName={`w-[3px] ${isPlaying ? 'bg-accent' : 'bg-slate-700'}`}
            />

            <div className="flex items-center gap-2">
              <button
                id="mute-toggle-btn"
                onClick={handleMuteToggle}
                title={isMuted ? 'Rétablir le son (M)' : 'Couper le son (M)'}
                aria-label={isMuted ? 'Rétablir le son' : 'Couper le son'}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                {effectiveVolume === 0 ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : effectiveVolume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <input
                id="volume-slider-input"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={effectiveVolume}
                onChange={handleVolumeChange}
                aria-label="Volume"
                style={{ '--fill': `${effectiveVolume * 100}%` } as React.CSSProperties}
                className="range-accent w-24 lg:w-28 focus:outline-none"
              />

              <span className="text-[10px] text-slate-500 font-mono w-8 text-right tabular-nums">
                {Math.round(effectiveVolume * 100)}%
              </span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
