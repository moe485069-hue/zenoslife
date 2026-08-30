import React, { useState } from 'react';
import useAppStore from '../../store/appStore';
import StoryViewerModal from './StoryViewerModal';
import SafeImage from '../ui/SafeImage';
import { Plus } from 'lucide-react';
import haptics from '../../utils/haptics';
import soundEngine from '../../utils/audio';

const DUMMY_STORIES = [
  { 
    id: 1, 
    username: 'ali_reza', 
    avatar: 'https://i.pravatar.cc/150?img=11', 
    storyImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    quote: 'تمرکز روی یک هدف واحد در روز، معجزه می‌آفریند.',
    icon: '🎯',
    tag: 'بهره_وری',
    isViewed: false 
  },
  { 
    id: 2, 
    username: 'sara_hm', 
    avatar: 'https://i.pravatar.cc/150?img=5', 
    storyImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80',
    quote: 'آرامش، غیاب طوفان نیست؛ حضور آرام تو در دل طوفان است.',
    icon: '🌿',
    tag: 'ذهن_آگاهی',
    isViewed: false 
  },
  { 
    id: 3, 
    username: 'mohsen.k', 
    avatar: 'https://i.pravatar.cc/150?img=13', 
    storyImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    quote: 'شطرنج زندگی یعنی دیدن سه گام جلوتر در هر تصمیم.',
    icon: '♟️',
    tag: 'استراتژی',
    isViewed: false 
  },
  { 
    id: 4, 
    username: 'zahra_art', 
    avatar: 'https://i.pravatar.cc/150?img=9', 
    storyImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
    quote: 'نامه‌ای به آینده بنویس؛ شگفتی‌ها در راهند.',
    icon: '⏳',
    tag: 'کپسول_زمان',
    isViewed: true 
  },
  { 
    id: 5, 
    username: 'reza.tech', 
    avatar: 'https://i.pravatar.cc/150?img=15', 
    storyImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    quote: 'هوش مصنوعی ابزاریست برای اوج‌گیری خرد انسان.',
    icon: '🤖',
    tag: 'فناوری',
    isViewed: false 
  },
  { 
    id: 6, 
    username: 'nima_88', 
    avatar: 'https://i.pravatar.cc/150?img=8', 
    storyImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&q=80',
    quote: 'تو با تمام کیهان در پیوندی ناگسستنی هستی.',
    icon: '🌌',
    tag: 'یگانگی',
    isViewed: true 
  },
];

export default function StoryBar() {
  const { language, userProfile } = useAppStore();
  const isRtl = language === 'fa';

  const [stories, setStories] = useState(DUMMY_STORIES);
  const [activeStoryIdx, setActiveStoryIdx] = useState(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  const handleOpenStory = (index) => {
    haptics.tap?.();
    soundEngine.playTap?.();
    setActiveStoryIdx(index);
    setIsStoryModalOpen(true);
    
    // Mark story as viewed
    setStories(prev => prev.map((s, idx) => idx === index ? { ...s, isViewed: true } : s));
  };

  const handleOpenMyStory = () => {
    haptics.tap?.();
    soundEngine.playTap?.();
    const myStory = {
      id: 'my_story',
      username: userProfile?.username || 'admin_user',
      avatar: userProfile?.avatar || 'https://i.pravatar.cc/150?img=60',
      storyImage: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&q=80',
      quote: userProfile?.bio || 'در حال ساخت بهترین نسخه از خویشتن...',
      icon: '✨',
      tag: 'استمرار',
      isViewed: true
    };
    setActiveStoryIdx(0);
    setIsStoryModalOpen(true);
  };

  return (
    <>
      <div className="w-full border-b border-[var(--border)] bg-[var(--bg-card)] py-2.5 px-1 select-none">
        <div 
          className="flex gap-3.5 overflow-x-auto no-scrollbar px-2"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Your Story Button */}
          <div 
            onClick={handleOpenMyStory}
            className="flex flex-col items-center gap-1 shrink-0 relative cursor-pointer active:scale-95 transition-transform group"
          >
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-purple-500/50 p-0.5">
              <SafeImage 
                src={userProfile?.avatar || 'https://i.pravatar.cc/150?img=60'} 
                alt="My Story" 
                className="w-full h-full object-cover rounded-full" 
              />
            </div>
            <div className="absolute bottom-5 right-0 bg-blue-500 rounded-full border-2 border-[var(--bg-card)] text-white p-0.5 shadow-md">
              <Plus size={12} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-bold text-[var(--text-secondary)] truncate w-16 text-center">
              {isRtl ? 'استوری شما' : 'Your story'}
            </span>
          </div>

          {/* Other User Stories */}
          {stories.map((story, idx) => (
            <div 
              key={story.id} 
              onClick={() => handleOpenStory(idx)}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition-transform"
            >
              <div className={`w-16 h-16 rounded-full p-[2px] transition-all ${
                !story.isViewed 
                  ? 'bg-gradient-to-tr from-yellow-400 via-rose-500 to-fuchsia-600 shadow-sm' 
                  : 'bg-[var(--border)] opacity-75'
              }`}>
                <div className="w-full h-full rounded-full border-2 border-[var(--bg-card)] overflow-hidden">
                  <SafeImage 
                    src={story.avatar} 
                    alt={story.username} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
              <span className="text-[10px] font-medium text-[var(--text-primary)] truncate w-16 text-center">
                {story.username}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Fullscreen Viewer Modal */}
      <StoryViewerModal
        stories={stories}
        initialIndex={activeStoryIdx || 0}
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />
    </>
  );
}
