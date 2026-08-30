import React, { useState } from 'react';

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
  'linear-gradient(135deg, #059669 0%, #0d9488 50%, #0284c7 100%)',
  'linear-gradient(135deg, #d97706 0%, #ea580c 50%, #dc2626 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f43f5e 100%)',
  'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
];

export default function SafeImage({
  src,
  alt = 'Image',
  className = '',
  icon = '✨',
  fallbackText = '',
  loading = 'lazy',
  style = {},
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Pick deterministic fallback gradient from alt/src
  const gradientIdx = Math.abs(
    (alt + (src || '')).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % FALLBACK_GRADIENTS.length;

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center relative overflow-hidden select-none ${className}`}
        style={{
          background: FALLBACK_GRADIENTS[gradientIdx],
          ...style,
        }}
        {...props}
      >
        {/* Subtle decorative geometric rings */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-black/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center p-2 text-center">
          <span className="text-2xl drop-shadow-md">{icon}</span>
          {fallbackText && (
            <span className="text-[10px] font-black text-white/90 mt-1 drop-shadow-sm truncate max-w-[80%]">
              {fallbackText}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Shimmer skeleton before image is loaded */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-[var(--bg-secondary)] animate-pulse z-0" 
          style={{ minHeight: '100%' }}
        />
      )}

      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        style={style}
        {...props}
      />
    </div>
  );
}
