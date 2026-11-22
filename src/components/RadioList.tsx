import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { RadioStation } from '../types';
import { StationLogo } from './StationLogo';
import { Equalizer } from './Equalizer';
import { accentStyle } from '../theme';

interface RadioListProps {
  radios: RadioStation[];
  currentRadio: RadioStation | null;
  isPlaying: boolean;
  onSelectRadio: (radio: RadioStation) => void;
  onToggleFavorite: (stationId: string) => void;
}

export const RadioList: React.FC<RadioListProps> = ({
  radios,
  currentRadio,
  isPlaying,
  onSelectRadio,
  onToggleFavorite,
}) => {
  return (
    <div id="radios-catalog-section">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {radios.map((radio, index) => {
          const isCurrent = currentRadio?.id === radio.id;
          const isCurrentlyPlaying = isCurrent && isPlaying;

          return (
            <div
              key={radio.id}
              id={`radio-card-${radio.id}`}
              role="button"
              tabIndex={0}
              aria-pressed={isCurrent}
              onClick={() => onSelectRadio(radio)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSelectRadio(radio);
              }}
              style={accentStyle(radio.name)}
              className={`relative group rounded-3xl p-4 transition-all duration-300 border cursor-pointer overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isCurrent
                  ? 'bg-ink-850 border-accent/60 shadow-[0_20px_60px_-20px_var(--accent)] -translate-y-1'
                  : 'bg-ink-900/60 border-line hover:border-white/15 hover:bg-ink-850 hover:-translate-y-1'
              }`}
            >
              {/* Accent wash */}
              <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent/25 to-transparent transition-opacity duration-300 pointer-events-none ${
                isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
              }`} />

              <div className="relative">
                {/* Top row: index & favorite */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-mono tracking-widest ${isCurrent ? 'text-accent' : 'text-slate-600'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <button
                    id={`favorite-radio-${radio.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(radio.id);
                    }}
                    title={radio.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    aria-label={radio.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    className="p-1.5 -m-1.5 rounded-full text-slate-600 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${radio.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Logo tile */}
                <div className="relative aspect-[16/10] rounded-2xl bg-black/30 border border-white/5 flex items-center justify-center p-5 mb-4 overflow-hidden">
                  <StationLogo
                    name={radio.name}
                    logoUrl={radio.logoUrl}
                    size="lg"
                    className="w-full h-full max-w-[140px] transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Hover / active play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                    <span className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shadow-[0_8px_30px_-4px_var(--accent)]">
                      {isCurrentlyPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </span>
                  </div>
                </div>

                {/* Identity */}
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-display font-bold text-xl text-white tracking-tight truncate">
                      {radio.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {radio.tagline || radio.genre || 'Direct flux haute fidélité'}
                    </p>
                  </div>
                  {isCurrent && (
                    <Equalizer
                      playing={isCurrentlyPlaying}
                      bars={4}
                      className="h-5 gap-[3px] flex-shrink-0 mb-1"
                      barClassName={`w-[3px] ${isCurrentlyPlaying ? 'bg-accent' : 'bg-slate-600'}`}
                    />
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-line">
                  <span className="text-[11px] text-slate-400 truncate">
                    {radio.genre || 'Radio en direct'}
                  </span>
                  <span className="text-[10px] text-slate-600 font-mono flex-shrink-0">
                    {radio.bitrate || 128}k
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
