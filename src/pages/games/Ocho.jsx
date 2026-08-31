import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Trophy, Users, Bot, Zap, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_CLASSES = {
  red: 'bg-rose-600 border-rose-400 text-white',
  blue: 'bg-sky-600 border-sky-400 text-white',
  green: 'bg-emerald-600 border-emerald-400 text-white',
  yellow: 'bg-amber-500 border-amber-300 text-slate-950',
  wild: 'bg-gradient-to-tr from-rose-500 via-emerald-500 to-sky-500 border-amber-400 text-white'
};

const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '🚫', '🔄', '+2'];

function buildDeck() {
  const deck = [];
  COLORS.forEach(color => {
    VALUES.forEach(val => {
      deck.push({ id: `${color}_${val}_${Math.random().toString(36).slice(2, 6)}`, color, value: val });
    });
  });
  // Wild Cards
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `wild_${i}_${Math.random().toString(36).slice(2, 6)}`, color: 'wild', value: '🌈' });
    deck.push({ id: `wild4_${i}_${Math.random().toString(36).slice(2, 6)}`, color: 'wild', value: '+4' });
  }
  return deck.sort(() => Math.random() - 0.5);
}

export default function Ocho() {
  const navigate = useNavigate();
  const { coins, addCoins, addXp } = useAppStore();

  const [playerCount, setPlayerCount] = useState(2); // 2, 3, or 4
  const [gameMode, setGameMode] = useState('bot'); // 'bot' or 'pass_and_play'
  const [deck, setDeck] = useState([]);
  const [hands, setHands] = useState([[], [], [], []]);
  const [topCard, setTopCard] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [direction, setDirection] = useState(1);
  const [activeColor, setActiveColor] = useState('red');
  const [winner, setWinner] = useState(null);
  const [log, setLog] = useState('به بازی کارتی اوچو خوش آمدید!');
  const [chooseColorModal, setChooseColorModal] = useState(false);

  // Initialize Game
  const startNewGame = (pCount = playerCount, mode = gameMode) => {
    setPlayerCount(pCount);
    setGameMode(mode);
    const newDeck = buildDeck();
    const newHands = [[], [], [], []];

    for (let p = 0; p < pCount; p++) {
      newHands[p] = newDeck.splice(0, 7);
    }

    let firstTop = newDeck.pop();
    while (firstTop.color === 'wild') {
      newDeck.unshift(firstTop);
      firstTop = newDeck.pop();
    }

    setDeck(newDeck);
    setHands(newHands);
    setTopCard(firstTop);
    setActiveColor(firstTop.color);
    setCurrentTurn(0);
    setDirection(1);
    setWinner(null);
    setLog('کارت اول کشیده شد. نوبت شماست!');
  };

  useEffect(() => {
    startNewGame();
  }, []);

  // Card playable check
  const isPlayable = (card) => {
    if (!topCard) return false;
    if (card.color === 'wild') return true;
    if (card.color === activeColor) return true;
    if (card.value === topCard.value) return true;
    return false;
  };

  // Play Card
  const playCard = (card, playerIdx) => {
    if (currentTurn !== playerIdx || winner !== null) return;
    if (!isPlayable(card)) {
      soundEngine.playError?.();
      return;
    }

    soundEngine.playCardPlace?.();
    haptics.impact?.('light');

    // Remove from hand
    setHands(prev => {
      const next = [...prev];
      next[playerIdx] = next[playerIdx].filter(c => c.id !== card.id);
      return next;
    });

    setTopCard(card);

    // Check winner
    if (hands[playerIdx].length === 1) {
      setWinner(playerIdx);
      soundEngine.playWin?.();
      if (playerIdx === 0) {
        addCoins(120);
        addXp(60);
      }
      return;
    }

    // Wild Color Selection
    if (card.color === 'wild') {
      if (playerIdx === 0) {
        setChooseColorModal(true);
      } else {
        const randColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        setActiveColor(randColor);
        handleSpecialCardAction(card, playerIdx);
      }
    } else {
      setActiveColor(card.color);
      handleSpecialCardAction(card, playerIdx);
    }
  };

  // Special card actions: Skip, Reverse, +2, +4
  const handleSpecialCardAction = (card, playerIdx) => {
    let nextTurn = (currentTurn + direction + playerCount) % playerCount;

    if (card.value === '🚫') {
      setLog(`🚫 نوبت بازیکن بعدی رد شد!`);
      nextTurn = (nextTurn + direction + playerCount) % playerCount;
    } else if (card.value === '🔄') {
      setDirection(d => -d);
      setLog(`🔄 جهت بازی معکوس شد!`);
      nextTurn = (currentTurn - direction + playerCount) % playerCount;
    } else if (card.value === '+2') {
      drawCardsForPlayer(nextTurn, 2);
      setLog(`💥 بازیکن بعدی ۲ کارت جریمه کشید و نوبتش رد شد!`);
      nextTurn = (nextTurn + direction + playerCount) % playerCount;
    } else if (card.value === '+4') {
      drawCardsForPlayer(nextTurn, 4);
      setLog(`💣 بازیکن بعدی ۴ کارت جریمه کشید و نوبتش رد شد!`);
      nextTurn = (nextTurn + direction + playerCount) % playerCount;
    }

    setCurrentTurn(nextTurn);
  };

  // Draw card from deck
  const drawCard = (playerIdx) => {
    if (currentTurn !== playerIdx || winner !== null) return;

    soundEngine.playCardFlip?.();
    let d = [...deck];
    if (d.length === 0) d = buildDeck();

    const drawn = d.pop();
    setDeck(d);

    setHands(prev => {
      const next = [...prev];
      next[playerIdx] = [...next[playerIdx], drawn];
      return next;
    });

    setLog(`بازیکن ${playerIdx === 0 ? 'شما' : playerIdx + 1} یک کارت کشید.`);
    setCurrentTurn((currentTurn + direction + playerCount) % playerCount);
  };

  const drawCardsForPlayer = (targetPlayer, count) => {
    let d = [...deck];
    const drawnCards = [];
    for (let i = 0; i < count; i++) {
      if (d.length === 0) d = buildDeck();
      drawnCards.push(d.pop());
    }
    setDeck(d);
    setHands(prev => {
      const next = [...prev];
      next[targetPlayer] = [...next[targetPlayer], ...drawnCards];
      return next;
    });
  };

  // Bot AI Automation
  useEffect(() => {
    if (winner !== null || chooseColorModal) return;

    if (gameMode === 'bot' && currentTurn !== 0) {
      const timer = setTimeout(() => {
        const botHand = hands[currentTurn];
        const playableCard = botHand.find(isPlayable);

        if (playableCard) {
          playCard(playableCard, currentTurn);
        } else {
          drawCard(currentTurn);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameMode, winner, chooseColorModal, hands, topCard, activeColor]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a052e] via-[#10031d] to-[#08010f] text-white p-4 flex flex-col items-center justify-between font-sans select-none">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-2">
        <button
          onClick={() => navigate('/games')}
          className="p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">🃏🌈</span>
          <h1 className="text-lg font-black text-amber-300">اوچو رویال (Uno)</h1>
        </div>

        <button
          onClick={() => startNewGame()}
          className="p-2 rounded-2xl bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Opponents Area */}
      <div className="w-full max-w-md flex justify-around items-center my-2">
        {Array.from({ length: playerCount - 1 }, (_, i) => {
          const pIdx = i + 1;
          const isTurn = currentTurn === pIdx;
          return (
            <div
              key={pIdx}
              className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${isTurn ? 'bg-amber-500/20 border border-amber-400 scale-105 shadow-lg' : 'bg-white/5 border border-white/10'}`}
            >
              <div className="text-sm font-black text-amber-300">
                {gameMode === 'bot' ? `ربات ${pIdx} 🤖` : `بازیکن ${pIdx + 1}`}
              </div>
              <div className="text-xs text-slate-400 font-bold">
                🃏 {hands[pIdx]?.length || 0} کارت
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Discard & Deck Pile */}
      <div className="w-full max-w-md flex items-center justify-center gap-6 my-4">
        {/* Draw Deck */}
        <button
          onClick={() => drawCard(currentTurn)}
          disabled={gameMode === 'bot' && currentTurn !== 0}
          className="w-20 h-28 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-950 border-2 border-indigo-400 shadow-2xl flex flex-col items-center justify-center active:scale-95 transition-all"
        >
          <span className="text-2xl">🃏</span>
          <span className="text-[11px] font-black text-indigo-300 mt-1">بکش</span>
        </button>

        {/* Top Active Card */}
        {topCard && (
          <div className="flex flex-col items-center gap-2">
            <motion.div
              key={topCard.id}
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className={`w-24 h-36 rounded-2xl border-4 shadow-2xl flex flex-col items-center justify-between p-2 ${COLOR_CLASSES[topCard.color] || COLOR_CLASSES.wild}`}
            >
              <span className="text-sm font-black self-start">{topCard.value}</span>
              <span className="text-3xl font-black">{topCard.value}</span>
              <span className="text-sm font-black self-end">{topCard.value}</span>
            </motion.div>
            <div className="text-[11px] font-black text-amber-300">
              رنگ فعال: {activeColor === 'red' ? '🔴 قرمز' : activeColor === 'blue' ? '🔵 آبی' : activeColor === 'green' ? '🟢 سبز' : '🟡 زرد'}
            </div>
          </div>
        )}
      </div>

      {/* Log */}
      <div className="w-full max-w-md p-2 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center text-xs text-amber-200 font-medium">
        {log}
      </div>

      {/* Player Hand */}
      <div className="w-full max-w-md mt-2">
        <div className="text-xs font-black text-slate-300 mb-2 flex justify-between items-center px-1">
          <span>دست شما ({hands[0]?.length || 0} کارت):</span>
          {currentTurn === 0 && <span className="text-amber-400 font-black animate-pulse">👉 نوبت شماست!</span>}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none">
          {hands[0]?.map((card) => {
            const playable = isPlayable(card) && currentTurn === 0;
            return (
              <motion.button
                key={card.id}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => playCard(card, 0)}
                disabled={!playable}
                className={`flex-shrink-0 w-16 h-24 rounded-xl border-2 shadow-lg flex flex-col items-center justify-between p-1.5 transition-all ${COLOR_CLASSES[card.color] || COLOR_CLASSES.wild} ${playable ? 'opacity-100 ring-2 ring-white shadow-amber-500/40' : 'opacity-40 grayscale-[40%]'}`}
              >
                <span className="text-xs font-black self-start">{card.value}</span>
                <span className="text-xl font-black">{card.value}</span>
                <span className="text-xs font-black self-end">{card.value}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Wild Color Selection Modal */}
      {chooseColorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xs rounded-3xl bg-slate-950 border-2 border-purple-500 p-6 text-center shadow-2xl">
            <h3 className="text-lg font-black text-white mb-4">یک رنگ را انتخاب کنید:</h3>
            <div className="grid grid-cols-2 gap-3">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setActiveColor(c);
                    setChooseColorModal(false);
                    handleSpecialCardAction(topCard, 0);
                  }}
                  className={`py-3 rounded-2xl font-black text-sm ${COLOR_CLASSES[c]} shadow-lg active:scale-95`}
                >
                  {c === 'red' ? 'قرمز' : c === 'blue' ? 'آبی' : c === 'green' ? 'سبز' : 'زرد'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1a0b2e] to-[#0a0312] border-2 border-amber-400 p-6 text-center shadow-2xl">
            <Trophy className="text-amber-400 mx-auto mb-3" size={48} />
            <h2 className="text-2xl font-black text-white mb-2">
              🎉 {winner === 0 ? 'شما برنده اوچو شدید!' : `بازیکن ${winner + 1} برنده شد!`}
            </h2>
            <p className="text-sm text-slate-300 mb-6">
              {winner === 0 ? '+۱۲۰ سکه جایزه قهرمانی به کیف پول شما اضافه شد! 🪙' : 'بازی تمام شد. دوباره تلاش کنید!'}
            </p>
            <button
              onClick={() => startNewGame()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-base shadow-lg"
            >
              🔄 بازی مجدد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
