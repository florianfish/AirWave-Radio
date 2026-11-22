import React, { useState, useEffect, useCallback } from 'react';
import { RadioStation, NowPlayingInfo } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { NowPlayingHero } from './components/NowPlayingHero';
import { AudioPlayer } from './components/AudioPlayer';
import { RadioList } from './components/RadioList';
import { HomeAssistantModal } from './components/HomeAssistantModal';
import { getStationAccent } from './theme';

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

  // 2. Live Now Playing metadata for the active radio (pushed by the server via SSE)
  useEffect(() => {
    if (!currentRadio) return;
    setNowPlaying(null);
    return api.subscribeNowPlaying(currentRadio.id, setNowPlaying);
  }, [currentRadio?.id]);

  // Tint the whole UI with the selected station's signature colour
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', getStationAccent(currentRadio?.name));
  }, [currentRadio?.name]);

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
    <div className="relative min-h-screen bg-ink-950 text-slate-100 flex flex-col pb-40 md:pb-32 selection:bg-accent selection:text-white">
      <div className="app-backdrop" aria-hidden="true" />

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
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">

        {/* Hero Section: Currently Selected Radio & Live Playing Metadata */}
        {currentRadio ? (
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
        ) : isLoadingRadios ? (
          <div className="h-[420px] rounded-[36px] bg-ink-850 border border-line animate-pulse" />
        ) : null}

        {/* Stations Catalogue */}
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-accent mb-1.5">
                Sélecteur
              </p>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                Les stations
              </h3>
            </div>
            <span className="hidden sm:inline text-xs text-slate-500 font-mono">
              {String(radios.length).padStart(2, '0')} en direct · Espace = lecture/pause
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
