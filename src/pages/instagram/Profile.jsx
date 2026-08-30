import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../../store/appStore';
import { db } from '../../db/database';
import { PRESET_AVATARS, PRESET_PROFILES } from '../../data/avatarsData';
import { 
  Grid, LayoutTemplate, Bookmark, Trash2, ArrowUpRight, X, 
  Edit3, Camera, Check, Sparkles, User, AtSign, AlignLeft, RefreshCw 
} from 'lucide-react';
import haptics from '../../utils/haptics';
import soundEngine from '../../utils/audio';
import SafeImage from '../../components/ui/SafeImage';

const DUMMY_GRID_POSTS = [
  'https://images.unsplash.com/photo-1542314831-c53cd4b85aca?w=400&q=80',
  'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80',
];

export default function Profile() {
  const navigate = useNavigate();
  const { language, userProfile, setUserProfile } = useAppStore();
  const isRtl = language === 'fa';
  
  const [activeTab, setActiveTab] = useState('widgets'); // Default to widgets/pinned tab
  const [pinnedWidgets, setPinnedWidgets] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null); // Detail modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fileInputRef = useRef(null);

  // Edit form state
  const [editFullName, setEditFullName] = useState(userProfile.fullName || 'مدیر ارشد سیستم');
  const [editUsername, setEditUsername] = useState(userProfile.username || 'admin_user');
  const [editBio, setEditBio] = useState(userProfile.bio || '');
  const [editAvatar, setEditAvatar] = useState(userProfile.avatar || 'https://i.pravatar.cc/150?img=60');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showAvatarGallery, setShowAvatarGallery] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(isRtl ? 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد.' : 'Image size should be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditAvatar(event.target.result);
        haptics.tap?.();
      }
    };
    reader.readAsDataURL(file);
  };

  const loadPinnedWidgets = async () => {
    try {
      const items = await db.profileWidgets.reverse().toArray();
      setPinnedWidgets(items);
    } catch (e) {
      console.error('Failed to load profile widgets:', e);
    }
  };

  useEffect(() => {
    loadPinnedWidgets();
  }, []);

  const handleTabChange = (tab) => {
    haptics.tap?.();
    soundEngine.playTap?.();
    setActiveTab(tab);
  };

  const handleOpenDetail = (widget) => {
    haptics.tap?.();
    soundEngine.playTap?.();
    setSelectedWidget(widget);
  };

  const handleRemoveWidget = async (id) => {
    haptics.tap?.();
    try {
      await db.profileWidgets.delete(id);
      setSelectedWidget(null);
      await loadPinnedWidgets();
    } catch (err) {
      console.error('Failed to remove widget:', err);
    }
  };

  const handleEnterFromModal = (route) => {
    haptics.tap?.();
    if (route) {
      navigate(route);
    }
  };

  const handleOpenEdit = () => {
    haptics.tap?.();
    soundEngine.playTap?.();
    setEditFullName(userProfile.fullName || '');
    setEditUsername(userProfile.username || '');
    setEditBio(userProfile.bio || '');
    setEditAvatar(userProfile.avatar || '');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e?.preventDefault();
    haptics.tap?.();
    soundEngine.playLevelUp?.();
    
    setUserProfile({
      fullName: editFullName.trim() || 'کاربر سیستم',
      username: editUsername.trim().replace(/^@/, '') || 'user',
      bio: editBio.trim(),
      avatar: editAvatar
    });

    setIsEditModalOpen(false);
  };

  const handleApplyPreset = (preset) => {
    haptics.tap?.();
    soundEngine.playTap?.();
    setEditFullName(preset.fullName);
    setEditUsername(preset.username);
    setEditBio(preset.bio);
    setEditAvatar(preset.avatar);
  };

  return (
    <div className="flex flex-col w-full h-full pb-6 bg-[var(--bg-card)] select-none">
      
      {/* Profile Info Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          {/* Avatar with Stories gradient ring and edit shortcut */}
          <div 
            onClick={handleOpenEdit}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 shrink-0 cursor-pointer relative group"
          >
            <div className="w-full h-full rounded-full border-2 border-[var(--bg-card)] overflow-hidden">
              <SafeImage src={userProfile.avatar || 'https://i.pravatar.cc/150?img=60'} alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera size={20} />
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex-1 flex justify-center gap-4 sm:gap-8 ml-4">
            <div className="flex flex-col items-center">
              <span className="font-black text-lg text-[var(--text-primary)]">{pinnedWidgets.length}</span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">{isRtl ? 'بخش‌های من' : 'My Realms'}</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer">
              <span className="font-black text-lg text-[var(--text-primary)]">1.2K</span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">{isRtl ? 'دنبال‌کننده' : 'Followers'}</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer">
              <span className="font-black text-lg text-[var(--text-primary)]">154</span>
              <span className="text-xs text-[var(--text-secondary)] font-medium">{isRtl ? 'دنبال‌شونده' : 'Following'}</span>
            </div>
          </div>
        </div>

        {/* Bio Area */}
        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h2 className="font-black text-sm text-[var(--text-primary)]">{userProfile.fullName || 'مدیر سیستم'}</h2>
            <span className="text-blue-500 text-xs font-bold">✔</span>
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-mono block">@{userProfile.username || 'admin_user'}</span>
          <div className="text-xs sm:text-sm text-[var(--text-primary)] whitespace-pre-line mt-1.5 leading-relaxed">
            {userProfile.bio || '✨ فرمانروایی بر ذهن و عادات فردی'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button 
            onClick={handleOpenEdit}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--border)] text-[var(--text-primary)] font-bold py-2 rounded-xl text-xs border border-[var(--border)] transition-transform active:scale-95 shadow-xs"
          >
            <Edit3 size={13} />
            <span>{isRtl ? 'ویرایش پروفایل' : 'Edit Profile'}</span>
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black py-2 rounded-xl text-xs shadow-md active:scale-95 transition-all"
          >
            {isRtl ? 'کشف و افزودن بخش‌ها' : 'Discover Realms'}
          </button>
        </div>
      </div>

      {/* Highlights Circles */}
      <div className="w-full px-4 py-3 flex gap-4 overflow-x-auto no-scrollbar border-b border-[var(--border)]">
        <div onClick={() => navigate('/my-day')} className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
          <div className="w-14 h-14 rounded-full border border-[var(--border)] flex items-center justify-center bg-[var(--bg-secondary)] text-xl shadow-xs">
            ⚡
          </div>
          <span className="text-[10px] font-bold text-[var(--text-primary)]">{isRtl ? 'امروز من' : 'My Day'}</span>
        </div>
        <div onClick={() => navigate('/stroll')} className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
          <div className="w-14 h-14 rounded-full border border-[var(--border)] flex items-center justify-center bg-[var(--bg-secondary)] text-xl shadow-xs">
            🚶‍♂️
          </div>
          <span className="text-[10px] font-bold text-[var(--text-primary)]">{isRtl ? 'راهروها' : 'Realms'}</span>
        </div>
        <div onClick={() => navigate('/games')} className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
          <div className="w-14 h-14 rounded-full border border-[var(--border)] flex items-center justify-center bg-[var(--bg-secondary)] text-xl shadow-xs">
            🎮
          </div>
          <span className="text-[10px] font-bold text-[var(--text-primary)]">{isRtl ? 'بازی‌ها' : 'Games'}</span>
        </div>
        <div onClick={() => navigate('/ai-mentor')} className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
          <div className="w-14 h-14 rounded-full border border-[var(--border)] flex items-center justify-center bg-[var(--bg-secondary)] text-xl shadow-xs">
            🤖
          </div>
          <span className="text-[10px] font-bold text-[var(--text-primary)]">{isRtl ? 'منتور' : 'AI Mentor'}</span>
        </div>
      </div>

      {/* 3 Tabs Header */}
      <div className="flex w-full border-b border-[var(--border)]">
        <button 
          onClick={() => handleTabChange('widgets')}
          className={`flex-1 flex justify-center py-3 border-b-2 transition-colors ${activeTab === 'widgets' ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-bold' : 'border-transparent text-[var(--text-secondary)]'}`}
          title={isRtl ? 'بخش‌های افزوده شده به پروفایل' : 'Added Realms'}
        >
          <LayoutTemplate size={22} />
        </button>
        <button 
          onClick={() => handleTabChange('posts')}
          className={`flex-1 flex justify-center py-3 border-b-2 transition-colors ${activeTab === 'posts' ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-bold' : 'border-transparent text-[var(--text-secondary)]'}`}
          title={isRtl ? 'گالری پست‌ها' : 'Posts'}
        >
          <Grid size={22} />
        </button>
        <button 
          onClick={() => handleTabChange('saved')}
          className={`flex-1 flex justify-center py-3 border-b-2 transition-colors ${activeTab === 'saved' ? 'border-[var(--text-primary)] text-[var(--text-primary)] font-bold' : 'border-transparent text-[var(--text-secondary)]'}`}
          title={isRtl ? 'ذخیره‌شده‌ها' : 'Saved'}
        >
          <Bookmark size={22} />
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 min-h-[350px]">
        
        {/* Pinned Widgets (3-Column Instagram-like Grid with Click to Expand) */}
        {activeTab === 'widgets' && (
          <div className="w-full">
            {pinnedWidgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-3xl mb-3">
                  📌
                </div>
                <h4 className="font-black text-sm text-[var(--text-primary)] mb-1">
                  {isRtl ? 'هنوز بخشی را به پروفایلتان اضافه نکرده‌اید' : 'No realms added yet'}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs mb-5 leading-relaxed">
                  {isRtl ? 'وارد صفحه خانه شوید و روی دکمه «افزودن به پروفایل» هر بخش کلیک کنید تا مانند اینستاگرام در اینجا چیده شوند.' : 'Go to Home feed and tap "Add to Profile" on any post.'}
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white rounded-xl text-xs font-black shadow-md active:scale-95 transition-all"
                >
                  {isRtl ? 'مشاهده و افزودن از صفحه خانه' : 'Explore Home Feed'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                {pinnedWidgets.map(widget => (
                  <div 
                    key={widget.id} 
                    onClick={() => handleOpenDetail(widget)}
                    className="aspect-square relative bg-[var(--bg-secondary)] cursor-pointer group overflow-hidden border border-black/10"
                  >
                    {/* Background Image / Texture with SafeImage */}
                    <SafeImage 
                      src={widget.imageUrl || 'https://images.unsplash.com/photo-1542314831-c53cd4b85aca?w=400&q=80'} 
                      alt={widget.titleFa}
                      icon={widget.icon || '⚡'}
                      fallbackText={widget.titleFa}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Dark gradient shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                    {/* Top Icon Badge */}
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/50 backdrop-blur-md flex items-center justify-center text-xs shadow-xs">
                      {widget.icon || '⚡'}
                    </div>

                    {/* Bottom Title */}
                    <div className="absolute inset-x-0 bottom-0 p-1.5 text-center">
                      <span className="text-[10px] sm:text-xs font-black text-white truncate block drop-shadow-md">
                        {isRtl ? widget.titleFa : widget.titleEn}
                      </span>
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ArrowUpRight size={22} className="text-white drop-shadow-md" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Posts Tab (3 Column Grid) */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-3 gap-0.5 mt-0.5">
            {DUMMY_GRID_POSTS.map((url, idx) => (
              <div key={idx} className="aspect-square bg-[var(--bg-secondary)] relative cursor-pointer group">
                <SafeImage src={url} alt={`Post ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold text-xs">❤️ 120</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div className="flex items-center justify-center h-full pt-16">
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-[var(--text-primary)] flex items-center justify-center mb-4">
                <Bookmark size={32} className="text-[var(--text-primary)]" />
              </div>
              <h3 className="font-bold text-base mb-1">{isRtl ? 'ذخیره‌شده‌ها' : 'Saved Posts'}</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-[220px] leading-relaxed">
                {isRtl ? 'پست‌های ذخیره‌شده خصوصی هستند و فقط توسط شما مشاهده می‌شوند.' : 'Only you can see posts you have saved.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Modal for Pinned Realm */}
      <AnimatePresence>
        {selectedWidget && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
            onClick={() => setSelectedWidget(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border)] shadow-2xl flex flex-col"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Modal Cover Image */}
              <div className="w-full h-56 relative overflow-hidden">
                <SafeImage 
                  src={selectedWidget.imageUrl || 'https://images.unsplash.com/photo-1542314831-c53cd4b85aca?w=800&q=80'} 
                  alt={selectedWidget.titleFa}
                  icon={selectedWidget.icon || '⚡'}
                  fallbackText={selectedWidget.titleFa}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedWidget(null)}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X size={18} />
                </button>

                {/* Cover Title Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-md border border-white/20 shadow-lg"
                    style={{ backgroundColor: `${selectedWidget.color || '#8b5cf6'}90` }}
                  >
                    {selectedWidget.icon || '⚡'}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white drop-shadow-md">
                      {isRtl ? selectedWidget.titleFa : selectedWidget.titleEn}
                    </h3>
                    <span className="text-xs text-gray-300 drop-shadow-sm font-medium">
                      {isRtl ? 'پین‌شده در پروفایل شما' : 'Pinned Realm in your Profile'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Body & Description */}
              <div className="p-5 flex flex-col gap-4">
                <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                  {isRtl 
                    ? (selectedWidget.descFa || 'این بخش مستقیماً از فید به پروفایل شما افزوده شده است و همیشه با یک کلیک در دسترس شماست.')
                    : (selectedWidget.descEn || 'This realm was pinned from the home feed and is always accessible here.')}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2.5 pt-2">
                  <button 
                    onClick={() => handleEnterFromModal(selectedWidget.route)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white rounded-xl text-xs font-black shadow-lg hover:opacity-95 active:scale-95 transition-all"
                  >
                    <span>{isRtl ? 'ورود مستقیم به بخش' : 'Enter Realm Now'}</span>
                    <ArrowUpRight size={16} />
                  </button>

                  <button 
                    onClick={() => handleRemoveWidget(selectedWidget.id)}
                    className="p-3 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors active:scale-95 shrink-0"
                    title={isRtl ? 'حذف از پروفایل' : 'Remove from Profile'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md transition-opacity p-0 sm:p-4"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[var(--bg-card)] rounded-t-[2.5rem] sm:rounded-3xl border border-[var(--border)] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold px-2 py-1"
                >
                  {isRtl ? 'انصراف' : 'Cancel'}
                </button>
                <h3 className="font-black text-base text-[var(--text-primary)]">
                  {isRtl ? 'ویرایش پروفایل' : 'Edit Profile'}
                </h3>
                <button 
                  onClick={handleSaveProfile}
                  className="text-xs font-black text-purple-600 dark:text-purple-400 hover:opacity-80 px-2 py-1"
                >
                  {isRtl ? 'ذخیره' : 'Done'}
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* Avatar Change Section */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-600 to-pink-500 mb-2 relative">
                    <img src={editAvatar} alt="Edit avatar" className="w-full h-full object-cover rounded-full border-2 border-[var(--bg-card)]" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAvatarGallery(!showAvatarGallery)}
                    className="text-xs font-black text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 mt-1"
                  >
                    <Camera size={14} />
                    <span>{showAvatarGallery ? (isRtl ? 'بستن گالری آواتارها' : 'Close Gallery') : (isRtl ? 'انتخاب آواتار از گالری متنوع' : 'Choose Avatar')}</span>
                  </button>
                </div>

                {/* Diverse Avatar Gallery Picker */}
                {showAvatarGallery && (
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] space-y-3">
                    <span className="text-xs font-black text-[var(--text-secondary)] block">
                      {isRtl ? 'آواتارهای آماده و متنوع:' : 'Preset Diverse Avatars:'}
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                      {PRESET_AVATARS.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setEditAvatar(item.url);
                            haptics.tap?.();
                          }}
                          className={`aspect-square rounded-full p-0.5 border-2 cursor-pointer transition-all hover:scale-105 ${
                            editAvatar === item.url ? 'border-purple-600 ring-2 ring-purple-500/40' : 'border-transparent'
                          }`}
                        >
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover rounded-full" />
                        </div>
                      ))}
                    </div>

                    {/* Custom URL Input & Local File Picker */}
                    <div className="pt-2 border-t border-[var(--border)] space-y-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          value={customAvatarUrl}
                          onChange={(e) => setCustomAvatarUrl(e.target.value)}
                          placeholder={isRtl ? 'یا وارد کردن لینک عکس (URL)...' : 'Or enter custom image URL...'}
                          className="flex-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customAvatarUrl.trim()) {
                              setEditAvatar(customAvatarUrl.trim());
                              setCustomAvatarUrl('');
                              haptics.tap?.();
                            }
                          }}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold shrink-0"
                        >
                          {isRtl ? 'اعمال' : 'Apply'}
                        </button>
                      </div>

                      {/* Hidden File Input */}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />

                      {/* Upload from Computer / Gallery Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 bg-[var(--bg-card)] hover:bg-[var(--border)] border border-dashed border-purple-500/50 rounded-xl text-xs font-black text-purple-600 dark:text-purple-400 flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-xs"
                      >
                        <Camera size={15} />
                        <span>{isRtl ? '📁 انتخاب و آپلود عکس از کامپیوتر یا گالری' : '📁 Upload photo from Device / PC'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Preset Persona Quick Fill */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[var(--text-secondary)]">
                      {isRtl ? 'قالب‌های شخصیتی آماده:' : 'Ready Persona Templates:'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_PROFILES.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-start hover:border-purple-500 transition-all text-xs"
                      >
                        <span className="font-bold text-[var(--text-primary)] block truncate">{p.fullName}</span>
                        <span className="text-[10px] text-[var(--text-secondary)] font-mono truncate block">@{p.username}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[var(--text-secondary)] flex items-center gap-1.5">
                    <User size={14} className="text-purple-500" />
                    <span>{isRtl ? 'نام و نام خانوادگی' : 'Full Name'}</span>
                  </label>
                  <input 
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder={isRtl ? 'نام کامل خود را وارد کنید...' : 'Enter your full name...'}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[var(--text-secondary)] flex items-center gap-1.5">
                    <AtSign size={14} className="text-purple-500" />
                    <span>{isRtl ? 'نام کاربری (آیدی اینستا)' : 'Username (@handle)'}</span>
                  </label>
                  <input 
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder={isRtl ? 'مثلاً: master_mind' : 'e.g. master_mind'}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] outline-none focus:border-purple-500 font-mono"
                    dir="ltr"
                  />
                </div>

                {/* Bio Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-[var(--text-secondary)] flex items-center gap-1.5">
                    <AlignLeft size={14} className="text-purple-500" />
                    <span>{isRtl ? 'بیوگرافی (توضیحات پروفایل)' : 'Bio'}</span>
                  </label>
                  <textarea 
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder={isRtl ? 'درباره اهداف، مسیر و هویت خود بنویسید...' : 'Write about yourself...'}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-3.5 text-xs sm:text-sm text-[var(--text-primary)] outline-none focus:border-purple-500 leading-relaxed font-medium"
                  />
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>{isRtl ? 'ذخیره و ثبت تغییرات' : 'Save Changes'}</span>
                </button>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
