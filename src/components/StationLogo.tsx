import React, { useState, useEffect } from 'react';
import { Radio as RadioIcon } from 'lucide-react';
import { getRelativePath } from '../services/api';

interface StationLogoProps {
  name: string;
  logoUrl?: string;
  className?: string;
  imgClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export const StationLogo: React.FC<StationLogoProps> = ({
  name,
  logoUrl,
  className = '',
  imgClassName = '',
  size = 'md',
}) => {
  const [errorCount, setErrorCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(logoUrl ? getRelativePath(logoUrl) : undefined);

  // Derive initial monogram
  const cleanName = (name || '').trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  const monogram = words.length >= 2 
    ? (words[0][0] + words[1][0]).toUpperCase() 
    : cleanName.slice(0, 2).toUpperCase() || 'RD';

  useEffect(() => {
    setErrorCount(0);
    setCurrentSrc(logoUrl ? getRelativePath(logoUrl) : undefined);
  }, [logoUrl, name]);

  const handleError = () => {
    if (errorCount === 0 && currentSrc && currentSrc.startsWith('http') && !currentSrc.includes('proxy-image')) {
      // Try image proxy once
      setErrorCount(1);
      setCurrentSrc(getRelativePath(`/api/proxy-image?url=${encodeURIComponent(currentSrc)}`));
    } else {
      // Fallback to stylized monogram
      setErrorCount(2);
      setCurrentSrc(undefined);
    }
  };

  const getThemeColor = () => {
    const n = cleanName.toLowerCase();
    if (n.includes('europe 2') || n.includes('europe2')) return 'from-red-600 to-rose-700 text-white';
    if (n.includes('france inter')) return 'from-red-600 to-red-800 text-white';
    if (n.includes('rtl2')) return 'from-blue-700 to-red-600 text-white';
    if (n.includes('nrj')) return 'from-zinc-900 to-red-950 text-red-500 border border-red-500/30';
    if (n.includes('fip')) return 'from-pink-600 to-fuchsia-800 text-white';
    if (n.includes('nova')) return 'from-emerald-700 to-green-900 text-yellow-300';
    if (n.includes('skyrock')) return 'from-zinc-900 to-black text-amber-400 border border-amber-500/30';
    if (n.includes('fun radio')) return 'from-blue-600 to-indigo-800 text-orange-400';
    if (n.includes('fg')) return 'from-amber-600 to-yellow-700 text-zinc-950';
    return 'from-blue-600 to-indigo-700 text-white';
  };

  if (currentSrc && errorCount < 2) {
    const isEurope2 = cleanName.toLowerCase().includes('europe 2') || cleanName.toLowerCase().includes('europe2') || currentSrc.includes('europe2');
    return (
      <div className={`relative flex items-center justify-center overflow-hidden ${isEurope2 ? 'bg-white rounded-xl p-1.5 shadow-sm' : ''} ${className}`}>
        <img
          src={currentSrc}
          alt={name}
          referrerPolicy="no-referrer"
          onError={handleError}
          className={`w-full h-full object-contain ${imgClassName}`}
        />
      </div>
    );
  }

  // Stylish Monogram Fallback
  return (
    <div
      className={`relative flex flex-col items-center justify-center font-bold font-mono tracking-wider rounded-xl bg-gradient-to-br shadow-inner ${getThemeColor()} ${className}`}
    >
      <span className={size === 'hero' ? 'text-4xl font-black' : size === 'lg' ? 'text-xl font-black' : size === 'sm' ? 'text-[11px]' : 'text-sm font-bold'}>
        {monogram}
      </span>
      {size === 'hero' && (
        <span className="text-xs font-sans font-medium tracking-normal mt-1 opacity-90 truncate max-w-[85%] text-center">
          {cleanName}
        </span>
      )}
    </div>
  );
};
