import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Terminal, Lock, Unlock, Key, Cpu, Wifi, Eye, AlertTriangle,
  CheckCircle2, RefreshCw, Plus, Trash2, Zap, ShieldCheck, Bug, Laptop, Server, Check, BookOpen, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import HabitItem from '../components/ui/HabitItem';
import SectionWidgets from '../components/ui/SectionWidgets';
import ProgressRing from '../components/ui/ProgressRing';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import { SECURITY_ACADEMY_MODULES } from '../data/securityData';

const SECURITY_LAYERS = [
  {
    id: 'psychological',
    icon: '🛡️',
    titleFa: '۱. امنیت روانی و مرزبندی عاطفی (Psychological Shield)',
    titleEn: '1. Psychological & Emotional Boundary Defense',
    descFa: 'دفاع در برابر گس‌لایتینگ (Gaslighting)، تخلیه انرژی توسط افراد سمی و مهندسی اجتماعی عاطفی. یادگیری گفتن «نه» قاطعانه بدون عذاب وجدان.',
    descEn: 'Defense against gaslighting, energy vampires, and emotional social engineering. Setting firm, guilt-free boundaries.',
    rules: [
      'هرگز ارزش درونی خود را بر اساس تایید یا قضاوت دیگران تنظیم نکنید.',
      'مرزهای احساسی شفاف تعیین کنید؛ شما مسئول احساسات منفی دیگران نیستید.',
      'در برابر باج‌خواهی عاطفی و احساس گناه تحمیلی فایروال درونی فعال کنید.'
    ]
  },
  {
    id: 'cognitive',
    icon: '🧠',
    titleFa: '۲. امنیت ذهنی و شناختی (Cognitive Firewall)',
    titleEn: '2. Cognitive Firewall & Attention Protection',
    descFa: 'حفاظت از مغز و توجه در برابر بمباران اطلاعاتی، تله‌های کلیک‌بیت (Clickbait)، اخبار جعلی و الگوریتم‌های اعتیادآور شبکه‌های اجتماعی.',
    descEn: 'Shielding your attention from information overload, algorithm rabbit holes, and cognitive manipulation.',
    rules: [
      'منبع هر خبر را قبل از پذیرش یا بازنشر اعتبارسنجی کنید (Zero-Trust Mindset).',
      'نوتیفیکیشن‌های غیرضروری را برای محافظت از تمرکز عمیق خاموش کنید.',
      'زمان‌های روزانه بدون نمایشگر (Digital Blackout) داشته باشید.'
    ]
  },
  {
    id: 'physical',
    icon: '🔒',
    titleFa: '۳. امنیت فیزیکی و محیطی (Physical & Situational)',
    titleEn: '3. Physical & Situational Awareness',
    descFa: 'هوشیاری موقعیتی در محیط‌های عمومی، امنیت قفل‌ها و حریم شخصی خانه، محل کار و حفظ اطلاعات حساس در رفت‌وآمد.',
    descEn: 'Situational awareness, physical locks, secure home environment and safeguarding sensitive items.',
    rules: [
      'هنگام استفاده از گوشی و لپ‌تاپ در مکان‌های عمومی زاویه دید صفحه را محافظت کنید.',
      'همواره هوشیاری محیطی داشته باشید و در هندزفری صدای پیرامون را مسدود نکنید.',
      'قفل‌ها، کلیدها و سیستم‌های ورود محیط زندگی را چک و به‌روز نگه دارید.'
    ]
  },
  {
    id: 'spiritual',
    icon: '🕊️',
    titleFa: '۴. امنیت روحی و حریم قدسی (Spiritual Sanctuary)',
    titleEn: '4. Spiritual Sanctuary & Inner Core',
    descFa: 'حفاظت از آرامش عمیق روح و عدم نفوذپذیری قلب در برابر امواج منفی، کینه‌توزی و اضطراب‌های بیرونی جهان.',
    descEn: 'Maintaining impenetrable spiritual sanctuary, inner peace, and sovereign tranquility.',
    rules: [
      'سکوت روزانه را به عنوان دژ دفاعی روح در برابر هیاهوی جهان پاس بدارید.',
      'انرژی قلب خود را با بخشش و پاک‌سازی کینه‌ها نفوذناپذیر کنید.',
      'به منبع بی‌پایان حیات متصل بمانید؛ هیچ طوفانی نمی‌تواند ریشه عمیق را بلرزاند.'
    ]
  }
];

const CYBER_ACADEMY_MODULES = [
  {
    icon: '🔐',
    code: 'SEC-01',
    titleFa: 'احراز هویت دو مرحله‌ای (2FA / Passkeys)',
    titleEn: '2FA & Hardware Security Keys',
    levelFa: 'حیاتی',
    levelEn: 'CRITICAL',
    descFa: 'استفاده از اپلیکیشن‌های Authenticator (مانند Aegis/Google Authenticator) یا کلید سخت‌افزاری به جای پیامک کوتاه (SMS) که در برابر حمله SIM-Swap آسیب‌پذیر است.',
    descEn: 'Use app-based authenticators or FIDO2 hardware passkeys instead of SMS-based 2FA to eliminate SIM-swapping risks.'
  },
  {
    icon: '🔑',
    titleFa: 'مدیریت رمزعبور و انتروپی بالا',
    titleEn: 'Password Vault & Zero-Knowledge Encryption',
    levelFa: 'ضروری',
    levelEn: 'ESSENTIAL',
    descFa: 'عدم استفاده از رمزهای تکراری؛ استفاده از پسوردهای ۱۶+ کاراکتری تصادفی مدیریت‌شده با Bitwarden یا KeePass با رمزنگاری سرتاسری.',
    descEn: 'Never reuse passwords; deploy 16+ character high-entropy passphrases managed via zero-knowledge vaults.'
  },
  {
    icon: '🌐',
    titleFa: 'بهداشت اینترنت، DNS امن و VPN',
    titleEn: 'Encrypted DNS & Zero-Log VPN',
    levelFa: 'توصیه‌شده',
    levelEn: 'RECOMMENDED',
    descFa: 'فعال‌سازی DoH (DNS over HTTPS مانند NextDNS یا Cloudflare 1.1.1.1) برای جلوگیری از جعل و پایش درخواست‌های اینترنتی.',
    descEn: 'Enable DNS over HTTPS (DoH) with content filtering to block malicious trackers and ISP surveillance.'
  },
  {
    icon: '💾',
    titleFa: 'استراتژی پشتیبان‌گیری ۳-۲-۱',
    titleEn: '3-2-1 Cold Backup Architecture',
    levelFa: 'حیاتی',
    levelEn: 'CRITICAL',
    descFa: '۳ نسخه از داده‌ها، روی ۲ نوع حافظه مجزا، و ۱ نسخه در محل فیزیکی/آفلاین جداگانه (Cold Storage) در برابر باج‌افزارها و خرابی سخت‌افزار.',
    descEn: 'Keep 3 copies of data on 2 different media types, with 1 copy stored offline in cold storage against ransomware.'
  },
  {
    icon: '🎣',
    titleFa: 'آناتومی حملات فیشینگ و مهندسی اجتماعی',
    titleEn: 'Phishing Dissection & Social Engineering Defense',
    levelFa: 'پیشرفته',
    levelEn: 'ADVANCED',
    descFa: 'شناسایی دامنه‌های جعلی (Typosquatting)، بررسی هدرهای ایمیل، عدم کلیک بر روی لینک‌های هیجانی و پیام‌های فوریتی فریبنده.',
    descEn: 'Identify typosquatted domains, inspect email headers, and neutralize emotional urgency manipulation traps.'
  }
];

export default function Security() {
  const { language, addXP } = useAppStore();
  const { habits, todayLogs, loadHabits, toggleHabit, deleteHabit } = useSectionsStore();
  const isRtl = language === 'fa';

  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'academy' | 'dimensions' | 'analyzer' | 'habits'

  // Terminal Scanner state
  const [terminalLogs, setTerminalLogs] = useState([
    'INIT: Life OS Cyber-Defense Kernel v4.2.0 loaded.',
    'STATUS: Shield matrix listening on localhost.',
    'READY: Press [RUN SYSTEM AUDIT] to analyze threat level.'
  ]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanScore, setScanScore] = useState(null);

  // Password Analyzer state
  const [testPassword, setTestPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [expandedSecId, setExpandedSecId] = useState(null);

  useEffect(() => {
    loadHabits('security');
  }, []);

  const runCyberAudit = () => {
    setIsScanning(true);
    setTerminalLogs([
      'STARTING FULL SYSTEM & PSYCHOLOGICAL SCAN...',
      '>> [1/4] Probing 2FA & credential entropy... [SECURE]',
      '>> [2/4] Inspecting cognitive firewall & noise filters... [ACTIVE]',
      '>> [3/4] Testing psychological boundary integrity... [REINFORCED]',
      '>> [4/4] Verifying physical situational awareness... [CHECKED]',
      '>> SCAN COMPLETE: Zero critical breaches detected.',
      '>> SYSTEM THREAT LEVEL: DEFCON 5 (IMPERVIOUS)'
    ]);
    soundEngine.playCheckmark();

    setTimeout(() => {
      setIsScanning(false);
      setScanScore(98);
      soundEngine.playLevelUp();
      addXP(25, 'اسکن کامل امنیت سایبری و روانی');
    }, 1500);
  };

  // Calculate password strength
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, textFa: 'رمز وارد نشده', textEn: 'No password', color: 'gray', crackTime: '0s' };
    let score = 0;
    if (pwd.length >= 8) score += 20;
    if (pwd.length >= 12) score += 30;
    if (pwd.length >= 16) score += 20;
    if (/[A-Z]/.test(pwd)) score += 10;
    if (/[0-9]/.test(pwd)) score += 10;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 10;

    let crackTime = '< ۱ ثانیه';
    let textFa = 'خیلی ضعیف و آسیب‌پذیر';
    let textEn = 'Very Weak';
    let color = '#ef4444';

    if (score >= 80) {
      textFa = 'نفوذناپذیر و فوق‌العاده قوی 🛡️';
      textEn = 'Impervious & Military-Grade 🛡️';
      color = '#10b981';
      crackTime = 'چندین میلیارد سال';
    } else if (score >= 60) {
      textFa = 'قوی و مطمئن';
      textEn = 'Strong';
      color = '#06b6d4';
      crackTime = 'چند قرن';
    } else if (score >= 40) {
      textFa = 'متوسط (نیاز به بهبود)';
      textEn = 'Moderate';
      color = '#f59e0b';
      crackTime = 'چند روز';
    }

    return { score, textFa, textEn, color, crackTime };
  };

  const pwdAnalysis = calculatePasswordStrength(testPassword);
  const securityHabits = habits.filter(h => h.sectionId === 'security');
  const completedHabits = securityHabits.filter(h => todayLogs[h.id]).length;

  const TABS = [
    { id: 'scanner', fa: 'اسکنر ترمینال', en: 'Terminal Scanner', icon: '💻' },
    { id: 'academy', fa: 'آکادمی سایبری', en: 'Cyber Academy', icon: '🎓' },
    { id: 'dimensions', fa: 'لایه‌های امنیت ۴گانه', en: '4 Security Layers', icon: '🛡️' },
    { id: 'analyzer', fa: 'تست رمزعبور', en: 'Password Analyzer', icon: '🔐' },
    { id: 'habits', fa: 'عادات فایروال', en: 'Firewall Habits', icon: '⚡' },
  ];

  return (
    <div className="page-container flex flex-col gap-6 pb-24 font-mono">
      {/* Hacker Matrix Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between border-b border-emerald-500/30 pb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center text-2xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse-slow">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold uppercase tracking-widest">
                DEFENSE_MATRIX_ONLINE
              </span>
            </div>
            <h1 className="text-xl font-black text-emerald-400 tracking-wide mt-1">
              {isRtl ? 'امنیت جامع و نفوذناپذیری' : 'Comprehensive Security & Cyber-Shield'}
            </h1>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
              {isRtl ? 'سپر چندلایه: روانی، فیزیکی، شناختی و آکادمی تخصصی سایبر' : 'Multi-layered defense: psychological, physical, cognitive & cyber'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeTab === tab.id
                ? 'bg-emerald-600 border-emerald-400 text-black font-black shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400/70 hover:border-emerald-500 hover:text-emerald-300'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{isRtl ? tab.fa : tab.en}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* TAB 1: TERMINAL SCANNER */}
        {activeTab === 'scanner' && (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Terminal Window */}
            <div className="p-5 rounded-3xl bg-[#030d08] border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] text-emerald-400 space-y-4">
              {/* Terminal Titlebar */}
              <div className="flex items-center justify-between border-b border-emerald-900 pb-2.5 text-xs text-emerald-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="ml-2 font-mono text-[11px] text-emerald-400 font-bold">root@life-os-shield:~#</span>
                </div>
                <span className="text-[10px] text-emerald-500/60 font-mono">STATUS: ACTIVE</span>
              </div>

              {/* Logs */}
              <div className="space-y-1.5 font-mono text-xs leading-relaxed min-h-[120px]">
                {terminalLogs.map((line, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 select-none">&gt;</span>
                    <span className={line.includes('COMPLETE') || line.includes('DEFCON') ? 'text-emerald-300 font-bold' : 'text-emerald-400/90'}>
                      {line}
                    </span>
                  </div>
                ))}
                {isScanning && (
                  <div className="text-emerald-400 animate-pulse font-bold">
                    &gt; Scanning subsystem telemetry...
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between gap-3">
                <button
                  onClick={runCyberAudit}
                  disabled={isScanning}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-black text-xs hover:bg-emerald-400 active:scale-95 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 flex items-center gap-2"
                >
                  <Terminal size={14} />
                  <span>{isScanning ? (isRtl ? 'در حال اسکن...' : 'SCANNING...') : (isRtl ? 'اجرای اسکن امنیتی سپر (+۲۵ XP)' : 'RUN SYSTEM AUDIT (+25 XP)')}</span>
                </button>

                {scanScore && (
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-600 block">{isRtl ? 'شاخص ایمنی' : 'SECURITY INDEX'}</span>
                    <span className="text-base font-black text-emerald-300">{scanScore}% SECURE</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: CYBER DEFENSE & OPSEC ACADEMY */}
        {activeTab === 'academy' && (
          <motion.div
            key="academy"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-xs text-emerald-500 px-1 font-mono font-bold flex items-center justify-between">
              <span>// OPSEC_ACADEMY: DEEP_CYBER_AND_MENTAL_DEFENSE</span>
              <span className="text-[10px] text-emerald-400/70">RESTRICTED_ACCESS</span>
            </div>

            {/* Deep Security Modules */}
            <div className="space-y-3">
              {SECURITY_ACADEMY_MODULES.map((item) => {
                const isExpanded = expandedSecId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isExpanded
                        ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                    }`}
                  >
                    <div
                      onClick={() => {
                        setExpandedSecId(isExpanded ? null : item.id);
                        haptics.tap();
                      }}
                      className="flex items-center justify-between cursor-pointer gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">{item.icon}</span>
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-emerald-300 font-mono">
                            {isRtl ? item.titleFa : item.titleEn}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-emerald-400/80">
                            <span className="font-semibold">{isRtl ? item.categoryFa : item.categoryEn}</span>
                            <span>•</span>
                            <span>{isRtl ? item.readTimeFa : item.readTimeEn}</span>
                          </div>
                        </div>
                      </div>

                      <button className="p-1 text-emerald-400">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-3 pt-3 border-t border-emerald-900/60 text-xs text-emerald-100/90 leading-relaxed space-y-3 font-sans"
                        >
                          <div className="whitespace-pre-line font-medium leading-loose text-emerald-100/90">
                            {isRtl ? item.contentFa : item.summaryEn}
                          </div>

                          {item.keyTakeawayFa && (
                            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-2 font-mono">
                              <Sparkles size={14} className="flex-shrink-0" />
                              <span>{isRtl ? `[KEY_DIRECTIVE]: ${item.keyTakeawayFa}` : item.keyTakeawayFa}</span>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Quick Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {CYBER_ACADEMY_MODULES.map((mod, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-500 transition-all card-hover"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{mod.icon}</span>
                      <div>
                        <span className="text-[10px] font-bold text-emerald-500 tracking-widest block font-mono">{mod.code}</span>
                        <h3 className="text-xs font-bold text-emerald-300 font-mono">
                          {isRtl ? mod.titleFa : mod.titleEn}
                        </h3>
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase font-mono">
                      {isRtl ? mod.levelFa : mod.levelEn}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/80 leading-relaxed font-sans mt-1">
                    {isRtl ? mod.descFa : mod.descEn}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* TAB 3: 4 SECURITY DIMENSIONS */}
        {activeTab === 'dimensions' && (
          <motion.div
            key="dimensions"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {SECURITY_LAYERS.map(layer => (
              <div
                key={layer.id}
                className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{layer.icon}</span>
                  <h3 className="text-xs font-bold text-emerald-300">
                    {isRtl ? layer.titleFa : layer.titleEn}
                  </h3>
                </div>
                <p className="text-xs text-emerald-200/80 leading-relaxed font-sans">
                  {isRtl ? layer.descFa : layer.descEn}
                </p>
                <div className="space-y-1 pt-1 border-t border-emerald-900/50">
                  {layer.rules.map((r, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-1.5 text-[11px] text-emerald-400/90 font-sans">
                      <span className="text-emerald-500">✔</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* TAB 4: PASSWORD ANALYZER */}
        {activeTab === 'analyzer' && (
          <motion.div
            key="analyzer"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded-3xl bg-[#030d08] border-2 border-emerald-500/50 space-y-4 text-emerald-400"
          >
            <div>
              <h2 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <Key size={18} className="text-emerald-400" />
                <span>{isRtl ? 'تحلیلگر آفلاین انتروپی و قدرت پسورد' : 'Client-Side Password Entropy Analyzer'}</span>
              </h2>
              <p className="text-[11px] text-emerald-600 mt-1 font-sans">
                {isRtl
                  ? 'این ابزار ۱۰۰٪ در مرورگر شما کار می‌کند و هیچ کاراکتری ارسال نمی‌شود. برای بررسی مقاومت رمز خود تست کنید:'
                  : 'Zero telemetry. Calculated locally in your browser to evaluate entropy and crack time:'}
              </p>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={testPassword}
                onChange={e => setTestPassword(e.target.value)}
                placeholder={isRtl ? 'یک رمزعبور برای تست تایپ کنید...' : 'Type a test passphrase...'}
                className="w-full px-4 py-3 rounded-2xl bg-black/80 border border-emerald-500/50 text-xs text-emerald-300 font-mono outline-none focus:border-emerald-400 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-emerald-500 font-bold"
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {/* Strength meter bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>{isRtl ? 'سطح امنیت:' : 'Security Level:'} <span style={{ color: pwdAnalysis.color }}>{isRtl ? pwdAnalysis.textFa : pwdAnalysis.textEn}</span></span>
                <span>{pwdAnalysis.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-950 overflow-hidden border border-emerald-900">
                <motion.div
                  animate={{ width: `${pwdAnalysis.score}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                  style={{ backgroundColor: pwdAnalysis.color }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-xs flex items-center justify-between">
              <span className="text-[11px] text-emerald-500">{isRtl ? 'زمان تقریبی کرک با سوپرکامپیوتر:' : 'Estimated Brute-force Crack Time:'}</span>
              <span className="font-bold text-emerald-300 font-mono">{pwdAnalysis.crackTime}</span>
            </div>
          </motion.div>
        )}

        {/* TAB 5: HABITS */}
        {activeTab === 'habits' && (
          <motion.div
            key="habits"
            initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="p-5 rounded-3xl bg-emerald-950/30 border border-emerald-500/40">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-emerald-300">
                    {isRtl ? 'چک‌لیست فایروال و عادات امنیتی روزانه' : 'Daily Security & Firewall Habits'}
                  </h2>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {isRtl ? `${completedHabits} از ${securityHabits.length} مورد انجام شد` : `${completedHabits} of ${securityHabits.length} completed`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {securityHabits.map(habit => (
                  <HabitItem
                    key={habit.id}
                    item={habit}
                    completed={!!todayLogs[habit.id]}
                    onToggle={() => {
                      toggleHabit(habit.id);
                      if (!todayLogs[habit.id]) {
                        soundEngine.playCheckmark();
                        addXP(habit.xp || 20, habit.nameFa || habit.name);
                      }
                    }}
                    onDelete={deleteHabit}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Custom Widgets Section */}
      <SectionWidgets sectionId="security" />
    </div>
  );
}
