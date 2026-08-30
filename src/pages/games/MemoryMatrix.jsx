import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw, BrainCircuit } from 'lucide-react';
import useAppStore from '../../store/appStore';
import LocalChat from './LocalChat';

const ICONS = ['🚀', '🛸', '🪐', '🌟', '☄️', '🛰️', '🌙', '👽'];

export default function MemoryMatrix() {
  const { isRtl, addXP, addCoins } = useAppStore();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon }));
    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setIsWon(false);
    setDisabled(false);
  };

  const handleCardClick = (id) => {
    if (disabled || flipped.includes(id) || solved.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      setMoves(m => m + 1);
      
      const [firstId, secondId] = newFlipped;
      if (cards[firstId].icon === cards[secondId].icon) {
        setSolved(prev => [...prev, firstId, secondId]);
        setFlipped([]);
        setDisabled(false);
        
        // Check win
        if (solved.length + 2 === cards.length) {
          setIsWon(true);
          addXP(30, 'پیروزی در ماتریس حافظه');
          addCoins(10);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full min-h-screen pb-24 relative overflow-hidden bg-[#0d071a]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-radial from-fuchsia-900/20 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 px-4 pt-6 max-w-lg mx-auto flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/games')}
            className="p-2 rounded-xl bg-white/5 border border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/20 transition-colors"
          >
            <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-200 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(217,70,239,0.5)]">
              MEMORY MATRIX
            </h1>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-8 bg-black/30 px-6 py-3 rounded-2xl border border-fuchsia-500/20 backdrop-blur-md">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-fuchsia-300 font-bold uppercase">{isRtl ? 'حرکات' : 'Moves'}</span>
            <span className="text-2xl font-black text-white">{moves}</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-purple-300 font-bold uppercase">{isRtl ? 'کشف شده' : 'Found'}</span>
            <span className="text-2xl font-black text-white">{solved.length / 2} / {ICONS.length}</span>
          </div>
        </div>

        {/* Win State */}
        <AnimatePresence>
          {isWon && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-8 p-4 bg-fuchsia-500/20 border border-fuchsia-500 rounded-2xl flex flex-col items-center gap-3 backdrop-blur-lg shadow-[0_0_30px_rgba(217,70,239,0.3)]"
            >
              <BrainCircuit className="w-12 h-12 text-fuchsia-400" />
              <h2 className="text-xl font-black text-white">
                {isRtl ? 'تبریک! ماتریس حل شد' : 'Congratulations! Matrix Solved'}
              </h2>
              <button
                onClick={initializeGame}
                className="mt-2 px-6 py-2 rounded-xl bg-fuchsia-500 text-white font-bold text-sm hover:bg-fuchsia-400 transition-colors shadow-lg active:scale-95"
              >
                {isRtl ? 'بازی دوباره' : 'Play Again'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-sm mx-auto perspective-1000">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id) || solved.includes(card.id);
            return (
    <div 
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`relative w-full aspect-square rounded-xl cursor-pointer transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Back of card (visible when not flipped) */}
                <div className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-purple-800/50 to-fuchsia-900/50 border border-white/10 flex items-center justify-center hover:bg-fuchsia-800/50 transition-colors shadow-lg">
                  <span className="text-white/20 text-2xl font-black">?</span>
                </div>
                
                {/* Front of card (visible when flipped) */}
                <div 
                  className={`absolute inset-0 backface-hidden rounded-xl border flex items-center justify-center text-4xl shadow-xl rotate-y-180 ${
                    solved.includes(card.id) 
                      ? 'bg-fuchsia-500/30 border-fuchsia-400/50 shadow-[0_0_15px_rgba(217,70,239,0.5)]' 
                      : 'bg-indigo-600/50 border-indigo-400/50'
                  }`}
                  style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
                >
                  {card.icon}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <LocalChat 
        botNameFa="راهنمای حافظه" 
        botNameEn="Memory Guide"
        simulatedReplies={
          isRtl 
          ? ['تمرکز کن...', 'جای اون یکی رو یادت هست؟', 'نفس عمیق بکش و به تصویر نگاه کن.', 'حافظه بصری مثل عضله است.', 'آفرین! داری بهتر میشی.']
          : ['Focus...', 'Do you remember where the match was?', 'Take a breath and observe.', 'Visual memory is like a muscle.', 'Great job! You are improving.']
        }
      />
      </div>
    );
}
