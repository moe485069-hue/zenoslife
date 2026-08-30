import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2, Users, Trophy, Plus, Globe, Play,
  Lock, Unlock, Radio, Clock, RotateCcw, X
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useMultiplayerStore from '../store/multiplayerStore';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import gameRoomsService from '../services/gameRoomsService';

const GAME_DEFS = [
  { id: 'hokm', titleFa: 'حکم ۴ نفره شاهانه', icon: '👑', path: '/games/hokm', category: 'board', maxPlayers: 4, color: 'from-amber-700/30 to-yellow-900/60 border-amber-400/50 ring-1 ring-amber-400/30', descFa: 'بازی اصیل حکم ۴ نفره با هوش مصنوعی و امکان شرط‌بندی سکه.', level: 'شاهانه 👑' },
  { id: 'backgammon', titleFa: 'تخته نرد شاهانه', icon: '🎲', path: '/games/backgammon', category: 'board', maxPlayers: 2, color: 'from-amber-600/30 to-yellow-900/60 border-amber-500/50', descFa: 'بازی اصیل تخته نرد با ۳ تم زیبا. ربات، دونفره، آنلاین.', level: 'شاهانه 👑' },
  { id: 'ludo', titleFa: 'منچ کلاسیک', icon: '🎯', path: '/games/ludo', category: 'board', maxPlayers: 4, color: 'from-rose-600/30 to-amber-900/60 border-rose-500/50', descFa: 'منچ ۲ تا ۴ نفره با ربات یا آنلاین.', level: 'هیجان‌انگیز 🔥' },
  { id: 'pasur', titleFa: 'پاستور فارسی', icon: '🃏', path: '/games/pasur', category: 'board', maxPlayers: 2, color: 'from-green-700/30 to-emerald-900/60 border-green-500/50', descFa: 'بازی کارتی اصیل ایرانی. جمع کن، امتیاز بگیر، قهرمان شو!', level: 'ایرانی 🇮🇷' },
  { id: 'billiards', titleFa: 'بیلیارد ۸-توپی', icon: '🎱', path: '/games/billiards', category: 'arcade', maxPlayers: 2, color: 'from-emerald-700/30 to-teal-900/60 border-emerald-500/50', descFa: 'بیلیارد واقعی با موتور فیزیک کامل.', level: 'اکشن 🎱' },
  { id: 'cosmic_chess', titleFa: 'شطرنج کیهانی', icon: '♟️', path: '/games/cosmic-chess', category: 'board', maxPlayers: 2, color: 'from-indigo-600/20 to-blue-900/50 border-indigo-500/40', descFa: 'شطرنج کامل با هوش مصنوعی.', level: 'استراتژیک ♟️' },
  { id: 'tic_tac_toe', titleFa: 'دوز نئونی', icon: '⭕', path: '/games/tic-tac-toe', category: 'board', maxPlayers: 2, color: 'from-emerald-600/20 to-teal-900/50 border-emerald-500/40', descFa: 'دوز با گرافیک سایبرپانک.', level: 'ساده 🟢' },
  { id: 'cosmic_pong', titleFa: 'پونگ کیهانی', icon: '🏓', path: '/games/cosmic-pong', category: 'arcade', maxPlayers: 2, color: 'from-sky-600/20 to-blue-900/50 border-sky-500/40', descFa: 'پونگ دونفره روی یک دستگاه.', level: 'دونفره 🏓' },
  { id: 'cyber_2048', titleFa: '۲۰۴۸ سایبری', icon: '🔢', path: '/games/2048', category: 'puzzle', maxPlayers: 1, color: 'from-cyan-600/20 to-blue-900/50 border-cyan-500/40', descFa: 'پازل ریاضی با کاشی‌های نئونی.', level: 'حرفه‌ای 🔴' },
  { id: 'neon_snake', titleFa: 'مار سایبری', icon: '🐍', path: '/games/neon-snake', category: 'arcade', maxPlayers: 1, color: 'from-purple-600/20 to-fuchsia-900/50 border-purple-500/40', descFa: 'مار کلاسیک با گرافیک نئونی.', level: 'آرکید 🐍' },
  { id: 'space_defender', titleFa: 'مدافع فضا', icon: '🚀', path: '/games/space-defender', category: 'arcade', maxPlayers: 1, color: 'from-rose-600/20 to-red-900/50 border-rose-500/40', descFa: 'سفینه را از سنگ‌های آسمانی نجات بده!', level: 'اکشن 🚀' },
  { id: 'reaction_speed', titleFa: 'سرعت واکنش', icon: '⚡', path: '/games/reaction-speed', category: 'puzzle', maxPlayers: 1, color: 'from-amber-600/20 to-orange-900/50 border-amber-500/40', descFa: 'سرعت رفلکس عصبی‌ات را بسنج.', level: 'واکنش ⚡' },
  { id: 'wordle_persian', titleFa: 'حدس کلمه فارسی', icon: '🔤', path: '/games/wordle', category: 'puzzle', maxPlayers: 1, color: 'from-amber-600/20 to-yellow-900/50 border-amber-500/40', descFa: 'کلمه پنهان را در ۶ تلاش حدس بزن.', level: 'کلمات 🔤' },
  { id: 'memory_matrix', titleFa: 'ماتریس حافظه', icon: '🧠', path: '/games/memory-matrix', category: 'puzzle', maxPlayers: 1, color: 'from-fuchsia-600/20 to-purple-900/50 border-fuchsia-500/40', descFa: 'حافظه فعال و تمرکز ذهن را تقویت کن.', level: 'حافظه 🧠' },
];

const MULTIPLAYER_IDS = ['hokm','backgammon','ludo','pasur','billiards','cosmic_chess','tic_tac_toe','cosmic_pong'];
const CATEGORIES = [
  { id: 'all', labelFa: 'همه', icon: '🎮' },
  { id: 'board', labelFa: 'تخته', icon: '🎲' },
  { id: 'arcade', labelFa: 'آرکید', icon: '🕹️' },
  { id: 'puzzle', labelFa: 'فکری', icon: '🧩' },
];

function LiveRoomCard({ room, onJoin }) {
  const game = GAME_DEFS.find(g => g.id === room.gameType);
  const timeAgo = Math.round((Date.now() - room.createdAt) / 60000);
  const isFull = room.currentPlayers >= room.maxPlayers;
  const isWaiting = room.status === 'waiting';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all"
    >
      <div className="w-11 h-11 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
        {game?.icon || '🎮'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-black text-white truncate">{game?.titleFa || room.gameType}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${isWaiting && !isFull ? 'bg-green-500/15 border-green-500/40 text-green-400' : 'bg-amber-500/15 border-amber-500/40 text-amber-400'}`}>
            {isWaiting && !isFull ? 'در انتظار' : isFull ? 'پر شد' : 'در جریان'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
          <span>{room.hostAvatar} {room.hostName}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><Users size={9}/> {room.currentPlayers}/{room.maxPlayers}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5"><Clock size={9}/> {timeAgo < 1 ? 'همین الان' : timeAgo + 'دقیقه'}</span>
        </div>
      </div>
      <button
        onClick={() => onJoin(room)}
        disabled={!isWaiting || isFull}
        className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black disabled:opacity-35 active:scale-95 transition-all flex items-center gap-1"
      >
        <Play size={11} />
        بپیوند
      </button>
    </motion.div>
  );
}

function CreateRoomModal({ isOpen, onClose, onCreated, userName, userAvatar }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const multiplayerGames = GAME_DEFS.filter(g => MULTIPLAYER_IDS.includes(g.id));

  const handleCreate = async () => {
    if (!selectedGame) return;
    setCreating(true);
    const roomId = selectedGame.id.toUpperCase().slice(0,4) + '-' + Math.random().toString(36).substr(2,4).toUpperCase();
    const room = await gameRoomsService.publishRoom({
      roomId, gameType: selectedGame.id, gameTitleFa: selectedGame.titleFa,
      hostId: localStorage.getItem('life_os_user_id') || 'u_' + Date.now(),
      hostName: userName || 'کاربر', hostAvatar: userAvatar || '🎮',
      maxPlayers: selectedGame.maxPlayers, isPrivate,
    });
    setCreating(false);
    onCreated(room, selectedGame);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-slate-900 border border-purple-500/40 p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Plus size={20} className="text-purple-400" /> ساخت بازی آنلاین
              </h3>
              <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-bold mb-2.5">نوع بازی:</p>
              <div className="grid grid-cols-2 gap-2">
                {multiplayerGames.map(g => (
                  <button key={g.id} onClick={() => setSelectedGame(g)}
                    className={`p-3 rounded-2xl border text-right flex items-center gap-2 transition-all active:scale-95 ${
                      selectedGame?.id === g.id
                        ? 'border-purple-400 bg-purple-500/25 text-white shadow-lg shadow-purple-500/20'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-purple-500/40'
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{g.icon}</span>
                    <span className="text-xs font-black leading-tight">{g.titleFa}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                {isPrivate ? <Lock size={14} className="text-amber-400" /> : <Unlock size={14} className="text-green-400" />}
                <div>
                  <p className="text-xs font-black text-slate-200">{isPrivate ? 'اتاق خصوصی' : 'اتاق عمومی'}</p>
                  <p className="text-[10px] text-slate-500">{isPrivate ? 'فقط با لینک مستقیم' : 'قابل مشاهده در لیست'}</p>
                </div>
              </div>
              <button onClick={() => setIsPrivate(!isPrivate)}
                className={`relative w-11 h-6 rounded-full transition-all ${isPrivate ? 'bg-amber-500' : 'bg-green-500'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isPrivate ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <button onClick={handleCreate} disabled={!selectedGame || creating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white font-black text-sm shadow-lg shadow-purple-500/30 disabled:opacity-40 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {creating
                ? <><RotateCcw size={16} className="animate-spin" /> در حال ساخت...</>
                : <><Play size={16} /> ساخت اتاق و ورود به بازی</>
              }
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Games() {
  const { isRtl } = useAppStore();
  const navigate = useNavigate();
  const { userName, userAvatar } = useMultiplayerStore();

  const [activeTab, setActiveTab] = useState('live');
  const [activeCategory, setActiveCategory] = useState('all');
  const [liveRooms, setLiveRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [highScores, setHighScores] = useState({});

  useEffect(() => {
    setHighScores({
      best2048: parseInt(localStorage.getItem('cyber_2048_best') || '0', 10),
      bestReaction: parseInt(localStorage.getItem('reaction_speed_best') || '0', 10),
      bestSnake: parseInt(localStorage.getItem('snake_high_score') || '0', 10),
    });
    const unsub = gameRoomsService.subscribe(rooms => {
      setLiveRooms(rooms.filter(r => !r.isPrivate));
    });
    return unsub;
  }, []);

  const handleJoinRoom = (room) => {
    soundEngine.playTap?.();
    haptics.tap?.();
    const game = GAME_DEFS.find(g => g.id === room.gameType);
    if (game) navigate(`${game.path}?mode=online&room=${room.roomId}`);
  };

  const handleRoomCreated = (room, game) => {
    soundEngine.playLevelUp?.();
    navigate(`${game.path}?mode=online&room=${room.roomId}`);
  };

  const handleGameClick = (game) => {
    soundEngine.playTap?.();
    haptics.tap?.();
    navigate(MULTIPLAYER_IDS.includes(game.id) ? `${game.path}?mode=bot` : game.path);
  };

  const filteredGames = activeCategory === 'all' ? GAME_DEFS : GAME_DEFS.filter(g => g.category === activeCategory);

  return (
    <div className="w-full min-h-full pb-32 bg-[var(--bg-primary)]" dir="rtl">
      <div className="fixed inset-0 pointer-events-none opacity-[0.07] z-0 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-80 h-80 rounded-full bg-purple-600 blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-60 h-60 rounded-full bg-pink-600 blur-[90px]" />
      </div>

      <div className="relative z-10 px-4 pt-5 max-w-xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 flex items-center gap-2">
              🎮 آرکید زنوسلایف
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {userAvatar} <span className="text-fuchsia-400 font-bold">{userName || 'کاربر'}</span> · {GAME_DEFS.length} بازی
            </p>
          </div>
          <button onClick={() => navigate('/')} className="p-2 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white active:scale-95">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'live', label: 'بازی‌های زنده', icon: '📡' },
            { id: 'all', label: 'همه بازی‌ها', icon: '🎮' },
          ].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); soundEngine.playTap?.(); }}
              className={`flex-1 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all border ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.id === 'live' && liveRooms.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-green-500 text-white text-[9px] font-black">{liveRooms.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Live Rooms */}
        {activeTab === 'live' && (
          <div className="space-y-3">
            {liveRooms.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-green-400">{liveRooms.length} اتاق بازی فعال</span>
              </div>
            )}
            {liveRooms.length === 0 ? (
              <div className="text-center py-14 space-y-4">
                <div className="text-6xl animate-bounce">🎮</div>
                <div>
                  <p className="text-slate-300 font-black text-base">هنوز بازی آنلاینی در جریان نیست</p>
                  <p className="text-xs text-slate-500 mt-1">اولین نفر باش که بازی می‌سازد!</p>
                </div>
                <button onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-black shadow-lg shadow-purple-500/25 active:scale-95">
                  + ساخت اولین بازی
                </button>
              </div>
            ) : (
              liveRooms.map(room => <LiveRoomCard key={room.roomId} room={room} onJoin={handleJoinRoom} />)
            )}
          </div>
        )}

        {/* All Games */}
        {activeTab === 'all' && (
          <div className="space-y-4">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => { setActiveCategory(cat.id); soundEngine.playTap?.(); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all border flex-shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  {cat.icon} {cat.labelFa}
                </button>
              ))}
            </div>

            {/* Games Grid 2-col */}
            <div className="grid grid-cols-2 gap-3">
              {filteredGames.map(game => (
                <motion.div key={game.id} whileTap={{ scale: 0.95 }} onClick={() => handleGameClick(game)}
                  className={`relative p-4 rounded-3xl cursor-pointer border bg-gradient-to-br ${game.color} overflow-hidden group shadow-md hover:shadow-xl transition-all`}
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{game.icon}</span>
                      <span className="text-[9px] font-black px-2 py-0.5 bg-black/40 text-slate-200 rounded-full">{game.level}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white leading-tight">{game.titleFa}</h3>
                      <p className="text-[10px] text-slate-300/80 mt-1 line-clamp-2 leading-relaxed">{game.descFa}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                      <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                        <Users size={8} /> {game.maxPlayers > 1 ? game.maxPlayers + ' نفره' : 'تک‌نفره'}
                      </span>
                      {MULTIPLAYER_IDS.includes(game.id) && (
                        <span className="text-[9px] text-green-400 flex items-center gap-0.5">
                          <Globe size={8} /> آنلاین
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Records */}
            {(highScores.best2048 > 0 || highScores.bestReaction > 0 || highScores.bestSnake > 0) && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center flex-wrap gap-2">
                <Trophy size={14} className="text-amber-400" />
                <span className="text-xs font-black text-amber-300 ml-1">رکوردها:</span>
                {highScores.best2048 > 0 && <span className="px-2.5 py-1 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs font-bold text-cyan-300">۲۰۴۸: {highScores.best2048.toLocaleString()}</span>}
                {highScores.bestReaction > 0 && highScores.bestReaction < 900 && <span className="px-2.5 py-1 rounded-xl bg-amber-950/50 border border-amber-500/30 text-xs font-bold text-amber-300">واکنش: {highScores.bestReaction}ms</span>}
                {highScores.bestSnake > 0 && <span className="px-2.5 py-1 rounded-xl bg-purple-950/50 border border-purple-500/30 text-xs font-bold text-purple-300">مار: {highScores.bestSnake}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB Create Game */}
      <motion.button whileTap={{ scale: 0.94 }}
        onClick={() => { setShowCreateModal(true); soundEngine.playTap?.(); haptics.tap?.(); }}
        className="fixed bottom-24 right-1/2 translate-x-1/2 z-40 flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-fuchsia-600 text-white font-black text-sm shadow-2xl shadow-purple-500/40 active:scale-95 transition-all"
        style={{ boxShadow: '0 0 30px rgba(168,85,247,0.5)' }}
      >
        <Plus size={18} /> ساخت بازی آنلاین
      </motion.button>

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleRoomCreated}
        userName={userName}
        userAvatar={userAvatar}
      />
    </div>
  );
}
