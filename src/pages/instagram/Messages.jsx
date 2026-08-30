import React, { useState } from 'react';
import useAppStore from '../../store/appStore';
import SafeImage from '../../components/ui/SafeImage';
import DirectChatModal from '../../components/instagram/DirectChatModal';
import { Search, Camera, Edit, Sparkles, MessageCircle } from 'lucide-react';
import haptics from '../../utils/haptics';
import soundEngine from '../../utils/audio';

const DUMMY_CHATS = [
  { id: 1, name: 'علیرضا راد', username: 'ali_reza', avatar: 'https://i.pravatar.cc/150?img=11', lastMessage: 'سلام، عالی بود! 😍 حتماً فردا هم ادامه‌اش بده.', time: '2h', isUnread: true },
  { id: 2, name: 'سارا حیدری', username: 'sara_hm', avatar: 'https://i.pravatar.cc/150?img=5', lastMessage: 'Sent a reel by life_os_official 🎬', time: '5h', isUnread: false },
  { id: 3, name: 'محسن کریمی', username: 'mohsen.k', avatar: 'https://i.pravatar.cc/150?img=13', lastMessage: 'فردا می‌بینمت.', time: '1d', isUnread: false },
  { id: 4, name: 'زهرا میرزایی', username: 'zahra_art', avatar: 'https://i.pravatar.cc/150?img=9', lastMessage: 'Liked a message ❤️', time: '2d', isUnread: false },
  { id: 5, name: 'پشتیبانی Life OS', username: 'lifeos_help', avatar: 'https://i.pravatar.cc/150?img=60', lastMessage: 'به سیستم عامل جامع زندگی خوش آمدید. 🚀', time: '1w', isUnread: false },
];

export default function Messages() {
  const { language, userProfile } = useAppStore();
  const isRtl = language === 'fa';

  const [chats, setChats] = useState(DUMMY_CHATS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('primary'); // 'primary' | 'requests'

  const filteredChats = chats.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenChat = (chat) => {
    haptics.tap?.();
    soundEngine.playTap?.();
    setActiveChat(chat);
    setIsChatOpen(true);
    // Mark as read
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, isUnread: false } : c));
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[var(--bg-card)] pb-16 select-none">
      
      {/* Search Bar */}
      <div className="px-4 py-2.5">
        <div className="w-full flex items-center bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-3.5 py-2 shadow-xs">
          <Search size={17} className="text-[var(--text-secondary)] mr-2 shrink-0" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'جستجو در پیام‌ها و نام‌ها...' : 'Search direct messages...'} 
            className="bg-transparent border-none outline-none w-full text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]" 
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>
      </div>

      {/* Messages / Requests Tabs */}
      <div className="px-4 py-2 flex items-center justify-between mb-1 border-b border-[var(--border)]">
        <div className="flex gap-6 font-black text-xs sm:text-sm">
          <button 
            onClick={() => setActiveTab('primary')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'primary' 
                ? 'border-[var(--text-primary)] text-[var(--text-primary)]' 
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            {isRtl ? 'اصلی' : 'Primary'}
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'requests' 
                ? 'border-[var(--text-primary)] text-[var(--text-primary)]' 
                : 'border-transparent text-[var(--text-secondary)]'
            }`}
          >
            {isRtl ? 'درخواست‌ها (۰)' : 'Requests (0)'}
          </button>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex flex-col px-3 py-1 space-y-1">
        {filteredChats.map(chat => (
          <div 
            key={chat.id} 
            onClick={() => handleOpenChat(chat)}
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-[var(--bg-secondary)] active:scale-[0.99] transition-all rounded-2xl border border-transparent hover:border-[var(--border)]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-13 h-13 rounded-full overflow-hidden shrink-0 border border-[var(--border)] relative">
                <SafeImage src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-xs sm:text-sm text-[var(--text-primary)] truncate ${chat.isUnread ? 'font-black' : 'font-bold'}`}>
                  {chat.name}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">
                  <span className={`truncate ${chat.isUnread ? 'font-black text-[var(--text-primary)]' : ''}`}>
                    {chat.lastMessage}
                  </span>
                  <span>·</span>
                  <span className="shrink-0 font-mono text-[10px]">{chat.time}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 mr-1">
              {chat.isUnread ? (
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-400/40 animate-pulse" />
              ) : (
                <Camera size={18} className="text-[var(--text-secondary)] opacity-60 hover:opacity-100" />
              )}
            </div>
          </div>
        ))}

        {filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle size={36} className="text-[var(--text-secondary)] opacity-40 mb-2" />
            <span className="text-xs text-[var(--text-secondary)]">
              {isRtl ? 'گفتگویی یافت نشد.' : 'No conversations found.'}
            </span>
          </div>
        )}
      </div>

      {/* Direct Conversation Modal */}
      <DirectChatModal 
        chat={activeChat}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

    </div>
  );
}
