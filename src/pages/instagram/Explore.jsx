import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/appStore';
import { db } from '../../db/database';
import MASTER_QUOTES from '../../data/quotesData';
import SafeImage from '../../components/ui/SafeImage';
import { Search, X, UserPlus, UserCheck, MessageCircle, ArrowUpRight, PlusCircle, CheckCircle2, Sparkles, BookOpen, Gamepad2, Compass, Heart, Copy, Check } from 'lucide-react';
import haptics from '../../utils/haptics';
import soundEngine from '../../utils/audio';

const SUGGESTED_USERS = [
  {
    id: 'user_1',
    username: 'ali_reza',
    fullName: 'علیرضا راد',
    avatar: 'https://i.pravatar.cc/150?img=11',
    bio: 'طراح تجربه کاربری و عاشق استمرار در عادات روزانه 🌱',
    followersCount: '4.2K',
    isFollowing: false,
    badge: 'فعال'
  },
  {
    id: 'user_2',
    username: 'sara_hm',
    fullName: 'سارا حیدری',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: 'ذهن‌آگاهی، مطالعه روزانه و تمرین تنفس ریتمیک 🧘‍♀️',
    followersCount: '8.9K',
    isFollowing: true,
    badge: 'منتور'
  },
  {
    id: 'user_3',
    username: 'mohsen.k',
    fullName: 'محسن کریمی',
    avatar: 'https://i.pravatar.cc/150?img=13',
    bio: 'علاقه‌مند به شطرنج کیهانی، برنامه‌نویسی و بازی‌های فکری ♟️',
    followersCount: '1.5K',
    isFollowing: false,
    badge: 'گیمر'
  },
  {
    id: 'user_4',
    username: 'zahra_art',
    fullName: 'زهرا میرزایی',
    avatar: 'https://i.pravatar.cc/150?img=9',
    bio: 'هنرمند، پژوهشگر خودشناسی و ثبت کپسول زمان ⏳',
    followersCount: '12K',
    isFollowing: false,
    badge: 'هنرمند'
  },
  {
    id: 'user_5',
    username: 'reza.tech',
    fullName: 'رضا فناوری',
    avatar: 'https://i.pravatar.cc/150?img=15',
    bio: 'بهره‌وری حداکثری با پومودورو و ماتریس اولویت‌ها ⚡',
    followersCount: '6.7K',
    isFollowing: false,
    badge: 'بهره‌وری'
  }
];

const EXPLORE_GRID_ITEMS = [
  { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&q=80', title: 'راهروهای ذهن', likes: '1.4K', span: 'col-span-1 row-span-1', route: '/stroll' },
  { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80', title: 'آرکید بازی‌ها', likes: '2.8K', span: 'col-span-1 row-span-1', route: '/games' },
  { id: 3, type: 'image', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80', title: 'هوش مصنوعی', likes: '4.1K', span: 'col-span-1 row-span-2', route: '/ai-mentor' },
  { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&q=80', title: 'ذهن‌آگاهی', likes: '3.2K', span: 'col-span-1 row-span-1', route: '/mindfulness' },
  { id: 5, type: 'image', url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&q=80', title: 'روز من', likes: '1.9K', span: 'col-span-1 row-span-1', route: '/my-day' },
  { id: 6, type: 'image', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=600&q=80', title: 'یگانگی کیهانی', likes: '5.6K', span: 'col-span-2 row-span-2', route: '/cosmic-unity' },
  { id: 7, type: 'image', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&q=80', title: 'ثروت و سرمایه', likes: '2.1K', span: 'col-span-1 row-span-1', route: '/wealth' },
  { id: 8, type: 'image', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&q=80', title: 'فلش‌کارت‌ها', likes: '3.9K', span: 'col-span-1 row-span-1', route: '/learning' },
  { id: 9, type: 'image', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80', title: 'کپسول زمان', likes: '2.4K', span: 'col-span-1 row-span-1', route: '/time-capsule' },
  { id: 10, type: 'image', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80', title: 'گراف مغز', likes: '4.8K', span: 'col-span-1 row-span-1', route: '/brain-graph' },
];

export default function Explore() {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const isRtl = language === 'fa';

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'realms' | 'users' | 'quotes'
  const [realmsList, setRealmsList] = useState([]);
  const [users, setUsers] = useState(SUGGESTED_USERS);
  const [pinnedKeys, setPinnedKeys] = useState(new Set());
  const [copiedQuoteId, setCopiedQuoteId] = useState(null);

  // Load feed posts and pinned status
  useEffect(() => {
    const fetchDb = async () => {
      try {
        const posts = await db.feedPosts.toArray();
        setRealmsList(posts);

        const pinned = await db.profileWidgets.toArray();
        setPinnedKeys(new Set(pinned.map(p => p.moduleKey)));
      } catch (err) {
        console.error('Error in explore fetch:', err);
      }
    };
    fetchDb();
  }, []);

  const handleToggleFollow = (userId) => {
    haptics.tap?.();
    soundEngine.playTap?.();
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isFollowing: !u.isFollowing } : u));
  };

  const handleTogglePin = async (e, realm) => {
    e.stopPropagation();
    haptics.tap?.();
    soundEngine.playTap?.();
    const key = realm.moduleKey || realm.postId;
    if (pinnedKeys.has(key)) {
      await db.profileWidgets.where('moduleKey').equals(key).delete();
      setPinnedKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    } else {
      await db.profileWidgets.add({
        moduleKey: key,
        titleFa: realm.titleFa,
        titleEn: realm.titleEn,
        descFa: realm.descFa,
        descEn: realm.descEn,
        icon: realm.icon || '⚡',
        imageUrl: realm.imageUrl,
        route: realm.route || '/',
        color: realm.color || '#8b5cf6',
        pinnedAt: new Date().toISOString()
      });
      setPinnedKeys(prev => new Set(prev).add(key));
    }
  };

  const handleCopyQuote = (q) => {
    const text = isRtl ? `«${q.textFa}»\n— ${q.authorFa}` : `"${q.textEn}"\n— ${q.authorEn}`;
    navigator.clipboard?.writeText(text);
    soundEngine.playCheckmark?.();
    haptics.tap?.();
    setCopiedQuoteId(q.id);
    setTimeout(() => setCopiedQuoteId(null), 2000);
  };

  // Filtered results
  const filteredUsers = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(u => 
      u.username.toLowerCase().includes(q) || 
      u.fullName.toLowerCase().includes(q) || 
      u.bio.toLowerCase().includes(q)
    );
  }, [query, users]);

  const filteredRealms = useMemo(() => {
    if (!query.trim()) return realmsList;
    const q = query.toLowerCase();
    return realmsList.filter(r => 
      (r.titleFa && r.titleFa.toLowerCase().includes(q)) ||
      (r.titleEn && r.titleEn.toLowerCase().includes(q)) ||
      (r.descFa && r.descFa.toLowerCase().includes(q)) ||
      (r.descEn && r.descEn.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q))
    );
  }, [query, realmsList]);

  const filteredQuotes = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return MASTER_QUOTES.filter(m => 
      (m.textFa && m.textFa.toLowerCase().includes(q)) ||
      (m.textEn && m.textEn.toLowerCase().includes(q)) ||
      (m.authorFa && m.authorFa.toLowerCase().includes(q)) ||
      (m.authorEn && m.authorEn.toLowerCase().includes(q)) ||
      (m.categoryFa && m.categoryFa.toLowerCase().includes(q))
    ).slice(0, 12);
  }, [query]);

  const totalResultsCount = filteredRealms.length + filteredUsers.length + filteredQuotes.length;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[var(--bg-card)] pb-10 select-none">
      
      {/* Top Interactive Search Bar */}
      <div className="sticky top-0 z-30 bg-[var(--bg-card)] border-b border-[var(--border)] p-3 backdrop-blur-xl">
        <div className="w-full flex items-center bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-3.5 py-2 transition-all focus-within:border-purple-500 shadow-xs">
          <Search size={18} className="text-[var(--text-secondary)] shrink-0 mr-2" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isRtl ? 'جستجو در کاربران، بخش‌ها، بازی‌ها و حکمت‌ها...' : 'Search users, realms, games, and wisdom...'} 
            className="bg-transparent border-none outline-none w-full text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]" 
            dir={isRtl ? 'rtl' : 'ltr'}
            autoFocus={false}
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        {query.trim() && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
            >
              {isRtl ? `همه (${totalResultsCount})` : `All (${totalResultsCount})`}
            </button>
            <button
              onClick={() => setActiveFilter('realms')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === 'realms'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
            >
              {isRtl ? `بخش‌ها (${filteredRealms.length})` : `Realms (${filteredRealms.length})`}
            </button>
            <button
              onClick={() => setActiveFilter('users')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === 'users'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
            >
              {isRtl ? `کاربران (${filteredUsers.length})` : `Users (${filteredUsers.length})`}
            </button>
            <button
              onClick={() => setActiveFilter('quotes')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === 'quotes'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
            >
              {isRtl ? `متن‌ها و خرد (${filteredQuotes.length})` : `Wisdom (${filteredQuotes.length})`}
            </button>
          </div>
        )}
      </div>

      {/* SEARCH RESULTS VIEW */}
      {query.trim() ? (
        <div className="flex flex-col p-3 space-y-6">
          
          {/* 1. REALMS / MODULES RESULTS */}
          {(activeFilter === 'all' || activeFilter === 'realms') && filteredRealms.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
                  {isRtl ? 'بخش‌ها و ابزارک‌های مرتبط' : 'Matching Realms & Tools'}
                </span>
                <span className="text-[11px] text-purple-500 font-bold font-mono">
                  {filteredRealms.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredRealms.map((realm) => (
                  <div
                    key={realm.id || realm.postId}
                    onClick={() => realm.route && navigate(realm.route)}
                    className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-purple-500/60 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-xs active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0 border border-white/10"
                        style={{ backgroundColor: `${realm.color || '#8b5cf6'}30` }}
                      >
                        {realm.icon || '⚡'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-xs sm:text-sm text-[var(--text-primary)] truncate">
                          {isRtl ? realm.titleFa : realm.titleEn}
                        </h4>
                        <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                          {isRtl ? realm.descFa : realm.descEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleTogglePin(e, realm)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                          pinnedKeys.has(realm.moduleKey || realm.postId)
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
                            : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-purple-500'
                        }`}
                        title={isRtl ? 'افزودن به پروفایل' : 'Pin to Profile'}
                      >
                        {pinnedKeys.has(realm.moduleKey || realm.postId) ? <CheckCircle2 size={16} /> : <PlusCircle size={16} />}
                      </button>
                      <button
                        onClick={() => realm.route && navigate(realm.route)}
                        className="p-2 rounded-xl bg-purple-600 text-white shadow-xs active:scale-95 transition-transform"
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. USERS RESULTS */}
          {(activeFilter === 'all' || activeFilter === 'users') && filteredUsers.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
                  {isRtl ? 'کاربران و همراهان' : 'Users & Creators'}
                </span>
                <span className="text-[11px] text-purple-500 font-bold font-mono">
                  {filteredUsers.length}
                </span>
              </div>

              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-[var(--border)] shrink-0">
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">{user.fullName}</span>
                          <span className="text-xs text-[var(--text-secondary)] font-mono">@{user.username}</span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                          {user.bio}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => navigate('/messages')}
                        className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-purple-500 transition-colors"
                        title={isRtl ? 'ارسال پیام' : 'Direct message'}
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleFollow(user.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                          user.isFollowing
                            ? 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)]'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs'
                        }`}
                      >
                        {user.isFollowing ? (isRtl ? 'دنبال شده' : 'Following') : (isRtl ? 'دنبال کردن' : 'Follow')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CONTENT & QUOTES RESULTS */}
          {(activeFilter === 'all' || activeFilter === 'quotes') && filteredQuotes.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
                  {isRtl ? 'جستجو در متن حکمت‌ها و آموزه‌ها' : 'Matching Wisdom & Content'}
                </span>
                <span className="text-[11px] text-purple-500 font-bold font-mono">
                  {filteredQuotes.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {filteredQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-lg mt-0.5">💡</span>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-relaxed italic">
                          «{isRtl ? q.textFa : q.textEn}»
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[11px] font-black text-purple-600 dark:text-purple-400">
                            — {isRtl ? q.authorFa : q.authorEn}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)]">
                            {isRtl ? q.categoryFa : q.categoryEn}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyQuote(q)}
                      className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-purple-500 transition-colors shrink-0 shadow-xs"
                      title={isRtl ? 'کپی متن' : 'Copy'}
                    >
                      {copiedQuoteId === q.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {totalResultsCount === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-4xl mb-3">🔍</span>
              <h4 className="font-black text-sm text-[var(--text-primary)] mb-1">
                {isRtl ? 'نتیجه‌ای یافت نشد' : 'No results found'}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
                {isRtl ? 'عبارت دیگری مانند «بازی»، «شطرنج»، «سارا»، «ذهن» یا «مولانا» را امتحان کنید.' : 'Try searching for "games", "chess", "mind", or user handles.'}
              </p>
            </div>
          )}

        </div>
      ) : (
        /* DEFAULT EXPLORE VIEW (Suggested Profiles + Instagram Masonry Grid) */
        <div className="flex flex-col space-y-4 pt-1">
          
          {/* Suggested Creators Carousel */}
          <div className="flex flex-col border-b border-[var(--border)] pb-4 pt-1">
            <div className="px-3.5 mb-2.5 flex items-center justify-between">
              <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
                {isRtl ? 'کاربران پیشنهادی' : 'Suggested Profiles'}
              </span>
              <button onClick={() => setQuery('user')} className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                {isRtl ? 'مشاهده همه' : 'See all'}
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar px-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="w-36 shrink-0 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex flex-col items-center text-center shadow-xs"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/30 p-0.5 mb-2">
                    <SafeImage src={user.avatar} alt={user.username} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <span className="font-black text-xs text-[var(--text-primary)] truncate w-full">{user.fullName}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] truncate w-full font-mono mb-2">@{user.username}</span>

                  <button
                    onClick={() => handleToggleFollow(user.id)}
                    className={`w-full py-1.5 rounded-xl text-[11px] font-black transition-all active:scale-95 ${
                      user.isFollowing
                        ? 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)]'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xs'
                    }`}
                  >
                    {user.isFollowing ? (isRtl ? 'دنبال شده' : 'Following') : (isRtl ? 'دنبال کردن' : 'Follow')}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Categories Bar */}
          <div className="px-3 flex gap-2 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => navigate('/stroll')}
              className="px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-purple-500 shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <span>🚶‍♂️</span>
              <span>{isRtl ? 'راهروهای فکری' : 'Realms'}</span>
            </button>
            <button 
              onClick={() => navigate('/games')}
              className="px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-purple-500 shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <span>🎮</span>
              <span>{isRtl ? 'بازی‌ها و تفریحات' : 'Games'}</span>
            </button>
            <button 
              onClick={() => navigate('/ai-mentor')}
              className="px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-purple-500 shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles size={13} className="text-pink-500" />
              <span>{isRtl ? 'مربی هوشمند' : 'AI Mentor'}</span>
            </button>
            <button 
              onClick={() => navigate('/wealth')}
              className="px-3.5 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-purple-500 shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <span>💰</span>
              <span>{isRtl ? 'ثروت و سرمایه' : 'Wealth'}</span>
            </button>
          </div>

          {/* Instagram Staggered Masonry Grid */}
          <div className="grid grid-cols-3 gap-0.5 auto-rows-[120px] sm:auto-rows-[160px]">
            {EXPLORE_GRID_ITEMS.map((item) => (
              <div 
                key={item.id} 
                onClick={() => navigate(item.route)}
                className={`relative bg-[var(--bg-secondary)] cursor-pointer group overflow-hidden ${item.span}`}
              >
                <SafeImage 
                  src={item.url} 
                  alt={item.title} 
                  fallbackText={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  loading="lazy"
                />
                
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                {/* Bottom title overlay */}
                <div className="absolute inset-x-0 bottom-0 p-2 text-white flex items-center justify-between">
                  <span className="text-[11px] font-black drop-shadow-md truncate">{item.title}</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold opacity-85">
                    <Heart size={10} className="fill-white" />
                    <span>{item.likes}</span>
                  </div>
                </div>

                {/* Hover direct enter */}
                <div className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ArrowUpRight size={24} className="text-white drop-shadow-lg" />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
