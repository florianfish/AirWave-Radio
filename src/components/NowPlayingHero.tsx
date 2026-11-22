import React, { useState } from 'react';
import {
  Play,
  Pause,
  Copy,
  Check,
  Globe,
  ArrowUpRight,
  Heart,
} from 'lucide-react';
import { RadioStation, NowPlayingInfo } from '../types';
import { StationLogo } from './StationLogo';
import { Equalizer } from './Equalizer';
import { getRelativePath } from '../services/api';

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
  const hasArtwork = Boolean(nowPlaying?.artworkUrl && nowPlaying.artworkUrl !== radio.logoUrl);
  const backdropSrc = hasArtwork ? nowPlaying!.artworkUrl! : radio.logoUrl ? getRelativePath(radio.logoUrl) : undefined;

  const headline = nowPlaying?.title || (hasTrackInfo ? fullTrackTitle : radio.name);
  const subline = nowPlaying?.artist && nowPlaying.artist !== nowPlaying.title
    ? nowPlaying.artist
    : radio.tagline || 'Direct Radio en Ligne';

  const streamLinks = [
    { label: 'Spotify', href: `https://open.spotify.com/search/${encodeURIComponent(fullTrackTitle)}`, hover: 'hover:border-[#1DB954]/50 hover:text-[#1ed760] hover:bg-[#1DB954]/10' },
    { label: 'YouTube', href: `https://www.youtube.com/results?search_query=${encodeURIComponent(fullTrackTitle)}`, hover: 'hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10' },
    { label: 'Apple Music', href: `https://music.apple.com/search?term=${encodeURIComponent(fullTrackTitle)}`, hover: 'hover:border-rose-400/50 hover:text-rose-300 hover:bg-rose-500/10' },
  ];

  return (
    <div id="now-playing-hero" className="relative overflow-hidden rounded-[36px] bg-ink-900/70 border border-line shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]">

      {/* Blurred artwork backdrop */}
      {backdropSrc && (
        <img
          key={backdropSrc}
          src={backdropSrc}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover scale-125 blur-3xl opacity-25 saturate-150 pointer-events-none transition-opacity duration-700"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-ink-900/60 to-ink-950/95 pointer-events-none" />
      {/* Decorative oversized equalizer */}
      <Equalizer
        playing={isPlaying}
        bars={28}
        className="absolute bottom-0 right-0 h-40 w-[55%] gap-1.5 opacity-[0.07] pointer-events-none hidden md:inline-flex"
        barClassName="flex-1 bg-white"
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch gap-8 lg:gap-14 p-6 sm:p-8 lg:p-12">

        {/* Artwork with spinning halo */}
        <div className="relative flex-shrink-0 flex flex-col items-center justify-center">
          <div className="relative">
            <div
              className={`absolute -inset-3 rounded-[40px] ring-spin ${isPlaying ? '' : 'ring-paused'} opacity-70 blur-[2px]`}
              style={{ background: 'conic-gradient(from 0deg, transparent 0deg, var(--accent) 90deg, transparent 180deg, color-mix(in oklab, var(--accent) 50%, white) 270deg, transparent 360deg)' }}
            />
            <div className="absolute -inset-8 rounded-full bg-accent/25 blur-3xl" />

            <div className="relative w-60 h-60 sm:w-72 sm:h-72 bg-ink-850 border border-white/10 rounded-[32px] flex items-center justify-center overflow-hidden shadow-2xl">
              {hasArtwork ? (
                <img
                  key={nowPlaying!.artworkUrl}
                  src={nowPlaying!.artworkUrl}
                  alt={fullTrackTitle}
                  referrerPolicy="no-referrer"
                  className="rise-in w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full p-8">
                  <StationLogo
                    name={radio.name}
                    logoUrl={radio.logoUrl}
                    size="hero"
                    className="w-full h-full"
                    imgClassName="filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                  />
                </div>
              )}

              {/* Station badge over album art */}
              {hasArtwork && (
                <div className="absolute bottom-3 right-3 w-12 h-12 rounded-2xl bg-ink-900/80 backdrop-blur border border-white/10 p-1.5 shadow-xl">
                  <StationLogo name={radio.name} logoUrl={radio.logoUrl} size="sm" className="w-full h-full" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between text-center md:text-left min-w-0 gap-8">

          <div>
            {/* On-air row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-[0.2em] transition-all ${
                isPlaying ? 'onair-lamp bg-[#ff3355] text-white' : 'bg-white/5 border border-line text-slate-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-white' : 'bg-slate-600'}`} />
                On Air
              </span>
              <span className="px-3 py-1 rounded-md bg-accent/15 border border-accent/30 text-accent text-xs font-semibold">
                {radio.genre || 'Pop-Rock'}
              </span>
              {radio.country && (
                <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-line text-slate-400 text-xs">
                  {radio.country}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-line text-slate-500 text-[11px] font-mono">
                {radio.bitrate || 128}k · {radio.codec || 'MP3'}
              </span>
            </div>

            {/* Headline — re-animates on each new track */}
            <div key={headline + subline} className="rise-in space-y-2">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-slate-500">
                {hasTrackInfo ? `En ce moment sur ${radio.name}` : 'Station'}
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-display leading-[0.95] line-clamp-2 break-words">
                {headline}
              </h2>
              <p className="text-lg sm:text-2xl text-accent font-semibold truncate">
                {subline}
              </p>
            </div>

            {/* Streaming links */}
            {hasTrackInfo && (
              <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-2">
                {streamLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/[0.04] border border-line text-slate-300 text-xs font-medium transition-all ${l.hover}`}
                  >
                    {l.label} <ArrowUpRight className="w-3 h-3" />
                  </a>
                ))}
                <button
                  id="copy-track-btn"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Copier le titre"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Transport */}
          <div className="flex items-center justify-center md:justify-start gap-4">
            <button
              id="hero-main-action-btn"
              onClick={onPlayToggle}
              className="group relative w-20 h-20 rounded-full flex items-center justify-center text-white bg-accent hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-[0_12px_40px_-8px_var(--accent)]"
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
            >
              {isPlaying && <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20" />}
              {isPlaying ? (
                <Pause className="relative w-8 h-8 fill-current" />
              ) : (
                <Play className="relative w-8 h-8 fill-current ml-1" />
              )}
            </button>

            <button
              id="hero-toggle-favorite-btn"
              onClick={() => onToggleFavorite(radio.id)}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                isFavorite
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : 'bg-white/[0.04] border-line text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            {radio.websiteUrl && (
              <a
                href={radio.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-full flex items-center justify-center bg-white/[0.04] border border-line text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all"
                title="Site officiel"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}

            <div className="hidden sm:flex items-center gap-3 pl-3 ml-1 border-l border-line">
              <Equalizer playing={isPlaying} bars={5} className="h-6 gap-[3px]" barClassName={`w-1 ${isPlaying ? 'bg-accent' : 'bg-slate-700'}`} />
              <span className="text-xs text-slate-500 text-left leading-tight">
                <span className="block text-sm font-semibold text-white">{isPlaying ? 'Diffusion en cours' : 'En pause'}</span>
                {radio.name}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
