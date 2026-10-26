import React, { useState, useEffect, useCallback } from 'react';
import { RadioStation, NowPlayingInfo } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { NowPlayingHero } from './components/NowPlayingHero';
import { AudioPlayer } from './components/AudioPlayer';
import { RadioList } from './components/RadioList';
import { HomeAssistantModal } from './components/HomeAssistantModal';
import { Layers } from 'lucide-react';

export default function App() {
  const [radios, setRadios] = useState<RadioStation[]>([]);
  const [currentRadio, setCurrentRadio] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlayingInfo | null>(null);
  
  // UI states
  const [isLoadingRadios, setIsLoadingRadios] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isHaModalOpen, setIsHaModalOpen] = useState<boolean>(false);

  // 1. Initial Load of Radios from Database (strictly the 4 stations)
  const loadRadios = useCallback(async (selectDefault = false) => {
    try {
      setIsRefreshing(true);
      const data = await api.getRadios();
      setRadios(data);

      if (data.length > 0) {
        if (selectDefault || !currentRadio) {
          // Default to Europe 2 as requested
          const europe2 = data.find((r) => r.id === 'europe-2' || r.name.toLowerCase().includes('europe 2'));
          setCurrentRadio(europe2 || data[0]);
        } else {
          // Keep current selection synced
          const found = data.find((r) => r.id === currentRadio.id);
          if (found) setCurrentRadio(found);
        }
      }
    } catch (err) {
      console.error('Error loading radios:', err);
    } finally {
      setIsLoadingRadios(false);
      setIsRefreshing(false);
    }
  }, [currentRadio]);

  useEffect(() => {
    loadRadios(true);
  }, []);

  // 2. Fetch Now Playing metadata for active radio
  const fetchNowPlaying = useCallback(async (stationId: string) => {
    if (!stationId) return;
    try {
      const data = await api.getNowPlaying(stationId);
      setNowPlaying(data);
    } catch (err) {
      // Fallback
    }
  }, []);

  // Sync now playing when currentRadio changes
  useEffect(() => {
    if (!currentRadio) return;
    setNowPlaying(null);
    fetchNowPlaying(currentRadio.id);

    // Poll metadata periodically every 15 seconds
    const interval = setInterval(() => {
      fetchNowPlaying(currentRadio.id);
    }, 15000);

    return () => clearInterval(interval);
  }, [currentRadio?.id, fetchNowPlaying]);

  // Handle Play/Pause toggle
  const handlePlayToggle = () => {
    setIsPlaying((prev) => !prev);
  };

  // Handle Radio Selection
  const handleSelectRadio = (radio: RadioStation) => {
    if (currentRadio?.id === radio.id) {
      setIsPlaying((prev) => !prev);
    } else {
      setCurrentRadio(radio);
      setIsPlaying(true);
    }
  };

  // Next / Previous radio navigation among the 4 stations
  const handleNextRadio = () => {
    if (radios.length === 0 || !currentRadio) return;
    const currentIndex = radios.findIndex((r) => r.id === currentRadio.id);
    const nextIndex = (currentIndex + 1) % radios.length;
    setCurrentRadio(radios[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevRadio = () => {
    if (radios.length === 0 || !currentRadio) return;
    const currentIndex = radios.findIndex((r) => r.id === currentRadio.id);
    const prevIndex = (currentIndex - 1 + radios.length) % radios.length;
    setCurrentRadio(radios[prevIndex]);
    setIsPlaying(true);
  };

  // Toggle Favorite
  const handleToggleFavorite = async (stationId: string) => {
    const station = radios.find((r) => r.id === stationId);
    if (!station) return;
    const newFav = !station.isFavorite;

    setRadios((prev) =>
      prev.map((r) => (r.id === stationId ? { ...r, isFavorite: newFav } : r))
    );
    if (currentRadio?.id === stationId) {
      setCurrentRadio((prev) => (prev ? { ...prev, isFavorite: newFav } : null));
    }

    try {
      await api.updateRadio(stationId, { isFavorite: newFav });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 flex flex-col pb-28 selection:bg-red-600 selection:text-white">
      
      {/* Main Navigation Header */}
      <Header
        totalRadios={radios.length}
        activeRadioName={currentRadio?.name}
        isPlaying={isPlaying}
        onRefreshRadios={() => loadRadios(false)}
        isRefreshing={isRefreshing}
        onOpenHomeAssistantModal={() => setIsHaModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Hero Section: Currently Selected Radio & Live Playing Metadata */}
        {currentRadio && (
          <section id="hero-player-container">
            <NowPlayingHero
              radio={currentRadio}
              isPlaying={isPlaying}
              onPlayToggle={handlePlayToggle}
              nowPlaying={nowPlaying}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={currentRadio.isFavorite}
            />
          </section>
        )}

        {/* Stations Catalogue */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-red-500" />
              <h3 className="text-xl font-black text-white tracking-tight font-['Space_Grotesk',sans-serif]">
                Les Stations
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Europe 2 • NRJ • Fun Radio • Radio FG
            </span>
          </div>

          <RadioList
            radios={radios}
            currentRadio={currentRadio}
            isPlaying={isPlaying}
            onSelectRadio={handleSelectRadio}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>

      </main>

      {/* Sticky Bottom Audio Player with Volume & Play Controls */}
      <AudioPlayer
        currentRadio={currentRadio}
        isPlaying={isPlaying}
        onPlayToggle={handlePlayToggle}
        onNextRadio={handleNextRadio}
        onPrevRadio={handlePrevRadio}
        nowPlaying={nowPlaying}
        onSelectRadio={handleSelectRadio}
      />

      {/* Home Assistant Integration Modal */}
      <HomeAssistantModal
        isOpen={isHaModalOpen}
        onClose={() => setIsHaModalOpen(false)}
        radios={radios}
      />

    </div>
  );
}
