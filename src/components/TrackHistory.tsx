import React, { useState } from 'react';
import { 
  History, 
  Music, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  Clock, 
  Headphones,
  Search
} from 'lucide-react';
import { TrackHistoryItem } from '../types';

interface TrackHistoryProps {
  stationName: string;
  stationId: string;
  history: TrackHistoryItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onClearHistory: () => void;
}

export const TrackHistory: React.FC<TrackHistoryProps> = ({
  stationName,
  stationId,
  history,
  isLoading,
  onRefresh,
  onClearHistory
}) => {
  const [historySearch, setHistorySearch] = useState('');

  // Format relative or absolute timestamp
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const filteredHistory = history.filter((item) => {
    if (!historySearch.trim()) return true;
    const query = historySearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.artist.toLowerCase().includes(query) ||
      (item.album && item.album.toLowerCase().includes(query))
    );
  });

  return (
    <div id="track-history-section" className="rounded-3xl bg-[#121214]/80 border border-slate-800 p-6 shadow-xl backdrop-blur-md flex flex-col">
      
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wider uppercase">
            Historique des titres
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {stationName}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="refresh-history-btn"
            onClick={onRefresh}
            title="Actualiser l'historique"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {history.length > 0 && (
            <button
              id="clear-history-btn"
              onClick={onClearHistory}
              title="Vider l'historique de cette radio"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* History Search if more than 4 items */}
      {history.length > 4 && (
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Filtrer les morceaux..."
            className="w-full bg-[#0a0a0c] border border-slate-800 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {/* History List */}
      <div className="mt-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-2xl">
            <div className="w-10 h-10 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto mb-2.5 text-slate-500">
              <Headphones className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-300">
              {historySearch ? 'Aucun titre trouvé' : 'Historique en attente'}
            </p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              Les morceaux diffusés sur {stationName} apparaîtront automatiquement avec leur heure exacte.
            </p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredHistory.map((track) => {
              const fullTitle = `${track.artist} - ${track.title}`;
              return (
                <div
                  key={track.id}
                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Timestamp in Mono */}
                  <div className="text-xs text-slate-500 font-mono flex-shrink-0 w-11">
                    {formatTime(track.playedAt)}
                  </div>

                  {/* Artwork / Icon */}
                  <div className="relative flex-shrink-0 w-8 h-8 rounded-lg bg-[#1a1a1c] border border-slate-800 overflow-hidden flex items-center justify-center">
                    {track.artworkUrl ? (
                      <img
                        src={track.artworkUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Music className="w-3.5 h-3.5 text-blue-400" />
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                      {track.title}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {track.artist}
                    </div>
                  </div>

                  {/* External Link */}
                  <a
                    href={track.externalLinks?.spotify || `https://open.spotify.com/search/${encodeURIComponent(fullTitle)}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Écouter sur Spotify"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-[#1ed760] transition-opacity"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
