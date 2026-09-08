import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, 
  Users, Bot, Globe, Shield, MessageSquare, Send, Award, Flame, 
  HelpCircle, Settings, ArrowRight, CheckCircle2, Shuffle, Play, Share2,
  Sun, Moon, ShoppingBag, Target, Info, MoreVertical, Eye, EyeOff,
  ChevronUp, ChevronDown, Check, Zap, X, BookOpen
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

// ── 1. Authentic 2:1 Crucible Snooker Table Dimensions ─────────────────
// True English 12ft x 6ft snooker table (exact 2:1 playing surface ratio)
const W = 460;
const H = 920;
const CANVAS_W = 540;
const CANVAS_H = 1080;
const OFFSET_X = 40;
const OFFSET_Y = 80;

const CUSHION_X = 28; // Slender tournament cushion side rail
const CUSHION_Y = 56; // Slender top & bottom cushion rail
const PLAY_W = W - 2 * CUSHION_X; // 404
const PLAY_H = H - 2 * CUSHION_Y; // 808 (exact 2.0:1 snooker proportion)
const BALL_R = 9.2; // Compact, realistic Aramith snooker ball scale
const FRICTION = 0.989;
const MIN_VEL = 0.05;

// Pocket coordinates on vertical portrait table with genuine curved jaws
const POCKET_CORNER_R = 12.5;
const POCKET_MID_R = 11.5;
const POCKETS = [
  { id: 'TL', x: CUSHION_X + 2, y: CUSHION_Y + 2, r: POCKET_CORNER_R },
  { id: 'TR', x: W - CUSHION_X - 2, y: CUSHION_Y + 2, r: POCKET_CORNER_R },
  { id: 'ML', x: CUSHION_X - 2, y: H / 2, r: POCKET_MID_R },
  { id: 'MR', x: W - CUSHION_X + 2, y: H / 2, r: POCKET_MID_R },
  { id: 'BL', x: CUSHION_X + 2, y: H - CUSHION_Y - 2, r: POCKET_CORNER_R },
  { id: 'BR', x: W - CUSHION_X - 2, y: H - CUSHION_Y - 2, r: POCKET_CORNER_R },
];

// Official Snooker Spots (Baulk at Bottom, Black at Top)
const BAULK_Y = H - CUSHION_Y - PLAY_H * 0.206; // 695.5
const D_RADIUS = PLAY_W * 0.182; // 73.5
const SPOTS = {
  brown:  { x: W / 2, y: BAULK_Y, color: '#854d0e', nameFa: 'قهوه‌ای', nameEn: 'Brown', points: 4 },
  green:  { x: W / 2 - D_RADIUS, y: BAULK_Y, color: '#16a34a', nameFa: 'سبز', nameEn: 'Green', points: 3 },
  yellow: { x: W / 2 + D_RADIUS, y: BAULK_Y, color: '#eab308', nameFa: 'زرد', nameEn: 'Yellow', points: 2 },
  blue:   { x: W / 2, y: H / 2, color: '#2563eb', nameFa: 'آبی', nameEn: 'Blue', points: 5 },
  pink:   { x: W / 2, y: CUSHION_Y + PLAY_H * 0.25, color: '#ec4899', nameFa: 'صورتی', nameEn: 'Pink', points: 6 },
  black:  { x: W / 2, y: CUSHION_Y + PLAY_H * 0.10, color: '#18181b', nameFa: 'مشکی', nameEn: 'Black', points: 7 },
};

const SEQUENCE_ORDER = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];

const RED_APEX_X = W / 2;
const RED_APEX_Y = SPOTS.pink.y - (BALL_R * 2 + 2);

const toPersianDigits = (num) => {
  if (num === undefined || num === null) return '۰';
  return String(num).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
};

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
    x: W / 2 - 20,
    y: BAULK_Y + 28,
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
  const rows = 5;
  const spacing = BALL_R * 2 + 0.5;
  const startX = RED_APEX_X;
  const startY = RED_APEX_Y;

  for (let row = 0; row < rows; row++) {
    const rowBallsCount = row + 1;
    const rowY = startY - row * (spacing * 0.866);
    const rowStartX = startX - ((rowBallsCount - 1) * spacing) / 2;

    for (let col = 0; col < rowBallsCount; col++) {
      const x = rowStartX + col * spacing;
      balls.push({
        id: idCounter++,
        type: 'red',
        nameFa: 'قرمز',
        nameEn: 'Red',
        points: 1,
        color: '#dc2626',
        x,
        y: rowY,
        vx: 0,
        vy: 0,
        potted: false
      });
    }
  }

  return balls;
}

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

export default function Snooker() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    currentUser, 
    userLanguage, 
    addCoins, 
    addXP, 
    recordGameResult,
    equippedItems 
  } = useAppStore();

  const isRtl = userLanguage !== 'en';
  const myUserId = currentUser?.id || currentUser?._id || 'p1';
  const myUserName = currentUser?.name || (isRtl ? 'شما' : 'You');
  const myAvatar = currentUser?.avatar || '';

  // Game Configuration State
  const [gameMode, setGameMode] = useState('bot'); // 'bot' | 'local' | 'online'
  const [matchFrames, setMatchFrames] = useState(1); // Best of 1, 3, 5
  const [currentFrame, setCurrentFrame] = useState(1);
  const [botDifficulty, setBotDifficulty] = useState('medium');
  const [selectedTheme, setSelectedTheme] = useState(TABLE_THEMES[0]);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [cueStoreOpen, setCueStoreOpen] = useState(false);
  const [spinModalOpen, setSpinModalOpen] = useState(false);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Equipped Cue Stick
  const [selectedCueId, setSelectedCueId] = useState('ash_classic');

  // Match Scoring & Frames
  const [scoreP1, setScoreP1] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [framesWonP1, setFramesWonP1] = useState(0);
  const [framesWonP2, setFramesWonP2] = useState(0);
  const [currentBreak, setCurrentBreak] = useState(0);
  const [highestBreak, setHighestBreak] = useState(0);

  // Match State
  const [turn, setTurn] = useState('p1'); // 'p1' | 'p2' (or 'bot')
  const [targetBallType, setTargetBallType] = useState('red'); // 'red' | 'colour' | 'sequence'
  const [activeSequenceIndex, setActiveSequenceIndex] = useState(0);
  const [ballInHand, setBallInHand] = useState(true);
  const [draggingBall, setDraggingBall] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [isBallsRolling, setIsBallsRolling] = useState(false);
  const [frameWinner, setFrameWinner] = useState(null);
  const [matchWinner, setMatchWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState(null);
  const [foulMessage, setFoulMessage] = useState(null);

  // Cue Stick Controls & Aiming (Default aiming up table at -90 deg)
  const [aimAngle, setAimAngle] = useState(-90);
  const [shotPower, setShotPower] = useState(35); // 0 - 100 (Default 35% as per UI reference)
  const [spinOffset, setSpinOffset] = useState({ x: 0, y: 0 }); // -1 to 1 (x = english, y = screw/follow)
  const [showAimLaser, setShowAimLaser] = useState(true);

  // Performance refs for butter-smooth 60/120fps touch drag aiming without re-render stutter
  const aimAngleRef = useRef(-90);
  const shotPowerRef = useRef(35);
  const isAimingRef = useRef(false);
  const draggingBallRef = useRef(false);

  // Modals & Chat
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [waitingOverlay, setWaitingOverlay] = useState(false);
  const [onlineRoomCode, setOnlineRoomCode] = useState('');
  const [myOnlineRole, setMyOnlineRole] = useState('p1');

  // Canvas & Physics Refs
  const canvasRef = useRef(null);
  const fineIntervalRef = useRef(null);
  const stateRef = useRef({
    balls: createInitialSnookerBalls(),
    isMoving: false,
    firstHitBall: null,
    pottedInCurrentShot: [],
    turn: 'p1',
    targetBallType: 'red',
    activeSequenceIndex: 0,
    currentBreak: 0,
    scoreP1: 0,
    scoreP2: 0,
    gameMode: 'bot',
    lastCollisionTime: 0,
    lastCushionTime: 0
  });

  // Keep stateRef synchronized
  useEffect(() => {
    stateRef.current.turn = turn;
    stateRef.current.targetBallType = targetBallType;
    stateRef.current.activeSequenceIndex = activeSequenceIndex;
    stateRef.current.currentBreak = currentBreak;
    stateRef.current.scoreP1 = scoreP1;
    stateRef.current.scoreP2 = scoreP2;
    stateRef.current.gameMode = gameMode;
  }, [turn, targetBallType, activeSequenceIndex, currentBreak, scoreP1, scoreP2, gameMode]);

  // Load saved equipped cue & table theme
  useEffect(() => {
    try {
      const savedCue = localStorage.getItem('snooker_equipped_cue');
      if (savedCue && SNOOKER_CUES.some(c => c.id === savedCue)) {
        setSelectedCueId(savedCue);
      }
      const savedTheme = localStorage.getItem('snooker_equipped_theme');
      if (savedTheme) {
        const foundTheme = TABLE_THEMES.find(t => t.id === savedTheme);
        if (foundTheme) setSelectedTheme(foundTheme);
      }
    } catch (_) {}
  }, []);

  const handleSelectCue = (cueId) => {
    setSelectedCueId(cueId);
    try {
      localStorage.setItem('snooker_equipped_cue', cueId);
    } catch (_) {}
  };

  const handleSelectTheme = (themeId) => {
    const foundTheme = TABLE_THEMES.find(t => t.id === themeId);
    if (foundTheme) {
      setSelectedTheme(foundTheme);
      try {
        localStorage.setItem('snooker_equipped_theme', themeId);
      } catch (_) {}
    }
  };

  // Reset match
  const handleStartGame = ({ mode = 'bot', frames = 1, theme = TABLE_THEMES[0] }) => {
    setGameMode(mode);
    setMatchFrames(frames);
    setSelectedTheme(theme);
    setCurrentFrame(1);
    setFramesWonP1(0);
    setFramesWonP2(0);
    setScoreP1(0);
    setScoreP2(0);
    setCurrentBreak(0);
    setHighestBreak(0);
    setTurn('p1');
    setTargetBallType('red');
    setActiveSequenceIndex(0);
    setBallInHand(true);
    setFrameWinner(null);
    setMatchWinner(null);
    setShowConfetti(false);
    setFoulMessage(null);
    setAnnouncementMsg(null);
    setAimAngle(-90);
    setShotPower(35);
    aimAngleRef.current = -90;
    shotPowerRef.current = 35;
    setSpinOffset({ x: 0, y: 0 });

    stateRef.current.balls = createInitialSnookerBalls();
    stateRef.current.isMoving = false;
    stateRef.current.firstHitBall = null;
    stateRef.current.pottedInCurrentShot = [];
    setIsShooting(false);
    setIsBallsRolling(false);
  };

  // URL search params initialize
  useEffect(() => {
    const roomParam = searchParams.get('room');
    const modeParam = searchParams.get('mode');
    const roleParam = searchParams.get('role');

    if (roomParam && modeParam === 'online') {
      setGameMode('online');
      setOnlineRoomCode(roomParam);
      setMyOnlineRole(roleParam === 'p2' ? 'p2' : 'p1');

      realtimeNetwork.joinRoom(roomParam, {
        userId: myUserId,
        userName: myUserName,
        role: roleParam || 'p1',
        game: 'snooker'
      });

      if (roleParam === 'p2') {
        setWaitingOverlay(false);
      } else {
        setWaitingOverlay(true);
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

      // Apply Cue Ball Screw/Draw back or Topspin Follow through
      const whiteBall = a.id === 0 ? a : b.id === 0 ? b : null;
      if (whiteBall && (whiteBall.spinY !== 0 || whiteBall.spinX !== 0)) {
        if (whiteBall.spinY > 0) {
          whiteBall.vx -= nx * imp * (whiteBall.spinY * 0.48);
          whiteBall.vy -= ny * imp * (whiteBall.spinY * 0.48);
        } else if (whiteBall.spinY < 0) {
          whiteBall.vx += nx * imp * (Math.abs(whiteBall.spinY) * 0.38);
          whiteBall.vy += ny * imp * (Math.abs(whiteBall.spinY) * 0.38);
        }
        whiteBall.spinX *= 0.5;
        whiteBall.spinY *= 0.5;
      }
    }

    // Realistic Aramith Resin Ball Collision Sound for ALL ball-to-ball collisions!
    if (!soundMuted && imp > 0.08) {
      const now = performance.now();
      if (!stateRef.current.lastCollisionTime || (now - stateRef.current.lastCollisionTime) > 22) {
        stateRef.current.lastCollisionTime = now;
        soundEngine?.playBallCollision?.(Math.min(1.4, imp * 0.14));
        haptics?.snookerHit?.(Math.min(1, imp * 0.1));
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

        // Slender Cushion Boundaries with pocket mouth clearances
        const leftWall = CUSHION_X + BALL_R;
        const rightWall = W - CUSHION_X - BALL_R;
        const topWall = CUSHION_Y + BALL_R;
        const bottomWall = H - CUSHION_Y - BALL_R;

        // Check if near any pocket
        const nearPocket = POCKETS.some(p => Math.hypot(b.x - p.x, b.y - p.y) < p.r * 1.35);
        if (!nearPocket) {
          let bounced = false;
          let bounceImp = 0;
          if (b.x < leftWall) { 
            b.x = leftWall; 
            b.vx = -b.vx * 0.84; 
            bounced = true;
            bounceImp = Math.abs(b.vx);
            if (b.id === 0 && b.spinX) b.vy += b.spinX * 1.2;
          }
          if (b.x > rightWall) { 
            b.x = rightWall; 
            b.vx = -b.vx * 0.84; 
            bounced = true;
            bounceImp = Math.abs(b.vx);
            if (b.id === 0 && b.spinX) b.vy += b.spinX * 1.2;
          }
          if (b.y < topWall) { 
            b.y = topWall; 
            b.vy = -b.vy * 0.84; 
            bounced = true;
            bounceImp = Math.abs(b.vy);
            if (b.id === 0 && b.spinX) b.vx += b.spinX * 1.2;
          }
          if (b.y > bottomWall) { 
            b.y = bottomWall; 
            b.vy = -b.vy * 0.84; 
            bounced = true;
            bounceImp = Math.abs(b.vy);
            if (b.id === 0 && b.spinX) b.vx += b.spinX * 1.2;
          }
          if (bounced && !soundMuted && bounceImp > 0.6) {
            const now = performance.now();
            if (!stateRef.current.lastCushionTime || (now - stateRef.current.lastCushionTime) > 40) {
              stateRef.current.lastCushionTime = now;
              soundEngine?.playCushionBounce?.(bounceImp * 0.15);
            }
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
            if (!soundMuted) (soundEngine?.playPocketSink || soundEngine?.playSuccess)?.();
            haptics?.notification?.('success');
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
      setIsBallsRolling(false);
      handleShotEnded();
    } else if (!state.isMoving && movingNow) {
      state.isMoving = true;
      setIsBallsRolling(true);
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
        spawnY = Math.max(CUSHION_Y + BALL_R * 2, originalSpot.y - BALL_R * 2.5);
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
          white.y = BAULK_Y + 28;
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
    setIsBallsRolling(false);
    setSpinOffset({ x: 0, y: 0 });
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
    if (!white) return;
    const activeCue = SNOOKER_CUES.find(c => c.id === selectedCueId) || SNOOKER_CUES[0];
    const powerValue = overridePower !== undefined ? overridePower : (shotPowerRef.current || shotPower);

    if (!soundMuted) (soundEngine?.playSnookerStrike || soundEngine?.playTap)?.(powerValue / 100);
    haptics?.snookerHit?.(powerValue / 100);
    setIsShooting(true);
    setIsBallsRolling(true);
    const powerMult = (powerValue / 100) * (activeCue.power / 75) * 19.5;

    const currentAim = aimAngleRef.current;
    const rad = (currentAim * Math.PI) / 180;
    white.vx = Math.cos(rad) * powerMult;
    white.vy = Math.sin(rad) * powerMult;

    // Apply spin settings
    white.spinX = spinOffset.x;
    white.spinY = spinOffset.y;

    stateRef.current.isMoving = true;
    stateRef.current.firstHitBall = null;
    stateRef.current.pottedInCurrentShot = [];
    setBallInHand(false);
  };

  // Fine Angle continuous adjustment helpers
  const startFineAdjust = (delta) => {
    if (!soundMuted) soundEngine?.playTap?.();
    const next = (aimAngleRef.current + delta + 360) % 360;
    aimAngleRef.current = next;
    setAimAngle(next);
    clearInterval(fineIntervalRef.current);
    fineIntervalRef.current = setInterval(() => {
      const nextLoop = (aimAngleRef.current + delta + 360) % 360;
      aimAngleRef.current = nextLoop;
      setAimAngle(nextLoop);
    }, 50);
  };

  const stopFineAdjust = () => {
    clearInterval(fineIntervalRef.current);
  };

  useEffect(() => {
    return () => clearInterval(fineIntervalRef.current);
  }, []);

  // ── 8. Bulletproof Snooker AI Bot Logic (Zero-Freeze Guaranteed) ───
  useEffect(() => {
    if (gameMode !== 'bot' || turn !== 'p2' || isBallsRolling || isShooting || frameWinner) return;

    const botTimer = setTimeout(() => {
      const state = stateRef.current;
      const balls = state.balls;
      const white = balls.find(b => b.type === 'white');
      if (!white) return;

      // Ensure cue ball is on table
      if (white.potted) {
        white.x = W / 2;
        white.y = BAULK_Y + 28;
        white.vx = 0;
        white.vy = 0;
        white.potted = false;
      }

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

      // Safeguard: If target list is empty, pick ANY valid ball
      if (candidateTargets.length === 0) {
        if (unpottedReds.length > 0) {
          candidateTargets = unpottedReds;
        } else {
          candidateTargets = balls.filter(b => b.type !== 'white' && !b.potted);
        }
      }

      if (candidateTargets.length === 0) {
        handleFrameWin();
        return;
      }

      // Find the best cut angle to any pocket
      let bestShot = null;
      let highestScore = -Infinity;

      candidateTargets.forEach(targetBall => {
        POCKETS.forEach(pocket => {
          const ballToPocketAngle = Math.atan2(pocket.y - targetBall.y, pocket.x - targetBall.x);
          const contactX = targetBall.x - Math.cos(ballToPocketAngle) * BALL_R * 2;
          const contactY = targetBall.y - Math.sin(ballToPocketAngle) * BALL_R * 2;

          const cueToContactAngle = Math.atan2(contactY - white.y, contactX - white.x);
          let angleDiff = Math.abs(ballToPocketAngle - cueToContactAngle);
          while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - 2 * Math.PI);
          const cutAngleDeg = (angleDiff * 180) / Math.PI;

          if (cutAngleDeg < 76) {
            const distance = dist(white, targetBall) + dist(targetBall, pocket);
            const score = (100 - cutAngleDeg) * 2 + (targetBall.points || 1) * 15 - distance * 0.08;
            if (score > highestScore) {
              highestScore = score;
              bestShot = {
                angleDeg: (cueToContactAngle * 180) / Math.PI,
                power: Math.min(85, Math.max(35, distance * 0.11 + 25))
              };
            }
          }
        });
      });

      // Anti-Freeze Safety Fallback: If no pot is possible, play a safe gentle shot towards legal target!
      if (!bestShot) {
        const targetBall = candidateTargets.reduce((closest, b) => {
          return dist(white, b) < dist(white, closest) ? b : closest;
        }, candidateTargets[0]);

        if (targetBall) {
          const directAngle = Math.atan2(targetBall.y - white.y, targetBall.x - white.x);
          bestShot = {
            angleDeg: (directAngle * 180) / Math.PI,
            power: 45
          };
        } else {
          bestShot = {
            angleDeg: -90,
            power: 40
          };
        }
      }

      const variance = botDifficulty === 'hard' ? 0.3 : botDifficulty === 'medium' ? 1.4 : 3.2;
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
        setIsShooting(true);
        setIsBallsRolling(true);
        state.firstHitBall = null;
        state.pottedInCurrentShot = [];
        if (!soundMuted) (soundEngine?.playSnookerStrike || soundEngine?.playTap)?.(bestShot.power / 100);
        haptics?.snookerHit?.(bestShot.power / 100);
      }, 500);
    }, 750);

    return () => clearTimeout(botTimer);
  }, [turn, gameMode, isBallsRolling, isShooting, frameWinner, botDifficulty, activeSequenceIndex]);

  // ── 9. Render Canvas Viewport & 3D Snooker Graphics ────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const render = () => {
      stepPhysics();

      // Clear Canvas
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.save();
      ctx.translate(OFFSET_X, OFFSET_Y);

      // ── 1. Outer Wood Cushion Rail (Luxury Mahogany / English Oak) ──
      const woodGrad = ctx.createLinearGradient(0, 0, W, H);
      woodGrad.addColorStop(0, '#2d150c');
      woodGrad.addColorStop(0.3, '#451f13');
      woodGrad.addColorStop(0.7, '#2f160e');
      woodGrad.addColorStop(1, '#1e0c06');
      ctx.fillStyle = woodGrad;
      ctx.roundRect(0, 0, W, H, 24);
      ctx.fill();

      // Outer gold inlay trim
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.roundRect(3, 3, W - 6, H - 6, 22);
      ctx.stroke();

      // Inner bevel shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.roundRect(CUSHION_X - 6, CUSHION_Y - 6, PLAY_W + 12, PLAY_H + 12, 6);
      ctx.stroke();

      // ── 2. Tournament Sights (Rhombus Inlaid Diamonds) ──
      const drawDiamondSight = (dx, dy) => {
        ctx.save();
        ctx.translate(dx, dy);
        ctx.beginPath();
        ctx.moveTo(0, -3.5);
        ctx.lineTo(3, 0);
        ctx.lineTo(0, 3.5);
        ctx.lineTo(-3, 0);
        ctx.closePath();
        ctx.fillStyle = '#fef08a';
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      };

      const partsY = 4;
      const spacingY = (H - CUSHION_Y * 2) / partsY;
      for (let i = 1; i < partsY; i++) {
        drawDiamondSight(CUSHION_X / 2, CUSHION_Y + i * spacingY);
        drawDiamondSight(W - CUSHION_X / 2, CUSHION_Y + i * spacingY);
      }
      const partsX = 2;
      const spacingX = (W - CUSHION_X * 2) / partsX;
      for (let i = 1; i < partsX; i++) {
        drawDiamondSight(CUSHION_X + i * spacingX, CUSHION_Y / 2);
        drawDiamondSight(CUSHION_X + i * spacingX, H - CUSHION_Y / 2);
      }

      // ── 3. Snooker Cloth Playing Bed (Strachan 6811 Tournament Green) ──
      ctx.fillStyle = selectedTheme.clothColor || '#0e5531';
      ctx.fillRect(CUSHION_X, CUSHION_Y, PLAY_W, PLAY_H);

      // Arena Crucible Spotlight (Authentic Directional Glow)
      const spotlight = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, PLAY_W * 0.9);
      spotlight.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      spotlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
      spotlight.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
      ctx.fillStyle = spotlight;
      ctx.fillRect(CUSHION_X, CUSHION_Y, PLAY_W, PLAY_H);

      // ── 4. Authentic 6 Beveled Snooker Cushions ──
      const cushionColor = selectedTheme.cushionColor || '#0a4626';
      const cushionHighlight = 'rgba(255, 255, 255, 0.16)';
      const drawCushionPolygon = (points) => {
        ctx.fillStyle = cushionColor;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = cushionHighlight;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      };

      // Top Cushion
      drawCushionPolygon([
        { x: CUSHION_X + 18, y: CUSHION_Y - 6 },
        { x: W - CUSHION_X - 18, y: CUSHION_Y - 6 },
        { x: W - CUSHION_X - 22, y: CUSHION_Y },
        { x: CUSHION_X + 22, y: CUSHION_Y }
      ]);

      // Bottom Cushion
      drawCushionPolygon([
        { x: CUSHION_X + 18, y: H - CUSHION_Y + 6 },
        { x: W - CUSHION_X - 18, y: H - CUSHION_Y + 6 },
        { x: W - CUSHION_X - 22, y: H - CUSHION_Y },
        { x: CUSHION_X + 22, y: H - CUSHION_Y }
      ]);

      // Top-Left Cushion
      drawCushionPolygon([
        { x: CUSHION_X - 6, y: CUSHION_Y + 18 },
        { x: CUSHION_X, y: CUSHION_Y + 22 },
        { x: CUSHION_X, y: H / 2 - 14 },
        { x: CUSHION_X - 6, y: H / 2 - 20 }
      ]);

      // Bottom-Left Cushion
      drawCushionPolygon([
        { x: CUSHION_X - 6, y: H / 2 + 20 },
        { x: CUSHION_X, y: H / 2 + 14 },
        { x: CUSHION_X, y: H - CUSHION_Y - 22 },
        { x: CUSHION_X - 6, y: H - CUSHION_Y - 18 }
      ]);

      // Top-Right Cushion
      drawCushionPolygon([
        { x: W - CUSHION_X + 6, y: CUSHION_Y + 18 },
        { x: W - CUSHION_X, y: CUSHION_Y + 22 },
        { x: W - CUSHION_X, y: H / 2 - 14 },
        { x: W - CUSHION_X + 6, y: H / 2 - 20 }
      ]);

      // Bottom-Right Cushion
      drawCushionPolygon([
        { x: W - CUSHION_X + 6, y: H / 2 + 20 },
        { x: W - CUSHION_X, y: H / 2 + 14 },
        { x: W - CUSHION_X, y: H - CUSHION_Y - 22 },
        { x: W - CUSHION_X + 6, y: H - CUSHION_Y - 18 }
      ]);

      // ── 5. Official Snooker Markings: Baulk Line & "D" ──
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(CUSHION_X, BAULK_Y);
      ctx.lineTo(W - CUSHION_X, BAULK_Y);
      ctx.stroke();

      // Semicircle "D"
      ctx.beginPath();
      ctx.arc(W / 2, BAULK_Y, D_RADIUS, 0, Math.PI, false);
      ctx.stroke();

      // Spot crosses (+) on colours spots
      Object.keys(SPOTS).forEach(key => {
        const s = SPOTS[key];
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x - 2.5, s.y); ctx.lineTo(s.x + 2.5, s.y);
        ctx.moveTo(s.x, s.y - 2.5); ctx.lineTo(s.x, s.y + 2.5);
        ctx.stroke();
      });

      // Ball in hand subtle glowing D indicator
      if (ballInHand) {
        const dGrad = ctx.createRadialGradient(W / 2, BAULK_Y, 15, W / 2, BAULK_Y, D_RADIUS);
        dGrad.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
        dGrad.addColorStop(1, 'rgba(99, 102, 241, 0.02)');
        ctx.fillStyle = dGrad;
        ctx.beginPath();
        ctx.arc(W / 2, BAULK_Y, D_RADIUS, 0, Math.PI, false);
        ctx.fill();

        ctx.strokeStyle = 'rgba(129, 140, 248, 0.7)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── 6. 6 Snooker Drop Pockets & Polished Brass Brackets ──
      POCKETS.forEach(p => {
        const isMiddle = p.id === 'ML' || p.id === 'MR';
        const bracketR = isMiddle ? p.r + 6 : p.r + 8;

        // Brass pocket bracket casting
        const brassGrad = ctx.createRadialGradient(p.x - 2, p.y - 2, 2, p.x, p.y, bracketR);
        brassGrad.addColorStop(0, '#fef08a');
        brassGrad.addColorStop(0.35, '#eab308');
        brassGrad.addColorStop(0.8, '#a16207');
        brassGrad.addColorStop(1, '#713f12');
        ctx.fillStyle = brassGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, bracketR, 0, Math.PI * 2);
        ctx.fill();

        // Pocket Leather Mouth Liner
        ctx.fillStyle = '#22140a';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 2, 0, Math.PI * 2);
        ctx.fill();

        // Pure Drop Hole with depth gradient
        const holeGrad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r);
        holeGrad.addColorStop(0, '#000000');
        holeGrad.addColorStop(0.8, '#080808');
        holeGrad.addColorStop(1, '#181410');
        ctx.fillStyle = holeGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── 7. Draw Balls with 3D Glossy Specular Shading & Drop Shadows ──
      const balls = stateRef.current.balls;
      balls.forEach(b => {
        if (b.potted) return;

        // Ambient contact shadow directly under the ball
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.beginPath();
        ctx.arc(b.x + 0.6, b.y + 1, BALL_R * 0.92, 0, Math.PI * 2);
        ctx.fill();

        // Soft directional drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(b.x + 2.5, b.y + 3.5, BALL_R * 1.05, BALL_R * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3D Sphere Radial Gradient
        const grad = ctx.createRadialGradient(
          b.x - BALL_R * 0.36, b.y - BALL_R * 0.36, BALL_R * 0.08,
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

        // Primary Specular Glint Reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(b.x - BALL_R * 0.35, b.y - BALL_R * 0.35, BALL_R * 0.28, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── 8. Draw Cue Stick & Aiming Guideline (Always ready when balls still) ──
      const white = balls.find(b => b.type === 'white');
      const activeCue = SNOOKER_CUES.find(c => c.id === selectedCueId) || SNOOKER_CUES[0];

      if (white && !white.potted && !stateRef.current.isMoving && !isShooting) {
        const rad = (aimAngleRef.current * Math.PI) / 180;
        const dirX = Math.cos(rad);
        const dirY = Math.sin(rad);

        // Aim Laser & Ghost Ball
        if (showAimLaser) {
          let maxLaserDist = 900;
          let hitTargetBall = null;
          let closestHitDist = Infinity;

          balls.forEach(b => {
            if (b.id === 0 || b.potted) return;
            const toBallX = b.x - white.x;
            const toBallY = b.y - white.y;
            const projection = toBallX * dirX + toBallY * dirY;
            if (projection > 0) {
              const perpDistSq = (toBallX * toBallX + toBallY * toBallY) - (projection * projection);
              const collisionDistSq = (BALL_R * 2) * (BALL_R * 2);
              if (perpDistSq < collisionDistSq) {
                const distToContact = projection - Math.sqrt(collisionDistSq - perpDistSq);
                if (distToContact < closestHitDist && distToContact > 0) {
                  closestHitDist = distToContact;
                  hitTargetBall = b;
                }
              }
            }
          });

          const actualLaserDist = hitTargetBall ? closestHitDist : maxLaserDist;
          const ghostX = white.x + dirX * actualLaserDist;
          const ghostY = white.y + dirY * actualLaserDist;

          // Dotted Cue Trajectory Line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1.2;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(white.x, white.y);
          ctx.lineTo(ghostX, ghostY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Ghost Ball Circle
          if (hitTargetBall) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(ghostX, ghostY, BALL_R, 0, Math.PI * 2);
            ctx.stroke();

            // Target Ball Deflection Arrow
            const contactNormX = hitTargetBall.x - ghostX;
            const contactNormY = hitTargetBall.y - ghostY;
            const contactDist = Math.hypot(contactNormX, contactNormY);
            if (contactDist > 0) {
              const normX = contactNormX / contactDist;
              const normY = contactNormY / contactDist;
              const targetPathLength = 45;

              ctx.strokeStyle = '#eab308';
              ctx.lineWidth = 1.6;
              ctx.beginPath();
              ctx.moveTo(hitTargetBall.x, hitTargetBall.y);
              ctx.lineTo(hitTargetBall.x + normX * targetPathLength, hitTargetBall.y + normY * targetPathLength);
              ctx.stroke();

              // Arrow tip
              ctx.fillStyle = '#eab308';
              ctx.beginPath();
              ctx.arc(hitTargetBall.x + normX * targetPathLength, hitTargetBall.y + normY * targetPathLength, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Full-Size Snooker Cue Stick
        const cueLength = 420;
        const pullBack = ((shotPowerRef.current || shotPower) / 100) * 65;
        const cueTipDist = BALL_R + 8 + pullBack;

        const cueStartX = white.x - dirX * cueTipDist;
        const cueStartY = white.y - dirY * cueTipDist;
        const cueEndX = white.x - dirX * (cueTipDist + cueLength);
        const cueEndY = white.y - dirY * (cueTipDist + cueLength);

        // Soft Cast Shadow on Cloth
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(cueStartX + 5, cueStartY + 8);
        ctx.lineTo(cueEndX + 8, cueEndY + 12);
        ctx.stroke();

        // Cue Tip (Chalk Sky Blue)
        ctx.strokeStyle = activeCue.tipColor || '#38bdf8';
        ctx.lineWidth = 6.5;
        ctx.beginPath();
        ctx.moveTo(cueStartX, cueStartY);
        ctx.lineTo(cueStartX - dirX * 12, cueStartY - dirY * 12);
        ctx.stroke();

        // Brass Ferrule
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(cueStartX - dirX * 12, cueStartY - dirY * 12);
        ctx.lineTo(cueStartX - dirX * 24, cueStartY - dirY * 24);
        ctx.stroke();

        // Ash Shaft
        ctx.strokeStyle = '#e2b17a';
        ctx.lineWidth = 8.5;
        ctx.beginPath();
        ctx.moveTo(cueStartX - dirX * 24, cueStartY - dirY * 24);
        ctx.lineTo(cueStartX - dirX * 220, cueStartY - dirY * 220);
        ctx.stroke();

        // Splice Transition
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 10.5;
        ctx.beginPath();
        ctx.moveTo(cueStartX - dirX * 220, cueStartY - dirY * 220);
        ctx.lineTo(cueStartX - dirX * 300, cueStartY - dirY * 300);
        ctx.stroke();

        // Ebony Butt
        ctx.strokeStyle = activeCue.accentGradient ? '#18181b' : '#1c1917';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(cueStartX - dirX * 300, cueStartY - dirY * 300);
        ctx.lineTo(cueEndX, cueEndY);
        ctx.stroke();

        // Gold Ring on Butt
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 13;
        ctx.beginPath();
        ctx.moveTo(cueStartX - dirX * 360, cueStartY - dirY * 360);
        ctx.lineTo(cueStartX - dirX * 372, cueStartY - dirY * 372);
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [selectedCueId, selectedTheme, isShooting, isBallsRolling, showAimLaser, soundMuted, ballInHand]);

  // Touch & Drag to Aim or Move Ball in Hand (Silky smooth 60/120Hz decoupled tracking)
  const handleCanvasPointerDown = (e) => {
    if (stateRef.current.isMoving || isShooting || (gameMode === 'bot' && turn === 'p2')) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX - OFFSET_X;
    const clickY = (e.clientY - rect.top) * scaleY - OFFSET_Y;

    const white = stateRef.current.balls.find(b => b.type === 'white');
    if (!white) return;

    // Check if user is touching the white cue ball directly in hand
    const distFromWhite = Math.hypot(clickX - white.x, clickY - white.y);
    if (distFromWhite < BALL_R * 3.5 && ballInHand) {
      draggingBallRef.current = true;
      setDraggingBall(true);
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
      return;
    }

    // Otherwise, start drag aiming immediately across the entire table
    isAimingRef.current = true;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    const angleRad = Math.atan2(clickY - white.y, clickX - white.x);
    const deg = (angleRad * 180) / Math.PI;
    aimAngleRef.current = deg;
  };

  const handleCanvasPointerMove = (e) => {
    if (stateRef.current.isMoving || isShooting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX - OFFSET_X;
    const clickY = (e.clientY - rect.top) * scaleY - OFFSET_Y;

    if (draggingBallRef.current && ballInHand) {
      let newX = clickX;
      let newY = clickY;

      // Constrain inside the 'D' zone
      if (newY < BAULK_Y) newY = BAULK_Y;
      const distToCenter = Math.hypot(newX - W / 2, newY - BAULK_Y);
      if (distToCenter > D_RADIUS - BALL_R) {
        const angle = Math.atan2(newY - BAULK_Y, newX - W / 2);
        newX = W / 2 + Math.cos(angle) * (D_RADIUS - BALL_R);
        newY = BAULK_Y + Math.sin(angle) * (D_RADIUS - BALL_R);
      }

      const white = stateRef.current.balls.find(b => b.type === 'white');
      if (white) {
        white.x = newX;
        white.y = newY;
      }
      return;
    }

    if (isAimingRef.current) {
      const white = stateRef.current.balls.find(b => b.type === 'white');
      if (!white) return;
      const angleRad = Math.atan2(clickY - white.y, clickX - white.x);
      const deg = (angleRad * 180) / Math.PI;
      aimAngleRef.current = deg;
    }
  };

  const handleCanvasPointerUp = (e) => {
    if (isAimingRef.current) {
      isAimingRef.current = false;
      setAimAngle(aimAngleRef.current);
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    if (draggingBallRef.current) {
      draggingBallRef.current = false;
      setDraggingBall(false);
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  };

  const handleCanvasPointerCancel = (e) => {
    if (isAimingRef.current) {
      isAimingRef.current = false;
      setAimAngle(aimAngleRef.current);
    }
    if (draggingBallRef.current) {
      draggingBallRef.current = false;
      setDraggingBall(false);
    }
  };

  const remainingReds = stateRef.current.balls.filter(b => b.type === 'red' && !b.potted).length;
  const remainingPointsOnTable = remainingReds * 8 + 27;

  // Shooting Control Visibility: Strictly when it is active player's turn to shoot and all balls are still
  const canShoot = (
    !isBallsRolling &&
    !isShooting &&
    !stateRef.current?.isMoving &&
    !frameWinner &&
    !matchWinner &&
    !waitingOverlay &&
    (
      (gameMode === 'bot' && turn === 'p1') ||
      (gameMode === 'local') ||
      (gameMode === 'online' && turn === myOnlineRole)
    )
  );

  return (
    <div 
      className="fixed inset-0 w-full h-full text-white flex flex-col items-center justify-between select-none overflow-hidden font-sans touch-none"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: '#0a0d14',
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 70%),
          radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 24px 24px'
      }}
    >
      {/* ── 1. Top Bar: Master Minimalist HUD (Clean, Elegant & Compact) ── */}
      <header className="w-full max-w-xl px-2.5 pt-2 z-30 shrink-0 flex flex-col gap-1">
        <div className="w-full h-11 px-2.5 rounded-2xl bg-slate-900/85 border border-white/10 backdrop-blur-xl flex items-center justify-between shadow-xl">
          {/* Left: Navigation, Sound, Rules & Boutique Store */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate('/games')}
              className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white transition-colors"
              title={isRtl ? 'بازگشت' : 'Back'}
            >
              <ChevronLeft size={16} />
            </button>

            <button
              onClick={() => setSoundMuted(prev => !prev)}
              className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 transition-colors"
              title={isRtl ? 'صدا' : 'Sound'}
            >
              {soundMuted ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} className="text-emerald-400" />}
            </button>

            {/* Direct Rules Modal Button */}
            <button
              onClick={() => {
                if (!soundMuted) soundEngine?.playTap?.();
                setRulesModalOpen(true);
              }}
              className="h-7 px-2 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
              title={isRtl ? 'راهنمای قوانین اسنوکر' : 'Snooker Rules'}
            >
              <BookOpen size={13} className="text-amber-400" />
              <span className="hidden xs:inline">{isRtl ? 'راهنما' : 'Rules'}</span>
            </button>

            {/* Direct Boutique Store Button */}
            <button
              onClick={() => {
                if (!soundMuted) soundEngine?.playTap?.();
                setCueStoreOpen(true);
              }}
              className="h-7 px-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-yellow-500/25 hover:from-amber-500/40 hover:to-yellow-500/40 border border-amber-500/40 text-amber-200 text-xs font-black flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              title={isRtl ? 'فروشگاه چوب و تم' : 'Store'}
            >
              <ShoppingBag size={13} className="text-amber-400" />
              <span>{isRtl ? 'فروشگاه' : 'Store'}</span>
            </button>
          </div>

          {/* Center: Target Ball & Break Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-black/40 border border-white/5">
            <div className="flex items-center gap-1 text-[11px] font-bold">
              {targetBallType === 'red' ? (
                <span className="flex items-center gap-1 text-rose-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.8)] inline-block animate-pulse" />
                  <span className="text-[11px] font-black">{isRtl ? 'قرمز' : 'Red'}</span>
                </span>
              ) : targetBallType === 'colour' ? (
                <span className="flex items-center gap-1 text-amber-300">
                  <Sparkles size={12} className="text-amber-400 animate-spin" />
                  <span className="text-[11px] font-black">{isRtl ? 'رنگی' : 'Colour'}</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sky-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shadow-sm"
                    style={{ backgroundColor: SPOTS[SEQUENCE_ORDER[activeSequenceIndex]]?.color || '#000' }}
                  />
                  <span className="text-[11px] font-black">{SPOTS[SEQUENCE_ORDER[activeSequenceIndex]]?.nameFa || 'مشکی'}</span>
                </span>
              )}
            </div>

            {currentBreak > 0 && (
              <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                +{currentBreak}
              </span>
            )}
          </div>

          {/* Right: Players & Scores Pill + Settings */}
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-colors ${
              turn === 'p1' ? 'bg-indigo-600/30 text-emerald-300 border border-indigo-500/40' : 'text-slate-400'
            }`}>
              <span className="text-[11px] font-bold truncate max-w-[48px]">{myUserName}</span>
              <span className="font-mono font-black text-xs text-white bg-slate-800/80 px-1 rounded">{scoreP1}</span>
              {turn === 'p1' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
            </div>

            <span className="text-[10px] text-slate-500 font-bold">:</span>

            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition-colors ${
              turn === 'p2' ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
            }`}>
              {turn === 'p2' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
              <span className="font-mono font-black text-xs text-white bg-slate-800/80 px-1 rounded">{scoreP2}</span>
              <span className="text-[11px] font-bold truncate max-w-[48px]">
                {gameMode === 'bot' ? (isRtl ? 'ربات' : 'Bot') : (isRtl ? 'حریف' : 'Opp')}
              </span>
            </div>

            {/* Restart / Setup */}
            <button
              onClick={() => setSetupModalOpen(true)}
              className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 transition-colors"
              title={isRtl ? 'تنظیمات و شروع مجدد' : 'Settings'}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        {/* Floating Announcement / Foul Toasts (Non-disruptive overlay) */}
        <AnimatePresence>
          {foulMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              className="py-1 px-3 rounded-xl bg-rose-600/90 text-white font-bold text-xs text-center shadow-lg border border-rose-400/50"
            >
              ⚠️ {foulMessage}
            </motion.div>
          )}

          {announcementMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              className="py-1 px-3 rounded-xl bg-amber-500/90 text-slate-950 font-black text-xs text-center shadow-lg border border-amber-300/50"
            >
              {announcementMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── 2. Main Gaming Stage: Genuine Elongated 2:1 Snooker Table ── */}
      <main className="flex-1 w-full max-w-lg flex items-center justify-center relative px-2 py-0.5 min-h-0 overflow-hidden">
        {/* Table Canvas Viewport - Maximized to 86vh while strictly preserving 1:2 portrait ratio */}
        <div className="relative h-full max-h-[85vh] sm:max-h-[87vh] aspect-[1/2] flex items-center justify-center mx-auto transition-all">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerCancel={handleCanvasPointerCancel}
            className="w-full h-full object-contain touch-none cursor-crosshair drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
          />
        </div>

        {/* Right Side Tactical Capsule: Laser, Spin, Fine Aim */}
        <aside className="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 select-none">
          {/* 1. Toggle Aim Laser */}
          <button
            onClick={() => {
              if (!soundMuted) soundEngine?.playTap?.();
              setShowAimLaser(prev => !prev);
            }}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all shadow-lg active:scale-95 ${
              showAimLaser 
                ? 'bg-slate-900/90 border-indigo-400/50 text-indigo-300' 
                : 'bg-slate-950/80 border-white/10 text-slate-500'
            }`}
          >
            {showAimLaser ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>

          {/* 2. Spin Widget with live red dot */}
          <button
            onClick={() => {
              if (!soundMuted) soundEngine?.playTap?.();
              setSpinModalOpen(true);
            }}
            className="relative w-10 h-10 rounded-full shadow-xl border-2 border-slate-600 active:scale-95 transition-transform flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 70%, #64748b 100%)'
            }}
          >
            <div
              className="absolute w-2.5 h-2.5 rounded-full bg-rose-600 border border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${50 + spinOffset.x * 35}%`,
                top: `${50 + spinOffset.y * 35}%`,
                boxShadow: '0 0 6px rgba(225, 29, 72, 0.9)'
              }}
            />
          </button>

          {/* 3. Fine Aim Angle Adjustment */}
          <div className="flex flex-col items-center p-1 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl space-y-1">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">FINE</span>
            <button
              onPointerDown={() => startFineAdjust(-0.5)}
              onPointerUp={stopFineAdjust}
              onPointerLeave={stopFineAdjust}
              onClick={() => {
                if (!soundMuted) soundEngine?.playTap?.();
                setAimAngle(prev => (prev - 0.5 + 360) % 360);
              }}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-slate-200"
            >
              <ChevronUp size={15} />
            </button>

            <span className="text-[9px] font-mono font-black text-indigo-300 select-none">
              {Math.round(aimAngle)}°
            </span>

            <button
              onPointerDown={() => startFineAdjust(0.5)}
              onPointerUp={stopFineAdjust}
              onPointerLeave={stopFineAdjust}
              onClick={() => {
                if (!soundMuted) soundEngine?.playTap?.();
                setAimAngle(prev => (prev + 0.5) % 360);
              }}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-slate-200"
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </aside>
      </main>

      {/* ── 3. Floating Compact Strike Dock (Only when active player can shoot) ── */}
      <AnimatePresence>
        {canShoot && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.94 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="fixed bottom-2.5 sm:bottom-3 inset-x-3 sm:max-w-sm sm:mx-auto z-50 bg-white/95 text-slate-900 rounded-2xl px-3.5 py-2 shadow-[0_15px_35px_rgba(0,0,0,0.5)] border border-indigo-100 backdrop-blur-2xl select-none"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Power display & slim slider */}
              <div className="flex-1 flex flex-col items-start gap-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                  <span className="text-slate-500 font-bold">{isRtl ? 'قدرت ضربه:' : 'Power:'}</span>
                  <span className="text-indigo-600 font-mono text-sm font-black">
                    {isRtl ? `${toPersianDigits(shotPower)}٪` : `${shotPower}%`}
                  </span>
                </div>

                {/* Slim Horizontal Track */}
                <div className="relative w-full h-2.5 rounded-full bg-[#ede9fe] flex items-center">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-[#4f46e5] transition-all duration-75"
                    style={
                      isRtl
                        ? { width: `${shotPower}%`, right: 0 }
                        : { width: `${shotPower}%`, left: 0 }
                    }
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#4f46e5] shadow pointer-events-none transition-all duration-75"
                    style={
                      isRtl
                        ? { right: `calc(${shotPower}% - 8px)` }
                        : { left: `calc(${shotPower}% - 8px)` }
                    }
                  />
                  <input
                    type="range"
                    dir={isRtl ? 'rtl' : 'ltr'}
                    min="5"
                    max="100"
                    value={shotPower}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      shotPowerRef.current = val;
                      setShotPower(val);
                      haptics?.selection?.();
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                  />
                </div>
              </div>

              {/* Action Button: ضربه بزن ↗ */}
              <button
                onClick={() => handleExecuteShot(shotPower)}
                className="flex-shrink-0 bg-[#4732e6] hover:bg-[#3724c9] active:scale-95 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1 transition-all"
              >
                <span>{isRtl ? 'ضربه بزن' : 'Strike'}</span>
                <span className="text-sm font-bold">↗</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. All Modals & Overlays ── */}
      {/* Game Setup Modal */}
      <SnookerSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onStartGame={handleStartGame}
        selectedCueId={selectedCueId}
        selectedThemeId={selectedTheme?.id}
        onOpenCueStore={() => {
          setSetupModalOpen(false);
          setCueStoreOpen(true);
        }}
        isRtl={isRtl}
      />

      {/* Cue & Table Theme Boutique Store Modal */}
      <SnookerCueStoreModal
        isOpen={cueStoreOpen}
        onClose={() => setCueStoreOpen(false)}
        selectedCueId={selectedCueId}
        onSelectCue={handleSelectCue}
        selectedThemeId={selectedTheme?.id}
        onSelectTheme={handleSelectTheme}
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

      {/* Masterclass Snooker Rules & Guide Modal */}
      <SnookerRulesModal
        isOpen={rulesModalOpen}
        onClose={() => setRulesModalOpen(false)}
        isRtl={isRtl}
      />

      {/* In-Game Chat Drawer (with hideCapsule to prevent cluttering game screen) */}
      <InGameChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        hideCapsule={true}
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
              className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 to-black border-2 border-indigo-500/60 p-6 text-center shadow-2xl space-y-4"
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
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-black text-xs shadow-lg active:scale-95"
                    >
                      {isRtl ? 'شروع مسابقه جدید 🎱' : 'Start New Match'}
                    </button>

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
                      stateRef.current.firstHitBall = null;
                      stateRef.current.pottedInCurrentShot = [];
                      stateRef.current.isMoving = false;
                      setScoreP1(0);
                      setScoreP2(0);
                      setCurrentBreak(0);
                      setTurn('p1');
                      setTargetBallType('red');
                      setActiveSequenceIndex(0);
                      setAimAngle(-90);
                      setBallInHand(true);
                      setSpinOffset({ x: 0, y: 0 });
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
