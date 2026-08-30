import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Trophy, Settings, Users, Bot, Globe } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import GameMatchSetupModal from '../../components/games/GameMatchSetupModal';
import InGameChatDrawer from '../../components/games/InGameChatDrawer';

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export default function TicTacToe() {
  const { isRtl, addXP, addCoins } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramRoom = searchParams.get('room');
  const paramMode = searchParams.get('mode');

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(!paramRoom && !paramMode);
  const [gameMode, setGameMode] = useState(paramMode || 'bot'); // 'bot' | 'local' | 'online'
  const [botDifficulty, setBotDifficulty] = useState('medium');
  const [onlineRoomCode, setOnlineRoomCode] = useState(paramRoom || 'TTT-555');
  const [myOnlineRole, setMyOnlineRole] = useState(paramRoom ? 'O' : 'X');

  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningCombo, setWinningCombo] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [score, setScore] = useState({ X: 0, O: 0 });

  // Online Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: isRtl ? 'به دوز نئونی خوش آمدید!' : 'Welcome to Neon Tic-Tac-Toe!', sender: 'system' }
  ]);
  const chatChannelRef = useRef(null);

  // Online sync
  useEffect(() => {
    if (gameMode === 'online') {
      const channel = new BroadcastChannel(`lifeos_ttt_${onlineRoomCode}`);
      chatChannelRef.current = channel;

      channel.onmessage = (e) => {
        const { type, payload } = e.data || {};
        if (type === 'CHAT') {
          setChatMessages(prev => [...prev, payload]);
          soundEngine.playTap?.();
        } else if (type === 'MOVE') {
          setBoard(payload.board);
          setIsXNext(payload.isXNext);
          soundEngine.playCheckmark?.();
        } else if (type === 'RESET') {
          setBoard(Array(9).fill(null));
          setWinner(null);
          setWinningCombo(null);
          setIsDraw(false);
          setIsXNext(true);
        }
      };

      return () => channel.close();
    }
  }, [gameMode, onlineRoomCode]);

  // Check for winner
  useEffect(() => {
    let currentWinner = null;
    let combo = null;
    
    for (let i = 0; i < WINNING_COMBOS.length; i++) {
      const [a, b, c] = WINNING_COMBOS[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        currentWinner = board[a];
        combo = [a, b, c];
        break;
      }
    }

    if (currentWinner) {
      setWinner(currentWinner);
      setWinningCombo(combo);
      setScore(s => ({ ...s, [currentWinner]: s[currentWinner] + 1 }));
      soundEngine.playLevelUp?.();
      haptics.success?.();
      addXP?.(25, 'پیروزی در دوز نئونی');
      addCoins?.(10);
    } else if (!board.includes(null)) {
      setIsDraw(true);
      soundEngine.playCheckmark?.();
      addXP?.(10, 'مساوی در دوز نئونی');
    }
  }, [board]);

  // Bot Move
  useEffect(() => {
    if (gameMode === 'bot' && !isXNext && !winner && !isDraw) {
      const timer = setTimeout(() => {
        makeAiMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, winner, isDraw, board, gameMode]);

  const makeAiMove = () => {
    const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    if (available.length === 0) return;

    let targetIdx = available[0];
    if (botDifficulty === 'master') {
      // Smart blocking or winning
      for (let combo of WINNING_COMBOS) {
        const [a, b, c] = combo;
        const vals = [board[a], board[b], board[c]];
        if (vals.filter(v => v === 'O').length === 2 && vals.includes(null)) {
          targetIdx = combo[vals.indexOf(null)];
          break;
        }
        if (vals.filter(v => v === 'X').length === 2 && vals.includes(null)) {
          targetIdx = combo[vals.indexOf(null)];
        }
      }
    } else {
      targetIdx = available[Math.floor(Math.random() * available.length)];
    }

    const newBoard = [...board];
    newBoard[targetIdx] = 'O';
    setBoard(newBoard);
    setIsXNext(true);
    soundEngine.playTap?.();
  };

  const handleCellClick = (idx) => {
    if (board[idx] || winner || isDraw) return;
    if (gameMode === 'bot' && !isXNext) return;
    if (gameMode === 'online') {
      const currentRole = isXNext ? 'X' : 'O';
      if (currentRole !== myOnlineRole) return;
    }

    const currentMark = isXNext ? 'X' : 'O';
    const newBoard = [...board];
    newBoard[idx] = currentMark;
    const nextIsX = !isXNext;

    setBoard(newBoard);
    setIsXNext(nextIsX);
    soundEngine.playTap?.();
    haptics.tap?.();

    if (gameMode === 'online' && chatChannelRef.current) {
      chatChannelRef.current.postMessage({
        type: 'MOVE',
        payload: { board: newBoard, isXNext: nextIsX }
      });
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningCombo(null);
    setIsDraw(false);
    setIsXNext(true);
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
      setMyOnlineRole(config.isHost ? 'X' : 'O');
    }
    resetGame();
    setIsSetupModalOpen(false);
  };

  const handleSendMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      text,
      sender: myOnlineRole === 'X' ? (isRtl ? 'بازیکن X (شما)' : 'Player X (You)') : (isRtl ? 'بازیکن O (شما)' : 'Player O (You)')
    };
    setChatMessages(prev => [...prev, newMsg]);

    if (chatChannelRef.current) {
      chatChannelRef.current.postMessage({
        type: 'CHAT',
        payload: newMsg
      });
    }
  };

  return (
    <div className="w-full min-h-full pb-24 relative overflow-hidden bg-[var(--bg-primary)]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-4 pt-6 max-w-md mx-auto flex items-center justify-between">
        <button 
          onClick={() => navigate('/games')}
          className="p-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors active:scale-95"
        >
          <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black hover:bg-emerald-500/30 flex items-center gap-1"
          >
            <Settings size={13} />
            <span>{isRtl ? 'تنظیمات / بازی جدید' : 'Setup'}</span>
          </button>
        </div>
      </div>

      <div className="px-4 pt-6 max-w-md mx-auto flex flex-col items-center">
        
        {/* Game Title */}
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 flex items-center gap-2">
          <span>🎯</span>
          <span>{isRtl ? 'دوز نئونی (Tic-Tac-Toe)' : 'Neon Tic-Tac-Toe'}</span>
        </h1>
        <span className="text-[10px] text-slate-400 mt-0.5 font-bold">
          {gameMode === 'bot' ? '🤖 بازی با ربات هوشمند' : gameMode === 'local' ? '📱 دونفره روی یک دستگاه' : `🌐 اتاق آنلاین: ${onlineRoomCode}`}
        </span>

        {/* Score Board */}
        <div className="flex items-center gap-6 mt-4 p-3 bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-emerald-400">X</span>
            <span className="text-xs font-bold text-slate-400">{gameMode === 'bot' ? (isRtl ? 'شما' : 'You') : 'Player 1'}:</span>
            <span className="text-sm font-black text-[var(--text-primary)]">{score.X}</span>
          </div>
          <div className="h-6 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-rose-400">O</span>
            <span className="text-xs font-bold text-slate-400">{gameMode === 'bot' ? (isRtl ? 'ربات' : 'Bot') : 'Player 2'}:</span>
            <span className="text-sm font-black text-[var(--text-primary)]">{score.O}</span>
          </div>
        </div>

        {/* Turn indicator */}
        <div className="mt-4 mb-4 text-xs font-bold text-slate-300">
          {winner ? (
            <span className="text-amber-300 font-black animate-pulse">
              🎉 {isRtl ? `بازیکن ${winner} برنده شد!` : `Player ${winner} won!`}
            </span>
          ) : isDraw ? (
            <span className="text-slate-400">🤝 {isRtl ? 'بازی مساوی شد!' : 'It is a Draw!'}</span>
          ) : (
            <span>
              {isRtl ? `نوبت بازیکن: ` : `Turn: `}
              <span className={`font-black ${isXNext ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isXNext ? 'X' : 'O'}
              </span>
            </span>
          )}
        </div>

        {/* 3x3 Board */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-black/60 rounded-3xl border border-emerald-500/20 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.1)] relative">
          {board.map((cell, idx) => {
            const isWinningCell = winningCombo?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={cell !== null || winner || isDraw}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black transition-all duration-300 ${
                  !cell && !winner && !isDraw ? 'hover:bg-emerald-500/10 cursor-pointer active:scale-95' : 'cursor-default'
                } ${
                  cell === 'X' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 
                  cell === 'O' ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'bg-white/5 border border-white/5'
                } ${isWinningCell ? 'bg-emerald-500/20 border-emerald-500/50 scale-105' : 'bg-black/40 border border-white/5'}`}
              >
                <AnimatePresence>
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: cell === 'X' ? -45 : 45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        {/* Restart Button */}
        {(winner || isDraw) && (
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={resetGame}
            className="mt-6 px-8 py-3 rounded-2xl bg-emerald-500 text-black font-black text-xs flex items-center gap-2 hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95"
          >
            <RotateCcw size={16} />
            <span>{isRtl ? 'بازی دوباره 🔄' : 'Play Again'}</span>
          </motion.button>
        )}

      </div>

      {/* Pre-Game Match Configuration Modal */}
      <GameMatchSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        game={{
          id: 'tic_tac_toe',
          titleFa: 'دوز نئونی (Tic-Tac-Toe)',
          titleEn: 'Neon Tic-Tac-Toe',
          icon: '🎯',
          path: '/games/tic-tac-toe'
        }}
        onStartGame={handleStartFromSetup}
      />

      {/* In-Game Chat (Online Mode Only) */}
      {gameMode === 'online' && (
        <InGameChatDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onToggle={() => setIsChatOpen(!isChatOpen)}
          roomCode={onlineRoomCode}
          gameTitle="دوز نئونی آنلاین"
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          myRoleName={myOnlineRole === 'X' ? 'X (شما)' : 'O (شما)'}
          isRtl={isRtl}
        />
      )}

    </div>
  );
}
