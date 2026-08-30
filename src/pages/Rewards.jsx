import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Flame, Award, Sparkles, Plus, Check, Clock, Coins,
  Lock, Unlock, ArrowRight, Trash2, Heart, CheckCircle2, ChevronRight,
  TrendingUp, Calendar, Zap, RefreshCw, X, ShieldAlert, Star
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import ZenBonsai from '../components/gamification/ZenBonsai';
import soundEngine from '../utils/audio';

export default function Rewards() {
  const { language, coins, addCoins, spendCoins, addXP, awardBadge } = useAppStore();
  const isRtl = language === 'fa';

  const {
    rewards, loadRewards, addReward, redeemReward, deleteReward,
    quests, loadQuests, checkInQuest
  } = useSectionsStore();

  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'quests' | 'bonsai'

  // Modal states
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [newReward, setNewReward] = useState({
    titleFa: '',
    titleEn: '',
    cost: 300,
    icon: '🎁',
    category: 'custom'
  });

  const [claimedRewardSuccess, setClaimedRewardSuccess] = useState(null);

  useEffect(() => {
    loadRewards();
    loadQuests();
  }, []);

  // Handle purchase/redeem
  const handleRedeem = async (reward) => {
    if (coins < reward.cost) {
      alert(isRtl ? 'سکه کافی ندارید! با انجام عادات روزانه سکه کسب کنید.' : 'Not enough Life Coins! Complete daily habits to earn more.');
      return;
    }

    const success = spendCoins(reward.cost);
    if (success) {
      await redeemReward(reward.id);
      awardBadge('reward_first_claimed');
      setClaimedRewardSuccess(reward);
      setTimeout(() => setClaimedRewardSuccess(null), 4000);
    }
  };

  // Handle quest check-in
  const handleQuestCheckIn = async (questId) => {
    const result = await checkInQuest(questId);
    if (result && result.quest) {
      soundEngine.playLevelUp();
      addCoins(20, 'Quest Daily Check-in');
      addXP(40, 'Quest Daily Check-in');

      if (result.isNowCompleted) {
        addCoins(result.quest.rewardCoins, 'Quest Completed!');
        addXP(result.quest.rewardXp, 'Quest Completed!');
        if (result.quest.badgeId) {
          awardBadge(result.quest.badgeId);
        }
        alert(isRtl
          ? `🎉 تبریک! چالش «${result.quest.titleFa}» را فتح کردید! ${result.quest.rewardCoins} سکه و مدال اسطوره‌ای دریافت کردید.`
          : `🎉 Epic Victory! You conquered "${result.quest.titleEn}"! Claimed ${result.quest.rewardCoins} Coins & Mythic Badge.`
        );
      }
    }
  };

  const TABS = [
    { id: 'store', fa: 'فروشگاه پاداش‌ها', en: 'Reward Store', icon: <ShoppingBag size={16} /> },
    { id: 'quests', fa: 'چالش‌های اسطوره‌ای', en: 'Mythic Quests', icon: <Flame size={16} /> },
    { id: 'bonsai', fa: 'باغچه ذهن و بونسای', en: 'Zen Bonsai', icon: <Sparkles size={16} /> },
  ];

  return (
    <div className="page-container pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20">
              🪙
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[var(--text-primary)]">
                {isRtl ? 'اقتصاد درونی و چالش‌ها' : 'Life Economy & Quests'}
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                {isRtl ? 'مدیریت دوپامین و پاداش‌های شایسته' : 'Dopamine Mastery & Real Rewards'}
              </p>
            </div>
          </div>

          {/* Current Life Coins Counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-extrabold text-sm shadow-xs">
            <span className="text-base animate-bounce-subtle">🪙</span>
            <span>{coins || 0}</span>
            <span className="text-[10px] opacity-75">{isRtl ? 'سکه' : 'Coins'}</span>
          </div>
        </div>
      </motion.div>

      {/* Success Notification Alert */}
      <AnimatePresence>
        {claimedRewardSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-4 p-4 rounded-2xl bg-[var(--success)] text-white shadow-xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎉</span>
              <div>
                <h4 className="text-sm font-bold">
                  {isRtl ? 'پاداش با موفقیت آنلاک شد!' : 'Reward Successfully Claimed!'}
                </h4>
                <p className="text-xs opacity-90">
                  {isRtl ? claimedRewardSuccess.titleFa : claimedRewardSuccess.titleEn} ({claimedRewardSuccess.cost} {isRtl ? 'سکه مصرف شد' : 'coins spent'})
                </p>
              </div>
            </div>
            <button onClick={() => setClaimedRewardSuccess(null)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--border)]">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <span className="mb-1">{tab.icon}</span>
            <span>{isRtl ? tab.fa : tab.en}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {/* ===================== TAB 1: REWARD STORE ===================== */}
        {activeTab === 'store' && (
          <motion.div
            key="store"
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
            className="space-y-4"
          >
            {/* Store Banner */}
            <div className="glass-card rounded-3xl p-5 border border-[var(--border)] relative overflow-hidden">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {isRtl ? 'فروشگاه پاداش‌های واقعی' : 'Personal Real-World Reward Store'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {isRtl
                      ? 'لذت‌های زندگی (فیلم، رستوران، استراحت) را با تلاش و استمرار بخرید تا ترشح دوپامین مغز کنترل شود.'
                      : 'Earn real pleasures by staying consistent. Condition your brain to crave effort before reward.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddRewardOpen(true)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  <Plus size={15} />
                  <span>{isRtl ? 'تعریف پاداش جدید' : 'New Reward'}</span>
                </button>
              </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rewards.map((r) => {
                const canAfford = coins >= r.cost;
                return (
                  <div
                    key={r.id}
                    className="glass-card rounded-2xl p-4 border border-[var(--border)] flex items-center justify-between gap-3 relative overflow-hidden group hover:border-[var(--accent)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {r.icon || '🎁'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">
                          {isRtl ? r.titleFa : (r.titleEn || r.titleFa)}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-amber-500 flex items-center gap-0.5">
                            🪙 {r.cost}
                          </span>
                          {r.redeemedCount > 0 && (
                            <span className="text-[9px] text-[var(--text-secondary)]">
                              • {isRtl ? `${r.redeemedCount} بار دریافت شده` : `${r.redeemedCount} claimed`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRedeem(r)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md active:scale-95 font-black'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] opacity-50 cursor-not-allowed border border-[var(--border)]'
                        }`}
                        title={canAfford ? 'دریافت پاداش' : 'سکه ناکافی'}
                      >
                        <ShoppingBag size={13} />
                        <span>{isRtl ? 'خرید' : 'Claim'}</span>
                      </button>

                      <button
                        onClick={() => deleteReward(r.id)}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title={isRtl ? 'حذف' : 'Delete'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ===================== TAB 2: MYTHIC QUESTS ===================== */}
        {activeTab === 'quests' && (
          <motion.div
            key="quests"
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-3xl p-5 border border-[var(--border)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                <Flame size={16} className="text-amber-500" />
                {isRtl ? 'چالش‌های زمان‌دار و مدال‌های اسطوره‌ای' : 'Time-boxed Quests & Mythic Badges'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isRtl
                  ? 'سفرهای ۲۱ تا ۹۰ روزه برای سیم‌کشی مجدد مغز. هر روز ثبت پیشرفت کنید تا جوایز افسانه‌ای را باز کنید.'
                  : 'Multi-week epic journeys to rewire neuro-circuits. Check in daily to unlock legendary badges and coins.'}
              </p>
            </div>

            <div className="space-y-3">
              {quests.map((q) => {
                const percent = Math.min(100, Math.round(((q.currentDay || 0) / q.durationDays) * 100));
                return (
                  <div
                    key={q.id}
                    className={`glass-card rounded-2xl p-4 border transition-all ${
                      q.isCompleted
                        ? 'border-[var(--success)]/40 bg-[var(--success)]/5'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{q.icon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-[var(--text-primary)]">
                            {isRtl ? q.titleFa : q.titleEn}
                          </h4>
                          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                            {isRtl ? `دوره ${q.durationDays} روزه • پیشرفت: روز ${q.currentDay} از ${q.durationDays}` : `${q.durationDays}-Day Quest • Day ${q.currentDay} of ${q.durationDays}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-end">
                        <span className="text-xs font-black text-amber-500">+{q.rewardCoins} 🪙</span>
                        <span className="text-[10px] text-[var(--accent)] block font-bold">+{q.rewardXp} XP</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                      />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]/50">
                      <span className="text-[11px] font-bold text-[var(--text-primary)]">
                        {percent}% {isRtl ? 'تکمیل شده' : 'Completed'}
                      </span>

                      {q.isCompleted ? (
                        <span className="flex items-center gap-1 text-xs font-black text-[var(--success)]">
                          <CheckCircle2 size={14} />
                          {isRtl ? 'چالش فتح شد!' : 'Conquered!'}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleQuestCheckIn(q.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[var(--accent)] to-purple-600 text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <Zap size={13} />
                          <span>{isRtl ? 'ثبت پیشرفت امروز' : 'Check-in Today'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ===================== TAB 3: ZEN BONSAI GARDEN ===================== */}
        {activeTab === 'bonsai' && (
          <motion.div
            key="bonsai"
            initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
            className="space-y-4"
          >
            <ZenBonsai compact={false} />

            {/* Bonsai Lore & Stages Info */}
            <div className="glass-card rounded-2xl p-4 border border-[var(--border)] space-y-2">
              <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Award size={14} className="text-amber-500" />
                {isRtl ? 'قوانین باغبانی ذهن و تکامل بونسای' : 'Zen Bonsai Growth Principles'}
              </h4>
              <ul className="text-[11px] text-[var(--text-secondary)] space-y-1.5 list-disc list-inside leading-relaxed">
                <li>{isRtl ? '💧 آبیاری: با ثبت بهداشت و آب‌رسانی به تن، درخت شما شاداب می‌ماند.' : '💧 Water: Hydration and health habits keep the tree vigorous.'}</li>
                <li>{isRtl ? '☀️ نور: با مطالعه و یادگیری روزانه، شاخسار آن پربرگ و نورانی می‌شود.' : '☀️ Light: Daily study and learning expands its canopy.'}</li>
                <li>{isRtl ? '🧘 سکوت: با دقایق مراقبه و ژورنال‌نویسی، بونسای شکوفا می‌گردد.' : '🧘 Zen: Mindfulness and quiet meditation triggers blooming.'}</li>
              </ul>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* MODAL: ADD CUSTOM REWARD */}
      {isAddRewardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-sm p-5 rounded-3xl border border-[var(--border)] shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                {isRtl ? 'تعریف پاداش شخصی جدید' : 'Create Custom Reward'}
              </h3>
              <button onClick={() => setIsAddRewardOpen(false)} className="p-1 rounded-lg text-[var(--text-secondary)]">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newReward.titleFa && !newReward.titleEn) return;
                await addReward({
                  titleFa: newReward.titleFa || newReward.titleEn,
                  titleEn: newReward.titleEn || newReward.titleFa,
                  cost: Number(newReward.cost) || 200,
                  icon: newReward.icon || '🎁',
                  category: newReward.category
                });
                setIsAddRewardOpen(false);
                setNewReward({ titleFa: '', titleEn: '', cost: 300, icon: '🎁', category: 'custom' });
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-[11px] text-[var(--text-secondary)] block mb-1">
                  {isRtl ? 'عنوان پاداش:' : 'Reward Title:'}
                </label>
                <input
                  type="text"
                  placeholder={isRtl ? 'مثلاً: خرید کفش جدید، تماشای تئاتر...' : 'e.g. Buy new shoes, concert...'}
                  value={newReward.titleFa}
                  onChange={(e) => setNewReward({ ...newReward, titleFa: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  dir={isRtl ? 'rtl' : 'ltr'}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-[var(--text-secondary)] block mb-1">
                    {isRtl ? 'قیمت (سکه):' : 'Cost (Coins):'}
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={newReward.cost}
                    onChange={(e) => setNewReward({ ...newReward, cost: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-bold text-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[var(--text-secondary)] block mb-1">
                    {isRtl ? 'آیکون ایموجی:' : 'Emoji Icon:'}
                  </label>
                  <input
                    type="text"
                    value={newReward.icon}
                    onChange={(e) => setNewReward({ ...newReward, icon: e.target.value })}
                    className="w-full px-3 py-2 text-center text-sm rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-95 mt-2"
              >
                {isRtl ? 'ثبت و افزودن به فروشگاه' : 'Save to Store'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
