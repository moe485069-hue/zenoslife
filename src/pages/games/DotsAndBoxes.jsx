import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Trophy, Settings, Users, Bot, Globe, Sparkles } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import GameMatchSetupModal from '../../components/games/GameMatchSetupModal';
import InGameChatDrawer from '../../components/games/InGameChatDrawer';

const GRID_SIZE = 4; // 4x4 dots = 3x3 boxes

export default function DotsAndBoxes() {
  const { language, addXP, addCoins } = useAppStore();
  const isRtl = language === 'fa';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramRoom = searchParams.get('room');
  const paramMode = searchParams.get('mode');

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(!paramRoom && !paramMode);
  const [gameMode, setGameMode] = useState(paramMode || 'bot'); // 'bot' | 'local' | 'online'
  const [botDifficulty, setBotDifficulty] = useState('medium');
  const [onlineRoomCode, setOnlineRoomCode] = useState(paramRoom || 'DOT-888');
  const [myOnlineRole, setMyOnlineRole] = useState(paramRoom ? 'blue' : 'emerald');

  // Lines state: H lines (ROWS x COLS-1), V lines (ROWS-1 x COLS)
  // hLines: 4 rows x 3 cols
  // vLines: 3 rows x 4 cols
  const [hLines, setHLines] = useState(() => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE - 1).fill(null)));
  const [vLines, setVLines] = useState(() => Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE).fill(null)));
  // Boxes: 3x3
  const [boxes, setBoxes] = useState(() => Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE - 1).fill(null)));

  const [currentTurn, setCurrentTurn] = useState('emerald'); // 'emerald' (P1) | 'blue' (P2/Bot)
  const [score, setScore] = useState({ emerald: 0, blue: 0 });
  const [gameOver, setGameOver] = useState(false);

  // Online Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: isRtl ? 'به نقطه خط کیهانی خوش آمدید!' : 'Welcome to Cosmic Dots & Boxes!', sender: 'system' }
  ]);
  const chatChannelRef = useRef(null);

  // Online Sync
  useEffect(() => {
    if (gameMode === 'online') {
      const channel = new BroadcastChannel(`lifeos_dots_${onlineRoomCode}`);
      chatChannelRef.current = channel;

      channel.onmessage = (e) => {
        const { type, payload } = e.data || {};
        if (type === 'CHAT') {
          setChatMessages(prev => [...prev, payload]);
          soundEngine.playTap?.();
        } else if (type === 'MOVE') {
          setHLines(payload.hLines);
          setVLines(payload.vLines);
          setBoxes(payload.boxes);
          setScore(payload.score);
          setCurrentTurn(payload.currentTurn);
          soundEngine.playDiceRoll?.();
        } else if (type === 'RESET') {
          resetGame();
        }
      };

      return () => channel.close();
    }
  }, [gameMode, onlineRoomCode]);

  // Check Game Over
  useEffect(() => {
    const totalBoxes = (GRID_SIZE - 1) * (GRID_SIZE - 1);
    const claimedCount = boxes.flat().filter(Boolean).length;

    if (claimedCount === totalBoxes && !gameOver) {
      setGameOver(true);
      soundEngine.playLevelUp?.();
      haptics.success?.();
      if (score.emerald > score.blue) {
        addXP?.(35, 'پیروزی در نقطه خط');
        addCoins?.(15);
      } else if (score.blue > score.emerald) {
        addXP?.(15, 'بازی نقطه خط');
      } else {
        addXP?.(10, 'مساوی در نقطه خط');
      }
    }
  }, [boxes, gameOver, score]);

  // Bot AI Turn
  useEffect(() => {
    if (gameMode === 'bot' && currentTurn === 'blue' && !gameOver) {
      const timer = setTimeout(() => {
        makeBotMove();
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, gameOver, gameMode, hLines, vLines, boxes]);

  const countBoxLines = (r, c, testH, testV) => {
    let count = 0;
    if (testH[r][c]) count++;
    if (testH[r + 1][c]) count++;
    if (testV[r][c]) count++;
    if (testV[r][c + 1]) count++;
    return count;
  };

  const makeBotMove = () => {
    const availableH = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE - 1; c++) {
        if (!hLines[r][c]) availableH.push({ type: 'H', r, c });
      }
    }

    const availableV = [];
    for (let r = 0; r < GRID_SIZE - 1; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!vLines[r][c]) availableV.push({ type: 'V', r, c });
      }
    }

    const allMoves = [...availableH, ...availableV];
    if (allMoves.length === 0) return;

    // 1. Check if any move completes a box (priority 1)
    for (const move of allMoves) {
      const testH = hLines.map(row => [...row]);
      const testV = vLines.map(row => [...row]);
      if (move.type === 'H') testH[move.r][move.c] = 'blue';
      else testV[move.r][move.c] = 'blue';

      // Check if it completes any box
      for (let r = 0; r < GRID_SIZE - 1; r++) {
        for (let c = 0; c < GRID_SIZE - 1; c++) {
          if (!boxes[r][c] && countBoxLines(r, c, testH, testV) === 4) {
            executeMove(move.type, move.r, move.c);
            return;
          }
        }
      }
    }

    // 2. Safe moves that don't give away a box (countBoxLines < 3)
    if (botDifficulty === 'master' || botDifficulty === 'medium') {
      const safeMoves = allMoves.filter(move => {
        const testH = hLines.map(row => [...row]);
        const testV = vLines.map(row => [...row]);
        if (move.type === 'H') testH[move.r][move.c] = 'blue';
        else testV[move.r][move.c] = 'blue';

        for (let r = 0; r < GRID_SIZE - 1; r++) {
          for (let c = 0; c < GRID_SIZE - 1; c++) {
            if (!boxes[r][c] && countBoxLines(r, c, testH, testV) === 3) {
              return false; // gives opponent a box
            }
          }
        }
        return true;
      });

      if (safeMoves.length > 0) {
        const pick = safeMoves[Math.floor(Math.random() * safeMoves.length)];
        executeMove(pick.type, pick.r, pick.c);
        return;
      }
    }

    // Fallback: random move
    const randomPick = allMoves[Math.floor(Math.random() * allMoves.length)];
    executeMove(randomPick.type, randomPick.r, randomPick.c);
  };

  const executeMove = (type, r, c) => {
    if (gameOver) return;
    if (type === 'H' && hLines[r][c]) return;
    if (type === 'V' && vLines[r][c]) return;

    const newH = hLines.map(row => [...row]);
    const newV = vLines.map(row => [...row]);
    const newBoxes = boxes.map(row => [...row]);

    if (type === 'H') newH[r][c] = currentTurn;
    else newV[r][c] = currentTurn;

    let boxesCompleted = 0;

    // Check all boxes
    for (let br = 0; br < GRID_SIZE - 1; br++) {
      for (let bc = 0; bc < GRID_SIZE - 1; bc++) {
        if (!newBoxes[br][bc]) {
          const top = newH[br][bc];
          const bottom = newH[br + 1][bc];
          const left = newV[br][bc];
          const right = newV[br][bc + 1];

          if (top && bottom && left && right) {
            newBoxes[br][bc] = currentTurn;
            boxesCompleted++;
          }
        }
      }
    }

    const newScore = {
      emerald: newBoxes.flat().filter(b => b === 'emerald').length,
      blue: newBoxes.flat().filter(b => b === 'blue').length
    };

    setHLines(newH);
    setVLines(newV);
    setBoxes(newBoxes);
    setScore(newScore);

    soundEngine.playDiceRoll?.();
    haptics.tap?.();

    // If a box was completed, player gets another turn!
    let nextTurn = currentTurn;
    if (boxesCompleted === 0) {
      nextTurn = currentTurn === 'emerald' ? 'blue' : 'emerald';
    } else {
      soundEngine.playCheckmark?.();
    }
    setCurrentTurn(nextTurn);

    if (gameMode === 'online' && chatChannelRef.current) {
      chatChannelRef.current.postMessage({
        type: 'MOVE',
        payload: { hLines: newH, vLines: newV, boxes: newBoxes, score: newScore, currentTurn: nextTurn }
      });
    }
  };

  const handleLineClick = (type, r, c) => {
    if (gameOver) return;
    if (gameMode === 'bot' && currentTurn === 'blue') return;
    if (gameMode === 'online' && currentTurn !== myOnlineRole) return;
    executeMove(type, r, c);
  };

  const resetGame = () => {
    setHLines(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE - 1).fill(null)));
    setVLines(Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    setBoxes(Array(GRID_SIZE - 1).fill(null).map(() => Array(GRID_SIZE - 1).fill(null)));
    setCurrentTurn('emerald');
    setScore({ emerald: 0, blue: 0 });
    setGameOver(false);
    soundEngine.playCheckmark?.();

    if (gameMode === 'online' && chatChannelRef.current) {
      chatChannelRef.current.postMessage({ type: 'RESET' });
    }
  };

  const handleStartFromSetup = (config) => {
    setGameMode(config.mode);
    setBotDifficulty(config.botDifficulty || 'medium');
    if (config.roomCode) {
      setOnlineRoomCode(config.roomCode);
      setMyOnlineRole(config.isHost ? 'emerald' : 'blue');
    }
    resetGame();
    setIsSetupModalOpen(false);
  };

  const handleSendMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      text,
      sender: myOnlineRole === 'emerald' ? (isRtl ? 'سبز (شما)' : 'Green (You)') : (isRtl ? 'آبی (شما)' : 'Blue (You)')
    };
    setChatMessages(prev => [...prev, newMsg]);
    chatChannelRef.current?.postMessage({ type: 'CHAT', payload: newMsg });
  };

  return (
    <div className="w-full min-h-screen pb-28 relative overflow-hidden bg-[#050711] text-white" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute top-10 right-1/4 w-[350px] h-[350px] rounded-full bg-emerald-600 blur-[130px]" />
        <div className="absolute bottom-20 left-1/4 w-[350px] h-[350px] rounded-full bg-cyan-600 blur-[130px]" />
      </div>

      {/* Top Header */}
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
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black hover:bg-emerald-500/30 flex items-center gap-1 shadow-md active:scale-95"
          >
            <Settings size={13} />
            <span>{isRtl ? 'تنظیمات بازی' : 'Setup'}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 px-4 pt-3 max-w-md mx-auto flex flex-col items-center">
        
        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 flex items-center gap-2">
          <span>📦</span>
          <span>{isRtl ? 'نقطه خط کیهانی' : 'Cosmic Dots & Boxes'}</span>
        </h1>
        <span className="text-[11px] text-slate-400 mt-0.5 font-bold">
          {gameMode === 'bot' 
            ? (isRtl ? `🤖 بازی با ربات (${botDifficulty === 'master' ? 'استاد' : botDifficulty === 'easy' ? 'مبتدی' : 'متوسط'})` : `🤖 Vs AI Bot (${botDifficulty})`) 
            : gameMode === 'local' 
            ? (isRtl ? '📱 دونفره روی همین دستگاه' : '📱 Pass & Play Local') 
            : `🌐 ${isRtl ? 'اتاق آنلاین' : 'Online Room'}: ${onlineRoomCode}`}
        </span>

        {/* Score Board */}
        <div className="flex items-center gap-6 mt-3.5 p-3 px-6 bg-slate-900/90 rounded-3xl border border-white/10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-emerald-500 shadow-md shadow-emerald-500/60" />
            <span className="text-xs font-bold text-slate-300">
              {gameMode === 'bot' ? (isRtl ? 'شما' : 'You') : (isRtl ? 'بازیکن ۱' : 'Player 1')}:
            </span>
            <span className="text-sm font-black text-emerald-300 font-mono">{score.emerald}</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-cyan-400 shadow-md shadow-cyan-400/60" />
            <span className="text-xs font-bold text-slate-300">
              {gameMode === 'bot' ? (isRtl ? 'ربات' : 'Bot') : (isRtl ? 'بازیکن ۲' : 'Player 2')}:
            </span>
            <span className="text-sm font-black text-cyan-300 font-mono">{score.blue}</span>
          </div>
        </div>

        {/* Turn Status Message */}
        <div className="mt-3 mb-2 text-xs font-bold">
          {gameOver ? (
            score.emerald === score.blue ? (
              <span className="text-slate-300 font-black">🤝 {isRtl ? 'بازی مساوی شد!' : 'It is a Draw!'}</span>
            ) : (
              <span className="text-amber-300 font-black animate-pulse flex items-center gap-1.5 text-sm">
                <Sparkles size={16} />
                <span>
                  {isRtl 
                    ? `🎉 بازیکن ${score.emerald > score.blue ? 'سبز' : 'آبی'} برنده شد!` 
                    : `🎉 Player ${score.emerald > score.blue ? 'Green' : 'Blue'} Wins!`}
                </span>
              </span>
            )
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <span>{isRtl ? 'نوبت حرکت:' : 'Turn:'}</span>
              <span className={`px-2.5 py-0.5 rounded-full font-black text-[11px] shadow-sm ${
                currentTurn === 'emerald' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}>
                {currentTurn === 'emerald' ? (isRtl ? '🟢 بازیکن سبز' : '🟢 Green Player') : (isRtl ? '🔵 بازیکن آبی' : '🔵 Blue Player')}
              </span>
            </div>
          )}
        </div>

        {/* 4x4 Grid Board */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border-2 border-emerald-500/40 shadow-2xl backdrop-blur-xl max-w-[340px] w-full flex flex-col items-center justify-center">
          
          <div className="space-y-0">
            {Array.from({ length: GRID_SIZE }).map((_, r) => (
              <React.Fragment key={r}>
                {/* Horizontal row of dots & horizontal lines */}
                <div className="flex items-center">
                  {Array.from({ length: GRID_SIZE }).map((_, c) => (
                    <React.Fragment key={c}>
                      {/* The Dot */}
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-200 border-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] shrink-0 z-20" />
                      
                      {/* Horizontal Line between dots */}
                      {c < GRID_SIZE - 1 && (
                        <button
                          onClick={() => handleLineClick('H', r, c)}
                          className={`h-3 w-16 sm:w-20 transition-all rounded-full z-10 flex items-center justify-center cursor-pointer ${
                            hLines[r][c] === 'emerald'
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.9)] scale-y-125'
                              : hLines[r][c] === 'blue'
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] scale-y-125'
                              : 'bg-white/10 hover:bg-emerald-400/40'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Vertical lines & Box content row */}
                {r < GRID_SIZE - 1 && (
                  <div className="flex items-center">
                    {Array.from({ length: GRID_SIZE }).map((_, c) => (
                      <React.Fragment key={c}>
                        {/* Vertical Line */}
                        <button
                          onClick={() => handleLineClick('V', r, c)}
                          className={`w-3 h-16 sm:h-20 transition-all rounded-full z-10 flex items-center justify-center cursor-pointer ${
                            vLines[r][c] === 'emerald'
                              ? 'bg-gradient-to-b from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.9)] scale-x-125'
                              : vLines[r][c] === 'blue'
                              ? 'bg-gradient-to-b from-cyan-500 to-blue-400 shadow-[0_0_12px_rgba(6,182,212,0.9)] scale-x-125'
                              : 'bg-white/10 hover:bg-emerald-400/40'
                          }`}
                        />

                        {/* The Box */}
                        {c < GRID_SIZE - 1 && (
                          <div className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-all ${
                            boxes[r][c] === 'emerald'
                              ? 'bg-emerald-500/25 border border-emerald-500/50 shadow-inner'
                              : boxes[r][c] === 'blue'
                              ? 'bg-cyan-500/25 border border-cyan-500/50 shadow-inner'
                              : 'bg-transparent'
                          }`}>
                            <AnimatePresence>
                              {boxes[r][c] && (
                                <motion.span
                                  initial={{ scale: 0, rotate: -45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  className={`text-xl sm:text-2xl font-black ${
                                    boxes[r][c] === 'emerald' ? 'text-emerald-300' : 'text-cyan-300'
                                  }`}
                                >
                                  {boxes[r][c] === 'emerald' ? '🟢' : '🔵'}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

        </div>

        {/* Restart Action */}
        {gameOver && (
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={resetGame}
            className="mt-5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <RotateCcw size={16} />
            <span>{isRtl ? 'بازی دوباره 🔄' : 'Play Again'}</span>
          </motion.button>
        )}

      </div>

      {/* Pre-Game Setup Modal */}
      <GameMatchSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        game={{
          id: 'dots_and_boxes',
          titleFa: 'نقطه خط کیهانی',
          titleEn: 'Cosmic Dots & Boxes',
          icon: '📦',
          path: '/games/dots-and-boxes'
        }}
        onStartGame={handleStartFromSetup}
      />

      {/* In-Game Chat (Online Mode) */}
      {gameMode === 'online' && (
        <InGameChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onToggle={() => setIsChatOpen(!isChatOpen)}
          roomCode={onlineRoomCode}
          gameTitle="نقطه خط آنلاین"
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          myRoleName={myOnlineRole === 'emerald' ? (isRtl ? 'سبز (شما)' : 'Green (You)') : (isRtl ? 'آبی (شما)' : 'Blue (You)')}
          isRtl={isRtl}
        />
      )}

    </div>
  );
}
