import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Equalizer } from './Equalizer';

interface HeaderProps {
  totalRadios: number;
  activeRadioName?: string;
  isPlaying: boolean;
  onRefreshRadios: () => void;
  isRefreshing?: boolean;
  onOpenHomeAssistantModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalRadios,
  activeRadioName,
  isPlaying,
  onRefreshRadios,
  isRefreshing,
  onOpenHomeAssistantModal,
}) => {
  return (
    <header id="app-header" className="sticky top-0 z-30 bg-ink-950/70 backdrop-blur-xl border-b border-line px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-2xl bg-ink-800 border border-line flex items-center justify-center flex-shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-transparent" />
            {/* Broadcast waves mark */}
            <svg viewBox="0 0 24 24" className="relative w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
              <path d="M8.5 15.5a5 5 0 0 1 0-7" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M5.6 18.4a9 9 0 0 1 0-12.8" className="opacity-50" />
              <path d="M18.4 5.6a9 9 0 0 1 0 12.8" className="opacity-50" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold tracking-tight text-white font-display leading-none">
              AirWave
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mt-1">
              {totalRadios} stations · live
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {activeRadioName && (
            <div className="hidden sm:flex items-center gap-2.5 pl-3 pr-3.5 py-1.5 rounded-full bg-white/[0.03] border border-line text-xs">
              <Equalizer playing={isPlaying} bars={4} className="h-3 gap-[2px]" barClassName={`w-[2px] ${isPlaying ? 'bg-accent' : 'bg-slate-600'}`} />
              <span className="text-slate-500">{isPlaying ? 'En écoute' : 'En pause'}</span>
              <strong className="text-white font-semibold">{activeRadioName}</strong>
            </div>
          )}

          {onOpenHomeAssistantModal && (
            <button
              id="open-ha-modal-btn"
              onClick={onOpenHomeAssistantModal}
              title="Intégration & Configuration Home Assistant"
              className="h-9 px-2.5 sm:px-3 text-slate-300 hover:text-white bg-white/[0.03] hover:bg-[#18bcf2]/10 rounded-full border border-line hover:border-[#18bcf2]/40 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <svg className="w-4 h-4 fill-[#18bcf2]" viewBox="0 0 24 24">
                <path d="M12,3L2,12H5V20H19V12H22L12,3M12,7.7C13.2,7.7 14.2,8.7 14.2,9.9C14.2,10.7 13.7,11.4 13,11.8V15H11V11.8C10.3,11.4 9.8,10.7 9.8,9.9C9.8,8.7 10.8,7.7 12,7.7M7,13H9V18H7V13M15,13H17V18H15V13Z" />
              </svg>
              <span className="hidden sm:inline">Home Assistant</span>
            </button>
          )}

          <button
            id="refresh-radios-btn"
            onClick={onRefreshRadios}
            title="Actualiser le direct et les titres"
            aria-label="Actualiser"
            className="w-9 h-9 text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] rounded-full border border-line transition-colors cursor-pointer flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-accent' : ''}`} />
          </button>
        </div>

      </div>
    </header>
  );
};
