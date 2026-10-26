import React from 'react';
import { RadioTower, RefreshCw, Radio as RadioIcon } from 'lucide-react';

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
    <header id="app-header" className="sticky top-0 z-30 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-slate-800/70 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Direct Stations Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-red-600/20 flex-shrink-0">
              <RadioIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
                  AirWave
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-600/15 border border-blue-500/30 text-blue-400">
                  <RadioTower className="w-3.5 h-3.5 text-blue-400" />
                  {totalRadios} stations direct
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons & HA Integration */}
        <div className="flex items-center gap-2.5">
          {activeRadioName && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121214] border border-slate-800 text-xs text-slate-300">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
              <span className="text-slate-400">En écoute :</span>
              <strong className="text-white">{activeRadioName}</strong>
            </div>
          )}

          {/* Home Assistant Integration Trigger */}
          {onOpenHomeAssistantModal && (
            <button
              id="open-ha-modal-btn"
              onClick={onOpenHomeAssistantModal}
              title="Intégration & Configuration Home Assistant"
              className="p-2 sm:px-3 text-cyan-400 hover:text-white bg-cyan-600/10 hover:bg-cyan-600/20 rounded-xl border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12,3L2,12H5V20H19V12H22L12,3M12,7.7C13.2,7.7 14.2,8.7 14.2,9.9C14.2,10.7 13.7,11.4 13,11.8V15H11V11.8C10.3,11.4 9.8,10.7 9.8,9.9C9.8,8.7 10.8,7.7 12,7.7M7,13H9V18H7V13M15,13H17V18H15V13Z" />
              </svg>
              <span className="hidden sm:inline">Home Assistant</span>
            </button>
          )}

          <button
            id="refresh-radios-btn"
            onClick={onRefreshRadios}
            title="Actualiser le direct et les titres"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl border border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>

      </div>
    </header>
  );
};
