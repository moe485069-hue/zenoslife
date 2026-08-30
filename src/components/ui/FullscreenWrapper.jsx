import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import useAppStore from '../../store/appStore';

export default function FullscreenWrapper({ children }) {
  const wrapperRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isRtl } = useAppStore();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full h-full min-h-screen ${isFullscreen ? 'bg-black' : ''}`}>
      {children}
      
      <button
        onClick={toggleFullscreen}
        className={`fixed top-4 ${isRtl ? 'left-4' : 'right-4'} z-50 p-2 rounded-xl bg-black/40 border border-white/20 text-white hover:bg-black/60 transition-colors backdrop-blur-md shadow-lg`}
        title={isFullscreen ? (isRtl ? 'خروج از تمام‌صفحه' : 'Exit Fullscreen') : (isRtl ? 'تمام‌صفحه' : 'Fullscreen')}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  );
}
