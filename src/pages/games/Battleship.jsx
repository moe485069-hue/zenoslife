import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Trophy, Settings, Users, Bot, Zap, Target, Shield, Sparkles, RefreshCw, Crosshair } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import GameMatchSetupModal from '../../components/games/GameMatchSetupModal';

const GRID_SIZE = 7;
const SHIPS_CONFIG = [
  { id: 'carrier', nameFa: 'ناوهواپیمابر', nameEn: 'Carrier', size: 4, icon: '🛸' },
  { id: 'cruiser', nameFa: 'رزم‌ناو کیهانی', nameEn: 'Cruiser', size: 3, icon: '🚀' },
  { id: 'destroyer', nameFa: 'ناوچه موشک‌انداز', nameEn: 'Destroyer', size: 2, icon: '🛰️' },
  { id: 'scout', nameFa: 'پیشاهنگ رادار', nameEn: 'Scout', size: 1, icon: '📡' }
];

function createEmptyGrid() {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
}

export default function Battleship() {
  const { language, addXP, addCoins } = useAppStore();
  const isRtl = language === 'fa';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramMode = searchParams.get('mode') || 'bot';
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [gameMode, setGameMode] = useState(paramMode);
  const [botDifficulty, setBotDifficulty] = useState('medium');

  // Game state: 'deploy' | 'battle' | 'finished'
  const [phase, setPhase] = useState('deploy');
  const [playerGrid, setPlayerGrid] = useState(createEmptyGrid);
  const [botGrid, setBotGrid] = useState(createEmptyGrid);

  // Firing history: 'hit' | 'miss'
  const [playerShots, setPlayerShots] = useState(createEmptyGrid);
  const [botShots, setBotShots] = useState(createEmptyGrid);

  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [turn, setTurn] = useState('player'); // 'player' | 'bot'
  const [winner, setWinner] = useState(null);
  const [lastShotFeedback, setLastShotFeedback] = useState(null);

  // AI Target Queue for Smart Hunting
  const aiHuntQueueRef = useRef([]);

  // Auto-Deploy Player Fleet Helper
  const autoDeployFleet = () => {
    const grid = createEmptyGrid();
    for (const ship of SHIPS_CONFIG) {
      let placed = false;
      while (!placed) {
        const horizontal = Math.random() > 0.5;
        const r = Math.floor(Math.random() * (horizontal ? GRID_SIZE : GRID_SIZE - ship.size + 1));
        const c = Math.floor(Math.random() * (horizontal ? GRID_SIZE - ship.size + 1 : GRID_SIZE));

        let canPlace = true;
        for (let i = 0; i < ship.size; i++) {
          const checkR = horizontal ? r : r + i;
          const checkC = horizontal ? c + i : c;
          if (grid[checkR][checkC]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < ship.size; i++) {
            const placeR = horizontal ? r : r + i;
            const placeC = horizontal ? c + i : c;
            grid[placeR][placeC] = ship.id;
          }
          placed = true;
        }
      }
    }
    return grid;
  };

  const handleStartBattle = () => {
    // Generate Bot's secret fleet
    const bGrid = autoDeployFleet();
    setBotGrid(bGrid);
    setPhase('battle');
    setTurn('player');
    soundEngine.playLevelUp?.();
    haptics.success?.();
  };

  const handleAutoDeployPlayer = () => {
    const pGrid = autoDeployFleet();
    setPlayerGrid(pGrid);
    setCurrentShipIndex(SHIPS_CONFIG.length);
    soundEngine.playDiceRoll?.();
    haptics.tap?.();
  };

  const resetGame = () => {
    setPlayerGrid(createEmptyGrid());
    setBotGrid(createEmptyGrid());
    setPlayerShots(createEmptyGrid());
    setBotShots(createEmptyGrid());
    setPhase('deploy');
    setCurrentShipIndex(0);
    setWinner(null);
    setLastShotFeedback(null);
    aiHuntQueueRef.current = [];
    soundEngine.playCheckmark?.();
  };

  // Place ship manually on player's grid
  const handleDeployCellClick = (r, c) => {
    if (currentShipIndex >= SHIPS_CONFIG.length) return;
    const ship = SHIPS_CONFIG[currentShipIndex];

    if (isHorizontal && c + ship.size > GRID_SIZE) return;
    if (!isHorizontal && r + ship.size > GRID_SIZE) return;

    // Check overlap
    for (let i = 0; i < ship.size; i++) {
      const checkR = isHorizontal ? r : r + i;
      const checkC = isHorizontal ? c + i : c;
      if (playerGrid[checkR][checkC]) return;
    }

    const newGrid = playerGrid.map(row => [...row]);
    for (let i = 0; i < ship.size; i++) {
      const placeR = isHorizontal ? r : r + i;
      const placeC = isHorizontal ? c + i : c;
      newGrid[placeR][placeC] = ship.id;
    }

    setPlayerGrid(newGrid);
    setCurrentShipIndex(curr => curr + 1);
    soundEngine.playDiceRoll?.();
    haptics.tap?.();
  };

  // Player Fires at Bot's Grid
  const handleFireAtBot = (r, c) => {
    if (phase !== 'battle' || turn !== 'player' || playerShots[r][c] || winner) return;

    const isHit = Boolean(botGrid[r][c]);
    const newShots = playerShots.map(row => [...row]);
    newShots[r][c] = isHit ? 'hit' : 'miss';
    setPlayerShots(newShots);

    if (isHit) {
      soundEngine.playLevelUp?.();
      haptics.success?.();
      setLastShotFeedback(isRtl ? '🔥 اصابت موشک به ناو حریف!' : '🔥 Direct Hit on Enemy Ship!');
      
      // Check if all bot ships are destroyed
      let totalHits = 0;
      for (let ro = 0; ro < GRID_SIZE; ro++) {
        for (let co = 0; co < GRID_SIZE; co++) {
          if (newShots[ro][co] === 'hit') totalHits++;
        }
      }
      const totalShipCells = SHIPS_CONFIG.reduce((acc, s) => acc + s.size, 0);
      if (totalHits >= totalShipCells) {
        setWinner('player');
        setPhase('finished');
        addXP?.(45, 'پیروزی در جنگ دریایی کیهانی');
        addCoins?.(25);
        return;
      }
    } else {
      soundEngine.playTap?.();
      haptics.tap?.();
      setLastShotFeedback(isRtl ? '💧 شلیک به آب / فضا بدون اصابت' : '💧 Miss!');
    }

    setTurn('bot');
  };

  // Bot AI Fire Turn
  useEffect(() => {
    if (phase === 'battle' && turn === 'bot' && !winner) {
      const timer = setTimeout(() => {
        makeBotShot();
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [phase, turn, winner, botShots]);

  const makeBotShot = () => {
    let targetR, targetC;

    // Use smart hunt queue if available
    if (botDifficulty !== 'easy' && aiHuntQueueRef.current.length > 0) {
      const nextTarget = aiHuntQueueRef.current.shift();
      targetR = nextTarget.r;
      targetC = nextTarget.c;
    } else {
      // Pick random available cell
      const available = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (!botShots[r][c]) available.push({ r, c });
        }
      }
      if (available.length === 0) return;
      const pick = available[Math.floor(Math.random() * available.length)];
      targetR = pick.r;
      targetC = pick.c;
    }

    const isHit = Boolean(playerGrid[targetR][targetC]);
    const newShots = botShots.map(row => [...row]);
    newShots[targetR][targetC] = isHit ? 'hit' : 'miss';
    setBotShots(newShots);

    if (isHit) {
      soundEngine.playTap?.();
      haptics.impact?.('heavy');

      // Add adjacent cells to hunt queue
      const neighbors = [
        { r: targetR - 1, c: targetC },
        { r: targetR + 1, c: targetC },
        { r: targetR, c: targetC - 1 },
        { r: targetR, c: targetC + 1 }
      ].filter(n => n.r >= 0 && n.r < GRID_SIZE && n.c >= 0 && n.c < GRID_SIZE && !botShots[n.r][n.c]);

      aiHuntQueueRef.current.push(...neighbors);

      // Check if all player ships are destroyed
      let totalHits = 0;
      for (let ro = 0; ro < GRID_SIZE; ro++) {
        for (let co = 0; co < GRID_SIZE; co++) {
          if (newShots[ro][co] === 'hit') totalHits++;
        }
      }
      const totalShipCells = SHIPS_CONFIG.reduce((acc, s) => acc + s.size, 0);
      if (totalHits >= totalShipCells) {
        setWinner('bot');
        setPhase('finished');
        return;
      }
    }

    setTurn('player');
  };

  const handleStartFromSetup = (config) => {
    setGameMode(config.mode);
    setBotDifficulty(config.botDifficulty || 'medium');
    resetGame();
    setIsSetupModalOpen(false);
  };

  return (
    <div className="w-full min-h-screen pb-28 relative overflow-hidden bg-[#050711] text-white select-none" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Space Radar Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-10 right-1/4 w-[350px] h-[350px] rounded-full bg-indigo-600 blur-[130px]" />
        <div className="absolute bottom-20 left-1/4 w-[350px] h-[350px] rounded-full bg-rose-600 blur-[130px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 pt-4 max-w-md mx-auto flex items-center justify-between">
        <button
          onClick={() => navigate('/games')}
          className="p-2 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white transition-colors active:scale-95 shadow-md"
        >
          <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black hover:bg-indigo-500/30 flex items-center gap-1 shadow-md active:scale-95"
          >
            <Settings size={13} />
            <span>{isRtl ? 'تنظیمات بازی' : 'Setup'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 px-4 pt-2 max-w-md mx-auto flex flex-col items-center">
        
        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-rose-400 flex items-center gap-2">
          <span>🚀</span>
          <span>{isRtl ? 'نبرد ناوها و جنگ کیهانی' : 'Cosmic Battleship'}</span>
        </h1>
        <span className="text-[11px] text-slate-400 font-bold mt-0.5">
          {phase === 'deploy' 
            ? (isRtl ? '📍 مرحله استقرار ناوگان در رادار' : '📍 Fleet Deployment Phase') 
            : (isRtl ? '🎯 رادار هدف‌گیری و شلیک موشک' : '🎯 Radar Combat Phase')}
        </span>

        {/* Status / Feedback Banner */}
        {lastShotFeedback && (
          <div className="my-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-indigo-400/40 text-xs font-black text-amber-300 shadow-md animate-pulse">
            {lastShotFeedback}
          </div>
        )}

        {/* 1. DEPLOYMENT PHASE */}
        {phase === 'deploy' && (
          <div className="w-full max-w-[340px] space-y-3 mt-3">
            
            {/* Deploy Controls Bar */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">{SHIPS_CONFIG[currentShipIndex]?.icon || '🛸'}</span>
                <div>
                  <h4 className="text-xs font-black text-white">
                    {currentShipIndex < SHIPS_CONFIG.length
                      ? (isRtl ? `جایگذاری: ${SHIPS_CONFIG[currentShipIndex].nameFa}` : `Place: ${SHIPS_CONFIG[currentShipIndex].nameEn}`)
                      : (isRtl ? 'آماده نبرد!' : 'Fleet Ready!')}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {currentShipIndex < SHIPS_CONFIG.length
                      ? (isRtl ? `طول: ${SHIPS_CONFIG[currentShipIndex].size} خانه` : `Length: ${SHIPS_CONFIG[currentShipIndex].size} cells`)
                      : (isRtl ? 'همه ناوها مستقر شدند' : 'All ships deployed')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsHorizontal(!isHorizontal)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black text-slate-200 flex items-center gap-1"
                  title={isRtl ? 'چرخش افقی/عمودی' : 'Rotate Ship'}
                >
                  <RefreshCw size={13} className={isHorizontal ? '' : 'rotate-90'} />
                  <span>{isHorizontal ? (isRtl ? 'افقی' : 'H') : (isRtl ? 'عمودی' : 'V')}</span>
                </button>

                <button
                  onClick={handleAutoDeployPlayer}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black"
                  title={isRtl ? 'چیدمان خودکار' : 'Auto Deploy'}
                >
                  {isRtl ? 'خودکار' : 'Auto'}
                </button>
              </div>
            </div>

            {/* Deployment Grid */}
            <div className="p-3 sm:p-4 rounded-3xl bg-slate-900/90 border-2 border-indigo-500/40 shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-7 gap-1.5">
                {playerGrid.map((row, r) =>
                  row.map((cell, c) => (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleDeployCellClick(r, c)}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base transition-all active:scale-95 ${
                        cell
                          ? 'bg-indigo-600/50 border-indigo-400 text-white shadow-md shadow-indigo-500/40'
                          : 'bg-black/50 border-white/10 hover:border-indigo-400/50 text-slate-500'
                      }`}
                    >
                      {cell ? '🚀' : ''}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Start Battle Button */}
            <button
              onClick={handleStartBattle}
              disabled={currentShipIndex < SHIPS_CONFIG.length}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-sky-600 to-rose-600 text-white font-black text-xs shadow-xl shadow-indigo-500/30 disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Crosshair size={16} />
              <span>{isRtl ? 'شروع نبرد راداری 🎯' : 'Start Radar Combat 🎯'}</span>
            </button>

          </div>
        )}

        {/* 2. COMBAT PHASE */}
        {phase === 'battle' && (
          <div className="w-full max-w-[340px] space-y-3 mt-2">
            
            {/* Turn Indicator */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-bold">{isRtl ? 'نوبت شلیک:' : 'Turn:'}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  turn === 'player' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {turn === 'player' ? (isRtl ? 'شما (رادار دشمن)' : 'Your Turn (Enemy Radar)') : (isRtl ? 'در حال محاسبه حریف...' : 'Enemy Calculating...')}
                </span>
              </div>
            </div>

            {/* Enemy Radar Target Grid */}
            <div className="p-3 sm:p-4 rounded-3xl bg-slate-900/90 border-2 border-sky-500/40 shadow-2xl backdrop-blur-xl relative">
              <div className="grid grid-cols-7 gap-1.5">
                {playerShots.map((row, r) =>
                  row.map((shot, c) => (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleFireAtBot(r, c)}
                      disabled={Boolean(shot) || turn !== 'player'}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg transition-all ${
                        shot === 'hit'
                          ? 'bg-rose-600/40 border-rose-400 text-rose-300 shadow-md shadow-rose-500/50 animate-pulse'
                          : shot === 'miss'
                          ? 'bg-slate-800/80 border-white/10 text-slate-500'
                          : 'bg-black/60 border-sky-500/20 hover:border-sky-400 hover:bg-sky-500/15 cursor-crosshair active:scale-95'
                      }`}
                    >
                      {shot === 'hit' ? '💥' : shot === 'miss' ? '•' : ''}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Mini Player Fleet Status (Own Grid Display) */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-emerald-400" />
                <span className="text-[11px] font-bold text-slate-300">{isRtl ? 'وضعیت ناوگان خودی:' : 'Your Fleet:'}</span>
              </div>
              <div className="flex items-center gap-1">
                {SHIPS_CONFIG.map(s => {
                  return (
                    <span key={s.id} className="text-xs p-1 rounded-md bg-black/40 border border-white/10">
                      {s.icon}
                    </span>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* 3. FINISHED PHASE (WIN / LOSE) */}
        {phase === 'finished' && (
          <div className="w-full max-w-[340px] p-6 rounded-3xl bg-slate-900/95 border-2 border-indigo-400/40 shadow-2xl text-center space-y-4 mt-6">
            <span className="text-5xl animate-bounce">{winner === 'player' ? '🏆' : '💥'}</span>
            <div>
              <h3 className="text-lg font-black text-amber-300">
                {winner === 'player'
                  ? (isRtl ? '🎉 پیروزی قاطع! ناوگان دشمن کاملاً نابود شد!' : '🎉 Victory! Enemy Fleet Destroyed!')
                  : (isRtl ? 'شکست! ناوگان خودی منهدم شد.' : 'Defeat! Your fleet was sunk.')}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {winner === 'player' ? (isRtl ? '+۴۵ تجربه و +۲۵ سکه طلایی پاداش گرفتید' : '+45 XP & +25 Coins Earned!') : ''}
              </p>
            </div>
            <button
              onClick={resetGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-rose-600 text-white font-black text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              <span>{isRtl ? 'نبرد دوباره 🔄' : 'Battle Again'}</span>
            </button>
          </div>
        )}

      </div>

      {/* Pre-Game Match Setup Modal */}
      <GameMatchSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        game={{
          id: 'battleship',
          titleFa: 'نبرد ناوها و جنگ کیهانی',
          titleEn: 'Cosmic Battleship',
          icon: '🚀',
          path: '/games/battleship'
        }}
        onStartGame={handleStartFromSetup}
      />

    </div>
  );
}
