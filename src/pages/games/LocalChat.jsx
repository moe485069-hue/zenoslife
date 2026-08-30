import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, MessageSquare } from 'lucide-react';
import useAppStore from '../../store/appStore';

export default function LocalChat({ botNameFa = 'حریف مصنوعی', botNameEn = 'AI Opponent', simulatedReplies = [] }) {
  const { language } = useAppStore();
  const isRtl = language === 'fa';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: isRtl ? 'سلام! آماده‌ای برای رقابت؟ 😎' : 'Hi! Ready to lose? 😎', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { id: Date.now(), text: input, sender: 'player' };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate bot reply
    setTimeout(() => {
      const replyOptions = simulatedReplies.length > 0 
        ? simulatedReplies 
        : (isRtl ? ['خوبه!', 'ببینیم و تعریف کنیم...', 'شانس آوردی!', 'حرکت بعدی رو چه میکنی؟'] : ['Nice one!', 'We will see...', 'Lucky!', 'Your turn!']);
      
      const randomReply = replyOptions[Math.floor(Math.random() * replyOptions.length)];
      setMessages(prev => [...prev, { id: Date.now(), text: randomReply, sender: 'bot' }]);
    }, 1500 + Math.random() * 1000);
  };

  return (
    <div className={`fixed ${isRtl ? 'bottom-24 left-4' : 'bottom-24 right-4'} z-50 flex flex-col items-end`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`mb-4 w-72 sm:w-80 h-96 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden ${isRtl ? 'origin-bottom-left' : 'origin-bottom-right'}`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="p-3 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{isRtl ? botNameFa : botNameEn}</h3>
                  <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {isRtl ? 'آنلاین' : 'Online'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-500/10">
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[85%] ${isBot ? 'items-start' : 'items-end self-end ml-auto'}`}>
                    <div className={`p-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      isBot 
                        ? 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-tr-sm' 
                        : 'bg-purple-600 text-white rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-2.5 bg-[var(--bg-card)] border-t border-[var(--border)] flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isRtl ? 'پیام بنویسید...' : 'Type a message...'}
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-9 h-9 flex-shrink-0 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-500 disabled:opacity-50 transition-colors"
              >
                <Send size={16} className={isRtl ? 'rotate-180' : ''} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/30 flex items-center justify-center relative"
      >
        <MessageSquare size={24} />
        {/* Notification dot */}
        {!isOpen && messages.length > 1 && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-[var(--bg-primary)] rounded-full animate-pulse"></span>
        )}
      </motion.button>
    </div>
  );
}
