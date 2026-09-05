import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, MessageSquare, Check, X, Trophy, Swords, ShieldCheck } from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export default function OpponentProfileModal({
  isOpen,
  onClose,
  player,
  isFriend = false,
  onSendFriendRequest,
  onRequestChat,
  isRtl = true,
  colorMode = 'dark'
}) {
  const [requestSent, setRequestSent] = useState(false);

  if (!player) return null;

  const isDark = colorMode === 'dark';
  const isBot = !!player.isBot;

  const handleSendFriend = () => {
    soundEngine.playTap?.();
    haptics.impact?.('light');
    if (isBot) {
      soundEngine.playLevelUp?.();
      return;
    }
    setRequestSent(true);
    if (onSendFriendRequest) {
      onSendFriendRequest(player);
    }
  };

  const handleChat = () => {
    soundEngine.playTap?.();
    haptics.impact?.('light');
    if (onRequestChat) {
      onRequestChat(player);
    }
  };

  const handleClose = () => {
    soundEngine.playTap?.();
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[65] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
          dir={isRtl ? 'rtl' : 'ltr'}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 25 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-sm overflow-hidden rounded-3xl border shadow-2xl p-6 ${
              isDark 
                ? 'bg-slate-900/95 border-amber-500/40 text-white shadow-black/80' 
                : 'bg-white/95 border-amber-500/30 text-slate-900 shadow-slate-300/60'
            }`}
          >
            {/* Top Glowing Ambient Circles */}
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />

            {/* Close Cross Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Header / Avatar */}
            <div className="flex flex-col items-center text-center mt-2">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-1 shadow-lg shadow-amber-500/25">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl">
                    {player.avatar || (player.role === 'white' ? '⚪' : '⚫')}
                  </div>
                </div>
                {/* Role indicator chip */}
                <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-md">
                  {player.role === 'white' ? (isRtl ? 'سفید ⚪' : 'White ⚪') : (isRtl ? 'سیاه ⚫' : 'Black ⚫')}
                </div>
              </div>

              {/* Player Name */}
              <h3 className="text-lg font-black tracking-wide flex items-center gap-1.5">
                <span>{player.name || (isRtl ? 'بازیکن چاژا' : 'Chazha Player')}</span>
                {isBot && <span className="text-xs px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">BOT</span>}
              </h3>

              {/* Rank / Level */}
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {player.rank || (isBot ? 'هوش مصنوعی چاژا 🤖' : 'استاد تخته نرد 🎲')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Lv.{player.level || (isBot ? 99 : 14)}
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span>{isRtl ? 'آنلاین و در حال مسابقه' : 'Online & Playing'}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 my-5">
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <Trophy size={16} className="mx-auto text-amber-400 mb-1" />
                <span className="block text-[10px] text-slate-400">{isRtl ? 'نرخ برد' : 'Win Rate'}</span>
                <span className="text-xs font-mono font-bold text-amber-300">{player.winRate || '68%'}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <Swords size={16} className="mx-auto text-sky-400 mb-1" />
                <span className="block text-[10px] text-slate-400">{isRtl ? 'مسابقات' : 'Matches'}</span>
                <span className="text-xs font-mono font-bold text-sky-300">{player.matchesCount || 34}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <ShieldCheck size={16} className="mx-auto text-emerald-400 mb-1" />
                <span className="block text-[10px] text-slate-400">{isRtl ? 'اعتبار' : 'Score'}</span>
                <span className="text-xs font-mono font-bold text-emerald-300">1,480</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              {isBot ? (
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-center text-xs text-sky-300 font-medium">
                  🤖 {isRtl ? 'ربات هوشمند چاژا یار همیشگی شما در تمرین و رقابت است!' : 'Chazha AI is your dedicated practice companion!'}
                </div>
              ) : (
                <>
                  {/* Friend Request Button */}
                  <button
                    onClick={handleSendFriend}
                    disabled={isFriend || requestSent}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
                      isFriend
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : requestSent
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-sky-500/25'
                    }`}
                  >
                    {isFriend ? (
                      <>
                        <Check size={18} />
                        <span>{isRtl ? 'در لیست دوستان شما ✅' : 'Already Friends ✅'}</span>
                      </>
                    ) : requestSent ? (
                      <>
                        <Check size={18} />
                        <span>{isRtl ? 'درخواست دوستی ارسال شد' : 'Request Sent'}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        <span>{isRtl ? '🤝 ارسال درخواست دوستی در تلگرام' : 'Send Friend Request'}</span>
                      </>
                    )}
                  </button>

                  {/* Request Chat in Bot */}
                  <button
                    onClick={handleChat}
                    className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-slate-200 border border-white/15 transition-all"
                  >
                    <MessageSquare size={16} />
                    <span>{isRtl ? '💬 گفت‌وگو / چت در ربات تلگرام' : 'Chat in Telegram Bot'}</span>
                  </button>
                </>
              )}

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
              >
                {isRtl ? 'بستن' : 'Close'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
