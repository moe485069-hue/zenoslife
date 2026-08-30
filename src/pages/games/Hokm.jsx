import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Trophy, Crown, Sparkles, Swords, Volume2 } from 'lucide-react';
import useAppStore from '../../store/appStore';
import useMultiplayerStore from '../../store/multiplayerStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import InGameReactions from '../../components/games/InGameReactions';

// ── Card Definitions ──────────────────────────────────────
const SUITS = [
  { id: 'hearts', fa: 'دل', symbol: '♥', color: 'text-red-500', bg: 'bg-red-500/10' },
  { id: 'diamonds', fa: 'خشت', symbol: '♦', color: 'text-red-400', bg: 'bg-red-400/10' },
  { id: 'clubs', fa: 'گرش', symbol: '♣', color: 'text-slate-200', bg: 'bg-slate-500/10' },
  { id: 'spades', fa: 'پیک', symbol: '♠', color: 'text-slate-200', bg: 'bg-slate-500/10' },
];

const CARD_RANKS = [
  { val: 14, label: 'A' },
  { val: 13, label: 'K' },
  { val: 12, label: 'Q' },
  { val: 11, label: 'J' },
  { val: 10, label: '10' },
  { val: 9, label: '9' },
  { val: 8, label: '8' },
  { val: 7, label: '7' },
  { val: 6, label: '6' },
  { val: 5, label: '5' },
  { val: 4, label: '4' },
  { val: 3, label: '3' },
  { val: 2, label: '2' },
];

function buildFullDeck() {
  const deck = [];
  SUITS.forEach(s => {
    CARD_RANKS.forEach(r => {
      deck.push({
        id: s.id + '_' + r.val,
        suit: s.id,
        suitFa: s.fa,
        symbol: s.symbol,
        color: s.color,
        val: r.val,
        label: r.label
      });
    });
  });
  return deck;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PLAYERS_META = [
  { id: 0, name: 'شما', team: 1, avatar: '👤', pos: 'bottom' },
  { id: 1, name: 'آرش (حریف چپ)', team: 2, avatar: '🤖', pos: 'left' },
  { id: 2, name: 'سارا (یار شما)', team: 1, avatar: '🌸', pos: 'top' },
  { id: 3, name: 'کامران (حریف راست)', team: 2, avatar: '⚡', pos: 'right' },
];

export default function Hokm() {
  const navigate = useNavigate();
  const { coins, addCoins, spendCoins } = useAppStore();
  const { userName, userAvatar } = useMultiplayerStore();

  const [wager, setWager] = useState(50);
  const [gameState, setGameState] = useState('BET_SELECTION'); // 'BET_SELECTION' | 'HOKM_CHOICE' | 'PLAYING' | 'SET_FINISHED'
  
  const [hakemId, setHakemId] = useState(0);
  const [hokmSuit, setHokmSuit] = useState(null);
  
  const [hands, setHands] = useState([[], [], [], []]);
  const [currentTrick, setCurrentTrick] = useState([]);
  const [leadSuit, setLeadSuit] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(0);

  const [team1Tricks, setTeam1Tricks] = useState(0);
  const [team2Tricks, setTeam2Tricks] = useState(0);

  const [statusText, setStatusText] = useState('');
  const [winnerTeam, setWinnerTeam] = useState(null);

  // Start new round
  const startNewHand = useCallback((chosenHakem) => {
    const deck = shuffle(buildFullDeck());
    const h = chosenHakem !== undefined ? chosenHakem : hakemId;
    
    // Deal first 5 cards to everyone
    const pHands = [
      deck.slice(0, 5),
      deck.slice(5, 10),
      deck.slice(10, 15),
      deck.slice(15, 20)
    ];

    setHands(pHands);
    setHakemId(h);
    setCurrentTrick([]);
    setLeadSuit(null);
    setTeam1Tricks(0);
    setTeam2Tricks(0);

    if (h === 0) {
      setGameState('HOKM_CHOICE');
      setStatusText('شما حاکم شدید! با توجه به ۵ کارت اول، خال حکم را انتخاب کنید.');
      soundEngine.playLevelUp?.();
    } else {
      setGameState('HOKM_CHOICE');
      setStatusText(`${PLAYERS_META[h].name} حاکم شد و در حال انتخاب خال حکم است...`);
      setTimeout(() => {
        const bot5 = pHands[h];
        const suitCounts = {};
        bot5.forEach(c => { suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1; });
        const bestSuit = Object.keys(suitCounts).sort((a, b) => suitCounts[b] - suitCounts[a])[0] || 'hearts';
        applyHokm(bestSuit, deck);
      }, 1500);
    }
  }, [hakemId]);

  // Apply chosen Hokm and deal remaining 8 cards
  const applyHokm = (suit, currentDeck) => {
    const deck = currentDeck || shuffle(buildFullDeck());
    setHokmSuit(suit);
    const suitFa = SUITS.find(s => s.id === suit)?.fa;
    setStatusText(`خال حکم: ${suitFa} تعیین شد! در حال پخش ادامه کارت‌ها...`);
    soundEngine.playCheckmark?.();

    setTimeout(() => {
      const fullHands = [
        deck.slice(0, 13).sort((a, b) => a.suit.localeCompare(b.suit) || b.val - a.val),
        deck.slice(13, 26).sort((a, b) => a.suit.localeCompare(b.suit) || b.val - a.val),
        deck.slice(26, 39).sort((a, b) => a.suit.localeCompare(b.suit) || b.val - a.val),
        deck.slice(39, 52).sort((a, b) => a.suit.localeCompare(b.suit) || b.val - a.val)
      ];

      setHands(fullHands);
      setGameState('PLAYING');
      setCurrentTurn(hakemId);
      setStatusText(`بازی آغاز شد! نوبت حاکم (${PLAYERS_META[hakemId].name}) است.`);
    }, 1200);
  };

  // Start game with betting
  const handleStartWithBet = () => {
    if (wager > 0 && !spendCoins(wager)) {
      alert('موجودی سکه شما کافی نیست!');
      return;
    }
    soundEngine.playTap?.();
    haptics.impact?.();
    startNewHand(0);
  };

  // Play a card
  const handlePlayCard = (card) => {
    if (currentTurn !== 0 || gameState !== 'PLAYING') return;

    if (leadSuit) {
      const hasLeadSuit = hands[0].some(c => c.suit === leadSuit);
      if (hasLeadSuit && card.suit !== leadSuit) {
        setStatusText('باید از خال بازی شده بازی کنید!');
        soundEngine.playTap?.();
        return;
      }
    }

    executeCardPlay(0, card);
  };

  const executeCardPlay = (playerId, card) => {
    soundEngine.playTap?.();
    haptics.tap?.();

    setHands(prev => prev.map((hand, idx) => idx === playerId ? hand.filter(c => c.id !== card.id) : hand));

    const nextTrick = [...currentTrick, { playerId, card }];
    setCurrentTrick(nextTrick);

    if (!leadSuit) {
      setLeadSuit(card.suit);
    }

    if (nextTrick.length === 4) {
      setTimeout(() => {
        resolveTrick(nextTrick, card.suit);
      }, 1100);
    } else {
      const nextPlayer = (playerId + 1) % 4;
      setCurrentTurn(nextPlayer);
    }
  };

  // Resolve 4-card trick winner
  const resolveTrick = (trick) => {
    const lSuit = trick[0].card.suit;
    let winningPlay = trick[0];

    trick.forEach(play => {
      const currentWinCard = winningPlay.card;
      const thisCard = play.card;

      if (thisCard.suit === hokmSuit && currentWinCard.suit === hokmSuit) {
        if (thisCard.val > currentWinCard.val) winningPlay = play;
      }
      else if (thisCard.suit === hokmSuit && currentWinCard.suit !== hokmSuit) {
        winningPlay = play;
      }
      else if (thisCard.suit === lSuit && currentWinCard.suit === lSuit) {
        if (thisCard.val > currentWinCard.val) winningPlay = play;
      }
    });

    const winnerId = winningPlay.playerId;
    const isTeam1 = PLAYERS_META[winnerId].team === 1;

    soundEngine.playCheckmark?.();
    setStatusText(`دست را ${PLAYERS_META[winnerId].name} برد! 🎉`);

    let t1 = team1Tricks;
    let t2 = team2Tricks;

    if (isTeam1) {
      t1 += 1;
      setTeam1Tricks(t1);
    } else {
      t2 += 1;
      setTeam2Tricks(t2);
    }

    setCurrentTrick([]);
    setLeadSuit(null);

    if (t1 === 7 || t2 === 7) {
      const team1Won = t1 === 7;
      setWinnerTeam(team1Won ? 1 : 2);
      setGameState('SET_FINISHED');
      
      let kotBonus = 1;
      if (team1Won && t2 === 0) kotBonus = hakemId === 0 || hakemId === 2 ? 3 : 2;
      if (!team1Won && t1 === 0) kotBonus = hakemId === 1 || hakemId === 3 ? 3 : 2;

      if (team1Won) {
        soundEngine.playLevelUp?.();
        const winAmount = wager * 2 * kotBonus;
        addCoins(winAmount, 'Hokm Win');
        setStatusText(`تیم شما برنده ست شد! 🏆 دریافت ${winAmount} سکه`);
      } else {
        setStatusText('حریف برنده این ست شد! شانس بعدی 🤖');
      }
    } else {
      setCurrentTurn(winnerId);
    }
  };

  // Bot play logic
  useEffect(() => {
    if (gameState !== 'PLAYING' || currentTurn === 0) return;

    const timer = setTimeout(() => {
      const botHand = hands[currentTurn];
      if (!botHand || botHand.length === 0) return;

      let chosenCard = null;

      if (!leadSuit) {
        const aces = botHand.filter(c => c.val === 14 && c.suit !== hokmSuit);
        if (aces.length > 0) chosenCard = aces[0];
        else {
          const nonHokm = botHand.filter(c => c.suit !== hokmSuit);
          chosenCard = nonHokm.length > 0 ? nonHokm[0] : botHand[0];
        }
      } else {
        const matchingSuit = botHand.filter(c => c.suit === leadSuit);
        if (matchingSuit.length > 0) {
          chosenCard = matchingSuit[0];
        } else {
          const trumps = botHand.filter(c => c.suit === hokmSuit);
          if (trumps.length > 0) {
            chosenCard = trumps[trumps.length - 1];
          } else {
            chosenCard = botHand[botHand.length - 1];
          }
        }
      }

      executeCardPlay(currentTurn, chosenCard || botHand[0]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentTurn, gameState, leadSuit, hands, hokmSuit]);

  const hokmObj = SUITS.find(s => s.id === hokmSuit);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061811] via-[#09291d] to-[#04120c] text-white flex flex-col justify-between select-none relative overflow-hidden" dir="rtl">
      
      {/* Top Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/games')}
            className="p-2 rounded-2xl bg-white/10 text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <ChevronLeft size={20} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-base font-black text-amber-300 flex items-center gap-1.5">
              <span>👑</span> حکم ۴ نفره شاهانه
            </h1>
            <p className="text-[11px] text-slate-400">
              موجودی: <span className="text-yellow-400 font-bold">{coins} سکه</span>
            </p>
          </div>
        </div>

        {/* Hokm & Reaction Bar */}
        <div className="flex items-center gap-2">
          {hokmObj && (
            <div className="px-3 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center gap-1.5 shadow-lg shadow-amber-500/10">
              <span className="text-xs text-amber-300 font-bold">حکم:</span>
              <span className={`text-base ${hokmObj.color} font-black`}>{hokmObj.symbol} {hokmObj.fa}</span>
            </div>
          )}
          <InGameReactions />
        </div>
      </div>

      {/* Score Dashboard */}
      <div className="relative z-10 mx-4 mt-2 p-3 rounded-2xl bg-black/40 border border-white/10 flex justify-around items-center text-center shadow-lg">
        <div className="flex-1">
          <p className="text-xs text-emerald-300 font-black">ما (شما و سارا)</p>
          <p className="text-2xl font-black text-white">{team1Tricks} <span className="text-[10px] text-slate-400 font-normal">دست</span></p>
        </div>
        <div className="w-px h-8 bg-white/20" />
        <div className="flex-1">
          <p className="text-xs text-rose-300 font-black">آنها (آرش و کامران)</p>
          <p className="text-2xl font-black text-white">{team2Tricks} <span className="text-[10px] text-slate-400 font-normal">دست</span></p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="relative z-10 mx-4 my-1.5 py-1.5 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center text-xs font-bold text-emerald-200">
        {statusText}
      </div>

      {/* Main Table Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-between items-center py-2 px-4 max-w-lg mx-auto w-full">
        
        {/* Top Player (Partner: Sara) */}
        <div className="flex flex-col items-center">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-2xl border transition-all ${currentTurn === 2 ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-400/20 scale-105' : 'border-white/10 bg-black/30'}`}>
            <span className="text-xl">🌸</span>
            <span className="text-xs font-black text-white">سارا (یار شما)</span>
            <span className="text-[10px] text-slate-400 font-bold">({hands[2]?.length || 0})</span>
            {hakemId === 2 && <Crown size={12} className="text-yellow-400" />}
          </div>
        </div>

        {/* Middle Table Section (Opponents + Played Cards) */}
        <div className="w-full flex items-center justify-between my-auto">
          
          {/* Left Player (Opponent 1) */}
          <div className="flex flex-col items-center">
            <div className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${currentTurn === 1 ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-400/20 scale-105' : 'border-white/10 bg-black/30'}`}>
              <span className="text-xl">🤖</span>
              <span className="text-[11px] font-black text-white mt-0.5">آرش</span>
              <span className="text-[9px] text-slate-400 font-bold">({hands[1]?.length || 0})</span>
              {hakemId === 1 && <Crown size={12} className="text-yellow-400 mt-0.5" />}
            </div>
          </div>

          {/* Center Felt (Trick Cards) */}
          <div className="w-48 h-40 rounded-3xl bg-[#144a30] border-2 border-[#2f7d56] shadow-inner flex items-center justify-center relative">
            {currentTrick.length === 0 ? (
              <span className="text-emerald-300/40 text-xs font-bold">میز بازی</span>
            ) : (
              currentTrick.map((play) => {
                const p = PLAYERS_META[play.playerId];
                let posClasses = '';
                if (p.pos === 'bottom') posClasses = 'bottom-2 left-1/2 -translate-x-1/2';
                if (p.pos === 'top') posClasses = 'top-2 left-1/2 -translate-x-1/2';
                if (p.pos === 'left') posClasses = 'left-2 top-1/2 -translate-y-1/2';
                if (p.pos === 'right') posClasses = 'right-2 top-1/2 -translate-y-1/2';

                return (
                  <motion.div
                    key={play.card.id}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`absolute ${posClasses} w-11 h-16 rounded-xl bg-white border-2 border-slate-300 shadow-xl flex flex-col justify-between p-1 select-none`}
                  >
                    <span className={`text-[11px] font-black leading-none ${play.card.color}`}>{play.card.label}</span>
                    <span className={`text-center text-lg leading-none ${play.card.color}`}>{play.card.symbol}</span>
                    <span className={`text-[11px] font-black leading-none self-end rotate-180 ${play.card.color}`}>{play.card.label}</span>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Right Player (Opponent 2) */}
          <div className="flex flex-col items-center">
            <div className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${currentTurn === 3 ? 'border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-400/20 scale-105' : 'border-white/10 bg-black/30'}`}>
              <span className="text-xl">⚡</span>
              <span className="text-[11px] font-black text-white mt-0.5">کامران</span>
              <span className="text-[9px] text-slate-400 font-bold">({hands[3]?.length || 0})</span>
              {hakemId === 3 && <Crown size={12} className="text-yellow-400 mt-0.5" />}
            </div>
          </div>

        </div>

        {/* Bottom Player (You) Hand */}
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-black text-amber-300">دست شما ({hands[0]?.length || 0} کارت)</span>
            {hakemId === 0 && <Crown size={14} className="text-yellow-400" />}
            {currentTurn === 0 && gameState === 'PLAYING' && (
              <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-[9px] font-black animate-pulse">نوبت شما</span>
            )}
          </div>

          {/* Hand Cards Fan */}
          <div className="flex items-center justify-center gap-1 flex-wrap max-w-full pb-2">
            {hands[0]?.map(card => {
              const isLead = leadSuit && card.suit === leadSuit;
              return (
                <motion.button
                  key={card.id}
                  whileHover={{ y: -8, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePlayCard(card)}
                  disabled={currentTurn !== 0 || gameState !== 'PLAYING'}
                  className={`w-12 h-18 sm:w-13 sm:h-20 rounded-xl bg-white border-2 shadow-xl flex flex-col justify-between p-1 transition-all disabled:opacity-60 ${
                    isLead ? 'border-green-500 ring-2 ring-green-400 shadow-green-400/30' : 'border-slate-300'
                  }`}
                >
                  <span className={`text-xs font-black leading-none ${card.color}`}>{card.label}</span>
                  <span className={`text-center text-xl leading-none ${card.color}`}>{card.symbol}</span>
                  <span className={`text-xs font-black leading-none self-end rotate-180 ${card.color}`}>{card.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bet Selection Modal */}
      <AnimatePresence>
        {gameState === 'BET_SELECTION' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="text-5xl">👑</div>
              <h2 className="text-xl font-black text-amber-300">ورود به مسابقه حکم ۴ نفره</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                مبلغ شرط‌بندی روی بازی را مشخص کنید. برنده تمام سکه‌ها را به همراه پاداش دریافت می‌کند!
              </p>

              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 500].map(val => (
                  <button
                    key={val}
                    onClick={() => { setWager(val); soundEngine.playTap?.(); }}
                    className={`py-2.5 rounded-2xl border text-xs font-black transition-all active:scale-95 ${
                      wager === val
                        ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300 shadow-lg shadow-yellow-500/20'
                        : 'border-white/10 bg-white/5 text-slate-400'
                    }`}
                  >
                    {val} 🪙
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStartWithBet}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Crown size={18} /> شروع بازی با شرط {wager} سکه
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hokm Choice Modal */}
      <AnimatePresence>
        {gameState === 'HOKM_CHOICE' && hakemId === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-yellow-400/50 p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="text-4xl">👑</div>
              <h3 className="text-lg font-black text-amber-300">خال حکم را تعیین کنید!</h3>
              <p className="text-xs text-slate-300">بر اساس ۵ برگ ابتدایی دست خود، قوی‌ترین خال را انتخاب نمایید:</p>

              <div className="grid grid-cols-2 gap-3">
                {SUITS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => applyHokm(s.id)}
                    className={`p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/15 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg font-black ${s.color}`}
                  >
                    <span className="text-2xl">{s.symbol}</span>
                    <span>{s.fa}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Set Finished Modal */}
      <AnimatePresence>
        {gameState === 'SET_FINISHED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-400/50 p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="text-5xl">{winnerTeam === 1 ? '🏆' : '🤖'}</div>
              <h3 className="text-xl font-black text-amber-300">
                {winnerTeam === 1 ? 'تیم شما پیروز ست شد! 🎉' : 'تیم حریف برنده شد! 🤖'}
              </h3>
              <p className="text-xs text-slate-300">
                نتیجه نهایی: {team1Tricks} بر {team2Tricks}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => startNewHand(winnerTeam === 1 ? 0 : 1)}
                  className="flex-1 py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm active:scale-95"
                >
                  🔄 دست بعدی
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="py-3.5 px-5 rounded-2xl bg-white/10 text-white font-bold text-xs"
                >
                  خروج به آرکید
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
