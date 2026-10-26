import React from 'react';
import { Play, Pause, Radio as RadioIcon, Heart } from 'lucide-react';
import { RadioStation } from '../types';
import { StationLogo } from './StationLogo';

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
    <div id="radios-catalog-section" className="space-y-4">
      
      {/* Radios Grid: Displays the 4 stations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {radios.map((radio) => {
          const isCurrent = currentRadio?.id === radio.id;
          const isCurrentlyPlaying = isCurrent && isPlaying;

          return (
            <div
              key={radio.id}
              id={`radio-card-${radio.id}`}
              onClick={() => onSelectRadio(radio)}
              className={`relative group rounded-2xl p-4 sm:p-5 transition-all duration-200 border cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'bg-[#141418] border-red-500/80 ring-1 ring-red-500/30 shadow-xl shadow-red-950/20'
                  : 'bg-[#121214] hover:bg-slate-800/40 border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              <div>
                {/* Top Bar: Genre & Favorite */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-[#1a1a1e] border border-slate-800 text-slate-300 truncate">
                    {radio.genre || 'Radio en direct'}
                  </span>

                  <button
                    id={`favorite-radio-${radio.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(radio.id);
                    }}
                    title={radio.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        radio.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600 hover:text-slate-400'
                      }`}
                    />
                  </button>
                </div>

                {/* Radio Logo & Identity */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-shrink-0 w-16 h-16 rounded-2xl bg-[#1a1a1c] border border-slate-800 p-2 flex items-center justify-center shadow-inner group-hover:border-slate-700 transition-colors">
                    <StationLogo
                      name={radio.name}
                      logoUrl={radio.logoUrl}
                      size="md"
                      className="w-full h-full"
                    />

                    {/* Equalizer animation on active station */}
                    {isCurrentlyPlaying && (
                      <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-end justify-center gap-1 pb-2 px-2">
                        <span className="w-1.5 bg-red-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-4"></span>
                        <span className="w-1.5 bg-amber-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-6"></span>
                        <span className="w-1.5 bg-blue-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-3"></span>
                        <span className="w-1.5 bg-red-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-5"></span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className={`font-black text-base sm:text-lg tracking-tight truncate transition-colors ${
                      isCurrent ? 'text-white' : 'text-white group-hover:text-blue-300'
                    }`}>
                      {radio.name}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
                      {radio.tagline || radio.genre || 'Direct flux haute fidélité'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom play trigger & Bitrate info */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-1">
                <span className="text-[11px] text-slate-500 font-mono">
                  {radio.bitrate || 128} kbps {radio.codec || 'MP3'}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {isCurrentlyPlaying ? (
                    <span className="inline-flex items-center gap-1.5 text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      En direct
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-300 group-hover:text-blue-400 transition-colors">
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Lancer
                    </span>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
