import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Trophy, Plus, X, Award, Flame, Crown, Gift, Check, Sparkles } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

const INITIAL_CLANS = [
  {
    id: 'clan_takhti',
    nameFa: 'تختی‌بازان پایتخت',
    nameEn: 'Tehran Backgammon Masters',
    badge: '🦁',
    descFa: 'بزرگ‌ترین کلوب تخته‌نرد و مرام‌داران اصیل ایران. ورود برای همه آزاد است.',
    descEn: 'The grandest Persian backgammon club. Respect and honor above all.',
    leader: 'آرشام_تاس‌باز',
    membersCount: 42,
    maxMembers: 50,
    trophies: 18450,
    minTrophies: 100,
    dailyBonus: 120
  },
  {
    id: 'clan_snooker_kings',
    nameFa: 'سلاطین اسنوکر و بیلیارد',
    nameEn: 'Royal Snooker Kings',
    badge: '🎱',
    descFa: 'کلوب بازیکنان حرفه‌ای اسنوکر و پاکت بیلیارد. مسابقات داخلی و جوایز هفتگی.',
    descEn: 'Elite snooker and billiards players. Weekly club tournaments.',
    leader: 'استاد_بریک',
    membersCount: 38,
    maxMembers: 50,
    trophies: 16200,
    minTrophies: 300,
    dailyBonus: 150
  },
  {
    id: 'clan_hokm_vip',
    nameFa: 'باشگاه حکم‌بازان VIP',
    nameEn: 'VIP Hokm Guild',
    badge: '👑',
    descFa: 'تیم‌های هماهنگ حکم ۴ نفره. کری‌خوانی، دست‌گرمی و شرط‌بندی‌های سنگین.',
    descEn: 'Synchronized 4-player Hokm teams. High stakes and glory.',
    leader: 'نگین_تک‌خال',
    membersCount: 49,
    maxMembers: 50,
    trophies: 15100,
    minTrophies: 200,
    dailyBonus: 100
  },
  {
    id: 'clan_cyber_phoenix',
    nameFa: 'شیران بیشه چاژا',
    nameEn: 'Chazha Cyber Phoenix',
    badge: '🔥',
    descFa: 'کلن تازه تاسیس بازیکنان سرعتی، ایرهاکی، پاستور و منچ.',
    descEn: 'Fast-paced arcade players for Air Hockey, Pasur and Ludo.',
    leader: 'سام_سرعتی',
    membersCount: 25,
    maxMembers: 50,
    trophies: 9800,
    minTrophies: 50,
    dailyBonus: 80
  }
];

const BADGE_OPTIONS = ['🦁', '👑', '🎱', '🔥', '⚔️', '🦅', '🐺', '🏆', '💎', '⚡'];

export default function ClansHubModal({ isOpen, onClose }) {
  const { coins, spendCoins, addCoins, language } = useAppStore();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState('ranking'); // 'ranking' | 'my_clan' | 'create'
  const [clans, setClans] = useState(INITIAL_CLANS);
  const [myClanId, setMyClanId] = useState(null);
  const [claimedBonusToday, setClaimedBonusToday] = useState(false);

  // Form states for creating a new clan
  const [newClanName, setNewClanName] = useState('');
  const [newClanDesc, setNewClanDesc] = useState('');
  const [newClanBadge, setNewClanBadge] = useState('🦁');
  const [newClanMinTrophies, setNewClanMinTrophies] = useState(100);

  useEffect(() => {
    const savedClan = localStorage.getItem('chazha_user_clan');
    if (savedClan) setMyClanId(savedClan);

    const savedBonusDate = localStorage.getItem('chazha_clan_bonus_date');
    const todayStr = new Date().toISOString().slice(0, 10);
    if (savedBonusDate === todayStr) {
      setClaimedBonusToday(true);
    }
  }, [isOpen]);

  const currentMyClan = clans.find(c => c.id === myClanId);

  const handleJoinClan = (clan) => {
    if (myClanId === clan.id) return;
    setMyClanId(clan.id);
    localStorage.setItem('chazha_user_clan', clan.id);
    soundEngine.playLevelUp?.();
    haptics.notification?.('success');
  };

  const handleLeaveClan = () => {
    setMyClanId(null);
    localStorage.removeItem('chazha_user_clan');
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleClaimBonus = () => {
    if (claimedBonusToday || !currentMyClan) return;
    const bonus = currentMyClan.dailyBonus || 100;
    addCoins?.(bonus);
    const todayStr = new Date().toISOString().slice(0, 10);
    localStorage.setItem('chazha_clan_bonus_date', todayStr);
    setClaimedBonusToday(true);
    soundEngine.playLevelUp?.();
    haptics.rewardClaimed?.();
  };

  const handleCreateClan = (e) => {
    e.preventDefault();
    if (!newClanName.trim()) return;
    const cost = 500;
    if (!spendCoins(cost)) {
      alert(isRtl ? 'موجودی سکه برای ساخت کلن کافی نیست (۵۰۰ سکه لازم است)' : 'Insufficient coins to create clan (500 coins needed)');
      return;
    }

    const createdId = 'clan_' + Date.now();
    const newClanObj = {
      id: createdId,
      nameFa: newClanName.trim(),
      nameEn: newClanName.trim(),
      badge: newClanBadge,
      descFa: newClanDesc.trim() || (isRtl ? 'کلوب رسمی و دوستانه چاژا' : 'Official Chazha Club'),
      descEn: newClanDesc.trim() || 'Official Chazha Club',
      leader: isRtl ? 'شما (لیدر)' : 'You (Leader)',
      membersCount: 1,
      maxMembers: 50,
      trophies: 1000,
      minTrophies: Number(newClanMinTrophies) || 100,
      dailyBonus: 100
    };

    setClans([newClanObj, ...clans]);
    setMyClanId(createdId);
    localStorage.setItem('chazha_user_clan', createdId);
    setActiveTab('my_clan');
    soundEngine.playLevelUp?.();
    haptics.notification?.('success');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md max-h-[85vh] rounded-3xl bg-slate-950 border-2 border-indigo-500/40 shadow-[0_0_50px_rgba(99,102,241,0.25)] flex flex-col p-4 sm:p-5 text-start overflow-hidden relative"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-1.5">
                    <span>{isRtl ? 'کلوب‌ها و کلن‌های چاژا' : 'Chazha Clubs & Clans'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold">GUILDS</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">
                    {isRtl ? 'اتحاد با دوستان، رقابت تیمی و پاداش‌های روزانه' : 'Team up with friends, compete & earn daily rewards'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 my-3 shrink-0">
              <button
                onClick={() => { setActiveTab('ranking'); soundEngine.playTap?.(); haptics.tap?.(); }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'ranking'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? 'رتبه‌بندی کلوب‌ها' : 'Leaderboard'}
              </button>

              <button
                onClick={() => { setActiveTab('my_clan'); soundEngine.playTap?.(); haptics.tap?.(); }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer relative ${
                  activeTab === 'my_clan'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? 'کلن من' : 'My Clan'}
                {myClanId && <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5" />}
              </button>

              <button
                onClick={() => { setActiveTab('create'); soundEngine.playTap?.(); haptics.tap?.(); }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRtl ? '+ ساخت کلن' : '+ Create'}
              </button>
            </div>

            {/* Tab Contents Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
              {/* TAB 1: RANKING */}
              {activeTab === 'ranking' && (
                <div className="space-y-2.5">
                  {clans.map((clan, index) => {
                    const isMember = myClanId === clan.id;
                    return (
                      <div
                        key={clan.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isMember
                            ? 'bg-indigo-950/40 border-indigo-400/60 shadow-lg shadow-indigo-950/50'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-5 text-center font-black text-xs text-slate-500 font-mono">
                              #{index + 1}
                            </span>
                            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-2xl">
                              {clan.badge}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                                <span>{isRtl ? clan.nameFa : clan.nameEn}</span>
                                {isMember && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                                    {isRtl ? 'عضو' : 'Joined'}
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                {isRtl ? clan.descFa : clan.descEn}
                              </p>
                            </div>
                          </div>

                          <div className="text-end">
                            <div className="flex items-center gap-1 text-amber-300 font-black text-xs">
                              <Trophy size={13} />
                              <span>{clan.trophies.toLocaleString()}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                              {clan.membersCount}/{clan.maxMembers} {isRtl ? 'عضو' : 'Members'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/10 text-xs">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Crown size={12} className="text-amber-400" />
                            <span>{clan.leader}</span>
                          </span>

                          {isMember ? (
                            <button
                              onClick={handleLeaveClan}
                              className="px-3 py-1 rounded-xl text-[10px] font-black bg-rose-500/20 border border-rose-400/40 text-rose-300 hover:bg-rose-500/30 transition-all cursor-pointer"
                            >
                              {isRtl ? 'خروج از کلن' : 'Leave'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinClan(clan)}
                              className="px-4 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                            >
                              {isRtl ? 'عضویت در کلوب' : 'Join Club'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: MY CLAN */}
              {activeTab === 'my_clan' && (
                <div>
                  {currentMyClan ? (
                    <div className="space-y-4">
                      {/* Clan Hero Card */}
                      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-950 border-2 border-indigo-400/50 shadow-xl space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border-2 border-indigo-400/50 flex items-center justify-center text-3xl">
                            {currentMyClan.badge}
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white">
                              {isRtl ? currentMyClan.nameFa : currentMyClan.nameEn}
                            </h4>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              {isRtl ? currentMyClan.descFa : currentMyClan.descEn}
                            </p>
                            <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1 mt-1">
                              <Crown size={12} /> {isRtl ? 'لیدر:' : 'Leader:'} {currentMyClan.leader}
                            </span>
                          </div>
                        </div>

                        {/* Clan Stats */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-center">
                          <div className="p-2 rounded-xl bg-white/5">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'مجموع کاپ‌ها' : 'Trophies'}</span>
                            <span className="text-sm font-black text-amber-300">{currentMyClan.trophies.toLocaleString()} 🏆</span>
                          </div>
                          <div className="p-2 rounded-xl bg-white/5">
                            <span className="text-[10px] text-slate-400 block">{isRtl ? 'ظرفیت کلوب' : 'Members'}</span>
                            <span className="text-sm font-black text-white">{currentMyClan.membersCount}/{currentMyClan.maxMembers} 👥</span>
                          </div>
                        </div>
                      </div>

                      {/* Daily Clan Chest Reward */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/20 to-amber-500/15 border border-amber-400/40 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                            <Gift size={20} />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-white">
                              {isRtl ? 'صندوقچه روزانه کلن' : 'Daily Clan Chest'}
                            </h5>
                            <span className="text-[10px] text-amber-300 font-bold">
                              +{currentMyClan.dailyBonus || 100} {isRtl ? 'سکه هدیه روزانه' : 'Daily bonus coins'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleClaimBonus}
                          disabled={claimedBonusToday}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer ${
                            claimedBonusToday
                              ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md hover:brightness-110'
                          }`}
                        >
                          {claimedBonusToday ? (isRtl ? 'دریافت شد ✓' : 'Claimed ✓') : (isRtl ? 'دریافت سکه' : 'Claim')}
                        </button>
                      </div>

                      <button
                        onClick={handleLeaveClan}
                        className="w-full py-2.5 rounded-xl text-xs font-black bg-white/5 border border-white/10 text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer text-center"
                      >
                        {isRtl ? 'ترک این کلوب' : 'Leave Club'}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-3">
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl mx-auto">
                        🛡️
                      </div>
                      <h4 className="text-sm font-black text-white">
                        {isRtl ? 'شما هنوز عضو هیچ کلوبی نیستید!' : 'You are not in any club yet!'}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        {isRtl
                          ? 'از تب رتبه‌بندی وارد یکی از کلن‌ها شوید یا در تب ساخت کلن، کلوب اختصاصی خود را بسازید.'
                          : 'Join an existing clan from the leaderboard or create your own in the Create tab.'}
                      </p>
                      <button
                        onClick={() => setActiveTab('ranking')}
                        className="px-5 py-2 rounded-xl text-xs font-black bg-indigo-600 text-white shadow-md hover:bg-indigo-500 transition-all cursor-pointer"
                      >
                        {isRtl ? 'مشاهده کلن‌های برتر' : 'Browse Clans'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CREATE CLAN */}
              {activeTab === 'create' && (
                <form onSubmit={handleCreateClan} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {isRtl ? 'نام کلوب / کلن:' : 'Club Name:'}
                    </label>
                    <input
                      type="text"
                      value={newClanName}
                      onChange={e => setNewClanName(e.target.value)}
                      placeholder={isRtl ? 'مثلاً: شاهین اسنوکر' : 'e.g. Royal Snooker'}
                      maxLength={25}
                      required
                      className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {isRtl ? 'نشان و آیکون کلن:' : 'Clan Badge:'}
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {BADGE_OPTIONS.map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setNewClanBadge(b)}
                          className={`w-9 h-9 rounded-xl border text-xl flex items-center justify-center transition-all cursor-pointer ${
                            newClanBadge === b
                              ? 'bg-indigo-600 border-indigo-300 scale-110 shadow-lg'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      {isRtl ? 'شعار یا توضیحات کلن:' : 'Description:'}
                    </label>
                    <input
                      type="text"
                      value={newClanDesc}
                      onChange={e => setNewClanDesc(e.target.value)}
                      placeholder={isRtl ? 'شعار افتخار و دورهمی دوستان' : 'Clan motto and rules'}
                      maxLength={60}
                      className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold">{isRtl ? 'هزینه تاسیس کلن:' : 'Creation Fee:'}</span>
                    <span className="text-amber-300 font-black">۵۰۰ 🪙 سکه</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={15} />
                    <span>{isRtl ? 'تاسیس کلوب (۵۰۰ سکه)' : 'Found Club (500 Coins)'}</span>
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
