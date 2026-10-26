import React, { useState } from 'react';
import { X, Copy, Check, Radio, Volume2, LayoutDashboard, Cpu, Sparkles, ExternalLink } from 'lucide-react';
import { RadioStation } from '../types';

interface HomeAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  radios: RadioStation[];
}

export const HomeAssistantModal: React.FC<HomeAssistantModalProps> = ({
  isOpen,
  onClose,
  radios,
}) => {
  const [activeTab, setActiveTab] = useState<'speakers' | 'dashboard' | 'sensor' | 'addon'>('speakers');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const lovelaceYaml = `type: custom:mini-media-player
entity: media_player.salon
name: Radios Françaises
icon: mdi:radio
shortcuts:
  columns: 4
  buttons:
    - name: Europe 2
      icon: mdi:radio-tower
      type: service
      id: media_player.play_media
      data:
        entity_id: media_player.salon
        media_content_id: "https://europe2.lmn.fm/europe2.mp3"
        media_content_type: "music"
    - name: NRJ
      icon: mdi:fire
      type: service
      id: media_player.play_media
      data:
        entity_id: media_player.salon
        media_content_id: "https://scdn.nrjaudio.fm/adwz2/fr/30001/mp3_128.mp3"
        media_content_type: "music"
    - name: Fun Radio
      icon: mdi:party-popper
      type: service
      id: media_player.play_media
      data:
        entity_id: media_player.salon
        media_content_id: "https://icecast.funradio.fr/fun-1-44-128?listen=webCwsAudioStream"
        media_content_type: "music"
    - name: Radio FG
      icon: mdi:disc
      type: service
      id: media_player.play_media
      data:
        entity_id: media_player.salon
        media_content_id: "https://radiofg.impek.com/fg"
        media_content_type: "music"`;

  const automationYaml = `alias: "Matin - Réveil en musique Europe 2"
trigger:
  - platform: time
    at: "07:15:00"
action:
  - action: media_player.play_media
    target:
      entity_id: media_player.enceinte_chambre
    data:
      media_content_id: "https://europe2.lmn.fm/europe2.mp3"
      media_content_type: "music"
mode: single`;

  const sensorYaml = `# Dans configuration.yaml pour afficher le titre Europe 2 en temps réel :
sensor:
  - platform: rest
    name: "Europe 2 Titre en cours"
    resource: "http://127.0.0.1:3000/api/radios/europe-2/now-playing"
    scan_interval: 20
    value_template: "{{ value_json.title }}"
    json_attributes:
      - artist
      - rawTitle
      - artworkUrl`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#141418] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-[#16161b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              {/* Home Assistant icon shape */}
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M12,3L2,12H5V20H19V12H22L12,3M12,7.7C13.2,7.7 14.2,8.7 14.2,9.9C14.2,10.7 13.7,11.4 13,11.8V15H11V11.8C10.3,11.4 9.8,10.7 9.8,9.9C9.8,8.7 10.8,7.7 12,7.7M7,13H9V18H7V13M15,13H17V18H15V13Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk',sans-serif]">
                  Intégration Home Assistant
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Ingress Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Module complémentaire & diffusion sur enceintes connectées
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/80 bg-[#141418] overflow-x-auto">
          <button
            onClick={() => setActiveTab('speakers')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'speakers'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Flux Enceintes (Cast / Sonos)
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Carte Lovelace Dashboard
          </button>

          <button
            onClick={() => setActiveTab('sensor')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sensor'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Capteur REST (Titre live)
          </button>

          <button
            onClick={() => setActiveTab('addon')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'addon'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Add-on & Ingress
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* TAB 1: SPEAKERS */}
          {activeTab === 'speakers' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  URLs directes pour Home Assistant <code className="text-blue-400 font-mono text-xs">media_player</code>
                </h4>
                <p className="text-xs text-slate-400">
                  Ces flux HTTPS directs peuvent être joués directement sur vos enceintes Google Home, Sonos, Amazon Echo ou navigateurs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {radios.map((r) => (
                  <div key={r.id} className="p-3.5 rounded-2xl bg-[#1a1a1f] border border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm truncate">{r.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">{r.streamUrl}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(r.streamUrl, r.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
                    >
                      {copiedKey === r.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Exemple d'action ou automatisation YAML :</span>
                  <button
                    onClick={() => copyToClipboard(automationYaml, 'auto')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'auto' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedKey === 'auto' ? 'Copié !' : 'Copier le code YAML'}
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-[#0e0e11] border border-slate-800/90 text-xs font-mono text-slate-300 overflow-x-auto selection:bg-blue-600">
                  {automationYaml}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: DASHBOARD LOVELACE */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  Carte Lovelace <span className="text-blue-400 font-mono text-xs">mini-media-player</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Collez ce code dans une carte de votre tableau de bord Home Assistant pour disposer de 4 boutons directs pour Europe 2, NRJ, Fun Radio et Radio FG.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-300">Code YAML de la carte :</span>
                <button
                  onClick={() => copyToClipboard(lovelaceYaml, 'lovelace')}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'lovelace' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'lovelace' ? 'Copié !' : 'Copier le YAML'}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#0e0e11] border border-slate-800/90 text-xs font-mono text-slate-300 overflow-x-auto selection:bg-blue-600">
                {lovelaceYaml}
              </pre>
            </div>
          )}

          {/* TAB 3: REST SENSOR */}
          {activeTab === 'sensor' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  Capteur REST pour afficher le titre et l'artiste en direct
                </h4>
                <p className="text-xs text-slate-400">
                  Interrogez l'API locale du module (<code className="text-blue-400 font-mono text-xs">/api/radios/:id/now-playing</code>) pour remonter automatiquement les chansons en cours dans vos entités Home Assistant.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-300">À coller dans configuration.yaml :</span>
                <button
                  onClick={() => copyToClipboard(sensorYaml, 'sensor')}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'sensor' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'sensor' ? 'Copié !' : 'Copier la configuration'}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-[#0e0e11] border border-slate-800/90 text-xs font-mono text-slate-300 overflow-x-auto selection:bg-blue-600">
                {sensorYaml}
              </pre>
            </div>
          )}

          {/* TAB 4: ADD-ON & INGRESS */}
          {activeTab === 'addon' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
                Ce projet est configuré comme un Add-on Home Assistant officiel complet avec les fichiers 
                <strong className="text-white"> config.yaml</strong>, <strong className="text-white">repository.yaml</strong>, <strong className="text-white">Dockerfile</strong>, <strong className="text-white">run.sh</strong> et <strong className="text-white">DOCS.md</strong> (inspiré du modèle de dépôt de florianfish).
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white text-sm">Comment l'ajouter à votre Home Assistant :</div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>Allez dans <strong className="text-slate-200">Paramètres &gt; Modules complémentaires &gt; Boutique</strong>.</li>
                  <li>Cliquez sur les <strong className="text-slate-200">3 points en haut à droite &gt; Dépôts</strong>.</li>
                  <li>Ajoutez l'URL GitHub de votre dépôt.</li>
                  <li>Recherchez <strong className="text-slate-200">Radios Françaises</strong> et cliquez sur Installer.</li>
                  <li>Activez <strong className="text-slate-200">Lancer au démarrage</strong> et <strong className="text-slate-200">Afficher dans la barre latérale</strong>.</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#16161b] flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Compatible avec Home Assistant OS, Supervised et Container
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
