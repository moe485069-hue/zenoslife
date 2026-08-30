import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw, HelpCircle } from 'lucide-react';
import useAppStore from '../../store/appStore';
import LocalChat from './LocalChat';

// A small subset of 5-letter Persian words for the game
const WORDS = [
  'ایران', 'آسمان', 'ستاره', 'امید', 'زندگی', 'پاییز', 'بهار', 'کتاب', 'دانش', 'قدرت', 
  'دوستی', 'جهان', 'خورشید', 'مهتاب', 'جنگل', 'دریا', 'آزادی', 'شادی', 'عشق', 'قلب'
];

// Helper to remove zero-width non-joiners or spaces for clean processing
const cleanWord = (w) => w.replace(/\s+/g, '').replace(/‌/g, '');

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

// Persian Keyboard Layout
const KEYBOARD_ROWS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'چ'],
  ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
  ['ENTER', 'ظ', 'ط', 'ز', 'ر', 'ذ', 'د', 'پ', 'و', 'BACKSPACE']
];

export default function WordlePersian() {
  const { isRtl, addXP, addCoins } = useAppStore();
  const navigate = useNavigate();

  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [showToast, setShowToast] = useState('');

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Pick a random word that is exactly 5 letters long (after cleaning)
    const validWords = WORDS.filter(w => cleanWord(w).length === 5);
    const randomWord = validWords[Math.floor(Math.random() * validWords.length)];
    setTargetWord(cleanWord(randomWord));
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
    setShowToast('');
  };

  // Toast helper
  const displayToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 2500);
  };

  const handleKeyPress = (key) => {
    if (gameState !== 'playing') return;

    if (key === 'ENTER') {
      if (currentGuess.length !== WORD_LENGTH) {
        displayToast(isRtl ? 'کلمه باید ۵ حرف باشد' : 'Word must be 5 letters');
        return;
      }
      
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      
      if (currentGuess === targetWord) {
        setGameState('won');
        addXP(40, 'پیروزی در حدس کلمه');
        addCoins(15);
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameState('lost');
      }
      
      setCurrentGuess('');
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else {
      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess(prev => prev + key);
      }
    }
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return;
      if (e.key === 'Enter') handleKeyPress('ENTER');
      else if (e.key === 'Backspace') handleKeyPress('BACKSPACE');
      else {
        // Simple regex to check if it's a Persian letter
        const persianRegex = /^[\u0600-\u06FF]$/;
        if (persianRegex.test(e.key)) {
          handleKeyPress(e.key);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameState]);

  // Determine letter colors
  const getLetterStatus = (letter, index, guessWord) => {
    if (!targetWord) return 'absent';
    if (targetWord[index] === letter) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  // Determine keyboard key colors
  const getKeyStatus = (key) => {
    let status = 'default';
    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        if (guess[i] === key) {
          if (targetWord[i] === key) {
            return 'correct'; // correct overrides all
          } else if (targetWord.includes(key)) {
            status = 'present';
          } else if (status === 'default') {
            status = 'absent';
          }
        }
      }
    }
    return status;
  };

  return (
    <div className="w-full min-h-screen pb-24 relative overflow-hidden bg-[#1e1b4b]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Graphic */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 px-4 pt-6 max-w-md mx-auto flex flex-col items-center h-full">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/games')}
            className="p-2 rounded-xl bg-white/5 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
              {isRtl ? 'حدس کلمه' : 'PERSIAN WORDLE'}
            </h1>
          </div>
          <button className="p-2 rounded-xl bg-white/5 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors">
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-24 z-50 px-6 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm shadow-xl"
            >
              {showToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Board */}
        <div className="flex flex-col gap-2 mb-8 w-full max-w-[300px]">
          {Array(MAX_GUESSES).fill(null).map((_, rowIdx) => {
            const isCurrentRow = rowIdx === guesses.length;
            const guess = guesses[rowIdx] || (isCurrentRow ? currentGuess : '');
            
            return (
    <div key={rowIdx} className="flex gap-2 justify-center">
                {Array(WORD_LENGTH).fill(null).map((_, colIdx) => {
                  const letter = guess[colIdx] || '';
                  const status = rowIdx < guesses.length ? getLetterStatus(letter, colIdx, guess) : 'empty';
                  
                  let bgColor = 'bg-black/30 border-white/10';
                  if (status === 'correct') bgColor = 'bg-emerald-500 border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
                  else if (status === 'present') bgColor = 'bg-amber-500 border-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
                  else if (status === 'absent') bgColor = 'bg-slate-700 border-slate-800';
                  else if (letter) bgColor = 'bg-black/50 border-amber-500/50';

                  return (
                    <motion.div
                      key={colIdx}
                      initial={rowIdx < guesses.length ? { rotateX: 90 } : false}
                      animate={rowIdx < guesses.length ? { rotateX: 0 } : false}
                      transition={{ duration: 0.4, delay: colIdx * 0.1 }}
                      className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-2xl font-black text-white rounded-xl border-2 ${bgColor}`}
                    >
                      {letter}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Game Over State */}
        <AnimatePresence>
          {gameState !== 'playing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-3xl mb-8 flex flex-col items-center gap-3 backdrop-blur-md shadow-2xl border ${
                gameState === 'won' 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-100' 
                  : 'bg-rose-500/20 border-rose-500 text-rose-100'
              }`}
            >
              <h2 className="text-2xl font-black">
                {gameState === 'won' ? (isRtl ? 'آفرین! پیدا کردی' : 'Great Job!') : (isRtl ? 'باختی!' : 'Game Over')}
              </h2>
              <p className="text-lg">
                {isRtl ? 'کلمه مورد نظر:' : 'The word was:'} <span className="font-black text-white text-xl">{targetWord}</span>
              </p>
              <button
                onClick={initializeGame}
                className={`mt-2 px-8 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-all ${
                  gameState === 'won' ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-rose-500 text-white hover:bg-rose-400'
                }`}
              >
                <RotateCcw size={18} />
                {isRtl ? 'بازی دوباره' : 'Play Again'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard */}
        <div className="w-full max-w-sm mt-auto">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
              {row.map((key) => {
                const status = getKeyStatus(key);
                let bg = 'bg-white/10 hover:bg-white/20 text-white';
                if (status === 'correct') bg = 'bg-emerald-500 text-black font-bold';
                else if (status === 'present') bg = 'bg-amber-500 text-black font-bold';
                else if (status === 'absent') bg = 'bg-slate-800 text-slate-500 opacity-50';

                const isSpecial = key === 'ENTER' || key === 'BACKSPACE';

                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className={`h-12 rounded-lg flex items-center justify-center font-bold text-sm sm:text-base transition-colors ${
                      isSpecial ? 'px-2 sm:px-4 text-[10px] sm:text-xs bg-slate-700/50 hover:bg-slate-600/50 text-white' : 'w-8 sm:w-10'
                    } ${bg}`}
                  >
                    {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? (isRtl ? 'تایید' : 'ENT') : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

      </div>

      <LocalChat 
        botNameFa="واژه‌باز" 
        botNameEn="WordMaster"
        simulatedReplies={
          isRtl 
          ? ['دایره لغاتت چطوره؟', 'به حروف صدادار دقت کن.', 'گاهی کلمات ساده‌تر از چیزی هستن که فکر میکنی.', 'اوه، نزدیک بود!', 'من کلمه رو میدونم ولی بهت نمیگم 🤫']
          : ['How is your vocabulary?', 'Pay attention to vowels.', 'Sometimes words are simpler than you think.', 'Oh, close!', 'I know the word but I won\'t tell you 🤫']
        }
      />
      </div>
    );
}
