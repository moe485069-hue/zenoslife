import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Trophy, Star, Zap } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';

// ── Deck Builder ──────────────────────────────────────────
const SUITS = [
  { id: 'hearts',   fa: '\u062f\u0644',  symbol: '\u2665', color: 'text-red-500' },
  { id: 'diamonds', fa: '\u062e\u0634\u062a', symbol: '\u2666', color: 'text-red-400' },
  { id: 'clubs',    fa: '\u06af\u0631\u0634', symbol: '\u2663', color: 'text-slate-200' },
  { id: 'spades',   fa: '\u067e\u06cc\u06a9', symbol: '\u2660', color: 'text-slate-200' },
];

const RANK_NAMES = { 1:'A', 11:'J', 12:'Q', 13:'K' };

function buildDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (let v = 1; v <= 13; v++) {
      deck.push({ id: suit.id + v, suit: suit.id, value: v, suitFa: suit.fa, symbol: suit.symbol, color: suit.color });
    }
  }
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

// ── Card Component ────────────────────────────────────────
function Card({ card, selected, onClick, faceDown, small, highlight }) {
  if (!card) return null;
  const rankLabel = RANK_NAMES[card.value] || String(card.value);
  const base = small ? 'w-10 h-14' : 'w-14 h-20';

  if (faceDown) {
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`${base} rounded-xl bg-gradient-to-br from-indigo-800 to-indigo-950 border-2 border-indigo-600/50 shadow-lg flex items-center justify-center cursor-default select-none`}
      >
        <span className="text-indigo-400 text-xl">🂠</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${base} rounded-xl bg-white border-2 shadow-lg flex flex-col justify-between p-1 cursor-pointer select-none transition-all ${
        selected ? 'border-amber-400 ring-2 ring-amber-400 shadow-amber-400/40 -translate-y-2' :
        highlight ? 'border-green-400 ring-2 ring-green-400 shadow-green-400/30 animate-pulse' :
        'border-slate-200 hover:border-slate-400'
      }`}
    >
      <div className={`text-[11px] font-black leading-none ${card.color}`}>{rankLabel}</div>
      <div className={`text-center text-lg leading-none ${card.color}`}>{card.symbol}</div>
      <div className={`text-[11px] font-black leading-none self-end rotate-180 ${card.color}`}>{rankLabel}</div>
    </motion.div>
  );
}

// ── Score Calculator ──────────────────────────────────────
function calcScores(playerPile, botPile, playerSweeps, botSweeps) {
  const playerScore = { total: 0, cards: 0, spades: 0, jackClubs: 0, tenDiamonds: 0, sweeps: playerSweeps };
  const botScore    = { total: 0, cards: 0, spades: 0, jackClubs: 0, tenDiamonds: 0, sweeps: botSweeps };

  playerScore.cards = playerPile.length;
  botScore.cards = botPile.length;

  for (const c of playerPile) {
    if (c.suit === 'spades') playerScore.spades++;
    if (c.suit === 'clubs' && c.value === 11) playerScore.jackClubs = 2;
    if (c.suit === 'diamonds' && c.value === 10) playerScore.tenDiamonds = 3;
  }
  for (const c of botPile) {
    if (c.suit === 'spades') botScore.spades++;
    if (c.suit === 'clubs' && c.value === 11) botScore.jackClubs = 2;
    if (c.suit === 'diamonds' && c.value === 10) botScore.tenDiamonds = 3;
  }

  if (playerScore.cards > botScore.cards) playerScore.total += 3;
  else if (botScore.cards > playerScore.cards) botScore.total += 3;

  if (playerScore.spades > botScore.spades) playerScore.total += 2;
  else if (botScore.spades > playerScore.spades) botScore.total += 2;

  playerScore.total += playerScore.jackClubs + playerScore.tenDiamonds + playerScore.sweeps;
  botScore.total    += botScore.jackClubs + botScore.tenDiamonds + botScore.sweeps;

  return { playerScore, botScore };
}

// ── Main Game ─────────────────────────────────────────────
export default function Pasur() {
  const navigate = useNavigate();
  const { language } = useAppStore();

  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [botHand, setBotHand] = useState([]);
  const [tableCards, setTableCards] = useState([]);
  const [playerPile, setPlayerPile] = useState([]);
  const [botPile, setBotPile] = useState([]);
  const [playerSweeps, setPlayerSweeps] = useState(0);
  const [botSweeps, setBotSweeps] = useState(0);
  const [selectedHandCard, setSelectedHandCard] = useState(null);
  const [selectedTableCards, setSelectedTableCards] = useState([]);
  const [turn, setTurn] = useState('player'); // 'player' | 'bot'
  const [message, setMessage] = useState('\u06a9\u0627\u0631\u062a\u06cc \u0627\u0632 \u062f\u0633\u062a\u062a \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f');
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState(null);
  const [lastCaptor, setLastCaptor] = useState(null);
  const [botThinking, setBotThinking] = useState(false);
  const [sweepFlash, setSweepFlash] = useState(false);

  const initGame = useCallback(() => {
    const d = shuffle(buildDeck());
    const ph = d.slice(0, 4);
    const bh = d.slice(4, 8);
    const tc = d.slice(8, 12);
    setDeck(d.slice(12));
    setPlayerHand(ph);
    setBotHand(bh);
    setTableCards(tc);
    setPlayerPile([]);
    setBotPile([]);
    setPlayerSweeps(0);
    setBotSweeps(0);
    setSelectedHandCard(null);
    setSelectedTableCards([]);
    setTurn('player');
    setGameOver(false);
    setScores(null);
    setLastCaptor(null);
    setMessage('\u0646\u0648\u0628\u062a \u0634\u0645\u0627\u0633\u062a! \u06a9\u0627\u0631\u062a\u06cc \u0627\u0632 \u062f\u0633\u062a \u0627\u0646\u062a\u062e\u0627\u0628 \u06a9\u0646\u06cc\u062f');
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  // Bot turn
  useEffect(() => {
    if (turn !== 'bot' || gameOver || botHand.length === 0) return;
    setBotThinking(true);
    const timer = setTimeout(() => {
      makeBotMove();
      setBotThinking(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [turn, gameOver]);

  function dealNewHands(currentDeck) {
    if (currentDeck.length === 0) return { newPlayerHand: [], newBotHand: [], remaining: [] };
    const ph = currentDeck.slice(0, 4);
    const bh = currentDeck.slice(4, 8);
    return { newPlayerHand: ph, newBotHand: bh, remaining: currentDeck.slice(8) };
  }

  function endTurn(nextTurn, newPlayerHand, newBotHand, newDeck, newTableCards) {
    // If hands empty, deal or end game
    if (newPlayerHand.length === 0 && newBotHand.length === 0) {
      if (newDeck.length === 0) {
        endGame(newTableCards, nextTurn === 'player' ? botPile : playerPile, nextTurn);
        return;
      }
      const dealt = dealNewHands(newDeck);
      setPlayerHand(dealt.newPlayerHand);
      setBotHand(dealt.newBotHand);
      setDeck(dealt.remaining);
    } else {
      setPlayerHand(newPlayerHand);
      setBotHand(newBotHand);
      setDeck(newDeck);
    }
    setTableCards(newTableCards);
    setTurn(nextTurn);
  }

  function endGame(remainingTable, lastPile, lastTurnOwner) {
    // Last capturer takes remaining table cards
    const extra = remainingTable;
    let finalPlayerPile = [...playerPile];
    let finalBotPile = [...botPile];
    if (lastCaptor === 'player') finalPlayerPile = [...finalPlayerPile, ...extra];
    else finalBotPile = [...finalBotPile, ...extra];

    const s = calcScores(finalPlayerPile, finalBotPile, playerSweeps, botSweeps);
    setScores(s);
    setGameOver(true);
    setTableCards([]);
    setMessage('\u0628\u0627\u0632\u06cc \u062a\u0645\u0627\u0645 \u0634\u062f!');
    soundEngine.playLevelUp?.();
  }

  function getCapturableSets(handCard, table) {
    // Returns arrays of table card combos whose values sum to handCard.value
    const results = [];
    const n = table.length;
    for (let mask = 1; mask < (1 << n); mask++) {
      const combo = [];
      let sum = 0;
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) { combo.push(table[i]); sum += table[i].value; }
      }
      if (sum === handCard.value) results.push(combo);
    }
    return results;
  }

  function handleHandCardClick(card) {
    if (turn !== 'player' || botThinking) return;
    if (selectedHandCard?.id === card.id) {
      setSelectedHandCard(null);
      setSelectedTableCards([]);
    } else {
      setSelectedHandCard(card);
      setSelectedTableCards([]);
    }
  }

  function handleTableCardClick(card) {
    if (turn !== 'player' || !selectedHandCard || botThinking) return;
    const already = selectedTableCards.find(c => c.id === card.id);
    if (already) {
      setSelectedTableCards(prev => prev.filter(c => c.id !== card.id));
    } else {
      setSelectedTableCards(prev => [...prev, card]);
    }
  }

  function handleCapture() {
    if (!selectedHandCard || selectedTableCards.length === 0) return;
    const sum = selectedTableCards.reduce((a, c) => a + c.value, 0);
    if (sum !== selectedHandCard.value) {
      setMessage('\u062c\u0645\u0639 \u0627\u062f\u062f \u06a9\u0627\u0631\u062a\u200c\u0647\u0627 \u0628\u0627 \u06a9\u0627\u0631\u062a \u0634\u0645\u0627 \u0628\u0631\u0627\u0628\u0631 \u0646\u06cc\u0633\u062a!');
      return;
    }
    const captured = [selectedHandCard, ...selectedTableCards];
    const newTable = tableCards.filter(c => !selectedTableCards.find(s => s.id === c.id));
    const newPlayerPile = [...playerPile, ...captured];
    const newPlayerHand = playerHand.filter(c => c.id !== selectedHandCard.id);
    let sweeps = playerSweeps;
    if (newTable.length === 0) {
      sweeps += 1;
      setPlayerSweeps(sweeps);
      setSweepFlash(true);
      setTimeout(() => setSweepFlash(false), 1000);
      setMessage('\u067e\u0627\u0633\u062a\u0648\u0631! \u0645\u06cc\u0632 \u0631\u0627 \u062e\u0627\u0644\u06cc \u06a9\u0631\u062f\u06cc! +1 \u0627\u0645\u062a\u06cc\u0627\u0632 \u0627\u0636\u0627\u0641\u0647 \u0634\u062f \u2728');
    } else {
      setMessage('\u06af\u0631\u0641\u062a\u06cc! \u0646\u0648\u0628\u062a \u0631\u0628\u0627\u062a...');
    }
    setPlayerPile(newPlayerPile);
    setSelectedHandCard(null);
    setSelectedTableCards([]);
    setLastCaptor('player');
    soundEngine.playCheckmark?.();
    endTurn('bot', newPlayerHand, botHand, deck, newTable);
  }

  function handleThrow() {
    if (!selectedHandCard) return;
    const newTable = [...tableCards, selectedHandCard];
    const newPlayerHand = playerHand.filter(c => c.id !== selectedHandCard.id);
    setSelectedHandCard(null);
    setSelectedTableCards([]);
    setMessage('\u06a9\u0627\u0631\u062a \u0631\u0648\u06cc \u0645\u06cc\u0632 \u06af\u0630\u0627\u0634\u062a\u0647 \u0634\u062f');
    endTurn('bot', newPlayerHand, botHand, deck, newTable);
  }

  function makeBotMove() {
    if (botHand.length === 0) return;
    // Try to capture - prefer sweeps, then multi-card captures
    let bestCard = null;
    let bestCombo = null;
    let isSweep = false;

    for (const card of botHand) {
      const combos = getCapturableSets(card, tableCards);
      for (const combo of combos) {
        const newTable = tableCards.filter(c => !combo.find(x => x.id === c.id));
        if (newTable.length === 0) { bestCard = card; bestCombo = combo; isSweep = true; break; }
        if (!bestCard || combo.length > (bestCombo?.length || 0)) { bestCard = card; bestCombo = combo; }
      }
      if (isSweep) break;
    }

    if (bestCard && bestCombo) {
      const captured = [bestCard, ...bestCombo];
      const newTable = tableCards.filter(c => !bestCombo.find(x => x.id === c.id));
      const newBotPile = [...botPile, ...captured];
      const newBotHand = botHand.filter(c => c.id !== bestCard.id);
      let sweeps = botSweeps;
      if (newTable.length === 0) { sweeps += 1; setBotSweeps(sweeps); setMessage('\u0631\u0628\u0627\u062a \u067e\u0627\u0633\u062a\u0648\u0631 \u0632\u062f! \u0645\u06cc\u0632 \u062e\u0627\u0644\u06cc \u0634\u062f \u0631\u0628\u0627\u062a \u062f\u0627\u0631\u062f +1 \u0627\u0645\u062a\u06cc\u0627\u0632'); }
      else setMessage('\u0631\u0628\u0627\u062a \u06a9\u0627\u0631\u062a \u06af\u0631\u0641\u062a. \u0646\u0648\u0628\u062a \u0634\u0645\u0627!');
      setBotPile(newBotPile);
      setLastCaptor('bot');
      soundEngine.playTap?.();
      endTurn('player', playerHand, newBotHand, deck, newTable);
    } else {
      // Throw random card
      const throwCard = botHand[Math.floor(Math.random() * botHand.length)];
      const newTable = [...tableCards, throwCard];
      const newBotHand = botHand.filter(c => c.id !== throwCard.id);
      setMessage('\u0631\u0628\u0627\u062a \u06a9\u0627\u0631\u062a \u06af\u0630\u0627\u0634\u062a. \u0646\u0648\u0628\u062a \u0634\u0645\u0627!');
      endTurn('player', playerHand, newBotHand, deck, newTable);
    }
  }

  const capturableNow = selectedHandCard ? getCapturableSets(selectedHandCard, tableCards) : [];
  const selectedSum = selectedTableCards.reduce((a, c) => a + c.value, 0);
  const canCapture = selectedHandCard && selectedTableCards.length > 0 && selectedSum === selectedHandCard.value;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d2137] to-[#091520] text-white pb-24 select-none" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button onClick={() => navigate('/games')} className="p-2 rounded-xl bg-white/10 text-slate-300 active:scale-95">
          <ChevronLeft size={20} className="rotate-180" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-black text-amber-300">🃏 پاستور فارسی</h1>
          <p className="text-[10px] text-slate-400">{deck.length} کارت در دسته</p>
        </div>
        <button onClick={initGame} className="p-2 rounded-xl bg-white/10 text-slate-300 active:scale-95">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Score Bar */}
      <div className="mx-4 p-3 rounded-2xl bg-black/30 border border-white/10 flex justify-around text-center mb-3">
        <div>
          <p className="text-[10px] text-slate-400">شما</p>
          <p className="text-lg font-black text-amber-300">{playerPile.length}</p>
          <p className="text-[9px] text-slate-500">کارت جمع شده</p>
          {playerSweeps > 0 && <p className="text-[9px] text-yellow-400">✨ {playerSweeps} پاستور</p>}
        </div>
        <div className="border-x border-white/10 px-4">
          <p className="text-[10px] text-slate-400 mt-1">{deck.length} کارت مانده</p>
          <div className="mt-1 w-2 h-2 rounded-full mx-auto bg-green-500 animate-pulse" style={{ opacity: turn === 'player' ? 1 : 0.3 }} />
          <p className="text-[9px] text-slate-500 mt-1">{turn === 'player' ? '🟢 نوبت شما' : '🤖 نوبت ربات'}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">ربات</p>
          <p className="text-lg font-black text-cyan-300">{botPile.length}</p>
          <p className="text-[9px] text-slate-500">کارت جمع شده</p>
          {botSweeps > 0 && <p className="text-[9px] text-cyan-400">✨ {botSweeps} پاستور</p>}
        </div>
      </div>

      {/* Sweep Flash */}
      <AnimatePresence>
        {sweepFlash && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="px-8 py-4 rounded-3xl bg-amber-500/90 text-slate-900 text-2xl font-black shadow-2xl">
              ✨ پاستور! +1
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message */}
      <div className="mx-4 mb-3 py-2 px-3 rounded-xl bg-indigo-900/30 border border-indigo-500/30 text-center text-xs font-bold text-indigo-200">
        {botThinking ? '🤖 ربات در حال فکر کردن است...' : message}
      </div>

      {/* Table Cards */}
      <div className="mx-4 mb-4">
        <p className="text-[10px] text-slate-400 font-bold mb-2">کارت‌های روی میز ({tableCards.length})</p>
        <div className="min-h-[88px] p-3 rounded-2xl bg-green-950/30 border-2 border-green-700/40 flex flex-wrap gap-2 items-center justify-center">
          {tableCards.length === 0 && <span className="text-slate-500 text-xs">میز خالی است</span>}
          {tableCards.map(card => {
            const isSelected = selectedTableCards.find(c => c.id === card.id);
            const isCapturableBySelected = selectedHandCard && capturableNow.some(combo => combo.find(c => c.id === card.id));
            return (
              <Card
                key={card.id}
                card={card}
                selected={!!isSelected}
                highlight={!!isCapturableBySelected && !isSelected}
                onClick={() => handleTableCardClick(card)}
              />
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      {turn === 'player' && selectedHandCard && (
        <div className="mx-4 flex gap-2 mb-3">
          <button
            onClick={handleCapture}
            disabled={!canCapture}
            className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-black text-xs disabled:opacity-35 active:scale-95 transition-all"
          >
            ✅ گرفتن کارت‌های انتخابی ({selectedSum}/{selectedHandCard?.value})
          </button>
          <button
            onClick={handleThrow}
            className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-slate-300 font-bold text-xs active:scale-95"
          >
            انداختن
          </button>
        </div>
      )}

      {/* Player Hand */}
      <div className="mx-4">
        <p className="text-[10px] text-slate-400 font-bold mb-2">دست شما ({playerHand.length} کارت)</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {playerHand.map(card => (
            <Card
              key={card.id}
              card={card}
              selected={selectedHandCard?.id === card.id}
              onClick={() => handleHandCardClick(card)}
            />
          ))}
        </div>
      </div>

      {/* Bot Hand (face down) */}
      <div className="mx-4 mt-4">
        <p className="text-[10px] text-slate-400 font-bold mb-2">دست ربات ({botHand.length} کارت)</p>
        <div className="flex gap-2 justify-center flex-wrap">
          {botHand.map(card => (
            <Card key={card.id} card={card} faceDown small />
          ))}
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {gameOver && scores && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-500/50 p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="text-4xl">{scores.playerScore.total > scores.botScore.total ? '🏆' : scores.playerScore.total === scores.botScore.total ? '🤝' : '🤖'}</div>
              <h3 className="text-xl font-black text-amber-300">
                {scores.playerScore.total > scores.botScore.total ? 'برنده شدید! 🎉' : scores.playerScore.total === scores.botScore.total ? 'مساوی! 🤝' : 'ربات برد! 🤖'}
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-2xl bg-amber-900/30 border border-amber-500/30">
                  <p className="text-amber-300 font-black text-lg">{scores.playerScore.total}</p>
                  <p className="text-amber-400/70 text-xs">امتیاز شما</p>
                  <div className="text-[10px] text-slate-400 mt-1 space-y-0.5 text-right">
                    {scores.playerScore.cards > scores.botScore.cards && <p>🃏 بیشترین کارت: +3</p>}
                    {scores.playerScore.spades > scores.botScore.spades && <p>♠ بیشترین پیک: +2</p>}
                    {scores.playerScore.jackClubs > 0 && <p>♣ جک گرش: +2</p>}
                    {scores.playerScore.tenDiamonds > 0 && <p>♦ دهی خشت: +3</p>}
                    {scores.playerScore.sweeps > 0 && <p>✨ پاستور: +{scores.playerScore.sweeps}</p>}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-cyan-900/30 border border-cyan-500/30">
                  <p className="text-cyan-300 font-black text-lg">{scores.botScore.total}</p>
                  <p className="text-cyan-400/70 text-xs">امتیاز ربات</p>
                  <div className="text-[10px] text-slate-400 mt-1 space-y-0.5 text-right">
                    {scores.botScore.cards > scores.playerScore.cards && <p>🃏 بیشترین کارت: +3</p>}
                    {scores.botScore.spades > scores.playerScore.spades && <p>♠ بیشترین پیک: +2</p>}
                    {scores.botScore.jackClubs > 0 && <p>♣ جک گرش: +2</p>}
                    {scores.botScore.tenDiamonds > 0 && <p>♦ دهی خشت: +3</p>}
                    {scores.botScore.sweeps > 0 && <p>✨ پاستور: +{scores.botScore.sweeps}</p>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={initGame} className="flex-1 py-3 rounded-2xl bg-amber-500 text-slate-900 font-black text-sm active:scale-95">
                  🔄 بازی مجدد
                </button>
                <button onClick={() => navigate('/games')} className="py-3 px-4 rounded-2xl bg-white/10 text-white font-bold text-xs">
                  خروج
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
