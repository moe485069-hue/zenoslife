import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Send, Image, Mic, Heart, Phone, Video, Smile, CheckCheck } from 'lucide-react';
import useAppStore from '../../store/appStore';
import SafeImage from '../ui/SafeImage';
import haptics from '../../utils/haptics';
import soundEngine from '../../utils/audio';

const INITIAL_MESSAGES = {
  1: [
    { id: 1, sender: 'other', text: 'سلام دوست عزیز! تمرین تنفس ریتمیک امروز چطور پیش رفت؟ 🌿', time: '14:20' },
    { id: 2, sender: 'me', text: 'فوق‌العاده بود! ۱۰ دقیقه تمرکز کامل داشتم.', time: '14:22' },
    { id: 3, sender: 'other', text: 'سلام، عالی بود! 😍 حتماً فردا هم ادامه‌اش بده.', time: '14:25' }
  ],
  2: [
    { id: 1, sender: 'other', text: 'این ریلز درباره ماتریس آیزنهاور رو دیدی؟ خیلی کمک‌کننده است!', time: '11:05' },
    { id: 2, sender: 'other', text: 'Sent a reel by life_os_official 🎬', time: '11:06' }
  ],
  3: [
    { id: 1, sender: 'other', text: 'برای بازی شطرنج کیهانی آماده‌ای؟ ♟️', time: 'دیروز' },
    { id: 2, sender: 'me', text: 'حتماً! ساعت ۶ عصر بازی کنیم.', time: 'دیروز' },
    { id: 3, sender: 'other', text: 'فردا می‌بینمت.', time: 'دیروز' }
  ],
  4: [
    { id: 1, sender: 'other', text: 'طرح جدید برای کپسول زمان خیلی جذاب شده ✨', time: '۲ روز پیش' },
    { id: 2, sender: 'other', text: 'Liked a message ❤️', time: '۲ روز پیش' }
  ],
  5: [
    { id: 1, sender: 'other', text: 'به سیستم عامل جامع زندگی (Life OS) خوش آمدید! 🎉', time: '۱ هفته پیش' },
    { id: 2, sender: 'other', text: 'برای شروع، کارهای روزمره خود را در صفحه «امروز من» ثبت کنید.', time: '۱ هفته پیش' },
    { id: 3, sender: 'other', text: 'Welcome to your new OS. 🚀', time: '۱ هفته پیش' }
  ]
};

const AUTO_REPLIES = [
  'عالیه! استمرار در این کار نتیجه شگفت‌انگیزی برات داره ✨',
  'کاملاً موافقم، منم این روش رو تست کردم و بازدهی‌ام دو برابر شد 🎯',
  'حتماً! فردا در موردش بیشتر صحبت می‌کنیم 🌿',
  'درود بر تو فرمانروای زندگی! 👑',
  'این نگرش فوق‌العاده‌ست؛ مسیر رشدت الهام‌بخشه 🌌'
];

export default function DirectChatModal({ chat, isOpen, onClose }) {
  const { language, userProfile } = useAppStore();
  const isRtl = language === 'fa';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chat?.id) {
      setMessages(INITIAL_MESSAGES[chat.id] || [
        { id: 1, sender: 'other', text: `سلام! چطور می‌تونم کمکت کنم؟ ✨`, time: 'هم‌اکنون' }
      ]);
    }
  }, [chat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString(isRtl ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };

    haptics.tap?.();
    soundEngine.playCheckmark?.();
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate other user typing and auto-replying
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyText = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'other',
            text: replyText,
            time: new Date().toLocaleTimeString(isRtl ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        soundEngine.playLevelUp?.();
        haptics.tap?.();
      }, 1500);
    }, 800);
  };

  const handleSendHeart = () => {
    setInputText('❤️');
  };

  if (!isOpen || !chat) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full h-full sm:max-w-md sm:h-[88vh] bg-[var(--bg-card)] sm:rounded-3xl border border-[var(--border)] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Chat Header */}
        <div className="p-3.5 border-b border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-[var(--bg-card)] text-[var(--text-primary)] transition-colors active:scale-90"
            >
              {isRtl ? <ArrowRight size={22} /> : <ArrowLeft size={22} />}
            </button>

            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--border)]">
                <SafeImage src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-secondary)]" />
            </div>

            <div>
              <h4 className="font-black text-xs sm:text-sm text-[var(--text-primary)] leading-tight">{chat.name}</h4>
              <span className="text-[10px] text-emerald-500 font-bold block">{isRtl ? 'آنلاین' : 'Active now'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[var(--text-secondary)]">
            <button className="p-1.5 hover:text-purple-500 transition-colors">
              <Phone size={19} />
            </button>
            <button className="p-1.5 hover:text-purple-500 transition-colors">
              <Video size={20} />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-primary)]">
          
          {/* User Profile Mini Banner in Chat */}
          <div className="flex flex-col items-center justify-center py-6 text-center border-b border-[var(--border)] mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500/40 p-0.5 mb-2">
              <SafeImage src={chat.avatar} alt={chat.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <h3 className="font-black text-sm text-[var(--text-primary)]">{chat.name}</h3>
            <span className="text-xs text-[var(--text-secondary)] font-mono">@{chat.username}</span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-1">
              {isRtl ? 'همراه سیستم عامل زندگی' : 'Life OS Citizen'}
            </span>
          </div>

          {/* Messages */}
          {messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div 
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isMe 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none' 
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 text-[9px] text-[var(--text-secondary)] font-mono">
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck size={12} className="text-purple-400" />}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] border border-[var(--border)] px-3.5 py-2 rounded-2xl w-16 text-xs text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 bg-[var(--bg-secondary)] border-t border-[var(--border)]">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[var(--bg-card)] border border-[var(--border)] rounded-full px-3.5 py-1.5 focus-within:border-purple-500 transition-colors shadow-xs">
              <button 
                type="button" 
                onClick={handleSendHeart}
                className="text-[var(--text-secondary)] hover:text-rose-500 mr-2 active:scale-110 transition-transform"
              >
                <Smile size={18} />
              </button>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isRtl ? 'پیام بنویسید...' : 'Message...'}
                className="bg-transparent border-none outline-none w-full text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
                dir={isRtl ? 'rtl' : 'ltr'}
              />
              <button 
                type="button" 
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] ml-1.5"
              >
                <Image size={18} />
              </button>
            </div>

            {inputText.trim() ? (
              <button 
                type="submit"
                className="p-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md active:scale-95 transition-transform shrink-0"
              >
                <Send size={16} />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => {
                  setInputText('❤️');
                }}
                className="p-2.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-rose-500 hover:scale-110 active:scale-90 transition-transform shrink-0"
              >
                <Heart size={18} className="fill-rose-500" />
              </button>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
