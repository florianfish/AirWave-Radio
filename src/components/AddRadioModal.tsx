import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Radio as RadioIcon, 
  Globe, 
  Music, 
  Link as LinkIcon, 
  Search, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Play, 
  Pause,
  Compass,
  ListPlus
} from 'lucide-react';
import { RadioStation, DirectorySearchResult } from '../types';
import { api } from '../services/api';

interface AddRadioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRadioAdded: (newRadio: RadioStation) => void;
}

// Popular suggested stations for 1-click add
const PRESET_SUGGESTIONS: Array<Partial<RadioStation>> = [
  {
    name: 'Europe 1',
    streamUrl: 'https://europe1.lmn.fm/europe1.mp3',
    logoUrl: '/logos/europe1.svg',
    genre: 'Généraliste, Actualité & Débats',
    tagline: 'Écoutez le monde changer',
    bitrate: 128,
  },
  {
    name: 'RFM',
    streamUrl: 'https://rfm.lmn.fm/rfm.mp3',
    logoUrl: '/logos/rfm.svg',
    genre: 'Pop, Variété, Hits',
    tagline: 'Le Meilleur de la Musique',
    bitrate: 128,
  },
  {
    name: 'Nostalgie',
    streamUrl: 'https://scdn.nrjaudio.fm/adwz2/fr/30601/mp3_128.mp3',
    logoUrl: '/logos/nostalgie.svg',
    genre: 'Les Plus Grands Hits',
    tagline: 'Les Plus Grands Titres',
    bitrate: 128,
  },
  {
    name: 'Chérie FM',
    streamUrl: 'https://scdn.nrjaudio.fm/adwz2/fr/30201/mp3_128.mp3',
    logoUrl: '/logos/cheriefm.svg',
    genre: 'Pop & Love',
    tagline: 'Feel Good Music',
    bitrate: 128,
  },
  {
    name: 'Radio FG',
    streamUrl: 'https://radiofg.impek.com/fg',
    logoUrl: '/logos/radiofg.svg',
    genre: 'House, Deep, Electro',
    tagline: 'Feel Good',
    bitrate: 128,
  },
  {
    name: 'Jazz Radio',
    streamUrl: 'https://jazzradio.ice.infomaniak.ch/jazzradio-high.mp3',
    logoUrl: '/logos/jazzradio.svg',
    genre: 'Jazz, Soul, Blues',
    tagline: 'Ladies & Crooners',
    bitrate: 128,
  },
  {
    name: 'Mouv\'',
    streamUrl: 'https://icecast.radiofrance.fr/mouv-midfi.mp3',
    logoUrl: '/logos/mouv.svg',
    genre: 'Hip-Hop, Rap, R&B',
    tagline: 'Hip-Hop Never Stop',
    bitrate: 128,
  },
  {
    name: 'RMC',
    streamUrl: 'https://audio.bfmtv.com/rmcradio_128.mp3',
    logoUrl: '/logos/rmc.svg',
    genre: 'Info, Talk & Sport',
    tagline: 'Info, Talk, Sport',
    bitrate: 128,
  }
];

export const AddRadioModal: React.FC<AddRadioModalProps> = ({
  isOpen,
  onClose,
  onRadioAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'directory' | 'presets'>('manual');
  
  // Manual Form State
  const [name, setName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [genre, setGenre] = useState('');
  const [tagline, setTagline] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Audio testing in modal
  const [testAudio, setTestAudio] = useState<HTMLAudioElement | null>(null);
  const [isTestingStream, setIsTestingStream] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  // Directory Search State
  const [dirQuery, setDirQuery] = useState('');
  const [dirResults, setDirResults] = useState<DirectorySearchResult[]>([]);
  const [isSearchingDir, setIsSearchingDir] = useState(false);

  if (!isOpen) return null;

  const handleTestStream = (urlToTest: string) => {
    if (!urlToTest.trim()) {
      setTestStatus('error');
      return;
    }

    if (testAudio) {
      testAudio.pause();
      testAudio.src = '';
    }

    setTestStatus('testing');
    const audio = new Audio(urlToTest.trim());
    setTestAudio(audio);

    audio.oncanplay = () => {
      setTestStatus('success');
      audio.play().catch(() => {});
      setTimeout(() => {
        audio.pause();
        setTestStatus('idle');
      }, 5000);
    };

    audio.onerror = () => {
      setTestStatus('error');
    };

    audio.load();
  };

  const stopTestAudio = () => {
    if (testAudio) {
      testAudio.pause();
      testAudio.src = '';
      setTestAudio(null);
    }
    setTestStatus('idle');
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Veuillez renseigner le nom de la radio.');
      return;
    }
    if (!streamUrl.trim()) {
      setFormError('Veuillez renseigner l\'URL du flux audio.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    stopTestAudio();

    try {
      const added = await api.addRadio({
        name: name.trim(),
        streamUrl: streamUrl.trim(),
        logoUrl: logoUrl.trim() || undefined,
        genre: genre.trim() || 'Généraliste',
        tagline: tagline.trim() || '',
        websiteUrl: websiteUrl.trim() || undefined,
      });

      onRadioAdded(added);
      resetForm();
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPreset = async (preset: Partial<RadioStation>) => {
    setIsSubmitting(true);
    try {
      const added = await api.addRadio(preset);
      onRadioAdded(added);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'ajout de la station');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDirectoryStation = async (station: DirectorySearchResult) => {
    setIsSubmitting(true);
    try {
      const added = await api.addRadio({
        name: station.name,
        streamUrl: station.url_resolved || station.url,
        logoUrl: station.favicon || undefined,
        genre: station.tags ? station.tags.split(',').slice(0, 3).join(', ') : 'Radio en ligne',
        country: station.country,
        bitrate: station.bitrate || 128,
        websiteUrl: station.homepage || undefined,
      });
      onRadioAdded(added);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'ajout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchDirectory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirQuery.trim()) return;

    setIsSearchingDir(true);
    try {
      const results = await api.searchDirectory(dirQuery.trim());
      setDirResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingDir(false);
    }
  };

  const resetForm = () => {
    setName('');
    setStreamUrl('');
    setLogoUrl('');
    setGenre('');
    setTagline('');
    setWebsiteUrl('');
    setFormError(null);
    stopTestAudio();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#121214] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1a1a1c]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-['Space_Grotesk',sans-serif]">
                Ajouter une radio
              </h3>
              <p className="text-xs text-slate-400">
                Enregistrement persistant dans la base de données
              </p>
            </div>
          </div>

          <button
            id="close-add-modal-btn"
            onClick={() => {
              stopTestAudio();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0a0a0c]/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListPlus className="w-4 h-4" />
            Ajout direct / Manuel
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            Annuaire mondial (40 000+)
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'presets'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Radios populaires
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* TAB 1: MANUAL FORM */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Station Name & Genre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nom de la radio *
                  </label>
                  <input
                    id="new-radio-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Virgin Radio, RTL, FIP..."
                    className="w-full bg-[#0a0a0c] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Genre / Style musical
                  </label>
                  <input
                    id="new-radio-genre-input"
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="ex: Pop-Rock, Électro, Jazz, Talk..."
                    className="w-full bg-[#0a0a0c] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              {/* Stream URL & Test Button */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL du flux audio direct (MP3 / AAC) *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      id="new-radio-stream-input"
                      type="url"
                      required
                      value={streamUrl}
                      onChange={(e) => {
                        setStreamUrl(e.target.value);
                        stopTestAudio();
                      }}
                      placeholder="https://flux.radio.fr/direct.mp3"
                      className="w-full bg-[#0a0a0c] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTestStream(streamUrl)}
                    disabled={!streamUrl.trim()}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                      testStatus === 'success'
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                        : testStatus === 'error'
                        ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {testStatus === 'testing' ? (
                      <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                    ) : testStatus === 'success' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Flux OK (5s)
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Tester
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Logo URL with Live Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL du logo de la radio (Image PNG / SVG / JPG)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      id="new-radio-logo-input"
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://.../logo.png"
                      className="w-full bg-[#0a0a0c] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-[#0a0a0c] border border-slate-800 flex items-center justify-center p-1 flex-shrink-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Aperçu logo"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <RadioIcon className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Tagline & Website URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Slogan / Description courte
                  </label>
                  <input
                    id="new-radio-tagline-input"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="ex: Le Meilleur Son Pop-Rock"
                    className="w-full bg-[#0a0a0c] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Site web officiel (optionnel)
                  </label>
                  <input
                    id="new-radio-website-input"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.radio.fr"
                    className="w-full bg-[#0a0a0c] border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  id="save-new-radio-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Sauvegarder dans la base
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: DIRECTORY SEARCH */}
          {activeTab === 'directory' && (
            <div className="space-y-4">
              <form onSubmit={handleSearchDirectory} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={dirQuery}
                    onChange={(e) => setDirQuery(e.target.value)}
                    placeholder="Rechercher par nom (ex: Virgin, RTL, Jazz, BBC, Rock...)"
                    className="w-full bg-[#0a0a0c] border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingDir || !dirQuery.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSearchingDir ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search className="w-3.5 h-3.5" />}
                  Rechercher
                </button>
              </form>

              {/* Directory Results */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {dirResults.length === 0 && !isSearchingDir && (
                  <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
                    <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-semibold">
                      Explorez l'annuaire ouvert de plus de 40 000 radios mondiales
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Tapez un mot-clé pour trouver et ajouter n'importe quelle radio en 1 clic
                    </p>
                  </div>
                )}

                {dirResults.map((station) => (
                  <div
                    key={station.stationuuid}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#0a0a0c] border border-slate-800 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[#1a1a1c] border border-slate-800 p-1 flex items-center justify-center flex-shrink-0">
                        {station.favicon ? (
                          <img
                            src={station.favicon}
                            alt={station.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <RadioIcon className="w-5 h-5 text-slate-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h5 className="font-bold text-white text-sm truncate">
                          {station.name}
                        </h5>
                        <p className="text-[11px] text-slate-400 truncate">
                          {station.tags || station.country || 'Radio'} • {station.bitrate || 128} kbps
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddDirectoryStation(station)}
                      disabled={isSubmitting}
                      className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: POPULAR PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Sélectionnez une station populaire prête à être importée dans votre base de données :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_SUGGESTIONS.map((preset) => (
                  <div
                    key={preset.name}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#0a0a0c] border border-slate-800 hover:border-blue-600/50 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#1a1a1c] border border-slate-800 p-1 flex items-center justify-center flex-shrink-0">
                        {preset.logoUrl ? (
                          <img src={preset.logoUrl} alt={preset.name} className="w-full h-full object-contain" />
                        ) : (
                          <RadioIcon className="w-5 h-5 text-slate-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h5 className="font-bold text-white text-sm truncate">
                          {preset.name}
                        </h5>
                        <p className="text-[11px] text-slate-400 truncate">
                          {preset.genre}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddPreset(preset)}
                      disabled={isSubmitting}
                      className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
