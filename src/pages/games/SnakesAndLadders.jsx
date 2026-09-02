import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, RotateCcw, Trophy, Users, Bot, Volume2, VolumeX, Shuffle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import GameMatchSetupModal from '../../components/games/GameMatchSetupModal';
import InGameReactions from '../../components/games/InGameReactions';
import ConfettiOverlay from '../../components/games/ConfettiOverlay';

const BOARD_SIZE = 10;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

const SNAKES = {
  17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78
};

const LADDERS = {
  4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91
};

const PLAYER_COLORS = [
  'bg-blue-500 shadow-blue-500/50',
  'bg-red-500 shadow-red-500/50',
  'bg-green-500 shadow-green-500/50',
  'bg-yellow-500 shadow-yellow-500/50'
];

const BOT_NAMES = ['Bot Alpha', 'Bot Beta', 'Bot Gamma'];

const getCellCoords = (cellNum) => {
  const idx = cellNum - 1; 
  const row = Math.floor(idx / 10); 
  const col = row % 2 === 0 ? (idx % 10) : (9 - idx % 10); 
  return { gridRow: 9 - row, gridCol: col };
};

const getBoardPercent = (cellNum) => {
  if (cellNum < 1) cellNum = 1;
  if (cellNum > 100) cellNum = 100;
  const { gridRow, gridCol } = getCellCoords(cellNum);
  const x = (gridCol + 0.5) * 10; 
  const y = (gridRow + 0.5) * 10; 
  return { x: `${x}%`, y: `${y}%` };
};

const RenderDiceFace = ({ value, isRolling }) => {
  const pips = { 1:[4], 2:[0,8], 3:[0,4,8], 4:[0,2,6,8], 5:[0,2,4,6,8], 6:[0,2,3,5,6,8] };
  
  return (
    <motion.div
      animate={isRolling ? { rotate: [0,90,180,270,360], scale:[0.9,1.1,0.95,1] } : {}}
      transition={{ duration: 0.25, repeat: isRolling ? Infinity : 0 }}
      className="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 border-2 border-slate-400 shadow-xl p-2 mx-auto"
    >
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5">
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="flex items-center justify-center">
            {value && pips[value]?.includes(i) && <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function SnakesAndLadders() {
  const { language, addXP, addCoins, recordGameResult } = useAppStore();
  const isRtl = language === 'fa';
  const navigate = useNavigate();
  const gameStartTimeRef = useRef(Date.now());
  const [showConfetti, setShowConfetti] = useState(false);

  const [gameState, setGameState] = useState('setup'); // setup, playing, won
  const [setupModalOpen, setSetupModalOpen] = useState(true);
  
  const [players, setPlayers] = useState([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const rollTimeoutRef = useRef(null);

  const t = {
    title: isRtl ? 'مار و پله' : 'Snakes & Ladders',
    roll: isRtl ? 'تاس بریز' : 'Roll Dice',
    rolling: isRtl ? 'در حال تاس ریختن...' : 'Rolling...',
    winner: isRtl ? 'برنده شد!' : 'Wins!',
    bonusTurn: isRtl ? 'نوبت دوباره! (۶)' : 'Bonus Turn! (6)',
    snakeBite: isRtl ? 'اوه نه! نیش مار' : 'Oh no! Snake bite!',
    ladderClimb: isRtl ? 'عالی! صعود از نردبان' : 'Nice! Ladder climb!',
    playAgain: isRtl ? 'دوباره بازی کن' : 'Play Again',
    exactRollNeeded: isRtl ? 'برای بردن تاس دقیق لازم است' : 'Exact roll needed to win',
    exit: isRtl ? 'خروج' : 'Exit'
  };

  const handleSetupComplete = (config) => {
    const newPlayers = [];
    newPlayers.push({
      id: 'p1',
      name: isRtl ? 'شما' : 'You',
      isBot: false,
      position: 1,
      color: PLAYER_COLORS[0]
    });

    for (let i = 1; i < config.playerCount; i++) {
      newPlayers.push({
        id: `p${i+1}`,
        name: BOT_NAMES[i-1],
        isBot: true,
        position: 1,
        color: PLAYER_COLORS[i]
      });
    }

    setPlayers(newPlayers);
    setGameState('playing');
    setSetupModalOpen(false);
    setCurrentPlayerIdx(0);
    setMessage(isRtl ? 'بازی شروع شد!' : 'Game Started!');
  };

  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      if (type === 'roll') soundEngine.play('dice');
      if (type === 'move') soundEngine.play('pop');
      if (type === 'snake') soundEngine.play('error');
      if (type === 'ladder') soundEngine.play('success');
      if (type === 'win') soundEngine.play('victory');
    } catch (e) {
      // ignore
    }
  };

  const executeTurn = (roll) => {
    const player = players[currentPlayerIdx];
    let newPos = player.position + roll;
    
    if (newPos > 100) {
      setMessage(t.exactRollNeeded);
      haptics.warning();
      finishTurn(player.position, roll);
      return;
    }

    // Move to base position first
    movePlayer(currentPlayerIdx, newPos, () => {
      // Check snakes and ladders
      let finalPos = newPos;
      
      if (SNAKES[newPos]) {
        finalPos = SNAKES[newPos];
        setMessage(t.snakeBite);
        playSound('snake');
        haptics.heavy();
        movePlayer(currentPlayerIdx, finalPos, () => finishTurn(finalPos, roll));
      } else if (LADDERS[newPos]) {
        finalPos = LADDERS[newPos];
        setMessage(t.ladderClimb);
        playSound('ladder');
        haptics.medium();
        movePlayer(currentPlayerIdx, finalPos, () => finishTurn(finalPos, roll));
      } else {
        finishTurn(finalPos, roll);
      }
    });
  };

  const movePlayer = (pIdx, toPos, callback) => {
    playSound('move');
    setPlayers(prev => {
      const p = [...prev];
      p[pIdx].position = toPos;
      return p;
    });
    setTimeout(callback, 600); // Wait for animation
  };

  const finishTurn = (finalPos, roll) => {
    if (finalPos === 100) {
      const w = players[currentPlayerIdx];
      setWinner(w);
      setGameState('won');
      playSound('win');
      haptics.success();
      const isPlayerWin = !w.isBot;
      if (isPlayerWin) {
        setShowConfetti(true);
        addXP(50);
        addCoins(20);
      }
      recordGameResult?.({
        gameId: 'snakes',
        gameName: isRtl ? 'مار و پله' : 'Snakes & Ladders',
        gameIcon: '🐍',
        won: isPlayerWin,
        opponent: isRtl ? '🤖 ربات‌ها' : '🤖 AI Bots',
        durationMs: Date.now() - gameStartTimeRef.current,
        coinsEarned: isPlayerWin ? 20 : 0
      });
      return;
    }

    if (roll === 6) {
      setMessage(t.bonusTurn);
      // Keep current player index
      if (players[currentPlayerIdx].isBot) {
        rollTimeoutRef.current = setTimeout(rollDice, 1500);
      }
    } else {
      const nextIdx = (currentPlayerIdx + 1) % players.length;
      setCurrentPlayerIdx(nextIdx);
      if (players[nextIdx].isBot) {
        rollTimeoutRef.current = setTimeout(rollDice, 1500);
      }
    }
  };

  const rollDice = () => {
    if (isRolling || gameState !== 'playing') return;
    
    setIsRolling(true);
    playSound('roll');
    haptics.selection();
    
    // Animate rolling
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 10) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);
        setMessage(`${players[currentPlayerIdx].name} rolled a ${finalRoll}`);
        executeTurn(finalRoll);
      }
    }, 50);
  };

  useEffect(() => {
    return () => {
      if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
    };
  }, []);

  const renderBoard = () => {
    const cells = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        // Calculate cell number based on visual position
        // visual row 0 is top, gridRow 0 is bottom
        const gridRow = 9 - row; 
        const cellNum = gridRow % 2 === 0 
          ? (gridRow * 10) + col + 1 
          : (gridRow * 10) + (9 - col) + 1;

        const isEven = (row + col) % 2 === 0;
        
        cells.push(
          <div 
            key={cellNum}
            className={`relative flex items-center justify-center border border-slate-800/50 ${isEven ? 'bg-slate-800/40' : 'bg-slate-900/40'} ${cellNum === 100 ? 'bg-amber-900/40 border-amber-500/50' : ''}`}
          >
            <span className="absolute top-0.5 left-1 text-[10px] text-slate-500 font-mono">
              {cellNum}
            </span>
            {cellNum === 100 && <Trophy className="w-4 h-4 text-amber-500 opacity-50" />}
          </div>
        );
      }
    }
    return cells;
  };

  const renderSnakesAndLadders = () => {
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
        {/* Snakes */}
        {Object.entries(SNAKES).map(([start, end]) => {
          const s = getBoardPercent(parseInt(start));
          const e = getBoardPercent(parseInt(end));
          
          // Generate a curve for snake body
          const startX = parseFloat(s.x);
          const startY = parseFloat(s.y);
          const endX = parseFloat(e.x);
          const endY = parseFloat(e.y);
          
          const midX = (startX + endX) / 2 + (Math.random() * 20 - 10);
          const midY = (startY + endY) / 2;

          return (
            <g key={`snake-${start}`}>
              <path 
                d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                stroke="rgba(239, 68, 68, 0.6)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
              <circle cx={`${startX}%`} cy={`${startY}%`} r="3" fill="#ef4444" />
              <text x={`${startX}%`} y={`${startY}%`} dy="2" dx="-4" fontSize="12" fill="#ef4444" opacity="0.8">🐍</text>
            </g>
          );
        })}

        {/* Ladders */}
        {Object.entries(LADDERS).map(([start, end]) => {
          const s = getBoardPercent(parseInt(start));
          const e = getBoardPercent(parseInt(end));
          
          const startX = parseFloat(s.x);
          const startY = parseFloat(s.y);
          const endX = parseFloat(e.x);
          const endY = parseFloat(e.y);

          return (
            <g key={`ladder-${start}`}>
              <line 
                x1={`${startX}%`} y1={`${startY}%`} 
                x2={`${endX}%`} y2={`${endY}%`} 
                stroke="rgba(245, 158, 11, 0.6)" 
                strokeWidth="8"
                strokeDasharray="4 4"
                className="drop-shadow-lg"
              />
              <text x={`${(startX+endX)/2}%`} y={`${(startY+endY)/2}%`} fontSize="12" opacity="0.8">🪜</text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderPlayers = () => {
    return players.map((p, idx) => {
      const pos = getBoardPercent(p.position);
      // Add slight offset for multiple players on same cell
      const offset = (idx - (players.length - 1) / 2) * 8; 
      
      return (
        <motion.div
          key={p.id}
          className={`absolute w-4 h-4 rounded-full ${p.color} border-2 border-white/20 flex items-center justify-center`}
          style={{ 
            zIndex: 10 + (p.id === players[currentPlayerIdx]?.id ? 5 : 0),
          }}
          initial={false}
          animate={{ 
            left: `calc(${pos.x} + ${offset}px)`, 
            top: `calc(${pos.y} + ${offset}px)`,
            scale: p.id === players[currentPlayerIdx]?.id ? 1.2 : 1,
            x: '-50%', y: '-50%'
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          {p.isBot ? <Bot className="w-2.5 h-2.5 text-white" /> : <span className="text-[8px] font-bold text-white">P1</span>}
        </motion.div>
      );
    });
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-md sticky top-0 z-20">
        <button 
          onClick={() => navigate('/games')}
          className="p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
          {t.title}
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => setSetupModalOpen(true)}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
        
        {/* Players Scoreboard */}
        {gameState !== 'setup' && (
          <div className="grid grid-cols-2 gap-2">
            {players.map((p, idx) => (
              <div 
                key={p.id}
                className={`p-2 rounded-xl flex items-center gap-2 border ${currentPlayerIdx === idx ? 'border-amber-500/50 bg-amber-500/10' : 'border-slate-800/50 bg-slate-900/50'}`}
              >
                <div className={`w-3 h-3 rounded-full ${p.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-400">Pos: {p.position}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Board */}
        <div className="relative w-full aspect-square max-w-[380px] mx-auto bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl shadow-slate-900/50">
          {/* Grid */}
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 w-full h-full">
            {renderBoard()}
          </div>
          
          {/* SVG Overlay */}
          {renderSnakesAndLadders()}

          {/* Player Tokens */}
          {renderPlayers()}
        </div>

        {/* Controls */}
        {gameState === 'playing' && (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/50 text-center space-y-6">
            
            <div className="h-6">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={message}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-amber-400 text-sm font-medium"
                >
                  {message}
                </motion.p>
              </AnimatePresence>
            </div>

            <RenderDiceFace value={diceValue} isRolling={isRolling} />

            <div className="pt-2">
              <button
                onClick={rollDice}
                disabled={isRolling || players[currentPlayerIdx]?.isBot}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all"
              >
                {isRolling ? t.rolling : players[currentPlayerIdx]?.isBot ? `${players[currentPlayerIdx].name} thinking...` : t.roll}
              </button>
            </div>
            
            <div className="text-sm text-slate-400 flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${players[currentPlayerIdx]?.color}`} />
              {isRtl ? 'نوبت:' : 'Turn:'} <strong className="text-slate-200">{players[currentPlayerIdx]?.name}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Win Modal */}
      <AnimatePresence>
        {gameState === 'won' && winner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-amber-500/30 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl shadow-amber-500/20"
            >
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{winner.name} {t.winner}</h2>
              <p className="text-slate-400 mb-8">
                {winner.isBot ? (isRtl ? 'ربات برنده شد!' : 'The bot won this time!') : (isRtl ? 'تبریک! شما برنده شدید.' : 'Congratulations! You won the game.')}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setSetupModalOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  {t.playAgain}
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
                >
                  {t.exit}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GameMatchSetupModal
        isOpen={setupModalOpen}
        onClose={() => navigate('/games')}
        onStart={handleSetupComplete}
        gameType="snakes_and_ladders"
      />
      
      {!setupModalOpen && <InGameReactions gameId="snakes_ladders" />}

      {/* Confetti Celebration */}
      <ConfettiOverlay active={showConfetti} onDone={() => setShowConfetti(false)} />
    </div>
  );
}
