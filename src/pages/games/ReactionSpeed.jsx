import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowLeft, RotateCcw, Trophy, Sparkles, Activity, Clock, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import FullscreenWrapper from '../../components/ui/FullscreenWrapper';
import soundEngine from '../../utils/audio';

const TOTAL_ROUNDS = 5;

export default function ReactionSpeed() {
  const { isRtl, addXP } = useAppStore();
  const [gameState, setGameState] = useState('IDLE'); // 'IDLE' | 'WAITING' | 'READY' | 'TOO_EARLY' | 'ROUND_DONE' | 'GAME_OVER'
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('reaction_speed_best') || '999', 10);
  });

  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  const startRound = () => {
    setGameState('WAITING');
    setCurrentScore(0);
    const randomDelay = Math.floor(Math.random() * 3000) + 1500; // 1.5s to 4.5s
    timerRef.current = setTimeout(() => {
      setGameState('READY');
      startTimeRef.current = Date.now();
    }, randomDelay);
  };

  const handleBoxClick = () => {
    if (gameState === 'IDLE') {
      setRound(1);
      setScores([]);
      startRound();
    } else if (gameState === 'WAITING') {
      clearTimeout(timerRef.current);
      setGameState('TOO_EARLY');
      soundEngine.playAlarm();
    } else if (gameState === 'READY') {
      const elapsed = Date.now() - startTimeRef.current;
      setCurrentScore(elapsed);
      const newScores = [...scores, elapsed];
      setScores(newScores);
      soundEngine.playCheckmark();

      if (round >= TOTAL_ROUNDS) {
        setGameState('GAME_OVER');
        const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / TOTAL_ROUNDS);
        if (avg < bestScore) {
          setBestScore(avg);
          localStorage.setItem('reaction_speed_best', avg.toString());
        }
        if (avg < 230) {
          addXP(60, 'F1 Reaction Speed Achieved');
          soundEngine.playLevelUp();
        } else {
          addXP(30, 'Completed Reaction Benchmark');
        }
      } else {
        setGameState('ROUND_DONE');
      }
    } else if (gameState === 'TOO_EARLY' || gameState === 'ROUND_DONE') {
      if (gameState === 'ROUND_DONE') {
        setRound(r => r + 1);
      }
      startRound();
    } else if (gameState === 'GAME_OVER') {
      setRound(1);
      setScores([]);
      startRound();
    }
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const getAverage = () => {
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const getRank = (avg) => {
    if (avg === 0) return { titleFa: '-', titleEn: '-', icon: '⚡', color: 'text-slate-400' };
    if (avg < 200) return { titleFa: 'خلبان مافوق صوت ⚡', titleEn: 'Supersonic Pilot ⚡', icon: '🚀', color: 'text-cyan-300' };
    if (avg < 240) return { titleFa: 'راننده فرمول یک 🏎️', titleEn: 'F1 Driver 🏎️', icon: '🏎️', color: 'text-emerald-300' };
    if (avg < 280) return { titleFa: 'تک‌تیرانداز چابک 🏹', titleEn: 'Cosmic Sniper 🏹', icon: '🏹', color: 'text-purple-300' };
    if (avg < 350) return { titleFa: 'واکنش استاندارد انسانی 🏃', titleEn: 'Standard Human Reflex 🏃', icon: '🏃', color: 'text-amber-300' };
    return { titleFa: 'نیازمند استراحت و خواب 😴', titleEn: 'Fatigued / Sleep Needed 😴', icon: '🐢', color: 'text-rose-300' };
  };

  const avgScore = getAverage();
  const rank = getRank(avgScore);

  return (
    <FullscreenWrapper title={isRtl ? 'آزمون سرعت واکنش' : 'Reaction Speed'}>
      <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-3 select-none" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* HUD Bar */}
        <div className="w-full max-w-md flex items-center justify-between gap-3 mb-4">
          <Link
            to="/games"
            className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>

          <div className="flex gap-2">
            <div className="px-3.5 py-1.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center">
              <span className="text-[10px] text-cyan-400 block font-bold">{isRtl ? 'راند' : 'ROUND'}</span>
              <span className="text-sm font-black text-cyan-200">{round} / {TOTAL_ROUNDS}</span>
            </div>

            {bestScore < 900 && (
              <div className="px-3.5 py-1.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-center flex items-center gap-1.5">
                <Trophy size={14} className="text-amber-400" />
                <div>
                  <span className="text-[10px] text-amber-400 block font-bold">{isRtl ? 'بهترین میانگین' : 'BEST'}</span>
                  <span className="text-sm font-black text-amber-200">{bestScore} ms</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => { clearTimeout(timerRef.current); setGameState('IDLE'); setRound(1); setScores([]); }}
            className="p-2.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-cyan-400 transition-colors"
            title={isRtl ? 'ریست' : 'Reset'}
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Interactive Reaction Arena Box */}
        <motion.div
          onClick={handleBoxClick}
          whileTap={{ scale: 0.98 }}
          className={`w-full max-w-md h-80 rounded-3xl cursor-pointer p-6 flex flex-col items-center justify-center text-center shadow-2xl transition-all border-2 relative overflow-hidden ${
            gameState === 'IDLE' ? 'bg-slate-900 border-cyan-500/40 hover:border-cyan-400 text-cyan-200' :
            gameState === 'WAITING' ? 'bg-rose-950 border-rose-500 text-rose-200 animate-pulse' :
            gameState === 'READY' ? 'bg-emerald-500 border-emerald-300 text-slate-950 font-black shadow-emerald-500/50' :
            gameState === 'TOO_EARLY' ? 'bg-amber-950 border-amber-500 text-amber-200' :
            gameState === 'ROUND_DONE' ? 'bg-blue-950 border-blue-500 text-blue-200' :
            'bg-slate-900 border-purple-500 text-purple-200'
          }`}
        >
          {gameState === 'IDLE' && (
            <div className="space-y-3">
              <Zap size={48} className="mx-auto text-cyan-400 animate-bounce" />
              <h2 className="text-xl font-black">{isRtl ? 'آزمون سرعت واکنش عصبی' : 'Reaction Time Benchmark'}</h2>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                {isRtl ? 'وقتی کادر قرمز به سبز تبدیل شد، در سریع‌ترین زمان ممکن کلیک کنید.' : 'Click anywhere to begin. When red turns to GREEN, click as fast as you can!'}
              </p>
              <span className="inline-block px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-xs font-bold text-cyan-300">
                {isRtl ? 'برای شروع کلیک کنید 🎯' : 'Click to Start 🎯'}
              </span>
            </div>
          )}

          {gameState === 'WAITING' && (
            <div className="space-y-2">
              <Clock size={44} className="mx-auto text-rose-400 animate-spin" />
              <h2 className="text-2xl font-black text-rose-300">{isRtl ? 'منتظر رنگ سبز بمانید...' : 'Wait for Green...'}</h2>
              <p className="text-xs text-rose-400/80">{isRtl ? 'الان کلیک نکنید!' : 'Do not click yet!'}</p>
            </div>
          )}

          {gameState === 'READY' && (
            <div className="space-y-2">
              <Sparkles size={56} className="mx-auto text-slate-950 animate-ping" />
              <h2 className="text-4xl font-black tracking-wider">{isRtl ? 'کلیک کن!' : 'CLICK NOW!'}</h2>
            </div>
          )}

          {gameState === 'TOO_EARLY' && (
            <div className="space-y-2">
              <ShieldAlert size={44} className="mx-auto text-amber-400" />
              <h2 className="text-xl font-black text-amber-300">{isRtl ? 'خیلی زود کلیک کردی!' : 'Too Early!'}</h2>
              <p className="text-xs text-amber-400/80">{isRtl ? 'برای تلاش مجدد کلیک کن' : 'Click to try again'}</p>
            </div>
          )}

          {gameState === 'ROUND_DONE' && (
            <div className="space-y-3">
              <span className="text-4xl font-black text-cyan-300 font-mono">{currentScore} ms</span>
              <h3 className="text-sm font-bold text-blue-200">{isRtl ? 'ثبت شد! برای راند بعدی کلیک کنید' : 'Recorded! Click for next round'}</h3>
            </div>
          )}

          {gameState === 'GAME_OVER' && (
            <div className="space-y-3">
              <Trophy size={44} className="mx-auto text-amber-400" />
              <h2 className="text-xl font-black text-purple-200">{isRtl ? 'نتیجه ۵ راند' : 'Benchmark Complete'}</h2>
              <div className="text-3xl font-black text-cyan-300 font-mono">{avgScore} ms</div>
              <div className={`text-xs font-bold px-3 py-1.5 rounded-full bg-slate-950/60 border border-slate-800 ${rank.color}`}>
                {isRtl ? rank.titleFa : rank.titleEn}
              </div>
              <button className="px-5 py-2 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-lg hover:bg-purple-500">
                {isRtl ? 'تکرار آزمون' : 'Try Again'}
              </button>
            </div>
          )}
        </motion.div>

        {/* History of 5 rounds */}
        {scores.length > 0 && (
          <div className="w-full max-w-md flex items-center justify-center gap-2 mt-4">
            {scores.map((sc, i) => (
              <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
                #{i + 1}: {sc}ms
              </span>
            ))}
          </div>
        )}
      </div>
    </FullscreenWrapper>
  );
}
