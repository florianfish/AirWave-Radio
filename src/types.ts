export interface RadioStation {
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

export interface TrackHistoryItem {
  id: string;
  stationId: string;
  stationName?: string;
  artist: string;
  title: string;
  playedAt: string; // ISO string
  artworkUrl?: string;
  album?: string;
  externalLinks?: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
  };
}

export interface NowPlayingInfo {
  stationId: string;
  stationName: string;
  artist: string;
  title: string;
  rawTitle?: string;
  artworkUrl?: string;
  album?: string;
  updatedAt: string;
  isLive: boolean;
}

export interface DirectorySearchResult {
  changeuuid: string;
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
}
