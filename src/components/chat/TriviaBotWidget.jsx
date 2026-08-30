import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, Sparkles, Clock, CheckCircle2, XCircle, Play } from 'lucide-react';
import useAppStore from '../../store/appStore';
import useMultiplayerStore from '../../store/multiplayerStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

export const TRIVIA_BANK = [
  {
    question: 'کدام کهن‌الگو در روانشناسی یونگ نماد دانایی، تجربه و راهنمایی درونی است؟',
    options: ['سایه (Shadow)', 'پیر فرزانه (Wise Old Man)', 'پرسونا (Persona)', 'پهلوان (Hero)'],
    correctIndex: 1,
    points: 50,
    category: 'روانشناسی و فلسفه'
  },
  {
    question: 'فرکانس مشهور ۴۳۲ هرتز در موسیقی و مراقبه با چه مفهومی شناخته می‌شود؟',
    options: ['فرکانس هم‌آوایی کیهانی و آرامش', 'فرکانس بیداری آدرنالین', 'فرکانس نویز سفید', 'فرکانس رادیویی AM'],
    correctIndex: 0,
    points: 50,
    category: 'ذن و مراقبه'
  },
  {
    question: 'در بازی تخته‌نرد، اصطلاح «مارس» چه زمانی اتفاق می‌افتد؟',
    options: ['وقتی حریف تمام مهره‌ها را خارج کند', 'وقتی برنده تمام مهره‌ها را خارج کند قبل از اینکه حریف حتی ۱ مهره بردارد', 'وقتی تاس جفت ۶ بیاید', 'وقتی دو مهره روی هم بنشیند'],
    correctIndex: 1,
    points: 50,
    category: 'بازی‌های اصیل'
  },
  {
    question: 'تکنیک پومودورو (Pomodoro) معمولاً شامل چه بازه زمانی تمرکز و استراحت است؟',
    options: ['۴۵ دقیقه کار / ۱۵ دقیقه استراحت', '۲۵ دقیقه کار عمیق / ۵ دقیقه استراحت', '۶۰ دقیقه کار / ۲۰ دقیقه استراحت', '۱۰ دقیقه کار / ۲ دقیقه استراحت'],
    correctIndex: 1,
    points: 50,
    category: 'بهره‌وری و رشد'
  },
  {
    question: 'کدام فیلسوف رواقی کتاب ماندگار «تاملات» را در خیمه جنگی نگاشت؟',
    options: ['سنکا', 'مارکوس اورلیوس', 'اپیکتتوس', 'افلاطون'],
    correctIndex: 1,
    points: 50,
    category: 'فلسفه رواقی'
  },
  {
    question: 'در بازی حکم، اگر تیمی ۷ دست بگیرد بدون اینکه حریف حتی ۱ دست برده باشد، چه نام دارد؟',
    options: ['کوت (Kot)', 'بوران', 'پاس', 'دست بسته'],
    correctIndex: 0,
    points: 50,
    category: 'بازی حکم'
  },
  {
    question: 'کدام سیاره در منظومه شمسی به عنوان درخشان‌ترین جرم آسمانی پس از ماه دیده می‌شود؟',
    options: ['مریخ', 'زهره (ناهید)', 'مشتری', 'زحل'],
    correctIndex: 1,
    points: 50,
    category: 'کیهان‌شناسی'
  }
];

export default function TriviaBotWidget() {
  const { addCoins, coins } = useAppStore();
  const { activeTrivia, publishTriviaQuestion, answerTrivia, userId } = useMultiplayerStore();
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [timer, setTimer] = useState(25);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  const handleStartTrivia = () => {
    soundEngine.playTap?.();
    haptics.impact?.();
    const randomQ = TRIVIA_BANK[Math.floor(Math.random() * TRIVIA_BANK.length)];
    publishTriviaQuestion(randomQ);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setTimer(25);
  };

  useEffect(() => {
    if (!activeTrivia || activeTrivia.answered) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTrivia]);

  const handleSelectOption = (idx) => {
    if (!activeTrivia || activeTrivia.answered || isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    const isCorrect = answerTrivia(idx);
    if (isCorrect) {
      soundEngine.playLevelUp?.();
      haptics.notification?.();
      addCoins(activeTrivia.points || 50, 'Trivia Win');
    } else {
      soundEngine.playTap?.();
      haptics.tap?.();
    }
  };

  return (
    <div className="mx-4 my-2 p-4 rounded-3xl bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-purple-950/60 border border-purple-500/40 shadow-xl backdrop-blur-md text-right relative overflow-hidden" dir="rtl">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
            <Brain size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>🧙‍♂️ بات مسابقه اطلاعات عمومی</span>
              <span className="text-[10px] font-bold text-amber-400 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                +۵۰ سکه
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">سریع‌ترین پاسخ صحیح برنده جایزه سکه می‌شود!</p>
          </div>
        </div>

        {activeTrivia && !activeTrivia.answered && (
          <div className="flex items-center gap-1 text-xs font-black text-amber-400 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-400/30">
            <Clock size={12} className="animate-spin" />
            <span>{timer}s</span>
          </div>
        )}
      </div>

      {/* Content */}
      {!activeTrivia ? (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-300 font-bold">آماده به چالش کشیدن هوش و دانایی خود هستید؟</p>
          <button
            onClick={handleStartTrivia}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-black shadow-lg shadow-purple-500/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Play size={13} /> طرح سوال جدید
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-black text-amber-200 leading-relaxed">
              ❓ {activeTrivia.question}
            </p>
            <span className="text-[9px] font-bold text-purple-300 px-2 py-0.5 rounded-lg bg-purple-500/20 border border-purple-500/30 whitespace-nowrap">
              {activeTrivia.category}
            </span>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-2">
            {activeTrivia.options.map((opt, idx) => {
              const isChosen = selectedOption === idx;
              const isWinner = activeTrivia.answered && activeTrivia.correctIndex === idx;
              const isWrong = isChosen && !isWinner && activeTrivia.answered;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={activeTrivia.answered || isAnswerSubmitted}
                  className={`p-2.5 rounded-2xl border text-right text-xs font-bold transition-all active:scale-95 flex items-center justify-between ${
                    isWinner
                      ? 'border-green-400 bg-green-500/25 text-green-300 shadow-lg shadow-green-500/20'
                      : isWrong
                      ? 'border-red-400 bg-red-500/25 text-red-300'
                      : isChosen
                      ? 'border-purple-400 bg-purple-500/30 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-purple-500/30'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {isWinner && <CheckCircle2 size={14} className="text-green-400 flex-shrink-0 mr-1" />}
                  {isWrong && <XCircle size={14} className="text-red-400 flex-shrink-0 mr-1" />}
                </button>
              );
            })}
          </div>

          {/* Winner Announcement */}
          {activeTrivia.answered && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-green-950/40 border border-green-500/30 text-xs font-bold text-green-300"
            >
              <div className="flex items-center gap-1.5">
                <Trophy size={14} className="text-yellow-400" />
                <span>
                  برنده: {activeTrivia.winner?.avatar} {activeTrivia.winner?.name} (+{activeTrivia.winner?.points} سکه) 🎉
                </span>
              </div>
              <button
                onClick={handleStartTrivia}
                className="px-2.5 py-1 rounded-xl bg-purple-600 text-white text-[10px] font-black hover:brightness-110 active:scale-95"
              >
                سوال بعدی 🔄
              </button>
            </motion.div>
          )}
        </div>
      )}

    </div>
  );
}
