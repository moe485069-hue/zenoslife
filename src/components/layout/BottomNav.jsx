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
          {/* 1. Chat & Community */}
          <NavLink
            to="/chat"
            onClick={handleNavClick}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all flex-1',
                isActive
                  ? 'text-pink-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              )
            }
            title={isRtl ? 'گفتگو و چت‌روم' : 'Chat & Community'}
          >
            {({ isActive }) => (
              <>
                <MessagesSquare size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] mt-0.5 font-bold">{isRtl ? 'گفتگو' : 'Chat'}</span>
              </>
            )}
          </NavLink>

          {/* 2. Games & Arcade */}
          <NavLink
            to="/games"
            onClick={handleNavClick}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all flex-1',
                isActive
                  ? 'text-amber-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              )
            }
            title={isRtl ? 'بازی‌ها و آرکید' : 'Games & Arcade'}
          >
            {({ isActive }) => (
              <>
                <Gamepad2 size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] mt-0.5 font-bold">{isRtl ? 'بازی‌ها' : 'Games'}</span>
              </>
            )}
          </NavLink>

          {/* 3. Center Zen Universe (زنوسلایف) */}
          <NavLink
            to="/"
            onClick={handleNavClick}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center -mt-4 py-2 px-3 rounded-full transition-all bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 text-white shadow-xl shadow-purple-500/40 border-2 border-white/20 active:scale-95',
                isActive ? 'scale-110 ring-4 ring-purple-400/40' : 'hover:scale-105'
              )
            }
            title={isRtl ? 'فضای جامع زنوسلایف' : 'ZenOsLife Universe'}
          >
            <Flame size={24} strokeWidth={2.5} fill="currentColor" />
          </NavLink>

          {/* 4. My Day (امروز من) */}
          <NavLink
            to="/my-day"
            onClick={handleNavClick}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all flex-1',
                isActive
                  ? 'text-emerald-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              )
            }
            title={isRtl ? 'امروز من' : 'My Day'}
          >
            {({ isActive }) => (
              <>
                <Calendar size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] mt-0.5 font-bold">{isRtl ? 'امروز من' : 'My Day'}</span>
              </>
            )}
          </NavLink>

          {/* 5. Profile & Settings */}
          <NavLink
            to="/settings"
            onClick={handleNavClick}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all flex-1',
                isActive
                  ? 'text-cyan-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              )
            }
            title={isRtl ? 'پروفایل و سکه‌ها' : 'Profile & Wallet'}
          >
            {({ isActive }) => (
              <>
                <Settings size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] mt-0.5 font-bold">{isRtl ? 'پروفایل' : 'Profile'}</span>
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
