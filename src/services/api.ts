import { RadioStation, TrackHistoryItem, NowPlayingInfo, DirectorySearchResult } from '../types';

/**
 * Normalizes endpoints and local asset paths so they work seamlessly both in
 * standalone mode (e.g. http://localhost:3000) and inside Home Assistant Ingress
 * (e.g. http://homeassistant.local:8123/api/hassio_ingress/<token>/).
 */
export function getRelativePath(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `./${clean}`;
}

export const api = {
  async getRadios(): Promise<RadioStation[]> {
    const res = await fetch(getRelativePath('/api/radios'));
    if (!res.ok) throw new Error('Impossible de charger les radios');
    return res.json();
  },

  async addRadio(data: Partial<RadioStation>): Promise<RadioStation> {
    const res = await fetch(getRelativePath('/api/radios'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur lors de l\'ajout' }));
      throw new Error(err.error || 'Erreur lors de l\'ajout de la radio');
    }
    return res.json();
  },

  async updateRadio(id: string, data: Partial<RadioStation>): Promise<RadioStation> {
    const res = await fetch(getRelativePath(`/api/radios/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Impossible de modifier la radio');
    return res.json();
  },

  async deleteRadio(id: string): Promise<void> {
    const res = await fetch(getRelativePath(`/api/radios/${id}`), { method: 'DELETE' });
    if (!res.ok) throw new Error('Impossible de supprimer la radio');
  },

  async resetRadios(): Promise<RadioStation[]> {
    const res = await fetch(getRelativePath('/api/radios/reset'), { method: 'POST' });
    if (!res.ok) throw new Error('Impossible de réinitialiser les radios');
    return res.json();
  },

  async getNowPlaying(stationId: string): Promise<NowPlayingInfo> {
    const res = await fetch(getRelativePath(`/api/radios/${stationId}/now-playing`));
    if (!res.ok) throw new Error('Impossible de récupérer le titre en cours');
    return res.json();
  },

  async getStationHistory(stationId: string): Promise<TrackHistoryItem[]> {
    const res = await fetch(getRelativePath(`/api/radios/${stationId}/history`));
    if (!res.ok) throw new Error('Impossible de récupérer l\'historique');
    return res.json();
  },

  async clearStationHistory(stationId: string): Promise<void> {
    const res = await fetch(getRelativePath(`/api/radios/${stationId}/history`), { method: 'DELETE' });
    if (!res.ok) throw new Error('Impossible d\'effacer l\'historique');
  },

  async searchDirectory(query: string): Promise<DirectorySearchResult[]> {
    if (!query.trim()) return [];
    const res = await fetch(getRelativePath(`/api/directory/search?q=${encodeURIComponent(query)}`));
    if (!res.ok) return [];
    return res.json();
  },

  async testStreamUrl(url: string): Promise<{ valid: boolean; error?: string }> {
    const res = await fetch(getRelativePath(`/api/test-stream?url=${encodeURIComponent(url)}`));
    if (!res.ok) return { valid: false, error: 'Erreur réseau' };
    return res.json();
  }
};
