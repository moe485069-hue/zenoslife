import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, 
  Users, Bot, Globe, Shield, MessageSquare, Send, Award, Flame, 
  HelpCircle, Settings, ArrowRight, CheckCircle2, Shuffle, Play, Share2,
  Sun, Moon, ShoppingBag, Target, Info, MoreVertical, Eye, EyeOff,
  ChevronUp, ChevronDown, Check, Zap, X
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import SnookerSetupModal, { TABLE_THEMES } from '../../components/games/SnookerSetupModal';
import SnookerCueStoreModal, { SNOOKER_CUES } from '../../components/games/SnookerCueStoreModal';
import SnookerSpinModal from '../../components/games/SnookerSpinModal';
import SnookerRulesModal from '../../components/games/SnookerRulesModal';
import InGameChatDrawer from '../../components/games/InGameChatDrawer';
import ConfettiOverlay from '../../components/games/ConfettiOverlay';
import WaitingForOpponentOverlay from '../../components/games/WaitingForOpponentOverlay';
import OpponentProfileModal from '../../components/games/OpponentProfileModal';
import realtimeNetwork from '../../services/realtimeNetwork';
import { shareToTelegram, shareMatchResultToTelegram } from '../../utils/telegram';

// ── 1. Vertical Portrait Table Dimensions & Coordinates ───────────────
// Snooker ratio is 2:1 (12ft x 6ft). Canvas is 480 x 960 (Portrait)
const W = 480;
const H = 960;
const MARGIN_X = 42; // Left & Right cushion wood border
const MARGIN_Y = 82; // Top & Bottom cushion wood border
const PLAY_W = W - 2 * MARGIN_X; // 396
const PLAY_H = H - 2 * MARGIN_Y; // 796 (approx 2:1 snooker proportion)
const BALL_R = 10.2;
const FRICTION = 0.988;
const MIN_VEL = 0.06;

// Pocket coordinates on vertical portrait table
const POCKET_CORNER_R = 21;
const POCKET_MID_R = 19;
const POCKETS = [
  { id: 'TL', x: MARGIN_X + 2, y: MARGIN_Y + 2, r: POCKET_CORNER_R },
  { id: 'TR', x: W - MARGIN_X - 2, y: MARGIN_Y + 2, r: POCKET_CORNER_R },
  { id: 'ML', x: MARGIN_X - 3, y: H / 2, r: POCKET_MID_R },
  { id: 'MR', x: W - MARGIN_X + 3, y: H / 2, r: POCKET_MID_R },
  { id: 'BL', x: MARGIN_X + 2, y: H - MARGIN_Y - 2, r: POCKET_CORNER_R },
  { id: 'BR', x: W - MARGIN_X - 2, y: H - MARGIN_Y - 2, r: POCKET_CORNER_R },
];

// Official Snooker Spots (Vertical Table: Baulk at Bottom, Black at Top)
const BAULK_Y = H - MARGIN_Y - PLAY_H * 0.20; // 720
const D_RADIUS = PLAY_W * 0.28; // 110
const SPOTS = {
  brown:  { x: W / 2, y: BAULK_Y, color: '#854d0e', nameFa: 'قهوه‌ای', nameEn: 'Brown', points: 4 },
  green:  { x: W / 2 - D_RADIUS, y: BAULK_Y, color: '#16a34a', nameFa: 'سبز', nameEn: 'Green', points: 3 },
  yellow: { x: W / 2 + D_RADIUS, y: BAULK_Y, color: '#eab308', nameFa: 'زرد', nameEn: 'Yellow', points: 2 },
  blue:   { x: W / 2, y: H / 2, color: '#2563eb', nameFa: 'آبی', nameEn: 'Blue', points: 5 },
  pink:   { x: W / 2, y: MARGIN_Y + PLAY_H * 0.25, color: '#ec4899', nameFa: 'صورتی', nameEn: 'Pink', points: 6 },
  black:  { x: W / 2, y: MARGIN_Y + PLAY_H * 0.11, color: '#18181b', nameFa: 'مشکی', nameEn: 'Black', points: 7 },
};

const SEQUENCE_ORDER = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];

// ── 2. Create Initial Official 22 Snooker Balls ──────────────────────
function createInitialSnookerBalls() {
  const balls = [];
  let idCounter = 1;

  // 1. Cue Ball (White) - inside the "D" at the bottom
  balls.push({
    id: 0,
    type: 'white',
    nameFa: 'سفید',
    nameEn: 'White',
    points: 0,
    color: '#ffffff',
    x: W / 2 - 28,
    y: BAULK_Y + 35,
    vx: 0,
    vy: 0,
    spinX: 0,
    spinY: 0,
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

  // 3. 15 Reds in Triangle Rack (Between Pink and Black, Apex near Pink facing down)
  const redApexX = W / 2;
  const redApexY = SPOTS.pink.y - (BALL_R * 2 + 3);
  const rows = [1, 2, 3, 4, 5];
  const rowSpacing = BALL_R * 1.76;
  const colSpacing = BALL_R * 2.05;

  rows.forEach((count, rowIndex) => {
    const startX = redApexX - ((count - 1) * colSpacing) / 2;
    const rowY = redApexY - rowIndex * rowSpacing;
    for (let i = 0; i < count; i++) {
      balls.push({
        id: idCounter++,
        type: 'red',
        nameFa: 'قرمز',
        nameEn: 'Red',
        points: 1,
        color: '#dc2626',
        x: startX + i * colSpacing,
        y: rowY,
        vx: 0,
        vy: 0,
        potted: false
      });
    }
  });

  return balls;
}

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
  const [spinModalOpen, setSpinModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

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

  // Cue Stick Controls & Aiming (Default aiming up table at -90 deg)
  const [aimAngle, setAimAngle] = useState(-90);
  const [shotPower, setShotPower] = useState(50); // 0 - 100
  const [spinOffset, setSpinOffset] = useState({ x: 0, y: 0 }); // -1 to 1 (x = english, y = screw/follow)
  const [isPullingCue, setIsPullingCue] = useState(false);
  const [powerSliderPos, setPowerSliderPos] = useState(0); // 0 to 100 for visual pull-back slider
  const [showAimLaser, setShowAimLaser] = useState(true);

  // Modals & Chat
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [waitingOverlay, setWaitingOverlay] = useState(false);
  const [onlineRoomCode, setOnlineRoomCode] = useState('');
  const [myOnlineRole, setMyOnlineRole] = useState('p1');

  // Canvas & Physics Refs
  const canvasRef = useRef(null);
  const powerSliderRef = useRef(null);
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
    setAimAngle(-90);

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
      if (!soundMuted) soundEngine?.playTap?.();
      haptics?.impact?.('light');

      // Apply Cue Ball Screw/Draw back or Topspin Follow through
      const whiteBall = a.id === 0 ? a : b.id === 0 ? b : null;
      if (whiteBall && (whiteBall.spinY !== 0 || whiteBall.spinX !== 0)) {
        // Backspin (screw / draw back)
        if (whiteBall.spinY > 0) {
          whiteBall.vx -= nx * imp * (whiteBall.spinY * 0.48);
          whiteBall.vy -= ny * imp * (whiteBall.spinY * 0.48);
        } else if (whiteBall.spinY < 0) {
          // Topspin (follow through)
          whiteBall.vx += nx * imp * (Math.abs(whiteBall.spinY) * 0.38);
          whiteBall.vy += ny * imp * (Math.abs(whiteBall.spinY) * 0.38);
        }
        // Fade spin after impact
        whiteBall.spinX *= 0.5;
        whiteBall.spinY *= 0.5;
      }
    }

    const restitution = 0.95;
    a.vx -= (1 + restitution) * 0.5 * imp * nx;
    a.vy -= (1 + restitution) * 0.5 * imp * ny;
    b.vx += (1 + restitution) * 0.5 * imp * nx;
    b.vy += (1 + restitution) * 0.5 * imp * ny;

    // Positional separation to prevent sticking
    const overlap = BALL_R * 2 - d + 0.15;
    a.x -= nx * overlap * 0.5;
    a.y -= ny * overlap * 0.5;
    b.x += nx * overlap * 0.5;
    b.y += ny * overlap * 0.5;
  };

  const stepPhysics = () => {
    const state = stateRef.current;
    const balls = state.balls;

    // Sub-stepping for ultra-smooth trajectory without tunneling
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

        // Cushion Boundaries with pocket mouth clearances
        const leftWall = MARGIN_X + BALL_R;
        const rightWall = W - MARGIN_X - BALL_R;
        const topWall = MARGIN_Y + BALL_R;
        const bottomWall = H - MARGIN_Y - BALL_R;

        // Check if near any pocket
        const nearPocket = POCKETS.some(p => Math.hypot(b.x - p.x, b.y - p.y) < p.r * 1.35);
        if (!nearPocket) {
          if (b.x < leftWall) { 
            b.x = leftWall; 
            b.vx = -b.vx * 0.84; 
            if (b.id === 0 && b.spinX) b.vy += b.spinX * 1.2;
          }
          if (b.x > rightWall) { 
            b.x = rightWall; 
            b.vx = -b.vx * 0.84; 
            if (b.id === 0 && b.spinX) b.vy += b.spinX * 1.2;
          }
          if (b.y < topWall) { 
            b.y = topWall; 
            b.vy = -b.vy * 0.84; 
            if (b.id === 0 && b.spinX) b.vx += b.spinX * 1.2;
          }
          if (b.y > bottomWall) { 
            b.y = bottomWall; 
            b.vy = -b.vy * 0.84; 
            if (b.id === 0 && b.spinX) b.vx += b.spinX * 1.2;
          }
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
            if (!soundMuted) soundEngine?.playSuccess?.();
            haptics?.impact?.('medium');
          } else if (d < p.r * 1.45) {
            // Pocket mouth funnel suction
            const pull = (p.r * 1.45 - d) * 0.16;
            b.vx += ((p.x - b.x) / d) * pull;
            b.vy += ((p.y - b.y) / d) * pull;
          }
        });
      });
    }

    const movingNow = balls.some(b => !b.potted && (Math.abs(b.vx) > 0.05 || Math.abs(b.vy) > 0.05));
    
    // Shot ended transition
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
    const isOccupied = (x, y) => balls.some(b => !b.potted && b.id !== targetBall.id && Math.hypot(b.x - x, b.y - y) < BALL_R * 2);

    let spawnX = originalSpot.x;
    let spawnY = originalSpot.y;

    if (isOccupied(spawnX, spawnY)) {
      // Highest available spot order
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
        spawnY = Math.max(MARGIN_Y + BALL_R * 2, originalSpot.y - BALL_R * 2.5);
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

    // Rule Check 1: Cue Ball In-Off
    if (cueBallPotted) {
      isFoul = true;
      foulReason = isRtl ? 'خطا! توپ سفید در پاکت افتاد (In-Off)' : 'Foul! Cue ball potted';
      penaltyPoints = Math.max(4, firstHitBall ? firstHitBall.points : 4);
    }
    // Rule Check 2: Miss
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
      if (!soundMuted) soundEngine?.playError?.();
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

      // Reset cue ball if potted
      if (cueBallPotted) {
        const white = balls.find(b => b.type === 'white');
        if (white) {
          white.x = W / 2;
          white.y = BAULK_Y + 25;
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
      let pointsScored = 0;

      if (target === 'red' && redBallsPotted.length > 0) {
        pointsScored = redBallsPotted.length * 1;
        setTargetBallType('colour');
        setAnnouncementMsg(isRtl ? `🔴 +${pointsScored} امتیاز (نوبت توپ رنگی)` : `🔴 +${pointsScored} (Nominate Colour)`);
      } else if (target === 'colour' && colourBallsPotted.length === 1) {
        const pottedColour = colourBallsPotted[0];
        pointsScored = pottedColour.points;
        
        if (unpottedReds > 0) {
          respawnColorBall(pottedColour.type);
          setTargetBallType('red');
          setAnnouncementMsg(isRtl ? `⭐ +${pointsScored} امتیاز (نوبت قرمز بعدی)` : `⭐ +${pointsScored} (Shoot next Red)`);
        } else {
          setTargetBallType('sequence');
          setActiveSequenceIndex(0);
          setAnnouncementMsg(isRtl ? `🏆 تمام قرمزها پاکت شد! فاز ترتیبی رنگی‌ها (زرد تا مشکی)` : `🏆 Sequence phase started!`);
        }
      } else if (target === 'sequence' && colourBallsPotted.length === 1) {
        const expectedColorType = SEQUENCE_ORDER[activeSequenceIndex];
        const pottedColour = colourBallsPotted[0];
        if (pottedColour.type === expectedColorType) {
          pointsScored = pottedColour.points;
          const nextSeq = activeSequenceIndex + 1;
          setActiveSequenceIndex(nextSeq);
          
          if (nextSeq >= SEQUENCE_ORDER.length) {
            handleFrameWin();
            return;
          } else {
            setAnnouncementMsg(isRtl ? `✨ +${pointsScored} امتیاز (توپ بعدی: ${SPOTS[SEQUENCE_ORDER[nextSeq]]?.nameFa})` : `✨ +${pointsScored} (Next: ${SEQUENCE_ORDER[nextSeq]})`);
          }
        }
      }

      if (pointsScored > 0) {
        if (!soundMuted) soundEngine?.playScore?.();
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
        const nextTurn = curTurn === 'p1' ? 'p2' : 'p1';
        setTurn(nextTurn);
        setCurrentBreak(0);
        setTargetBallType(unpottedReds > 0 ? 'red' : 'sequence');
      }
    }

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

    if (!soundMuted) soundEngine?.playLevelUp?.();
    haptics?.success?.();
  };

  // ── 6. Execute Player Shot ─────────────────────────────────────────
  const handleExecuteShot = (overridePower) => {
    if (stateRef.current.isMoving || isShooting) return;
    const white = stateRef.current.balls.find(b => b.type === 'white');
    if (!white || white.potted) return;

    if (!soundMuted) soundEngine?.playTap?.();
    haptics?.impact?.('heavy');
    setIsShooting(true);

    const activeCue = SNOOKER_CUES.find(c => c.id === selectedCueId) || SNOOKER_CUES[0];
    const powerValue = overridePower !== undefined ? overridePower : shotPower;
    const powerMult = (powerValue / 100) * (activeCue.power / 75) * 19.5;

    const rad = (aimAngle * Math.PI) / 180;
    white.vx = Math.cos(rad) * powerMult;
    white.vy = Math.sin(rad) * powerMult;

    // Apply spin settings
    white.spinX = spinOffset.x;
    white.spinY = spinOffset.y;

    stateRef.current.isMoving = true;
    stateRef.current.firstHitBall = null;
    stateRef.current.pottedInCurrentShot = [];
    setPowerSliderPos(0);
  };

  // ── 7. Left Power Bar Touch Drag Handler (Plato Style) ──────────────
  const handlePowerPointerDown = (e) => {
    if (stateRef.current.isMoving || (gameMode === 'bot' && turn === 'p2')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPullingCue(true);
    updatePowerFromEvent(e);
  };

  const handlePowerPointerMove = (e) => {
    if (!isPullingCue) return;
    updatePowerFromEvent(e);
  };

  const updatePowerFromEvent = (e) => {
    const rect = powerSliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    // Drag down to increase power
    const relativeY = e.clientY - rect.top;
    const pct = Math.min(100, Math.max(0, (relativeY / rect.height) * 100));
    setShotPower(Math.round(pct));
    setPowerSliderPos(pct);
  };

  const handlePowerPointerUp = (e) => {
    if (!isPullingCue) return;
    setIsPullingCue(false);
    if (shotPower >= 6) {
      handleExecuteShot(shotPower);
    } else {
      setPowerSliderPos(0);
    }
  };

  // ── 8. Smart Snooker AI Bot Logic ──────────────────────────────────
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

      // Find the best cut angle to any pocket
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
        const variance = botDifficulty === 'hard' ? 0.4 : botDifficulty === 'medium' ? 1.6 : 3.5;
        const randomError = (Math.random() - 0.5) * variance;
        const finalAngle = bestShot.angleDeg + randomError;

        setAimAngle(finalAngle);
        setShotPower(bestShot.power);

        setTimeout(() => {
          const rad = (finalAngle * Math.PI) / 180;
          const powerMult = (bestShot.power / 100) * 19.5;
          white.vx = Math.cos(rad) * powerMult;
          white.vy = Math.sin(rad) * powerMult;
          state.isMoving = true;
          state.firstHitBall = null;
          state.pottedInCurrentShot = [];
          if (!soundMuted) soundEngine?.playTap?.();
          haptics?.impact?.('heavy');
        }, 600);
      }
    }, 1000);

    return () => clearTimeout(botTimer);
  }, [turn, gameMode, isShooting, frameWinner, botDifficulty, activeSequenceIndex]);

  // ── 9. Render Canvas Viewport & 3D Snooker Graphics ────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      stepPhysics();

      // Clear Canvas
      ctx.clearRect(0, 0, W, H);

      // ── Outer Wood Cushion Rail (Luxury Mahogany) ──
      const woodGrad = ctx.createLinearGradient(0, 0, W, H);
      woodGrad.addColorStop(0, '#2d1810');
      woodGrad.addColorStop(0.5, '#452213');
      woodGrad.addColorStop(1, '#241209');
      ctx.fillStyle = woodGrad;
      ctx.roundRect(0, 0, W, H, 36);
      ctx.fill();

      // Subtle Outer Wood Bevel Highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2.5;
      ctx.roundRect(2, 2, W - 4, H - 4, 34);
      ctx.stroke();

      // ── Snooker Cloth Playing Bed ──
      ctx.fillStyle = selectedTheme.clothColor || '#0b532c';
      ctx.fillRect(MARGIN_X, MARGIN_Y, PLAY_W, PLAY_H);

      // Cushion Nose Lines (Rich green cushion rubber face)
      ctx.fillStyle = selectedTheme.cushionColor || '#073d1f';
      ctx.fillRect(MARGIN_X, MARGIN_Y - 8, PLAY_W, 8); // Top
      ctx.fillRect(MARGIN_X, H - MARGIN_Y, PLAY_W, 8); // Bottom
      ctx.fillRect(MARGIN_X - 8, MARGIN_Y, 8, PLAY_H); // Left
      ctx.fillRect(W - MARGIN_X, MARGIN_Y, 8, PLAY_H); // Right

      // Baulk Line & "D" Markings (Official Snooker Baulk at Bottom)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(MARGIN_X, BAULK_Y);
      ctx.lineTo(W - MARGIN_X, BAULK_Y);
      ctx.stroke();

      // Semicircle "D" (Pointing Downward toward bottom cushion)
      ctx.beginPath();
      ctx.arc(W / 2, BAULK_Y, D_RADIUS, 0, Math.PI, false);
      ctx.stroke();

      // Spot Markers (Small crosses on cloth)
      Object.keys(SPOTS).forEach(key => {
        const s = SPOTS[key];
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Draw 6 Snooker Drop Pockets & Curved Jaws ──
      POCKETS.forEach(p => {
        // Drop Pocket Hole (Pure Deep Depth)
        ctx.fillStyle = '#040404';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Polished Brass Pocket Corner Rim
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Brass Pocket Shading
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r - 2, 0, Math.PI * 2);
        ctx.stroke();
      });

      // ── Draw Balls with 3D Glossy Specular Shading & Drop Shadows ──
      const balls = stateRef.current.balls;
      balls.forEach(b => {
        if (b.potted) return;

        // Realistic Soft Radial Drop Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(b.x + 2.5, b.y + 3.5, BALL_R * 1.05, BALL_R * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3D Sphere Radial Gradient with Realistic Light Source (Top-Left)
        const grad = ctx.createRadialGradient(
          b.x - BALL_R * 0.35, b.y - BALL_R * 0.35, BALL_R * 0.08,
          b.x, b.y, BALL_R
        );

        if (b.type === 'white') {
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.35, '#f8fafc');
          grad.addColorStop(0.75, '#cbd5e1');
          grad.addColorStop(1, '#64748b');
        } else if (b.type === 'red') {
          grad.addColorStop(0, '#fca5a5');
          grad.addColorStop(0.25, '#ef4444');
          grad.addColorStop(0.75, '#b91c1c');
          grad.addColorStop(1, '#450a0a');
        } else if (b.type === 'black') {
          grad.addColorStop(0, '#71717a');
          grad.addColorStop(0.3, '#27272a');
          grad.addColorStop(0.8, '#09090b');
          grad.addColorStop(1, '#000000');
        } else if (b.type === 'yellow') {
          grad.addColorStop(0, '#fef08a');
          grad.addColorStop(0.3, '#eab308');
          grad.addColorStop(0.75, '#a16207');
          grad.addColorStop(1, '#422006');
        } else if (b.type === 'green') {
          grad.addColorStop(0, '#86efac');
          grad.addColorStop(0.3, '#16a34a');
          grad.addColorStop(0.75, '#14532d');
          grad.addColorStop(1, '#052e16');
        } else if (b.type === 'brown') {
          grad.addColorStop(0, '#d97706');
          grad.addColorStop(0.3, '#92400e');
          grad.addColorStop(0.75, '#78350f');
          grad.addColorStop(1, '#381e09');
        } else if (b.type === 'blue') {
          grad.addColorStop(0, '#93c5fd');
          grad.addColorStop(0.3, '#2563eb');
          grad.addColorStop(0.75, '#1e40af');
          grad.addColorStop(1, '#0f172a');
        } else if (b.type === 'pink') {
          grad.addColorStop(0, '#fbcfe8');
          grad.addColorStop(0.3, '#ec4899');
          grad.addColorStop(0.75, '#9d174d');
          grad.addColorStop(1, '#500724');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R, 0, Math.PI * 2);
        ctx.fill();

        // Specular Glint Reflection Arc
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(b.x - BALL_R * 0.35, b.y - BALL_R * 0.35, BALL_R * 0.26, 0, Math.PI * 2);
        ctx.fill();

        // Subtle Bottom Cloth Reflection
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALL_R - 0.6, Math.PI * 0.25, Math.PI * 0.75);
        ctx.stroke();
      });

      // ── Aiming Raycaster, Ghost Ball & 3D Cue Stick ──
      const white = balls.find(b => b.type === 'white');
      const activeCue = SNOOKER_CUES.find(c => c.id === selectedCueId) || SNOOKER_CUES[0];

      if (white && !white.potted && !stateRef.current.isMoving && (!isShooting || isPullingCue)) {
        const rad = (aimAngle * Math.PI) / 180;
        const dirX = Math.cos(rad);
        const dirY = Math.sin(rad);

        // Raycast forward to find first ball collision or wall
        let minRayDist = 550 * (activeCue.aimLength / 70);
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

        if (showAimLaser) {
          // Primary Aim Laser Line (Dashed neon)
          ctx.strokeStyle = activeCue.glowColor || 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.8;
          ctx.setLineDash([7, 4]);
          ctx.beginPath();
          ctx.moveTo(white.x, white.y);
          ctx.lineTo(ghostX, ghostY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Ghost Ball Circle at point of contact
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(ghostX, ghostY, BALL_R, 0, Math.PI * 2);
          ctx.stroke();

          // Target Ball Deflection Trajectory Line
          if (hitTargetBall) {
            const normX = (hitTargetBall.x - ghostX) / (BALL_R * 2);
            const normY = (hitTargetBall.y - ghostY) / (BALL_R * 2);
            const targetPathLength = 175 * (activeCue.aimLength / 75);

            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(hitTargetBall.x, hitTargetBall.y);
            ctx.lineTo(hitTargetBall.x + normX * targetPathLength, hitTargetBall.y + normY * targetPathLength);
            ctx.stroke();

            // Arrow head at target line tip
            const tipX = hitTargetBall.x + normX * targetPathLength;
            const tipY = hitTargetBall.y + normY * targetPathLength;
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(tipX, tipY, 3.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // ── Draw 3D Cue Stick ──
        const cueLength = 280;
        // Synchronize cue pullback with powerSliderPos or shotPower
        const currentPull = isPullingCue ? (powerSliderPos / 100) : (shotPower / 100);
        const pullBack = currentPull * 45;
        const cueTipDist = BALL_R + 10 + pullBack;

        const cueStartX = white.x - dirX * cueTipDist;
        const cueStartY = white.y - dirY * cueTipDist;
        const cueEndX = white.x - dirX * (cueTipDist + cueLength);
        const cueEndY = white.y - dirY * (cueTipDist + cueLength);

        // Cue Tip
        ctx.strokeStyle = activeCue.tipColor || '#f59e0b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cueStartX, cueStartY);
        ctx.lineTo(cueStartX - dirX * 22, cueStartY - dirY * 22);
        ctx.stroke();

        // Cue Shaft & Wood Body
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 6.8;
        ctx.beginPath();
        ctx.moveTo(cueStartX - dirX * 22, cueStartY - dirY * 22);
        ctx.lineTo(cueEndX, cueEndY);
        ctx.stroke();

        // Cue Grip Wrap
        ctx.strokeStyle = activeCue.accentGradient ? '#f59e0b' : '#3b2011';
        ctx.lineWidth = 7.6;
        ctx.beginPath();
        ctx.moveTo(cueStartX - dirX * 180, cueStartY - dirY * 180);
        ctx.lineTo(cueEndX, cueEndY);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [aimAngle, shotPower, powerSliderPos, selectedCueId, selectedTheme, isPullingCue, isShooting, showAimLaser, soundMuted]);

  // Touch & Drag to Aim on Canvas
  const handleCanvasPointerDown = (e) => {
    if (stateRef.current.isMoving || isShooting || (gameMode === 'bot' && turn === 'p2')) return;
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
      className="min-h-screen w-full text-white flex flex-col items-center justify-between select-none overflow-hidden font-sans relative"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: '#15121b',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.05) 0%, transparent 60%),
          radial-gradient(circle, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 20px 20px'
      }}
    >
      {/* ── 1. Top Header Bar (Back, Players & 3-Dots Menu) ── */}
      <header className="w-full max-w-lg px-3 py-2 flex items-center justify-between z-40 bg-slate-950/40 backdrop-blur-md border-b border-white/5">
        {/* Back Button */}
        <button
          onClick={() => navigate('/games')}
          className="p-2 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors active:scale-95"
        >
          <ChevronLeft size={20} className={isRtl ? 'rotate-180' : ''} />
        </button>

        {/* Players VS Status Banner (Plato / 8BP Style) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Player 1 (You) */}
          <div 
            onClick={() => {
              setProfileModalUser({ name: myUserName, role: 'p1', isMe: true });
              setProfileModalOpen(true);
            }}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <div className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
              turn === 'p1' ? 'border-emerald-400 shadow-md shadow-emerald-500/40 ring-2 ring-emerald-500/30' : 'border-white/20 opacity-80'
            }`}>
              <span className="text-sm">👤</span>
              {turn === 'p1' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              )}
            </div>
            <div className="text-right">
              <span className="text-[11px] font-black text-white block leading-tight truncate max-w-[65px]">
                {myUserName}
              </span>
              <span className="text-xs font-mono font-black text-emerald-400">
                {scoreP1}
              </span>
            </div>
          </div>

          {/* VS & Break Status */}
          <div className="flex flex-col items-center px-1">
            <span className="text-[10px] font-black text-slate-400 tracking-wider">VS</span>
            {currentBreak > 0 ? (
              <span className="text-[10px] font-black text-amber-400 flex items-center gap-0.5 animate-pulse">
                <Flame size={10} />
                <span>{currentBreak}</span>
              </span>
            ) : (
              <span className="text-[9px] text-slate-500 font-mono font-bold">
                {remainingPointsOnTable}pts
              </span>
            )}
          </div>

          {/* Player 2 (Bot / Opponent) */}
          <div 
            onClick={() => {
              setProfileModalUser({ 
                name: gameMode === 'bot' ? 'ربات چاژا 🤖' : 'حریف آنلاین', 
                role: 'p2', 
                isMe: false 
              });
              setProfileModalOpen(true);
            }}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <div className="text-left">
              <span className="text-[11px] font-black text-white block leading-tight truncate max-w-[65px]">
                {gameMode === 'bot' ? 'ربات چاژا' : (isRtl ? 'حریف' : 'Opponent')}
              </span>
              <span className="text-xs font-mono font-black text-cyan-400">
                {scoreP2}
              </span>
            </div>
            <div className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
              turn === 'p2' ? 'border-cyan-400 shadow-md shadow-cyan-500/40 ring-2 ring-cyan-500/30' : 'border-white/20 opacity-80'
            }`}>
              <span className="text-sm">{gameMode === 'bot' ? '🤖' : '👤'}</span>
              {turn === 'p2' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>
          </div>
        </div>

        {/* 3-Dots Menu Button (Top Right ⋮) */}
        <div className="relative">
          <button
            onClick={() => {
              if (!soundMuted) soundEngine?.playTap?.();
              setMoreMenuOpen(prev => !prev);
            }}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors active:scale-95"
          >
            <MoreVertical size={20} />
          </button>

          {/* Floating Dropdown Menu */}
          <AnimatePresence>
            {moreMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute left-0 mt-2 w-52 rounded-2xl bg-slate-900/95 border border-amber-500/30 shadow-2xl p-1.5 z-50 backdrop-blur-xl space-y-1"
              >
                {/* Cue Store */}
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setCueStoreOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-right text-xs font-bold text-amber-300 hover:bg-amber-500/15 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag size={14} />
                    <span>{isRtl ? 'فروشگاه چوب‌های چاژا' : 'Cues Shop'}</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 font-mono font-black">PRO</span>
                </button>

                {/* Table Theme */}
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setSetupModalOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-right text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <Sun size={14} className="text-emerald-400" />
                  <span>{isRtl ? 'تغییر پوسته و ماهوت میز' : 'Table Themes'}</span>
                </button>

                {/* Snooker Rules */}
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setRulesModalOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-right text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <Info size={14} className="text-sky-400" />
                  <span>{isRtl ? 'راهنما و قوانین اسنوکر' : 'Snooker Rules'}</span>
                </button>

                {/* Toggle Sound */}
                <button
                  onClick={() => {
                    setSoundMuted(prev => !prev);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-right text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {soundMuted ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} className="text-emerald-400" />}
                    <span>{soundMuted ? (isRtl ? 'صدا: خاموش' : 'Sound: Off') : (isRtl ? 'صدا: روشن' : 'Sound: On')}</span>
                  </span>
                </button>

                {/* Restart Frame */}
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    stateRef.current.balls = createInitialSnookerBalls();
                    setScoreP1(0);
                    setScoreP2(0);
                    setCurrentBreak(0);
                    setTurn('p1');
                    setTargetBallType('red');
                    setActiveSequenceIndex(0);
                    setAimAngle(-90);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-right text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <RotateCcw size={14} className="text-amber-400" />
                  <span>{isRtl ? 'شروع مجدد فریم' : 'Restart Frame'}</span>
                </button>

                {/* Chat Drawer */}
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    setChatDrawerOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-right text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <MessageSquare size={14} className="text-teal-400" />
                  <span>{isRtl ? 'چت و ارسال پیام' : 'In-game Chat'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── 2. Match Target & Notification Banner ── */}
      <div className="w-full max-w-sm px-3 pt-1 z-30">
        <div className="py-1 px-3 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-between shadow-lg text-[11px]">
          <div className="flex items-center gap-1.5">
            <Target size={12} className="text-amber-400" />
            <span className="font-bold text-slate-200">
              {targetBallType === 'red' 
                ? (isRtl ? 'هدف: توپ قرمز 🔴' : 'Target: Red 🔴') 
                : targetBallType === 'colour' 
                  ? (isRtl ? 'هدف: رنگی دلخواه ⭐' : 'Target: Any Colour ⭐')
                  : (isRtl ? `ترتیبی: ${SPOTS[SEQUENCE_ORDER[activeSequenceIndex]]?.nameFa || 'مشکی'}` : `Seq: ${SEQUENCE_ORDER[activeSequenceIndex]}`)}
            </span>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            turn === 'p1' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
          }`}>
            {turn === 'p1' ? (isRtl ? 'نوبت شما' : 'Your Turn') : (isRtl ? 'نوبت حریف' : 'Opponent')}
          </span>
        </div>

        {/* Dynamic Fouls & Announcements */}
        <AnimatePresence>
          {foulMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-1.5 py-1 px-3 rounded-xl bg-rose-600/30 border border-rose-500/50 text-rose-300 font-bold text-[11px] text-center shadow-lg"
            >
              ⚠️ {foulMessage}
            </motion.div>
          )}

          {announcementMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-1.5 py-1 px-3 rounded-xl bg-amber-500/25 border border-amber-400/50 text-amber-300 font-bold text-[11px] text-center shadow-lg"
            >
              {announcementMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 3. Main Center Gaming Stage: Table + Left Cue Slider + Right Controls ── */}
      <main className="flex-1 w-full max-w-lg flex items-center justify-center relative px-2 py-1 min-h-0">
        
        {/* ── Left Side: Tactical Vertical Cue Pull-Down Slider (Plato Style) ── */}
        <aside className="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
          <div className="text-[9px] font-mono font-black text-amber-400 mb-1">
            {shotPower}%
          </div>

          {/* Tactile Power Track */}
          <div
            ref={powerSliderRef}
            onPointerDown={handlePowerPointerDown}
            onPointerMove={handlePowerPointerMove}
            onPointerUp={handlePowerPointerUp}
            className="w-10 h-72 sm:h-80 rounded-full bg-slate-950/90 border-2 border-amber-500/40 p-1 flex flex-col justify-end items-center relative cursor-pointer touch-none shadow-2xl select-none"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8), inset 0 2px 8px rgba(0,0,0,0.8)'
            }}
          >
            {/* Illuminated Power Glow Level Underneath */}
            <div
              className="w-full rounded-full transition-all duration-75 relative overflow-hidden"
              style={{
                height: `${powerSliderPos || shotPower}%`,
                background: 'linear-gradient(to top, #10b981 0%, #f59e0b 55%, #ef4444 100%)',
                boxShadow: '0 0 15px rgba(245, 158, 11, 0.6)'
              }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>

            {/* Cue Stick Graphic sliding down inside track */}
            <div
              className="absolute w-2.5 rounded-full bg-amber-200 border border-amber-900 pointer-events-none transition-transform duration-75 shadow-md"
              style={{
                top: `${powerSliderPos * 0.7}%`,
                height: '75%',
                background: 'linear-gradient(to bottom, #fef3c7 0%, #d97706 30%, #78350f 100%)'
              }}
            />

            {/* Pull Down Indicator Label */}
            <div className="absolute top-2 text-[8px] font-black text-slate-500 uppercase tracking-tighter pointer-events-none">
              PULL
            </div>
          </div>
        </aside>

        {/* ── Center: Vertical Snooker Table Canvas Viewport ── */}
        <div className="relative h-full max-h-[75vh] aspect-[1/2] rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/20 bg-black flex items-center justify-center mx-auto">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            className="w-full h-full object-contain cursor-crosshair touch-none"
          />
        </div>

        {/* ── Right Side: Spin Widget, Fine Aim & Aim View ── */}
        <aside className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-3">
          {/* 1. Toggle Aim Laser / View Mode */}
          <button
            onClick={() => {
              if (!soundMuted) soundEngine?.playTap?.();
              setShowAimLaser(prev => !prev);
            }}
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-all shadow-lg active:scale-95 ${
              showAimLaser 
                ? 'bg-slate-900/90 border-amber-400/50 text-amber-300' 
                : 'bg-slate-950/80 border-white/10 text-slate-500'
            }`}
          >
            {showAimLaser ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>

          {/* 2. Cue Ball Spin / English Button with Live Dot Display */}
          <button
            onClick={() => {
              if (!soundMuted) soundEngine?.playTap?.();
              setSpinModalOpen(true);
            }}
            className="relative w-12 h-12 rounded-full shadow-2xl border-2 border-slate-600 active:scale-95 transition-transform flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 70%, #64748b 100%)',
              boxShadow: '0 8px 18px rgba(0,0,0,0.6)'
            }}
          >
            {/* Active Red Dot */}
            <div
              className="absolute w-3 h-3 rounded-full bg-rose-600 border border-white shadow-md transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${50 + spinOffset.x * 35}%`,
                top: `${50 + spinOffset.y * 35}%`,
                boxShadow: '0 0 8px rgba(225, 29, 72, 0.8)'
              }}
            />
          </button>

          {/* 3. Fine Aim Angle Adjustment (Up & Down Micro Buttons) */}
          <div className="flex flex-col items-center p-1 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl space-y-1">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
              FINE
            </span>

            <button
              onClick={() => {
                if (!soundMuted) soundEngine?.playTap?.();
                setAimAngle(prev => (prev - 0.6 + 360) % 360);
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-slate-200"
            >
              <ChevronUp size={16} />
            </button>

            <span className="text-[10px] font-mono font-black text-amber-400">
              {Math.round(aimAngle)}°
            </span>

            <button
              onClick={() => {
                if (!soundMuted) soundEngine?.playTap?.();
                setAimAngle(prev => (prev + 0.6) % 360);
              }}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-slate-200"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </aside>
      </main>

      {/* ── 4. Bottom Tactical Strike Action Bar ── */}
      <footer className="w-full max-w-md px-3 pb-3 pt-1 z-30 flex items-center justify-between gap-2">
        {/* Equipped Cue Badge & Store Shortcut */}
        <button
          onClick={() => {
            if (!soundMuted) soundEngine?.playTap?.();
            setCueStoreOpen(true);
          }}
          className="py-2 px-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95"
        >
          <ShoppingBag size={14} />
          <span className="text-[11px] truncate max-w-[100px]">
            {SNOOKER_CUES.find(c => c.id === selectedCueId)?.nameFa || 'چوب اسنوکر'}
          </span>
        </button>

        {/* Primary Shoot / Strike Button */}
        <button
          onClick={() => handleExecuteShot()}
          disabled={stateRef.current.isMoving || (gameMode === 'bot' && turn === 'p2')}
          className={`flex-1 py-3 px-5 rounded-2xl font-black text-xs sm:text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
            stateRef.current.isMoving || (gameMode === 'bot' && turn === 'p2')
              ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/25'
          }`}
        >
          <span>🎱</span>
          <span>{isRtl ? 'شلیک ضربه (Strike)' : 'Strike Shot'}</span>
        </button>
      </footer>

      {/* ── 5. All Modals & Overlays ── */}
      {/* Game Setup Modal */}
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

      {/* Cue Store Modal */}
      <SnookerCueStoreModal
        isOpen={cueStoreOpen}
        onClose={() => setCueStoreOpen(false)}
        selectedCueId={selectedCueId}
        onSelectCue={handleSelectCue}
        isRtl={isRtl}
      />

      {/* Spin / English Adjustment Modal */}
      <SnookerSpinModal
        isOpen={spinModalOpen}
        onClose={() => setSpinModalOpen(false)}
        spinOffset={spinOffset}
        onChangeSpin={(newSpin) => setSpinOffset(newSpin)}
        isRtl={isRtl}
      />

      {/* Official Rules Modal */}
      <SnookerRulesModal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
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

      {/* Opponent Profile Modal */}
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
            className="fixed inset-0 z-[85] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
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
                        if (!soundMuted) soundEngine?.playTap?.();
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
                      setAimAngle(-90);
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
