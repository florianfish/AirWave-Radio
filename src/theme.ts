import type { CSSProperties } from 'react';

/**
 * Signature accent colour per station. The whole UI is tinted with the
 * accent of the station currently selected (via the `--accent` CSS variable),
 * and each station card carries its own.
 */
const STATION_ACCENTS: Array<[RegExp, string]> = [
  [/europe ?2/i, '#ff2d55'],
  [/nrj/i, '#ff5a1f'],
  [/fun ?radio/i, '#3d8bff'],
  [/\bfg\b|radio ?fg/i, '#ffc21a'],
  [/fip/i, '#e63fae'],
  [/nova/i, '#1fd68a'],
  [/skyrock/i, '#ffb000'],
  [/france inter/i, '#ff4040'],
  [/rtl ?2/i, '#4f7cff'],
  [/mouv/i, '#a855f7'],
  [/jazz/i, '#d4a24c'],
  [/nostalgie/i, '#f43f5e'],
  [/ch[ée]rie/i, '#ec4899'],
  [/rfm/i, '#22c3e6'],
];

export const DEFAULT_ACCENT = '#8b7bff';

export function getStationAccent(name?: string): string {
  if (!name) return DEFAULT_ACCENT;
  const match = STATION_ACCENTS.find(([re]) => re.test(name));
  return match ? match[1] : DEFAULT_ACCENT;
}

export function accentStyle(name?: string): CSSProperties {
  return { '--accent': getStationAccent(name) } as CSSProperties;
}
