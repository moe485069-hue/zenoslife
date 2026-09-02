import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Trophy, Settings, Users, Bot, Globe, Sparkles } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import GameMatchSetupModal from '../../components/games/GameMatchSetupModal';
import InGameChatDrawer from '../../components/games/InGameChatDrawer';
import ConfettiOverlay from '../../components/games/ConfettiOverlay';

const ROWS = 6;
const COLS = 7;

function createEmptyBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
}

function checkWin(grid) {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const val = grid[r][c];
      if (val && val === grid[r][c+1] && val === grid[r][c+2] && val === grid[r][c+3]) {
        return { winner: val, cells: [[r, c], [r, c+1], [r, c+2], [r, c+3]] };
      }
    }
  }
  // Vertical
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = grid[r][c];
      if (val && val === grid[r+1][c] && val === grid[r+2][c] && val === grid[r+3][c]) {
        return { winner: val, cells: [[r, c], [r+1, c], [r+2, c], [r+3, c]] };
      }
    }
  }
  // Diagonal Down-Right
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const val = grid[r][c];
      if (val && val === grid[r+1][c+1] && val === grid[r+2][c+2] && val === grid[r+3][c+3]) {
        return { winner: val, cells: [[r, c], [r+1, c+1], [r+2, c+2], [r+3, c+3]] };
      }
    }
  }
  // Diagonal Up-Right
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const val = grid[r][c];
      if (val && val === grid[r-1][c+1] && val === grid[r-2][c+2] && val === grid[r-3][c+3]) {
        return { winner: val, cells: [[r, c], [r-1, c+1], [r-2, c+2], [r-3, c+3]] };
      }
    }
  }

  // Draw Check
  const isFull = grid.every(row => row.every(cell => cell !== null));
  if (isFull) return { winner: 'DRAW', cells: [] };

  return null;
}

export default function ConnectFour() {
  const { language, addXP, addCoins, recordGameResult } = useAppStore();
  const isRtl = language === 'fa';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gameStartTimeRef = useRef(Date.now());
  const [showConfetti, setShowConfetti] = useState(false);

  const paramRoom = searchParams.get('room');
  const paramMode = searchParams.get('mode');

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(!paramRoom && !paramMode);
  const [gameMode, setGameMode] = useState(paramMode || 'bot'); // 'bot' | 'local' | 'online'
  const [botDifficulty, setBotDifficulty] = useState('medium');
  const [onlineRoomCode, setOnlineRoomCode] = useState(paramRoom || 'C4-777');
  const [myOnlineRole, setMyOnlineRole] = useState(paramRoom ? 'yellow' : 'red');

  const [board, setBoard] = useState(createEmptyBoard);
  const [currentTurn, setCurrentTurn] = useState('red'); // 'red' (P1) | 'yellow' (P2/Bot)
  const [winInfo, setWinInfo] = useState(null);
  const [hoverCol, setHoverCol] = useState(null);
  const [score, setScore] = useState({ red: 0, yellow: 0 });

  // Online Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: isRtl ? 'به بازی چهار در یک خط خوش آمدید!' : 'Welcome to Connect 4!', sender: 'system' }
  ]);
  const chatChannelRef = useRef(null);

  // Online Sync
  useEffect(() => {
    if (gameMode === 'online') {
      const channel = new BroadcastChannel(`lifeos_c4_${onlineRoomCode}`);
      chatChannelRef.current = channel;

      channel.onmessage = (e) => {
        const { type, payload } = e.data || {};
        if (type === 'CHAT') {
          setChatMessages(prev => [...prev, payload]);
          soundEngine.playTap?.();
        } else if (type === 'MOVE') {
          setBoard(payload.board);
          setCurrentTurn(payload.currentTurn);
          soundEngine.playDiceRoll?.();
        } else if (type === 'RESET') {
          setBoard(createEmptyBoard());
          setWinInfo(null);
          setCurrentTurn('red');
        }
      };

      return () => channel.close();
    }
  }, [gameMode, onlineRoomCode]);

  // Check Game State
  useEffect(() => {
    const result = checkWin(board);
    if (result) {
      setWinInfo(result);
      if (result.winner !== 'DRAW') {
        const isPlayerWin = result.winner === (gameMode === 'online' ? myOnlineRole : 'red');
        setScore(s => ({ ...s, [result.winner]: s[result.winner] + 1 }));
        soundEngine.playLevelUp?.();
        haptics.success?.();
        if (isPlayerWin) {
          setShowConfetti(true);
          addXP?.(30, 'پیروزی در چهار در یک خط');
          addCoins?.(15);
        }
        recordGameResult?.({
          gameId: 'connect-four',
          gameName: isRtl ? 'چهار در یک خط' : 'Connect 4',
          gameIcon: '🎯',
          won: isPlayerWin,
          opponent: gameMode === 'bot' ? (isRtl ? '🤖 ربات هوشمند' : '🤖 AI Bot') : (isRtl ? 'بازیکن آنلاین' : 'Online Player'),
          durationMs: Date.now() - gameStartTimeRef.current,
          coinsEarned: isPlayerWin ? 15 : 0
        });
      } else {
        soundEngine.playCheckmark?.();
        addXP?.(10, 'مساوی در چهار در یک خط');
      }
    }
  }, [board]);

  // Bot AI Turn
  useEffect(() => {
    if (gameMode === 'bot' && currentTurn === 'yellow' && !winInfo) {
      const timer = setTimeout(() => {
        makeBotMove();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, winInfo, gameMode, board]);

  const getAvailableRow = (grid, col) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!grid[r][col]) return r;
    }
    return -1;
  };

  const makeBotMove = () => {
    const validCols = [];
    for (let c = 0; c < COLS; c++) {
      if (getAvailableRow(board, c) !== -1) validCols.push(c);
    }
    if (validCols.length === 0) return;

    let targetCol = validCols[Math.floor(Math.random() * validCols.length)];

    if (botDifficulty === 'master' || botDifficulty === 'medium') {
      // 1. Check if Bot can win on next move
      for (const col of validCols) {
        const row = getAvailableRow(board, col);
        const temp = board.map(r => [...r]);
        temp[row][col] = 'yellow';
        if (checkWin(temp)?.winner === 'yellow') {
          targetCol = col;
          dropDisc(targetCol);
          return;
        }
      }

      // 2. Block opponent from winning
      for (const col of validCols) {
        const row = getAvailableRow(board, col);
        const temp = board.map(r => [...r]);
        temp[row][col] = 'red';
        if (checkWin(temp)?.winner === 'red') {
          targetCol = col;
          dropDisc(targetCol);
          return;
        }
      }

      // Prefer center columns
      const centerCols = [3, 2, 4, 1, 5, 0, 6].filter(c => validCols.includes(c));
      if (centerCols.length > 0 && Math.random() > 0.3) {
        targetCol = centerCols[0];
      }
    }

    dropDisc(targetCol);
  };

  const dropDisc = (col) => {
    if (winInfo) return;
    const row = getAvailableRow(board, col);
    if (row === -1) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentTurn;
    const nextTurn = currentTurn === 'red' ? 'yellow' : 'red';

    setBoard(newBoard);
    setCurrentTurn(nextTurn);
    soundEngine.playDiceRoll?.();
    haptics.tap?.();

    if (gameMode === 'online' && chatChannelRef.current) {
      chatChannelRef.current.postMessage({
        type: 'MOVE',
        payload: { board: newBoard, currentTurn: nextTurn }
      });
    }
  };

  const handleColumnClick = (col) => {
    if (winInfo) return;
    if (gameMode === 'bot' && currentTurn === 'yellow') return;
    if (gameMode === 'online' && currentTurn !== myOnlineRole) return;
    dropDisc(col);
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setWinInfo(null);
    setCurrentTurn('red');
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
      setMyOnlineRole(config.isHost ? 'red' : 'yellow');
    }
    resetGame();
    setIsSetupModalOpen(false);
  };

  const handleSendMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      text,
      sender: myOnlineRole === 'red' ? (isRtl ? 'قرمز (شما)' : 'Red (You)') : (isRtl ? 'زرد (شما)' : 'Yellow (You)')
    };
    setChatMessages(prev => [...prev, newMsg]);
    chatChannelRef.current?.postMessage({ type: 'CHAT', payload: newMsg });
  };

  return (
    <div className="w-full min-h-screen pb-28 relative overflow-hidden bg-[#050711] text-white" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-25 z-0">
        <div className="absolute top-10 left-1/4 w-[350px] h-[350px] rounded-full bg-rose-600 blur-[130px]" />
        <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] rounded-full bg-amber-600 blur-[130px]" />
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
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black hover:bg-rose-500/30 flex items-center gap-1 shadow-md active:scale-95"
          >
            <Settings size={13} />
            <span>{isRtl ? 'تنظیمات بازی' : 'Setup'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 px-4 pt-3 max-w-md mx-auto flex flex-col items-center">
        
        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 flex items-center gap-2">
          <span>🎯</span>
          <span>{isRtl ? 'چهار در یک خط نئونی' : 'Neon Connect 4'}</span>
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
            <span className="w-4 h-4 rounded-full bg-rose-500 shadow-md shadow-rose-500/60" />
            <span className="text-xs font-bold text-slate-300">
              {gameMode === 'bot' ? (isRtl ? 'شما' : 'You') : (isRtl ? 'بازیکن ۱' : 'Player 1')}:
            </span>
            <span className="text-sm font-black text-rose-300 font-mono">{score.red}</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-yellow-400 shadow-md shadow-yellow-400/60" />
            <span className="text-xs font-bold text-slate-300">
              {gameMode === 'bot' ? (isRtl ? 'ربات' : 'Bot') : (isRtl ? 'بازیکن ۲' : 'Player 2')}:
            </span>
            <span className="text-sm font-black text-yellow-300 font-mono">{score.yellow}</span>
          </div>
        </div>

        {/* Turn Status Message */}
        <div className="mt-3 mb-2 text-xs font-bold">
          {winInfo ? (
            winInfo.winner === 'DRAW' ? (
              <span className="text-slate-300 font-black">🤝 {isRtl ? 'بازی مساوی شد!' : 'It is a Draw!'}</span>
            ) : (
              <span className="text-amber-300 font-black animate-pulse flex items-center gap-1.5 text-sm">
                <Sparkles size={16} />
                <span>
                  {isRtl 
                    ? `🎉 بازیکن ${winInfo.winner === 'red' ? 'قرمز' : 'زرد'} برنده شد!` 
                    : `🎉 Player ${winInfo.winner === 'red' ? 'Red' : 'Yellow'} Wins!`}
                </span>
              </span>
            )
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <span>{isRtl ? 'نوبت حرکت:' : 'Turn:'}</span>
              <span className={`px-2.5 py-0.5 rounded-full font-black text-[11px] shadow-sm ${
                currentTurn === 'red' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
              }`}>
                {currentTurn === 'red' ? (isRtl ? '🔴 قرمز' : '🔴 Red') : (isRtl ? '🟡 زرد' : '🟡 Yellow')}
              </span>
            </div>
          )}
        </div>

        {/* Hover Arrow Indicator */}
        <div className="grid grid-cols-7 gap-1.5 w-full max-w-[340px] px-2 h-6">
          {Array.from({ length: COLS }).map((_, c) => (
            <div key={c} className="flex justify-center items-center">
              {hoverCol === c && !winInfo && (
                <div className={`w-3 h-3 rotate-45 border-b-2 border-r-2 ${
                  currentTurn === 'red' ? 'border-rose-400' : 'border-yellow-400'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* 7x6 Connect Four Grid */}
        <div 
          className="p-3 sm:p-4 rounded-3xl bg-gradient-to-b from-blue-950/80 via-slate-950 to-indigo-950/80 border-2 border-blue-500/40 shadow-2xl backdrop-blur-xl max-w-[340px] w-full"
        >
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: COLS }).map((_, colIdx) => (
              <div
                key={colIdx}
                onClick={() => handleColumnClick(colIdx)}
                onMouseEnter={() => setHoverCol(colIdx)}
                onMouseLeave={() => setHoverCol(null)}
                className="flex flex-col gap-1.5 cursor-pointer group"
              >
                {Array.from({ length: ROWS }).map((_, rowIdx) => {
                  const cellValue = board[rowIdx][colIdx];
                  const isWinningCell = winInfo?.cells?.some(([r, c]) => r === rowIdx && c === colIdx);

                  return (
                    <div
                      key={rowIdx}
                      className="w-10 h-10 rounded-full bg-black/60 border border-blue-400/20 flex items-center justify-center p-1 relative overflow-hidden group-hover:border-blue-400/50 transition-all shadow-inner"
                    >
                      <AnimatePresence>
                        {cellValue && (
                          <motion.div
                            initial={{ y: -60, scale: 0.6, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                            className={`w-full h-full rounded-full shadow-lg transition-transform ${
                              cellValue === 'red'
                                ? 'bg-gradient-to-tr from-rose-600 via-red-500 to-pink-400 shadow-rose-600/60'
                                : 'bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-200 shadow-yellow-500/60'
                            } ${isWinningCell ? 'ring-4 ring-white animate-bounce scale-110' : ''}`}
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Restart Action */}
        {winInfo && (
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={resetGame}
            className="mt-5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white font-black text-xs flex items-center gap-2 shadow-xl shadow-rose-500/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <RotateCcw size={16} />
            <span>{isRtl ? 'بازی دوباره 🔄' : 'Play Again'}</span>
          </motion.button>
        )}

      </div>

      {/* Pre-Game Match Setup Modal */}
      <GameMatchSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        game={{
          id: 'connect_four',
          titleFa: 'چهار در یک خط نئونی',
          titleEn: 'Neon Connect 4',
          icon: '🎯',
          path: '/games/connect-four'
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
          gameTitle="چهار در یک خط آنلاین"
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          myRoleName={myOnlineRole === 'red' ? (isRtl ? 'قرمز (شما)' : 'Red (You)') : (isRtl ? 'زرد (شما)' : 'Yellow (You)')}
          isRtl={isRtl}
        />
      )}

      {/* Confetti Celebration */}
      <ConfettiOverlay active={showConfetti} onDone={() => setShowConfetti(false)} />

    </div>
  );
}
