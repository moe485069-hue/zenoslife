import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles,
  Download, Trash2, CheckCircle2, Shield, Heart, Moon, Radio,
  Slider, Clock, RefreshCw, Zap, Check, Sliders, Waves
} from 'lucide-react';
import soundEngine from '../../utils/audio';
import haptics from '../../utils/haptics';
import useAppStore from '../../store/appStore';

export default function PersonalVoiceSubliminalStudio({
  activeBelief,
  onSaveVoiceForBelief,
  isRtl = true
}) {
  const { addXP, addCoins } = useAppStore();

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(activeBelief?.voiceAudioUrl || null);
  const [isPlayingSession, setIsPlayingSession] = useState(false);

  // Audio Mixer State
  const [backgroundAtmosphere, setBackgroundAtmosphere] = useState('theta'); // 'theta' | 'solfeggio528' | 'rain' | 'tibetan'
  const [atmosphereVolume, setAtmosphereVolume] = useState(0.35);
  const [voiceVolume, setVoiceVolume] = useState(0.85);
  const [voiceMode, setVoiceMode] = useState('whisper'); // 'whisper' | 'clear'
  const [sessionTimerMinutes, setSessionTimerMinutes] = useState(15);
  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState(15 * 60);

  // MediaRecorder & Web Audio refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioElementRef = useRef(null);
  const sessionTimerRef = useRef(null);

  // Load existing audio if activeBelief changes
  useEffect(() => {
    if (activeBelief?.voiceAudioUrl) {
      setAudioUrl(activeBelief.voiceAudioUrl);
    } else {
      setAudioUrl(null);
      setAudioBlob(null);
    }
    stopSession();
  }, [activeBelief?.id]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSession();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Convert to Base64 dataURL for persistent DB storage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          if (activeBelief?.id && onSaveVoiceForBelief) {
            onSaveVoiceForBelief(activeBelief.id, base64data);
          }
        };
        reader.readAsDataURL(blob);

        // Stop all mic tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      soundEngine.playTap?.();
      haptics.success?.();

      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or error:', err);
      alert(isRtl ? 'دسترسی به میکروفون داده نشد یا در مرورگر پشتیبانی نمی‌شود.' : 'Microphone access denied or unsupported.');
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      soundEngine.playCheckmark?.();
      haptics.success?.();
      addXP?.(40, isRtl ? 'ضبط صدای خود برای سابلیمینال' : 'Recorded Personal Subliminal Voice');
      addCoins?.(15);
    }
  };

  // Start Playback Session (Mixing Voice + Atmosphere)
  const startSession = () => {
    if (!audioUrl) return;
    setIsPlayingSession(true);
    setSessionRemainingSeconds(sessionTimerMinutes * 60);

    // Start background atmosphere drone
    soundEngine.startAtmosphereDrone?.(backgroundAtmosphere, atmosphereVolume);

    // Play recorded audio element
    if (audioElementRef.current) {
      audioElementRef.current.volume = voiceVolume;
      audioElementRef.current.currentTime = 0;
      audioElementRef.current.play().catch(e => console.warn('Audio play error:', e));
    }

    // Session timer countdown
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    sessionTimerRef.current = setInterval(() => {
      setSessionRemainingSeconds(prev => {
        if (prev <= 1) {
          stopSession();
          soundEngine.playDivineChime?.();
          addXP?.(30, isRtl ? 'اتمام جلسه سابلیمینال صوتی' : 'Subliminal Voice Session Complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    haptics.tap?.();
  };

  // Stop Session
  const stopSession = () => {
    setIsPlayingSession(false);
    soundEngine.stopAtmosphereDrone?.();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
  };

  // Atmosphere change handler
  const handleAtmosphereChange = (type) => {
    setBackgroundAtmosphere(type);
    if (isPlayingSession) {
      soundEngine.startAtmosphereDrone?.(type, atmosphereVolume);
    }
    soundEngine.playTap?.();
    haptics.tap?.();
  };

  const handleAtmosphereVolumeChange = (vol) => {
    setAtmosphereVolume(vol);
    soundEngine.setAtmosphereVolume?.(vol);
  };

  const handleVoiceVolumeChange = (vol) => {
    setVoiceVolume(vol);
    if (audioElementRef.current) {
      audioElementRef.current.volume = vol;
    }
  };

  const handleDeleteRecording = () => {
    if (!window.confirm(isRtl ? 'آیا از حذف صدای ضبط‌شده این باور اطمینان دارید؟' : 'Delete this voice recording?')) return;
    stopSession();
    setAudioUrl(null);
    setAudioBlob(null);
    if (activeBelief?.id && onSaveVoiceForBelief) {
      onSaveVoiceForBelief(activeBelief.id, null);
    }
    soundEngine.playTap?.();
  };

  const currentAffirmations = activeBelief?.subliminalAffirmations || (activeBelief?.empoweringBelief ? [activeBelief.empoweringBelief] : [
    'من در آرامش، امنیت و فراوانی کامل هستم.',
    'من شایسته بهترین موهبت‌ها و موفقیت‌ها هستم.',
    'تمام سلول‌های وجودم با نور خرد و آرامش همگام است.'
  ]);

  return (
    <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-black/80 to-purple-950/40 border-2 border-cyan-400/40 shadow-2xl space-y-6 text-start relative overflow-hidden">
      
      {/* Background Neural Lights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Hidden Audio Tag for Loop Playback */}
      {audioUrl && (
        <audio
          ref={audioElementRef}
          src={audioUrl}
          loop
          onEnded={() => {
            if (isPlayingSession && audioElementRef.current) {
              audioElementRef.current.play();
            }
          }}
        />
      )}

      {/* ── 1. HEADER & SCIENTIFIC INSIGHT ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border border-cyan-400/50 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-purple-200">
                {isRtl ? 'استودیوی سابلیمینال با صدای خود شما' : 'Personal Voice Subliminal Studio'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black border border-cyan-500/30">
                {isRtl ? 'نفوذ ۳ برابری به ناخودآگاه' : '3x Subconscious Suggestibility'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-medium leading-relaxed max-w-xl">
              {isRtl
                ? 'ناخودآگاه شما در برابر صدای خودتان هیچ مقاومت نقادانه‌ای ندارد. جملات تأکیدی را با صدای خود ضبط کنید و با امواج تتا میکس نمایید.'
                : 'Your subconscious accepts your own voice with zero resistance. Record affirmations & mix with theta brainwaves.'}
            </p>
          </div>
        </div>

        {audioUrl && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1">
              <Check size={12} />
              <span>{isRtl ? 'وویس اختصاصی آماده است' : 'Voice Saved'}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── 2. SCRIPT TELEPROMPTER (متن برای خواندن هنگام ضبط) ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-cyan-500/30 space-y-2.5 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
            <span>📜</span>
            <span>{isRtl ? 'متن پیشنهادی برای خواندن با لحنی آرام، مقتدر و شمرده:' : 'Read this script aloud calmly & with conviction:'}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {currentAffirmations.length} {isRtl ? 'جمله' : 'phrases'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/30 via-black/40 to-indigo-950/30 border border-white/10 space-y-2">
          {currentAffirmations.map((aff, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-xs text-cyan-400 font-black mt-0.5">#{i + 1}</span>
              <p className="text-xs sm:text-sm font-black text-slate-100 leading-relaxed drop-shadow-sm">
                «{aff}»
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. RECORDING CONTROL CENTER ── */}
      <div className="p-5 rounded-2xl bg-black/40 border border-purple-500/30 flex flex-col items-center justify-center gap-4 text-center relative z-10">
        
        {/* Animated Soundwave Visualizer when recording */}
        {isRecording ? (
          <div className="flex items-center justify-center gap-1.5 h-12">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(bar => (
              <motion.div
                key={bar}
                animate={{
                  height: [8, Math.random() * 36 + 12, 8]
                }}
                transition={{
                  duration: 0.4 + Math.random() * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="w-1.5 rounded-full bg-gradient-to-t from-rose-500 via-pink-400 to-cyan-300"
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>⏱️ {isRtl ? 'مدت زمان ضبط:' : 'Duration:'}</span>
            <span className="text-sm font-black text-cyan-300">{formatTime(recordingTime)}</span>
          </div>
        )}

        {/* Big Record Button */}
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-black text-xs shadow-[0_0_25px_rgba(244,63,94,0.4)] active:scale-95 transition-all flex items-center gap-2"
            >
              <Mic size={18} />
              <span>{audioUrl ? (isRtl ? 'ضبط مجدد با صدای خود' : 'Re-Record Voice') : (isRtl ? 'شروع ضبط صدای خود (میکروفون)' : 'Start Recording Voice')}</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-[0_0_30px_rgba(244,63,94,0.6)] animate-pulse active:scale-95 transition-all flex items-center gap-2"
            >
              <MicOff size={18} />
              <span>{isRtl ? `توقف و ذخیره صدا (${formatTime(recordingTime)})` : `Stop & Save (${formatTime(recordingTime)})`}</span>
            </button>
          )}

          {audioUrl && !isRecording && (
            <button
              onClick={handleDeleteRecording}
              className="p-3.5 rounded-2xl bg-black/40 border border-white/15 text-slate-400 hover:text-rose-400 hover:border-rose-400 transition-colors"
              title={isRtl ? 'حذف صدای ضبط‌شده' : 'Delete Voice'}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── 4. ATMOSPHERE & FREQUENCY MIXER ── */}
      {audioUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 pt-2 border-t border-cyan-500/20 relative z-10"
        >
          {/* Atmosphere Selection */}
          <div className="space-y-2">
            <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
              <Waves size={14} />
              <span>{isRtl ? 'انتخاب فرکانس و اتمسفر پس‌زمینه:' : 'Select Background Frequency & Soundscape:'}</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'theta', labelFa: '🧘 موج تتا ۴۳۲Hz', labelEn: 'Theta 432Hz', descFa: 'تغییر باور ناخودآگاه' },
                { id: 'solfeggio528', labelFa: '✨ فرکانس ۵۲۸Hz', labelEn: '528Hz Miracle', descFa: 'عشق به خود و شفا' },
                { id: 'rain', labelFa: '🌧️ باران آرامش‌بخش', labelEn: 'Gentle Rain', descFa: 'خواب عمیق و آسودگی' },
                { id: 'tibetan', labelFa: '🔔 کاسه تبتی کیهانی', labelEn: 'Tibetan Bowls', descFa: 'پاکسازی چاکراها' }
              ].map(atm => (
                <button
                  key={atm.id}
                  onClick={() => handleAtmosphereChange(atm.id)}
                  className={`p-3 rounded-2xl border text-start transition-all ${
                    backgroundAtmosphere === atm.id
                      ? 'bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-black/35 border-white/10 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span className={`text-xs font-black block ${backgroundAtmosphere === atm.id ? 'text-cyan-200' : 'text-slate-200'}`}>
                    {isRtl ? atm.labelFa : atm.labelEn}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {atm.descFa}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Volume & Mode Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-black/40 border border-white/10">
            
            {/* Background Atmosphere Volume */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>🎵 {isRtl ? 'حجم صدای فرکانس زمینه:' : 'Atmosphere Volume:'}</span>
                <span className="text-cyan-300 font-mono">{Math.round(atmosphereVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={atmosphereVolume}
                onChange={e => handleAtmosphereVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Voice Volume */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>🗣️ {isRtl ? 'حجم صدای ضبط‌شده شما:' : 'Your Voice Volume:'}</span>
                <span className="text-purple-300 font-mono">{Math.round(voiceVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={voiceVolume}
                onChange={e => handleVoiceVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

          </div>

          {/* ── 5. SESSION DURATION & SLEEP TIMER ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-black/50 to-cyan-950/40 border border-purple-500/30">
            <div className="flex items-center gap-2">
              <Moon size={16} className="text-purple-300" />
              <div>
                <span className="text-xs font-black text-white block">
                  {isRtl ? 'تایمر جلسه مراقبه و خواب (Sleep Loop):' : 'Session & Sleep Loop Timer:'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isRtl ? 'صدا در یک حلقه پیوسته پخش و در پایان به‌آرامی محو می‌شود' : 'Loops continuously then gently fades out'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {[5, 15, 30, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => {
                    setSessionTimerMinutes(mins);
                    setSessionRemainingSeconds(mins * 60);
                    soundEngine.playTap?.();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border ${
                    sessionTimerMinutes === mins
                      ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* ── 6. BIG PLAY SESSION BUTTON ── */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
              <Clock size={14} className="text-cyan-300" />
              <span>{isRtl ? 'زمان باقی‌مانده جلسه:' : 'Time Left:'}</span>
              <span className="text-sm font-black text-cyan-300">{formatTime(sessionRemainingSeconds)}</span>
            </div>

            <button
              onClick={isPlayingSession ? stopSession : startSession}
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all ${
                isPlayingSession
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:brightness-110 text-white shadow-cyan-500/30 active:scale-95'
              }`}
            >
              {isPlayingSession ? <Pause size={18} /> : <Play size={18} />}
              <span>
                {isPlayingSession
                  ? (isRtl ? 'توقف پخش سابلیمینال' : 'Stop Subliminal Session')
                  : (isRtl ? 'شروع پخش میکس صدای خود + فرکانس تتا 🎧' : 'Start Personal Subliminal Session 🎧')}
              </span>
            </button>
          </div>

        </motion.div>
      )}

    </div>
  );
}
