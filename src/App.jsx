import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAppStore from './store/appStore';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import LevelUpModal from './components/ui/LevelUpModal';
import { motion, AnimatePresence } from 'framer-motion';
import useNotifications from './hooks/useNotifications';
import { db } from './db/database';
import soundEngine from './utils/audio';
import { initTelegramMiniApp } from './utils/telegram';

// Robust Lazy Loader with Automatic Stale-Chunk Cache Purge & Recovery
function lazyRetry(componentImport) {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.warn('Chunk load failed, purging stale cache & auto-recovering...', error);
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let registration of registrations) {
            await registration.unregister();
          }
        } catch (_) {}
      }
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          for (let k of keys) {
            await caches.delete(k);
          }
        } catch (_) {}
      }
      const hasRetried = sessionStorage.getItem('lifeos_chunk_retry');
      const now = Date.now();
      if (!hasRetried || now - parseInt(hasRetried, 10) > 8000) {
        sessionStorage.setItem('lifeos_chunk_retry', now.toString());
        window.location.reload();
        return new Promise(() => {}); // pause while reloading
      }
      throw error;
    }
  });
}

// Lazy-load pages for better performance
const Welcome = lazyRetry(() => import('./pages/Welcome'));
const MyDay = lazyRetry(() => import('./pages/MyDay'));
const Stroll = lazyRetry(() => import('./pages/Stroll'));
const Home = lazyRetry(() => import('./pages/Home'));
const Mindfulness = lazyRetry(() => import('./pages/Mindfulness'));
const Learning = lazyRetry(() => import('./pages/Learning'));
const SelfDiscovery = lazyRetry(() => import('./pages/SelfDiscovery'));
const Wealth = lazyRetry(() => import('./pages/Wealth'));
const World = lazyRetry(() => import('./pages/World'));
const Integrity = lazyRetry(() => import('./pages/Integrity'));
const NonJudgment = lazyRetry(() => import('./pages/NonJudgment'));
const Perspective = lazyRetry(() => import('./pages/Perspective'));
const Security = lazyRetry(() => import('./pages/Security'));
const Health = lazyRetry(() => import('./pages/Health'));
const CosmicUnity = lazyRetry(() => import('./pages/CosmicUnity'));
const Addiction = lazyRetry(() => import('./pages/Addiction'));
const Insights = lazyRetry(() => import('./pages/Insights'));
const Rewards = lazyRetry(() => import('./pages/Rewards'));
const BrainGraph = lazyRetry(() => import('./pages/BrainGraph'));
const Calendar = lazyRetry(() => import('./pages/Calendar'));
const Settings = lazyRetry(() => import('./pages/Settings'));
const AIMentor = lazyRetry(() => import('./pages/AIMentor'));
const Analytics = lazyRetry(() => import('./pages/Analytics'));
const TimeCapsule = lazyRetry(() => import('./pages/TimeCapsule'));
const HistoryArchive = lazyRetry(() => import('./pages/HistoryArchive'));
const Games = lazyRetry(() => import('./pages/Games'));
const TicTacToe = lazyRetry(() => import('./pages/games/TicTacToe'));
const MemoryMatrix = lazyRetry(() => import('./pages/games/MemoryMatrix'));
const WordlePersian = lazyRetry(() => import('./pages/games/WordlePersian'));
const SpaceDefender = lazyRetry(() => import('./pages/games/SpaceDefender'));
const CosmicChess = lazyRetry(() => import('./pages/games/CosmicChess'));
const CosmicPong = lazyRetry(() => import('./pages/games/CosmicPong'));
const NeonSnake = lazyRetry(() => import('./pages/games/NeonSnake'));
const Cyber2048 = lazyRetry(() => import('./pages/games/Cyber2048'));
const ReactionSpeed = lazyRetry(() => import('./pages/games/ReactionSpeed'));
const Backgammon = lazyRetry(() => import('./pages/games/Backgammon'));
const Ludo = lazyRetry(() => import('./pages/games/Ludo'));
const Pasur = lazyRetry(() => import('./pages/games/Pasur'));
const Billiards = lazyRetry(() => import('./pages/games/Billiards'));
const Hokm = lazyRetry(() => import('./pages/games/Hokm'));
const SnakesAndLadders = lazyRetry(() => import('./pages/games/SnakesAndLadders'));
const FingerSoccer = lazyRetry(() => import('./pages/games/FingerSoccer'));
const Ocho = lazyRetry(() => import('./pages/games/Ocho'));
const MiniGolf = lazyRetry(() => import('./pages/games/MiniGolf'));
const ChatRooms = lazyRetry(() => import('./pages/ChatRooms'));

// Loading spinner component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--accent-light)] border-t-[var(--accent)] animate-spin" />
        <span className="text-[var(--text-secondary)] text-sm">در حال بارگذاری...</span>
      </div>
    </div>
  );
}

// Animated stars for cosmic theme
function CosmicBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-[#030014] to-[#030014]" />
      {/* Star field layer 1 */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 10% 15%, white 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 35%, white 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 10%, white 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 50%, white 0%, transparent 100%),
            radial-gradient(1px 1px at 75% 20%, white 0%, transparent 100%),
            radial-gradient(1px 1px at 85% 65%, white 0%, transparent 100%),
            radial-gradient(1px 1px at 15% 70%, white 0%, transparent 100%),
            radial-gradient(1px 1px at 35% 80%, white 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 90%, white 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 40%, white 0%, transparent 100%)
          `
        }}
      />
      {/* Nebula-like glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-900/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-900/10 blur-3xl" />
    </div>
  );
}

// Animated space background for Deep Space theme
function SpaceBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#050f26] to-[#020617]" />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `
            radial-gradient(1.5px 1.5px at 12% 18%, #38bdf8 0%, transparent 100%),
            radial-gradient(1px 1px at 28% 42%, #818cf8 0%, transparent 100%),
            radial-gradient(2px 2px at 52% 14%, #bae6fd 0%, transparent 100%),
            radial-gradient(1px 1px at 68% 62%, #38bdf8 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 84% 28%, #818cf8 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 74%, white 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 22% 82%, #38bdf8 0%, transparent 100%),
            radial-gradient(2px 2px at 42% 88%, #67e8f9 0%, transparent 100%)
          `
        }}
      />
      {/* Cyan & Electric Blue Nebula Glows */}
      <div className="absolute top-1/3 left-1/5 w-[30rem] h-[30rem] rounded-full bg-sky-600/10 blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/5 w-[28rem] h-[28rem] rounded-full bg-indigo-600/10 blur-[110px]" />
    </div>
  );
}

// Animated organic Earth Terran background
function EarthBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a110a] via-[#101b10] to-[#0a110a]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(2px 2px at 18% 24%, #4ade80 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 34% 54%, #86efac 0%, transparent 100%),
            radial-gradient(2px 2px at 64% 22%, #facc15 0%, transparent 100%),
            radial-gradient(1px 1px at 78% 70%, #4ade80 0%, transparent 100%),
            radial-gradient(2px 2px at 88% 36%, #a3e635 0%, transparent 100%)
          `
        }}
      />
      {/* Forest & Emerald Warm Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-700/10 blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-lime-800/10 blur-[100px]" />
    </div>
  );
}

// Live Alarm & Reminder Banner
function AlarmBanner({ alarm, onDismiss, onComplete }) {
  if (!alarm) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.95 }}
        className="fixed top-4 left-4 right-4 max-w-lg mx-auto z-50 p-4 rounded-3xl bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 text-white shadow-2xl border-2 border-amber-300 flex items-center justify-between gap-3 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shrink-0 animate-bounce">
            ⏰
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-black truncate">{alarm.titleFa || alarm.titleEn || 'هشدار زمان'}</h4>
            <p className="text-[10px] sm:text-xs text-amber-100 truncate mt-0.5">{alarm.bodyFa || alarm.bodyEn || 'زمان تعیین‌شده فرا رسیده است.'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {alarm.task && (
            <button
              onClick={() => onComplete(alarm)}
              className="px-3 py-1.5 rounded-xl bg-white text-emerald-700 font-black text-xs hover:bg-emerald-50 transition-colors shadow-md"
            >
              انجام شد ✔
            </button>
          )}
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Online/offline toast notification
function OnlineStatusToast({ isOnline }) {
  return (
    <AnimatePresence>
      <motion.div
        key={isOnline ? 'online' : 'offline'}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 ${
          isOnline
            ? 'bg-emerald-500 text-white'
            : 'bg-orange-500 text-white'
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-200' : 'bg-orange-200'} animate-pulse`} />
        {isOnline ? '🌐 آنلاین' : '📡 آفلاین'}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { theme, language, loadFromStorage, setOnline, isOnline, addXP, addCoins } = useAppStore();
  const [showStatusToast, setShowStatusToast] = React.useState(false);
  const [activeAlarm, setActiveAlarm] = React.useState(null);
  const prevOnlineRef = React.useRef(isOnline);

  // Activate continuous background notification scheduler
  useNotifications();

  useEffect(() => {
    loadFromStorage();
    initTelegramMiniApp(useAppStore.getState());

    const handleOnline = () => {
      setOnline(true);
      setShowStatusToast(true);
      setTimeout(() => setShowStatusToast(false), 3000);
    };
    const handleOffline = () => {
      setOnline(false);
      setShowStatusToast(true);
      setTimeout(() => setShowStatusToast(false), 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Alarm listener
    const handleAlarmEvent = (e) => {
      if (e.detail) {
        setActiveAlarm(e.detail);
      }
    };
    window.addEventListener('lifeos_alarm', handleAlarmEvent);

    // PWA install prompt
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      useAppStore.setState({ deferredPrompt: e, showInstallPrompt: true });
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('lifeos_alarm', handleAlarmEvent);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, [loadFromStorage, setOnline]);

  const handleCompleteAlarmTask = async (alarm) => {
    if (alarm.task && alarm.task.id) {
      try {
        await db.tasks.update(alarm.task.id, { completed: true });
        soundEngine.playCheckmark?.();
        addXP(15, 'انجام وظیفه از زنگ هشدار');
        addCoins(5);
      } catch (err) {
        console.warn('Error completing task:', err);
      }
    } else if (alarm.habit && alarm.habit.id) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await db.habitLogs.add({ habitId: alarm.habit.id, date: today, completed: true, note: 'From Alarm' });
        soundEngine.playCheckmark?.();
        addXP(15, 'انجام عادت از زنگ هشدار');
        addCoins(5);
      } catch (err) {
        console.warn('Error completing habit:', err);
      }
    }
    setActiveAlarm(null);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark' || theme === 'space' || theme === 'earth') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.body.dir = dir;
  }, [language]);

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      {/* Dynamic Backgrounds by Theme */}
      {theme === 'cosmic' && <CosmicBackground />}
      {theme === 'space' && <SpaceBackground />}
      {theme === 'earth' && <EarthBackground />}

      {/* Live Alarm & Notification Banner */}
      <AlarmBanner
        alarm={activeAlarm}
        onDismiss={() => setActiveAlarm(null)}
        onComplete={handleCompleteAlarmTask}
      />

      {/* Online status toast */}
      {showStatusToast && <OnlineStatusToast isOnline={isOnline} />}

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden relative z-10" style={{ paddingBottom: '5rem' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Welcome />} />
            
            {/* Main Dashboard Routes */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/my-day" element={<MyDay />} />
            <Route path="/myday" element={<MyDay />} />
            <Route path="/stroll" element={<Stroll />} />
            <Route path="/games" element={<Games />} />
            <Route path="/chat" element={<ChatRooms />} />
            <Route path="/chat-rooms" element={<ChatRooms />} />
            <Route path="/chatrooms" element={<ChatRooms />} />
            <Route path="/dating" element={<ChatRooms />} />
            <Route path="/games/tic-tac-toe" element={<TicTacToe />} />
            <Route path="/games/memory-matrix" element={<MemoryMatrix />} />
            <Route path="/games/wordle" element={<WordlePersian />} />
            <Route path="/games/space-defender" element={<SpaceDefender />} />
            <Route path="/games/cosmic-chess" element={<CosmicChess />} />
            <Route path="/games/cosmic-pong" element={<CosmicPong />} />
            <Route path="/games/neon-snake" element={<NeonSnake />} />
            <Route path="/games/2048" element={<Cyber2048 />} />
            <Route path="/games/reaction-speed" element={<ReactionSpeed />} />
            <Route path="/games/backgammon" element={<Backgammon />} />
            <Route path="/games/ludo" element={<Ludo />} />
            <Route path="/games/pasur" element={<Pasur />} />
            <Route path="/games/billiards" element={<Billiards />} />
            <Route path="/games/hokm" element={<Hokm />} />
            <Route path="/games/snakes-and-ladders" element={<SnakesAndLadders />} />
            <Route path="/games/snakes" element={<SnakesAndLadders />} />
            <Route path="/games/finger-soccer" element={<FingerSoccer />} />
            <Route path="/games/soccer" element={<FingerSoccer />} />
            <Route path="/games/ocho" element={<Ocho />} />
            <Route path="/games/uno" element={<Ocho />} />
            <Route path="/games/mini-golf" element={<MiniGolf />} />
            <Route path="/games/golf" element={<MiniGolf />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/mindfulness" element={<Mindfulness />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/self-discovery" element={<SelfDiscovery />} />
            <Route path="/selfdiscovery" element={<SelfDiscovery />} />
            <Route path="/wealth" element={<Wealth />} />
            <Route path="/world" element={<World />} />
            <Route path="/integrity" element={<Integrity />} />
            <Route path="/non-judgment" element={<NonJudgment />} />
            <Route path="/nonjudgment" element={<NonJudgment />} />
            <Route path="/perspective" element={<Perspective />} />
            <Route path="/security" element={<Security />} />
            <Route path="/health" element={<Health />} />
            <Route path="/cosmic-unity" element={<CosmicUnity />} />
            <Route path="/cosmicunity" element={<CosmicUnity />} />
            <Route path="/addiction" element={<Addiction />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/graph" element={<BrainGraph />} />
            <Route path="/brain-graph" element={<BrainGraph />} />
            <Route path="/braingraph" element={<BrainGraph />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/mentor" element={<AIMentor />} />
            <Route path="/ai-mentor" element={<AIMentor />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/time-capsule" element={<TimeCapsule />} />
            <Route path="/timecapsule" element={<TimeCapsule />} />
            <Route path="/history" element={<HistoryArchive />} />
          </Routes>
        </Suspense>
      </main>

      {/* Bottom navigation */}
      <BottomNav />

      {/* Level Up Celebration Modal */}
      <LevelUpModal />
    </div>
  );
}
