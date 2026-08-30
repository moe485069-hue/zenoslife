import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Copy, Check, Share2, Sparkles, Smile } from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

const QUICK_EMOJIS = ['🔥', '👏', '👑', '🎲', '🎯', '😅', '🚀', '💀', '✌️', '❤️'];

export default function InGameChatDrawer({
  isOpen,
  onClose,
  onToggle,
  roomCode,
  gameTitle,
  messages = [],
  onSendMessage,
  myRoleName = 'شما',
  isRtl = true
}) {
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

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

  const handleSendEmoji = (emoji) => {
    onSendMessage?.(emoji);
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  return (
    <>
      {/* Floating Chat Trigger Button for Online Mode */}
      <div className="fixed bottom-20 left-4 z-40">
        <button
          onClick={onToggle}
          className="p-3.5 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border-2 border-cyan-300 hover:scale-110 active:scale-95 transition-all flex items-center justify-center relative"
          title={isRtl ? 'چت آنلاین درون بازی' : 'In-game Chat'}
        >
          <MessageSquare size={20} />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-mono font-black text-[10px] flex items-center justify-center border border-white">
              {messages.length}
            </span>
          )}
        </button>
      </div>

      {/* Chat Modal / Sliding Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-md h-[70vh] sm:h-[500px] rounded-t-3xl sm:rounded-3xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden text-start"
            >
              {/* Header */}
              <div className="p-3.5 border-b border-white/10 bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{isRtl ? `چت آنلاین ${gameTitle}` : `Online Chat: ${gameTitle}`}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </h3>
                    <span className="text-[10px] text-cyan-300 font-mono">اتاق: {roomCode}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyLink}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 transition-all ${
                      copied ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? (isRtl ? 'کپی شد' : 'Copied') : (isRtl ? 'لینک اتاق' : 'Link')}</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs no-scrollbar">
                {messages.map((m, idx) => {
                  const isMe = m.sender === myRoleName || m.sender === 'شما' || m.sender === 'me';
                  const isSystem = m.sender === 'system';

                  if (isSystem) {
                    return (
                      <div key={idx} className="text-center my-1.5">
                        <span className="px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-[10px] text-cyan-300 font-bold">
                          📢 {m.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] text-slate-400 font-mono px-1 mb-0.5">
                        {isMe ? (isRtl ? 'شما' : 'You') : m.sender}
                      </span>
                      <div
                        className={`max-w-[80%] px-3.5 py-2 rounded-2xl ${
                          isMe
                            ? 'bg-cyan-600 text-white rounded-br-xs'
                            : 'bg-slate-800 text-slate-100 border border-white/10 rounded-bl-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Emojis Bar */}
              <div className="px-3 py-1.5 bg-black/40 border-t border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
                {QUICK_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleSendEmoji(emoji)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 text-sm transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} className="p-3 bg-black/60 border-t border-white/10 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={isRtl ? 'پیام برای حریف آنلاین...' : 'Type message...'}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-white/10 text-xs text-white outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white shadow-md transition-all active:scale-95"
                >
                  <Send size={15} className={isRtl ? 'rotate-180' : ''} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
