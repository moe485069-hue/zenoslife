import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Send, Sparkles, Brain, Compass, Coins, Heart, Flame,
  Loader2, ArrowLeft, Trash2, Volume2, VolumeX, BookmarkPlus, Check 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';

const PERSONAS = [
  { id: 'stoic', nameFa: 'حکیم رواقی (مارکوس اورلیوس)', nameEn: 'Stoic Sage (Aurelius)', icon: '🏛️', color: 'from-amber-600 to-amber-800' },
  { id: 'neuro', nameFa: 'دانشمند علوم اعصاب', nameEn: 'Neuroscientist', icon: '🧠', color: 'from-cyan-600 to-blue-800' },
  { id: 'wealth', nameFa: 'معمار ثروت و اهرم‌ها', nameEn: 'Wealth Architect', icon: '💎', color: 'from-emerald-600 to-teal-800' },
  { id: 'zen', nameFa: 'استاد ذن و مراقبه', nameEn: 'Zen Master', icon: '🌿', color: 'from-teal-600 to-emerald-800' },
  { id: 'focus', nameFa: 'فرمانده بهره‌وری و انضباط', nameEn: 'Discipline Commander', icon: '⚡', color: 'from-purple-600 to-indigo-800' },
];

const QUICK_PROMPTS = [
  { fa: 'چگونه بر اهمال‌کاری غلبه کنم؟', en: 'How to beat procrastination right now?' },
  { fa: 'پروتکل کاهش استرس فوری چیست؟', en: 'What is the instant stress reduction protocol?' },
  { fa: 'چطور عادات روزانه را پایدار کنم؟', en: 'How to make daily habits truly stick?' },
  { fa: 'اصول اهرم مالی و ساخت ثروت چیست؟', en: 'Principles of leverage and wealth creation?' },
  { fa: 'دیدگاه رواقی در برابر شکست‌ها چیست؟', en: 'Stoic perspective on unexpected adversity?' },
  { fa: 'راهکار پاکسازی دوپامینی مغز چیست؟', en: 'How to execute a 24-hour dopamine detox?' },
];

export default function AIMentor() {
  const { language, aiKey, addXP } = useAppStore();
  const isRtl = language === 'fa';
  
  const { habits, todayLogs, journalEntries, loadHabits, addJournalEntry } = useSectionsStore();
  const [selectedPersona, setSelectedPersona] = useState('stoic');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: isRtl 
        ? 'درود بر شما همسفر گرامی. من در کنار شما هستم تا با خرد کهن، علوم اعصاب و استراتژی‌های عملی، مسیر رشد و تسلط فردی‌تان را روشن‌تر کنیم. امروز چه پرسشی ذهن شما را به خود مشغول کرده است؟'
        : 'Welcome, traveler. I am here to assist your personal growth through timeless wisdom, neuroscience, and actionable frameworks. What is on your mind today?'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [savedMessageId, setSavedMessageId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Robust multi-model API caller: Gemini 2.0 Flash with fallback to Gemini 1.5 Flash
  const callGeminiAPI = async (prompt) => {
    if (!aiKey) return null;
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];

    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
          })
        });
        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
      } catch (e) {
        console.warn(`Model ${model} call error:`, e);
      }
    }
    return null;
  };

  const generateSmartOfflineResponse = (query) => {
    const q = query.toLowerCase();
    const completed = habits.filter(h => todayLogs[h.id]).length;
    const total = habits.length;

    // 1. Habit & Consistency
    if (q.includes('عادت') || q.includes('habit') || q.includes('امروز') || q.includes('today') || q.includes('استمرار')) {
      return isRtl
        ? `📊 تحلیل داده‌های امروز شما:\nشما امروز ${completed} از ${total} عادت کلیدی را به ثبت رسانده‌اید.\n\n💡 راهبرد بنیادین:\nانضباط در روزهایی ساخته می‌شود که کمترین انگیزه را دارید. قانون «هرگز دو روز متوالی زنجیره را نشکن» را در اولویت بگذارید. حتی ۵ دقیقه تمرین بهتر از صفر دقیقه است، زیرا هویت ناخودآگاه شما را به عنوان یک فرد متعهد حفظ می‌کند.`
        : `📊 Your daily diagnostic: You have logged ${completed} of ${total} core habits.\n\n💡 Strategic takeaway: Discipline is forged precisely on days you feel zero motivation. Follow the "Never miss twice" rule. 5 minutes of action preserves your identity as a high-performer.`;
    }

    // 2. Procrastination & Laziness
    if (q.includes('اهمال') || q.includes('تنبلی') || q.includes('procrastinat') || q.includes('شروع') || q.includes('حوصله')) {
      if (selectedPersona === 'stoic') {
        return isRtl
          ? `🏛️ خرد مارکوس اورلیوس:\n«صبح‌ها وقتی بیدار شدن دشوار است، به خود بگو: من برمی‌خیزم تا رسالت انسانی‌ام را انجام دهم.»\n\nاهمال‌کاری چیزی جز تمایل ذهن به راحتی گذرای حیوانی نیست. چشمانت را ببند، نفس عمیق بکش و شمارش معکوس را اجرا کن: ۵، ۴، ۳، ۲، ۱... اکنون اولین اقدام کوچک را بدون فکر کردن آغاز کن!`
          : `🏛️ Marcus Aurelius: "At dawn, when struggling to rise, tell yourself: I wake to do the work of a human being." Drop overthinking, count down 5-4-3-2-1, and begin immediately!`;
      }
      return isRtl
        ? `🧠 زاویه علوم اعصاب:\nاهمال‌کاری ناشی از تنبلی نیست، بلکه ناشی از «اضطراب پنهان و پاسخ هیجانی آمیگدال» به سختی ادراک‌شده کار است.\n\nپروتکل شکستن مقاومت:\n۱. کار را به یک بخش فوق‌العاده کوچک ۲ دقیقه‌ای تبدیل کنید.\n۲. تمام محرک‌ها و نوتیفیکیشن‌ها را برای ۲۰ دقیقه خاموش کنید.\n۳. وارد عمل شوید؛ به محض شروع، هورمون دوپامین مسیر تمرکز را باز می‌کند.`
        : `🧠 Neuroscience perspective: Procrastination is an emotional regulation issue triggered by amygdala threat perception. Break the task into a tiny 2-minute micro-step to bypass cognitive resistance and unlock dopamine flow.`;
    }

    // 3. Stress, Panic & Anxiety
    if (q.includes('استرس') || q.includes('اضطراب') || q.includes('stress') || q.includes('anxiety') || q.includes('نگران') || q.includes('ترس')) {
      return isRtl
        ? `🌿 پروتکل بازتنظیم فوری سیستم عصبی (Physiological Sigh):\n۱. دو دم پی‌درپی و عمیق از بینی (یک دم کامل + یک دم تکمیلی کوتاه روی آن).\n۲. یک بازدم بسیار آرام و طولانی از دهان.\n۳. این چرخه را ۳ بار تکرار کنید تا غلظت دی‌اکسید کربن خون و ضربان قلب فورا کاهش یابد.\n\nسپس به یاد آورید: تنها چیزی که در کنترل مستقیم شماست، واکنش شما به این لحظه است.`
        : `🌿 Instant Nervous System Reset (Physiological Sigh):\n1. Two consecutive inhales through the nose (one deep + one sharp top-up).\n2. One long, slow exhale through the mouth.\n3. Repeat 3 times to immediately lower heart rate and cortisol.`;
    }

    // 4. Wealth, Leverage & Money
    if (q.includes('پول') || q.includes('ثروت') || q.includes('wealth') || q.includes('سرمایه') || q.includes('money') || q.includes('درآمد')) {
      return isRtl
        ? `💎 سه قانون زرین معماری ثروت:\n۱. «اول به خودت پرداخت کن»: حداقل ۲۰٪ از هر درآمد را پیش از هر هزینه‌ای به پس‌انداز ضدتورم اختصاص دهید.\n۲. «اهرم‌های بدون اجازه بسازید»: مهارت تخصصی، کدهای نرم‌افزاری و تولید ارزش در مقیاس وسیع بسازید.\n۳. «استراتژی دمبل نسیم طالب»: ۸۵٪ از دارایی‌ها را در بالاترین سطح امنیت و ۱۵٪ را در گزینه‌های رشد تصاعدی قرار دهید.`
        : `💎 Three Laws of Wealth Architecture:\n1. Pay yourself first: Auto-invest at least 20%.\n2. Build permissionless leverage (code, specialized knowledge, high-value assets).\n3. Apply Taleb's Barbell Strategy: extreme safety on 85%, asymmetric upside on 15%.`;
    }

    // 5. Dopamine & Focus
    if (q.includes('دوپامین') || q.includes('تمرکز') || q.includes('dopamine') || q.includes('focus') || q.includes('گوشی')) {
      return isRtl
        ? `⚡ پروتکل بازتنظیم گیرنده‌های دوپامین:\nاستفاده مداوم از شبکه‌های اجتماعی سطح پایه دوپامین (Baseline) را به شدت پایین می‌آورد و انگیزه برای کارهای عمیق را نابود می‌کند.\n\nاقدام عملی:\nبرای ۶۰ دقیقه آینده، گوشی را در اتاق دیگر بگذارید، یک بطری آب بنوشید و یک تایمر ۲۵ دقیقه‌ای پومودورو برای کار اصلی خود آغاز کنید.`
        : `⚡ Dopamine Baseline Reset:\nEndless scrolling degrades your dopamine baseline, making deep work feel impossible. Put your phone in another room and commit to a single 25-minute Pomodoro focus block right now.`;
    }

    // Persona-based wisdom
    if (selectedPersona === 'stoic') {
      return isRtl
        ? `🏛️ سنکا یادآوری می‌کند: «ما در تخیلاتمان بیشتر رنج می‌بریم تا در واقعیت.»\nهر اتفاقی که پیش می‌آید را مانند آتشی در نظر بگیرید که هر مانعی را به سوخت خود برای روشنایی بیشتر تبدیل می‌کند (Amor Fati). گام بعدی که با شرافت و خرد همخوانی دارد را شجاعانه بردارید.`
        : `🏛️ Seneca: "We suffer more often in imagination than in reality." Treat every obstacle as fuel for your inner fire (Amor Fati). Take the honorable next step.`;
    }

    if (selectedPersona === 'neuro') {
      return isRtl
        ? `🧠 مغز انسان از طریق پدیده نوروپلاستیسیتی مدام بازطراحی می‌شود. هر بار که بر تنش غلبه کرده و انتخاب دشوارتر اما درست را انجام می‌دهید، مسیرهای عصبی کورتکس پیش‌پیشانی شما ضخیم‌تر می‌شوند. پیروزی در راه است.`
        : `🧠 Through neuroplasticity, every conscious choice to endure discomfort structurally reinforces your prefrontal cortex. You are actively rewiring yourself for greatness.`;
    }

    return isRtl
      ? `✨ پاسخ حقیقی در سکوت و اقدام منسجم در لحظه حال است. اجازه ندهید نشخوارهای فکری گذشته یا نگرانی‌های آینده، قدرت عمل شما را در این لحظه سلب کنند. امروز بزرگ‌ترین اولویت شما چیست؟ بر همان تمرکز کنید.`
      : `✨ The true answer lies in grounded presence. Do not let future worries steal the power of your present action. What is your single most important priority today? Focus on that.`;
  };

  const getContextString = () => {
    const completed = habits.filter(h => todayLogs[h.id]).length;
    const total = habits.length;
    const journal = journalEntries.length > 0 ? journalEntries[journalEntries.length - 1].content : 'No recent journal.';
    const persona = PERSONAS.find(p => p.id === selectedPersona);
    
    return `You are acting as a world-class ${persona.nameEn} and mentor. Context: User has completed ${completed}/${total} habits today. Recent reflection: "${journal}". Respond in ${isRtl ? 'Persian (Farsi)' : 'English'}. Be deeply insightful, compassionate yet disciplined, practical and structured with bullet points.`;
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setIsTyping(true);
    soundEngine.playTap?.();
    haptics.tap();

    const fullPrompt = `${getContextString()}\n\nUser: ${userText}`;

    if (aiKey) {
      const aiResponse = await callGeminiAPI(fullPrompt);
      setIsTyping(false);
      
      if (aiResponse) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: aiResponse }]);
        soundEngine.playLevelUp?.();
        addXP(15, 'مشاوره با مربی هوش مصنوعی');
      } else {
        const fallbackMsg = generateSmartOfflineResponse(userText);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: fallbackMsg }]);
        soundEngine.playCheckmark?.();
      }
    } else {
      setTimeout(() => {
        setIsTyping(false);
        const fallbackMsg = generateSmartOfflineResponse(userText);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: fallbackMsg }]);
        soundEngine.playCheckmark?.();
        addXP(10, 'مشاوره هوشمند آفلاین');
      }, 500);
    }
  };

  // Save advice to journal
  const handleSaveToJournal = async (msgText) => {
    await addJournalEntry({
      title: isRtl ? `خرد مربی (${PERSONAS.find(p => p.id === selectedPersona)?.nameFa})` : 'AI Mentor Insight',
      content: msgText,
      mood: 'happy',
      tags: 'خرد,هوش‌مصنوعی,بینش,منتور',
      sectionId: 'selfDiscovery'
    });
    soundEngine.playLevelUp?.();
    haptics.success();
    setSavedMessageId(msgText);
    setTimeout(() => setSavedMessageId(null), 3000);
  };

  // Speak aloud with SpeechSynthesis API
  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      soundEngine.playTap?.();
    }
  };

  return (
    <div className="page-container flex flex-col h-[calc(100vh-80px)] pb-4 max-w-4xl mx-auto select-none" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 mb-2">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            onClick={() => { soundEngine.playTap?.(); haptics.tap(); }}
            className="p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft size={18} className={isRtl ? 'rotate-180' : ''} />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-black flex items-center gap-2 text-purple-400">
              <Bot size={22} />
              <span>{isRtl ? 'مربی هوشمند و چندشخصیتی Life OS' : 'Multi-Persona AI Mentor'}</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {isRtl ? 'مشاور خرد، عادات زیستی، علوم اعصاب و ثروت پایدار' : 'Stoic, Neurobiological & Wealth Advisor'}
            </p>
          </div>
        </div>

        {/* Clear chat button */}
        <button
          onClick={() => {
            if (window.confirm(isRtl ? 'گفتگو پاکسازی شود؟' : 'Clear conversation?')) {
              setMessages([]);
              soundEngine.playTrash?.();
              haptics.tap();
            }
          }}
          className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-rose-400 transition-colors active:scale-95 text-xs flex items-center gap-1.5"
          title={isRtl ? 'پاکسازی چت' : 'Clear chat'}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Persona Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 mb-3">
        {PERSONAS.map(p => (
          <button
            key={p.id}
            onClick={() => { 
              setSelectedPersona(p.id); 
              soundEngine.playTap?.();
              haptics.tap();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border shadow-sm active:scale-95 ${
              selectedPersona === p.id 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-purple-500/20'
                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple-500/40'
            }`}
          >
            <span>{p.icon}</span>
            <span>{isRtl ? p.nameFa : p.nameEn}</span>
          </button>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 mb-3">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => { 
              setInputText(isRtl ? qp.fa : qp.en);
              soundEngine.playTap?.();
              haptics.tap();
            }}
            className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[11px] font-bold text-[var(--text-secondary)] hover:border-purple-500 hover:text-[var(--text-primary)] whitespace-nowrap transition-all shadow-xs"
          >
            {isRtl ? qp.fa : qp.en}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar border border-[var(--border)] bg-gradient-to-b from-[var(--bg-secondary)]/40 to-transparent rounded-3xl mx-4 mb-3 shadow-inner custom-scrollbar"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSaved = savedMessageId === msg.text;

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed border transition-all ${
                isUser
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-br-sm shadow-md border-purple-500'
                  : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-primary)] rounded-bl-sm shadow-sm'
              }`}>
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[var(--border)] text-xs text-purple-400 font-black">
                    <div className="flex items-center gap-1.5">
                      <Bot size={15} />
                      <span>{isRtl ? PERSONAS.find(p => p.id === selectedPersona)?.nameFa : PERSONAS.find(p => p.id === selectedPersona)?.nameEn}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-purple-400 transition-colors"
                        title={isRtl ? 'شنیدن پاسخ' : 'Read aloud'}
                      >
                        <Volume2 size={14} />
                      </button>
                      <button
                        onClick={() => handleSaveToJournal(msg.text)}
                        className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-emerald-400 transition-colors"
                        title={isRtl ? 'ذخیره در ژورنال خودشناسی' : 'Save to Journal'}
                      >
                        {isSaved ? <Check size={14} className="text-emerald-400" /> : <BookmarkPlus size={14} />}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
              </div>
            </motion.div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-3 rounded-2xl flex items-center gap-2 text-xs text-[var(--text-secondary)] shadow-sm">
              <Loader2 size={14} className="animate-spin text-purple-400" />
              <span>{isRtl ? 'در حال تامل، تحلیل و تدوین پاسخ عمیق...' : 'Reflecting and crafting wisdom...'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="px-4 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isRtl ? 'پرسش یا چالش کنونی خود را بنویسید...' : 'Ask your mentor anything...'}
          className="flex-1 px-4 py-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-primary)] outline-none focus:border-purple-500 transition-all shadow-sm"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-xs"
        >
          <span>{isRtl ? 'ارسال' : 'Send'}</span>
          <Send size={16} className={isRtl ? 'rotate-180' : ''} />
        </button>
      </form>

    </div>
  );
}
