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

      {/* Non-intrusive Docked Chat Console (Does NOT cover the board) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed bottom-2 left-0 right-0 z-50 flex justify-center px-2 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 80, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md h-[210px] sm:h-[240px] rounded-3xl bg-slate-900/95 border-2 border-cyan-500/60 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col overflow-hidden text-start pointer-events-auto"
            >
              {/* Header */}
              <div className="px-3 py-2 border-b border-white/10 bg-black/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                    <MessageSquare size={13} />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-white flex items-center gap-1.5">
                      <span>{isRtl ? `چت زنده: ${gameTitle}` : `Live Chat: ${gameTitle}`}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyLink}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border flex items-center gap-1 transition-all ${
                      copied ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    {copied ? <Check size={10} /> : <Copy size={10} />}
                    <span>{copied ? (isRtl ? 'کپی شد' : 'Copied') : (isRtl ? 'کپی لینک' : 'Link')}</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                    title={isRtl ? 'بستن چت' : 'Close'}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 text-xs no-scrollbar">
                {messages.map((m, idx) => {
                  const isMe = m.sender === myRoleName || m.sender === 'شما' || m.sender === 'me' || m.isMe;
                  const isSystem = m.sender === 'system';

                  if (isSystem) {
                    return (
                      <div key={idx} className="text-center my-0.5">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[9px] text-cyan-300 font-bold">
                          📢 {m.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[8px] text-slate-400 font-mono px-1">
                        {isMe ? (isRtl ? 'شما' : 'You') : m.sender}
                      </span>
                      <div
                        className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-[11px] ${
                          isMe
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs'
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
              <div className="px-2 py-1 bg-black/40 border-t border-white/5 flex gap-1 overflow-x-auto no-scrollbar">
                {QUICK_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleSendEmoji(emoji)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/15 active:scale-90 text-xs transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} className="p-1.5 bg-black/70 border-t border-white/10 flex gap-1.5">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={isRtl ? 'پیام یا کل‌کل...' : 'Type message...'}
                  className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-white/10 text-xs text-white outline-none focus:border-cyan-400 placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-white shadow-md transition-all active:scale-95 text-xs font-bold flex items-center justify-center"
                >
                  <Send size={13} className={isRtl ? 'rotate-180' : ''} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
