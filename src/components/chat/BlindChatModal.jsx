import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Heart, X, Send, Clock, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import useAppStore from '../../store/appStore';
import useMultiplayerStore from '../../store/multiplayerStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export default function BlindChatModal({ isOpen, onClose }) {
  const { userName, userAvatar, sendDirectMessage, setActiveDmUserId } = useMultiplayerStore();

  const [step, setStep] = useState('intro'); // 'intro' | 'searching' | 'chatting' | 'deciding' | 'matched'
  const [partner, setPartner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [myVote, setMyVote] = useState(null); // true | false

  // Start Search
  const handleStartSearch = () => {
    soundEngine.playTap?.();
    setStep('searching');
    setTimeout(() => {
      // Pick random persona or online user
      const dummyPartner = {
        id: 'blind_' + Date.now(),
        tempName: 'هم‌فرکانس ناشناس #' + Math.floor(100 + Math.random() * 900),
        realName: 'دیانا ستاره',
        avatar: '💎',
        city: 'شیراز',
        bio: 'علاقه‌مند به هنر و فلسفه'
      };
      setPartner(dummyPartner);
      setStep('chatting');
      setTimeLeft(180);
      setMessages([
        { id: 'm1', sender: 'system', text: '✨ شما به چت ناشناس ۳ دقیقه‌ای متصل شدید! بدون پیش‌داوری با هم گفتگو کنید.' }
      ]);
      soundEngine.playLevelUp?.();
    }, 2000);
  };

  // Timer
  useEffect(() => {
    if (step !== 'chatting') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setStep('deciding');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleSendMessage = () => {
    if (!inputVal.trim()) return;
    const newMsg = { id: 'm_' + Date.now(), sender: 'me', text: inputVal };
    setMessages(prev => [...prev, newMsg]);
    setInputVal('');
    soundEngine.playTap?.();

    // Auto reply simulation
    setTimeout(() => {
      const replies = [
        'چه جالب! حس خوبی از صحبت با شما گرفتم 🌸',
        'موافقم، انرژی و ارتعاش کلمات خیلی مهمه ✨',
        'دقیقاً! اهل چه سرگرمی‌ها و کتاب‌هایی هستید؟ 📚'
      ];
      const r = replies[Math.floor(Math.random() * replies.length)];
      setMessages(prev => [...prev, { id: 'm_r_' + Date.now(), sender: 'partner', text: r }]);
      soundEngine.playMessageChime?.();
    }, 1500);
  };

  const handleVote = (liked) => {
    setMyVote(liked);
    soundEngine.playTap?.();
    if (liked) {
      soundEngine.playLevelUp?.();
      setStep('matched');
    } else {
      setStep('intro');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md h-[520px] rounded-3xl bg-slate-900 border-2 border-purple-500/40 flex flex-col justify-between p-5 shadow-2xl text-right"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-amber-400" />
                <h3 className="text-sm font-black text-white">قرار ناشناس ۳ دقیقه‌ای (Blind Speed Chat)</h3>
              </div>
              <button onClick={onClose} className="p-1 rounded-xl bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Step: Intro */}
            {step === 'intro' && (
              <div className="my-auto text-center space-y-4 px-4">
                <div className="text-6xl animate-bounce">🎭</div>
                <h4 className="text-base font-black text-amber-300">چت ناشناس بدون تصویر و نام!</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  به مدت ۳ دقیقه با یک فرد آنلاین گفتگو کنید. در پایان اگر هر دو طرف همدیگر را پسندیدید، هویت‌ها آشکار شده و به پی‌وی متصل می‌شوید.
                </p>
                <button
                  onClick={handleStartSearch}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs shadow-xl active:scale-95"
                >
                  🚀 ورود به صف گفتگوی ناشناس
                </button>
              </div>
            )}

            {/* Step: Searching */}
            {step === 'searching' && (
              <div className="my-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-purple-400 border-t-pink-500 animate-spin mx-auto" />
                <h4 className="text-sm font-black text-white">در حال جستجوی فرد هم‌فرکانس...</h4>
                <p className="text-xs text-slate-400">لطفاً چند لحظه شکیبا باشید</p>
              </div>
            )}

            {/* Step: Chatting */}
            {step === 'chatting' && (
              <>
                <div className="flex items-center justify-between p-2 rounded-2xl bg-black/40 border border-white/10 text-xs">
                  <span className="font-bold text-amber-300">🎭 {partner?.tempName}</span>
                  <span className="font-black text-pink-400 flex items-center gap-1">
                    <Clock size={13} /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 py-3 px-1">
                  {messages.map(m => (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-2xl text-xs max-w-[80%] ${
                        m.sender === 'me'
                          ? 'mr-auto bg-purple-600 text-white rounded-bl-none'
                          : m.sender === 'partner'
                          ? 'ml-auto bg-white/10 text-slate-200 rounded-br-none'
                          : 'mx-auto bg-amber-500/20 border border-amber-500/30 text-amber-300 text-center font-bold'
                      }`}
                    >
                      {m.text}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/10">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="پیامی ناشناس بنویسید..."
                    className="flex-1 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="p-2.5 rounded-2xl bg-purple-600 text-white active:scale-95"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </>
            )}

            {/* Step: Deciding */}
            {step === 'deciding' && (
              <div className="my-auto text-center space-y-4 px-4">
                <div className="text-5xl">⏳</div>
                <h4 className="text-sm font-black text-white">زمان ۳ دقیقه به پایان رسید!</h4>
                <p className="text-xs text-slate-300">آیا تمایل دارید هویت‌ها باز شده و به پی‌وی هدایت شوید؟</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleVote(true)}
                    className="px-6 py-2.5 rounded-2xl bg-green-600 text-white font-black text-xs active:scale-95"
                  >
                    💚 پسندیدم
                  </button>
                  <button
                    onClick={() => handleVote(false)}
                    className="px-6 py-2.5 rounded-2xl bg-white/10 text-slate-300 font-bold text-xs"
                  >
                    خیر
                  </button>
                </div>
              </div>
            )}

            {/* Step: Matched */}
            {step === 'matched' && (
              <div className="my-auto text-center space-y-4 px-4">
                <div className="text-6xl animate-bounce">🎉</div>
                <h4 className="text-base font-black text-green-300">تطابق دوطرفه برقرار شد!</h4>
                <div className="p-4 rounded-3xl bg-white/5 border border-green-500/40 text-center space-y-1">
                  <span className="text-3xl">{partner?.avatar}</span>
                  <h5 className="text-sm font-black text-white">{partner?.realName}</h5>
                  <p className="text-[11px] text-slate-400">{partner?.city} · {partner?.bio}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-slate-950 font-black text-xs active:scale-95"
                >
                  ورود به چت خصوصی 💬
                </button>
              </div>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
