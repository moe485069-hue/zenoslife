import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import clsx from 'clsx';
import { 
  Flame, Footprints, Calendar, Settings, 
  Gamepad2, MessagesSquare, Trophy, Heart, 
  Coins, Compass, Crown, Sparkles, User
} from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import HubSelectorModal from './HubSelectorModal';
import CoinShopModal from '../shop/CoinShopModal';
import { useAppMode } from '../../utils/appMode';

export default function BottomNav() {
  const { language } = useAppStore();
  const isRtl = language === 'fa';
  const location = useLocation();
  const appMode = useAppMode();
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);

  const handleNavClick = () => {
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  // ----------------------------------------------------
  // 1. CHAZHA GAMES BOT NAVIGATION (@chazha_bot)
  // ----------------------------------------------------
  if (appMode === 'chazha') {
    return (
      <>
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-[var(--border)] px-3 py-2 backdrop-blur-2xl"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="max-w-md mx-auto flex items-center justify-around gap-1">
            {/* Arcade Games */}
            <NavLink
              to="/games"
              onClick={handleNavClick}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all flex-1',
                  isActive ? 'text-amber-400 font-black' : 'text-slate-400 hover:text-slate-200'
                )
              }
              title={isRtl ? 'آرکید بازی‌ها' : 'Games Arcade'}
            >
              {({ isActive }) => (
                <>
                  <Gamepad2 size={23} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] mt-1 font-bold">{isRtl ? 'آرکید بازی‌ها' : 'Games'}</span>
                </>
              )}
            </NavLink>

            {/* Leaderboard & Rewards */}
            <NavLink
              to="/rewards"
              onClick={handleNavClick}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all flex-1',
                  isActive ? 'text-yellow-400 font-black' : 'text-slate-400 hover:text-slate-200'
                )
              }
              title={isRtl ? 'رتبه‌بندی و جوایز' : 'Leaderboard'}
            >
              {({ isActive }) => (
                <>
                  <Trophy size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] mt-1 font-bold">{isRtl ? 'رتبه‌بندی' : 'Rankings'}</span>
                </>
              )}
            </NavLink>

            {/* Quick Coin Shop Button */}
            <button
              onClick={() => {
                handleNavClick();
                setIsShopOpen(true);
              }}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-amber-400 hover:text-amber-300 transition-all flex-1"
              title={isRtl ? 'کیف‌پول و شارژ سکه' : 'Shop & Coins'}
            >
              <Coins size={22} strokeWidth={2} />
              <span className="text-[10px] mt-1 font-bold">{isRtl ? 'شارژ سکه' : 'Coins'}</span>
            </button>

            {/* Gamer Profile */}
            <NavLink
              to="/settings"
              onClick={handleNavClick}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all flex-1',
                  isActive ? 'text-cyan-400 font-black' : 'text-slate-400 hover:text-slate-200'
                )
              }
              title={isRtl ? 'پروفایل گیمر' : 'Profile'}
            >
              {({ isActive }) => (
                <>
                  <User size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] mt-1 font-bold">{isRtl ? 'پروفایل' : 'Profile'}</span>
                </>
              )}
            </NavLink>
          </div>
        </nav>
        <CoinShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      </>
    );
  }

  // ----------------------------------------------------
  // 2. WHOZA DATING & CHAT BOT NAVIGATION (@whoza_bot)
  // ----------------------------------------------------
  if (appMode === 'whoza') {
    return (
      <>
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-[var(--border)] px-3 py-2 backdrop-blur-2xl"
          style={{ background: 'var(--bg-card)' }}
        >
          <div className="max-w-md mx-auto flex items-center justify-around gap-1">
            {/* Anonymous Chat & Rooms */}
            <NavLink
              to="/chat"
              onClick={handleNavClick}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all flex-1',
                  isActive ? 'text-pink-400 font-black' : 'text-slate-400 hover:text-slate-200'
                )
              }
              title={isRtl ? 'چت ناشناس و اتاق‌ها' : 'Chat & Rooms'}
            >
              {({ isActive }) => (
                <>
                  <MessagesSquare size={23} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] mt-1 font-bold">{isRtl ? 'گفتگو و چت' : 'Chat'}</span>
                </>
              )}
            </NavLink>

            {/* Online Matching / Explore */}
            <NavLink
              to="/chat-rooms"
              onClick={handleNavClick}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all flex-1',
                  isActive ? 'text-rose-400 font-black' : 'text-slate-400 hover:text-slate-200'
                )
              }
              title={isRtl ? 'اتاق‌های موضوعی' : 'Topics'}
            >
              {({ isActive }) => (
                <>
                  <Heart size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] mt-1 font-bold">{isRtl ? 'اتاق‌ها' : 'Rooms'}</span>
                </>
              )}
            </NavLink>

            {/* Coin Shop & Gifts */}
            <button
              onClick={() => {
                handleNavClick();
                setIsShopOpen(true);
              }}
              className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-amber-400 hover:text-amber-300 transition-all flex-1"
              title={isRtl ? 'ارسال هدیه و سکه' : 'Gifts & VIP'}
            >
              <Crown size={22} strokeWidth={2} />
              <span className="text-[10px] mt-1 font-bold">{isRtl ? 'ویژه و هدایا' : 'VIP & Gifts'}</span>
            </button>

            {/* Profile & Karma */}
            <NavLink
              to="/settings"
              onClick={handleNavClick}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all flex-1',
                  isActive ? 'text-cyan-400 font-black' : 'text-slate-400 hover:text-slate-200'
                )
              }
              title={isRtl ? 'پروفایل و کارما' : 'Profile'}
            >
              {({ isActive }) => (
                <>
                  <User size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] mt-1 font-bold">{isRtl ? 'پروفایل' : 'Profile'}</span>
                </>
              )}
            </NavLink>
          </div>
        </nav>
        <CoinShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      </>
    );
  }

  // ----------------------------------------------------
  // 3. ZENOSLIFE - LIFE OS BOT NAVIGATION (@zenosaaa_bot)
  // ----------------------------------------------------
  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-[var(--border)] px-4 py-2 backdrop-blur-2xl"
        style={{ background: 'var(--bg-card)' }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-1">
          {/* 1. Realms & Stroll (راهروها) */}
          <NavLink
            to="/stroll"
            onClick={handleNavClick}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all flex-1',
                isActive ? 'text-teal-400 font-black' : 'text-slate-400 hover:text-slate-200'
              )
            }
            title={isRtl ? 'راهروهای فکری و قدم‌زدن' : 'Realms & Stroll'}
          >
            {({ isActive }) => (
              <>
                <Footprints size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] mt-0.5 font-bold">{isRtl ? 'راهروها' : 'Stroll'}</span>
              </>
            )}
          </NavLink>

          {/* 2. Self-Discovery & Growth (خودشناسی) */}
          <NavLink
            to="/self-discovery"
            onClick={handleNavClick}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all flex-1',
                isActive ? 'text-indigo-400 font-black' : 'text-slate-400 hover:text-slate-200'
              )
            }
            title={isRtl ? 'خودشناسی و آزمون‌ها' : 'Self-Discovery'}
          >
            {({ isActive }) => (
              <>
                <Compass size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] mt-0.5 font-bold">{isRtl ? 'خودشناسی' : 'Growth'}</span>
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
                isActive ? 'text-emerald-400 font-black' : 'text-slate-400 hover:text-slate-200'
              )
            }
            title={isRtl ? 'امروز من و تقویم' : 'My Day'}
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
                isActive ? 'text-cyan-400 font-black' : 'text-slate-400 hover:text-slate-200'
              )
            }
            title={isRtl ? 'پروفایل و تنظیمات' : 'Profile'}
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

      {/* Interactive Hub Selector */}
      <HubSelectorModal
        isOpen={isHubModalOpen}
        onClose={() => setIsHubModalOpen(false)}
      />
    </>
  );
}
