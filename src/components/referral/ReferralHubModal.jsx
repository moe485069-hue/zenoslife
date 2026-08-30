import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Share2, Copy, Gift, Check, Sparkles, Award, ArrowUpRight, Flame } from 'lucide-react';
import useAppStore from '../../store/appStore';
import useMultiplayerStore from '../../store/multiplayerStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export const SPONSOR_TASKS = [
  { id: 'tg_channel', title: 'عضویت در کانال رسمی زنوسلایف', icon: '📢', reward: 500, link: 'https://t.me/zenoslife' },
  { id: 'tg_group', title: 'پیوستن به سوپرگروه جامعه کیهانی', icon: '💬', reward: 500, link: 'https://t.me/zenoslife_chat' },
  { id: 'daily_checkin', title: 'استریک و حضور روزانه در اپلیکیشن', icon: '🔥', reward: 200, link: null }
];

export default function ReferralHubModal({ isOpen, onClose }) {
  const { userId } = useMultiplayerStore();
  const { invitedCount, referralEarnings, claimedEarnings, claimReferralBounty, completedTasks, completeSponsorTask } = useAppStore();
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://t.me/zenoslife_bot/app?startapp=ref_${userId}`;
  const shareText = `🌟 به دنیای بازی‌ها، چت زنده و خودشناسی زنوسلایف بپیوند! با لینک اختصاصی من وارد شو و ۱,۰۰۰ سکه هدیه بگیر: \n${inviteLink}`;

  const claimable = referralEarnings - claimedEarnings;

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteLink);
    setCopied(true);
    soundEngine.playCheckmark?.();
    haptics.tap?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    soundEngine.playTap?.();
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('به آرکید و جامعه هم‌فرکانس‌های زنوسلایف بپیوند! 🎮✨')}`;
    window.open(tgUrl, '_blank');
  };

  const handleClaim = () => {
    const res = claimReferralBounty();
    if (res.success) {
      alert(`🎉 تبریک! تعداد ${res.amount.toLocaleString()} سکه پورسانت به موجودی شما اضافه شد.`);
    }
  };

  const handleDoTask = (task) => {
    if (completedTasks.includes(task.id)) return;
    if (task.link) window.open(task.link, '_blank');
    completeSponsorTask(task.id, task.reward);
    soundEngine.playLevelUp?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md max-h-[90vh] rounded-3xl bg-slate-900 border-2 border-purple-500/40 flex flex-col justify-between p-5 shadow-2xl text-right overflow-y-auto"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">دعوت دوستان و کسب درآمد مادام‌العمر</h3>
                  <p className="text-[10px] text-pink-300 font-bold">+۱,۰۰۰ سکه برای شما و دوستتان + ۱۰٪ از تمام خریدها</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 my-3">
              {/* Earnings Card */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-900/40 to-indigo-950/60 border border-purple-500/40 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[11px] text-slate-300 font-bold">دوستان دعوت‌شده: <span className="text-amber-400 font-black">{invitedCount} نفر</span></p>
                  <p className="text-lg font-black text-white mt-0.5">
                    {referralEarnings.toLocaleString()} <span className="text-xs text-yellow-400">سکه کسب‌شده</span>
                  </p>
                </div>

                <button
                  onClick={handleClaim}
                  disabled={claimable <= 0}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs disabled:opacity-40 active:scale-95 shadow-md transition-all"
                >
                  {claimable > 0 ? `دریافت ${claimable} 🪙` : 'تسویه شده ✓'}
                </button>
              </div>

              {/* Share & Copy Link */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400">لینک اختصاصی دعوت شما:</span>
                <div className="flex gap-2">
                  <div className="flex-1 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 truncate text-left font-mono">
                    {inviteLink}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 active:scale-95"
                  >
                    {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>

                <button
                  onClick={handleShareTelegram}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white font-black text-xs shadow-xl shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={16} /> ارسال مستقیم در چت‌ها و گروه‌های تلگرام
                </button>
              </div>

              {/* Daily Sponsor Tasks */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={14} /> وظایف پاداش‌دار تلگرام (Sponsor Quests)
                </h4>

                <div className="space-y-1.5">
                  {SPONSOR_TASKS.map(task => {
                    const isDone = completedTasks.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{task.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{task.title}</p>
                            <span className="text-[10px] text-amber-400 font-bold">+{task.reward} سکه</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDoTask(task)}
                          disabled={isDone}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black active:scale-95 transition-all ${
                            isDone
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-purple-600 hover:bg-purple-500 text-white shadow'
                          }`}
                        >
                          {isDone ? 'انجام شد ✓' : 'دریافت'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
