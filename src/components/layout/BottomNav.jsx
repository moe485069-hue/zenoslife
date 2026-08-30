import React from 'react';
import { NavLink } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import clsx from 'clsx';
import { Home, Flame, Footprints, Calendar, Settings } from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export default function BottomNav() {
  const { language } = useAppStore();
  const isRtl = language === 'fa';

  const handleNavClick = () => {
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  return (
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

        {/* 2. My Day */}
        <NavLink
          to="/my-day"
          onClick={handleNavClick}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all flex-1 relative',
              isActive
                ? 'text-[var(--text-primary)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )
          }
          title={isRtl ? 'امروز من' : 'My Day'}
        >
          {({ isActive }) => (
            <>
              <div className={clsx("p-1 rounded-xl transition-transform", isActive ? "scale-110 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "")}>
                <Flame size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? 'currentColor' : 'none'} />
              </div>
            </>
          )}
        </NavLink>

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
  );
}
