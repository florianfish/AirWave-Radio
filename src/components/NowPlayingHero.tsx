import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Music, 
  Radio as RadioIcon, 
  Copy, 
  Check, 
  Globe, 
  ExternalLink, 
  Heart,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { RadioStation, NowPlayingInfo } from '../types';
import { StationLogo } from './StationLogo';

interface NowPlayingHeroProps {
  radio: RadioStation;
  isPlaying: boolean;
  onPlayToggle: () => void;
  nowPlaying: NowPlayingInfo | null;
  onToggleFavorite: (stationId: string) => void;
  isFavorite?: boolean;
}

export const NowPlayingHero: React.FC<NowPlayingHeroProps> = ({
  radio,
  isPlaying,
  onPlayToggle,
  nowPlaying,
  onToggleFavorite,
  isFavorite
}) => {
  const [copied, setCopied] = useState(false);

  const fullTrackTitle = nowPlaying?.rawTitle || 
    (nowPlaying?.artist && nowPlaying?.title ? `${nowPlaying.artist} - ${nowPlaying.title}` : '') ||
    (radio.tagline || radio.name);

  const handleCopy = () => {
    if (!fullTrackTitle) return;
    navigator.clipboard.writeText(fullTrackTitle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasTrackInfo = Boolean(nowPlaying?.rawTitle || (nowPlaying?.artist && nowPlaying?.title && nowPlaying.title !== radio.name));

  const isEurope2 = radio.name.toLowerCase().includes('europe 2');

  return (
    <div id="now-playing-hero" className="relative overflow-hidden rounded-[32px] bg-[#121214] border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-2xl">
      
      {/* Background ambient glow matching theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-[90px] pointer-events-none rounded-full"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch gap-8 lg:gap-12">
        
        {/* Radio Logo & Artwork Column with Glow */}
        <div className="relative flex-shrink-0 flex flex-col items-center justify-center">
          <div className="relative group">
            {/* Ambient Aura */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[36px] blur-md opacity-25 group-hover:opacity-40 transition-opacity"></div>
            
            {/* Center Artwork Box */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 bg-[#1a1a1c] border border-slate-800 rounded-[32px] flex items-center justify-center overflow-hidden shadow-2xl p-6">
              
              {/* Show cover art if available, otherwise radio logo / branded graphic */}
              {nowPlaying?.artworkUrl && nowPlaying.artworkUrl !== radio.logoUrl ? (
                <img
                  src={nowPlaying.artworkUrl}
                  alt={fullTrackTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-2xl shadow-md transition-opacity duration-300"
                />
              ) : (
                <StationLogo
                  name={radio.name}
                  logoUrl={radio.logoUrl}
                  size="hero"
                  className="w-full h-full"
                  imgClassName="filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                />
              )}

              {/* Small station logo thumbnail when displaying album cover */}
              {nowPlaying?.artworkUrl && nowPlaying.artworkUrl !== radio.logoUrl && (
                <div className="absolute bottom-3 right-3 w-11 h-11 rounded-xl bg-[#121214] border border-slate-700 p-1.5 shadow-xl">
                  <StationLogo
                    name={radio.name}
                    logoUrl={radio.logoUrl}
                    size="sm"
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Favorite & Website quick buttons */}
          <div className="flex items-center gap-2 mt-4">
            <button
              id="hero-toggle-favorite-btn"
              onClick={() => onToggleFavorite(radio.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isFavorite 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20' 
                  : 'bg-[#1a1a1c] border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
              {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
            </button>

            {radio.websiteUrl && (
              <a
                href={radio.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-xl bg-[#1a1a1c] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                title="Site officiel"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Content Column */}
        <div className="flex-1 flex flex-col justify-between text-center md:text-left min-w-0">
          
          <div>
            {/* Top station info badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
              <span className="px-3 py-1 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                {radio.genre || 'Pop-Rock'}
              </span>

              {radio.country && (
                <span className="px-2.5 py-1 rounded-lg bg-[#1a1a1c] border border-slate-800 text-slate-400 text-xs">
                  {radio.country}
                </span>
              )}

              <span className="px-2.5 py-1 rounded-lg bg-[#1a1a1c] border border-slate-800 text-slate-500 text-xs font-mono">
                {radio.bitrate || 128} kbps {radio.codec || 'MP3'}
              </span>
            </div>

            {/* Currently Playing Track Headline */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                {nowPlaying?.title || (hasTrackInfo ? fullTrackTitle : radio.name)}
              </h2>
              
              <p className="text-lg sm:text-xl text-blue-400 font-medium">
                {nowPlaying?.artist && nowPlaying.artist !== nowPlaying.title 
                  ? nowPlaying.artist 
                  : radio.tagline || 'Direct Radio en Ligne'}
              </p>

              {/* Live Signal Indicator */}
              <div className="pt-2 flex items-center justify-center md:justify-start gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-[11px] text-slate-400 uppercase font-bold tracking-tight">
                  En Direct • {radio.name}
                </span>
              </div>
            </div>

            {/* Track metadata details box */}
            {hasTrackInfo && (
              <div className="mt-5 p-4 rounded-2xl bg-[#1a1a1c]/80 border border-slate-800">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-blue-400" />
                    Titre détecté à l'antenne
                  </span>

                  <button
                    id="copy-track-btn"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors px-2 py-0.5 rounded-md hover:bg-slate-800 cursor-pointer"
                    title="Copier le titre"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Streaming links in elegant dark pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                  <span className="text-xs text-slate-500">Écouter sur :</span>
                  <a
                    href={`https://open.spotify.com/search/${encodeURIComponent(fullTrackTitle)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1a1a1c] hover:bg-[#1DB954]/10 border border-slate-800 hover:border-[#1DB954]/40 text-slate-300 hover:text-[#1ed760] text-xs font-medium transition-all"
                  >
                    Spotify <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(fullTrackTitle)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1a1a1c] hover:bg-red-500/10 border border-slate-800 hover:border-red-500/40 text-slate-300 hover:text-red-400 text-xs font-medium transition-all"
                  >
                    YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={`https://music.apple.com/search?term=${encodeURIComponent(fullTrackTitle)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1a1a1c] hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-medium transition-all"
                  >
                    Apple Music <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Primary Iconic Playback Controller Bar */}
          <div className="flex items-center justify-center md:justify-start gap-6 pt-6">
            <button
              id="hero-main-action-btn"
              onClick={onPlayToggle}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-2xl cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </button>

            <div className="text-left">
              <span className="text-sm font-semibold text-white block">
                {isPlaying ? 'Diffusion en cours' : `Écouter ${radio.name}`}
              </span>
              <span className="text-xs text-slate-500">
                Qualité audio Haute Fidélité
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
