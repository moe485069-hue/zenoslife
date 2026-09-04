import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Copy, Check, Smile, Sparkles } from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

const QUICK_EMOJIS = ['🔥', '👏', '👑', '🎲', '😅', '❤️'];
const QUICK_PHRASES = [
  'دستخوش! 👏',
  'شانس آوردی! 😅',
  'عجب حرکتی! 💥',
  'بازی خوبیه! 🎮',
  'ماشالله! 🚀',
  'دوباره بازی کنیم؟ 🎲'
];

export default function InGameChatDrawer({
  isOpen,
  onClose,
  onToggle,
  roomCode,
  gameTitle = 'تخته نرد',
  messages = [],
  onSendMessage,
  myRoleName = 'شما',
  isRtl = true
}) {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const [floatingToast, setFloatingToast] = useState(null);
  const messagesEndRef = useRef(null);
  const prevMessagesCount = useRef(messages.length);

  // Detect incoming new message for floating toast preview
  useEffect(() => {
    if (messages.length > prevMessagesCount.current) {
      const latestMsg = messages[messages.length - 1];
      const isMe = latestMsg.isMe || (latestMsg.sender && (latestMsg.sender.includes('شما') || latestMsg.sender.includes('You'))) || latestMsg.senderId === myRoleName;
      if (!isMe && !isOpen && latestMsg.text) {
        setFloatingToast(latestMsg);
        soundEngine.playTap?.();
        haptics.notification?.('success');
        const timer = setTimeout(() => setFloatingToast(null), 4500);
        return () => clearTimeout(timer);
      }
    }
    prevMessagesCount.current = messages.length;
  }, [messages, isOpen, myRoleName]);

  const shareableUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?room=${roomCode}&mode=online` : '';

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareableUrl);
    setCopied(true);
    soundEngine.playCheckmark?.();
    haptics.success?.();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage?.(inputText.trim());
    setInputText('');
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleSendQuick = (text) => {
    onSendMessage?.(text);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  return (
    <div className="w-full relative z-40" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Floating Toast Preview for Incoming Messages (Like Plato) */}
      <AnimatePresence>
        {floatingToast && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            onClick={onToggle}
            className="absolute -top-12 right-2 left-2 mx-auto max-w-sm px-3.5 py-1.5 rounded-2xl bg-slate-900/95 border border-cyan-400/60 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2 cursor-pointer z-50 pointer-events-auto"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-black text-cyan-300 block truncate leading-tight">
                  {floatingToast.sender || 'حریف'}:
                </span>
                <span className="text-xs font-bold text-white block truncate">
                  {floatingToast.text}
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold text-slate-400 shrink-0">
              {isRtl ? 'مشاهده 💬' : 'View 💬'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Integrated Plato Chat Capsule Strip */}
      <div className="mt-2.5 p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
        {/* Chat Input / View Trigger */}
        <button
          onClick={onToggle}
          type="button"
          className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-98 border border-white/10 text-start flex items-center justify-between text-slate-300 transition-all cursor-pointer min-w-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare size={14} className="text-amber-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-300 truncate">
              {messages.length > 0
                ? (messages[messages.length - 1]?.text?.slice(0, 24) || (isRtl ? 'پیامی بنویسید...' : 'Type a message...'))
                : (isRtl ? 'پیامی بنویسید...' : 'Type a message...')}
            </span>
          </div>
          {messages.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[9px] font-black font-mono shrink-0">
              {messages.length}
            </span>
          )}
        </button>

        {/* Quick Reaction Emojis (Instant 1-Tap Send) */}
        <div className="flex items-center gap-1 shrink-0">
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => handleSendQuick(emoji)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/5 hover:bg-white/15 active:scale-85 text-sm sm:text-base flex items-center justify-center transition-transform cursor-pointer"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Plato-Style Slide-Up Chat History & Composer Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4" onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md h-[400px] sm:h-[460px] rounded-3xl bg-slate-900/98 border-2 border-amber-500/40 shadow-2xl flex flex-col overflow-hidden text-start"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                    <MessageSquare size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{isRtl ? `چت زنده مسابقه ${gameTitle}` : `Live Chat: ${gameTitle}`}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyLink}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 transition-all ${
                      copied ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copied ? (isRtl ? 'کپی شد' : 'Copied') : (isRtl ? 'کپی اتاق' : 'Room')}</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                    title={isRtl ? 'بستن' : 'Close'}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs no-scrollbar bg-black/40">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-8 space-y-2">
                    <span className="text-3xl animate-bounce">💬</span>
                    <p className="text-xs font-bold text-slate-300">
                      {isRtl ? 'اولین نفری باشید که پیامی می‌نویسد!' : 'Start the conversation!'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {isRtl ? 'کری‌خوانی کنید یا از حریف تعریف کنید' : 'Cheer or challenge your opponent'}
                    </p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isMe = m.isMe || (m.sender && (m.sender.includes('شما') || m.sender.includes('You'))) || m.senderId === myRoleName;
                    const isSystem = m.sender === 'system';

                    if (isSystem) {
                      return (
                        <div key={idx} className="text-center my-1">
                          <span className="px-3 py-1 rounded-full bg-slate-800/90 border border-amber-400/40 text-[10px] text-amber-300 font-black shadow-sm inline-block">
                            📢 {m.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} my-0.5`}>
                        <span className={`text-[9px] font-bold px-1.5 mb-0.5 ${isMe ? 'text-amber-300' : 'text-cyan-300'}`}>
                          {isMe ? (isRtl ? 'شما' : 'You') : m.sender}
                        </span>
                        <div
                          className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs font-black shadow-md ${
                            isMe
                              ? 'rounded-br-xs bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 border border-amber-300'
                              : 'rounded-bl-xs bg-slate-800 text-white border border-white/15'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Phrases Row (Plato Style) */}
              <div className="px-3 py-2 bg-black/60 border-t border-white/10 flex gap-1.5 overflow-x-auto no-scrollbar">
                {QUICK_PHRASES.map((phrase, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendQuick(phrase)}
                    className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/15 active:scale-95 border border-white/10 text-[10px] font-bold text-amber-200 whitespace-nowrap transition-transform cursor-pointer"
                  >
                    {phrase}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} className="p-2.5 bg-slate-950 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={isRtl ? 'پیام یا کری‌خوانی خود را بنویسید...' : 'Type your message...'}
                  className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-800 border border-white/15 text-xs text-white font-bold outline-none focus:border-amber-400 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:opacity-30 text-slate-950 shadow-md transition-all active:scale-95 text-xs font-black flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{isRtl ? 'ارسال' : 'Send'}</span>
                  <Send size={13} className={isRtl ? 'rotate-180' : ''} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
