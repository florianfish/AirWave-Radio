import express from 'express';
import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import { createServer as createViteServer } from 'vite';

interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  fallbackStreamUrl?: string;
  logoUrl: string;
  genre?: string;
  tagline?: string;
  country?: string;
  bitrate?: number;
  codec?: string;
  isCustom?: boolean;
  isFavorite?: boolean;
  websiteUrl?: string;
  createdAt: string;
}

interface TrackHistoryItem {
  id: string;
  stationId: string;
  stationName?: string;
  artist: string;
  title: string;
  playedAt: string;
  artworkUrl?: string;
  album?: string;
  externalLinks?: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
  };
}

const PORT = Number(process.env.PORT) || 3000;
// In Home Assistant Add-on environment, /data is mounted by Supervisor for persistent storage
const DATA_DIR = fs.existsSync('/data') && fs.statSync('/data').isDirectory()
  ? '/data'
  : path.join(process.cwd(), 'data');
const RADIOS_FILE = path.join(DATA_DIR, 'radios.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Fixed 4 stations as requested: Europe 2, NRJ, Fun Radio, Radio FG
const DEFAULT_RADIOS: RadioStation[] = [
  {
    id: 'europe-2',
    name: 'Europe 2',
    streamUrl: 'https://europe2.lmn.fm/europe2.mp3',
    fallbackStreamUrl: 'https://stream.europe2.fr/europe2-128.mp3',
    logoUrl: '/logos/europe2.png',
    genre: 'Pop, Rock, Hits',
    tagline: 'Le Meilleur Son Pop-Rock',
    country: 'France',
    bitrate: 128,
    codec: 'MP3',
    isFavorite: true,
    websiteUrl: 'https://www.europe2.fr',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'nrj',
    name: 'NRJ',
    streamUrl: 'https://scdn.nrjaudio.fm/adwz2/fr/30001/mp3_128.mp3',
    logoUrl: '/logos/nrj.svg',
    genre: 'Hits, Pop, Electro',
    tagline: 'Hit Music Only',
    country: 'France',
    bitrate: 128,
    codec: 'MP3',
    isFavorite: false,
    websiteUrl: 'https://www.nrj.fr',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fun-radio',
    name: 'Fun Radio',
    streamUrl: 'https://icecast.funradio.fr/fun-1-44-128?listen=webCwsAudioStream',
    logoUrl: '/logos/funradio.svg',
    genre: 'Dance, Electro, Latino',
    tagline: 'Enjoy the music',
    country: 'France',
    bitrate: 128,
    codec: 'MP3',
    isFavorite: false,
    websiteUrl: 'https://www.funradio.fr',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'radio-fg',
    name: 'Radio FG',
    streamUrl: 'https://radiofg.impek.com/fg',
    logoUrl: '/logos/radiofg.png',
    genre: 'Electro, House, Dance',
    tagline: 'Feel Good & DJ Radio',
    country: 'France',
    bitrate: 128,
    codec: 'MP3',
    isFavorite: false,
    websiteUrl: 'https://www.radiofg.com',
    createdAt: new Date().toISOString(),
  }
];

// Helper to assign reliable SVG logos based on station identity
function getCleanStationLogo(name: string, id: string, currentLogoUrl?: string): string {
  const n = (name + ' ' + id).toLowerCase();
  if (n.includes('europe 2') || n.includes('europe2')) return '/logos/europe2.png';
  if (n.includes('france inter')) return '/logos/franceinter.svg';
  if (n.includes('rtl2') || n.includes('rtl 2')) return '/logos/rtl2.svg';
  if (n.includes('nrj')) return '/logos/nrj.svg';
  if (n.includes('fip')) return '/logos/fip.svg';
  if (n.includes('radio nova') || n.includes('nova')) return '/logos/radionova.svg';
  if (n.includes('skyrock')) return '/logos/skyrock.svg';
  if (n.includes('fun radio')) return '/logos/funradio.svg';
  if (n.includes('radio fg') || n.includes('fg')) return '/logos/radiofg.png';
  if (n.includes('europe 1') || n.includes('europe1')) return '/logos/europe1.svg';
  if (n.includes('rfm')) return '/logos/rfm.svg';
  if (n.includes('nostalgie')) return '/logos/nostalgie.svg';
  if (n.includes('chérie') || n.includes('cherie')) return '/logos/cheriefm.svg';
  if (n.includes('jazz')) return '/logos/jazzradio.svg';
  if (n.includes('mouv')) return '/logos/mouv.svg';
  if (n.includes('rmc')) return '/logos/rmc.svg';

  // If current URL is wikimedia (which blocks embeds), replace with fallback
  if (currentLogoUrl && currentLogoUrl.includes('wikimedia.org')) {
    return '/logos/default-station.svg';
  }
  return currentLogoUrl || '/logos/default-station.svg';
}

// In-memory data store with file persistence
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadRadios(): RadioStation[] {
  ensureDataDir();
  try {
    if (fs.existsSync(RADIOS_FILE)) {
      const data = fs.readFileSync(RADIOS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Upgrade any broken or Wikimedia logos
        let updated = false;
        const upgraded = parsed.map((r: RadioStation) => {
          const cleanLogo = getCleanStationLogo(r.name, r.id, r.logoUrl);
          if (cleanLogo && cleanLogo !== r.logoUrl) {
            updated = true;
            return { ...r, logoUrl: cleanLogo };
          }
          return r;
        });

        if (updated) {
          saveRadios(upgraded);
        }
        return upgraded;
      }
    }
  } catch (err) {
    console.error('Error loading radios file, using defaults:', err);
  }
  // Initialize with defaults
  saveRadios(DEFAULT_RADIOS);
  return DEFAULT_RADIOS;
}

function saveRadios(radios: RadioStation[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(RADIOS_FILE, JSON.stringify(radios, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving radios file:', err);
  }
}

function loadHistory(): TrackHistoryItem[] {
  ensureDataDir();
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading history file:', err);
  }
  return [];
}

function saveHistory(history: TrackHistoryItem[]): void {
  ensureDataDir();
  try {
    // Keep max 200 items in history
    const trimmed = history.slice(0, 200);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving history file:', err);
  }
}

// Artwork caching to avoid spamming iTunes Search
const artworkCache = new Map<string, { artworkUrl: string; album?: string; artist?: string; title?: string }>();

async function fetchArtwork(artist: string, title: string): Promise<{ artworkUrl?: string; album?: string; cleanArtist?: string; cleanTitle?: string }> {
  const query = `${artist} ${title}`.trim();
  if (!query || query.length < 3) return {};

  const cacheKey = query.toLowerCase();
  if (artworkCache.has(cacheKey)) {
    return artworkCache.get(cacheKey)!;
  }

  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    const res = await fetch(itunesUrl, { headers: { 'User-Agent': 'RadioEnLigne/1.0' } });
    if (res.ok) {
      const data: any = await res.json();
      if (data.results && data.results.length > 0) {
        const item = data.results[0];
        let artwork = item.artworkUrl100 || item.artworkUrl60;
        if (artwork) {
          // Upgrade to higher resolution 600x600
          artwork = artwork.replace('100x100bb.jpg', '600x600bb.jpg').replace('60x60bb.jpg', '600x600bb.jpg');
        }
        const result = {
          artworkUrl: artwork,
          album: item.collectionName,
          cleanArtist: item.artistName || artist,
          cleanTitle: item.trackName || title,
        };
        artworkCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    // Ignore iTunes search error gracefully
  }

  return {};
}

// Specialized Providers for stations with dedicated live APIs
async function fetchEurope2OrRfmMetadata(radioNum: number = 2): Promise<{
  artist?: string;
  title?: string;
  artworkUrl?: string;
  time?: string;
  history?: Array<{ artist: string; title: string; imageUrl?: string; time: string }>;
} | null> {
  try {
    const res = await fetch(`https://direct-radio.rfm.fr/playout?radio=${radioNum}&limit=20`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.europe2.fr/',
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (!data.nowplaying || !Array.isArray(data.nowplaying) || data.nowplaying.length === 0) return null;

    const songs = data.nowplaying.filter((item: any) => item && (item.type === 'song' || item.title));
    const current = songs.find((item: any) => item.status === 'playing') || songs[0];

    if (!current || !current.title) return null;

    return {
      artist: current.artist ? current.artist.trim() : undefined,
      title: current.title ? current.title.trim() : undefined,
      artworkUrl: current.imageUrl || undefined,
      time: current.time,
      history: songs.map((s: any) => ({
        artist: s.artist ? s.artist.trim() : '',
        title: s.title ? s.title.trim() : '',
        imageUrl: s.imageUrl,
        time: s.time,
      })),
    };
  } catch (err) {
    return null;
  }
}

// Specialized Provider for NRJ Live Metadata
async function fetchNrjMetadata(): Promise<{
  artist?: string;
  title?: string;
  artworkUrl?: string;
  history?: Array<{ artist: string; title: string; time?: string }>;
} | null> {
  try {
    const res = await fetch('https://onlineradiobox.com/fr/nrjfrance/playlist/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(4500),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
    const songs: Array<{ artist: string; title: string; time?: string }> = [];

    for (const r of rows) {
      const timeM = r.match(/class="time[^"]*"[^>]*>([^<]+)</i);
      const trackM = r.match(/class="track_name_wrapper"[^>]*>([\s\S]*?)<\/td>/i) || r.match(/<a[^>]*class="ajax"[^>]*>([\s\S]*?)<\/a>/i);
      if (trackM) {
        let raw = trackM[1]
          .replace(/<[^>]+>/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\s+/g, ' ')
          .trim();

        if (
          raw &&
          !raw.toLowerCase().includes('hit music only') &&
          !raw.toLowerCase().includes('publicit') &&
          !raw.toLowerCase().includes('nrj') &&
          raw.length > 3
        ) {
          let artist = '';
          let title = raw;
          if (raw.includes(' - ')) {
            const parts = raw.split(' - ');
            artist = parts[0].trim();
            title = parts.slice(1).join(' - ').trim();
          }
          songs.push({
            artist,
            title,
            time: timeM ? timeM[1].trim() : undefined,
          });
        }
      }
    }

    if (songs.length === 0) return null;

    const current = songs[0];
    return {
      artist: current.artist,
      title: current.title,
      history: songs,
    };
  } catch (err) {
    return null;
  }
}

async function fetchRadioFranceMetadata(stationId: number): Promise<{
  artist?: string;
  title?: string;
  artworkUrl?: string;
  album?: string;
} | null> {
  try {
    const res = await fetch(`https://api.radiofrance.fr/livemeta/pull/${stationId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RadioEnLigne/1.0)' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (!data.steps) return null;

    const now = Math.floor(Date.now() / 1000);
    const steps = Object.values(data.steps) as any[];

    // 1. Prioritize song currently playing
    let current = steps.find((s) => s.embedType === 'song' && s.start <= now && s.end >= now);
    if (!current) {
      // Most recent song
      const songs = steps.filter((s) => s.embedType === 'song').sort((a, b) => b.start - a.start);
      current = songs[0];
    }
    if (!current) {
      // Current program/expression
      current = steps.find((s) => s.start <= now && s.end >= now) || steps[0];
    }

    if (!current || !current.title) return null;

    return {
      artist: current.authors || current.performers || current.titleConcept || undefined,
      title: current.title,
      artworkUrl: current.visual || undefined,
      album: current.titreAlbum || undefined,
    };
  } catch (err) {
    return null;
  }
}

// Extract ICY Stream Title
function fetchIcyMetadata(streamUrl: string): Promise<{ rawTitle?: string; artist?: string; title?: string }> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(streamUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.request(
        {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (isHttps ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'GET',
          headers: {
            'Icy-MetaData': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          },
          timeout: 4000,
        },
        (res) => {
          // Check for redirect
          if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            req.destroy();
            fetchIcyMetadata(res.headers.location).then(resolve);
            return;
          }

          const icyMetaIntHeader = res.headers['icy-metaint'];
          if (!icyMetaIntHeader) {
            req.destroy();
            resolve({});
            return;
          }

          const metaInt = parseInt(Array.isArray(icyMetaIntHeader) ? icyMetaIntHeader[0] : icyMetaIntHeader, 10);
          if (isNaN(metaInt) || metaInt <= 0) {
            req.destroy();
            resolve({});
            return;
          }

          let bytesRead = 0;
          let readingMeta = false;
          let metaLength = 0;
          let metaBytesRead = 0;
          let metaBuffer: Buffer[] = [];

          res.on('data', (chunk: Buffer) => {
            let offset = 0;
            while (offset < chunk.length) {
              if (!readingMeta) {
                const remainingAudio = metaInt - bytesRead;
                const chunkAvailable = chunk.length - offset;

                if (chunkAvailable >= remainingAudio) {
                  offset += remainingAudio;
                  bytesRead = 0;
                  readingMeta = true;
                  metaLength = chunk[offset] * 16;
                  offset += 1;
                  metaBytesRead = 0;
                  metaBuffer = [];
                  if (metaLength === 0) {
                    readingMeta = false;
                  }
                } else {
                  bytesRead += chunkAvailable;
                  offset += chunkAvailable;
                }
              } else {
                const chunkAvailable = chunk.length - offset;
                const needed = metaLength - metaBytesRead;
                const toRead = Math.min(chunkAvailable, needed);

                metaBuffer.push(chunk.subarray(offset, offset + toRead));
                metaBytesRead += toRead;
                offset += toRead;

                if (metaBytesRead >= metaLength) {
                  const metaStr = Buffer.concat(metaBuffer).toString('utf-8');
                  req.destroy();

                  const match = metaStr.match(/StreamTitle='([^']*)';/);
                  if (match && match[1]) {
                    const raw = match[1].trim();
                    if (raw) {
                      let artist = '';
                      let title = raw;
                      if (raw.includes(' - ')) {
                        const parts = raw.split(' - ');
                        artist = parts[0].trim();
                        title = parts.slice(1).join(' - ').trim();
                      }
                      resolve({ rawTitle: raw, artist, title });
                      return;
                    }
                  }
                  resolve({});
                  return;
                }
              }
            }
          });

          res.on('error', () => {
            req.destroy();
            resolve({});
          });
        }
      );

      req.on('error', () => {
        resolve({});
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({});
      });

      req.end();
    } catch {
      resolve({});
    }
  });
}

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // API Routes
  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), platform: 'homeassistant-addon-compatible' });
  });

  // Home Assistant Status & Integration Info
  app.get('/api/ha/status', (req, res) => {
    const radios = loadRadios();
    res.json({
      name: 'Radios Françaises Add-on',
      version: '1.0.0',
      ingress: true,
      totalStations: radios.length,
      stations: radios.map((r) => ({
        id: r.id,
        name: r.name,
        streamUrl: r.streamUrl,
        fallbackStreamUrl: r.fallbackStreamUrl,
        logoUrl: r.logoUrl,
        genre: r.genre,
        bitrate: r.bitrate,
        media_player_example: {
          action: 'media_player.play_media',
          target: { entity_id: 'media_player.salon' },
          data: {
            media_content_id: r.streamUrl,
            media_content_type: 'music',
          },
        },
      })),
    });
  });

  // 2. Get all radios
  app.get('/api/radios', (req, res) => {
    const radios = loadRadios();
    res.json(radios);
  });

  // 3. Add a radio
  app.post('/api/radios', (req, res) => {
    const { name, streamUrl, logoUrl, genre, tagline, country, bitrate, websiteUrl, fallbackStreamUrl } = req.body;
    if (!name || !streamUrl) {
      res.status(400).json({ error: 'Le nom et l\'URL du flux sont obligatoires.' });
      return;
    }

    const radios = loadRadios();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

    const newRadio: RadioStation = {
      id,
      name: name.trim(),
      streamUrl: streamUrl.trim(),
      fallbackStreamUrl: fallbackStreamUrl?.trim() || undefined,
      logoUrl: logoUrl?.trim() || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&auto=format&fit=crop&q=80',
      genre: genre?.trim() || 'Musique & Radio',
      tagline: tagline?.trim() || '',
      country: country?.trim() || 'France',
      bitrate: Number(bitrate) || 128,
      codec: streamUrl.includes('.aac') ? 'AAC' : 'MP3',
      isCustom: true,
      isFavorite: false,
      websiteUrl: websiteUrl?.trim() || '',
      createdAt: new Date().toISOString(),
    };

    radios.push(newRadio);
    saveRadios(radios);
    res.status(201).json(newRadio);
  });

  // 4. Update a radio
  app.put('/api/radios/:id', (req, res) => {
    const { id } = req.params;
    const radios = loadRadios();
    const index = radios.findIndex((r) => r.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Radio introuvable.' });
      return;
    }

    radios[index] = {
      ...radios[index],
      ...req.body,
      id, // Preserve immutable ID
    };

    saveRadios(radios);
    res.json(radios[index]);
  });

  // 5. Delete a radio
  app.delete('/api/radios/:id', (req, res) => {
    const { id } = req.params;
    let radios = loadRadios();
    const initialLen = radios.length;
    radios = radios.filter((r) => r.id !== id);

    if (radios.length === initialLen) {
      res.status(404).json({ error: 'Radio introuvable.' });
      return;
    }

    saveRadios(radios);
    res.json({ success: true, message: 'Radio supprimée.' });
  });

  // 6. Reset radios to defaults
  app.post('/api/radios/reset', (req, res) => {
    saveRadios(DEFAULT_RADIOS);
    res.json(DEFAULT_RADIOS);
  });

  // 7. Get Now Playing metadata for a radio
  app.get('/api/radios/:id/now-playing', async (req, res) => {
    const { id } = req.params;
    const radios = loadRadios();
    const station = radios.find((r) => r.id === id);

    if (!station) {
      res.status(404).json({ error: 'Radio non trouvée' });
      return;
    }

    const stationLower = (station.name + ' ' + station.id + ' ' + (station.streamUrl || '')).toLowerCase();
    let artist = '';
    let title = '';
    let artworkUrl = station.logoUrl;
    let album = '';
    let rawTitle = '';

    // 1. Specialized check: Europe 2
    if (stationLower.includes('europe 2') || stationLower.includes('europe2') || station.id === 'europe-2') {
      const e2Data = await fetchEurope2OrRfmMetadata(2);
      if (e2Data && e2Data.title) {
        artist = e2Data.artist || 'Europe 2';
        title = e2Data.title;
        rawTitle = `${artist} - ${title}`;
        if (e2Data.artworkUrl) {
          artworkUrl = e2Data.artworkUrl;
        }

        // Sync Europe 2 recent playout songs directly into track history!
        if (e2Data.history && e2Data.history.length > 0) {
          const history = loadHistory();
          let changed = false;

          for (const item of e2Data.history.slice().reverse()) {
            if (!item.title || item.title.toLowerCase() === 'europe 2') continue;
            const exists = history.some(
              (h) =>
                h.stationId === station.id &&
                h.title.toLowerCase() === item.title.toLowerCase() &&
                h.artist.toLowerCase() === item.artist.toLowerCase()
            );

            if (!exists) {
              history.unshift({
                id: `${station.id}-${new Date(item.time || Date.now()).getTime()}-${Math.random().toString(36).slice(2, 6)}`,
                stationId: station.id,
                stationName: station.name,
                artist: item.artist || station.name,
                title: item.title,
                playedAt: item.time ? new Date(item.time).toISOString() : new Date().toISOString(),
                artworkUrl: item.imageUrl || undefined,
                externalLinks: {
                  youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.artist} ${item.title}`)}`,
                  spotify: `https://open.spotify.com/search/${encodeURIComponent(`${item.artist} ${item.title}`)}`,
                  appleMusic: `https://music.apple.com/search?term=${encodeURIComponent(`${item.artist} ${item.title}`)}`,
                },
              });
              changed = true;
            }
          }

          if (changed) {
            saveHistory(history);
          }
        }
      }
    }

    // 2. Specialized check: NRJ
    if (!title && (stationLower.includes('nrj') || station.id === 'nrj')) {
      const nrjData = await fetchNrjMetadata();
      if (nrjData && nrjData.title) {
        artist = nrjData.artist || 'NRJ';
        title = nrjData.title;
        rawTitle = `${artist} - ${title}`;
        if (nrjData.artworkUrl) {
          artworkUrl = nrjData.artworkUrl;
        }

        // Sync NRJ recent playout songs directly into track history
        if (nrjData.history && nrjData.history.length > 0) {
          const history = loadHistory();
          let changed = false;

          for (const item of nrjData.history.slice().reverse()) {
            if (!item.title || item.title.toLowerCase() === 'nrj') continue;
            const exists = history.some(
              (h) =>
                h.stationId === station.id &&
                h.title.toLowerCase() === item.title.toLowerCase() &&
                h.artist.toLowerCase() === (item.artist || '').toLowerCase()
            );

            if (!exists) {
              history.unshift({
                id: `${station.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                stationId: station.id,
                stationName: station.name,
                artist: item.artist || station.name,
                title: item.title,
                playedAt: new Date().toISOString(),
                artworkUrl: undefined,
                externalLinks: {
                  youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${item.artist} ${item.title}`)}`,
                  spotify: `https://open.spotify.com/search/${encodeURIComponent(`${item.artist} ${item.title}`)}`,
                  appleMusic: `https://music.apple.com/search?term=${encodeURIComponent(`${item.artist} ${item.title}`)}`,
                },
              });
              changed = true;
            }
          }

          if (changed) {
            saveHistory(history);
          }
        }
      }
    }

    // 3. Specialized check: RFM
    if (!title && (stationLower.includes('rfm') || station.id === 'rfm')) {
      const rfmData = await fetchEurope2OrRfmMetadata(1);
      if (rfmData && rfmData.title) {
        artist = rfmData.artist || 'RFM';
        title = rfmData.title;
        rawTitle = `${artist} - ${title}`;
        if (rfmData.artworkUrl) artworkUrl = rfmData.artworkUrl;
      }
    }

    // 3. Specialized check: Radio France (FIP: 7, France Inter: 1, France Musique: 4, Mouv: 6)
    if (!title) {
      let rfId: number | null = null;
      if (stationLower.includes('fip')) rfId = 7;
      else if (stationLower.includes('france inter') || station.id === 'france-inter') rfId = 1;
      else if (stationLower.includes('france musique')) rfId = 4;
      else if (stationLower.includes('mouv')) rfId = 6;

      if (rfId) {
        const rfData = await fetchRadioFranceMetadata(rfId);
        if (rfData && rfData.title) {
          artist = rfData.artist || station.name;
          title = rfData.title;
          rawTitle = `${artist} - ${title}`;
          if (rfData.artworkUrl) artworkUrl = rfData.artworkUrl;
          if (rfData.album) album = rfData.album;
        }
      }
    }

    // 4. Default: ICY Metadata stream inspection
    if (!title) {
      let meta = await fetchIcyMetadata(station.streamUrl);
      if (!meta.rawTitle && station.fallbackStreamUrl) {
        meta = await fetchIcyMetadata(station.fallbackStreamUrl);
      }

      if (meta.rawTitle || meta.title) {
        artist = meta.artist || '';
        title = meta.title || meta.rawTitle || '';
        rawTitle = meta.rawTitle || `${artist} - ${title}`;
      }
    }

    // Fallback if no song was detected
    if (!title) {
      title = station.tagline || 'Direct Radio';
      artist = station.name;
    }

    // Lookup high-res artwork if not already provided or if artworkUrl is station logo
    if (title && title !== station.tagline && title !== 'Direct Radio' && (!artworkUrl || artworkUrl === station.logoUrl)) {
      const artInfo = await fetchArtwork(artist || station.name, title);
      if (artInfo.artworkUrl) artworkUrl = artInfo.artworkUrl;
      if (artInfo.album && !album) album = artInfo.album;
      if (artInfo.cleanArtist && !artist) artist = artInfo.cleanArtist;
      if (artInfo.cleanTitle && title === rawTitle) title = artInfo.cleanTitle;
    }

    // Save to history (if it's an actual track, not a default tagline / station name)
    if (title && title !== station.tagline && title !== 'Direct Radio' && title.toLowerCase() !== station.name.toLowerCase()) {
      const history = loadHistory();
      const lastForStation = history.find((h) => h.stationId === station.id);
      const isDuplicate =
        lastForStation &&
        lastForStation.title.toLowerCase() === title.toLowerCase() &&
        lastForStation.artist.toLowerCase() === (artist || station.name).toLowerCase();

      if (!isDuplicate) {
        const historyItem: TrackHistoryItem = {
          id: `${station.id}-${Date.now()}`,
          stationId: station.id,
          stationName: station.name,
          artist: artist || station.name,
          title,
          playedAt: new Date().toISOString(),
          artworkUrl: artworkUrl !== station.logoUrl ? artworkUrl : undefined,
          album: album || undefined,
          externalLinks: {
            youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${title}`)}`,
            spotify: `https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}`,
            appleMusic: `https://music.apple.com/search?term=${encodeURIComponent(`${artist} ${title}`)}`,
          },
        };
        history.unshift(historyItem);
        saveHistory(history);
      }
    }

    res.json({
      stationId: station.id,
      stationName: station.name,
      artist: artist || station.name,
      title: title || station.tagline || 'En direct',
      rawTitle: rawTitle || undefined,
      artworkUrl,
      album: album || undefined,
      updatedAt: new Date().toISOString(),
      isLive: true,
    });
  });

  // 8. Get Track History for a radio
  app.get('/api/radios/:id/history', (req, res) => {
    const { id } = req.params;
    const history = loadHistory();
    const stationHistory = history.filter((h) => h.stationId === id);
    res.json(stationHistory);
  });

  // 9. Get all global track history
  app.get('/api/history', (req, res) => {
    const history = loadHistory();
    res.json(history);
  });

  // 10. Clear track history
  app.delete('/api/radios/:id/history', (req, res) => {
    const { id } = req.params;
    const history = loadHistory();
    const filtered = history.filter((h) => h.stationId !== id);
    saveHistory(filtered);
    res.json({ success: true });
  });

  // 11. Search world radio directory (Radio Browser API proxy)
  app.get('/api/directory/search', async (req, res) => {
    const query = (req.query.q as string || '').trim();
    if (!query) {
      res.json([]);
      return;
    }

    const mirrors = [
      'https://de1.api.radio-browser.info',
      'https://fr1.api.radio-browser.info',
      'https://nl1.api.radio-browser.info',
      'https://at1.api.radio-browser.info'
    ];

    for (const mirror of mirrors) {
      try {
        const searchUrl = `${mirror}/json/stations/byname/${encodeURIComponent(query)}?limit=30&order=votes&reverse=true`;
        const response = await fetch(searchUrl, {
          headers: { 'User-Agent': 'RadioEnLigneApp/1.0' },
          signal: AbortSignal.timeout(4000),
        });
        if (response.ok) {
          const results = await response.json();
          res.json(results);
          return;
        }
      } catch (e) {
        // Try next mirror
      }
    }

    res.json([]);
  });

  // 12. Test Stream audio endpoint
  app.get('/api/test-stream', async (req, res) => {
    const url = req.query.url as string;
    if (!url) {
      res.status(400).json({ valid: false, error: 'URL requise' });
      return;
    }
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-1000' },
        signal: AbortSignal.timeout(4000),
      });
      const contentType = response.headers.get('content-type') || '';
      const isAudio = contentType.includes('audio') || contentType.includes('mpeg') || contentType.includes('aac') || contentType.includes('ogg') || response.ok;
      res.json({ valid: isAudio, contentType, status: response.status });
    } catch (err: any) {
      res.json({ valid: false, error: err.message });
    }
  });

  // 13. Proxy image endpoint to safely load third-party logos
  app.get('/api/proxy-image', async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      res.status(400).send('Missing url parameter');
      return;
    }
    try {
      const upstreamRes = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(6000),
      });
      if (!upstreamRes.ok) {
        res.status(upstreamRes.status).send('Failed to fetch image');
        return;
      }
      const contentType = upstreamRes.headers.get('content-type') || 'image/png';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      const arrayBuffer = await upstreamRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (e: any) {
      res.status(500).send(e.message || 'Image fetch error');
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    const publicPath = path.join(process.cwd(), 'public');
    app.use(express.static(distPath));
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath));
    }
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Radio en Ligne Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
