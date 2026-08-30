import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import clsx from 'clsx';
import { Home, Flame, Footprints, Calendar, Settings, Gamepad2, MessagesSquare } from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import HubSelectorModal from './HubSelectorModal';

export default function BottomNav() {
  const { language } = useAppStore();
  const isRtl = language === 'fa';
  const location = useLocation();
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);

  const isHubActive = ['/my-day', '/games', '/chat-rooms'].includes(location.pathname);

  const handleNavClick = () => {
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleHubClick = (e) => {
    e.preventDefault();
    soundEngine.playTap?.();
    haptics.tap?.();
    setIsHubModalOpen(true);
  };

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-[var(--border)] px-4 py-2 backdrop-blur-2xl"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-1">
          {/* 1. Home */}
          <NavLink
            to="/"
            onClick={handleNavClick}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all flex-1',
                isActive
                  ? 'text-[var(--text-primary)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )
            }
            title={isRtl ? 'خانه' : 'Home'}
          >
            {({ isActive }) => (
              <>
                <Home size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'currentColor' : 'none'} />
              </>
            )}
          </NavLink>

          {/* 2. Middle Hub (My Day / Games / Chat) */}
          <button
            onClick={handleHubClick}
            className={clsx(
              'flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all flex-1 relative',
              isHubActive
                ? 'text-[var(--text-primary)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
            title={isRtl ? 'هاب امروز، بازی و چت' : 'My Day & Games Hub'}
          >
            <div className={clsx(
              "p-1 rounded-xl transition-all duration-300", 
              isHubActive 
                ? "scale-110 bg-gradient-to-tr from-emerald-500/20 via-rose-500/20 to-cyan-500/20 text-emerald-500 border border-emerald-500/30 shadow-md shadow-emerald-500/10" 
                : "hover:scale-105"
            )}>
              <Flame size={24} strokeWidth={isHubActive ? 2.5 : 2} fill={isHubActive ? 'currentColor' : 'none'} />
            </div>
          </button>

        {/* 3. Stroll */}
        <NavLink
          to="/stroll"
          onClick={handleNavClick}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all flex-1',
              isActive
                ? 'text-[var(--text-primary)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )
          }
          title={isRtl ? 'قدم زدن' : 'Stroll'}
        >
          {({ isActive }) => (
            <>
              <Footprints size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'currentColor' : 'none'} />
            </>
          )}
        </NavLink>

        {/* 4. Calendar */}
        <NavLink
          to="/calendar"
          onClick={handleNavClick}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all flex-1',
              isActive
                ? 'text-[var(--text-primary)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )
          }
          title={isRtl ? 'تقویم' : 'Calendar'}
        >
          {({ isActive }) => (
            <>
              <Calendar size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'currentColor' : 'none'} />
            </>
          )}
        </NavLink>

        {/* 5. Settings */}
        <NavLink
          to="/settings"
          onClick={handleNavClick}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all flex-1',
              isActive
                ? 'text-[var(--text-primary)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )
          }
          title={isRtl ? 'تنظیمات' : 'Settings'}
        >
          {({ isActive }) => (
            <>
              <Settings size={24} strokeWidth={isActive ? 2.5 : 2} />
            </>
          )}
        </NavLink>
      </div>
    </nav>

    {/* 3-Card Interactive Hub Selector */}
    <HubSelectorModal
      isOpen={isHubModalOpen}
      onClose={() => setIsHubModalOpen(false)}
    />
  </>
  );
}
