import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Settings, Swords, Bot, Users, Globe } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import GameMatchSetupModal from '../../components/games/GameMatchSetupModal';
import InGameChatDrawer from '../../components/games/InGameChatDrawer';

const INITIAL_BOARD = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
];

const PIECE_SYMBOLS = {
  'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
  'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

export default function CosmicChess() {
  const { isRtl, addXP, addCoins } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const paramRoom = searchParams.get('room');
  const paramMode = searchParams.get('mode');

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(!paramRoom && !paramMode);
  const [gameMode, setGameMode] = useState(paramMode || 'bot'); // 'bot' | 'local' | 'online'
  const [onlineRoomCode, setOnlineRoomCode] = useState(paramRoom || 'CHESS-999');
  const [myOnlineRole, setMyOnlineRole] = useState(paramRoom ? 'black' : 'white');

  const [board, setBoard] = useState(INITIAL_BOARD);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [turn, setTurn] = useState('white');
  const [history, setHistory] = useState([]);

  // Online Chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: isRtl ? 'به شطرنج کیهانی خوش آمدید!' : 'Welcome to Cosmic Chess!', sender: 'system' }
  ]);
  const chatChannelRef = useRef(null);

  const isWhite = (piece) => piece && piece === piece.toUpperCase();
  const isBlack = (piece) => piece && piece === piece.toLowerCase();

  // Online sync
  useEffect(() => {
    if (gameMode === 'online') {
      const channel = new BroadcastChannel(`lifeos_chess_${onlineRoomCode}`);
      chatChannelRef.current = channel;

      channel.onmessage = (e) => {
        const { type, payload } = e.data || {};
        if (type === 'CHAT') {
          setChatMessages(prev => [...prev, payload]);
          soundEngine.playTap?.();
        } else if (type === 'MOVE') {
          setBoard(payload.board);
          setTurn(payload.turn);
          soundEngine.playCheckmark?.();
        } else if (type === 'RESET') {
          setBoard(INITIAL_BOARD);
          setSelectedSquare(null);
          setTurn('white');
        }
      };

      return () => channel.close();
    }
  }, [gameMode, onlineRoomCode]);

  // Bot move
  useEffect(() => {
    if (gameMode === 'bot' && turn === 'black') {
      const timer = setTimeout(() => {
        makeBotMove();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [gameMode, turn, board]);

  const makeBotMove = () => {
    const blackPieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isBlack(board[r][c])) {
          blackPieces.push({ r, c, piece: board[r][c] });
        }
      }
    }

    if (blackPieces.length === 0) return;

    // Pick a piece that can move forward or randomly
    const picked = blackPieces[Math.floor(Math.random() * blackPieces.length)];
    const targetRow = Math.min(7, picked.r + 1);
    const targetCol = picked.c;

    if (!isBlack(board[targetRow][targetCol])) {
      const newBoard = board.map(row => [...row]);
      newBoard[targetRow][targetCol] = picked.piece;
      newBoard[picked.r][picked.c] = null;
      setBoard(newBoard);
      setTurn('white');
      soundEngine.playTap?.();
    }
  };

  const handleSquareClick = (r, c) => {
    const piece = board[r][c];

    if (gameMode === 'bot' && turn !== 'white') return;
    if (gameMode === 'online' && turn !== myOnlineRole) return;

    if (selectedSquare) {
      const [sr, sc] = selectedSquare;
      
      if (sr === r && sc === c) {
        setSelectedSquare(null);
        return;
      }

      const selectedPiece = board[sr][sc];
      
      if (piece && ((isWhite(selectedPiece) && isWhite(piece)) || (isBlack(selectedPiece) && isBlack(piece)))) {
        setSelectedSquare([r, c]);
        return;
      }

      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = selectedPiece;
      newBoard[sr][sc] = null;
      
      const nextTurn = turn === 'white' ? 'black' : 'white';
      setBoard(newBoard);
      setSelectedSquare(null);
      setHistory(prev => [...prev, { from: [sr, sc], to: [r, c], piece: selectedPiece, captured: piece }]);
      setTurn(nextTurn);
      soundEngine.playTap?.();
      haptics.tap?.();

      if (gameMode === 'online' && chatChannelRef.current) {
        chatChannelRef.current.postMessage({
          type: 'MOVE',
          payload: { board: newBoard, turn: nextTurn }
        });
      }

      if (piece === 'k' || piece === 'K') {
        addXP?.(100, 'مات کردن در شطرنج');
        addCoins?.(50);
      }
    } else {
      if (piece) {
        if ((turn === 'white' && isWhite(piece)) || (turn === 'black' && isBlack(piece))) {
          setSelectedSquare([r, c]);
          soundEngine.playTap?.();
        }
      }
    }
  };

  const handleReset = () => {
    setBoard(INITIAL_BOARD);
    setSelectedSquare(null);
    setTurn('white');
    setHistory([]);
    soundEngine.playCheckmark?.();

    if (gameMode === 'online' && chatChannelRef.current) {
      chatChannelRef.current.postMessage({ type: 'RESET' });
    }
  };

  const handleStartFromSetup = (config) => {
    setGameMode(config.mode);
    if (config.roomCode) {
      setOnlineRoomCode(config.roomCode);
      setMyOnlineRole(config.isHost ? 'white' : 'black');
    }
    handleReset();
    setIsSetupModalOpen(false);
  };

  const handleSendMessage = (text) => {
    const newMsg = {
      id: Date.now(),
      text,
      sender: myOnlineRole === 'white' ? (isRtl ? 'سفید (شما)' : 'White (You)') : (isRtl ? 'سیاه (شما)' : 'Black (You)')
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
    <div className="w-full min-h-screen pb-24 relative overflow-hidden bg-slate-950" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 px-4 pt-6 max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Top bar */}
        <div className="w-full flex items-center justify-between mb-4">
          <button 
            onClick={() => navigate('/games')}
            className="p-2 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors active:scale-95 shadow-sm"
          >
            <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSetupModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-black hover:bg-indigo-500/30 flex items-center gap-1"
            >
              <Settings size={13} />
              <span>{isRtl ? 'تنظیمات / بازی جدید' : 'Setup'}</span>
            </button>

            <button 
              onClick={handleReset}
              className="p-2 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors active:scale-95 shadow-sm"
              title={isRtl ? 'شروع مجدد' : 'Reset'}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 flex items-center gap-2">
          <span>♟️</span>
          <span>{isRtl ? 'شطرنج کیهانی' : 'Cosmic Chess'}</span>
        </h1>
        <span className="text-[10px] text-slate-400 mt-0.5 font-bold">
          {gameMode === 'bot' ? '🤖 بازی با ربات هوشمند' : gameMode === 'local' ? '📱 دونفره یک دستگاه' : `🌐 اتاق آنلاین: ${onlineRoomCode}`}
        </span>

        {/* Turn Status */}
        <div className="mt-3 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs flex items-center gap-2">
          <span className="text-slate-400">{isRtl ? 'نوبت حرکت:' : 'Turn:'}</span>
          <span className={`font-black flex items-center gap-1.5 ${turn === 'white' ? 'text-indigo-300' : 'text-purple-300'}`}>
            <span>{turn === 'white' ? '⚪ سفید' : '⚫ سیاه'}</span>
            <span className={`w-2 h-2 rounded-full ${turn === 'white' ? 'bg-indigo-400' : 'bg-purple-400'} animate-pulse`} />
          </span>
        </div>

        {/* 8x8 Chess Board */}
        <div className="p-2 sm:p-3 bg-black/60 rounded-3xl border border-indigo-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col gap-0.5 max-w-sm sm:max-w-md w-full aspect-square">
          {board.map((row, r) => (
            <div key={r} className="flex-1 flex gap-0.5">
              {row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                const isSelected = selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c;

                return (
                  <button
                    key={c}
                    onClick={() => handleSquareClick(r, c)}
                    className={`flex-1 rounded-lg flex items-center justify-center text-xl sm:text-3xl select-none transition-all duration-200 relative ${
                      isLight ? 'bg-indigo-950/40 hover:bg-indigo-900/50' : 'bg-slate-900/60 hover:bg-slate-800/60'
                    } ${isSelected ? 'ring-2 ring-cyan-400 bg-cyan-950/60 scale-95 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-10' : ''}`}
                  >
                    <span className={`${isWhite(piece) ? 'text-indigo-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]'}`}>
                      {PIECE_SYMBOLS[piece] || ''}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

      </div>

      {/* Pre-Game Match Configuration Modal */}
      <GameMatchSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        game={{
          id: 'cosmic_chess',
          titleFa: 'شطرنج کیهانی',
          titleEn: 'Cosmic Chess',
          icon: '♟️',
          path: '/games/cosmic-chess'
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
          gameTitle="شطرنج آنلاین"
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          myRoleName={myOnlineRole === 'white' ? 'سفید (شما)' : 'سیاه (شما)'}
          isRtl={isRtl}
        />
      )}

    </div>
  );
}
