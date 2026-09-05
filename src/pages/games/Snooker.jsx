import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, 
  Users, Bot, Globe, Shield, MessageSquare, Send, Award, Flame, 
  HelpCircle, Settings, ArrowRight, CheckCircle2, Shuffle, Play, Share2,
  Sun, Moon, ShoppingBag, Target, Info
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import SnookerSetupModal, { TABLE_THEMES } from '../../components/games/SnookerSetupModal';
import SnookerCueStoreModal, { SNOOKER_CUES } from '../../components/games/SnookerCueStoreModal';
import InGameChatDrawer from '../../components/games/InGameChatDrawer';
import ConfettiOverlay from '../../components/games/ConfettiOverlay';
import WaitingForOpponentOverlay from '../../components/games/WaitingForOpponentOverlay';
import OpponentProfileModal from '../../components/games/OpponentProfileModal';
import realtimeNetwork from '../../services/realtimeNetwork';
import { shareToTelegram, shareMatchResultToTelegram } from '../../utils/telegram';

// ── 1. Table Dimensions & Official Snooker Coordinates ────────────────
const W = 960;
const H = 480;
const MARGIN_X = 46;
const MARGIN_Y = 46;
const PLAY_W = W - 2 * MARGIN_X;
const PLAY_H = H - 2 * MARGIN_Y;
const BALL_R = 9.8;
const FRICTION = 0.987;
const MIN_VEL = 0.08;

// Pockets geometry
const POCKET_R = 21;
const POCKET_MID_R = 19;
const POCKETS = [
  { id: 'TL', x: MARGIN_X + 2, y: MARGIN_Y + 2, r: POCKET_R },
  { id: 'TM', x: W / 2, y: MARGIN_Y - 4, r: POCKET_MID_R },
  { id: 'TR', x: W - MARGIN_X - 2, y: MARGIN_Y + 2, r: POCKET_R },
  { id: 'BL', x: MARGIN_X + 2, y: H - MARGIN_Y - 2, r: POCKET_R },
  { id: 'BM', x: W / 2, y: H - MARGIN_Y + 4, r: POCKET_MID_R },
  { id: 'BR', x: W - MARGIN_X - 2, y: H - MARGIN_Y - 2, r: POCKET_R },
];

// Official Snooker Spots
const BAULK_X = MARGIN_X + PLAY_W * 0.20;
const D_RADIUS = PLAY_H * 0.29;
const SPOTS = {
  brown:  { x: BAULK_X, y: H / 2, color: '#854d0e', nameFa: 'قهوه‌ای', nameEn: 'Brown', points: 4 },
  green:  { x: BAULK_X, y: H / 2 - D_RADIUS, color: '#16a34a', nameFa: 'سبز', nameEn: 'Green', points: 3 },
  yellow: { x: BAULK_X, y: H / 2 + D_RADIUS, color: '#eab308', nameFa: 'زرد', nameEn: 'Yellow', points: 2 },
  blue:   { x: MARGIN_X + PLAY_W * 0.50, y: H / 2, color: '#2563eb', nameFa: 'آبی', nameEn: 'Blue', points: 5 },
  pink:   { x: MARGIN_X + PLAY_W * 0.75, y: H / 2, color: '#ec4899', nameFa: 'صورتی', nameEn: 'Pink', points: 6 },
  black:  { x: MARGIN_X + PLAY_W * 0.89, y: H / 2, color: '#18181b', nameFa: 'مشکی', nameEn: 'Black', points: 7 },
};

const SEQUENCE_ORDER = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];

// ── 2. Create Initial Official 22 Snooker Balls ──────────────────────
function createInitialSnookerBalls() {
  const balls = [];
  let idCounter = 1;

  // 1. Cue Ball (White)
  balls.push({
    id: 0,
    type: 'white',
    nameFa: 'سفید',
    nameEn: 'White',
    points: 0,
    color: '#ffffff',
    x: BAULK_X - 35,
    y: H / 2 + 15,
    vx: 0,
    vy: 0,
    potted: false
  });

  // 2. Colours (Yellow, Green, Brown, Blue, Pink, Black)
  Object.keys(SPOTS).forEach(key => {
    const spot = SPOTS[key];
    balls.push({
      id: idCounter++,
      type: key,
      nameFa: spot.nameFa,
      nameEn: spot.nameEn,
      points: spot.points,
      color: spot.color,
      x: spot.x,
      y: spot.y,
      vx: 0,
      vy: 0,
      potted: false,
      spotKey: key
    });
  });

  // 3. 15 Reds in Triangle Rack (Behind Pink spot)
  const redApexX = SPOTS.pink.x + BALL_R * 2 + 3;
  const redApexY = H / 2;
  const rows = [1, 2, 3, 4, 5];
  const rowSpacing = BALL_R * 1.76;
  const colSpacing = BALL_R * 2.05;

  rows.forEach((count, rowIndex) => {
    const startY = redApexY - ((count - 1) * colSpacing) / 2;
    const rowX = redApexX + rowIndex * rowSpacing;
    for (let i = 0; i < count; i++) {
      balls.push({
        id: idCounter++,
        type: 'red',
        nameFa: 'قرمز',
        nameEn: 'Red',
        points: 1,
        color: '#dc2626',
        x: rowX,
        y: startY + i * colSpacing,
        vx: 0,
        vy: 0,
        potted: false
      });
    }
  });

  return balls;
}

// ── Helper Math Functions ─────────────────────────────────────────────
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

export default function Snooker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    userProfile = {}, 
    userCoins = 0, 
    addCoins, 
    addXP, 
    recordGameResult,
    isRtl = true 
  } = useAppStore();

  const myUserId = userProfile.username || 'user_1';
  const myUserName = userProfile.fullName || 'قهرمان اسنوکر';

  // Game Settings & State
  const [setupModalOpen, setSetupModalOpen] = useState(true);
  const [cueStoreOpen, setCueStoreOpen] = useState(false);
  const [selectedCueId, setSelectedCueId] = useState('ash_classic');
  const [selectedTheme, setSelectedTheme] = useState(TABLE_THEMES[0]);
  const [gameMode, setGameMode] = useState('bot'); // 'bot' | 'matchmaking' | 'online' | 'local' | 'practice'
  const [botDifficulty, setBotDifficulty] = useState('medium');
  const [matchFrames, setMatchFrames] = useState(1);
  const [currentFrame, setCurrentFrame] = useState(1);

  // Scores
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [framesWonP1, setFramesWonP1] = useState(0);
  const [framesWonP2, setFramesWonP2] = useState(0);
  const [currentBreak, setCurrentBreak] = useState(0);
  const [highestBreak, setHighestBreak] = useState(0);

  // Snooker Match Flow
  const [turn, setTurn] = useState('p1'); // 'p1' | 'p2' (or 'bot')
  const [targetBallType, setTargetBallType] = useState('red'); // 'red' | 'colour' | 'sequence'
  const [activeSequenceIndex, setActiveSequenceIndex] = useState(0);
  const [foulMessage, setFoulMessage] = useState(null);
  const [announcementMsg, setAnnouncementMsg] = useState(null);
  const [isShooting, setIsShooting] = useState(false);
  const [ballInHand, setBallInHand] = useState(false);
  const [frameWinner, setFrameWinner] = useState(null);
  const [matchWinner, setMatchWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Cue Stick Controls & Aiming
  const [aimAngle, setAimAngle] = useState(0);
  const [shotPower, setShotPower] = useState(50); // 0 - 100
  const [spinOffset, setSpinOffset] = useState({ x: 0, y: 0 }); // -1 to 1 (x = english, y = screw/follow)
  const [isPullingCue, setIsPullingCue] = useState(false);

  // Modals & Chat
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [waitingOverlay, setWaitingOverlay] = useState(false);
  const [onlineRoomCode, setOnlineRoomCode] = useState('');
  const [myOnlineRole, setMyOnlineRole] = useState('p1');

  // Canvas & Physics Refs
  const canvasRef = useRef(null);
  const stateRef = useRef({
    balls: createInitialSnookerBalls(),
    isMoving: false,
    firstHitBall: null,
    pottedInCurrentShot: [],
    cueStrikeAnim: 0,
    turn: 'p1',
    targetBallType: 'red',
    activeSequenceIndex: 0,
    currentBreak: 0,
    scoreP1: 0,
    scoreP2: 0,
    gameMode: 'bot'
  });

  // Sync ref with states
  useEffect(() => {
    stateRef.current.turn = turn;
    stateRef.current.targetBallType = targetBallType;
    stateRef.current.activeSequenceIndex = activeSequenceIndex;
    stateRef.current.currentBreak = currentBreak;
    stateRef.current.scoreP1 = scoreP1;
    stateRef.current.scoreP2 = scoreP2;
    stateRef.current.gameMode = gameMode;
  }, [turn, targetBallType, activeSequenceIndex, currentBreak, scoreP1, scoreP2, gameMode]);

  // Load saved equipped cue
  useEffect(() => {
    try {
      const saved = localStorage.getItem('snooker_equipped_cue');
      if (saved && SNOOKER_CUES.some(c => c.id === saved)) {
        setSelectedCueId(saved);
      }
    } catch (_) {}
  }, []);

  const handleSelectCue = (cueId) => {
    setSelectedCueId(cueId);
    try {
      localStorage.setItem('snooker_equipped_cue', cueId);
    } catch (_) {}
  };

  // ── 3. Start Game Handler ──────────────────────────────────────────
  const handleStartGame = ({ mode, botDifficulty: diff, frames, theme, roomCode }) => {
    setGameMode(mode);
    if (diff) setBotDifficulty(diff);
    if (frames) setMatchFrames(frames);
    if (theme) setSelectedTheme(theme);
    
    // Reset balls and match state
    const newBalls = createInitialSnookerBalls();
    stateRef.current.balls = newBalls;
    setScoreP1(0);
    setScoreP2(0);
    setCurrentBreak(0);
    setTurn('p1');
    setTargetBallType('red');
    setActiveSequenceIndex(0);
    setFrameWinner(null);
    setMatchWinner(null);
    setFoulMessage(null);
    setBallInHand(false);
    setSetupModalOpen(false);

    if (mode === 'online') {
      const code = roomCode || `SNOO-${Math.floor(1000 + Math.random() * 9000)}`;
      setOnlineRoomCode(code);
      setMyOnlineRole('p1');
      setWaitingOverlay(true);
      realtimeNetwork.joinRoom(code, myUserId, myUserName);
    } else if (mode === 'matchmaking') {
      const code = `SNOO-RANDOM-${Math.floor(1000 + Math.random() * 9000)}`;
      setOnlineRoomCode(code);
      setWaitingOverlay(true);
      realtimeNetwork.joinRoom(code, myUserId, myUserName);
    }
  };

  // Handle URL deep link parameters
  useEffect(() => {
    const room = searchParams.get('room');
    const modeParam = searchParams.get('mode');
    const roleParam = searchParams.get('role');
    const autostart = searchParams.get('autostart');

    if (room) {
      setOnlineRoomCode(room);
      setGameMode('online');
      setMyOnlineRole(roleParam === 'p2' ? 'p2' : 'p1');
      setSetupModalOpen(false);
      realtimeNetwork.joinRoom(room, myUserId, myUserName);
      if (roleParam === 'p2') {
        setWaitingOverlay(false);
      }
    }
  }, [searchParams]);

  // ── 4. Physics Engine Step ─────────────────────────────────────────
  const resolveBallCollision = (a, b) => {
    const d = dist(a, b);
    if (d === 0) return;
    const nx = (b.x - a.x) / d;
    const ny = (b.y - a.y) / d;
    const dvx = a.vx - b.vx;
    const dvy = a.vy - b.vy;
    const imp = dvx * nx + dvy * ny;
    if (imp <= 0) return;

    // Record first hit for foul check
    if ((a.id === 0 || b.id === 0) && !stateRef.current.firstHitBall) {
      stateRef.current.firstHitBall = a.id === 0 ? b : a;
      soundEngine?.playTap?.();
      haptics?.impact?.('light');
    }

    const restitution = 0.96;
    a.vx -= (1 + restitution) * 0.5 * imp * nx;
    a.vy -= (1 + restitution) * 0.5 * imp * ny;
    b.vx += (1 + restitution) * 0.5 * imp * nx;
    b.vy += (1 + restitution) * 0.5 * imp * ny;

    // Positional separation
    const overlap = BALL_R * 2 - d + 0.2;
    a.x -= nx * overlap * 0.5;
    a.y -= ny * overlap * 0.5;
    b.x += nx * overlap * 0.5;
    b.y += ny * overlap * 0.5;
  };

  const stepPhysics = () => {
    const state = stateRef.current;
    const balls = state.balls;
    const activeCue = SNOOKER_CUES.find(c => c.id === selectedCueId) || SNOOKER_CUES[0];

    // Sub-stepping for ultra-high accuracy without tunneling
    const SUB_STEPS = 4;
    for (let step = 0; step < SUB_STEPS; step++) {
      // 1. Move & Wall Collision
      balls.forEach(b => {
        if (b.potted) return;
        b.vx *= Math.pow(FRICTION, 1 / SUB_STEPS);
        b.vy *= Math.pow(FRICTION, 1 / SUB_STEPS);
        if (Math.abs(b.vx) < MIN_VEL) b.vx = 0;
        if (Math.abs(b.vy) < MIN_VEL) b.vy = 0;

        b.x += b.vx / SUB_STEPS;
        b.y += b.vy / SUB_STEPS;

        // Cushion Boundaries with pocket clearance
        const leftWall = MARGIN_X + BALL_R;
        const rightWall = W - MARGIN_X - BALL_R;
        const topWall = MARGIN_Y + BALL_R;
        const bottomWall = H - MARGIN_Y - BALL_R;

        // Check if ball is not near any pocket mouth before bouncing off cushions
        const nearPocket = POCKETS.some(p => Math.hypot(b.x - p.x, b.y - p.y) < p.r * 1.4);
        if (!nearPocket) {
          if (b.x < leftWall) { b.x = leftWall; b.vx = -b.vx * 0.82; }
          if (b.x > rightWall) { b.x = rightWall; b.vx = -b.vx * 0.82; }
          if (b.y < topWall) { b.y = topWall; b.vy = -b.vy * 0.82; }
          if (b.y > bottomWall) { b.y = bottomWall; b.vy = -b.vy * 0.82; }
        }
      });

      // 2. Ball-Ball Collision
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          if (balls[i].potted || balls[j].potted) continue;
          if (dist(balls[i], balls[j]) < BALL_R * 2) {
            resolveBallCollision(balls[i], balls[j]);
          }
        }
      }

      // 3. Pocket Detection with Suction Gravity Well
      balls.forEach(b => {
        if (b.potted) return;
        POCKETS.forEach(p => {
          const d = Math.hypot(b.x - p.x, b.y - p.y);
          if (d < p.r) {
            b.potted = true;
            b.vx = 0;
            b.vy = 0;
            state.pottedInCurrentShot.push({ ...b });
            soundEngine?.playSuccess?.();
            haptics?.impact?.('medium');
          } else if (d < p.r * 1.5) {
            // Pocket mouth suction
            const pull = (p.r * 1.5 - d) * 0.15;
            b.vx += ((p.x - b.x) / d) * pull;
            b.vy += ((p.y - b.y) / d) * pull;
          }
        });
      });
    }

    const movingNow = balls.some(b => !b.potted && (Math.abs(b.vx) > 0.05 || Math.abs(b.vy) > 0.05));
    
    // Shot just ended
    if (state.isMoving && !movingNow) {
      state.isMoving = false;
      handleShotEnded();
    }
    state.isMoving = movingNow;
  };

  // ── 5. Official Snooker Rules & Shot Evaluation ────────────────────
  const respawnColorBall = (colorType) => {
    const balls = stateRef.current.balls;
    const targetBall = balls.find(b => b.type === colorType);
    if (!targetBall) return;

    const originalSpot = SPOTS[colorType];
    // Check if original spot is occupied
    const isOccupied = (x, y) => balls.some(b => !b.potted && b.id !== targetBall.id && Math.hypot(b.x - x, b.y - y) < BALL_R * 2);

    let spawnX = originalSpot.x;
    let spawnY = originalSpot.y;

    if (isOccupied(spawnX, spawnY)) {
      // Try highest available spots (Black -> Pink -> Blue -> Brown -> Green -> Yellow)
      const spotOrder = ['black', 'pink', 'blue', 'brown', 'green', 'yellow'];
      let found = false;
      for (const sKey of spotOrder) {
        if (!isOccupied(SPOTS[sKey].x, SPOTS[sKey].y)) {
          spawnX = SPOTS[sKey].x;
          spawnY = SPOTS[sKey].y;
          found = true;
          break;
        }
      }
      if (!found) {
        // Place towards top cushion along longitudinal line
        spawnX = Math.min(W - MARGIN_X - BALL_R * 2, originalSpot.x + BALL_R * 2.5);
      }
    }

    targetBall.x = spawnX;
    targetBall.y = spawnY;
    targetBall.vx = 0;
    targetBall.vy = 0;
    targetBall.potted = false;
  };

  const handleShotEnded = () => {
    const state = stateRef.current;
    const { firstHitBall, pottedInCurrentShot, targetBallType: target, turn: curTurn } = state;
    const balls = state.balls;
    const unpottedReds = balls.filter(b => b.type === 'red' && !b.potted).length;

    let isFoul = false;
    let foulReason = '';
    let penaltyPoints = 4;

    const cueBallPotted = pottedInCurrentShot.some(b => b.type === 'white');

    // Rule Check 1: Cue Ball In-Off (Potted in pocket)
    if (cueBallPotted) {
      isFoul = true;
      foulReason = isRtl ? 'خطا! توپ سفید در پاکت افتاد (In-Off)' : 'Foul! Cue ball potted';
      penaltyPoints = Math.max(4, firstHitBall ? firstHitBall.points : 4);
    }
    // Rule Check 2: Miss (No ball hit)
    else if (!firstHitBall) {
      isFoul = true;
      foulReason = isRtl ? 'خطا! عدم برخورد با هیچ توپی (Miss)' : 'Foul! Missed all balls';
      penaltyPoints = 4;
    }
    // Rule Check 3: Legal First Hit Ball
    else {
      if (target === 'red') {
        if (firstHitBall.type !== 'red') {
          isFoul = true;
          foulReason = isRtl ? `خطا! برخورد با ${firstHitBall.nameFa} به جای قرمز` : `Foul! Hit ${firstHitBall.nameEn} first instead of Red`;
          penaltyPoints = Math.max(4, firstHitBall.points);
        }
      } else if (target === 'colour') {
        if (firstHitBall.type === 'red') {
          isFoul = true;
          foulReason = isRtl ? 'خطا! برخورد با قرمز به جای توپ رنگی' : 'Foul! Hit Red first instead of Colour';
          penaltyPoints = 4;
        }
      } else if (target === 'sequence') {
        const expectedColorType = SEQUENCE_ORDER[activeSequenceIndex];
        if (firstHitBall.type !== expectedColorType) {
          isFoul = true;
          foulReason = isRtl ? `خطا! باید ابتدا به توپ ${SPOTS[expectedColorType]?.nameFa} ضربه می‌زدید` : `Foul! Must hit ${expectedColorType} first`;
          penaltyPoints = Math.max(4, firstHitBall.points, SPOTS[expectedColorType]?.points || 4);
        }
      }
    }

    // Check potted balls legality
    const redBallsPotted = pottedInCurrentShot.filter(b => b.type === 'red');
    const colourBallsPotted = pottedInCurrentShot.filter(b => b.type !== 'red' && b.type !== 'white');

    if (!isFoul) {
      if (target === 'red') {
        if (colourBallsPotted.length > 0) {
          isFoul = true;
          foulReason = isRtl ? 'خطا! پاکت شدن توپ رنگی هنگام نوبت قرمز' : 'Foul! Colour potted on red turn';
          penaltyPoints = Math.max(4, ...colourBallsPotted.map(c => c.points));
        } else if (redBallsPotted.length === 0) {
          // No ball potted, legal shot -> Turn passes to opponent
        }
      } else if (target === 'colour') {
        if (redBallsPotted.length > 0) {
          isFoul = true;
          foulReason = isRtl ? 'خطا! پاکت شدن قرمز هنگام نوبت رنگی' : 'Foul! Red potted on colour turn';
          penaltyPoints = 4;
        } else if (colourBallsPotted.length > 1) {
          isFoul = true;
          foulReason = isRtl ? 'خطا! پاکت شدن بیش از یک توپ رنگی' : 'Foul! Multiple colours potted';
          penaltyPoints = Math.max(4, ...colourBallsPotted.map(c => c.points));
        }
      } else if (target === 'sequence') {
        const expectedColorType = SEQUENCE_ORDER[activeSequenceIndex];
        const wrongColours = colourBallsPotted.filter(c => c.type !== expectedColorType);
        if (wrongColours.length > 0 || redBallsPotted.length > 0) {
          isFoul = true;
          foulReason = isRtl ? 'خطا! پاکت شدن توپ خارج از نوبت ترتیبی' : 'Foul! Wrong colour potted in sequence';
          penaltyPoints = Math.max(4, ...wrongColours.map(c => c.points), SPOTS[expectedColorType]?.points || 4);
        }
      }
    }

    // ── Apply Outcome ──
    if (isFoul) {
      // Award penalty to opponent
      soundEngine?.playError?.();
      haptics?.error?.();
      setFoulMessage(foulReason);
      setTimeout(() => setFoulMessage(null), 4000);

      if (curTurn === 'p1') {
        setScoreP2(prev => prev + penaltyPoints);
      } else {
        setScoreP1(prev => prev + penaltyPoints);
      }

      // Respawn any potted colours
      colourBallsPotted.forEach(cb => respawnColorBall(cb.type));

      // Reset white ball if potted
      if (cueBallPotted) {
        const white = balls.find(b => b.type === 'white');
        if (white) {
          white.x = BAULK_X - 35;
          white.y = H / 2;
          white.vx = 0;
          white.vy = 0;
          white.potted = false;
          setBallInHand(true);
        }
      }

      // Switch turn
      const nextTurn = curTurn === 'p1' ? 'p2' : 'p1';
      setTurn(nextTurn);
      setCurrentBreak(0);
      setTargetBallType(unpottedReds > 0 ? 'red' : 'sequence');
    } else {
      // Legal Shot
      let pointsScored = 0;

      if (target === 'red' && redBallsPotted.length > 0) {
        pointsScored = redBallsPotted.length * 1;
        setTargetBallType('colour');
        setAnnouncementMsg(isRtl ? `🔴 +${pointsScored} امتیاز (نوبت توپ رنگی)` : `🔴 +${pointsScored} (Nominate Colour)`);
      } else if (target === 'colour' && colourBallsPotted.length === 1) {
        const pottedColour = colourBallsPotted[0];
        pointsScored = pottedColour.points;
        
        if (unpottedReds > 0) {
          // Respawn colour on spot
          respawnColorBall(pottedColour.type);
          setTargetBallType('red');
          setAnnouncementMsg(isRtl ? `⭐ +${pointsScored} امتیاز (نوبت قرمز بعدی)` : `⭐ +${pointsScored} (Shoot next Red)`);
        } else {
          // Reds are finished! Enter sequence phase
          setTargetBallType('sequence');
          setActiveSequenceIndex(0);
          setAnnouncementMsg(isRtl ? `🏆 تمام قرمزها تمام شد! فاز پایانی رنگی‌ها (زرد تا مشکی)` : `🏆 Sequence phase started!`);
        }
      } else if (target === 'sequence' && colourBallsPotted.length === 1) {
        const expectedColorType = SEQUENCE_ORDER[activeSequenceIndex];
        const pottedColour = colourBallsPotted[0];
        if (pottedColour.type === expectedColorType) {
          pointsScored = pottedColour.points;
          const nextSeq = activeSequenceIndex + 1;
          setActiveSequenceIndex(nextSeq);
          
          if (nextSeq >= SEQUENCE_ORDER.length) {
            // Frame is officially finished!
            handleFrameWin();
            return;
          } else {
            setAnnouncementMsg(isRtl ? `✨ +${pointsScored} امتیاز (توپ بعدی: ${SPOTS[SEQUENCE_ORDER[nextSeq]]?.nameFa})` : `✨ +${pointsScored} (Next: ${SEQUENCE_ORDER[nextSeq]})`);
          }
        }
      }

      if (pointsScored > 0) {
        soundEngine?.playScore?.();
        haptics?.success?.();
        const newBreak = currentBreak + pointsScored;
        setCurrentBreak(newBreak);
        if (newBreak > highestBreak) setHighestBreak(newBreak);

        if (curTurn === 'p1') {
          setScoreP1(prev => prev + pointsScored);
        } else {
          setScoreP2(prev => prev + pointsScored);
        }
        setTimeout(() => setAnnouncementMsg(null), 2500);
      } else {
        // Legal shot with no pot -> End break and switch turn
        const nextTurn = curTurn === 'p1' ? 'p2' : 'p1';
        setTurn(nextTurn);
        setCurrentBreak(0);
        setTargetBallType(unpottedReds > 0 ? 'red' : 'sequence');
      }
    }

    // Reset shot tracking
    state.firstHitBall = null;
    state.pottedInCurrentShot = [];
    setIsShooting(false);
  };

  const handleFrameWin = () => {
    const s1 = stateRef.current.scoreP1;
    const s2 = stateRef.current.scoreP2;
    const winner = s1 >= s2 ? 'p1' : 'p2';
    setFrameWinner(winner);

    const newWonP1 = winner === 'p1' ? framesWonP1 + 1 : framesWonP1;
    const newWonP2 = winner === 'p2' ? framesWonP2 + 1 : framesWonP2;
    setFramesWonP1(newWonP1);
    setFramesWonP2(newWonP2);

    const neededToWin = Math.ceil(matchFrames / 2);
    if (newWonP1 >= neededToWin || newWonP2 >= neededToWin) {
      const mWin = newWonP1 >= neededToWin ? 'p1' : 'p2';
      setMatchWinner(mWin);
      if (mWin === 'p1') {
        setShowConfetti(true);
        addCoins?.(100 * matchFrames);
        addXP?.(250 * matchFrames, 'پیروزی در مچ اسنوکر');
      }
      recordGameResult?.({
        gameId: 'snooker',
        gameName: isRtl ? 'اسنوکر شاهانه' : 'Royal Snooker',
        gameIcon: '🎱',
        won: mWin === 'p1',
        opponent: gameMode === 'bot' ? '🤖 ربات هوشمند' : 'بازیکن آنلاین',
        coinsEarned: mWin === 'p1' ? 100 * matchFrames : 0
      });
    }

    soundEngine?.playLevelUp?.();
    haptics?.success?.();
  };

  // ── 6. Execute Player Shot ─────────────────────────────────────────
  const handleExecuteShot = () => {
    if (stateRef.current.isMoving || isShooting) return;
    const white = stateRef.current.balls.find(b => b.type === 'white');
    if (!white || white.potted) return;

    soundEngine?.playTap?.();
    haptics?.impact?.('heavy');
    setIsShooting(true);

    const activeCue = SNOOKER_CUES.find(c => c.id === selectedCueId) || SNOOKER_CUES[0];
    const powerMult = (shotPower / 100) * (activeCue.power / 75) * 18.5;

    const rad = (aimAngle * Math.PI) / 180;
    white.vx = Math.cos(rad) * powerMult;
    white.vy = Math.sin(rad) * powerMult;

    // Apply spin effect
    white.vx += spinOffset.x * 1.5;
    white.vy += spinOffset.y * 1.5;

    stateRef.current.isMoving = true;
    stateRef.current.firstHitBall = null;
    stateRef.current.pottedInCurrentShot = [];
  };

  // ── 7. Smart Snooker AI Bot Logic ──────────────────────────────────
  useEffect(() => {
    if (gameMode !== 'bot' || turn !== 'p2' || stateRef.current.isMoving || isShooting || frameWinner) return;

    const botTimer = setTimeout(() => {
      const state = stateRef.current;
      const balls = state.balls;
      const white = balls.find(b => b.type === 'white');
      if (!white || white.potted) return;

      const unpottedReds = balls.filter(b => b.type === 'red' && !b.potted);
      const targetType = state.targetBallType;

      let candidateTargets = [];
      if (targetType === 'red') {
        candidateTargets = unpottedReds;
      } else if (targetType === 'colour') {
        candidateTargets = balls.filter(b => b.type !== 'red' && b.type !== 'white' && !b.potted);
      } else if (targetType === 'sequence') {
        const expected = SEQUENCE_ORDER[activeSequenceIndex];
        candidateTargets = balls.filter(b => b.type === expected && !b.potted);
      }

      if (candidateTargets.length === 0) return;

      // Find the best pot angle among all pockets
      let bestShot = null;
      let highestScore = -Infinity;

      candidateTargets.forEach(targetBall => {
        POCKETS.forEach(pocket => {
          const ballToPocketAngle = Math.atan2(pocket.y - targetBall.y, pocket.x - targetBall.x);
          const contactX = targetBall.x - Math.cos(ballToPocketAngle) * BALL_R * 2;
          const contactY = targetBall.y - Math.sin(ballToPocketAngle) * BALL_R * 2;

          const cueToContactAngle = Math.atan2(contactY - white.y, contactX - white.x);
          const angleDiff = Math.abs(ballToPocketAngle - cueToContactAngle);
          const cutAngleDeg = (angleDiff * 180) / Math.PI;

          if (cutAngleDeg < 80) {
            const distance = dist(white, targetBall) + dist(targetBall, pocket);
            const score = (100 - cutAngleDeg) * 2 + (targetBall.points || 1) * 15 - distance * 0.1;
            if (score > highestScore) {
              highestScore = score;
              bestShot = {
                angleDeg: (cueToContactAngle * 180) / Math.PI,
                power: Math.min(85, Math.max(35, distance * 0.12 + 25))
              };
            }
          }
        });
      });

      if (bestShot) {
        // Add slight inaccuracy variance based on difficulty
        const variance = botDifficulty === 'hard' ? 0.5 : botDifficulty === 'medium' ? 1.8 : 3.5;
        const randomError = (Math.random() - 0.5) * variance;
        const finalAngle = bestShot.angleDeg + randomError;

        setAimAngle(finalAngle);
        setShotPower(bestShot.power);

        setTimeout(() => {
          const rad = (finalAngle * Math.PI) / 180;
          const powerMult = (bestShot.power / 100) * 18.5;
          white.vx = Math.cos(rad) * powerMult;
          white.vy = Math.sin(rad) * powerMult;
          state.isMoving = true;
          state.firstHitBall = null;
          state.pottedInCurrentShot = [];
          soundEngine?.playTap?.();
        }, 600);
      } else {
        // Safety shot
        const safeAngle = 180 + (Math.random() - 0.5) * 30;
        setAimAngle(safeAngle);
        setShotPower(30);
        setTimeout(() => {
          const rad = (safeAngle * Math.PI) / 180;
          white.vx = Math.cos(rad) * 6;
          white.vy = Math.sin(rad) * 6;
          state.isMoving = true;
          state.firstHitBall = null;
          state.pottedInCurrentShot = [];
        }, 600);
      }
    }, 1200);

    return () => clearTimeout(botTimer);
  }, [turn, gameMode, isShooting, frameWinner, activeSequenceIndex]);

  // ── 8. Canvas Render Loop ──────────────────────────────────────────
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      stepPhysics();

      // Clear & Draw Table
      ctx.clearRect(0, 0, W, H);

      // Outer Wood Cushion Border with Metallic Corner Caps
      ctx.fillStyle = selectedTheme.borderColor || '#382212';
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 24);
      ctx.fill();

      // Wood Inlay Accents
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(MARGIN_X - 12, MARGIN_Y - 12, PLAY_W + 24, PLAY_H + 24);

      // Inner Baize Cloth
      ctx.fillStyle = selectedTheme.clothColor || '#0b532c';
      ctx.fillRect(MARGIN_X, MARGIN_Y, PLAY_W, PLAY_H);

      // Cushion Nose Lines
      ctx.fillStyle = selectedTheme.cushionColor || '#073d1f';
      ctx.fillRect(MARGIN_X, MARGIN_Y - 8, PLAY_W, 8); // Top
      ctx.fillRect(MARGIN_X, H - MARGIN_Y, PLAY_W, 8); // Bottom
      ctx.fillRect(MARGIN_X - 8, MARGIN_Y, 8, PLAY_H); // Left
      ctx.fillRect(W - MARGIN_X, MARGIN_Y, 8, PLAY_H); // Right

      // Baulk Line & "D" Markings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(BAULK_X, MARGIN_Y);
      ctx.lineTo(BAULK_X, H - MARGIN_Y);
      ctx.stroke();

      // Semi-Circle "D"
      ctx.beginPath();
      ctx.arc(BAULK_X, H / 2, D_RADIUS, Math.PI / 2, -Math.PI / 2, false);
      ctx.stroke();

      // Spot Markers (Small crosshairs)
      Object.keys(SPOTS).forEach(key => {
        const s = SPOTS[key];
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw 6 Pockets (Drop Pockets with Leather Depth & Brass Rims)
      POCKETS.forEach(p => {
        // Pocket hole
        ctx.fillStyle = '#050505';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Brass pocket rim
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });

      // ── Draw Balls with 3D Specular Shading & Drop Shadows ──
      const balls = stateRef.current.balls;
      balls.forEach(b => {
        if (b.potted) return;

        // Ball Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(b.x + 2, b.y + 3, BALL_R * 1.05, BALL_R * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ball Base Body (Radial Gradient for 3D sphere illusion)
        const grad = ctx.createRadialGradient(
          b.x - BALL_R * 0.35, b.y - BALL_R * 0.35, BALL_R * 0.1,
          b.x, b.y, BALL_R
        );

        if (b.type === 'white') {
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.7, '#e2e8f0');
          grad.addColorStop(1, '#94a3b8');
        } else if (b.type === 'red') {
          grad.addColorStop(0, '#f87171');
          grad.addColorStop(0.6, '#dc2626');
          grad.addColorStop(1, '#7f1d1d');
        } else if (b.type === 'black') {
          grad.addColorStop(0, '#52525b');
          grad.addColorStop(0.7, '#18181b');
          grad.addColorStop(1, '#09090b');
        } else {
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.2, b.color);
          grad.addColorStop(1, '#111827');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();

        // Specular glint highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.arc(b.x - BALL_R * 0.35, b.y - BALL_R * 0.35, BALL_R * 0.28, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Draw Aiming Raycaster, Ghost Ball & Trajectory Line ──
      const white = balls.find(b => b.type === 'white');
      const activeCue = SNOOKER_CUES.find(c => c.id === selectedCueId) || SNOOKER_CUES[0];

      if (white && !white.potted && !stateRef.current.isMoving && (!isShooting || isPullingCue)) {
        const rad = (aimAngle * Math.PI) / 180;
        const dirX = Math.cos(rad);
        const dirY = Math.sin(rad);

        // Raycast forward to find first ball collision or wall
        let minRayDist = 450 * (activeCue.aimLength / 70);
        let hitTargetBall = null;

        balls.forEach(b => {
          if (b.id === 0 || b.potted) return;
          const toTargetX = b.x - white.x;
          const toTargetY = b.y - white.y;
          const proj = toTargetX * dirX + toTargetY * dirY;
          if (proj > 0) {
            const perpDist = Math.abs(toTargetX * -dirY + toTargetY * dirX);
            if (perpDist < BALL_R * 2) {
              const collideDist = proj - Math.sqrt(Math.max(0, Math.pow(BALL_R * 2, 2) - Math.pow(perpDist, 2)));
              if (collideDist > 0 && collideDist < minRayDist) {
                minRayDist = collideDist;
                hitTargetBall = b;
              }
            }
          }
        });

        const ghostX = white.x + dirX * minRayDist;
        const ghostY = white.y + dirY * minRayDist;

        // Primary Aim Line (Dashed laser)
        ctx.strokeStyle = activeCue.glowColor || 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(white.x, white.y);
        ctx.lineTo(ghostX, ghostY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ghost Ball Circle at point of contact
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ghostX, ghostY, BALL_R, 0, Math.PI * 2);
        ctx.stroke();

        // Target Ball Deflection Trajectory Line
        if (hitTargetBall) {
          const normX = (hitTargetBall.x - ghostX) / (BALL_R * 2);
          const normY = (hitTargetBall.y - ghostY) / (BALL_R * 2);
          const targetPathLength = 160 * (activeCue.aimLength / 75);

          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(hitTargetBall.x, hitTargetBall.y);
          ctx.lineTo(hitTargetBall.x + normX * targetPathLength, hitTargetBall.y + normY * targetPathLength);
          ctx.stroke();

          // Arrow head at target line tip
          const tipX = hitTargetBall.x + normX * targetPathLength;
          const tipY = hitTargetBall.y + normY * targetPathLength;
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(tipX, tipY, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // ── Draw 3D Cue Stick ──
        const cueLength = 260;
        const pullBack = (shotPower / 100) * 35;
        const cueTipDist = BALL_R + 10 + pullBack;
        const cueStartX = white.x - dirX * cueTipDist;
        const cueStartY = white.y - dirY * cueTipDist;
        const cueEndX = white.x - dirX * (cueTipDist + cueLength);
        const cueEndY = white.y - dirY * (cueTipDist + cueLength);

        // Cue Stick Shaft
        ctx.strokeStyle = activeCue.tipColor || '#f59e0b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cueStartX, cueStartY);
        ctx.lineTo(cueStartX - dirX * 25, cueStartY - dirY * 25);
        ctx.stroke();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 6.5;
        ctx.beginPath();
        ctx.moveTo(cueStartX - dirX * 25, cueStartY - dirY * 25);
        ctx.lineTo(cueEndX, cueEndY);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [aimAngle, shotPower, selectedCueId, selectedTheme, isPullingCue, isShooting]);

  // Touch & Drag to Aim on Canvas
  const handleCanvasPointerDown = (e) => {
    if (stateRef.current.isMoving || isShooting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const white = stateRef.current.balls.find(b => b.type === 'white');
    if (!white) return;

    const angleRad = Math.atan2(clickY - white.y, clickX - white.x);
    setAimAngle((angleRad * 180) / Math.PI);
  };

  const handleCanvasPointerMove = (e) => {
    if (e.buttons !== 1 || stateRef.current.isMoving || isShooting) return;
    handleCanvasPointerDown(e);
  };

  const remainingReds = stateRef.current.balls.filter(b => b.type === 'red' && !b.potted).length;
  const remainingPointsOnTable = remainingReds * 8 + 27;

  return (
    <div 
      className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between select-none overflow-x-hidden font-sans"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* ── 1. Top Header & Match Status ── */}
      <div className="w-full max-w-5xl px-3 sm:px-6 py-2.5 flex items-center justify-between border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/games')}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} className={isRtl ? 'rotate-180' : ''} />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
              <span>🎱 {isRtl ? 'اسنوکر شاهانه' : 'Royal Snooker 3D'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {isRtl ? `فریم ${currentFrame} از ${matchFrames}` : `Frame ${currentFrame}/${matchFrames}`}
              </span>
            </h1>
            <p className="text-[10px] text-amber-400 font-medium">
              {isRtl ? `امتیاز باقی‌مانده روی میز: ${remainingPointsOnTable}` : `Remaining on Table: ${remainingPointsOnTable}`}
            </p>
          </div>
        </div>

        {/* Action Controls & Store Shortcut */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => { soundEngine?.playTap?.(); setCueStoreOpen(true); }}
            className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all flex items-center gap-1 active:scale-95"
          >
            <ShoppingBag size={14} />
            <span className="hidden sm:inline">{isRtl ? 'فروشگاه چوب' : 'Cues'}</span>
          </button>
          
          <button
            onClick={() => { soundEngine?.playTap?.(); setChatDrawerOpen(true); }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors relative"
          >
            <MessageSquare size={16} />
          </button>

          <button
            onClick={() => { soundEngine?.playTap?.(); setSetupModalOpen(true); }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* ── 2. Live Scoreboard Banner ── */}
      <div className="w-full max-w-4xl px-3 pt-2">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-950 to-slate-900/90 border border-white/10 flex items-center justify-between shadow-xl">
          {/* Player 1 (You) */}
          <div 
            onClick={() => {
              setProfileModalUser({ name: myUserName, role: 'p1', isMe: true });
              setProfileModalOpen(true);
            }}
            className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
              turn === 'p1' ? 'bg-emerald-500/20 border border-emerald-400/50 shadow-md' : 'opacity-70'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400/60 flex items-center justify-center text-base font-black text-emerald-300">
              👤
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">{myUserName}</span>
                {turn === 'p1' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {isRtl ? `فریم‌های برده: ${framesWonP1}` : `Frames: ${framesWonP1}`}
              </p>
            </div>
            <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400 mr-2">
              {scoreP1}
            </span>
          </div>

          {/* Center Target & Break Display */}
          <div className="text-center px-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-amber-500/40 text-amber-300 font-black text-xs">
              <Target size={13} className="text-amber-400" />
              <span>
                {targetBallType === 'red' 
                  ? (isRtl ? 'هدف: توپ قرمز 🔴' : 'Target: Red 🔴') 
                  : targetBallType === 'colour' 
                    ? (isRtl ? 'هدف: توپ رنگی دلخواه ⭐' : 'Target: Any Colour ⭐')
                    : (isRtl ? `فاز ترتیبی: ${SPOTS[SEQUENCE_ORDER[activeSequenceIndex]]?.nameFa || 'مشکی'}` : `Sequence: ${SEQUENCE_ORDER[activeSequenceIndex]}`)}
              </span>
            </div>
            {currentBreak > 0 && (
              <p className="text-[11px] font-black text-amber-400 flex items-center justify-center gap-1 mt-0.5 animate-pulse">
                <Flame size={12} />
                <span>{isRtl ? `بریک جاری: ${currentBreak}` : `Break: ${currentBreak}`}</span>
              </p>
            )}
          </div>

          {/* Player 2 (Opponent / Bot) */}
          <div 
            onClick={() => {
              setProfileModalUser({ 
                name: gameMode === 'bot' ? 'ربات چاژا 🤖' : 'حریف آنلاین', 
                role: 'p2', 
                isMe: false 
              });
              setProfileModalOpen(true);
            }}
            className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer ${
              turn === 'p2' ? 'bg-cyan-500/20 border border-cyan-400/50 shadow-md' : 'opacity-70'
            }`}
          >
            <span className="text-xl sm:text-2xl font-mono font-black text-cyan-400 ml-2">
              {scoreP2}
            </span>
            <div className="text-left">
              <div className="flex items-center gap-1.5 justify-end">
                {turn === 'p2' && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                <span className="text-xs font-black text-white">
                  {gameMode === 'bot' ? 'ربات چاژا 🤖' : (isRtl ? 'حریف آنلاین' : 'Opponent')}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono text-left">
                {isRtl ? `فریم‌ها: ${framesWonP2}` : `Frames: ${framesWonP2}`}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/30 border border-cyan-400/60 flex items-center justify-center text-base font-black text-cyan-300">
              {gameMode === 'bot' ? '🤖' : '👤'}
            </div>
          </div>
        </div>

        {/* Notifications & Foul Messages */}
        <AnimatePresence>
          {foulMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 py-1.5 px-4 rounded-xl bg-rose-600/30 border border-rose-500/50 text-rose-300 font-bold text-xs text-center shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>⚠️</span>
              <span>{foulMessage}</span>
            </motion.div>
          )}

          {announcementMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 py-1.5 px-4 rounded-xl bg-amber-500/25 border border-amber-400/50 text-amber-300 font-bold text-xs text-center shadow-lg"
            >
              {announcementMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 3. Main Snooker Table Canvas Viewport ── */}
      <div className="w-full max-w-4xl px-2 py-2 flex items-center justify-center flex-1">
        <div className="relative w-full aspect-[2/1] max-h-[65vh] rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/20 bg-black flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            className="w-full h-full object-contain cursor-crosshair touch-none"
          />

          {/* Turn Indicator Overlay */}
          <div className="absolute top-3 left-4 pointer-events-none">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-black/60 border border-white/10 text-slate-300 backdrop-blur-md">
              {turn === 'p1' ? (isRtl ? '🟢 نوبت شما' : '🟢 Your Turn') : (isRtl ? '🔴 نوبت حریف' : '🔴 Opponent Turn')}
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. Tactical Cue Controls & Power Bar ── */}
      <div className="w-full max-w-3xl px-3 pb-3 pt-1 space-y-2">
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 flex items-center gap-3 justify-between">
          
          {/* Micro Angle Fine Tuning */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEngine?.playTap?.();
                setAimAngle(prev => (prev - 1 + 360) % 360);
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 font-mono font-bold text-xs"
            >
              -1°
            </button>
            <span className="text-xs font-mono font-black text-amber-400 w-10 text-center">
              {Math.round(aimAngle)}°
            </span>
            <button
              onClick={() => {
                soundEngine?.playTap?.();
                setAimAngle(prev => (prev + 1) % 360);
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 font-mono font-bold text-xs"
            >
              +1°
            </button>
          </div>

          {/* Shot Power Slider */}
          <div className="flex-1 max-w-xs flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap">
              ⚡ {isRtl ? 'قدرت:' : 'Power:'}
            </span>
            <input
              type="range"
              min="10"
              max="100"
              value={shotPower}
              onChange={(e) => setShotPower(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-amber-400 w-8 text-left">
              {shotPower}%
            </span>
          </div>

          {/* Main Shoot / Strike Button */}
          <button
            onClick={handleExecuteShot}
            disabled={stateRef.current.isMoving || (gameMode === 'bot' && turn === 'p2')}
            className={`py-3 px-6 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center gap-2 cursor-pointer ${
              stateRef.current.isMoving || (gameMode === 'bot' && turn === 'p2')
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/30'
            }`}
          >
            <span>🎱</span>
            <span>{isRtl ? 'ضربه (Strike)' : 'Strike'}</span>
          </button>
        </div>
      </div>

      {/* ── 5. Setup & Store Modals ── */}
      <SnookerSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onStartGame={handleStartGame}
        selectedCueId={selectedCueId}
        onOpenCueStore={() => {
          setSetupModalOpen(false);
          setCueStoreOpen(true);
        }}
        isRtl={isRtl}
      />

      <SnookerCueStoreModal
        isOpen={cueStoreOpen}
        onClose={() => setCueStoreOpen(false)}
        selectedCueId={selectedCueId}
        onSelectCue={handleSelectCue}
        isRtl={isRtl}
      />

      {/* In-Game Chat Drawer */}
      <InGameChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        onSendMessage={(text) => {
          if (onlineRoomCode) {
            realtimeNetwork.sendChat(onlineRoomCode, myUserName, text);
          }
        }}
        isRtl={isRtl}
      />

      {/* Opponent & Self Profile Modal */}
      <OpponentProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        opponent={profileModalUser}
        isRtl={isRtl}
      />

      {/* Waiting for Opponent Online Overlay */}
      <WaitingForOpponentOverlay
        isVisible={waitingOverlay}
        roomCode={onlineRoomCode}
        gameTitle={isRtl ? 'اسنوکر شاهانه سه‌بعدی' : 'Royal Snooker 3D'}
        gameIcon="🎱"
        onCancel={() => {
          setWaitingOverlay(false);
          setGameMode('bot');
        }}
        onShareTelegram={() => {
          shareToTelegram({
            roomCode: onlineRoomCode,
            gameType: 'snooker',
            gameTitleFa: 'اسنوکر شاهانه'
          });
        }}
        shareLink={`https://t.me/chazha_bot?start=room_${onlineRoomCode}`}
        isRtl={isRtl}
      />

      {/* Frame / Match Winner Modal */}
      <AnimatePresence>
        {(frameWinner || matchWinner) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-black border-2 border-amber-400/70 p-6 text-center shadow-2xl space-y-4"
            >
              <div className="text-6xl animate-bounce">
                {matchWinner ? '👑' : '🏆'}
              </div>
              <h3 className="text-xl font-black text-white">
                {matchWinner
                  ? (matchWinner === 'p1' ? (isRtl ? '🎉 تبریک! قهرمان مسابقه اسنوکر شدید!' : 'Match Winner: You!') : (isRtl ? '🏆 حریف قهرمان مسابقه شد!' : 'Match Winner: Opponent'))
                  : (frameWinner === 'p1' ? (isRtl ? '🎉 برنده این فریم: شما' : 'Frame Won: You') : (isRtl ? '🏆 برنده فریم: حریف' : 'Frame Won: Opponent'))}
              </h3>

              {/* Score Bar */}
              <div className="flex justify-center gap-6 text-xs font-mono font-bold bg-black/50 py-2.5 px-4 rounded-2xl border border-white/10">
                <div>
                  <span className="text-emerald-400 block text-base font-black">{scoreP1}</span>
                  <span className="text-slate-400 text-[10px]">{myUserName}</span>
                </div>
                <div className="w-px bg-white/20" />
                <div>
                  <span className="text-cyan-400 block text-base font-black">{scoreP2}</span>
                  <span className="text-slate-400 text-[10px]">
                    {gameMode === 'bot' ? 'ربات چاژا' : 'حریف'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                {matchWinner ? (
                  <>
                    <button
                      onClick={() => handleStartGame({ mode: gameMode, frames: matchFrames, theme: selectedTheme })}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg active:scale-95"
                    >
                      {isRtl ? 'شروع مسابقه جدید 🎱' : 'Start New Match'}
                    </button>

                    {/* Share Result Card to Telegram */}
                    <button
                      onClick={() => {
                        const winnerName = matchWinner === 'p1' ? myUserName : (gameMode === 'bot' ? 'ربات چاژا 🤖' : 'حریف آنلاین');
                        shareMatchResultToTelegram({
                          gameTitleFa: 'اسنوکر شاهانه',
                          winnerName,
                          myScore: scoreP1,
                          opponentScore: scoreP2,
                          roomCode: onlineRoomCode || `SNOO-${myUserId}`,
                          gameType: 'snooker'
                        });
                        soundEngine?.playTap?.();
                      }}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-xs shadow-lg shadow-sky-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Share2 size={16} />
                      <span>{isRtl ? '📤 اشتراک‌گذاری کارت نتیجه در تلگرام' : 'Share Result Card to Telegram'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setCurrentFrame(prev => prev + 1);
                      setFrameWinner(null);
                      stateRef.current.balls = createInitialSnookerBalls();
                      setScoreP1(0);
                      setScoreP2(0);
                      setCurrentBreak(0);
                      setTurn('p1');
                      setTargetBallType('red');
                      setActiveSequenceIndex(0);
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs shadow-lg active:scale-95"
                  >
                    {isRtl ? 'رفتن به فریم بعدی ⏭️' : 'Next Frame ⏭️'}
                  </button>
                )}

                <button
                  onClick={() => navigate('/games')}
                  className="w-full py-2.5 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors"
                >
                  {isRtl ? 'خروج به منوی بازی‌ها' : 'Exit to Games Menu'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfettiOverlay isVisible={showConfetti} />
    </div>
  );
}
