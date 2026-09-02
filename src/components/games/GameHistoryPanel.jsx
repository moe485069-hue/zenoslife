import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Coins, ChevronLeft, BarChart2, Zap, Target } from 'lucide-react';
import useAppStore from '../../store/appStore';
import { GAME_ACHIEVEMENTS } from './AchievementToast';

const DURATION_LABEL = (ms, isRtl) => {
  if (!ms) return isRtl ? '—' : '—';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m === 0) return isRtl ? `${s} ثانیه` : `${s}s`;
  return isRtl ? `${m}:${String(rem).padStart(2, '0')} دقیقه` : `${m}:${String(rem).padStart(2, '0')}`;
};

export default function GameHistoryPanel({ onClose }) {
  const { gameHistory, gameStats, gameAchievements, language } = useAppStore();
  const isRtl = language === 'fa';

  const winRate = gameStats.totalGames > 0
    ? Math.round((gameStats.totalWins / gameStats.totalGames) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <BarChart2 size={20} className="text-amber-400" />
          <h2 className="text-base font-black text-white">
            {isRtl ? 'کارنامه و دستاوردهای من' : 'My Stats & Achievements'}
          </h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={16} className={isRtl ? 'rotate-180' : ''} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: isRtl ? 'کل بازی' : 'Total Games', value: gameStats.totalGames || 0, icon: '🎮', color: 'text-sky-300' },
            { label: isRtl ? 'پیروزی' : 'Wins', value: gameStats.totalWins || 0, icon: '🏆', color: 'text-amber-300' },
            { label: isRtl ? 'نرخ برد' : 'Win Rate', value: `${winRate}%`, icon: '📊', color: 'text-emerald-300' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-400 font-bold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Streak info */}
        <div className="flex gap-2">
          <div className="flex-1 p-3 rounded-2xl bg-orange-950/40 border border-orange-500/30 flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-sm font-black text-orange-300">{gameStats.currentWinStreak || 0}</div>
              <div className="text-[10px] text-slate-400 font-bold">{isRtl ? 'استریک فعلی' : 'Current Streak'}</div>
            </div>
          </div>
          <div className="flex-1 p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="text-sm font-black text-purple-300">{gameStats.maxWinStreak || 0}</div>
              <div className="text-[10px] text-slate-400 font-bold">{isRtl ? 'بیشترین استریک' : 'Best Streak'}</div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        {gameAchievements.length > 0 && (
          <div>
            <h3 className="text-xs font-black text-amber-300 mb-2 flex items-center gap-1.5">
              <Trophy size={13} />
              {isRtl ? 'دستاوردهای کسب‌شده' : 'Unlocked Achievements'}
              <span className="text-slate-400 font-mono">({gameAchievements.length})</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <AnimatePresence>
                {gameAchievements.map((id, i) => {
                  const a = GAME_ACHIEVEMENTS[id];
                  if (!a) return null;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={`p-2.5 rounded-2xl border flex items-center gap-2 ${
                        a.rarity === 'legendary' ? 'border-amber-400/60 bg-amber-900/20' :
                        a.rarity === 'epic'      ? 'border-purple-400/50 bg-purple-900/20' :
                        a.rarity === 'rare'      ? 'border-blue-400/40 bg-blue-900/20' :
                                                   'border-white/10 bg-white/5'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{a.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">
                          {isRtl ? a.nameFa : a.nameEn}
                        </p>
                        <p className="text-[9px] text-slate-400 line-clamp-1">
                          {isRtl ? a.descFa : a.descEn}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Game History List */}
        <div>
          <h3 className="text-xs font-black text-slate-300 mb-2 flex items-center gap-1.5">
            <Clock size={13} />
            {isRtl ? 'آخرین بازی‌ها' : 'Recent Games'}
          </h3>

          {gameHistory.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm font-bold">
              {isRtl ? 'هنوز بازی‌ای ثبت نشده 🎮' : 'No games recorded yet 🎮'}
            </div>
          ) : (
            <div className="space-y-1.5">
              {gameHistory.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl border ${
                    entry.won
                      ? 'bg-emerald-950/30 border-emerald-500/30'
                      : 'bg-rose-950/30 border-rose-500/20'
                  }`}
                >
                  {/* Game Icon */}
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                    {entry.gameIcon || '🎮'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white truncate">{entry.gameName}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        entry.won ? 'bg-emerald-500 text-white' : 'bg-rose-600/80 text-rose-100'
                      }`}>
                        {entry.won ? (isRtl ? 'برد 🏆' : 'Win 🏆') : (isRtl ? 'باخت' : 'Loss')}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{entry.opponent || (isRtl ? 'ربات' : 'Bot')}</span>
                      <span>·</span>
                      <span>{DURATION_LABEL(entry.durationMs, isRtl)}</span>
                      <span>·</span>
                      <span>{entry.playedAtLabel}</span>
                    </div>
                  </div>

                  {/* Coins */}
                  {entry.coinsEarned > 0 && (
                    <span className="text-xs font-black text-amber-300 shrink-0">
                      +{entry.coinsEarned} 🪙
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
