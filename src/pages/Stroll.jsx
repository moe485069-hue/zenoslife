import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Brain, Sparkles, Heart, CheckCircle2, ChevronLeft, ChevronRight, Plus,
  BookOpen, DollarSign, Target, Globe, Shield, Home, ArrowRight, Play,
  Pause, RotateCcw, Flame, Activity, Zap, Droplets, Trophy, Dumbbell,
  Award, Timer, Volume2, Check, Archive, Bookmark, Pin, Languages,
  MessageSquare, Copy, Mic, HelpCircle, CheckCheck
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import { db, getToday } from '../db/database';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import { LANGUAGE_OPTIONS, speakLanguagePhrase } from '../data/languageLearningData';
import GodHeroCard from '../components/god/GodHeroCard';
import {
  GodStep1Attributes,
  GodStep2Concepts,
  GodStep3Quotes,
  GodStep4Gratitude,
  GodStep5PleasingDeeds,
  GodStep6Practice,
  GodStep7Omnipresence
} from '../components/god/GodStepViews';

// ─────────────────────────────────────────────
//  HELPER: DAILY ROTATING POOL SELECTOR
// ─────────────────────────────────────────────
function getDailyItem(items) {
  if (!items || items.length === 0) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return items[dayOfYear % items.length];
}

// ─────────────────────────────────────────────
//  DYNAMIC ROTATING CONTENT POOLS
// ─────────────────────────────────────────────
const DAILY_MINDFUL_QUOTES = [
  {
    fa: '«بزرگترین آزادی انسان این است که در برابر هر رویدادی، نگرش درونی خود را انتخاب کند.»',
    en: '"The greatest freedom is the ability to choose your attitude toward what you cannot change."',
    authorFa: 'اپیکتتوس — فیلسوف رواقی',
    authorEn: 'Epictetus'
  },
  {
    fa: '«ای برادر تو همه اندیشه‌ای، مابقی خود استخوان و ریشه‌ای. گر گلست اندیشه تو گلشنی، ور بود خاری تو هیمه گلخنی.»',
    en: '"You are entirely what you think; the rest is mere bone and fiber. Think roses, and you are a rose garden."',
    authorFa: 'مولانا جلال‌الدین بلخی',
    authorEn: 'Rumi'
  },
  {
    fa: '«ساکت باش و بگذار آرامش درونت با تو سخن بگوید؛ در شلوغی ذهن هیچ حکمتی زاده نمی‌شود.»',
    en: '"Silence is a source of great strength. In the stillness of mind, wisdom is born."',
    authorFa: 'لائوتسه — تائو ت چینگ',
    authorEn: 'Lao Tzu'
  },
  {
    fa: '«تو بر افکار خود قدرت داری، نه بر وقایع بیرونی. این حقیقت را دریاب تا نیرومند شوی.»',
    en: '"You have power over your mind - not outside events. Realize this, and you will find strength."',
    authorFa: 'مارکوس اورلیوس — تأملات',
    authorEn: 'Marcus Aurelius'
  },
  {
    fa: '«زندگی یک بازی نیست که برای پیروزی در آن بجنگی؛ سفری است که در هر گامش باید بیدار باشی.»',
    en: '"Life is not a battle to win, but a sacred journey to be lived with awakened awareness in every step."',
    authorFa: 'سهراب سپهری',
    authorEn: 'Sohrab Sepehri'
  },
  {
    fa: '«ما از آنچه رخ می‌دهد رنج نمی‌بریم، بلکه از برداشتی که از وقایع در ذهن می‌سازیم عذاب می‌کشیم.»',
    en: '"We suffer more often in imagination than in reality."',
    authorFa: 'سنکا — نامه‌های رواقی',
    authorEn: 'Seneca'
  },
  {
    fa: '«آرامش اقیانوس را به خاطر بسپار؛ در عمیق‌ترین نقطه‌ها، هیچ طوفانی توان لرزاندن آب را ندارد.»',
    en: '"Remember the ocean depths: no matter how violent the storm on the surface, the deep abyss remains untouched and still."',
    authorFa: 'خرد کهن شرق',
    authorEn: 'Eastern Wisdom'
  }
];

const DAILY_SHADOW_QUESTIONS = [
  {
    qFa: '«امروز اگر هیچ ترسی از شکست یا قضاوت دیگران نداشتی، چه تصمیم شجاعانه‌ای می‌گرفتی؟»',
    qEn: '"If you had zero fear of failure or judgment today, what one brave decision would you make?"',
    tipFa: '💡 شجاعت یعنی اقدام علیرغم حضور ترس، نه غیاب ترس.',
    tipEn: '💡 Courage is action in the presence of fear, not its absence.'
  },
  {
    qFa: '«کدام بخش از گذشته‌ات هست که هنوز با آن صلح نکرده‌ای و انرژی امروزت را می‌گیرد؟»',
    qEn: '"Which part of your past have you not fully made peace with, draining your vital energy today?"',
    tipFa: '💡 پذیرش گذشته به معنای تایید آن نیست، بلکه رها کردن بار سنگین آن است.',
    tipEn: '💡 Acceptance does not mean endorsement; it means unburdening your soul.'
  },
  {
    qFa: '«چه ویژگی یا رفتاری در دیگران بیشترین خشم را در تو برمی‌انگیزد؟ چه چیزی از خودت در آن پنهان است؟»',
    qEn: '"What behavior in others triggers you the most? What hidden reflection of yourself lies within it?"',
    tipFa: '💡 طبق نظریه یونگ، آنچه در دیگران ما را می‌آزارد، آینه‌ای از سایه‌های انکارشده خود ماست.',
    tipEn: '💡 In Jungian psychology, what irritates us in others is often a mirror of our own repressed shadow.'
  },
  {
    qFa: '«اگر قرار بود تنها یک عادت یا ماسک ساختگی‌ات را کنار بگذاری، آن چه بود؟»',
    qEn: '"If you were to drop just one false persona or pretension today, what would you let go of?"',
    tipFa: '💡 صداقت با خویشتن، سرآغاز تولد قدرت درونی است.',
    tipEn: '💡 Honesty with oneself is the birth of true sovereign power.'
  },
  {
    qFa: '«چه نیازی در قلبت داری که مدام از دیگران طلب می‌کنی، اما خودت به خودت نمی‌دهی؟»',
    qEn: '"What emotional need do you constantly seek from others, yet withhold from giving yourself?"',
    tipFa: '💡 تحسین، احترام و عشق ابتدا باید از درون خودت سرچشمه بگیرد.',
    tipEn: '💡 Validation, respect, and deep love must first flow from within.'
  },
  {
    qFa: '«بزرگترین دروغی که برای راحتی کوتاه‌مدت به خودت می‌گویی چیست؟»',
    qEn: '"What is the subtle rationalization or lie you tell yourself for short-term comfort?"',
    tipFa: '💡 مواجهه با حقیقت دردناک است، اما تنها مسیر آزادی است.',
    tipEn: '💡 Facing truth is sharp, yet it is the only road to sovereign liberation.'
  },
  {
    qFa: '«اگر به کودک ۱۰ ساله درونت نگاه کنی، آیا از فردی که امروز شدی خشنود است؟»',
    qEn: '"If you look into the eyes of your 10-year-old self, are they proud of the person you are becoming?"',
    tipFa: '💡 به او اطمینان بده که اکنون محافظ او هستی.',
    tipEn: '💡 Reassure your inner child that you are now their wise protector.'
  }
];

const DAILY_COSMIC_REFLECTIONS = [
  {
    fa: 'کل سیاره زمین در مقیاس کهکشان ما مانند دانه‌ای غبار در یک پرتو نور خورشید است. تمام دغدغه‌های کوچک روزمره را به اقیانوس کیهان بسپار.',
    en: 'Earth is a pale blue dot in the cosmos. Release small anxieties. You are made of stardust, facing the infinite.',
    icon: '🪐'
  },
  {
    fa: 'اتم‌های بازوی راست تو از یک ستاره منفجرشده و اتم‌های بازوی چپت شاید از ستاره‌ای دیگر آمده‌اند. تو فرزند زنده‌ی کل گیتی هستی.',
    en: 'The nitrogen in our DNA, the calcium in our teeth, the iron in our blood were made in the interiors of collapsing stars. We are stardust.',
    icon: '✨'
  },
  {
    fa: 'زمان مانند رودی عظیم در جریان است. میلیاردها انسان پیش از ما آمدند و رفتند. از این لحظه کمیاب حضور نهایت شادمانی و آرامش را بچش.',
    en: 'Time flows like a vast cosmic river. Billions came before us. Savor this fleeting, miraculous moment of conscious presence.',
    icon: '🌌'
  },
  {
    fa: 'نیروی جاذبه زمین تو را در آغوش گرفته است. تو در جهانی با صدها میلیارد کهکشان، صاحب آگاهی هستی. احساس سبکی و احترام به هستی کن.',
    en: 'Earth embraces you with gravity. In a universe of billions of galaxies, you hold conscious life. Feel the light wonder of being.',
    icon: '🌍'
  }
];
const DAILY_RELATIONAL_QUOTES = [
  {
    fa: '«عشق واقعی، تمایل به رها کردن کنترل و پذیرش طرف مقابل با تمام نقص‌های اوست.»',
    en: '"True love is the willingness to let go of control and accept the other person in their entirety, with all their flaws."',
    authorFa: 'اریک فروم — هنر عشق ورزیدن',
    authorEn: 'Erich Fromm'
  },
  {
    fa: '«روابط اصیل زمانی آغاز می‌شوند که نقاب‌ها را برداریم و شجاعت ابراز آسیب‌پذیری خود را داشته باشیم.»',
    en: '"Authentic relationships begin when we drop our masks and have the courage to show our vulnerability."',
    authorFa: 'کارل راجرز — راه انسان شدن',
    authorEn: 'Carl Rogers'
  },
  {
    fa: '«مردم هرچه بگویند، بازتابی از دنیای درون خودشان است، نه ارزش واقعی تو. هرگز رفتار دیگران را به خود نگیر.»',
    en: '"Whatever people say or do is a projection of their own reality. Don\'t take anything personally."',
    authorFa: 'دون میگوئل روئیز — چهار پیمان',
    authorEn: 'Don Miguel Ruiz'
  },
  {
    fa: '«اگر می‌خواهی با دیگران در صلح باشی، ابتدا باید یاد بگیری با تنهایی خودت دوست شوی.»',
    en: '"If you want to be at peace with others, you must first learn to be comfortable with your own solitude."',
    authorFa: 'شوپنهاور',
    authorEn: 'Arthur Schopenhauer'
  },
  {
    fa: '«همدلی واقعی یعنی توانایی دیدن دنیا از پنجره چشمان دیگری، بدون اینکه خودت را گم کنی.»',
    en: '"Empathy is seeing with the eyes of another, listening with the ears of another, and feeling with the heart of another."',
    authorFa: 'آلفرد آدلر',
    authorEn: 'Alfred Adler'
  }
];

const DAILY_RELATIONAL_QUESTIONS = [
  {
    qFa: '«امروز کجا می‌توانی در مکالمه‌ها از فرمول NVC استفاده کنی؟ (مشاهده بدون قضاوت ➔ ابراز احساس ➔ بیان نیاز ➔ تقاضای شفاف)»',
    qEn: '"Where can you apply the NVC formula today? (Observe without judgment ➔ Express feeling ➔ State need ➔ Make a clear request)"',
    tipFa: '💡 مثلاً به جای «تو بی‌مسئولیتی»، بگو: «وقتی ظرف‌ها شسته نمی‌شوند (مشاهده)، کلافه می‌شوم (احساس)، چون به نظم نیاز دارم (نیاز). می‌توانی لطفاً آن‌ها را بشویی؟ (تقاضا)»',
    tipEn: '💡 Instead of "You are irresponsible," try: "When the dishes are unwashed (observation), I feel overwhelmed (feeling), because I need order (need). Could you wash them? (request)"'
  },
  {
    qFa: '«یک مرز ارتباطی سالم که این هفته باید برای حفظ انرژی‌ات تعیین کنی یا قوی‌ترش کنی چیست؟»',
    qEn: '"What is one healthy boundary you need to establish or reinforce this week to protect your energy?"',
    tipFa: '💡 مرزبندی بی‌ادبی نیست؛ بلکه مشخص کردن کاتالوگِ چگونگی تعامل محترمانه دیگران با شماست.',
    tipEn: '💡 Setting boundaries is not rude; it is providing the user manual of how to interact with you respectfully.'
  },
  {
    qFa: '«آیا در حال حاضر در یک رابطه احساس خفگی یا وابستگی ناسالم می‌کنی؟ چه نیازی را در خودت نادیده گرفته‌ای؟»',
    qEn: '"Are you currently feeling suffocated or codependent in a relationship? What personal need are you neglecting?"',
    tipFa: '💡 پذیرش تنهایی و پر کردن ظرف عاطفی از درون، درمان وابستگی ناسالم است.',
    tipEn: '💡 Emotional sovereignty begins when you take full responsibility for your own happiness.'
  },
  {
    qFa: '«امروز چطور می‌توانی به جای انتقاد، یک بازخورد سازنده و مبتنی بر رشد به یک همکار یا دوست بدهی؟»',
    qEn: '"How can you offer growth-oriented constructive feedback instead of criticism to a friend or colleague today?"',
    tipFa: '💡 انتقاد به هویت حمله می‌کند، اما بازخورد روی رفتار تمرکز دارد.',
    tipEn: '💡 Criticism attacks identity, whereas constructive feedback focuses strictly on behavior.'
  }
];

const DAILY_DOPAMINE_QUOTES = [
  {
    fa: '«دوپامین مولکول ارضای میل نیست، مولکول اشتیاق برای رسیدن به بعدی است. وقتی یاد بگیری از تلاش لذت ببری، مغزت شکست‌ناپذیر می‌شود.»',
    en: '"Dopamine is not the molecule of reward; it is the molecule of anticipation. When you learn to attach dopamine to the effort itself, you become unstoppable."',
    authorFa: 'دکتر اندرو هیوبرمن — نوروساینتیست دانشگاه استنفورد',
    authorEn: 'Dr. Andrew Huberman'
  },
  {
    fa: '«لذت‌های آسان و ارزان، هزینه سنگین اضطراب و بی‌هدفی را به بار می‌آورند. تعادل دوپامینی در گرو رنج‌های داوطلبانه (ورزش، کار عمیق، خلوت) است.»',
    en: '"Easy dopamine leads to chronic anxiety and deficit. The neurochemical balance tilts toward pleasure only after voluntary pain (exercise, focus, cold exposure)."',
    authorFa: 'دکتر آنا لمبکه — کتاب ملت دوپامین',
    authorEn: 'Dr. Anna Lembke — Dopamine Nation'
  },
  {
    fa: '«حاکم واقعی کسی است که بر تکانه‌ها و هوس‌های آنی خود مسلط باشد، نه بر سرزمین‌ها.»',
    en: '"He is most powerful who has power over himself and his momentary urges."',
    authorFa: 'سنکا — نامه‌های رواقی',
    authorEn: 'Seneca'
  },
  {
    fa: '«هر بار که به یک وسوسه آنی "نه" می‌گویی، قشر پیش‌پیشانی مغزت مانند یک عضله قوی‌تر می‌شود.»',
    en: '"Every time you say no to an impulsive urge, the prefrontal cortex of your brain strengthens like a well-trained muscle."',
    authorFa: 'روانشناسی عصب‌شناختی اراده',
    authorEn: 'Neuroscience of Willpower'
  }
];

const DAILY_DOPAMINE_QUESTIONS = [
  {
    qFa: '«امروز کدام محرک دوپامین ارزان (اسکرول بی‌هدف اینستاگرام، شیرینی، پورنوگرافی، خرید احساسی) بیشترین انرژی روانی را از تو گرفت؟»',
    qEn: '"Which cheap dopamine trigger (mindless scrolling, sugar, pornography, emotional shopping) drained your vital energy most today?"',
    tipFa: '💡 هوس‌ها مانند موج دریا هستند؛ اوج می‌گیرند و ظرف ۵ تا ۱۰ دقیقه فروکش می‌کنند (تکنیک Urge Surfing).',
    tipEn: '💡 Cravings are like ocean waves; they peak and fade within 5 to 10 minutes (Urge Surfing technique).'
  },
  {
    qFa: '«در لحظه‌ای که به سمت عادت مخرب دست دراز می‌کنی، در واقع در حال فرار از چه احساسی هستی؟ (خستگی، تنهایی، استرس، پوچی یا ترس از شروع کار؟)»',
    qEn: '"When you reach for an unhealthy habit, what emotion are you genuinely escaping from? (Boredom, loneliness, stress, emptiness, or fear?)"',
    tipFa: '💡 اعتیاد ناشی از لذت نیست، ناشی از تلاش برای فرار از رنج نامرئی است.',
    tipEn: '💡 Addiction is not about seeking pleasure; it is an attempt to escape unaddressed internal pain.'
  },
  {
    qFa: '«چه فعالیت سالمی (دوش آب سرد، ۲۰ دقیقه ورزش سنگین، حل یک مسئله کاری) می‌تواند دوپامین پایدار و عمیق به مغزت هدیه دهد؟»',
    qEn: '"What healthy challenge (cold shower, intense workout, solving a complex problem) can deliver lasting clean dopamine to your brain?"',
    tipFa: '💡 دوپامینی که بعد از تلاش به دست بیاید، حس غرور و انگیزه روزهای بعد را تضمین می‌کند.',
    tipEn: '💡 Dopamine earned after hard effort elevates your baseline mood and future motivation.'
  }
];

const DAILY_NIGHT_QUOTES = [
  {
    fa: '«روز به پایان رسیده است؛ کارهای انجام‌شده و انجام‌نشده را به خواب بسپار. فردا با خورشیدی نو و نیرویی تازه زاده خواهی شد.»',
    en: '"Finish each day and be done with it. You have done what you could. Tomorrow is a new day; begin it serenely."',
    authorFa: 'رالف والدو امرسون',
    authorEn: 'Ralph Waldo Emerson'
  },
  {
    fa: '«خواب عمیق، معبد شستشوی مغز و بازسازی روح است. تمام افکار سنگین را در آستانه در ورودی خواب زمین بگذار.»',
    en: '"Sleep is the golden chain that ties health and our bodies together."',
    authorFa: 'توماس دکر',
    authorEn: 'Thomas Dekker'
  },
  {
    fa: '«شب خلوتی است میان تو و حقیقت هستی. در سکوت شبانگاه، بخشایش خود را کامل کن تا با قلبی سبک به خواب روی.»',
    en: '"Night is a sanctuary between you and infinite truth. In the nocturnal quiet, complete your self-forgiveness and rest light."',
    authorFa: 'خرد کهن و مراقبه تائو',
    authorEn: 'Taoist Wisdom'
  }
];

const DAILY_KNOWLEDGE_MENTAL_MODELS = [
  {
    nameFa: 'تکنیک فاینمن (The Feynman Technique)',
    nameEn: 'The Feynman Technique',
    conceptFa: 'اگر نتوانی موضوعی پیچیده را به یک کودک ۸ ساله با کلمات ساده توضیح دهی، یعنی خودت آن را عمیقاً نفهمیده‌ای.',
    conceptEn: 'If you cannot explain it to an 8-year-old in simple words, you do not truly understand it.',
    icon: '💡'
  },
  {
    nameFa: 'اصل پارتو ۸۰/۲۰ (Pareto Principle)',
    nameEn: 'Pareto 80/20 Rule',
    conceptFa: '۸۰٪ نتایج و یادگیری‌های عمیق زندگی از ۲۰٪ ورودی‌ها و کتاب‌های کلیدی حاصل می‌شوند. ۲۰٪ حیاتی را شناسایی کن.',
    conceptEn: '80% of profound insights come from 20% of foundational sources. Ruthlessly focus on the vital 20%.',
    icon: '📊'
  },
  {
    nameFa: 'تفکر از اصول اولیه (First Principles Thinking)',
    nameEn: 'First Principles Thinking',
    conceptFa: 'مسئله را به بنیادی‌ترین حقایق غیرقابل انکار آن خرد کن و راه‌حل را از پایه بساز، نه از روی تقلید و مقایسه.',
    conceptEn: 'Boil a problem down to its fundamental truths and reason up from there, rather than reasoning by analogy.',
    icon: '🔬'
  },
  {
    nameFa: 'مدل معکوس‌سازی (Inversion Mental Model)',
    nameEn: 'Inversion Thinking',
    conceptFa: 'به جای آنکه بپرسی "چگونه موفق شوم؟"، بپرس "چگونه می‌توانم کاملاً شکست بخورم و بدبخت شوم؟" و سپس از آن مسیرها پرهیز کن.',
    conceptEn: 'Instead of asking how to succeed, ask how to guarantee failure — and then ruthlessly avoid those behaviors.',
    icon: '🔄'
  }
];


// ─────────────────────────────────────────────
//  EXERCISE DATA FOR AEROBIC & BODY MOVEMENT
// ─────────────────────────────────────────────
const AEROBIC_LEVELS = [
  {
    id: 'gentle',
    levelNum: 1,
    nameFa: '۱. جریان ملایم و چی‌گونگ (سبک و بازیابی مفاصل)',
    nameEn: '1. Gentle Chi Flow & Joint Mobility',
    descFa: '۷ حرکت تائوئیستی، تنفس لنفاوی، روان‌سازی مفاصل و فعال‌سازی مریدین‌های انرژی بدن بدون کوچکترین فشار و خستگی.',
    descEn: '7 Taoist Qigong movements, lymphatic breathing, joint mobility & meridian flow for deep restorative energy.',
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    intensityBadge: '🟢 سبک / ۵-۱۵ دقیقه',
    calPerMin: 4.5,
    exercises: [
      {
        id: 'qigong_cloud_hands',
        nameFa: '۱. ابرهای شناور و ریشه تائوئیستی (Cloud Hands Flow)',
        nameEn: '1. Taoist Cloud Hands & Earth Rooting',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۴۵ ثانیه',
        suggestedSetsEn: '3 Sets × 45s',
        restSec: 15,
        targetMusclesFa: 'ستون فقرات، کمربند شانه‌ای، مریدین ریه و طحال، عضلات عمقی شکم',
        targetMusclesEn: 'Spine, Shoulder girdle, Lung & Spleen meridians, Deep core',
        goalFa: 'آرام‌سازی سیستم عصبی سمپاتیک، باز کردن مایع مفصلی ستون فقرات و گردش ملایم خون.',
        goalEn: 'Calm the nervous system, lubricate spinal joints, and circulate oxygenated blood.',
        howToFa: '۱. پاها را به اندازه عرض شانه باز کنید و زانوها را اندکی خم نگه دارید. ۲. یک دست را در سطح سینه و دست دیگر را در سطح ناف نگه دارید. ۳. بالاتنه را با ریتم آرام از پهلویی به پهلوی دیگر بچرخانید و مسیر حرکت ابرها را با دست‌ها در فضا ترسیم کنید. ۴. با هر چرخش به پهلو جای دست‌ها را با نرمی عوض کنید.',
        formTipFa: 'زانوها کمی خمیده، دست‌ها مانند نوازش ابریشم در هوا حرکت کنند. دم با چرخش به راست، بازدم با چرخش به چپ.',
        formTipEn: 'Soft knees, arms gliding like silk. Inhale drifting right, exhale gliding left.',
        svgType: 'cloud_hands'
      },
      {
        id: 'crane_opening',
        nameFa: '۲. گشودن بال‌های درنا و سینه (Crane Wings & Heart Expansion)',
        nameEn: '2. Opening the Chest & Crane Wings',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۴۵ ثانیه',
        suggestedSetsEn: '3 Sets × 45s',
        restSec: 15,
        targetMusclesFa: 'عضلات سینه‌ای، پشتی بزرگ، بازکننده‌های قفسه سینه، مریدین قلب',
        targetMusclesEn: 'Pectorals, Rhomboids, Chest openers, Heart meridian',
        goalFa: 'افزایش حجم تنفس دیافراگمی، تصحیح قوز پشت و خون‌رسانی به مغز.',
        goalEn: 'Expand lung capacity, correct forward posture, and send fresh oxygen to the brain.',
        howToFa: '۱. صاف بایستید و پاشنه‌ها را نزدیک هم قرار دهید. ۲. همزمان با دم عمیق از بینی، دست‌ها را مانند بال‌های پرنده درنا از طرفین به بالا و عقب بگشایید و قفسه سینه را رو به سقف منبسط کنید. ۳. با بازدم آرام از دهان، دست‌ها را به مرکز سینه بازگردانید.',
        formTipFa: 'هنگام باز شدن دست‌ها نفس عمیق بکش و سینه را رو به آسمان باز کن؛ هنگام بستن دست‌ها بازدم کامل.',
        formTipEn: 'Deep inhale as arms wing outward, open heart to sky; complete exhale as palms gather at center.',
        svgType: 'crane_wings'
      },
      {
        id: 'dragon_spinal_wave',
        nameFa: '۳. موج ستون فقرات و دوران اژدها (Spinal Wave & Dragon Twist)',
        nameEn: '3. Spinal Wave & Dragon Twist',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۴۵ ثانیه',
        suggestedSetsEn: '3 Sets × 45s',
        restSec: 15,
        targetMusclesFa: 'کل طول ستون مهره‌ها، عضلات خم‌کننده ران (Psoas)، مفصل ران و گردن',
        targetMusclesEn: 'Full vertebral column, Psoas muscle, Hip flexors & Neck',
        goalFa: 'تخلیه اسپاسم‌های عضلانی ناشی از نشستن طولانی و تحریک مایع مغزی-نخاعی.',
        goalEn: 'Release seated stiffness, mobilize every vertebrae, and stimulate cerebrospinal fluid.',
        howToFa: '۱. پاها را باز بگذارید. ۲. حرکت موجی ملایم و پیوسته‌ای از لگن آغاز کرده و مهره به مهره به کمر، سینه، گردن و نوک سر هدایت کنید. ۳. دست‌ها در طرفین بدن به عنوان بال‌های شناور اژدها عمل کنند.',
        formTipFa: 'حرکت موجی نرم از لگن شروع شده و تا نوک سر ادامه یابد. تنفس آرام و ریتمیک.',
        formTipEn: 'Initiate the undulation from the pelvis up to the crown. Keep breath fluid and unhurried.',
        svgType: 'spine_wave'
      },
      {
        id: 'lymphatic_march',
        nameFa: '۴. گام‌های هوشیار و پمپ لنفاوی (Mindful March & Lymph Pump)',
        nameEn: '4. Mindful March & Lymphatic Flow',
        durationSec: 60,
        suggestedSetsFa: '۳ ست × ۶۰ ثانیه',
        suggestedSetsEn: '3 Sets × 60s',
        restSec: 15,
        targetMusclesFa: 'عضلات ساق پا (دوقلو و نعلی)، چهارسر ران، گره‌های لنفاوی کشاله ران',
        targetMusclesEn: 'Calves (Soleus pump), Quadriceps, Inguinal lymph nodes',
        goalFa: 'فعال‌سازی قلب دوم بدن (عضلات ساق)، دفع سموم سلولی و افزایش ملایم ضربان قلب.',
        goalEn: 'Activate the calf muscle pump, stimulate lymphatic drainage, and elevate heart rate gently.',
        howToFa: '۱. در جا بایستید. ۲. زانوها را به صورت متناوب تا سطح لگن بالا بیاورید. ۳. دست‌ها را هماهنگ با پای مخالف به جلو و عقب حرکت دهید و روی سینه پا به نرمی و فنری فرود آیید.',
        formTipFa: 'پاها را به آرامی تا سطح لگن بالا بیاورید، دست‌ها در خلاف جهت با ریتم موزون حرکت کنند.',
        formTipEn: 'Lift knees toward hip height gently, opposite arm swings smoothly in coordination.',
        svgType: 'lymphatic_march'
      },
      {
        id: 'drawing_bow',
        nameFa: '۵. کشش کمان آسمانی و باز کردن ریه (Drawing the Bow - Qigong)',
        nameEn: '5. Drawing the Bow & Arrow Qigong',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۱۰ تکرار هر طرف',
        suggestedSetsEn: '3 Sets × 10 Reps each side',
        restSec: 15,
        targetMusclesFa: 'سرشانه، عضلات متوازی‌الاضلاع پشت، مچ دست، مریدین روده بزرگ و ریه',
        targetMusclesEn: 'Deltoids, Rhomboids, Wrist extensors, Large Intestine & Lung meridians',
        goalFa: 'افزایش قدرت تمرکز چشم‌ها و گشودن بن‌بست‌های انرژی در قفسه سینه و گردن.',
        goalEn: 'Sharpen visual focus, open thoracic energy blockages, and expand breath depth.',
        howToFa: '۱. در حالت ایستاده پاها بازتر از شانه قرار گیرند. ۲. دست چپ را مانند نگه داشتن کمان به جلو بکشید و دست راست را مانند کشیدن زه تا کنار گوش عقب ببرید. ۳. نگاه متمرکز به ورای نوک انگشتان و سپس تعویض جهت.',
        formTipFa: 'یک دست به شکل زه کمان کشیده و دست دیگر هدف را نشانه می‌رود. نگاه دقیق به نوک انگشتان.',
        formTipEn: 'Draw the imaginary bowstring with focused intent, gaze fixed past the extended fingertips.',
        svgType: 'drawing_bow'
      },
      {
        id: 'separating_heaven_earth',
        nameFa: '۶. لمس آسمان و زمین با تعادل تائو (Separating Heaven and Earth)',
        nameEn: '6. Separating Heaven and Earth',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۱۲ تکرار',
        suggestedSetsEn: '3 Sets × 12 Reps',
        restSec: 10,
        targetMusclesFa: 'عضلات دنده‌ای، مریدین معده و طحال، کشش پهلوها و مچ دست',
        targetMusclesEn: 'Intercostal muscles, Stomach & Spleen meridians, Latissimus dorsi',
        goalFa: 'بهبود هضم غذا، ماساژ ارگان‌های داخلی شکم و رفع خستگی گوارشی.',
        goalEn: 'Improve digestion, gently massage internal visceral organs, and restore abdominal vitality.',
        howToFa: '۱. بایستید و کف یک دست را رو به آسمان و کف دست دیگر را رو به زمین فشار دهید. ۲. کشش متقارن و موزونی در امتداد ستون فقرات و پهلوها ایجاد کنید. ۳. با بازدم دست‌ها در مرکز سینه جابجا شوند.',
        formTipFa: 'یک دست رو به آسمان و دست دیگر رو به زمین فشار ملایم بیاورد، همراه با کشش موزون ستون فقرات.',
        formTipEn: 'One palm presses toward heaven, the other grounds toward earth with rhythmic spinal stretch.',
        svgType: 'heaven_earth'
      },
      {
        id: 'torso_sufi_circles',
        nameFa: '۷. دوران تنه و رهاسازی لگن (Sufi Torso Circles)',
        nameEn: '7. Sufi Torso Circles & Grounding',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۴۰ ثانیه',
        suggestedSetsEn: '3 Sets × 40s',
        restSec: 10,
        targetMusclesFa: 'عضلات مایل شکمی، عضلات کف لگن، مفصل ران و مهره‌های کمری',
        targetMusclesEn: 'Obliques, Pelvic floor, Sacroiliac joint, Lumbar spine',
        goalFa: 'ایجاد آرامش روانی عمیق، رهاسازی گره‌های کمری و اتصال به زمین.',
        goalEn: 'Induce deep parasympathetic calm, release lower back tightness, and ground your awareness.',
        howToFa: '۱. بایستید یا راحت بنشینید و دست‌ها را روی زانوها بگذارید. ۲. قفسه سینه را در دایره‌های نرم و سیال در جهت عقربه‌های ساعت به دور محور لگن بچرخانید. ۳. در نیم‌دایره جلو دم عمیق و در نیم‌دایره عقب بازدم تخلیه‌کننده.',
        formTipFa: 'تنه را در دایره‌های ملایم و نرم به دور لگن بچرخانید؛ هنگام چرخش به جلو دم و عقب بازدم.',
        formTipEn: 'Rotate upper torso in smooth fluid circles around hips; inhale forward, exhale back.',
        svgType: 'torso_circles'
      }
    ]
  },
  {
    id: 'moderate',
    levelNum: 2,
    nameFa: '۲. هوازی پویا و کونگ‌فو شائولین (متوسط و نشاط‌آور)',
    nameEn: '2. Dynamic Cardio & Shaolin Flow',
    descFa: '۸ حرکت پویا: ضربات موزون شائولین، فلو حیوانی (Animal Flow)، اسکات هندی و پروانه‌های تنفسی برای تقویت پایدار قلب و عروق.',
    descEn: '8 dynamic movements: Shaolin rhythm, Animal Flow, Hindu squats & breath cardio for sustained calorie burn & stamina.',
    color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
    intensityBadge: '🟡 متوسط / ۱۰-۳۰ دقیقه',
    calPerMin: 8.5,
    exercises: [
      {
        id: 'shaolin_mabu_strikes',
        nameFa: '۱. استقرار اسب و ضربات ریتمیک شائولین (Shaolin Horse Stance & Palms)',
        nameEn: '1. Shaolin Horse Stance & Dynamic Palms',
        durationSec: 50,
        suggestedSetsFa: '۳ ست × ۵۰ ثانیه',
        suggestedSetsEn: '3 Sets × 50s',
        restSec: 20,
        targetMusclesFa: 'چهارسر ران، باسن، عضلات شکم و مایل شکمی، کتف و شانه',
        targetMusclesEn: 'Quadriceps, Glutes, Core & Obliques, Deltoids',
        goalFa: 'استقامت ایزومتریک پاها، تقویت اراده و استقامت قلبی-تنفسی همزمان.',
        goalEn: 'Build rock-solid leg stamina, mental grit, and steady aerobic calorie burning.',
        howToFa: '۱. پاها را دو برابر عرض شانه باز کنید و زانوها را خم کنید تا ران‌ها تقریباً موازی زمین شوند. ۲. بالاتنه کاملاً عمود، دست‌ها در گارد کنار دنده‌ها. ۳. با هر بازدم قدرتمند از دهان، یک دست را به جلو پرتاب کرده و با چرخش مچ دست به فرم کف دست یا مشت درآورید. ۴. دست را سریع جمع کرده و دست دیگر را پرتاب کنید.',
        formTipFa: 'پاها بازتر از شانه، لگن پایین، با هر ضربه دست بازدم قدرتمند و با برگشت دم عمیق بگیرید.',
        formTipEn: 'Wide stance, sink hips, steady breath with sharp palm drives from the core.',
        svgType: 'shaolin_mabu'
      },
      {
        id: 'boxer_rhythm_skip',
        nameFa: '۲. گام‌های بوکسور و پرش ریتمیک سبک (Boxer Skip & Rhythm Weave)',
        nameEn: '2. Boxer Skip & Rhythm Weave',
        durationSec: 50,
        suggestedSetsFa: '۳ ست × ۵۰ ثانیه',
        suggestedSetsEn: '3 Sets × 50s',
        restSec: 20,
        targetMusclesFa: 'ساق پا، مچ، سیستم تعادل گوش داخلی، عضلات شانه و ساعد',
        targetMusclesEn: 'Calves, Ankles, Vestibular coordination, Shoulders',
        goalFa: 'چربی‌سوزی عالی، چابکی سیستم عصبی و افزایش هماهنگی دو نیمکره مغز.',
        goalEn: 'High aerobic calorie burn, agility, and hemispheric brain synchronization.',
        howToFa: '۱. روی سینه پاها با ریتم سبک و فنری بالا و پایین بپرید. ۲. وزن را دو شماره روی پای راست و دو شماره روی پای چپ بیندازید (شبیه‌ساز طناب‌زدن بوکس). ۳. دست‌ها در گارد بوکس جلوی چانه و شانه‌ها کاملاً ریلکس و آزاد باشند.',
        formTipFa: 'روی سینه پاها سبک بپرید، وزن را بین پای چپ و راست منتقل کنید و گارد سبک دست‌ها را حفظ کنید.',
        formTipEn: 'Stay light on the balls of your feet, shifting weight with a relaxed boxer bounce.',
        svgType: 'boxer_bounce'
      },
      {
        id: 'hindu_squat_flow',
        nameFa: '۳. اسکات سیال هندی (Baithak / Hindu Squat Flow)',
        nameEn: '3. Hindu Squat Flow (Baithak)',
        durationSec: 50,
        suggestedSetsFa: '۳ ست × ۲۰ تکرار',
        suggestedSetsEn: '3 Sets × 20 Reps',
        restSec: 20,
        targetMusclesFa: 'چهارسر، باسن، مچ پا، ریه و دیافراگم',
        targetMusclesEn: 'Quadriceps, Gluteus maximus, Calves, Diaphragm',
        goalFa: 'تقویت زانوها بدون آسیب وزنه، افزایش ظرفیت هوازی و قدرت فنری تاندون‌ها.',
        goalEn: 'Joint-friendly knee strengthening, expanded lung volume, and tendon elasticity.',
        howToFa: '۱. بایستید و دست‌ها را در امتداد سینه نگه دارید. ۲. همزمان با فرود آمدن در اسکات عمیق، پاشنه‌ها را کمی از زمین بلند کنید و دست‌ها را به پشت بدن جارو کنید (بازدم). ۳. با فشار پنجه‌ها بلند شوید، پاشنه‌ها را بر زمین بگذارید و دست‌ها را رو به جلو باز کنید (دم عمیق).',
        formTipFa: 'هنگام پایین آمدن روی سینه پا بروید و دست‌ها پشت بدن حرکت کنند؛ با بالا آمدن پاشنه‌ها زمین بخورند و دست‌ها جلو آیند.',
        formTipEn: 'Heels rise slightly as you descend, arms sweep behind; stand and sweep arms forward with deep breath.',
        svgType: 'hindu_squat'
      },
      {
        id: 'tiger_crawl_step',
        nameFa: '۴. گام ببر و فلو زمینی (Tiger Animal Flow Crawl)',
        nameEn: '4. Tiger Animal Flow Crawl',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۴۵ ثانیه',
        suggestedSetsEn: '3 Sets × 45s',
        restSec: 20,
        targetMusclesFa: 'کل بدن: شانه، مچ دست، عضلات مرکزی شکم، کشاله ران و همسترینگ',
        targetMusclesEn: 'Full Body: Shoulder stabilizers, Core, Adductors & Hamstrings',
        goalFa: 'یکپارچه‌سازی تمام زنجیره‌های حرکتی بدن و افزایش تحرک مفاصل در سه بعد.',
        goalEn: 'Integrate kinetic chains, boost functional mobility and total metabolic burn.',
        howToFa: '۱. در وضعیت چهار دست و پا روی زمین قرار گیرید. ۲. زانوها را ۲ تا ۳ سانتی‌متر از زمین جدا کنید. ۳. دست راست و پای چپ را همزمان ۱۰ سانتی‌متر به جلو ببرید و سپس دست چپ و پای راست. ۴. کمر کاملاً صاف و لگن بدون انحراف باشد.',
        formTipFa: 'کف دست‌ها و نوک انگشتان پا روی زمین، زانوها ۲ سانت بالاتر از زمین؛ گام‌های کوتاه و کنترل‌شده بردارید.',
        formTipEn: 'Hover knees 2 inches above floor, crawl forward and back with unwavering core control.',
        svgType: 'tiger_flow'
      },
      {
        id: 'archer_squat_flow',
        nameFa: '۵. اسکات کمانداری شائولین (Shaolin Archer Squat Flow)',
        nameEn: '5. Shaolin Archer Squat Flow',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۱۴ تکرار (۷ تا هر سمت)',
        suggestedSetsEn: '3 Sets × 14 Reps (7 each side)',
        restSec: 20,
        targetMusclesFa: 'عضلات داخلی ران (Adductors)، باسن، همسترینگ، مچ پا و ستون فقرات',
        targetMusclesEn: 'Adductors, Glutes, Hamstrings, Ankles & Lateral pelvic stabilizers',
        goalFa: 'افزایش انعطاف‌پذیری باز جانبی پاها و تقویت پایداری زانوها در سطوح مختلف حرکتی.',
        goalEn: 'Enhance frontal plane flexibility, build resilient knees and open deep hip tight spots.',
        howToFa: '۱. پاها را بسیار عریض‌تر از شانه باز کنید. ۲. زانوی راست را خم کرده و لگن را روی پاشنه راست پایین بیاورید در حالی که پای چپ کاملاً کشیده و نوک انگشتان رو به آسمان است. ۳. بدون برخاستن کامل، وزن را به سمت چپ بغلتانید و روی زانوی چپ بنشینید.',
        formTipFa: 'پای تکیه‌گاه به آرامی خم شود در حالی که پای دیگر کاملاً کشیده است. تعویض روان وزن بین دو پا.',
        formTipEn: 'Smooth lateral shift of weight, keeping one leg extended while descending on supportive heel.',
        svgType: 'archer_flow'
      },
      {
        id: 'jumping_jack_breath',
        nameFa: '۶. پروانه تنفسی و جهش قلبی (Jumping Jack Breath Flow)',
        nameEn: '6. Jumping Jack Breath Flow',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۴۵ ثانیه',
        suggestedSetsEn: '3 Sets × 45s',
        restSec: 15,
        targetMusclesFa: 'ساق پا، سرشانه، عضلات زیربغل، سیستم گردش خون مرکزی',
        targetMusclesEn: 'Calves, Deltoids, Lats, Central cardiovascular pump',
        goalFa: 'تنظیم ریتم تنفس در هنگام تحرک بالا و آزادسازی فوری هورمون اندورفین.',
        goalEn: 'Synchronize rhythmic respiration during high tempo, releasing instant mood-boosting endorphins.',
        howToFa: '۱. بایستید و دست‌ها در کنار بدن باشند. ۲. با جهش سبک پاها را باز کنید و همزمان دست‌ها را در یک نیم‌دایره تا بالای سر هدایت کنید (دم عمیق). ۳. با جهش دوم پاها را جفت کرده و دست‌ها را کنار ران‌ها برگردانید (بازدم).',
        formTipFa: 'پرش سبک با فرود نرم روی سینه پا، بالا رفتن دست‌ها همراه با دم، پایین آمدن با بازدم.',
        formTipEn: 'Land softly on balls of feet, coordinated arm arc overhead with controlled respiratory tempo.',
        svgType: 'jumping_jack'
      },
      {
        id: 'crescent_kick_shadow',
        nameFa: '۷. لگدهای دورانی نرم و گام سایه (Shaolin Crescent Kick)',
        nameEn: '7. Shaolin Crescent Kick & Shadow Step',
        durationSec: 50,
        suggestedSetsFa: '۳ ست × ۱۶ تکرار متناوب',
        suggestedSetsEn: '3 Sets × 16 Alternating Reps',
        restSec: 20,
        targetMusclesFa: 'خم‌کننده‌های ران، عضلات مایل شکم، همسترینگ و پایداری پای تکیه‌گاه',
        targetMusclesEn: 'Hip flexors, Obliques, Hamstrings & Support leg balance',
        goalFa: 'افزایش دامنه حرکتی لگن، تقویت عضلات پرتابی و چابکی تاندون‌های پا.',
        goalEn: 'Expand active hip mobility, develop rotational power and tendon elasticity.',
        howToFa: '۱. در گارد بوکس یا کونگ‌فو بایستید. ۲. پای راست را از سمت بیرون بدن به صورت یک هلال نیم‌دایره‌ای به سمت داخل و بالا پرتاب کنید و کف دست چپ را در اوج لمس کنید. ۳. با کنترل و تعادل فرود آیید و بلافاصله با پای چپ تکرار کنید.',
        formTipFa: 'پا را در یک کمان نیم‌دایره‌ای نرم از خارج به داخل حرکت داده و به آرامی در گارد فرود آیید.',
        formTipEn: 'Sweep the leg in a smooth crescent arc from outside inward, landing balanced in guard.',
        svgType: 'crescent_kick'
      },
      {
        id: 'crab_reach_opener',
        nameFa: '۸. فلو خرچنگ و باز کردن قفسه سینه (Animal Flow Crab Reach)',
        nameEn: '8. Animal Flow Crab Reach',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۱۰ تکرار (۵ هر سمت)',
        suggestedSetsEn: '3 Sets × 10 Reps (5 each side)',
        restSec: 20,
        targetMusclesFa: 'باسن، فیله کمر، پشت بازو، سرشانه، بازکننده سینه و ستون فقرات',
        targetMusclesEn: 'Glutes, Lumbar extensors, Triceps, Anterior deltoids, Thoracic bridge',
        goalFa: 'اصلاح کامل اثرات منفی قوز کردن و نشستن پای سیستم، تقویت زنجیره خلفی بدن.',
        goalEn: 'Reverse desk posture, activate dormant glutes and open tight chest and shoulders.',
        howToFa: '۱. روی زمین بنشینید، زانوها خم و کف دست‌ها پشت باسن روی زمین. ۲. باسن را از زمین جدا کرده و به حالت میز وارونه بالا ببرید. ۳. دست راست را از روی قفسه سینه به صورت مورب به عقب و سمت چپ بکشید و نگاهتان به دست چپ (تکیه‌گاه) باشد.',
        formTipFa: 'از وضعیت ۴ دست‌وپا رو به بالا، باسن را بالا بدهید و یک دست را به صورت مورب به عقب بکشید.',
        formTipEn: 'From reverse tabletop, bridge hips high and reach one arm diagonally overhead across the body.',
        svgType: 'crab_flow'
      }
    ]
  },
  {
    id: 'intense',
    levelNum: 3,
    nameFa: '۳. تمرینات قدرتی-هوازی انفجاری (شدید، چربی‌سوز و کالیستنیکس)',
    nameEn: '3. High-Intensity Warrior Calisthenics',
    descFa: '۱۱ حرکت انفجاری: برپی شائولین، شنای موجی داند، لانژ جهشی، مانتین کلایمبر، اسکات پرشی و زانو بلند سرعتی برای حداکثر VO2 Max.',
    descEn: '11 explosive power movements: Shaolin sprawls, Hindu push-ups, leaping lunges & sprint climbers for peak metabolic fire.',
    color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    intensityBadge: '🔴 شدید / ۱۵-۵۵ دقیقه (بیش از ۱۰ حرکت)',
    calPerMin: 13.0,
    exercises: [
      {
        id: 'shaolin_warrior_sprawl',
        nameFa: '۱. برپی سیال شائولین (Warrior Sprawl & High Knee Drive)',
        nameEn: '1. Shaolin Warrior Sprawl & High Knee Drive',
        durationSec: 50,
        suggestedSetsFa: '۴ ست × ۱۵ تکرار',
        suggestedSetsEn: '4 Sets × 15 Reps',
        restSec: 25,
        targetMusclesFa: 'کل بدن: سینه، بازو، شکم، چهارسر، باسن، سیستم قلبی-تنفسی',
        targetMusclesEn: 'Total Body: Chest, Triceps, Core, Quads, Glutes & Cardiovascular engine',
        goalFa: 'بالا بردن ضربان قلب به آستانه بی‌هوازی، حداکثر چربی‌سوزی و تقویت قدرت انفجاری.',
        goalEn: 'Drive heart rate into threshold, maximize EPOC afterburn, and forge explosive speed.',
        howToFa: '۱. از حالت ایستاده سریع دست‌ها را جلوی پاها روی زمین بگذارید. ۲. با جهش سریع پاها را به عقب پرتاب کنید تا در وضعیت پلانک محکم قرار گیرید. ۳. بلافاصله پاها را با جهش به کنار دست‌ها جمع کنید. ۴. با یک پرش انفجاری به بالا بپرید و یک زانو را تا سینه بالا بکشید.',
        formTipFa: 'دست‌ها روی زمین، پرتاب پاها به عقب در پلانک، برگشت سریع و زانو زدن انفجاری رو به بالا.',
        formTipEn: 'Hands to ground, kick feet back to solid plank, snap feet forward and drive knee explosively upward.',
        svgType: 'warrior_sprawl'
      },
      {
        id: 'hindu_pushup_dand',
        nameFa: '۲. شنای موجی هندی داند (Hindu Push-up / Dand Wave)',
        nameEn: '2. Hindu Push-up Wave (Dand)',
        durationSec: 50,
        suggestedSetsFa: '۳ ست × ۱۵ تکرار',
        suggestedSetsEn: '3 Sets × 15 Reps',
        restSec: 25,
        targetMusclesFa: 'سینه، پشت بازو، سرشانه، ستون فقرات، همسترینگ و فیله کمر',
        targetMusclesEn: 'Chest, Triceps, Deltoids, Spinal erectors, Posterior chain',
        goalFa: 'افزایش قدرت فشاری بالاتنه بدون دمبل و بهبود انعطاف‌پذیری قوس پشتی بدن.',
        goalEn: 'Build upper body pushing power and flexible spine strength without any iron weights.',
        howToFa: '۱. در وضعیت سگ سرپایین (۸ فارسی) با باسن بالا قرار گیرید. ۲. آرنج‌ها را خم کرده و سینه را مماس با زمین به جلو شیرجه دهید. ۳. سینه را رو به بالا به وضعیت کبرا ببرید (دم). ۴. با فشار دست‌ها باسن را دوباره به سمت عقب و بالا برگردانید (بازدم).',
        formTipFa: 'از وضعیت ۸ فارسی (سگ سرپایین) سینه را نزدیک زمین به جلو سر بدهید و با قوس بالا بیایید.',
        formTipEn: 'From inverted V, glide chest close to floor between hands, arch up smoothly into cobra position.',
        svgType: 'hindu_pushup'
      },
      {
        id: 'explosive_lunges',
        nameFa: '۳. لانژهای جهشی و انفجاری پلنگ (Leaping Tiger Lunges)',
        nameEn: '3. Leaping Tiger Lunges',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۲۰ تکرار (۱۰ هر پا)',
        suggestedSetsEn: '3 Sets × 20 Reps (10 each leg)',
        restSec: 25,
        targetMusclesFa: 'چهارسر ران، باسن، عضلات دوقلو، تعادل و ثبات مفصل زانو',
        targetMusclesEn: 'Quadriceps, Gluteal muscles, Calves, Knee joint stabilizers',
        goalFa: 'تقویت توان الاستیک عضلات پا، تقویت باسن و افزایش سریع مصرف اکسیژن.',
        goalEn: 'Develop fast-twitch lower body power, sculpt glutes and supercharge aerobic output.',
        howToFa: '۱. در وضعیت لانژ قرار گیرید (پای جلو ۹۰ درجه و زانوی عقب نزدیک زمین). ۲. با فشار انفجاری هر دو پا به صورت عمودی به هوا بپرید. ۳. در هوا جای پاها را عوض کرده و به نرمی روی سینه پاها در وضعیت لانژ مخالف فرود آیید.',
        formTipFa: 'فرود نرم روی سینه پا، زانوی عقب به آرامی نزدیک زمین شود، پرش عمودی با تعویض پا در هوا.',
        formTipEn: 'Soft landing on balls of feet, switch legs mid-air with spring-like vertical propulsion.',
        svgType: 'explosive_lunges'
      },
      {
        id: 'lightning_climbers',
        nameFa: '۴. مانتین کلایمبر سرعتی صاعقه (Lightning Mountain Climbers)',
        nameEn: '4. Lightning Mountain Climbers',
        durationSec: 45,
        suggestedSetsFa: '۴ ست × ۴۵ ثانیه',
        suggestedSetsEn: '4 Sets × 45s',
        restSec: 20,
        targetMusclesFa: 'عضلات راست و مورب شکمی، شانه، خم‌کننده ران، سیستم تنفسی',
        targetMusclesEn: 'Rectus abdominis, Obliques, Anterior deltoid, Hip flexors',
        goalFa: 'سوزاندن کالری بالا، پایداری استقامتی شکم و تقویت هماهنگی دست و پا.',
        goalEn: 'Rapid caloric depletion, rock-hard core endurance, and lightning-fast footwork.',
        howToFa: '۱. در وضعیت پلانک روی کف دست‌ها قرار گیرید. ۲. کمر را صاف و شکم را منقبض نگه دارید. ۳. با حداکثر سرعت و ریتم متناوب، زانوها را یکی پس از دیگری به سمت سینه پمپ کنید و روی پنجه پاها حرکت کنید.',
        formTipFa: 'کمر کاملاً صاف و هم‌سطح شانه، زانوها را به صورت متناوب و پرسرعت به سمت سینه پمپ کنید.',
        formTipEn: 'Plank back flat, pump knees toward chest with rapid, rhythmic, laser-focused breathing.',
        svgType: 'mountain_climber'
      },
      {
        id: 'tiger_squat_jumps',
        nameFa: '۵. اسکات پرشی ۳۶۰ تایگر (Explosive Tiger Squat Jumps)',
        nameEn: '5. Explosive Tiger Squat Jumps',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۱۵ تکرار',
        suggestedSetsEn: '3 Sets × 15 Reps',
        restSec: 30,
        targetMusclesFa: 'چهارسر ران، باسن، عضلات ساق، ستون فقرات و سیستم عصبی مرکزی',
        targetMusclesEn: 'Quadriceps, Glutes, Soleus, Central nervous drive',
        goalFa: 'افزایش توان عمودی پرش، فعال‌سازی تارهای تند-انقباض و تسریع متابولیسم.',
        goalEn: 'Maximize vertical power output, recruit fast-twitch fibers and boost basal metabolic rate.',
        howToFa: '۱. پاها به عرض شانه، در یک اسکات عمیق و اصولی پایین بروید (ران‌ها موازی زمین). ۲. با کمک پرتاب دست‌ها به سمت بالا، با تمام توان از زمین کنده شده و بپرید. ۳. فرود کاملاً بی‌صدا و نرم با زانوهای کمی خمیده.',
        formTipFa: 'اسکات کامل تا زاویه ۹۰ درجه، پرتاب انفجاری رو به بالا با کمک دست‌ها، فرود بی‌صدا و نرم.',
        formTipEn: 'Deep squat to 90 degrees, explode vertically with arm swing, absorb landing silently on forefoot.',
        svgType: 'squat_jump'
      },
      {
        id: 'speed_plank_jacks',
        nameFa: '۶. پلانک جک پرسرعت (Speed Plank Jacks & Core Blast)',
        nameEn: '6. Speed Plank Jacks & Core Blast',
        durationSec: 50,
        suggestedSetsFa: '۳ ست × ۵۰ ثانیه',
        suggestedSetsEn: '3 Sets × 50s',
        restSec: 20,
        targetMusclesFa: 'عضلات عرضی و راست شکم، سرشانه، عضلات دورکننده ران (Abductors)',
        targetMusclesEn: 'Transverse abdominis, Deltoids, Hip abductors & Spinal stabilizers',
        goalFa: 'تقویت کمربند ضد-چرخشی شکم همزمان با حفظ ریتم بالای ضربان قلب.',
        goalEn: 'Build anti-rotational core armor while sustaining high cardiovascular heart rate.',
        howToFa: '۱. در وضعیت پلانک روی کف دست‌ها یا ساعد قرار گیرید. ۲. بدن کاملاً شبیه به یک خط‌کش صاف. ۳. با پرش‌های کوچک و سریع، پاها را به صورت پروانه‌ای باز و بسته کنید بدون اینکه باسن بالا یا پایین برود.',
        formTipFa: 'دست‌ها درست زیر شانه، باسن ثابت و بدون تکان اضافه، پاها به صورت ریتمیک باز و بسته شوند.',
        formTipEn: 'Hands stacked directly under shoulders, minimize hip sway while opening/closing feet in rapid tempo.',
        svgType: 'plank_jack'
      },
      {
        id: 'high_knees_strikes',
        nameFa: '۷. زانو بلند سرعتی و مشت‌های رگباری (Sprint High Knees & Rapid Strikes)',
        nameEn: '7. Sprint High Knees & Rapid Strikes',
        durationSec: 45,
        suggestedSetsFa: '۴ ست × ۴۵ ثانیه',
        suggestedSetsEn: '4 Sets × 45s',
        restSec: 20,
        targetMusclesFa: 'عضلات فلکسور ران، ساق پا، سینه و بازو، سیستم بیومکانیک دویدن',
        targetMusclesEn: 'Hip flexors, Calves, Anterior chain, Upper body striking muscles',
        goalFa: 'رساندن ضربان قلب به اوج هوازی، چربی‌سوزی شکمی و تقویت استقامت عضلات ریه.',
        goalEn: 'Elevate cardiac output to peak VO2, target visceral fat and expand respiratory stamina.',
        howToFa: '۱. در جا با سرعت بالا بدوید. ۲. زانوها را حتماً تا ارتفاع ناف و کمر بالا بیاورید. ۳. همزمان با هر گام، ضربات مشت مستقیم و پرقدرت به جلو پرتاب کنید و تنفس تند و دیافراگمی داشته باشید.',
        formTipFa: 'زانوها را تا ارتفاع کمر بالا بیاورید، همزمان ضربات مشت مستقیم با قدرت به جلو پرتاب شوند.',
        formTipEn: 'Drive knees to hip height while throwing straight, laser-sharp punches with rapid exhale.',
        svgType: 'high_knees'
      },
      {
        id: 'spiderman_pushups',
        nameFa: '۸. شنای عنکبوتی شائولین (Spiderman Push-up Flow)',
        nameEn: '8. Spiderman Push-up Flow',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۱۲ تکرار (۶ هر سمت)',
        suggestedSetsEn: '3 Sets × 12 Reps (6 each side)',
        restSec: 25,
        targetMusclesFa: 'سینه، عضلات مورب شکم (Obliques)، پشت بازو و عضلات دندانه‌ای قدامی',
        targetMusclesEn: 'Pectoralis, Obliques, Serratus anterior & Triceps',
        goalFa: 'تقویت یکپارچه قدرت فشاری بالاتنه به همراه فشرده‌سازی بی‌نظیر پهلوها.',
        goalEn: 'Forge asymmetric pushing power while deeply carving functional rotational obliques.',
        howToFa: '۱. در وضعیت شنا سوئدی استاندارد قرار گیرید. ۲. هنگامی که سینه را به سمت زمین پایین می‌آورید، زانوی راست را از پهلو خم کرده و به آرنج دست راست برسانید. ۳. با بالا آمدن، پا به جای اول برگردد و در تکرار بعدی با پای چپ اجرا کنید.',
        formTipFa: 'هنگام پایین رفتن در شنا، زانو را از کنار بدن به سمت آرنج همان دست نزدیک کنید.',
        formTipEn: 'As chest lowers toward ground, draw knee outward to touch the elbow on the same side.',
        svgType: 'spiderman_pushup'
      },
      {
        id: 'cossack_explosive',
        nameFa: '۹. اسکات کوزاک جهشی و جابجایی وزن (Explosive Cossack Squat Flow)',
        nameEn: '9. Explosive Cossack Squat Flow',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۱۶ تکرار متناوب',
        suggestedSetsEn: '3 Sets × 16 Alternating Reps',
        restSec: 25,
        targetMusclesFa: 'کشاله ران، همسترینگ، باسن، مچ پا و پایداری جانبی زانو',
        targetMusclesEn: 'Groin (Adductors), Hamstrings, Glute medius & Ankle mobility',
        goalFa: 'انعطاف‌پذیری فوق‌العاده در سطوح غیرخطی و پیشگیری از آسیب‌های مفصلی پا.',
        goalEn: 'Uncompromising multi-planar flexibility and bulletproof joint resilience.',
        howToFa: '۱. پاها را بسیار باز بگذارید. ۲. روی پاشنه پای راست تا انتها بنشینید، پای چپ صاف با نوک پنجه رو به سقف. ۳. با یک جهش جانبی کوتاه و کنترل‌شده، وزن را مستقیماً به روی پای چپ انتقال دهید.',
        formTipFa: 'نشستن عمیق روی یک پا در حالی که پای دیگر با پاشنه روی زمین کشیده است؛ جهش آرام به سمت دیگر.',
        formTipEn: 'Sink deeply into one leg while pointing other foot skyward; glide smoothly into the opposite side.',
        svgType: 'cossack_flow'
      },
      {
        id: 'flying_knee_thrusts',
        nameFa: '۱۰. ضربه زانوی پرشی وویانگ (Shaolin Flying Knee Thrusts)',
        nameEn: '10. Shaolin Flying Knee Thrusts',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۲۰ تکرار',
        suggestedSetsEn: '3 Sets × 20 Reps',
        restSec: 25,
        targetMusclesFa: 'عضلات مرکزی زیر شکم، چهارسر ران، باسن و ثبات‌دهنده‌های تنه',
        targetMusclesEn: 'Lower abs, Quadriceps, Gluteal propulsion & Torso stabilizers',
        goalFa: 'تخلیه انرژی راکد بدن، افزایش اعتمادبه‌نفس فیزیکی و تقویت زنجیره حرکتی قدامی.',
        goalEn: 'Discharge stagnant tension, boost visceral confidence, and ignite anterior kinetic chain.',
        howToFa: '۱. در گارد دفاعی بایستید. ۲. یک گام با پای چپ به جلو بردارید و همزمان پای راست را با جهش سبک به سمت قفسه سینه پرتاب کنید. ۳. با فرود نرم روی هر دو پا، گارد را عوض کرده و با پای مخالف پرتاب کنید.',
        formTipFa: 'گام به جلو با پای عقب و پرتاب زانوی دیگر به سمت قفسه سینه همراه با پرش جهشی سبک.',
        formTipEn: 'Step into propulsion and launch opposite knee skyward with explosive, centered force.',
        svgType: 'flying_knee'
      },
      {
        id: 'hollow_fire_breath',
        nameFa: '۱۱. نگه‌داری هالو بادی و تنفس آتشین (Hollow Body & Breath of Fire)',
        nameEn: '11. Hollow Body & Breath of Fire Hold',
        durationSec: 45,
        suggestedSetsFa: '۳ ست × ۴۵ ثانیه',
        suggestedSetsEn: '3 Sets × 45s',
        restSec: 20,
        targetMusclesFa: 'کل فیبرهای شکمی، فلکسورهای ران، عضلات بین‌دنده‌ای و دیافراگم',
        targetMusclesEn: 'Total abdominal wall, Psoas, Intercostals & Diaphragmatic core',
        goalFa: 'ساخت عضلات شکم غیرقابل نفوذ، افزایش حداکثر اکسیژن‌رسانی به خون و آرامش روانی.',
        goalEn: 'Sculpt impenetrable core armor, flood blood with oxygen, and seal the warrior workout.',
        howToFa: '۱. به پشت روی زمین دراز بکشید. ۲. گودی کمر را محکم به زمین بچسبانید، شانه‌ها و پاها را ۱۰ سانتی‌متر از زمین بلند کنید به شکل قایق موزون. ۳. دست‌ها در امتداد گوش‌ها کشیده باشند و تنفس سریع و ریتمیک شکمی انجام دهید.',
        formTipFa: 'گودی کمر هرگز از زمین جدا نشود. نگاه رو به انگشتان پا و انقباض فولادی عضلات شکم.',
        formTipEn: 'Lower back glued to the floor at all times, hollow shape locked with intense abdominal contraction.',
        svgType: 'hollow_body'
      }
    ]
  }
];

// ─────────────────────────────────────────────
//  SVG ANIMATED EXERCISE GRAPHICS
// ─────────────────────────────────────────────
function AnimatedExerciseFigure({ svgType, isRtl }) {
  if (svgType === 'cloud_hands') {
    return (
      <div className="w-full flex items-center justify-center p-3 bg-black/40 rounded-2xl border border-teal-500/30 overflow-hidden relative">
        <svg viewBox="0 0 200 140" className="w-48 h-32">
          <defs>
            <radialGradient id="energyOrb" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Ground */}
          <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* Pulsing Energy Core */}
          <circle cx="100" cy="75" r="14" fill="url(#energyOrb)" className="animate-pulse" />
          {/* Head */}
          <circle cx="100" cy="30" r="10" fill="#14b8a6" />
          {/* Torso Spine */}
          <line x1="100" y1="40" x2="100" y2="85" stroke="#2dd4bf" strokeWidth="4" strokeLinecap="round" />
          {/* Soft Knees / Legs */}
          <polyline points="100,85 80,105 75,130" fill="none" stroke="#2dd4bf" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="100,85 120,105 125,130" fill="none" stroke="#2dd4bf" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {/* Floating Curved Arms */}
          <motion.path
            d="M 60,65 Q 100,45 140,65"
            fill="none"
            stroke="#5eead4"
            strokeWidth="4"
            strokeLinecap="round"
            animate={{ d: ['M 60,65 Q 100,45 140,65', 'M 60,50 Q 100,75 140,50', 'M 60,65 Q 100,45 140,65'] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          />
          {/* Flow waves */}
          <motion.circle
            cx="60"
            cy="60"
            r="4"
            fill="#a7f3d0"
            animate={{ cx: [60, 140, 60], cy: [65, 55, 65] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          />
        </svg>
        <span className="absolute bottom-1 right-2 text-[9px] text-teal-300 font-bold bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-500/20">
          {isRtl ? 'گردش جریان چی (Chi Flow)' : 'Chi Flow'}
        </span>
      </div>
    );
  }

  if (svgType === 'crane_wings') {
    return (
      <div className="w-full flex items-center justify-center p-3 bg-black/40 rounded-2xl border border-cyan-500/30 overflow-hidden relative">
        <svg viewBox="0 0 200 140" className="w-48 h-32">
          {/* Ground */}
          <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* Head & Spine */}
          <circle cx="100" cy="28" r="9" fill="#06b6d4" />
          <line x1="100" y1="37" x2="100" y2="85" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
          {/* Legs */}
          <line x1="100" y1="85" x2="85" y2="130" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="85" x2="115" y2="130" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
          {/* Wing Arms Breathing Expansion */}
          <motion.path
            d="M 40,40 Q 100,55 160,40"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="4"
            strokeLinecap="round"
            animate={{ d: ['M 40,30 Q 100,55 160,30', 'M 70,80 Q 100,60 130,80', 'M 40,30 Q 100,55 160,30'] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          />
          <circle cx="100" cy="55" r="10" fill="#06b6d4" opacity="0.3" className="animate-ping" />
        </svg>
        <span className="absolute bottom-1 right-2 text-[9px] text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/20">
          {isRtl ? 'اتساع قفسه سینه و ریه' : 'Lung Expansion'}
        </span>
      </div>
    );
  }

  if (svgType === 'shaolin_mabu') {
    return (
      <div className="w-full flex items-center justify-center p-3 bg-black/40 rounded-2xl border border-yellow-500/30 overflow-hidden relative">
        <svg viewBox="0 0 200 140" className="w-48 h-32">
          {/* Ground */}
          <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* Deep Horse Stance Legs */}
          <polyline points="50,130 65,95 100,95 135,95 150,130" fill="none" stroke="#eab308" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Torso & Head */}
          <circle cx="100" cy="35" r="10" fill="#facc15" />
          <line x1="100" y1="45" x2="100" y2="95" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />
          {/* Alternating Striking Arms */}
          <motion.line
            x1="100"
            y1="55"
            x2="160"
            y2="55"
            stroke="#fde047"
            strokeWidth="4"
            strokeLinecap="round"
            animate={{ x2: [160, 90, 160] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          />
          <motion.line
            x1="100"
            y1="62"
            x2="40"
            y2="62"
            stroke="#fde047"
            strokeWidth="4"
            strokeLinecap="round"
            animate={{ x2: [40, 110, 40] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          />
          {/* Force Burst */}
          <circle cx="165" cy="55" r="5" fill="#f59e0b" className="animate-ping" />
        </svg>
        <span className="absolute bottom-1 right-2 text-[9px] text-yellow-300 font-bold bg-yellow-950/60 px-2 py-0.5 rounded-full border border-yellow-500/20">
          {isRtl ? 'استقرار شائولین (پایین‌تنه محکم)' : 'Shaolin Core Stance'}
        </span>
      </div>
    );
  }

  if (svgType === 'boxer_bounce') {
    return (
      <div className="w-full flex items-center justify-center p-3 bg-black/40 rounded-2xl border border-amber-500/30 overflow-hidden relative">
        <svg viewBox="0 0 200 140" className="w-48 h-32">
          <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          {/* Bouncing Figure */}
          <motion.g
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
          >
            <circle cx="100" cy="30" r="9" fill="#f59e0b" />
            <line x1="100" y1="39" x2="100" y2="85" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
            {/* Guard Arms */}
            <polyline points="100,50 115,40 120,55" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="100,50 85,42 80,56" fill="none" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {/* Springy Legs */}
            <polyline points="100,85 88,105 85,128" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="100,85 112,105 115,128" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
          <circle cx="100" cy="55" r="14" fill="#ef4444" opacity="0.2" className="animate-pulse" />
        </svg>
        <span className="absolute bottom-1 right-2 text-[9px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/20">
          {isRtl ? 'ریتم هوازی و چابکی' : 'Aerobic Bounce & Agility'}
        </span>
      </div>
    );
  }

  // Default / Warrior / Tiger / Spine
  return (
    <div className="w-full flex items-center justify-center p-3 bg-black/40 rounded-2xl border border-rose-500/30 overflow-hidden relative">
      <svg viewBox="0 0 200 140" className="w-48 h-32">
        <line x1="20" y1="130" x2="180" y2="130" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
        {/* Dynamic Explosive Warrior */}
        <motion.g
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'easeOut' }}
        >
          <circle cx="100" cy="25" r="9" fill="#f43f5e" />
          <line x1="100" y1="34" x2="100" y2="75" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="45" x2="135" y2="30" stroke="#fb7185" strokeWidth="4" strokeLinecap="round" />
          <line x1="100" y1="45" x2="65" y2="30" stroke="#fb7185" strokeWidth="4" strokeLinecap="round" />
          <polyline points="100,75 75,95 70,125" fill="none" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="100,75 125,95 130,125" fill="none" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </motion.g>
        {/* Power Burst Vectors */}
        <path d="M 90,130 L 100,118 L 110,130" stroke="#fb7185" strokeWidth="2" fill="none" />
      </svg>
      <span className="absolute bottom-1 right-2 text-[9px] text-rose-300 font-bold bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-500/20">
        {isRtl ? 'قدرت انفجاری و شائولین HIIT' : 'Power HIIT Blast'}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
//  STROLL PATHS DEFINITIONS (COMPREHENSIVE PATHS)
// ─────────────────────────────────────────────
export const STROLL_PATHS = [
  {
    id: 'god',
    icon: '☀️',
    color: 'from-amber-600/30 via-yellow-600/15 to-indigo-950/40 border-amber-400/60',
    accentColor: 'amber',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-yellow-600',
    xpReward: 100,
    coinsReward: 50,
    titleFa: 'راه‌روی خدا (GOD)',
    titleEn: 'Realm of GOD (خدا)',
    descFa: '۷ گام الهی: صفات حق در ادیان، مفهوم خدا، حکمت مشاهیر، ۳ شکرگزاری، فضائل خشنودکننده، تمرین معنوی و حضور دائمی',
    descEn: '7 Sacred Steps: Divine attributes, concept of God in world faiths, luminary quotes, 3-fold gratitude, pleasing deeds, spiritual practice & omnipresence',
    steps: [
      {
        id: 'god_attributes',
        icon: '👑',
        color: 'from-amber-600/25 via-[var(--bg-card)] to-transparent border-amber-400/50',
        titleFa: 'گام ۱: صفات خداوند در ادیان و آیین‌های مختلف',
        titleEn: 'Step 1: Attributes of God in World Religions',
        type: 'god_attributes'
      },
      {
        id: 'god_concepts',
        icon: '📜',
        color: 'from-yellow-600/25 via-[var(--bg-card)] to-transparent border-amber-400/50',
        titleFa: 'گام ۲: آشنایی با مفهوم خدا در ادیان و آیین‌ها (چرخشی)',
        titleEn: 'Step 2: Understanding God Across Traditions (Rotating)',
        type: 'god_concepts'
      },
      {
        id: 'god_quotes',
        icon: '✨',
        color: 'from-amber-600/25 via-[var(--bg-card)] to-transparent border-amber-400/50',
        titleFa: 'گام ۳: سخنان مشاهیر ایران و جهان درباره خداوند',
        titleEn: 'Step 3: Luminary Quotes on God & Cosmos',
        type: 'god_quotes'
      },
      {
        id: 'god_gratitude',
        icon: '🙏',
        color: 'from-emerald-600/25 via-[var(--bg-card)] to-transparent border-emerald-400/50',
        titleFa: 'گام ۴: ثبت ۳ مورد قدردانی از خداوند و جهان هستی',
        titleEn: 'Step 4: 3-Fold Divine Gratitude Box',
        type: 'god_gratitude'
      },
      {
        id: 'god_pleasing_deeds',
        icon: '🌱',
        color: 'from-teal-600/25 via-[var(--bg-card)] to-transparent border-teal-400/50',
        titleFa: 'گام ۵: آنچه خداوند را خشنود می‌سازد (ادیان و اخلاق)',
        titleEn: 'Step 5: What Pleases the Divine (Scriptures & Ethics)',
        type: 'god_pleasing_deeds'
      },
      {
        id: 'god_practice',
        icon: '🧘',
        color: 'from-indigo-600/25 via-[var(--bg-card)] to-transparent border-indigo-400/50',
        titleFa: 'گام ۶: تمرین تقویت و بهبود ارتباط با خدا',
        titleEn: 'Step 6: Spiritual Connection & Heart Alignment Practice',
        type: 'god_practice'
      },
      {
        id: 'god_omnipresence',
        icon: '🌌',
        color: 'from-amber-600/30 via-purple-950/30 to-transparent border-amber-400/60',
        titleFa: 'گام ۷: یادآور حضور دائمی خداوند در وجود هر چیز',
        titleEn: 'Step 7: Divine Omnipresence in All Creation',
        type: 'god_omnipresence'
      }
    ]
  },
  {
    id: 'language_learning',
    icon: '🗣️',
    color: 'from-sky-600/25 via-blue-600/15 to-emerald-600/10 border-sky-500/50',
    accentColor: 'sky',
    gradientFrom: 'from-sky-600',
    gradientTo: 'to-indigo-600',
    xpReward: 80,
    coinsReward: 35,
    titleFa: 'راه‌روی یادگیری زبان و مکالمه جهانی',
    titleEn: 'Polyglot Language & Small Talk Stroll',
    descFa: 'آموزش تعاملی مکالمه، خوش‌وبش و اصطلاحات کاربردی انگلیسی 🇬🇧، فرانسوی 🇫🇷 و ژاپنی 🇯🇵 با تلفظ صوتی هوشمند',
    descEn: 'Interactive small talk, greetings, idioms & conversational simulation in English, French & Japanese with native audio.',
    steps: [
      {
        id: 'lang_setup',
        icon: '🌐',
        color: 'from-sky-600/20 via-[var(--bg-card)] to-transparent border-sky-500/40',
        titleFa: 'گام ۱: انتخاب زبان مقصد و آشنایی با فرهنگ مکالمه',
        titleEn: 'Step 1: Target Language & Cultural Etiquette',
        type: 'language_setup'
      },
      {
        id: 'lang_greetings',
        icon: '👋',
        color: 'from-blue-600/20 via-[var(--bg-card)] to-transparent border-blue-500/40',
        titleFa: 'گام ۲: زرادخانه خوش‌وبش و احوالپرسی گرم با صوت',
        titleEn: 'Step 2: Warm Greetings & Icebreakers with Audio',
        type: 'language_greetings'
      },
      {
        id: 'lang_dialogue',
        icon: '💬',
        color: 'from-indigo-600/20 via-[var(--bg-card)] to-transparent border-indigo-500/40',
        titleFa: 'گام ۳: شبیه‌ساز مکالمه دو نفره روزمره',
        titleEn: 'Step 3: Real-World Conversation Simulation',
        type: 'language_dialogue'
      },
      {
        id: 'lang_idioms',
        icon: '🌟',
        color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۴: اصطلاحات طلایی، ضرب‌المثل‌ها و مینی‌کوئیز',
        titleEn: 'Step 4: Golden Idioms, Proverbs & Mini-Quiz',
        type: 'language_idioms'
      },
      {
        id: 'lang_practice',
        icon: '🎙️',
        color: 'from-emerald-600/20 via-[var(--bg-card)] to-transparent border-emerald-500/40',
        titleFa: 'گام ۵: چالش بیان بلند (Shadowing) و ثبت پیشرفت روزانه',
        titleEn: 'Step 5: Daily Shadowing & Fluency Log',
        type: 'language_practice'
      }
    ]
  },
  {
    id: 'mindful',
    icon: '🚶‍♂️',
    color: 'from-purple-600/20 to-indigo-600/10 border-purple-500/40',
    accentColor: 'purple',
    gradientFrom: 'from-purple-600',
    gradientTo: 'to-indigo-600',
    xpReward: 50,
    coinsReward: 20,
    titleFa: 'قدم زدن آگاهانه روزانه',
    titleEn: 'Daily Mindful Stroll',
    descFa: 'تنفس عمیق، خرد چرخشی روزانه، تأمل و شکرگزاری',
    descEn: 'Breathing, rotating daily wisdom, shadow reflection & gratitude',
    steps: [
      {
        id: 'breath', icon: '🌬️', color: 'from-teal-600/20 via-[var(--bg-card)] to-transparent border-teal-500/40',
        titleFa: 'گام ۱: آرام‌سازی و تمرکز تنفس', titleEn: 'Step 1: Box Breathing Centering',
        type: 'breath',
        contentFa: 'پیش از شروع روز، ۱ دقیقه با تنفس مربعی (۴ ثانیه دم، ۴ ثانیه حبس، ۴ ثانیه بازدم) ذهن را آرام کنید.',
        contentEn: 'Center your mind with 1 minute of box breathing (4s inhale, 4s hold, 4s exhale).',
      },
      {
        id: 'wisdom_rotating', icon: '📜', color: 'from-blue-600/20 via-[var(--bg-card)] to-transparent border-blue-500/40',
        titleFa: 'گام ۲: حکمت روز (چرخشی)', titleEn: 'Step 2: Daily Wisdom (Rotating)',
        type: 'quote_rotating',
        quotesPool: DAILY_MINDFUL_QUOTES,
      },
      {
        id: 'shadow_rotating', icon: '🪞', color: 'from-purple-600/20 via-[var(--bg-card)] to-transparent border-purple-500/40',
        titleFa: 'گام ۳: پرسش خودشناسی روز', titleEn: 'Step 3: Daily Shadow Inquiry',
        type: 'journal_rotating',
        questionsPool: DAILY_SHADOW_QUESTIONS,
        xpReward: 15, sectionId: 'selfDiscovery',
      },
      {
        id: 'cosmic_rotating', icon: '🌌', color: 'from-indigo-600/20 via-[var(--bg-card)] to-transparent border-indigo-500/40',
        titleFa: 'گام ۴: وسعت دید کیهانی', titleEn: 'Step 4: Cosmic Perspective',
        type: 'reflection_rotating',
        reflectionsPool: DAILY_COSMIC_REFLECTIONS,
      },
      {
        id: 'gratitude', icon: '🙏', color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۵: قدردانی و نیت امروز', titleEn: 'Step 5: Gratitude & Daily Intention',
        type: 'intention',
        promptFa: 'با چه حسی می‌خواهی امروز را زندگی کنی؟',
        promptEn: "How do you choose to embody this day?",
        placeholderFa: 'نیت قلبی یا یک شکرگزاری...',
        placeholderEn: 'Your core intention or gratitude...',
      },
    ]
  },
  {
    id: 'cardio_aerobic',
    icon: '⚡',
    color: 'from-rose-600/25 via-amber-600/15 to-emerald-600/10 border-rose-500/50',
    accentColor: 'rose',
    gradientFrom: 'from-rose-600',
    gradientTo: 'to-amber-500',
    xpReward: 85,
    coinsReward: 40,
    titleFa: 'راه‌روی ورزش هوازی و تنفس انرژی‌بخش',
    titleEn: 'Global Cardio & Bioenergetic Movement',
    descFa: 'هوازی بدون وزنه، چی‌گونگ، شائولین، فلو حیوانی و تمرینات قلبی (۵ تا ۵۵ دقیقه)',
    descEn: 'No-equipment cardio, Qigong, Shaolin, Animal flow & Heart vitality (5 to 55 min)',
    steps: [
      {
        id: 'aerobic_config', icon: '⏱️', color: 'from-rose-600/20 via-[var(--bg-card)] to-transparent border-rose-500/40',
        titleFa: 'گام ۱: انتخاب سطح و مدت زمان تمرین', titleEn: 'Step 1: Intensity & Duration Setup',
        type: 'cardio_setup',
      },
      {
        id: 'aerobic_warmup', icon: '🌬️', color: 'from-teal-600/20 via-[var(--bg-card)] to-transparent border-teal-500/40',
        titleFa: 'گام ۲: گرم کردن مفاصل و تنفس چی (Qigong Warm-up)', titleEn: 'Step 2: Joint & Chi Warm-up',
        type: 'cardio_warmup',
      },
      {
        id: 'aerobic_player', icon: '🥋', color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۳: اجرای حرکات هوازی با انیمیشن آموزشی', titleEn: 'Step 3: Cardio Routine with Visual Pose Guide',
        type: 'cardio_workout_player',
      },
      {
        id: 'aerobic_cooldown', icon: '🌊', color: 'from-cyan-600/20 via-[var(--bg-card)] to-transparent border-cyan-500/40',
        titleFa: 'گام ۴: لرزش لنفاوی و سرد کردن تائوئیستی', titleEn: 'Step 4: Lymphatic Shakeout & Cooldown',
        type: 'cardio_cooldown',
      },
      {
        id: 'aerobic_log', icon: '🏆', color: 'from-emerald-600/20 via-[var(--bg-card)] to-transparent border-emerald-500/40',
        titleFa: 'گام ۵: ثبت دستاورد و پایش انرژی زیستی', titleEn: 'Step 5: Vitality Log & Reward',
        type: 'cardio_log',
      }
    ]
  },
  {
    id: 'selfDiscovery',
    icon: '🔮',
    color: 'from-violet-600/20 to-pink-600/10 border-violet-500/40',
    accentColor: 'violet',
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-pink-600',
    xpReward: 60,
    coinsReward: 25,
    titleFa: 'راه‌روی خودشناسی عمیق',
    titleEn: 'Deep Self-Discovery Path',
    descFa: 'روان‌شناسی، سایه، ارزش‌ها و هدف زندگی',
    descEn: 'Psychology, shadow work, values & life purpose',
    steps: [
      {
        id: 'center', icon: '🌬️', color: 'from-violet-600/20 via-[var(--bg-card)] to-transparent border-violet-500/40',
        titleFa: 'گام ۱: حضور و آرامش', titleEn: 'Step 1: Grounding',
        type: 'breath',
        contentFa: 'چند نفس عمیق بکش. اجازه بده ذهنت از فشارهای بیرونی فاصله بگیرد. این ۱۰ دقیقه متعلق به توست.',
        contentEn: 'Take a few deep breaths. Let your mind step away from external pressures. These 10 minutes belong to you.',
      },
  {
    id: 'relationships',
    icon: '🤝',
    color: 'from-pink-600/20 to-teal-600/10 border-pink-500/40',
    accentColor: 'pink',
    gradientFrom: 'from-pink-600',
    gradientTo: 'to-teal-500',
    xpReward: 65,
    coinsReward: 30,
    titleFa: 'راه‌روی روابط و هوش اجتماعی',
    titleEn: 'Social Mastery & Empathy Path',
    descFa: 'ارتباط اصیل با خود و دیگران، هنر مرزبندی، تمرین NVC و کاریزمای حقیقی',
    descEn: 'Authentic self & social connection, healthy boundaries, NVC & charisma',
    steps: [
      {
        id: 'relational_scan', icon: '🔋', color: 'from-pink-600/20 via-[var(--bg-card)] to-transparent border-pink-500/40',
        titleFa: 'گام ۱: پایش انرژی اجتماعی امروز شما', titleEn: 'Step 1: Social Energy Scan',
        type: 'multiChoice',
        questionFa: 'میزان آمادگی و انرژی اجتماعی امروز شما در چه سطحی است؟',
        questionEn: 'What is your social energy and relational readiness level today?',
        options: [
          { fa: '🔋 ۵ — آماده تعامل عمیق، شنیدن فعال و ابراز محبت', en: '🔋 5 — Ready for deep interaction & active listening' },
          { fa: '🔌 ۴ — نیاز مبرم به خلوت، سکوت و شارژ باتری اجتماعی', en: '🔌 4 — Needing quiet solitude & low battery' },
          { fa: '⚡ ۳ — درگیری ذهنی یا تنش عاطفی حل‌نشده با فردی خاص', en: '⚡ 3 — Active conflict or emotional friction' },
          { fa: '🌱 ۲ — پایداری عاطفی و آماده ارتباطات روزمره و کاری', en: '🌱 2 — Balanced & open to standard daily interactions' }
        ]
      },
      {
        id: 'relational_wisdom', icon: '📜', color: 'from-teal-600/20 via-[var(--bg-card)] to-transparent border-teal-500/40',
        titleFa: 'گام ۲: حکمت روز در هنر عشق و ارتباط (چرخشی)', titleEn: 'Step 2: Wisdom of the Heart (Rotating)',
        type: 'quote_rotating',
        quotesPool: DAILY_RELATIONAL_QUOTES
      },
      {
        id: 'relational_nvc', icon: '🪞', color: 'from-pink-600/20 via-[var(--bg-card)] to-transparent border-pink-500/40',
        titleFa: 'گام ۳: کارگاه کوچک مهارت کلامی و مرزبندی (چرخشی)', titleEn: 'Step 3: Verbal Empathy & Boundaries (Rotating)',
        type: 'journal_rotating',
        questionsPool: DAILY_RELATIONAL_QUESTIONS,
        xpReward: 20, sectionId: 'selfDiscovery'
      },
      {
        id: 'relational_shadow', icon: '🌑', color: 'from-slate-700/30 via-[var(--bg-card)] to-transparent border-slate-500/40',
        titleFa: 'گام ۴: آینه سایه‌های ارتباطی (برطرف کردن رنجش)', titleEn: 'Step 4: Shadow Relational Mirror',
        type: 'journal',
        questionFa: 'یک رفتار یا ویژگی در فردی نزدیک که اخیراً تو را آزرده است بنویس. این رفتار چه چیزی درباره سایه پنهان یا مرزهای خودت به تو می‌گوید؟',
        questionEn: 'Write about a behavior in someone close that irritated you recently. What does this reveal about your own repressed shadow or unmet boundaries?',
        placeholderFa: 'مثال: از پرحرفی او کلافه شدم، شاید چون خودم هیچ‌وقت به خودم اجازه ابراز وجود کامل نمی‌دهم...',
        placeholderEn: 'e.g., I was annoyed by their selfishness; perhaps because I never allow myself to prioritize my own needs...',
        xpReward: 20, sectionId: 'selfDiscovery'
      },
      {
        id: 'relational_action', icon: '⚡', color: 'from-teal-600/20 via-[var(--bg-card)] to-transparent border-teal-500/40',
        titleFa: 'گام ۵: تعهد به اتصال صمیمانه امروز', titleEn: 'Step 5: Daily Relational Intention',
        type: 'intention',
        promptFa: 'چه اقدام کوچکی امروز برای بهبود یک رابطه یا حفظ مرزهای شخصی‌ات انجام می‌دهی؟',
        promptEn: 'What one small action will you take today to deepen a relationship or protect your boundaries?',
        placeholderFa: 'مثلاً: تماس با دوست قدیمی، گفتگو درباره مرزها با همسر، قدردانی شفاف...',
        placeholderEn: 'e.g., call an old friend, talk about boundaries with partner, express clear gratitude...',
        xpReward: 15
      }
    ]
  },

      {
        id: 'values', icon: '💎', color: 'from-violet-600/20 via-[var(--bg-card)] to-transparent border-violet-500/40',
        titleFa: 'گام ۲: کشف ارزش‌های اصلی امروز', titleEn: 'Step 2: Core Values Check',
        type: 'multiChoice',
        questionFa: 'امروز کدام ارزش درونی‌ات را بیشتر احساس کردی یا به آن نیاز داشتی؟',
        questionEn: 'Which core value did you feel most strongly or need most today?',
        options: [
          { fa: '🌿 آزادی و استقلال', en: '🌿 Freedom & Autonomy' },
          { fa: '❤️ محبت و ارتباط', en: '❤️ Love & Connection' },
          { fa: '🔥 جسارت و شجاعت', en: '🔥 Courage & Boldness' },
          { fa: '📚 دانش و حکمت', en: '📚 Knowledge & Wisdom' },
          { fa: '🎨 خلاقیت و زیبایی', en: '🎨 Creativity & Beauty' },
          { fa: '🏆 تعالی و بزرگی', en: '🏆 Excellence & Mastery' },
        ],
      },
      {
        id: 'shadow_self_rotating', icon: '🌑', color: 'from-slate-700/30 via-[var(--bg-card)] to-transparent border-slate-500/40',
        titleFa: 'گام ۳: کار با سایه (روزانه)', titleEn: 'Step 3: Shadow Work of the Day',
        type: 'journal_rotating',
        questionsPool: DAILY_SHADOW_QUESTIONS,
        xpReward: 20, sectionId: 'selfDiscovery',
      },
      {
        id: 'childhood', icon: '🧒', color: 'from-pink-600/20 via-[var(--bg-card)] to-transparent border-pink-500/40',
        titleFa: 'گام ۴: پیام به کودک درون', titleEn: 'Step 4: Inner Child Message',
        type: 'journal',
        questionFa: '«اگر به نسخه ۱۰ ساله‌ات یک جمله مهم می‌گفتی، چه می‌گفتی؟»',
        questionEn: '"If you could say one important thing to your 10-year-old self, what would it be?"',
        placeholderFa: 'پیامت را بنویس...',
        placeholderEn: 'Write your message...',
        xpReward: 20, sectionId: 'selfDiscovery',
      },
      {
        id: 'purpose', icon: '🌟', color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۵: اکنون اقدام می‌کنم', titleEn: 'Step 5: Action Commitment',
        type: 'intention',
        promptFa: 'برای رشد خودشناسی‌ات امروز چه یک کار کوچک انجام می‌دهی؟',
        promptEn: 'What one small action will you take today for your self-growth?',
        placeholderFa: 'مثلاً: ۱۰ دقیقه مدیتیشن، نوشتن ۳ احساسم...',
        placeholderEn: 'e.g. 10 min meditation, journaling 3 feelings...',
      },
    ]
  },
  {
    id: 'wealth',
    icon: '💰',
    color: 'from-emerald-600/20 to-yellow-600/10 border-emerald-500/40',
    accentColor: 'emerald',
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-yellow-500',
    xpReward: 80,
    coinsReward: 40,
    titleFa: 'راه‌روی ثروت و استقلال مالی',
    titleEn: 'Wealth & Financial Independence Path',
    descFa: 'درس‌های جهانی ثروت، ثبت درآمد/هزینه، استراتژی و اهداف مالی',
    descEn: 'Global wealth principles, expense/income tracking & financial goals',
    steps: [
      {
        id: 'stage_check', icon: '📊', color: 'from-emerald-600/20 via-[var(--bg-card)] to-transparent border-emerald-500/40',
        titleFa: 'گام ۱: مرحله مالی من در کجاست؟', titleEn: 'Step 1: My Current Financial Stage',
        type: 'financial_stage',
        questionFa: 'در حال حاضر در کدام مرحله مالی قرار داری؟ (بر اساس سطح واقعی)',
        questionEn: 'Which financial stage describes your current situation?',
        stages: [
          { id: 'crisis', icon: '🚨', fa: '۱. بحران مالی — بدهی با سود بالا و بدون پس‌انداز', en: '1. Financial Crisis — High-interest debt & zero savings', adviceFa: '🔴 اولویت فوری: توقف خرید اقساطی، جمع‌آوری ۳ تا ۵ میلیون صندوق اضطراری اولیه.', adviceEn: 'Priority: Stop new debt, build emergency fund.', colorClass: 'border-rose-500/40 text-rose-300' },
          { id: 'paycheck', icon: '⚖️', fa: '۲. سر به سر — درآمد فقط هزینه‌های ماهانه را پوشش می‌دهد', en: '2. Paycheck to Paycheck — Income equals expenses', adviceFa: '🟡 اولویت: حذف ۳ هزینه غیرضروری و ذخیره حداقل ۱۰٪ هر ورودی مالی.', adviceEn: 'Priority: Cut 3 non-essentials, save 10% of all income.', colorClass: 'border-yellow-500/40 text-yellow-300' },
          { id: 'stability', icon: '🛡️', fa: '۳. ثبات مالی — صندوق اضطراری ۳ تا ۶ ماهه تشکیل شده', en: '3. Financial Stability — 3-6 month emergency fund ready', adviceFa: '🟢 اولویت: شروع سرمایه‌گذاری خودکار در دارایی‌های مولد (سهام، طلا، صندوق‌ها).', adviceEn: 'Priority: Start automated investing in productive assets.', colorClass: 'border-emerald-500/40 text-emerald-300' },
          { id: 'growth', icon: '📈', fa: '۴. رشد دارایی — درآمد غیرفعال بخشی از هزینه‌ها را می‌دهد', en: '4. Asset Growth — Passive income covers part of expenses', adviceFa: '🚀 اولویت: تنوع‌بخشی به جریان‌های درآمدی و ارتقای مهارت‌های اهرمی.', adviceEn: 'Priority: Diversify income streams & scale high-leverage skills.', colorClass: 'border-cyan-500/40 text-cyan-300' },
          { id: 'freedom', icon: '👑', fa: '۵. استقلال مالی کامل (FIRE) — سود دارایی‌ها > کل هزینه‌ها', en: '5. Financial Independence — Asset yields > all expenses', adviceFa: '💎 اولویت: بهینه‌سازی میراث، حفظ سرمایه و بخشش/توسعه جامعه.', adviceEn: 'Priority: Capital preservation, legacy building & philanthropy.', colorClass: 'border-purple-500/40 text-purple-300' },
        ]
      },
      {
        id: 'daily_income', icon: '💵', color: 'from-emerald-600/20 via-[var(--bg-card)] to-transparent border-emerald-500/40',
        titleFa: 'گام ۲: ثبت درآمد امروز', titleEn: 'Step 2: Log Today\'s Income',
        type: 'finance_log',
        financeType: 'income',
        questionFa: 'آیا امروز ورودی مالی داشتی؟ (حقوق، فریلنس، سود سرمایه، فروش، بدهی وصول‌شده)',
        questionEn: 'Did you receive any income today?',
        currencies: ['تومان', 'دلار', 'یورو', 'پوند'],
        categories: { fa: ['💼 حقوق و دستمزد', '💻 فریلنس و پروژه', '📈 سود سرمایه‌گذاری', '🏪 فروش کالا/خدمات', '🎁 هدیه/پاداش', '➕ سایر'], en: ['💼 Salary', '💻 Freelance', '📈 Investment Yield', '🏪 Sales', '🎁 Bonus', '➕ Other'] }
      },
      {
        id: 'daily_expense', icon: '💸', color: 'from-rose-600/20 via-[var(--bg-card)] to-transparent border-rose-500/40',
        titleFa: 'گام ۳: ثبت هزینه‌های امروز', titleEn: 'Step 3: Log Today\'s Expenses',
        type: 'finance_log',
        financeType: 'expense',
        questionFa: 'امروز چه هزینه‌هایی پرداخت کردی؟ ثبت دقیق هزینه‌ها = قطع نشتی‌های مالی پنهان',
        questionEn: 'What expenses did you incur today?',
        currencies: ['تومان', 'دلار', 'یورو', 'پوند'],
        categories: { fa: ['🍔 خوراک و سوپرمارکت', '🚗 حمل‌ونقل و بنزین', '🏠 مسکن و قبوض', '🛍️ خرید شخصی', '💊 سلامت و درمان', '📚 آموزش و رشد', '🎮 سرگرمی و کافه', '➕ سایر'], en: ['🍔 Food', '🚗 Transport', '🏠 Housing', '🛍️ Shopping', '💊 Health', '📚 Education', '🎮 Fun', '➕ Other'] }
      },
      {
        id: 'book_lesson', icon: '📚', color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۴: درس طلایی امروز از کتاب‌های ثروت جهان', titleEn: 'Step 4: Today\'s Golden Lesson from Wealth Classics',
        type: 'wealth_education',
        lessons: [
          {
            day: 'شنبه', bookFa: '«ثروتمندترین مرد بابل» — جورج کلاسون', bookEn: '"The Richest Man in Babylon" — George Clason',
            icon: '🏛️',
            principleNameFa: 'قانون اول: حداقل ۱۰٪ از تمام درآمدهای خود را ابتدا به خودتان پرداخت کنید',
            principleNameEn: 'Law 1: Pay yourself first — keep at least 10% of all you earn',
            contentFa: 'بخشی از تمام آنچه به دست می‌آوری متعلق به توست تا نگهش داری. قبل از پرداخت اجاره، خوراک و قبوض، ۱۰ درصد درآمد را در حسابی غیرقابل برداشت ذخیره کن تا تبدیل به بذر درخت ثروت شود.',
            contentEn: 'A part of all you earn is yours to keep. Set aside at least 10% before paying anyone else.',
            actionFa: '🎯 اقدام امروز: از اولین پولی که دریافت می‌کنی ۱۰٪ را فوراً جدا کن.',
            actionEn: '🎯 Today\'s action: Automatically transfer 10% of any income to savings.'
          },
          {
            day: 'یکشنبه', bookFa: '«پدر پولدار، پدر فقیر» — رابرت کیوساکی', bookEn: '"Rich Dad Poor Dad" — Robert Kiyosaki',
            icon: '🏢',
            principleNameFa: 'تفاوت حیاتی دارایی (Asset) و بدهی (Liability)',
            principleNameEn: 'The critical difference: Assets put money in your pocket, Liabilities take it out',
            contentFa: 'پولدارها دارایی می‌خرند؛ طبقه متوسط بدهی‌هایی می‌خرند که فکر می‌کنند دارایی است (مثل خودروی لوکس یا خانه با قسط سنگین). دارایی چیزی است که حتی وقتی خوابیده‌ای پول وارد جیبت می‌کند.',
            contentEn: 'Rich people acquire assets. The poor and middle class acquire liabilities that they think are assets.',
            actionFa: '🎯 اقدام امروز: لیست خرید‌های ماه را نگاه کن: چندتا دارایی مولد بوده و چندتا مصرفی؟',
            actionEn: '🎯 Today\'s action: Audit your spending: Are you buying assets or liabilities?'
          },
          {
            day: 'دوشنبه', bookFa: '«روانشناسی پول» — مورگان هاوزل', bookEn: '"The Psychology of Money" — Morgan Housel',
            icon: '🧠',
            principleNameFa: 'ثروتمند بودن با ثروتمند ماندن فرق دارد (نقش فروتنی و زمان)',
            principleNameEn: 'Getting wealthy vs. Staying wealthy — The role of humility and compounding',
            contentFa: 'ثروتمند شدن نیازمند ریسک‌پذیری و خوش‌بینی است، اما ثروتمند ماندن نیازمند ترس از دست دادن، فروتنی و داشتن حاشیه امن (صندوق اضطراری) است. سود مرکب معجزه زمان است، نه معجزه هوش.',
            contentEn: 'Compounding works wonders only when you can give an asset years or decades to grow without interrupting it.',
            actionFa: '🎯 اقدام امروز: اجازه بده سرمایه‌گذاری‌هایت دست‌نخورده باقی بمانند و هیجانی معامله نکن.',
            actionEn: '🎯 Today\'s action: Do not interrupt compounding unnecessarily.'
          },
          {
            day: 'سه‌شنبه', bookFa: '«آلماناک نیوال راویکانت» — اریک یورگنسون', bookEn: '"The Almanack of Naval Ravikant"',
            icon: '⚡',
            principleNameFa: 'اهرم‌های ثروت مدرن: کد، محتوا، سرمایه و کار',
            principleNameEn: 'Modern Leverage: Code, Media, Capital, and Labor',
            contentFa: 'با اجاره دادن زمان خود ثروتمند نمی‌شوی؛ باید مالکیت داشته باشی (Equity). اهرم‌های کد و محتوا نیازی به اجازه کسی ندارند و در خواب برای تو کار می‌کنند.',
            contentEn: 'You will not get rich renting out your time. You must own equity. Code and media are permissionless leverage.',
            actionFa: '🎯 اقدام امروز: چه محتوا، کد یا مهارتی می‌توانی یک‌بار بسازی و هزاران بار استفاده شود؟',
            actionEn: '🎯 Today\'s action: Identify one piece of media, code, or knowledge asset you can build.'
          },
          {
            day: 'چهارشنبه', bookFa: '«فکر کن و ثروتمند شو» — ناپلئون هیل', bookEn: '"Think and Grow Rich" — Napoleon Hill',
            icon: '🔥',
            principleNameFa: 'اشتیاق سوزان و باور قاطع به هدف مالی',
            principleNameEn: 'Definiteness of Purpose and Burning Desire',
            contentFa: 'یک عدد دقیق برای ثروت مورد نظرت مشخص کن، زمان دقیق رسیدن به آن را تعیین کن، و دقیقا مشخص کن در ازای این ثروت چه ارزش و خدمتی به جامعه خواهی داد.',
            contentEn: 'Fix in your mind the exact amount of money you desire. Determine accurately what you intend to give in return.',
            actionFa: '🎯 اقدام امروز: عدد دقیق استقلال مالی‌ات را روی کاغذ یادداشت کن.',
            actionEn: '🎯 Today\'s action: Write down your exact target number and deadline.'
          },
          {
            day: 'پنج‌شنبه', bookFa: '«راه ساده به ثروت» — جی‌ال کالینز', bookEn: '"The Simple Path to Wealth" — JL Collins',
            icon: '📈',
            principleNameFa: 'سرمایه‌گذاری روی کل بازار (صندوق‌های شاخصی و دوری از حباب)',
            principleNameEn: 'Index investing, F-You Money, and ignoring market noise',
            contentFa: 'تلاش برای پیش‌بینی روزانه بازار مثل قمار است. راه ساده: کمتر از درآمدت خرج کن، مابقی را در صندوق‌های با کارمزد کم سرمایه‌گذاری کن و به اخبار روزانه توجهی نکن.',
            contentEn: 'Spend less than you earn, invest the surplus in low-cost index funds, and avoid debt.',
            actionFa: '🎯 اقدام امروز: از اپلیکیشن‌های اخبار لحظه‌ای نوسان بازار فاصله بگیر.',
            actionEn: '🎯 Today\'s action: Ignore short-term market noise; stay focused on decades.'
          },
          {
            day: 'جمعه', bookFa: '«میلیونر همسایه» — توماس استنلی', bookEn: '"The Millionaire Next Door" — Thomas Stanley',
            icon: '🏡',
            principleNameFa: 'ثروت واقعی آنچه نشان می‌دهی نیست، آنچه جمع می‌کنی است',
            principleNameEn: 'True wealth is what you accumulate, not what you spend',
            contentFa: 'بسیاری از کسانی که لباس گران و ماشین لوکس دارند، صفر دارایی دارند. میلیونرهای واقعی معمولاً زندگی بسیار ساده‌ای دارند و تمرکزشان بر سرمایه‌گذاری بی‌سروصداست.',
            contentEn: 'Most millionaires do not drive flashy cars or live lavishly. They live well below their means.',
            actionFa: '🎯 اقدام امروز: هزینه کردن برای خودنمایی را با پس‌انداز برای آزادی جایگزین کن.',
            actionEn: '🎯 Today\'s action: Choose quiet financial freedom over loud status display.'
          }
        ]
      },
      {
        id: 'financial_habits', icon: '🧠', color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۵: تحلیل عادات مالی مخرب و اصلاح آن', titleEn: 'Step 5: Money Mindset Audit',
        type: 'journal',
        questionFa: '«کدام عادت مالی در این هفته بیشتر از همه به تو آسیب زد؟ چطور آن را اصلاح می‌کنی؟»',
        questionEn: '"Which money habit harmed your progress most this week? How will you correct it?"',
        placeholderFa: 'مثلاً: سفارش غذای بیرون بی‌برنامه، خریدهای هیجانی شبانه، عدم بررسی صورتحساب...',
        placeholderEn: 'e.g. impulsive online shopping, ordering takeout, not tracking daily spending...',
        xpReward: 15, sectionId: 'wealth',
      },
      {
        id: 'goal_setting', icon: '🎯', color: 'from-yellow-600/20 via-[var(--bg-card)] to-transparent border-yellow-500/40',
        titleFa: 'گام ۶: ثبت هدف مالی مشخص', titleEn: 'Step 6: Set Clear Financial Target',
        type: 'financial_goal',
        questionFa: 'یک هدف مالی شفاف و ملموس بنویس:',
        questionEn: 'Write down a crystal-clear financial goal:',
        timelineOptions: { fa: ['۱ ماهه', '۳ ماهه', '۶ ماهه', '۱ ساله', '۳ ساله', '۵ ساله'], en: ['1 Month', '3 Months', '6 Months', '1 Year', '3 Years', '5 Years'] },
        examplesFa: ['تشکیل صندوق اضطراری ۱۰ میلیون تومانی', 'شروع پس‌انداز ماهانه ۱ میلیون برای طلا', 'کاهش هزینه‌های متفرقه تا ۲۰٪', 'خلق ۱ منبع درآمد دلاری یا فریلنس'],
        examplesEn: ['Build $2,000 emergency fund', 'Automate $300 monthly index fund investment', 'Reduce restaurant spending by 30%', 'Launch 1 online side-income stream'],
        placeholderFa: 'هدف من: ... | زمان تحقق: ... | اولین اقدام: ...',
        placeholderEn: 'My goal: ... | Timeline: ... | First action step: ...',
      },
      {
        id: 'immediate_action', icon: '⚡', color: 'from-emerald-600/20 via-[var(--bg-card)] to-transparent border-emerald-500/40',
        titleFa: 'گام ۷: یک اقدام مالی کوچک همین امروز', titleEn: 'Step 7: Immediate Wealth Action Today',
        type: 'intention',
        promptFa: 'همین امروز چه اقدام مالی کوچکی انجام می‌دهی؟ (حتی اگر واریز ۱۰ هزار تومان به پس‌انداز باشد)',
        promptEn: 'What one immediate financial action will you take today?',
        placeholderFa: 'مثلاً: انتقال پول به حساب پس‌انداز، لغو اشتراک بلااستفاده...',
        placeholderEn: 'e.g. transfer money to savings, cancel unused subscription...',
      }
    ]
  },
  {
    id: 'knowledge',
    icon: '📚',
    color: 'from-blue-600/20 to-cyan-600/10 border-blue-500/40',
    accentColor: 'blue',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-cyan-600',
    xpReward: 75,
    coinsReward: 35,
    titleFa: 'راه‌روی دانش و یادگیری عمیق',
    titleEn: 'Deep Knowledge & Learning Path',
    descFa: 'مدل‌های ذهنی، یادآوری فعال، تکنیک فاینمن و تبدیل اطلاعات به خرد عملی',
    descEn: 'Mental models, active recall, Feynman technique & turning insights into wisdom',
    steps: [
      {
        id: 'knowledge_mental_model', icon: '🧠', color: 'from-blue-600/20 via-[var(--bg-card)] to-transparent border-blue-500/40',
        titleFa: 'گام ۱: مدل ذهنی روز برای تفکر شفاف (چرخشی)', titleEn: 'Step 1: Mental Model of the Day (Rotating)',
        type: 'quote_rotating',
        quotesPool: DAILY_KNOWLEDGE_MENTAL_MODELS.map(m => ({
          fa: `«${m.nameFa}»\n${m.conceptFa}`,
          en: `"${m.nameEn}"\n${m.conceptEn}`,
          authorFa: 'الگوی تفکر بزرگان جهان',
          authorEn: 'High-leverage mental models'
        }))
      },
      {
        id: 'yesterday_recall', icon: '⚡', color: 'from-cyan-600/20 via-[var(--bg-card)] to-transparent border-cyan-500/40',
        titleFa: 'گام ۲: تکنیک فاینمن و یادآوری فعال (Active Recall)', titleEn: 'Step 2: Feynman Technique & Active Recall',
        type: 'journal',
        questionFa: '«مهم‌ترین درسی که اخیراً یاد گرفتی چه بود؟ تصور کن می‌خواهی آن را در ۳ جمله ساده به یک نوجوان یاد بدهی. بدون نگاه به منبع بنویس:»',
        questionEn: '"What critical insight did you learn recently? Explain it in 3 simple sentences as if teaching a teenager, without looking at your notes:"',
        placeholderFa: 'توضیح ساده و شفاف به زبان خودم...',
        placeholderEn: 'Clear explanation in my own simple words...',
        xpReward: 20, sectionId: 'learning',
        tipFa: '💡 یادآوری فعال ۵۰٪ ماندگاری عصبی اطلاعات در حافظه بلندمدت را افزایش می‌دهد.',
        tipEn: '💡 Active retrieval creates deep synaptic pathways in long-term memory.'
      },
      {
        id: 'cognitive_bias_scan', icon: '🔍', color: 'from-indigo-600/20 via-[var(--bg-card)] to-transparent border-indigo-500/40',
        titleFa: 'گام ۳: پایش خطاهای شناختی و سوگیری‌های فکری', titleEn: 'Step 3: Cognitive Bias Audit',
        type: 'multiChoice',
        questionFa: 'در تصمیم‌گیری‌های اخیرت، کدام تله فکری بیشتر ممکن است تو را گمراه کرده باشد؟',
        questionEn: 'Which cognitive trap or bias might be affecting your current decisions?',
        options: [
          { fa: '🎯 سوگیری تایید (Confirmation Bias) — فقط دیدن شواهدی که نظرم را تایید می‌کند', en: '🎯 Confirmation Bias — Seeking only confirming evidence' },
          { fa: '💸 مغالطه هزینه از دست‌رفته (Sunk Cost) — ادامه دادن کار غلط فقط چون وقت/پول صرفش کردم', en: '💸 Sunk Cost Fallacy — Continuing bad path due to past effort' },
          { fa: '👥 اثر همرنگی با جماعت (Bandwagon Effect) — تقلید ناخودآگاه از نظر اطرافیان', en: '👥 Bandwagon Effect — Conforming to popular opinion' },
          { fa: '⚡ خطای بیش‌اطمینانی (Overconfidence) — دست‌کم گرفتن ریسک‌ها و زمان لازم', en: '⚡ Overconfidence — Underestimating risk and required timeline' }
        ]
      },
      {
        id: 'knowledge_practical_action', icon: '🛠️', color: 'from-teal-600/20 via-[var(--bg-card)] to-transparent border-teal-500/40',
        titleFa: 'گام ۴: تبدیل دانش نظری به دستاورد عملی', titleEn: 'Step 4: Applied Wisdom Action',
        type: 'journal',
        questionFa: 'یک ایده یا فرمولی که اخیراً خوانده‌ای را بنویس و بگو دقیقاً چطور می‌توانی همین امروز در شغل، زندگی یا پروژه‌ات تستش کنی؟',
        questionEn: 'Write down one concept you read recently and specify exactly how you will test it in your work or life today:',
        placeholderFa: 'ایده: ... | نحوه آزمایش تجربی در عمل: ...',
        placeholderEn: 'Concept: ... | Experimental test in practice: ...',
        xpReward: 20, sectionId: 'learning'
      },
      {
        id: 'learning_plan', icon: '📝', color: 'from-blue-600/20 via-[var(--bg-card)] to-transparent border-blue-500/40',
        titleFa: 'گام ۵: برنامه و میثاق مطالعه عمیق امروز', titleEn: 'Step 5: Daily Study Blueprint',
        type: 'intention',
        promptFa: 'دقیقاً در چه ساعتی و چه منبعی (کتاب، دوره، مقاله علمی) را برای ۲۰ تا ۴۵ دقیقه عمیقاً مطالعه می‌کنی؟',
        promptEn: 'Exactly what time and resource will you dedicate 20-45m of deep focus to today?',
        placeholderFa: 'مثلاً: ساعت ۲۱:۰۰، فصل ۴ کتاب تفکر سریع و کند، خلاصه برداری ۳ نکته...',
        placeholderEn: 'e.g. 21:00, Chapter 4 of Thinking Fast & Slow, extract 3 notes...',
        xpReward: 15
      },
    ]
  },
  {
    id: 'success',
    icon: '🏆',
    color: 'from-orange-600/20 to-yellow-600/10 border-orange-500/40',
    accentColor: 'orange',
    gradientFrom: 'from-orange-600',
    gradientTo: 'to-yellow-600',
    xpReward: 80,
    coinsReward: 40,
    titleFa: 'راه‌روی موفقیت و رهبری استراتژیک',
    titleEn: 'Strategic Success & Leadership Path',
    descFa: 'تمرکز اهرمی، ماتریس آیزنهاور، ۳ کار تعیین‌کننده (MIT) و سپر کار عمیق',
    descEn: 'Leverage focus, Eisenhower matrix, Top 3 MITs & deep work armor',
    steps: [
      {
        id: 'vision', icon: '🌄', color: 'from-orange-600/20 via-[var(--bg-card)] to-transparent border-orange-500/40',
        titleFa: 'گام ۱: تجسم پیروزی و چشم‌انداز استراتژیک', titleEn: 'Step 1: Strategic Vision & Creative Tension',
        type: 'reflection',
        contentFa: 'موفقیت شانس نیست، معماری روزمره‌ی آینده است. مغز انسان با هدف شفاف انرژی هیجانی خود را بسیج می‌کند. چشم‌هایت را ببند و وضعیت پیروزی امشب را هنگام رفتن به رختخواب تجسم کن.',
        contentEn: 'Success is calculated daily architecture. Clear vision unlocks high neural drive. Envision your exact victorious state tonight before you sleep.',
        emojiIcon: '🔭',
      },
      {
        id: 'eisenhower_matrix', icon: '⚖️', color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۲: غربالگری کارها با ماتریس آیزنهاور', titleEn: 'Step 2: Eisenhower Matrix Filter',
        type: 'multiChoice',
        questionFa: 'کدام دسته از فعالیت‌ها بیشترین خطر بلعیدن زمان مفید امروزت را دارند؟',
        questionEn: 'Which quadrant poses the highest risk of swallowing your prime hours today?',
        options: [
          { fa: '🚨 کارهای فوری اما بی‌اهمیت (پیام‌ها، ایمیل‌های متفرقه، تقاضاهای ناگهانی دیگران)', en: '🚨 Urgent but Not Important (Trivial pings, demands of others)' },
          { fa: '💎 کارهای مهم اما غیرفوری (ورزش، یادگیری عمیق، کار استراتژیک، ارتقای سیستم)', en: '💎 Important but Not Urgent (Deep work, health, system upgrades)' },
          { fa: '🌀 کارهای غیرمهم و غیرفوری (گشتن بی‌هدف در اخبار و شبکه‌های اجتماعی)', en: '🌀 Not Important & Not Urgent (Doomscrolling, endless feeds)' },
          { fa: '🔥 بحران‌های واقعی که نیازمند تمرکز قاطع هستند', en: '🔥 True Crises requiring immediate executive focus' }
        ]
      },
      {
        id: 'top3_tasks', icon: '🎯', color: 'from-red-600/20 via-[var(--bg-card)] to-transparent border-red-500/40',
        titleFa: 'گام ۳: ۳ کار تعیین‌کننده روز (Top 3 MIT Tasks)', titleEn: 'Step 3: Top 3 Most Important Tasks',
        type: 'triple_input',
        questionFa: 'تنها ۳ کار اصلی که اگر امروز تمام شوند، این روز را به یک شاهکار تبدیل می‌کنند:',
        questionEn: 'The 3 critical mission tasks that make today an absolute triumph:',
        placeholders: {
          fa: ['🥇 مهم‌ترین کار اول (قورباغه بزرگ را قورت بده)...', '🥈 دومین کار استراتژیک و اهرمی...', '🥉 سومین کار کلیدی روز...'],
          en: ['🥇 #1 Highest-leverage critical task...', '🥈 #2 Strategic priority...', '🥉 #3 Essential milestone...'],
        },
        xpReward: 25, sectionId: 'integrity',
      },
      {
        id: 'deep_work_shield', icon: '🛡️', color: 'from-purple-600/20 via-[var(--bg-card)] to-transparent border-purple-500/40',
        titleFa: 'گام ۴: سپر کار عمیق و مهار حواس‌پرتی‌ها', titleEn: 'Step 4: Deep Work Distraction Armor',
        type: 'journal',
        questionFa: 'بزرگترین عامل حواس‌پرتی که ممکن است تمرکزت را در حین انجام ۳ کار بالا بشکند چیست و چه حفاظ فیزیکی برایش می‌سازی؟ (مثلاً: قرار دادن گوشی در اتاق دیگر)',
        questionEn: 'What is the #1 distraction that threatens your deep focus today, and what physical barrier will you set against it?',
        placeholderFa: 'عامل مخل: ... | حفاظ و سپر اجرایی: ...',
        placeholderEn: 'Distraction: ... | Physical containment shield: ...',
        xpReward: 20, sectionId: 'integrity'
      },
      {
        id: 'evening_win', icon: '🏅', color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۵: رویکرد ضدشکننده (تبدیل مانع به سوخت)', titleEn: 'Step 5: Antifragile Execution Pledge',
        type: 'intention',
        promptFa: 'اگر در طول روز اتفاقی خلاف برنامه‌ات رخ دهد، چطور با خونسردی آن را به فرصتی برای رشد تبدیل می‌کنی؟',
        promptEn: 'When unexpected obstacles arise today, how will you turn the obstacle into your fuel?',
        placeholderFa: 'پاسخ من به هر چالش این خواهد بود که...',
        placeholderEn: 'My response to any unforeseen setback will be...',
        xpReward: 15
      },
    ]
  },
  {
    id: 'health',
    icon: '💪',
    color: 'from-rose-600/20 to-pink-600/10 border-rose-500/40',
    accentColor: 'rose',
    gradientFrom: 'from-rose-600',
    gradientTo: 'to-pink-600',
    xpReward: 75,
    coinsReward: 35,
    titleFa: 'راه‌روی سلامت زیستی و انرژی پایدار',
    titleEn: 'Bio-Vitality & Peak Health Path',
    descFa: 'پایش انرژی زیستی، ارگونومی، قانون ۸۰٪ تغذیه و بازیابی سیستم عصبی',
    descEn: 'Bioenergetics, ergonomics, 80% nutrition rule & nervous recovery',
    steps: [
      {
        id: 'body_scan', icon: '🌡️', color: 'from-rose-600/20 via-[var(--bg-card)] to-transparent border-rose-500/40',
        titleFa: 'گام ۱: اسکن انرژی بدن و کیفیت خواب دیشب', titleEn: 'Step 1: Bio-Energy & Sleep Audit',
        type: 'multiChoice',
        questionFa: 'وضعیت آمادگی جسمانی و شارژ باتری فیزیولوژیک شما امروز در چه نقطه‌ای است؟',
        questionEn: 'What is your physical battery & neuromuscular readiness level today?',
        options: [
          { fa: '⚡ ۵ — سرشار از انرژی، خواب عمیق و ریکاوری کامل سلولی', en: '⚡ 5 — Peak vitality, deep REM sleep & fully restored' },
          { fa: '🙂 ۴ — خوب، باانگیزه و آماده فعالیت‌های بدنی و ذهنی', en: '🙂 4 — Good, motivated and ready for training & focus' },
          { fa: '😐 ۳ — متوسط؛ نیاز به نوشیدن آب فراوان و تنفس عمیق در هوای آزاد', en: '😐 3 — Moderate; needs hydration & fresh air breathing' },
          { fa: '😴 ۲ — احساس خستگی، گرفتگی عضلات یا خواب مقطع و ناکافی', en: '😴 2 — Fatigue, muscle tightness or fragmented sleep' },
          { fa: '💤 ۱ — تحلیل رفته و تحت فشار؛ نیازمند استراحت فعال و پرهیز از تمرین سنگین', en: '💤 1 — Exhausted; priority is active recovery & deep rest' }
        ],
      },
      {
        id: 'posture_alignment', icon: '🧘', color: 'from-teal-600/20 via-[var(--bg-card)] to-transparent border-teal-500/40',
        titleFa: 'گام ۲: چک‌لیست اصلاح پوزیشن بدن و ارگونومی', titleEn: 'Step 2: Posture & Ergonomics Check',
        type: 'reflection',
        contentFa: 'همین الان وضعیت بدنت را بررسی کن: دانه‌های شانه را به عقب و پایین بغلتان، فک و عضلات دور چشم را شل کن، ستون فقرات را کشیده نگه دار و هوا را با دیافراگم (شکمی) به عمق ریه بفرست.',
        contentEn: 'Check your posture right now: Roll shoulders down and back, unclench jaw and facial muscles, lengthen your spine, and engage slow diaphragmatic breathing.',
        emojiIcon: '🦴'
      },
      {
        id: 'nutrition_hara_hachi_bu', icon: '🥗', color: 'from-emerald-600/20 via-[var(--bg-card)] to-transparent border-emerald-500/40',
        titleFa: 'گام ۳: میثاق تغذیه هوشمند و قانون هاراهاتی‌بو (۸۰٪)', titleEn: 'Step 3: Hara Hachi Bu Nutrition & Clean Fuel',
        type: 'journal',
        questionFa: '«در ژاپن قانون هاراهاتی‌بو یعنی قبل از پر شدن ۱۰۰٪ شکم، در ۸۰٪ سیری دست از غذا بکش. امروز چه تعهدی برای پرهیز از قند مصنوعی، غذاهای فرآوری‌شده و پرخوری داری؟»',
        questionEn: '"Hara Hachi Bu: Stop eating when 80% full. What specific commitment will you make today against refined sugars, ultra-processed food, and overeating?"',
        placeholderFa: 'تعهد تغذیه امروز: مصرف ۲ لیتر آب، حذف شیرینی صنعتی، میوه تازه...',
        placeholderEn: 'Today\'s fuel plan: 2L water, zero processed sugars, wholesome whole foods...',
        xpReward: 20, sectionId: 'health'
      },
      {
        id: 'fatigue_antidote', icon: '☀️', color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۴: پادزهر خستگی مغزی و دریافت نور خورشید', titleEn: 'Step 4: Dopamine Sunlight & Bio-Reset',
        type: 'reflection',
        contentFa: 'دریافت ۱۰ تا ۱۵ دقیقه نور طبیعی خورشید در ساعات اولیه روز، تولید کورتیزول سالم صبحگاهی و ترشح ملاتونین شبانه را کالیبره می‌کند. هر زمان در طول روز احساس ماتی ذهنی کردی، ۱ لیوان آب خنک بنوش و ۵ دقیقه پیاده‌روی کن.',
        contentEn: '10-15 minutes of morning sunlight sets your circadian clock for peak daytime dopamine and nocturnal melatonin. When brain fog hits, drink cold water and take a 5m brisk walk.',
        emojiIcon: '🌞'
      },
      {
        id: 'health_intention', icon: '💚', color: 'from-green-600/20 via-[var(--bg-card)] to-transparent border-green-500/40',
        titleFa: 'گام ۵: میثاق طلایی سلامت و جنبش امروز', titleEn: 'Step 5: Sacred Health & Movement Contract',
        type: 'intention',
        promptFa: 'چه اقدام غیرقابل مذاکره‌ای امروز برای معبد جسمت انجام می‌دهی؟',
        promptEn: 'What non-negotiable physical action will you honor for your body temple today?',
        placeholderFa: 'مثلاً: ۳۰ دقیقه ورزش هوازی، ۸ لیوان آب، خواب عمیق قبل از ساعت ۲۳:۰۰...',
        placeholderEn: 'e.g. 30m aerobic walk, 8 glasses of water, in bed before 23:00...',
        xpReward: 15
      },
    ]
  },
  {
    id: 'integrity',
    icon: '⚖️',
    color: 'from-yellow-600/20 to-amber-600/10 border-yellow-500/40',
    accentColor: 'yellow',
    gradientFrom: 'from-yellow-600',
    gradientTo: 'to-amber-600',
    xpReward: 75,
    coinsReward: 35,
    titleFa: 'راه‌روی درستی، اصالت و آرامش وجدان',
    titleEn: 'Integrity & Moral Sovereignty Path',
    descFa: 'وفای به عهد، شجاعت اخلاقی، تطابق خلوت و جلوت و سبکی روح',
    descEn: 'Honoring commitments, radical honesty, private character & light soul',
    steps: [
      {
        id: 'integrity_mirror', icon: '🪞', color: 'from-yellow-600/20 via-[var(--bg-card)] to-transparent border-yellow-500/40',
        titleFa: 'گام ۱: آینه شخصیت و رفتار در خلوت', titleEn: 'Step 1: The Sovereign Mirror of Character',
        type: 'reflection',
        contentFa: 'اصالت یعنی آن کس که در خلوت‌ترین لحظاتت هستی، با آنچه در جامعه نشان می‌دهی یکی باشد. آرامش پایدار وجدان، بالاترین ثروت انسان است و هیچ لذتی در جهان با خوابیدن با وجدان پاک برابری نمی‌کند.',
        contentEn: 'True integrity is the complete alignment between your private deeds and public words. A clean conscience is the highest sovereignty a human can achieve.',
        emojiIcon: '⚖️',
      },
      {
        id: 'commitments_audit', icon: '📜', color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۲: بازبینی قول‌ها و تعهدات معوقه', titleEn: 'Step 2: Commitments & Broken Promises Audit',
        type: 'journal',
        questionFa: 'آیا قول، بدهی مالی یا قولی اخلاقی به خودت یا فردی دیگر داده‌ای که هنوز آن را به سرانجام نرسانده باشی؟ چطور آن را تسویه می‌کنی؟',
        questionEn: 'Is there a promise, financial debt, or moral commitment to yourself or someone else that remains unresolved? How will you resolve it?',
        placeholderFa: 'تعهد معوقه: ... | نحوه و زمان تسویه: ...',
        placeholderEn: 'Pending promise: ... | Action plan for resolution: ...',
        xpReward: 20, sectionId: 'integrity'
      },
      {
        id: 'moral_courage', icon: '🔥', color: 'from-rose-600/20 via-[var(--bg-card)] to-transparent border-rose-500/40',
        titleFa: 'گام ۳: شجاعت اخلاقی و صداقت رادیکال', titleEn: 'Step 3: Radical Truth & Moral Courage',
        type: 'multiChoice',
        questionFa: 'امروز در کدام موقعیت ممکن است وسوسه شوی برای خوشایند دیگران حقیقت را پنهان کنی یا تملق بگویی؟',
        questionEn: 'In what situation might you be tempted to compromise the truth for temporary approval?',
        options: [
          { fa: '🗣️ در محیط کار یا تیم: ترس از ابراز نظر کارشناسی مخالف', en: '🗣️ At work: Hesitating to speak unpopular constructive truth' },
          { fa: '🤝 در جمع دوستان: همرنگ شدن با بدگویی یا قضاوت پشت سر دیگران', en: '🤝 Socially: Joining in gossip or unverified judgment of others' },
          { fa: '💼 در تعاملات مالی: تمایل به اغراق یا عدم شفافیت در قیمت و کیفیت', en: '💼 Financial: Temptation to overpromise or conceal details' },
          { fa: '🪞 در مواجهه با خودم: انکار نقاط ضعف و توجیه کردن تنبلی', en: '🪞 With myself: Rationalizing procrastination and bad habits' }
        ]
      },
      {
        id: 'self_forgiveness', icon: '🕊️', color: 'from-teal-600/20 via-[var(--bg-card)] to-transparent border-teal-500/40',
        titleFa: 'گام ۴: رهاسازی بار کینه و خودبخشایش آگاهانه', titleEn: 'Step 4: Unburdening & Radical Forgiveness',
        type: 'journal',
        questionFa: '«کینه مانند نوشیدن سم و انتظار مرگ طرف مقابل است. امروز چه دلخوری یا خطایی از خودت یا دیگری را می‌خواهی رها کنی تا قلبت سبک شود؟»',
        questionEn: '"Holding resentment is like drinking poison and expecting the other person to die. What grievance or self-blame will you release today to lighten your spirit?"',
        placeholderFa: 'من خطای گذشته را می‌بخشم و رها می‌کنم زیرا ارزش آرامشم بیشتر است...',
        placeholderEn: 'I forgive and release past mistakes because my inner peace is sacred...',
        xpReward: 20, sectionId: 'integrity'
      },
      {
        id: 'integrity_commitment', icon: '🌟', color: 'from-yellow-600/20 via-[var(--bg-card)] to-transparent border-yellow-500/40',
        titleFa: 'گام ۵: سوگند اصالت و شرافت امروز', titleEn: 'Step 5: Sacred Oath of Authenticity',
        type: 'intention',
        promptFa: 'یک جمله شفاف بنویس که امروز راهنمای اخلاقی و قطب‌نمای رفتارت باشد:',
        promptEn: 'Write one clear sentence that will serve as your moral compass today:',
        placeholderFa: 'امروز تحت هر شرایطی راست می‌گویم و حتی در خلوت به اصولم وفادارم.',
        placeholderEn: 'Today, in all circumstances, I choose truth, honor, and sovereign integrity.',
        xpReward: 15
      },
    ]
  },
  {
    id: 'dopamine_freedom',
    icon: '🧬',
    color: 'from-indigo-600/25 via-purple-600/15 to-rose-600/10 border-indigo-500/50',
    accentColor: 'indigo',
    gradientFrom: 'from-indigo-600',
    gradientTo: 'to-purple-600',
    xpReward: 85,
    coinsReward: 40,
    titleFa: 'راه‌روی سم‌زدایی دوپامین و بازسازی اراده',
    titleEn: 'Dopamine Detox & Willpower Mastery',
    descFa: 'شکستن چرخه اعتیاد به اسکرول، قند، پورنوگرافی و بازیابی تمرکز اصیل مغز',
    descEn: 'Break loops of mindless scrolling, junk dopamine & restore sovereign neuro-focus',
    steps: [
      {
        id: 'dopamine_trigger_scan', icon: '🚨', color: 'from-indigo-600/20 via-[var(--bg-card)] to-transparent border-indigo-500/40',
        titleFa: 'گام ۱: پایش سطح میل و محرک‌های دوپامین ارزان', titleEn: 'Step 1: Cheap Dopamine Trigger Scan',
        type: 'multiChoice',
        questionFa: 'هم‌اکنون بیشترین هوس یا وسوسه تکانه‌ای مغز شما به سمت کدام رفتار است؟',
        questionEn: 'Which instant-gratification loop is tugging at your attention right now?',
        options: [
          { fa: '📱 اسکرول بی‌هدف شبکه‌های اجتماعی (اینستاگرام، تیک‌تاک، یوتیوب)', en: '📱 Mindless social media doomscrolling (Instagram/YouTube/TikTok)' },
          { fa: '🍩 مصرف شکر، فست‌فود، کافئین بیش‌ازحد یا ریزه‌خواری عصبی', en: '🍩 Junk sugar, emotional snacking or excessive caffeine' },
          { fa: '🔞 فرار به پورنوگرافی، تحریک جنسی مجازی یا بازی‌های ویدیویی طولانی', en: '🔞 Pornography, digital escapism or compulsive gaming' },
          { fa: '🧘 در وضعیت هوشیار، پاک و مسلط بر مدارهای پاداش مغز هستم', en: '🧘 In a sovereign, clear state — full control over reward circuits' }
        ]
      },
      {
        id: 'dopamine_wisdom', icon: '📜', color: 'from-purple-600/20 via-[var(--bg-card)] to-transparent border-purple-500/40',
        titleFa: 'گام ۲: علم اعصاب و روانشناسی پاداش (چرخشی)', titleEn: 'Step 2: Neuroscience of Dopamine (Rotating)',
        type: 'quote_rotating',
        quotesPool: DAILY_DOPAMINE_QUOTES
      },
      {
        id: 'urge_surfing_protocol', icon: '🌊', color: 'from-teal-600/20 via-[var(--bg-card)] to-transparent border-teal-500/40',
        titleFa: 'گام ۳: پروتکل موج‌سواری بر هوس (Urge Surfing Protocol)', titleEn: 'Step 3: 5-Minute Urge Surfing Protocol',
        type: 'breath',
        contentFa: 'وقتی میل به عادت مخرب حمله می‌کند، مغز فریاد می‌زند "همین الان انجامش بده!". راز آزادی: نجنگید؛ مانند یک موج‌سوار روی این حس موج‌سواری کنید. این موج ظرف ۵ تا ۱۰ دقیقه به اوج می‌رسد و سپس ناپدید می‌شود. ۶۰ ثانیه تنفس عمیق شکمی انجام دهید.',
        contentEn: 'Cravings are neurochemical waves that peak and dissolve in 5-10 minutes. Do not fight the feeling; observe it as a detached witness with 60 seconds of slow diaphragmatic breathing.',
      },
      {
        id: 'dopamine_shadow_journal', icon: '🪞', color: 'from-rose-600/20 via-[var(--bg-card)] to-transparent border-rose-500/40',
        titleFa: 'گام ۴: ریشه‌یابی فرار عاطفی (چرا به سمت عادت می‌روم؟)', titleEn: 'Step 4: Emotional Escape Root Discovery',
        type: 'journal_rotating',
        questionsPool: DAILY_DOPAMINE_QUESTIONS,
        xpReward: 20, sectionId: 'addiction'
      },
      {
        id: 'clean_dopamine_contract', icon: '⚡', color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۵: میثاق دوپامین پاک و فعالیت‌های نیروبخش', titleEn: 'Step 5: Clean Dopamine & Sovereignty Pledge',
        type: 'intention',
        promptFa: 'امروز چه فعالیت باکیفیت و دشواری (ورزش، حمام آب سرد، مطالعه، پیاده‌روی در طبیعت) را جایگزین لذت‌های کاذب می‌کنی؟',
        promptEn: 'What high-quality, effortful activity (cold shower, heavy workout, deep reading) will you engage in instead of cheap dopamine?',
        placeholderFa: 'من به جای اسکرول، ۳۰ دقیقه کتاب می‌خوانم و دوش آب سرد می‌گیرم...',
        placeholderEn: 'Instead of cheap stimulation, I commit to 30m reading and an intense workout...',
        xpReward: 20
      }
    ]
  },
  {
    id: 'sleep_sanctum',
    icon: '🌙',
    color: 'from-indigo-900/30 via-slate-900/40 to-cyan-950/20 border-indigo-500/40',
    accentColor: 'indigo',
    gradientFrom: 'from-indigo-700',
    gradientTo: 'to-slate-900',
    xpReward: 80,
    coinsReward: 35,
    titleFa: 'راه‌روی پناهگاه شبانگاهی و خواب عمیق',
    titleEn: 'Sleep Sanctum & Night Reflection Path',
    descFa: 'تخلیه کامل ذهن، شکرگزاری ۳گانه، تنفس پاراسمپاتیک و ورود به تاریکی مقدس',
    descEn: 'Full mental unburdening, triple gratitude, parasympathetic reset & deep delta rest',
    steps: [
      {
        id: 'nightly_brain_dump', icon: '🧠', color: 'from-indigo-600/20 via-[var(--bg-card)] to-transparent border-indigo-500/40',
        titleFa: 'گام ۱: تخلیه کامل مغز و بایگانی افکار (Brain Dump)', titleEn: 'Step 1: Nightly Cognitive Brain Dump',
        type: 'journal',
        questionFa: 'تمام کارهای نیمه‌کاره، نگرانی‌های فردا و پرونده‌های باز ذهنت را اینجا بنویس تا مغز متوجه شود ثبت شده‌اند و در طول خواب دست از نشخوار فکری بردارد:',
        questionEn: 'Write down all pending tasks, tomorrow\'s worries, and open loops so your brain knows they are securely stored and can stop rumination during sleep:',
        placeholderFa: 'فردا باید این کارها را انجام دهم: ۱... ۲... ۳... خیالم راحت است و اکنون رهایشان می‌کنم.',
        placeholderEn: 'Tomorrow\'s priorities: 1... 2... 3... All logged. I can rest completely now.',
        xpReward: 20, sectionId: 'selfDiscovery'
      },
      {
        id: 'night_wisdom', icon: '🌌', color: 'from-slate-700/30 via-[var(--bg-card)] to-transparent border-slate-500/40',
        titleFa: 'گام ۲: خرد شبانگاهی و آرامش جان (چرخشی)', titleEn: 'Step 2: Nocturnal Wisdom (Rotating)',
        type: 'quote_rotating',
        quotesPool: DAILY_NIGHT_QUOTES
      },
      {
        id: 'night_gratitude_triad', icon: '🙏', color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۳: شکرگزاری سه‌گانه از زیبایی‌های امروز', titleEn: 'Step 3: Triple Evening Gratitude',
        type: 'triple_input',
        questionFa: '۳ لحظه دلنشین، اتفاق خوب یا نعمتی که امروز قلبت را گرم کرد:',
        questionEn: '3 sweet moments, blessings, or victories that warmed your heart today:',
        placeholders: {
          fa: ['✨ اولین لحظه دلنشین یا نعمت امروز...', '🌿 دومین زیبایی یا دستاورد کوچک...', '❤️ سومین مهر و موهبت روز...'],
          en: ['✨ First sweet moment or blessing...', '🌿 Second small victory or beauty...', '❤️ Third kindness or peace...'],
        },
        xpReward: 25, sectionId: 'selfDiscovery'
      },
      {
        id: 'parasympathetic_478_breath', icon: '🌬️', color: 'from-teal-600/20 via-[var(--bg-card)] to-transparent border-teal-500/40',
        titleFa: 'گام ۴: تنفس آرام‌بخش ۴-۷-۸ و ریست عصب واگ', titleEn: 'Step 4: 4-7-8 Parasympathetic Vagus Reset',
        type: 'breath',
        contentFa: 'چشم‌ها را ببندید. با بینی ۴ ثانیه نفس بکشید، ۷ ثانیه حبس کنید و با لب‌های غنچه ۸ ثانیه با آرامش بازدم کنید. این ریتم ترشح هورمون‌های استرس را مهار کرده و مغز را آماده امواج دلتا می‌کند.',
        contentEn: 'Inhale through nose for 4s, hold for 7s, exhale slowly through mouth for 8s. This powerful rhythm triggers deep parasympathetic rest and prepares your brain for delta waves.',
      },
      {
        id: 'pitch_dark_commitment', icon: '🌙', color: 'from-indigo-900/40 via-[var(--bg-card)] to-transparent border-indigo-500/40',
        titleFa: 'گام ۵: خاموشی نمایشگرها و ورود به تاریکی مطلق', titleEn: 'Step 5: Digital Sunset & Melatonin Sanctuary',
        type: 'intention',
        promptFa: 'گوشی را در حالت پرواز یا فاصله دور بگذار. ساعت هدف برای بیداری باانگیزه فردا صبح را بنویس و با آرامش کامل به خواب برو:',
        promptEn: 'Set phone to airplane mode away from bed. Write your target wake-up time for tomorrow and step into deep restorative rest:',
        placeholderFa: 'ساعت بیداری فردا: ۰۶:۰۰ صبح | ذهنم آرام و آماده خوابی عمیق است 🌙',
        placeholderEn: 'Wake-up time: 06:00 AM | My mind is serene and ready for deep sleep 🌙',
        xpReward: 20
      }
    ]
  },
  {
    id: 'stoic_resilience',
    icon: '🏛️',
    color: 'from-slate-600/20 to-zinc-600/10 border-slate-500/40',
    accentColor: 'slate',
    gradientFrom: 'from-slate-600',
    gradientTo: 'to-zinc-500',
    xpReward: 60,
    coinsReward: 25,
    titleFa: 'راه‌روی قلعه درونی و رواقی‌گری',
    titleEn: 'Stoic Resilience & Inner Fortress',
    descFa: 'تفکیک امور، عشق به سرنوشت، پیش‌بینی سختی‌ها و آرامش خدشه‌ناپذیر',
    descEn: 'Dichotomy of control, Amor Fati, negative visualization & unshakable peace',
    steps: [
      {
        id: 'stoic_control', icon: '⚖️', color: 'from-slate-600/20 via-[var(--bg-card)] to-transparent border-slate-500/40',
        titleFa: 'گام ۱: تفکیک امور (Dichotomy of Control)', titleEn: 'Step 1: Dichotomy of Control',
        type: 'journal',
        promptFa: 'چه چیزی امروز ذهنت را درگیر کرده که کاملاً خارج از کنترل توست؟ (آن را بنویس تا رهایش کنی)',
        promptEn: 'What is occupying your mind today that is completely outside your control?',
        placeholderFa: 'مثلاً: واکنش مدیرم به کارم، وضعیت ترافیک، اقتصاد...',
        placeholderEn: 'e.g., Others opinions, the weather, past events...',
      },
      {
        id: 'stoic_premeditatio', icon: '🛡️', color: 'from-zinc-600/20 via-[var(--bg-card)] to-transparent border-zinc-500/40',
        titleFa: 'گام ۲: پیش‌بینی سختی‌ها (Premeditatio Malorum)', titleEn: 'Step 2: Negative Visualization',
        type: 'reflection',
        contentFa: 'بدترین اتفاقی که امروز ممکن است بیفتد چیست؟ تصور کن رخ داده است. آیا هنوز نفس می‌کشی؟ آیا هنوز قادری منطقی تصمیم بگیری؟ این تمرین ترس از آینده را از بین می‌برد.',
        contentEn: 'Visualize the worst-case scenario for today. Realize that even if it happens, you possess the inner resources to handle it. Fear loses its grip.',
      },
      {
        id: 'stoic_amor_fati', icon: '🔥', color: 'from-orange-600/20 via-[var(--bg-card)] to-transparent border-orange-500/40',
        titleFa: 'گام ۳: عشق به سرنوشت (Amor Fati)', titleEn: 'Step 3: Amor Fati (Love of Fate)',
        type: 'intention',
        promptFa: 'چگونه می‌توانی یک چالش فعلی را به یک "سوخت" برای رشد تبدیل کنی؟',
        promptEn: 'How can you use a current obstacle as fuel for your growth?',
        placeholderFa: 'مثلاً: این سختی فرصتی است برای تمرین صبر...',
        placeholderEn: 'e.g., This delay is teaching me patience...',
      }
    ]
  },
  {
    id: 'creative_flow',
    icon: '🎨',
    color: 'from-fuchsia-600/20 to-purple-600/10 border-fuchsia-500/40',
    accentColor: 'fuchsia',
    gradientFrom: 'from-fuchsia-600',
    gradientTo: 'to-purple-500',
    xpReward: 65,
    coinsReward: 30,
    titleFa: 'راه‌روی خلاقیت و وضعیت غوطه‌وری',
    titleEn: 'Creative Flow & Problem Solving',
    descFa: 'شکستن بن‌بست‌های فکری، طوفان فکری، تکنیک SCAMPER و تمرکز عمیق',
    descEn: 'Breaking mental blocks, brainstorming, SCAMPER technique & deep flow state',
    steps: [
      {
        id: 'flow_ideas', icon: '💡', color: 'from-yellow-500/20 via-[var(--bg-card)] to-transparent border-yellow-500/40',
        titleFa: 'گام ۱: دستگاه تولید ایده (Idea Machine)', titleEn: 'Step 1: The Idea Machine',
        type: 'journal',
        promptFa: 'برای یکی از چالش‌های فعلی‌ات، بدون هیچ قضاوتی ۱۰ راه‌حل (حتی احمقانه) بنویس:',
        promptEn: 'Write down 10 raw, unfiltered solutions for a current problem you are facing:',
        placeholderFa: '۱. ... ۲. ... ۳. ...',
        placeholderEn: '1. ... 2. ... 3. ...',
      },
      {
        id: 'flow_scamper', icon: '🧩', color: 'from-fuchsia-600/20 via-[var(--bg-card)] to-transparent border-fuchsia-500/40',
        titleFa: 'گام ۲: تکنیک اسکمپر (SCAMPER)', titleEn: 'Step 2: SCAMPER Technique',
        type: 'reflection',
        contentFa: 'به یکی از کارهایت فکر کن. آیا می‌توانی چیزی را جایگزین (Substitute)، ترکیب (Combine)، تطبیق (Adapt)، تغییر (Modify)، کاربرد دیگر (Put to another use)، حذف (Eliminate) یا معکوس (Reverse) کنی؟',
        contentEn: 'Think of a current project. Can you Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, or Reverse any element of it?',
      },
      {
        id: 'flow_state', icon: '🌊', color: 'from-cyan-600/20 via-[var(--bg-card)] to-transparent border-cyan-500/40',
        titleFa: 'گام ۳: ورود به غوطه‌وری (Flow State)', titleEn: 'Step 3: Entering Flow State',
        type: 'intention',
        promptFa: 'مهم‌ترین کاری که امروز می‌توانی با تمرکز ۱۰۰٪ و بدون وقفه برای ۹۰ دقیقه انجام دهی چیست؟',
        promptEn: 'What is the ONE task you will commit to for a 90-minute uninterrupted deep work block today?',
        placeholderFa: 'نام کار...',
        placeholderEn: 'Task name...',
      }
    ]
  },
  {
    id: 'charisma_voice',
    icon: '🗣️',
    color: 'from-sky-600/20 to-blue-600/10 border-sky-500/40',
    accentColor: 'sky',
    gradientFrom: 'from-sky-600',
    gradientTo: 'to-blue-500',
    xpReward: 55,
    coinsReward: 25,
    titleFa: 'راه‌روی فن بیان و کاریزما',
    titleEn: 'Charisma, Voice & Persuasion',
    descFa: 'تمرین تنفس دیافراگمی، داستان‌سرایی اصیل، زبان بدن و شنیدن فعال',
    descEn: 'Diaphragmatic resonance, authentic storytelling, body language & active listening',
    steps: [
      {
        id: 'voice_warmup', icon: '🎵', color: 'from-sky-600/20 via-[var(--bg-card)] to-transparent border-sky-500/40',
        titleFa: 'گام ۱: رزونانس و تنفس دیافراگمی', titleEn: 'Step 1: Vocal Resonance',
        type: 'breath',
        contentFa: 'دست را روی شکم بگذارید. با دم شکم را باد کنید و با بازدمی طولانی صدای "هووووم" (Humming) را از عمق سینه تولید کنید. این کار تارهای صوتی را گرم و صدا را بم و جذاب می‌کند.',
        contentEn: 'Place a hand on your stomach. Inhale to expand it, and exhale with a deep, chest-resonating "HMMMMM". This warms the vocal cords and enriches tone.',
      },
      {
        id: 'voice_story', icon: '📖', color: 'from-indigo-600/20 via-[var(--bg-card)] to-transparent border-indigo-500/40',
        titleFa: 'گام ۲: داستان‌سرایی (Storytelling)', titleEn: 'Step 2: Micro-Storytelling',
        type: 'journal',
        promptFa: 'یک تجربه جالب اخیرت را در ۳ جمله بنویس (قلاب جذاب، چالش، نتیجه/آموزش):',
        promptEn: 'Frame a recent experience into a 3-sentence story (Hook, Challenge, Resolution):',
        placeholderFa: 'دیروز وقتی داشتم...',
        placeholderEn: 'Yesterday, when I was...',
      },
      {
        id: 'voice_listen', icon: '👂', color: 'from-teal-600/20 via-[var(--bg-card)] to-transparent border-teal-500/40',
        titleFa: 'گام ۳: تعهد به شنیدن فعال', titleEn: 'Step 3: Active Listening',
        type: 'intention',
        promptFa: 'امروز در مکالماتت قصد داری چه تغییری در نحوه گوش دادنت ایجاد کنی؟',
        promptEn: 'How will you upgrade your listening skills in conversations today?',
        placeholderFa: 'مثلاً: قبل از پاسخ دادن ۳ ثانیه مکث کنم...',
        placeholderEn: 'e.g., Pause for 3 seconds before replying...',
      }
    ]
  },
  {
    id: 'mindful_parenting',
    icon: '🌱',
    color: 'from-emerald-600/20 to-green-600/10 border-emerald-500/40',
    accentColor: 'emerald',
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-green-500',
    xpReward: 60,
    coinsReward: 25,
    titleFa: 'راه‌روی خرد والدین و تربیت',
    titleEn: 'Mindful Parenting & Legacy',
    descFa: 'تنظیم هیجان، ایجاد امنیت روانی، مدل‌سازی رفتار و درک دنیای کودک',
    descEn: 'Emotional regulation, psychological safety, role-modeling & empathy',
    steps: [
      {
        id: 'parent_regulation', icon: '🧘', color: 'from-emerald-600/20 via-[var(--bg-card)] to-transparent border-emerald-500/40',
        titleFa: 'گام ۱: پایش تنظیم هیجان', titleEn: 'Step 1: Emotional Regulation Check',
        type: 'multiChoice',
        questionFa: 'وقتی فرزندت اشتباهی می‌کند یا بهانه‌گیری می‌کند، واکنش غالب تو چیست؟',
        questionEn: 'When your child makes a mistake or acts out, what is your default reaction?',
        options: [
          { fa: 'نفس عمیق می‌کشم و به دنبال دلیل رفتار می‌گردم.', en: 'Take a breath and look for the root cause.' },
          { fa: 'سریعاً با صدای بلند تذکر می‌دهم.', en: 'Quickly correct them with a raised voice.' },
          { fa: 'احساس کلافگی می‌کنم و محیط را ترک می‌کنم.', en: 'Feel overwhelmed and disengage.' },
          { fa: 'سعی می‌کنم با نصیحت طولانی متقاعدش کنم.', en: 'Try to lecture and convince them.' }
        ]
      },
      {
        id: 'parent_empathy', icon: '🧸', color: 'from-teal-600/20 via-[var(--bg-card)] to-transparent border-teal-500/40',
        titleFa: 'گام ۲: هم‌دلی با دنیای کودک', titleEn: 'Step 2: Entering Their World',
        type: 'reflection',
        contentFa: 'کودک جهان را بسیار متفاوت می‌بیند. لجبازی او غالباً تلاشی برای ابراز یک نیاز برآورده‌نشده (خواب، گرسنگی، نیاز به توجه) یا کشف استقلال است. رفتار را از فرد جدا کن.',
        contentEn: 'Children see the world differently. Defiance is often a disguised unmet need (sleep, hunger, connection) or a bid for autonomy. Separate the behavior from the child.',
      },
      {
        id: 'parent_intention', icon: '🌳', color: 'from-green-600/20 via-[var(--bg-card)] to-transparent border-green-500/40',
        titleFa: 'گام ۳: تعهد حضور کیفی', titleEn: 'Step 3: Quality Presence',
        type: 'intention',
        promptFa: 'امروز چه زمان کوچکی (مثلاً ۱۵ دقیقه) را می‌توانی ۱۰۰٪ و بدون گوشی به بازی یا گفتگوی خالص با فرزندت اختصاص دهی؟',
        promptEn: 'When can you carve out 15 minutes of 100% undivided, phone-free time to play or talk with your child today?',
        placeholderFa: 'مثلاً: بعد از شام...',
        placeholderEn: 'e.g., Right after dinner...',
      }
    ]
  },
  {
    id: 'entrepreneurial_scale',
    icon: '🚀',
    color: 'from-amber-600/20 to-orange-600/10 border-amber-500/40',
    accentColor: 'amber',
    gradientFrom: 'from-amber-600',
    gradientTo: 'to-orange-500',
    xpReward: 75,
    coinsReward: 40,
    titleFa: 'راه‌روی تفکر کارآفرینی و توسعه',
    titleEn: 'Entrepreneurial Mindset & Scale',
    descFa: 'کشف دردهای بازار، خلق ارزش، اهرم‌سازی و سیستم‌سازی تجاری',
    descEn: 'Finding market pain points, value creation, leverage & system building',
    steps: [
      {
        id: 'ent_pain', icon: '🔍', color: 'from-orange-600/20 via-[var(--bg-card)] to-transparent border-orange-500/40',
        titleFa: 'گام ۱: شکار دردهای بازار', titleEn: 'Step 1: Pain Point Hunting',
        type: 'journal',
        promptFa: 'مردم در اطراف تو یا در صنعتی که می‌شناسی از چه چیزی بیشترین شکایت را دارند؟ (هر شکایت یک فرصت کسب‌وکار است)',
        promptEn: 'What do people in your industry or life complain about the most? (Every complaint is a business opportunity)',
        placeholderFa: 'شکایت از...',
        placeholderEn: 'Complaints about...',
      },
      {
        id: 'ent_leverage', icon: '⚙️', color: 'from-amber-600/20 via-[var(--bg-card)] to-transparent border-amber-500/40',
        titleFa: 'گام ۲: قانون اهرم (Leverage)', titleEn: 'Step 2: The Law of Leverage',
        type: 'reflection',
        contentFa: 'ثروت واقعی زمانی ایجاد می‌شود که ورودی‌های شما (زمان/تلاش) به خروجی‌های نامتناسب متصل شود. ۴ اهرم اصلی: ۱. کارگر (Labor)، ۲. سرمایه (Capital)، ۳. کد (Code)، ۴. رسانه (Media). امروز کدام اهرم را به کار می‌گیری؟',
        contentEn: 'Wealth is created when inputs are decoupled from outputs. The 4 forms of leverage: Labor, Capital, Code, and Media. Which are you building today?',
      },
      {
        id: 'ent_system', icon: '📈', color: 'from-yellow-600/20 via-[var(--bg-card)] to-transparent border-yellow-500/40',
        titleFa: 'گام ۳: سیستم‌سازی یک فرآیند', titleEn: 'Step 3: Systemize a Process',
        type: 'intention',
        promptFa: 'کدام کار تکراری در کسب‌وکار یا زندگی‌ات را می‌توانی امروز سیستم‌سازی (خودکار یا واگذار) کنی؟',
        promptEn: 'What repetitive task in your business or life can you systematize (automate or delegate) today?',
        placeholderFa: 'مثلاً: خودکارسازی پاسخ به ایمیل‌ها...',
        placeholderEn: 'e.g., Automating email responses...',
      }
    ]
  }
];

// ─────────────────────────────────────────────
//  CARDIO WORKOUT & COOLDOWN SUB-COMPONENTS
// ─────────────────────────────────────────────
function CardioWorkoutPlayerStep({ selectedLvl, isRtl }) {
  const exercises = selectedLvl?.exercises || AEROBIC_LEVELS[0].exercises;
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentEx = exercises[currentIdx] || exercises[0];

  const [timer, setTimer] = useState(currentEx.durationSec || 45);
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [completedSet, setCompletedSet] = useState(new Set());

  // Reset timer when switching exercise or rest state
  useEffect(() => {
    setTimer(isResting ? (currentEx.restSec || 15) : (currentEx.durationSec || 45));
  }, [currentIdx, isResting]);

  // Timer interval with countdown sound pips and whistle
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            if (!isResting) {
              soundEngine.playWhistle?.();
              setCompletedSet(old => new Set([...old, currentIdx]));
              if (currentIdx < exercises.length - 1) {
                setIsResting(true);
                return currentEx.restSec || 15;
              } else {
                setIsRunning(false);
                soundEngine.playLevelUp?.();
                return 0;
              }
            } else {
              soundEngine.playWhistle?.();
              setIsResting(false);
              const nextIdx = currentIdx + 1;
              setCurrentIdx(nextIdx);
              return exercises[nextIdx]?.durationSec || 45;
            }
          }
          if (prev === 4 || prev === 3 || prev === 2) {
            soundEngine.playCountdownPip?.(false);
          } else if (prev === 1) {
            soundEngine.playCountdownPip?.(true);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isResting, currentIdx, exercises, currentEx]);

  const handleNextEx = () => {
    setCompletedSet(old => new Set([...old, currentIdx]));
    soundEngine.playTap?.();
    haptics.tap?.();
    if (currentIdx < exercises.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setIsResting(false);
    }
  };

  const handlePrevEx = () => {
    soundEngine.playTap?.();
    haptics.tap?.();
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setIsResting(false);
    }
  };

  return (
    <div className="space-y-4 py-1 select-none">
      {/* Top Header with Sequence Counter & Overall Progress */}
      <div className="p-3.5 rounded-2xl bg-black/25 border border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black">
              {isRtl ? `حرکت ${currentIdx + 1} از ${exercises.length}` : `Exercise ${currentIdx + 1}/${exercises.length}`}
            </span>
            <span className="font-bold text-amber-400 font-mono">
              {Math.round(((completedSet.size) / exercises.length) * 100)}% {isRtl ? 'انجام شد' : 'completed'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {isResting ? (isRtl ? '🧘 فاز استراحت و تنفس' : 'Rest Phase') : (isRtl ? '⚡ فاز اجرای حرکت' : 'Active Set')}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
            style={{ width: `${Math.max(5, ((completedSet.size) / exercises.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* Horizontal Exercise Playlist Selector */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-black text-slate-400 block px-1">
          {isRtl ? `فهرست تمام ${exercises.length} حرکت این سطح (لمس برای انتخاب):` : `All ${exercises.length} Movements (Click to choose):`}
        </span>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {exercises.map((ex, i) => {
            const isCur = i === currentIdx;
            const isDone = completedSet.has(i);
            return (
              <button
                key={ex.id || i}
                onClick={() => {
                  setCurrentIdx(i);
                  setIsResting(false);
                  setIsRunning(false);
                  haptics.tap?.();
                  soundEngine.playTap?.();
                }}
                className={`px-3 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isCur
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-rose-400 shadow-md ring-2 ring-rose-400/40 scale-105'
                    : isDone
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-black/25 border-[var(--border)] text-slate-400 hover:border-slate-500'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-black/30 flex items-center justify-center text-[9px] font-mono">
                  {isDone ? '✓' : i + 1}
                </span>
                <span>{ex.nameFa.split('(')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="p-4 rounded-3xl bg-black/30 border border-rose-500/30 text-center space-y-3">
        <h3 className="text-sm sm:text-base font-black text-white">
          {isResting ? (isRtl ? '🧘 استراحت و تنفس عمیق شکمی' : 'Rest & Deep Breath') : (isRtl ? currentEx.nameFa : currentEx.nameEn)}
        </h3>

        {/* Animated Pose Figure */}
        <AnimatedExerciseFigure svgType={currentEx.svgType} isRtl={isRtl} />

        {/* Live Timer Clock & Controller */}
        <div className="flex flex-col items-center justify-center gap-2 py-1">
          <div className="flex items-center gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono text-rose-400 tracking-tight">
              {timer}
            </span>
            <span className="text-xs text-slate-400 font-bold">{isRtl ? 'ثانیه' : 'sec'}</span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={handlePrevEx}
              disabled={currentIdx === 0}
              className="p-2.5 rounded-2xl bg-black/40 border border-[var(--border)] text-slate-300 disabled:opacity-20 active:scale-95 transition-transform"
              title={isRtl ? 'حرکت قبلی' : 'Previous'}
            >
              <ChevronRight size={16} className={isRtl ? '' : 'rotate-180'} />
            </button>

            <button
              onClick={() => {
                if (!isRunning) soundEngine.playWhistle?.();
                setIsRunning(!isRunning);
                haptics.tap?.();
              }}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-emerald-600 text-white font-black text-xs shadow-lg active:scale-95 transition-transform flex items-center gap-2"
            >
              {isRunning ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
              <span>{isRunning ? (isRtl ? 'توقف موقت' : 'Pause') : (isRtl ? 'شروع تایمر این حرکت' : 'Start Timer')}</span>
            </button>

            <button
              onClick={handleNextEx}
              disabled={currentIdx === exercises.length - 1}
              className="p-2.5 rounded-2xl bg-black/40 border border-[var(--border)] text-slate-300 disabled:opacity-20 active:scale-95 transition-transform"
              title={isRtl ? 'حرکت بعدی' : 'Next'}
            >
              <ChevronLeft size={16} className={isRtl ? '' : 'rotate-180'} />
            </button>
          </div>
        </div>

        {/* Comprehensive Step-by-Step Execution Guide & Form Tips */}
        <div className="space-y-2 text-start pt-3 border-t border-white/10">
          
          {/* Method / How-To Box */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 shadow-sm">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <span>📖</span>
              <span>{isRtl ? 'روش انجام و اجرای گام‌به‌گام حرکت:' : 'Step-by-Step Execution Method:'}</span>
            </span>
            <p className="text-xs text-slate-100 leading-relaxed font-medium">
              {currentEx.howToFa || currentEx.formTipFa || currentEx.goalFa}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Target Muscles */}
            <div className="p-3 rounded-2xl bg-black/30 border border-rose-500/20 space-y-1">
              <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                <span>🎯</span>
                <span>{isRtl ? 'عضلات هدف و زنجیره حرکتی:' : 'Target Muscles:'}</span>
              </span>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                {isRtl ? currentEx.targetMusclesFa : currentEx.targetMusclesEn}
              </p>
            </div>

            {/* Breathing & Form Tip */}
            <div className="p-3 rounded-2xl bg-black/30 border border-teal-500/20 space-y-1">
              <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1">
                <span>🫁</span>
                <span>{isRtl ? 'تنفس و نکته کلیدی مربی:' : 'Breathing & Form Cue:'}</span>
              </span>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                {isRtl ? currentEx.formTipFa : currentEx.formTipEn}
              </p>
            </div>
          </div>

          {/* Goal / Benefits */}
          <div className="p-3 rounded-2xl bg-black/25 border border-purple-500/20 space-y-1">
            <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1">
              <span>✨</span>
              <span>{isRtl ? 'فایده و اثر فیزیولوژیک حرکت:' : 'Physiological Benefit:'}</span>
            </span>
            <p className="text-[11px] text-slate-200 leading-relaxed">
              {isRtl ? currentEx.goalFa : currentEx.goalEn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardioCooldownStep({ isRtl }) {
  const COOLDOWN_MOVES = [
    {
      id: 'lymphatic',
      icon: '🌊',
      nameFa: '۱. لرزش لنفاوی و دکمپرشن مفاصل (Lymphatic Shakeout)',
      nameEn: '1. Taoist Lymphatic Shakeout & Grounding',
      duration: 45,
      targetFa: 'کل سیستم لنفاوی، مچ پا، زانوها، شانه‌ها و عضلات کل بدن',
      targetEn: 'Lymphatic network, ankles, knees, shoulders & full musculature',
      descFa: 'ایستادن آزاد، رهاسازی کامل تمام عضلات و لرزش ملایم و ریتمیک کل بدن برای تخلیه اسید لاکتیک و بازگشت ضربان قلب.',
      descEn: 'Stand tall, completely relax all muscles and gently shake the whole body to flush lactic acid and reset parasympathetic state.',
      howToFa: '۱. صاف بایستید و پاها به عرض شانه. ۲. زانوها را نرم و فنری کنید و تمام عضلات صورت، شانه و دست‌ها را رها سازید. ۳. یک لرزش موزون و ریز از پاشنه‌ها به سمت تمام بدن ایجاد کنید. ۴. با هر بازدم تصور کنید تمام خستگی و حرارت اضافی از منافذ پوست خارج می‌شود.',
      tipFa: 'دهان را نیمه‌باز نگه دارید و اجازه دهید فک و صورت کاملاً شل و بی‌وزن شوند.'
    },
    {
      id: 'cobra_breath',
      icon: '🐍',
      nameFa: '۲. کشش کبرای تنفسی و گشودن قفسه سینه (Cobra Thoracic Stretch)',
      nameEn: '2. Cobra Thoracic Opening & Deep Breath',
      duration: 45,
      targetFa: 'عضلات راست شکمی، سینه، مهره‌های پشتی و عضلات خم‌کننده ران (Psoas)',
      targetEn: 'Rectus abdominis, Pecs, Thoracic spine & Psoas',
      descFa: 'دراز کشیدن روی شکم، بالا بردن ملایم قفسه سینه همراه با دم عمیق شکمی برای آزادسازی دیافراگم و مهره‌های پشتی.',
      descEn: 'Lie prone, gently arch upper torso with deep breaths to open thoracic chest and release diaphragm tension.',
      howToFa: '۱. روی شکم دراز بکشید و کف دست‌ها را کنار سینه‌ها روی زمین بگذارید. ۲. با دم عمیق از بینی، به آرامی سینه و سر را بالا بیاورید و شانه‌ها را به سمت پایین و عقب هدایت کنید. ۳. قفسه سینه را رو به جلو بگشایید و ۳ شماره مکث تنفسی داشته باشید.',
      tipFa: 'به هیچ وجه به کمر فشار نیاورید؛ کشش باید در جلوی قفسه سینه و شکم حس شود.'
    },
    {
      id: 'downward_dog',
      icon: '🐕',
      nameFa: '۳. سگ سرپایین برای رفع انقباض عضلانی (Downward Dog Recovery)',
      nameEn: '3. Downward Dog Posterior Chain Stretch',
      duration: 50,
      targetFa: 'همسترینگ، عضلات دوقلوی ساق پا، فیله کمر، تاندون آشیل و شانه',
      targetEn: 'Hamstrings, Calves, Achilles tendon, Lumbar & Latissimus',
      descFa: 'کشش همسترینگ، ساق پا، شانه و ستون فقرات؛ خون‌رسانی تازه به مغز و رهاسازی تنش عضلانی.',
      descEn: 'Elongate hamstrings, calves and spine; fresh blood flow to the head and total muscle tension release.',
      howToFa: '۱. از حالت ۴ دست و پا، باسن را به سمت سقف بالا ببرید تا بدنتان فرم عدد ۸ فارسی به خود بگیرد. ۲. پاشنه‌ها را به سمت زمین فشار دهید تا پشت پا کاملاً کشیده شود. ۳. سر بین بازوها رها باشد و به ناف نگاه کنید.',
      tipFa: 'می‌توانید به صورت متناوب پاشنه یک پا را بلند کرده و پای دیگر را زمین بگذارید (پدال زدن سگ سرپایین).'
    },
    {
      id: 'childs_pose',
      icon: '🧘',
      nameFa: '۴. وضعیت کودک و سکوت تائوئیستی (Taoist Child’s Pose)',
      nameEn: '4. Taoist Child’s Pose & Deep Serenity',
      duration: 60,
      targetFa: 'مهره‌های کمری، باسن، مچ پا، شانه و سیستم عصبی خودمختار',
      targetEn: 'Lumbar spine, Glutes, Ankles, Shoulders & Parasympathetic nervous system',
      descFa: 'نشستن روی پاشنه‌ها، کشیدن دست‌ها به جلو، گذاشتن پیشانی بر زمین و غوطه‌وری در آرامش خالص و تنظیم تنفس.',
      descEn: 'Rest on heels, forehead on floor, arms outstretched; surrender into peaceful stillness and normal breathing.',
      howToFa: '۱. روی دو زانو بنشینید و باسن را روی پاشنه‌ها قرار دهید. ۲. زانوها را به اندازه عرض تشک باز کنید و تنه را به جلو خم کنید تا پیشانی به زمین برسد. ۳. دست‌ها را به جلو بکشید یا کنار بدن رها کنید و کاملاً به زمین تسلیم شوید.',
      tipFa: 'با هر دم شکم را به ران‌ها فشار دهید و با هر بازدم تمام فشارهای ذهنی و بدنی را رها کنید.'
    }
  ];

  const [activeMoveIdx, setActiveMoveIdx] = useState(0);
  const move = COOLDOWN_MOVES[activeMoveIdx] || COOLDOWN_MOVES[0];
  const [timer, setTimer] = useState(move.duration);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setTimer(move.duration);
    setIsRunning(false);
  }, [activeMoveIdx]);

  useEffect(() => {
    let interval = null;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            soundEngine.playLevelUp?.();
            setIsRunning(false);
            if (activeMoveIdx < COOLDOWN_MOVES.length - 1) {
              setActiveMoveIdx(a => a + 1);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer, activeMoveIdx]);

  return (
    <div className="space-y-4 py-1 select-none text-center">
      {/* 4 Steps Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {COOLDOWN_MOVES.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => {
              setActiveMoveIdx(idx);
              haptics.tap?.();
              soundEngine.playTap?.();
            }}
            className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
              activeMoveIdx === idx
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md ring-2 ring-cyan-400/40 scale-105'
                : 'bg-black/25 border-[var(--border)] text-slate-400 hover:border-cyan-500/40'
            }`}
          >
            <span className="text-xl">{m.icon}</span>
            <span className="text-[10px] truncate max-w-full font-medium">{m.nameFa.split('(')[0]}</span>
          </button>
        ))}
      </div>

      {/* Active Move Showcase Card */}
      <div className="p-5 rounded-3xl bg-black/30 border border-cyan-500/30 space-y-3.5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-3xl">
          {move.icon}
        </div>
        <h3 className="text-sm sm:text-base font-black text-cyan-300">
          {isRtl ? move.nameFa : move.nameEn}
        </h3>

        {/* Timer */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <span className="text-4xl font-black font-mono text-cyan-400">{timer}</span>
          <span className="text-xs text-slate-400">{isRtl ? 'ثانیه' : 'sec'}</span>
          <button
            onClick={() => {
              setIsRunning(!isRunning);
              haptics.tap?.();
              soundEngine.playTap?.();
            }}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          >
            {isRunning ? (isRtl ? 'توقف' : 'Pause') : (isRtl ? 'شروع کشش' : 'Start Stretch')}
          </button>
        </div>

        {/* Detailed How-To Instructions & Target Box */}
        <div className="space-y-2 text-start pt-2 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-1.5 shadow-sm">
            <span className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
              <span>📖</span>
              <span>{isRtl ? 'روش انجام و اجرای گام‌به‌گام کشش:' : 'Step-by-Step Stretch Instructions:'}</span>
            </span>
            <p className="text-xs text-slate-100 leading-relaxed font-medium">
              {isRtl ? move.howToFa : move.descEn}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-2.5 rounded-2xl bg-black/25 border border-white/10 space-y-1">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <span>🎯</span>
                <span>{isRtl ? 'مفاصل و عضلات هدف:' : 'Target Areas:'}</span>
              </span>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                {isRtl ? move.targetFa : move.targetEn}
              </p>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/25 border border-white/10 space-y-1">
              <span className="text-[11px] font-bold text-teal-300 flex items-center gap-1">
                <span>🫁</span>
                <span>{isRtl ? 'تنفس و آرامش ذهن:' : 'Breathing & Calm:'}</span>
              </span>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                {isRtl ? move.tipFa : move.descEn}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  STEP CONTENT RENDERERS
// ─────────────────────────────────────────────
function StepContent({
  step,
  isRtl,
  onJournalSave,
  onIntentionChange,
  intentionValue,
  addXP,
  aerobicState,
  setAerobicState,
  learningLangState,
  setLearningLangState,
  learningVault,
  onToggleVault
}) {
  const [localText, setLocalText] = useState('');
  const [localSaved, setLocalSaved] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [tripleInputs, setTripleInputs] = useState(['', '', '']);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // Cardio Player State
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [exTimer, setExTimer] = useState(45);
  const [isExPlaying, setIsExPlaying] = useState(false);

  useEffect(() => {
    let timer;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathCount(prev => {
          if (prev <= 1) {
            setBreathPhase(p => (p === 'inhale' ? 'hold' : p === 'hold' ? 'exhale' : 'inhale'));
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive]);

  // ── GOD / خدا REALM STEP HANDLERS ──
  if (step.type === 'god_attributes') {
    return <GodStep1Attributes isRtl={isRtl} learningVault={learningVault} onToggleVault={onToggleVault} />;
  }
  if (step.type === 'god_concepts') {
    return <GodStep2Concepts isRtl={isRtl} learningVault={learningVault} onToggleVault={onToggleVault} />;
  }
  if (step.type === 'god_quotes') {
    return <GodStep3Quotes isRtl={isRtl} learningVault={learningVault} onToggleVault={onToggleVault} />;
  }
  if (step.type === 'god_gratitude') {
    return <GodStep4Gratitude isRtl={isRtl} addXP={addXP} addCoins={useAppStore.getState().addCoins} />;
  }
  if (step.type === 'god_pleasing_deeds') {
    return <GodStep5PleasingDeeds isRtl={isRtl} addXP={addXP} addCoins={useAppStore.getState().addCoins} />;
  }
  if (step.type === 'god_practice') {
    return <GodStep6Practice isRtl={isRtl} addXP={addXP} learningVault={learningVault} onToggleVault={onToggleVault} />;
  }
  if (step.type === 'god_omnipresence') {
    return <GodStep7Omnipresence isRtl={isRtl} learningVault={learningVault} onToggleVault={onToggleVault} />;
  }

  // Handle Box Breathing
  if (step.type === 'breath') {
    return (
      <div className="flex flex-col items-center justify-center py-2 space-y-4 text-center">
        <p className="text-xs sm:text-sm text-slate-200 max-w-md leading-relaxed">
          {isRtl ? step.contentFa : step.contentEn}
        </p>
        <motion.div
          animate={{ scale: breathPhase === 'inhale' ? 1.25 : breathPhase === 'hold' ? 1.25 : 0.9 }}
          transition={{ duration: 4, ease: 'easeInOut' }}
          className="w-28 h-28 rounded-full border-4 border-teal-400/50 bg-teal-500/15 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.3)]"
        >
          <span className="text-xs font-bold text-teal-300">
            {breathPhase === 'inhale'
              ? (isRtl ? 'نفس بکش 🌿' : 'Inhale')
              : breathPhase === 'hold'
              ? (isRtl ? 'نگه دار ⏳' : 'Hold')
              : (isRtl ? 'بازدم 🌊' : 'Exhale')}
          </span>
          <span className="text-2xl font-black text-white">{breathCount}</span>
        </motion.div>
        <button
          onClick={() => {
            setIsBreathingActive(!isBreathingActive);
            if (!isBreathingActive) soundEngine.playMeditationBowl?.();
          }}
          className={`px-6 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all ${
            isBreathingActive ? 'bg-rose-600 text-white' : 'bg-teal-600 text-white hover:bg-teal-500'
          }`}
        >
          {isBreathingActive ? (isRtl ? 'توقف' : 'Pause') : (isRtl ? 'شروع تنفس مربعی' : 'Start Box Breathing')}
        </button>
      </div>
    );
  }

  // Rotating Quote
  if (step.type === 'quote_rotating') {
    const quote = getDailyItem(step.quotesPool || DAILY_MINDFUL_QUOTES);
    const isSaved = (learningVault || []).some(v => v.phrase === quote.fa || v.phrase === quote.en);

    return (
      <div className="space-y-4 py-2">
        <div className="p-5 rounded-3xl bg-black/40 border border-amber-500/30 text-center space-y-3 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl">✨</span>
            <button
              onClick={() => onToggleVault?.({
                id: `quote_${quote.authorEn}_${Date.now()}`,
                phrase: isRtl ? quote.fa : quote.en,
                authorFa: quote.authorFa,
                authorEn: quote.authorEn,
                meaningFa: quote.fa,
                meaningEn: quote.en,
                categoryFa: 'حکمت و خودشناسی',
                categoryEn: 'Wisdom & Mindfulness',
                type: 'wisdom'
              })}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isSaved
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-white/10 border-white/15 text-slate-300 hover:text-amber-300 hover:border-amber-400'
              }`}
            >
              <Bookmark size={13} className={isSaved ? 'fill-amber-400 text-amber-400' : ''} />
              <span className="text-[11px]">{isSaved ? (isRtl ? 'در گنجینه ✓' : 'In Vault') : (isRtl ? 'افزودن به گنجینه 💎' : 'Save to Vault')}</span>
            </button>
          </div>
          <blockquote className="text-xs sm:text-sm font-bold text-slate-100 leading-loose italic">
            {isRtl ? quote.fa : quote.en}
          </blockquote>
          <span className="text-xs text-amber-400 font-bold block">— {isRtl ? quote.authorFa : quote.authorEn}</span>
        </div>
        <p className="text-[10px] text-center text-[var(--text-secondary)] italic">
          📅 {isRtl ? 'این حکمت هر روز تغییر می‌کند تا ذهنت همیشه شاداب بماند.' : 'This wisdom rotates daily for continuous fresh insight.'}
        </p>
      </div>
    );
  }

  // Rotating Journal Prompt
  if (step.type === 'journal_rotating') {
    const item = getDailyItem(step.questionsPool || DAILY_SHADOW_QUESTIONS);
    return (
      <div className="space-y-3 py-2">
        <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed">
          {isRtl ? item.qFa : item.qEn}
        </p>
        {item.tipFa && (
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[10px] text-purple-300">
            {isRtl ? item.tipFa : item.tipEn}
          </div>
        )}
        <textarea
          rows={3}
          value={localText}
          onChange={e => setLocalText(e.target.value)}
          placeholder={isRtl ? 'پاسخ صادقانه‌ات را اینجا بنویس...' : 'Write your honest answer...'}
          className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-purple-400 resize-none"
        />
        <div className="flex justify-between items-center">
          <span className="text-[9px] text-purple-300/70">
            {isRtl ? 'سوال چرخشی روزانه' : 'Daily rotating inquiry'}
          </span>
          <button
            onClick={() => {
              if (!localText.trim() || localSaved) return;
              onJournalSave?.(localText, step);
              setLocalSaved(true);
              soundEngine.playCheckmark?.();
              haptics.success?.();
            }}
            disabled={!localText.trim() || localSaved}
            className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Heart size={13} />
            <span>
              {localSaved
                ? (isRtl ? 'ذخیره شد ✔' : 'Saved ✔')
                : (isRtl ? `ثبت در ژورنال (+${step.xpReward || 15} XP)` : `Save (+${step.xpReward || 15} XP)`)}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Rotating Cosmic Reflection
  if (step.type === 'reflection_rotating') {
    const item = getDailyItem(step.reflectionsPool || DAILY_COSMIC_REFLECTIONS);
    return (
      <div className="space-y-4 py-2 text-center">
        <div className="p-5 rounded-2xl bg-black/30 border border-white/10 space-y-2">
          <span className="text-3xl block">{item.icon || '🪐'}</span>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {isRtl ? item.fa : item.en}
          </p>
        </div>
      </div>
    );
  }

  // Standard Journal
  if (step.type === 'journal') {
    return (
      <div className="space-y-3 py-2">
        <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed">
          {isRtl ? step.questionFa : step.questionEn}
        </p>
        {step.tipFa && (
          <div className="p-2.5 rounded-xl bg-blue-900/20 border border-blue-500/20 text-[10px] text-blue-300">
            {isRtl ? step.tipFa : step.tipEn}
          </div>
        )}
        <textarea
          rows={3}
          value={localText}
          onChange={e => setLocalText(e.target.value)}
          placeholder={isRtl ? step.placeholderFa : step.placeholderEn}
          className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-purple-400 resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (!localText.trim() || localSaved) return;
              onJournalSave?.(localText, step);
              setLocalSaved(true);
              soundEngine.playCheckmark?.();
              haptics.success?.();
            }}
            disabled={!localText.trim() || localSaved}
            className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Heart size={13} />
            <span>
              {localSaved
                ? (isRtl ? 'ذخیره شد ✔' : 'Saved ✔')
                : (isRtl ? `ثبت در ژورنال (+${step.xpReward || 10} XP)` : `Save (+${step.xpReward || 10} XP)`)}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // MultiChoice
  if (step.type === 'multiChoice') {
    return (
      <div className="space-y-3 py-2">
        <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed">
          {isRtl ? step.questionFa : step.questionEn}
        </p>
        <div className="grid grid-cols-1 gap-2">
          {step.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedChoice(i);
                soundEngine.playCheckmark?.();
                haptics.tap?.();
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold text-start transition-all ${
                selectedChoice === i
                  ? 'bg-[var(--accent)] text-white scale-[1.02] shadow-md'
                  : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)]'
              }`}
            >
              {isRtl ? opt.fa : opt.en}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Triple Input (MITs)
  if (step.type === 'triple_input') {
    return (
      <div className="space-y-3 py-2">
        <p className="text-xs sm:text-sm font-bold text-slate-200 leading-relaxed">
          {isRtl ? step.questionFa : step.questionEn}
        </p>
        {tripleInputs.map((val, i) => (
          <input
            key={i}
            type="text"
            value={val}
            onChange={e => {
              const next = [...tripleInputs];
              next[i] = e.target.value;
              setTripleInputs(next);
            }}
            placeholder={isRtl ? step.placeholders.fa[i] : step.placeholders.en[i]}
            className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-orange-400"
          />
        ))}
        <div className="flex justify-end">
          <button
            onClick={() => {
              if (tripleInputs.every(t => !t.trim()) || localSaved) return;
              onJournalSave?.(tripleInputs.filter(t => t.trim()).join('\n'), step);
              setLocalSaved(true);
              soundEngine.playCheckmark?.();
            }}
            disabled={tripleInputs.every(t => !t.trim()) || localSaved}
            className="px-4 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-500 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Target size={13} />
            <span>
              {localSaved
                ? (isRtl ? 'ذخیره شد ✔' : 'Saved ✔')
                : (isRtl ? `ثبت اهداف روز (+${step.xpReward || 10} XP)` : `Save Today's Goals (+${step.xpReward || 10} XP)`)}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // Intention
  if (step.type === 'intention') {
    return (
      <div className="space-y-3 py-2">
        <p className="text-xs sm:text-sm font-bold text-amber-200 leading-relaxed">
          {isRtl ? step.promptFa : step.promptEn}
        </p>
        <input
          type="text"
          value={intentionValue || ''}
          onChange={e => onIntentionChange?.(e.target.value)}
          placeholder={isRtl ? step.placeholderFa : step.placeholderEn}
          className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-amber-400"
        />
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-2">
          <Sparkles size={16} className="flex-shrink-0" />
          <span>{isRtl ? `تکمیل این مسیر به شما پاداش کامل می‌دهد!` : `Completing this path earns full XP & Coins!`}</span>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  //  CARDIO STEP RENDERERS (AEROBIC WORKOUT)
  // ─────────────────────────────────────────────
  if (step.type === 'cardio_setup') {
    const selectedLvl = AEROBIC_LEVELS.find(l => l.id === (aerobicState?.level || 'gentle')) || AEROBIC_LEVELS[0];
    const duration = aerobicState?.duration || 15;
    const estCalories = Math.round(selectedLvl.calPerMin * duration);

    return (
      <div className="space-y-4 py-1">
        <div>
          <h3 className="text-xs font-bold text-slate-300 mb-2">
            {isRtl ? '۱. سطح شدت تمرین را انتخاب کنید:' : '1. Choose Workout Intensity Level:'}
          </h3>
          <div className="space-y-2">
            {AEROBIC_LEVELS.map(lvl => {
              const isSelected = (aerobicState?.level || 'gentle') === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => {
                    setAerobicState?.(prev => ({ ...prev, level: lvl.id }));
                    haptics.tap?.();
                    soundEngine.playCheckmark?.();
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-start transition-all ${
                    isSelected
                      ? `${lvl.color} border-2 shadow-lg scale-[1.01]`
                      : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-[var(--text-primary)]">
                      {isRtl ? lvl.nameFa : lvl.nameEn}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 font-bold">
                      {lvl.intensityBadge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                    {isRtl ? lvl.descFa : lvl.descEn}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Slider / Presets */}
        <div className="p-4 rounded-2xl bg-black/20 border border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Timer size={14} />
              <span>{isRtl ? '۲. مدت زمان تمرین امروز (۵ تا ۵۵ دقیقه):' : '2. Daily Duration (5 to 55 min):'}</span>
            </h4>
            <span className="text-sm font-black text-white px-2 py-0.5 rounded-xl bg-amber-600">
              {duration} {isRtl ? 'دقیقه' : 'min'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[5, 10, 15, 20, 30, 45, 55].map(m => (
              <button
                key={m}
                onClick={() => {
                  setAerobicState?.(prev => ({ ...prev, duration: m }));
                  haptics.tap?.();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  duration === m
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                {m} {isRtl ? 'دقیقه' : 'm'}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 font-bold">
            <span>🔥 {isRtl ? `تخمین کالری‌سوزی: ~${estCalories} کیلوکالری` : `Est. Burn: ~${estCalories} kcal`}</span>
            <span>🥋 {isRtl ? '۱۰۰٪ بدون وزنه' : '100% Bodyweight'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (step.type === 'cardio_warmup') {
    return (
      <div className="space-y-4 py-1 text-center">
        <div className="p-4 rounded-3xl bg-black/30 border border-teal-500/30 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-2xl">
            🌬️
          </div>
          <h3 className="text-sm font-black text-teal-300">
            {isRtl ? 'آماده‌سازی مفاصل و آزادسازی جریان چی (Qigong Warm-up)' : 'Joint Mobility & Energy Centering'}
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed max-w-md mx-auto">
            {isRtl
              ? 'پیش از شروع حرکات اصلی، ۱ دقیقه مفاصل مچ پا، زانوها، لگن و شانه را به آرامی بچرخانید. ۳ نفس عمیق شکمی بکشید تا جریان خون به تمام عضلات هدایت شود.'
              : 'Gently rotate ankles, knees, hips and shoulders for 1 minute. Take 3 deep abdominal breaths to flood muscles with oxygen.'}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-300">
          <div className="p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <span>🔄 چرخش گردن و شانه</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <span>🌀 دوران لگن تائوئیستی</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <span>🦶 موبیلیتی مچ و زانو</span>
          </div>
        </div>
      </div>
    );
  }

  if (step.type === 'cardio_workout_player') {
    const selectedLvl = AEROBIC_LEVELS.find(l => l.id === (aerobicState?.level || 'gentle')) || AEROBIC_LEVELS[0];
    return <CardioWorkoutPlayerStep selectedLvl={selectedLvl} isRtl={isRtl} />;
  }

  if (step.type === 'cardio_cooldown') {
    return <CardioCooldownStep isRtl={isRtl} />;
  }

  if (step.type === 'cardio_log') {
    const selectedLvl = AEROBIC_LEVELS.find(l => l.id === (aerobicState?.level || 'gentle')) || AEROBIC_LEVELS[0];
    const duration = aerobicState?.duration || 15;
    const estCalories = Math.round(selectedLvl.calPerMin * duration);
    const earnedXP = Math.round(duration * 2 + 20);

    const handleSaveWorkout = async () => {
      if (localSaved) return;
      await onJournalSave?.(
        `${isRtl ? 'جلسه ورزش هوازی' : 'Cardio Workout'}: ${isRtl ? selectedLvl.nameFa : selectedLvl.nameEn} | ${duration} ${isRtl ? 'دقیقه' : 'min'} | ~${estCalories} kcal`,
        { ...step, xpReward: earnedXP, sectionId: 'mindfulness' }
      );
      setLocalSaved(true);
      soundEngine.playLevelUp?.();
      haptics.success?.();
    };

    return (
      <div className="space-y-4 py-1">
        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-[var(--bg-card)] to-amber-950/20 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300">
              {isRtl ? 'گزارش تمرین هوازی امروز' : 'Today\'s Cardio Session Summary'}
            </span>
            <span className="text-xs font-black text-amber-300">
              +{earnedXP} XP
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 rounded-2xl bg-black/20 border border-[var(--border)]">
              <span className="text-[10px] text-slate-400 block">{isRtl ? 'مدت زمان' : 'Duration'}</span>
              <span className="font-black text-white">{duration} {isRtl ? 'دقیقه' : 'min'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/20 border border-[var(--border)]">
              <span className="text-[10px] text-slate-400 block">{isRtl ? 'کالری تقریبی' : 'Est. Burn'}</span>
              <span className="font-black text-amber-400">~{estCalories} kcal</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/20 border border-[var(--border)]">
              <span className="text-[10px] text-slate-400 block">{isRtl ? 'پاداش سکه' : 'Coins'}</span>
              <span className="font-black text-yellow-400">+15 🪙</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSaveWorkout}
          disabled={localSaved}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <Trophy size={16} />
          <span>
            {localSaved
              ? (isRtl ? 'تمرین در پرونده سلامت ثبت شد 🏆' : 'Workout Logged to Health Record 🏆')
              : (isRtl ? `ثبت دستاورد تمرین (+${earnedXP} XP)` : `Save Workout Achievement (+${earnedXP} XP)`)}
          </span>
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  //  FINANCIAL TYPES (FROM WEALTH PATH)
  // ─────────────────────────────────────────────
  if (step.type === 'financial_stage') {
    const [selected, setSelected] = useState(null);
    return (
      <div className="space-y-3 py-1">
        <p className="text-xs font-bold text-emerald-200">{isRtl ? step.questionFa : step.questionEn}</p>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {step.stages.map(stage => (
            <button
              key={stage.id}
              onClick={() => {
                setSelected(stage.id);
                haptics.tap?.();
                soundEngine.playCheckmark?.();
              }}
              className={`w-full p-3 rounded-2xl border text-start text-xs transition-all ${
                selected === stage.id
                  ? `${stage.colorClass} border-2 scale-[1.01]`
                  : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
                <span>{stage.icon}</span>
                <span>{isRtl ? stage.fa : stage.en}</span>
              </div>
              {selected === stage.id && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 text-[10px] text-emerald-300 leading-relaxed border-t border-emerald-500/20 pt-2"
                >
                  {isRtl ? stage.adviceFa : stage.adviceEn}
                </motion.p>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step.type === 'finance_log') {
    const isIncome = step.financeType === 'income';
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState(step.currencies?.[0] || 'تومان');
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');
    const [entries, setEntries] = useState([]);
    const [saving, setSaving] = useState(false);
    const cats = isRtl ? step.categories?.fa || [] : step.categories?.en || [];

    const handleSave = async () => {
      if (!amount || saving) return;
      setSaving(true);
      try {
        await db.finances.add({
          date: getToday(),
          type: step.financeType,
          amount: parseFloat(amount) || 0,
          category: category || cats[0],
          note,
          currency,
          timestamp: Date.now()
        });
        addXP(10, isRtl ? (isIncome ? 'ثبت درآمد' : 'ثبت هزینه') : isIncome ? 'Income logged' : 'Expense logged');
        soundEngine.playCheckmark?.();
        haptics.success?.();
        setEntries(prev => [...prev, { amount, currency, category: category || cats[0], note }]);
        setAmount('');
        setNote('');
        setCategory('');
      } catch (e) {
        console.error(e);
      }
      setSaving(false);
    };

    return (
      <div className="space-y-3 py-1">
        <p className="text-xs font-bold text-slate-200 leading-relaxed">
          {isRtl ? step.questionFa : step.questionEn}
        </p>
        <div className="p-4 rounded-2xl bg-black/20 border border-[var(--border)] space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder={isRtl ? 'مبلغ...' : 'Amount...'}
              className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-emerald-400"
            />
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="px-2 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none"
            >
              {(step.currencies || ['تومان']).map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none"
          >
            <option value="">{isRtl ? '— دسته‌بندی —' : '— Category —'}</option>
            {cats.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={isRtl ? 'یادداشت اختیاری...' : 'Optional note...'}
            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-emerald-400"
          />
          <button
            onClick={handleSave}
            disabled={!amount || saving}
            className={`w-full py-2 rounded-xl font-bold text-xs text-white transition-all disabled:opacity-40 ${
              isIncome ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
            }`}
          >
            {saving
              ? '...'
              : isRtl
              ? isIncome
                ? '+ ثبت درآمد (+10 XP)'
                : '+ ثبت هزینه (+10 XP)'
              : isIncome
              ? '+ Log Income (+10 XP)'
              : '+ Log Expense (+10 XP)'}
          </button>
        </div>
        {entries.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] text-[var(--text-secondary)] font-bold">
              {isRtl ? 'ثبت‌شده‌های این جلسه:' : 'Logged this session:'}
            </p>
            {entries.map((e, i) => (
              <div
                key={i}
                className={`flex justify-between items-center px-3 py-1.5 rounded-xl text-[10px] font-bold ${
                  isIncome ? 'bg-emerald-900/20 text-emerald-300' : 'bg-rose-900/20 text-rose-300'
                }`}
              >
                <span>{e.category}</span>
                <span>
                  {isIncome ? '+' : '-'}
                  {e.amount} {e.currency}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (step.type === 'wealth_education') {
    const lessons = step.lessons || [];
    const todayIdx = new Date().getDay() % lessons.length;
    const lesson = lessons[todayIdx];
    const [showAll, setShowAll] = useState(false);
    if (!lesson) return null;
    return (
      <div className="space-y-3 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{lesson.icon}</span>
            <div>
              <p className="text-[10px] text-amber-400 font-bold">{isRtl ? 'کتاب امروز:' : "Today's Book:"}</p>
              <p className="text-[10px] text-slate-300 font-bold">{isRtl ? lesson.bookFa : lesson.bookEn}</p>
            </div>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-300 border border-amber-700/30">
            {todayIdx + 1}/{lessons.length}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-amber-900/10 border border-amber-500/20">
          <p className="text-xs font-black text-amber-300 mb-2">{isRtl ? lesson.principleNameFa : lesson.principleNameEn}</p>
          <p className={`text-[10px] text-slate-200 leading-relaxed whitespace-pre-line ${showAll ? '' : 'line-clamp-6'}`}>
            {isRtl ? lesson.contentFa : lesson.contentEn}
          </p>
          <button onClick={() => setShowAll(!showAll)} className="text-[9px] text-amber-400 font-bold mt-1">
            {showAll ? (isRtl ? '▲ کمتر' : '▲ Less') : (isRtl ? '▼ بیشتر بخوان' : '▼ Read More')}
          </button>
        </div>
        <div className="p-2.5 rounded-xl bg-green-900/20 border border-green-500/20 text-[10px] font-bold text-green-300">
          {isRtl ? lesson.actionFa : lesson.actionEn}
        </div>
      </div>
    );
  }

  if (step.type === 'financial_goal') {
    const [goalText, setGoalText] = useState('');
    const [selectedTimeline, setSelectedTimeline] = useState('');
    const [saved, setSaved] = useState(false);
    const timelines = isRtl ? step.timelineOptions?.fa || [] : step.timelineOptions?.en || [];
    const examples = isRtl ? step.examplesFa || [] : step.examplesEn || [];

    const handleSave = async () => {
      if (!goalText.trim() || saved) return;
      await onJournalSave?.(
        `${isRtl ? 'هدف مالی' : 'Financial Goal'} [${selectedTimeline}]: ${goalText}`,
        { ...step, xpReward: 25, sectionId: 'wealth' }
      );
      setSaved(true);
      soundEngine.playLevelUp?.();
      haptics.success?.();
    };

    return (
      <div className="space-y-3 py-1">
        <p className="text-xs font-bold text-yellow-200 leading-relaxed">{isRtl ? step.questionFa : step.questionEn}</p>
        {examples.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => setGoalText(goalText ? goalText + '\n' + ex : ex)}
                className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-900/20 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-900/40"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {timelines.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTimeline(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTimeline === t
                  ? 'bg-yellow-600 text-white'
                  : 'bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          value={goalText}
          onChange={e => setGoalText(e.target.value)}
          placeholder={isRtl ? step.placeholderFa : step.placeholderEn}
          className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-yellow-400 resize-none"
        />
        <button
          onClick={handleSave}
          disabled={!goalText.trim() || saved}
          className="w-full py-2 rounded-xl bg-yellow-600 text-white font-bold text-xs hover:bg-yellow-500 disabled:opacity-40 transition-all"
        >
          {saved
            ? isRtl
              ? 'هدف ثبت شد 🏆 (+25 XP)'
              : 'Goal Saved 🏆 (+25 XP)'
            : isRtl
            ? 'ثبت هدف مالی (+25 XP)'
            : 'Save Financial Goal (+25 XP)'}
        </button>
      </div>
    );
  }

  // ── LANGUAGE LEARNING STEP RENDERERS ──
  if (step.type === 'language_setup') {
    const activeOption = LANGUAGE_OPTIONS.find(l => l.id === (learningLangState || 'en')) || LANGUAGE_OPTIONS[0];

    return (
      <div className="space-y-4 py-2">
        <div className="text-center space-y-1">
          <span className="text-xs font-black text-sky-400 uppercase tracking-wider">
            {isRtl ? 'انتخاب زبان مقصد برای مکالمه و گفت‌وگو' : 'Choose Target Language'}
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isRtl
              ? 'زبان مورد نظرتان را انتخاب کنید. تمام تلفظ‌های صوتی، جملات احوالپرسی و مکالمات بلافاصله بر اساس این زبان تنظیم می‌شوند:'
              : 'Select your target language. Greetings, audio pronunciations, and dialogues will adapt instantly:'}
          </p>
        </div>

        {/* 3 Language Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LANGUAGE_OPTIONS.map(lang => {
            const isSelected = (learningLangState || 'en') === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  setLearningLangState?.(lang.id);
                  localStorage.setItem('lifeos_learning_lang', lang.id);
                  soundEngine.playTap?.();
                  haptics.tap?.();
                  speakLanguagePhrase(
                    lang.id === 'en' ? "Welcome! Let's practice English conversation." :
                    lang.id === 'fr' ? "Bienvenue ! Apprenons le français ensemble." :
                    "ようこそ！一緒に日本語を話しましょう。",
                    lang.ttsCode
                  );
                }}
                className={`p-4 rounded-3xl border text-start flex flex-col justify-between gap-3 transition-all relative overflow-hidden group ${
                  isSelected
                    ? `bg-gradient-to-br ${lang.color} border-sky-400 ring-2 ring-sky-400/50 shadow-xl scale-[1.02]`
                    : 'bg-[var(--bg-card)] border-[var(--border)] opacity-70 hover:opacity-100 hover:border-sky-500/40'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2.5 end-2.5 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[9px] font-black border border-sky-500/40">
                    {isRtl ? '✓ زبان فعال' : '✓ Active'}
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl drop-shadow-md">{lang.flag}</span>
                  <div>
                    <h4 className="font-black text-sm text-[var(--text-primary)]">{isRtl ? lang.nameFa : lang.nameEn}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{lang.ttsCode}</span>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                  {isRtl ? lang.descFa : lang.descEn}
                </p>

                <div className="flex items-center justify-between pt-1 text-[10px] font-bold text-sky-400">
                  <span>{isRtl ? 'انتخاب و تست صوت' : 'Select & Audio'}</span>
                  <Volume2 size={13} className="group-hover:scale-110 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Cultural Etiquette Insight Card */}
        <div className="p-4 rounded-3xl border border-sky-500/30 bg-sky-950/20 glass-card space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-sky-300 text-xs font-black">
            <Sparkles size={15} />
            <span>{isRtl ? `ظرافت فرهنگی و آداب معاشرت در زبان ${activeOption.nameFa}` : `Cultural Etiquette in ${activeOption.nameEn}`}</span>
          </div>
          <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
            {isRtl ? activeOption.cultureTipFa : activeOption.cultureTipEn}
          </p>
        </div>
      </div>
    );
  }

  if (step.type === 'language_greetings') {
    const activeOption = LANGUAGE_OPTIONS.find(l => l.id === (learningLangState || 'en')) || LANGUAGE_OPTIONS[0];
    const [playingId, setPlayingId] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [greetingBatch, setGreetingBatch] = useState(0);

    const ITEMS_PER_BATCH = 5;
    const totalGreetings = activeOption.greetings.length;
    const totalBatches = Math.ceil(totalGreetings / ITEMS_PER_BATCH);
    const currentBatchIdx = greetingBatch % Math.max(1, totalBatches);
    const displayedGreetings = activeOption.greetings.slice(
      currentBatchIdx * ITEMS_PER_BATCH,
      currentBatchIdx * ITEMS_PER_BATCH + ITEMS_PER_BATCH
    );

    const handlePlay = (item) => {
      setPlayingId(item.id);
      speakLanguagePhrase(item.phrase, activeOption.ttsCode);
      setTimeout(() => setPlayingId(null), 2500);
    };

    const handleCopy = (item) => {
      navigator.clipboard?.writeText(item.phrase);
      setCopiedId(item.id);
      soundEngine.playTap?.();
      setTimeout(() => setCopiedId(null), 2000);
    };

    return (
      <div className="space-y-3.5 py-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{activeOption.flag}</span>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                {isRtl ? `زرادخانه احوالپرسی و خوش‌وبش (${activeOption.nameFa})` : `Greetings Arsenal (${activeOption.nameEn})`}
              </h3>
              <span className="text-[10px] text-slate-400">
                {isRtl ? `نمایش ${displayedGreetings.length} عبارت از مجموع ${totalGreetings} عبارت بانک محتوا:` : `Showing ${displayedGreetings.length} of ${totalGreetings} phrases:`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={() => {
                setGreetingBatch(b => b + 1);
                soundEngine.playTap?.();
                haptics.tap?.();
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black hover:bg-amber-500/30 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <RotateCcw size={12} />
              <span>{isRtl ? `🔄 عبارات تازه (${currentBatchIdx + 1}/${totalBatches})` : `🔄 Next Batch (${currentBatchIdx + 1}/${totalBatches})`}</span>
            </button>

            <button
              onClick={() => {
                displayedGreetings.forEach((g, idx) => {
                  setTimeout(() => speakLanguagePhrase(g.phrase, activeOption.ttsCode), idx * 3000);
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-black hover:bg-sky-500/30 flex items-center gap-1"
            >
              <Volume2 size={12} />
              <span>{isRtl ? 'پخش همه' : 'Play All'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {displayedGreetings.map(g => {
            const isSaved = (learningVault || []).some(v => v.id === g.id || v.phrase === g.phrase);

            return (
              <div
                key={g.id}
                className="p-4 rounded-3xl border border-[var(--border)] glass-card bg-[var(--bg-card)]/80 hover:border-sky-500/40 transition-all flex flex-col gap-2.5 shadow-sm relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 text-[10px] font-black border border-sky-500/30">
                    {isRtl ? g.categoryFa : g.categoryEn}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Vault Bookmark Button */}
                    <button
                      onClick={() => onToggleVault?.({
                        id: g.id,
                        phrase: g.phrase,
                        phoneticFa: g.phoneticFa,
                        meaningFa: g.meaningFa,
                        meaningEn: g.meaningEn,
                        categoryFa: g.categoryFa,
                        categoryEn: g.categoryEn,
                        contextFa: g.contextFa,
                        lang: activeOption.id,
                        flag: activeOption.flag,
                        ttsCode: activeOption.ttsCode,
                        type: 'greeting'
                      })}
                      className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                        isSaved
                          ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                          : 'bg-[var(--bg-secondary)] border-[var(--border)] text-slate-400 hover:text-amber-300 hover:border-amber-500/40'
                      }`}
                      title={isSaved ? (isRtl ? 'در گنجینه ذخیره است' : 'In Vault') : (isRtl ? 'افزودن به گنجینه آموزش' : 'Save to Vault')}
                    >
                      <Bookmark size={13} className={isSaved ? 'fill-amber-400 text-amber-400' : ''} />
                      <span className="text-[10px]">{isSaved ? (isRtl ? 'در گنجینه ✓' : 'Saved') : (isRtl ? 'گنجینه 💎' : 'Vault')}</span>
                    </button>

                    <button
                      onClick={() => handleCopy(g)}
                      className="p-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      title={isRtl ? 'کپی متن' : 'Copy'}
                    >
                      {copiedId === g.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>

                    <button
                      onClick={() => handlePlay(g)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                        playingId === g.id
                          ? 'bg-emerald-600 text-white animate-pulse'
                          : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white'
                      }`}
                    >
                      <Volume2 size={14} />
                      <span>{playingId === g.id ? (isRtl ? 'در حال پخش...' : 'Playing...') : (isRtl ? 'تلفظ' : 'Listen')}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-sm sm:text-base font-black text-[var(--text-primary)] tracking-wide" dir="ltr">
                    {g.phrase}
                  </div>
                  <div className="text-[11px] text-amber-300 font-medium mt-0.5">
                    🗣️ تلفظ: <span className="font-mono">{g.phoneticFa}</span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-[var(--border)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                  <span className="font-bold text-emerald-400">
                    💡 معنی: {isRtl ? g.meaningFa : g.meaningEn}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    📌 کاربرد: {isRtl ? g.contextFa : g.contextEn}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (step.type === 'language_dialogue') {
    const activeOption = LANGUAGE_OPTIONS.find(l => l.id === (learningLangState || 'en')) || LANGUAGE_OPTIONS[0];
    const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
    const activeDialogue = activeOption.dialogues[selectedScenarioIdx] || activeOption.dialogues[0];
    const [speakingLineIdx, setSpeakingLineIdx] = useState(null);

    const isDialogueSaved = (learningVault || []).some(v => v.id === activeDialogue.id);

    const playSingleLine = (line, idx) => {
      setSpeakingLineIdx(idx);
      speakLanguagePhrase(line.text, activeOption.ttsCode);
      setTimeout(() => setSpeakingLineIdx(null), 3000);
    };

    const playFullDialogue = () => {
      activeDialogue.lines.forEach((line, idx) => {
        setTimeout(() => {
          setSpeakingLineIdx(idx);
          speakLanguagePhrase(line.text, activeOption.ttsCode);
          if (idx === activeDialogue.lines.length - 1) {
            setTimeout(() => setSpeakingLineIdx(null), 3000);
          }
        }, idx * 3500);
      });
    };

    return (
      <div className="space-y-4 py-1">
        {/* Scenario Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {activeOption.dialogues.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedScenarioIdx(idx);
                soundEngine.playTap?.();
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedScenarioIdx === idx
                  ? 'bg-sky-600 border-sky-400 text-white shadow-md'
                  : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isRtl ? d.titleFa : d.titleEn}
            </button>
          ))}
        </div>

        {/* Scenario Header, Vault Save & Full Playback */}
        <div className="p-3.5 rounded-2xl bg-sky-950/20 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-start">
          <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
            🎯 {isRtl ? activeDialogue.scenarioFa : activeDialogue.titleEn}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleVault?.({
                id: activeDialogue.id,
                phrase: isRtl ? activeDialogue.titleFa : activeDialogue.titleEn,
                meaningFa: activeDialogue.scenarioFa,
                meaningEn: activeDialogue.titleEn,
                categoryFa: 'مکالمه کاربردی',
                categoryEn: 'Dialogue Scenario',
                lang: activeOption.id,
                flag: activeOption.flag,
                ttsCode: activeOption.ttsCode,
                type: 'dialogue'
              })}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isDialogueSaved
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-white/10 border-white/15 text-slate-300 hover:text-amber-300 hover:border-amber-400'
              }`}
            >
              <Bookmark size={13} className={isDialogueSaved ? 'fill-amber-400 text-amber-400' : ''} />
              <span className="text-[11px]">{isDialogueSaved ? (isRtl ? 'در گنجینه ✓' : 'Saved') : (isRtl ? 'ذخیره مکالمه 💎' : 'Save Dialogue')}</span>
            </button>

            <button
              onClick={playFullDialogue}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-black text-xs shadow-md hover:opacity-90 flex items-center gap-1.5 shrink-0"
            >
              <Play size={13} fill="currentColor" />
              <span>{isRtl ? 'پخش کل مکالمه' : 'Play Full'}</span>
            </button>
          </div>
        </div>

        {/* Chat Bubbles */}
        <div className="space-y-3 pt-1">
          {activeDialogue.lines.map((line, idx) => {
            const isSpeakerB = line.speaker.includes('You') || line.speaker.includes('Vous') || line.speaker.includes('あなた');
            const isPlaying = speakingLineIdx === idx;

            return (
              <div
                key={idx}
                className={`flex flex-col ${isSpeakerB ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-black text-slate-400">
                  <span>{line.speaker}</span>
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-3xl border transition-all shadow-sm ${
                    isSpeakerB
                      ? 'bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border-indigo-500/40 text-end rounded-te-xs'
                      : 'bg-[var(--bg-card)] border-[var(--border)] text-start rounded-ts-xs'
                  } ${isPlaying ? 'ring-2 ring-sky-400 scale-[1.02] shadow-lg' : ''}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <button
                      onClick={() => playSingleLine(line, idx)}
                      className={`p-1.5 rounded-xl transition-all ${
                        isPlaying
                          ? 'bg-emerald-500 text-white'
                          : 'bg-[var(--bg-secondary)] hover:bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      }`}
                      title={isRtl ? 'تلفظ این جمله' : 'Pronounce line'}
                    >
                      <Volume2 size={13} />
                    </button>
                    <span className="text-[10px] font-mono text-slate-400">#0{idx + 1}</span>
                  </div>

                  <div className="text-xs sm:text-sm font-black text-[var(--text-primary)] tracking-wide leading-relaxed" dir="ltr">
                    {line.text}
                  </div>

                  <div className="text-[11px] text-emerald-400 font-medium mt-1 pt-1 border-t border-white/5" dir={isRtl ? 'rtl' : 'ltr'}>
                    {line.fa}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (step.type === 'language_idioms') {
    const activeOption = LANGUAGE_OPTIONS.find(l => l.id === (learningLangState || 'en')) || LANGUAGE_OPTIONS[0];
    const [selectedQuizIdx, setSelectedQuizIdx] = useState(null);
    const [quizAnswered, setQuizAnswered] = useState(false);

    const handleQuizOption = (opt, idx) => {
      setSelectedQuizIdx(idx);
      setQuizAnswered(true);
      if (opt.correct) {
        soundEngine.playLevelUp?.();
        haptics.success?.();
      } else {
        soundEngine.playTap?.();
        haptics.warning?.();
      }
    };

    return (
      <div className="space-y-4 py-1">
        {/* Idioms List */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 px-1">
            <Sparkles size={14} />
            <span>{isRtl ? `اصطلاحات طلایی و پرکاربرد زبان (${activeOption.nameFa})` : `Golden Idioms (${activeOption.nameEn})`}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeOption.idioms.map((item, idx) => {
              const isSaved = (learningVault || []).some(v => v.phrase === item.phrase);

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-amber-500/30 glass-card bg-amber-950/15 flex flex-col justify-between gap-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wide" dir="ltr">
                      {item.phrase}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleVault?.({
                          id: `idiom_${activeOption.id}_${idx}`,
                          phrase: item.phrase,
                          meaningFa: item.meaningFa,
                          meaningEn: item.example,
                          categoryFa: 'اصطلاح طلایی',
                          categoryEn: 'Golden Idiom',
                          lang: activeOption.id,
                          flag: activeOption.flag,
                          ttsCode: activeOption.ttsCode,
                          type: 'idiom'
                        })}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          isSaved ? 'bg-amber-500/30 border-amber-400 text-amber-300' : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                        }`}
                        title={isSaved ? (isRtl ? 'در گنجینه ذخیره است' : 'In Vault') : (isRtl ? 'افزودن به گنجینه' : 'Save to Vault')}
                      >
                        <Bookmark size={12} className={isSaved ? 'fill-amber-400' : ''} />
                      </button>
                      <button
                        onClick={() => speakLanguagePhrase(item.phrase, activeOption.ttsCode)}
                        className="p-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors"
                      >
                        <Volume2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                    {item.meaningFa}
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono italic" dir="ltr">
                    "{item.example}"
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mini Quiz */}
        <div className="p-4 rounded-3xl border border-indigo-500/40 glass-card bg-indigo-950/20 space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-black">
            <HelpCircle size={15} />
            <span>{isRtl ? 'آزمون سریع تثبیت یادگیری' : 'Quick Mastery Check'}</span>
          </div>

          <p className="text-xs font-bold text-[var(--text-primary)] leading-relaxed">
            {isRtl ? activeOption.quiz.questionFa : activeOption.quiz.questionEn}
          </p>

          <div className="space-y-2">
            {activeOption.quiz.options.map((opt, idx) => {
              const isSelected = selectedQuizIdx === idx;
              let btnStyle = 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-primary)] hover:border-indigo-400';
              if (quizAnswered && isSelected) {
                btnStyle = opt.correct ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300' : 'bg-rose-600/30 border-rose-500 text-rose-300';
              } else if (quizAnswered && opt.correct) {
                btnStyle = 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleQuizOption(opt, idx)}
                  className={`w-full p-3 rounded-2xl border text-start text-xs font-bold transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                >
                  <span dir="ltr">{opt.text}</span>
                  {quizAnswered && (
                    <span>{opt.correct ? '✓' : '✗'}</span>
                  )}
                </button>
              );
            })}
          </div>

          {quizAnswered && (
            <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 text-[11px] text-slate-200">
              💡 {activeOption.quiz.options[selectedQuizIdx]?.feedbackFa || ''}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step.type === 'language_practice') {
    const activeOption = LANGUAGE_OPTIONS.find(l => l.id === (learningLangState || 'en')) || LANGUAGE_OPTIONS[0];
    const [practiceSaved, setPracticeSaved] = useState(false);
    const [shadowCount, setShadowCount] = useState(0);
    const [practiceNote, setPracticeNote] = useState('');

    const shadowSentence = activeOption.greetings[0]?.phrase || "How's everything going?";

    const handleSavePractice = async () => {
      if (practiceSaved) return;
      await onJournalSave?.(
        `${isRtl ? 'یادگیری زبان' : 'Language Practice'} [${activeOption.nameEn}]: ${practiceNote || shadowSentence}`,
        { ...step, xpReward: 80, sectionId: 'learning' }
      );
      setPracticeSaved(true);
      soundEngine.playLevelUp?.();
      haptics.success?.();
    };

    return (
      <div className="space-y-4 py-1">
        {/* Shadowing Challenge Card */}
        <div className="p-4 rounded-3xl border border-emerald-500/40 glass-card bg-emerald-950/20 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-black">
              <Mic size={16} />
              <span>{isRtl ? 'چالش تکنیک سایه (Shadowing) با صدای بلند' : 'Vocal Shadowing Challenge'}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
              {shadowCount}/5 {isRtl ? 'تکرار' : 'reps'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 text-center space-y-2">
            <div className="text-base sm:text-lg font-black text-white tracking-wide" dir="ltr">
              "{shadowSentence}"
            </div>
            <div className="text-xs text-emerald-300 font-medium">
              🗣️ {activeOption.greetings[0]?.phoneticFa}
            </div>
            <button
              onClick={() => {
                speakLanguagePhrase(shadowSentence, activeOption.ttsCode);
                setShadowCount(c => Math.min(5, c + 1));
                soundEngine.playCheckmark?.();
                haptics.tap?.();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-sm flex items-center gap-1.5 mx-auto"
            >
              <Volume2 size={14} />
              <span>{isRtl ? 'گوش دادن و تکرار بلند 🎙️' : 'Listen & Shadow'}</span>
            </button>
          </div>
        </div>

        {/* Fluency Note / Log */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-primary)] block">
            {isRtl ? '📝 واژه یا اصطلاحی که امروز یاد گرفتی را اینجا بنویس:' : 'Log your favorite new phrase or sentence:'}
          </label>
          <textarea
            rows={2}
            value={practiceNote}
            onChange={e => setPracticeNote(e.target.value)}
            placeholder={isRtl ? 'مثال: اصطلاح Break the ice یا جمله احوالپرسی ژاپنی...' : 'e.g. C\'est la vie or Japanese greeting...'}
            className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-emerald-400 resize-none shadow-inner"
          />
        </div>

        <button
          onClick={handleSavePractice}
          disabled={practiceSaved}
          className={`w-full py-3 rounded-2xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 ${
            practiceSaved
              ? 'bg-emerald-600 text-white'
              : 'bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-600 hover:opacity-95 active:scale-98 text-white'
          }`}
        >
          {practiceSaved ? (
            <>
              <CheckCheck size={16} />
              <span>{isRtl ? 'پیشرفت زبان با موفقیت ثبت شد 🏆 (+80 XP و +35 سکه)' : 'Language Practice Completed! (+80 XP)'}</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>{isRtl ? 'ثبت و تکمیل یادگیری امروز (+80 XP و +35 سکه 🪙)' : 'Save & Claim +80 XP (+35 Coins)'}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────
//  MAIN STROLL COMPONENT
// ─────────────────────────────────────────────
export default function Stroll() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pinnedStrollIds = useAppStore(state => state.pinnedStrollIds) || [];
  const togglePinStroll = useAppStore(state => state.togglePinStroll);
  const learningVault = useAppStore(state => state.learningVault) || [];
  const toggleVaultItem = useAppStore(state => state.toggleVaultItem);
  const { language, addXP, addCoins, myDayModules } = useAppStore();
  const { addJournalEntry, addGratitude, habits, todayLogs, toggleHabit, loadHabits } = useSectionsStore();
  const isRtl = language === 'fa';

  const [learningLang, setLearningLang] = useState(() => {
    return localStorage.getItem('lifeos_learning_lang') || 'en';
  });

  const [localPinnedIds, setLocalPinnedIds] = useState(pinnedStrollIds);
  const [localVault, setLocalVault] = useState(learningVault);
  const [toast, setToast] = useState({ show: false, msg: '', isAdded: true });

  useEffect(() => {
    setLocalPinnedIds(pinnedStrollIds);
  }, [pinnedStrollIds]);

  useEffect(() => {
    setLocalVault(learningVault);
  }, [learningVault]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail) setLocalPinnedIds(e.detail);
    };
    const vaultHandler = (e) => {
      if (e.detail) setLocalVault(e.detail);
    };
    window.addEventListener('lifeos_pinned_strolls_updated', handler);
    window.addEventListener('lifeos_learning_vault_updated', vaultHandler);
    return () => {
      window.removeEventListener('lifeos_pinned_strolls_updated', handler);
      window.removeEventListener('lifeos_learning_vault_updated', vaultHandler);
    };
  }, []);

  const handleToggleVault = (item) => {
    const isAdded = toggleVaultItem(item);
    const latestVault = useAppStore.getState().learningVault || [];
    setLocalVault([...latestVault]);
    setToast({
      show: true,
      msg: isAdded
        ? (isRtl ? '💎 به گنجینه یادگیری اضافه شد (در بخش امروز من قابل مشاهده است)!' : '💎 Added to Learning Vault (viewable in My Day)!')
        : (isRtl ? 'از گنجینه یادگیری حذف شد.' : 'Removed from Learning Vault.'),
      isAdded
    });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleTogglePin = (path) => {
    const updated = togglePinStroll(path.id);
    if (updated) setLocalPinnedIds(updated);
    const isNowPinned = (updated || []).includes(path.id);
    setToast({
      show: true,
      msg: isNowPinned 
        ? (isRtl ? `«${path.titleFa}» با موفقیت به امروز من اضافه شد!` : `"${path.titleEn}" added to My Day!`)
        : (isRtl ? `«${path.titleFa}» از امروز من حذف شد.` : `"${path.titleEn}" removed from My Day.`),
      isAdded: isNowPinned
    });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const [selectedPath, setSelectedPath] = useState(null);
  const [activeSteps, setActiveSteps] = useState([]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [intentionText, setIntentionText] = useState('');

  // Aerobic custom workout state
  const [aerobicState, setAerobicState] = useState({
    level: 'gentle',
    duration: 15
  });

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [strollSearch, setStrollSearch] = useState('');

  useEffect(() => {
    loadHabits('all');
  }, []);

  const autoId = searchParams.get('id');
  useEffect(() => {
    if (autoId && !selectedPath) {
      const p = STROLL_PATHS.find(x => x.id === autoId);
      if (p) {
        startPath(p);
      }
    }
  }, [autoId]);

  const startPath = useCallback(
    path => {
      // Inject daily habits between steps for habit reinforcement
      const activeSet = new Set(
        myDayModules || ['mindfulness', 'health', 'wealth', 'selfDiscovery', 'learning', 'integrity']
      );
      const incompleteHabits = habits.filter(h => activeSet.has(h.sectionId) && !todayLogs[h.id]).slice(0, 2);
      let steps = [...path.steps];
      incompleteHabits.forEach((habit, idx) => {
        const pos = Math.min(2 + idx * 2, steps.length);
        steps.splice(pos, 0, {
          id: 'habit_' + habit.id,
          isCustomHabit: true,
          habitData: habit,
          titleFa: `هدف روزانه: ${habit.nameFa || habit.name}`,
          titleEn: `Daily Goal: ${habit.nameEn || habit.name}`,
          icon: habit.icon || '🎯',
          color: 'from-emerald-600/20 via-[var(--bg-card)] to-transparent border-emerald-500/40'
        });
      });
      setActiveSteps(steps);
      setSelectedPath(path);
      setCurrentStepIdx(0);
      setIsCompleted(false);
      soundEngine.playTap?.();
    },
    [habits, myDayModules, todayLogs]
  );

  const currentStep = activeSteps[currentStepIdx] || activeSteps[0];
  const progressPercent = activeSteps.length > 0 ? Math.round(((currentStepIdx + 1) / activeSteps.length) * 100) : 0;

  const handleNext = () => {
    soundEngine.playCheckmark?.();
    haptics.tap?.();
    if (currentStepIdx < activeSteps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    haptics.tap?.();
    if (currentStepIdx > 0) setCurrentStepIdx(currentStepIdx - 1);
  };

  const handleComplete = async () => {
    soundEngine.playLevelUp?.();
    haptics.success?.();
    addXP(selectedPath.xpReward, isRtl ? selectedPath.titleFa : selectedPath.titleEn);
    addCoins(selectedPath.coinsReward);
    if (intentionText.trim()) await addGratitude([intentionText.trim(), '', '']);
    setIsCompleted(true);
  };

  const handleJournalSave = async (text, step) => {
    await addJournalEntry({
      title: isRtl ? step.titleFa : step.titleEn,
      content: text,
      mood: 'reflective',
      tags: step.sectionId || 'stroll',
      sectionId: step.sectionId || 'selfDiscovery'
    });
    addXP(step.xpReward || 10, isRtl ? step.titleFa : step.titleEn);
  };

  // ── PATH PICKER ──
  if (!selectedPath) {
    return (
      <div className="page-container flex flex-col gap-5 pb-24 max-w-3xl mx-auto">
        {/* Header */}
        <div className="p-6 rounded-3xl glass-card border border-[var(--border)] bg-gradient-to-br from-purple-950/30 via-[var(--bg-card)] to-teal-950/20 shadow-lg flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-xs mb-2">
              <span>🛤️</span>
              <span>{isRtl ? 'راه‌روهای رشد و تکامل روزمره' : 'Stroll Gateways of Growth'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              {isRtl ? 'انتخاب راه‌روی روزانه' : 'Choose Your Stroll Realm'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
              {isRtl
                ? 'محتوای تمام راه‌روها روزانه به صورت هوشمند و بدون تکرار به‌روزرسانی می‌شود. هر روز یک سفر ۵ تا ۸ گامی متمرکز برای تحول ذهن، ثروت و جسم شماست.'
                : 'Content dynamically rotates daily for non-repetitive wisdom. A 5-8 step immersive stroll to elevate your mind, wealth & body.'}
            </p>
          </div>
          
          <Link
            to="/history?section=stroll"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)] text-xs font-bold transition-all shrink-0"
          >
            <Archive size={16} />
            <span>{isRtl ? 'تاریخچه من' : 'My History'}</span>
          </Link>
        </div>
        
        {/* Supreme Celestial Realm - GOD Hero Card */}
        <GodHeroCard
          isRtl={isRtl}
          isPinned={(localPinnedIds || []).includes('god')}
          onTogglePin={() => {
            const godPath = STROLL_PATHS.find(p => p.id === 'god');
            if (godPath) handleTogglePin(godPath);
          }}
          onEnter={() => {
            const godPath = STROLL_PATHS.find(p => p.id === 'god');
            if (godPath) startPath(godPath);
          }}
        />

        {/* Games Banner */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/games')}
          className="relative p-5 sm:p-6 mb-2 rounded-3xl cursor-pointer overflow-hidden group shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-purple-800 opacity-90"></div>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span className="text-3xl">🎮</span>
                {isRtl ? 'بازی‌های راه‌رو (سرگرمی و شادی)' : 'Stroll Games & Entertainment'}
              </h2>
              <p className="text-sm text-fuchsia-100">
                {isRtl ? 'ورود به دنیای بازی‌های استراتژیک، حافظه و هیجان با گرافیک نئونی.' : 'Enter the realm of strategy, memory, and arcade fun.'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm group-hover:bg-white/30 transition-colors">
              <ArrowRight className={`text-white w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </motion.div>

        {/* Category Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 flex-1">
            {[
              { id: 'all', fa: `✨ همه (${STROLL_PATHS.length})`, en: `✨ All (${STROLL_PATHS.length})` },
              { id: 'divine', fa: '☀️ خدا و معنویت', en: '☀️ God & Spirit' },
              { id: 'lang', fa: '🗣️ یادگیری زبان', en: '🗣️ Languages' },
              { id: 'mind', fa: '🧘 ذهن و یادگیری', en: '🧘 Mind' },
              { id: 'wealth', fa: '💰 ثروت و رهبری', en: '💰 Wealth' },
              { id: 'self', fa: '🪞 خودشناسی و روابط', en: '🪞 Self' },
              { id: 'body', fa: '⚡ جسم و پاکی', en: '⚡ Body' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  categoryFilter === cat.id
                    ? 'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {isRtl ? cat.fa : cat.en}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={strollSearch}
              onChange={e => setStrollSearch(e.target.value)}
              placeholder={isRtl ? 'جستجوی راه‌رو...' : 'Search realms...'}
              className="w-full sm:w-44 px-3 py-1.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-amber-500 shadow-sm"
            />
          </div>
        </div>

        {/* Path Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {STROLL_PATHS.filter(path => {
            const matchesCat = 
              categoryFilter === 'all' ||
              (categoryFilter === 'divine' && path.id === 'god') ||
              (categoryFilter === 'lang' && path.id === 'language_learning') ||
              (categoryFilter === 'body' && ['cardio_aerobic', 'bio_vitality', 'dopamine_detox', 'night_sanctuary'].includes(path.id)) ||
              (categoryFilter === 'wealth' && ['wealth_mindset', 'strategic_leadership', 'entrepreneur_scale'].includes(path.id)) ||
              (categoryFilter === 'self' && ['self_discovery', 'relationships', 'charisma_speaking', 'mindful_parenting'].includes(path.id)) ||
              (categoryFilter === 'mind' && ['god', 'mindful', 'deep_learning', 'integrity_virtue', 'stoic_resilience', 'creative_flow', 'language_learning'].includes(path.id));

            if (!matchesCat) return false;
            if (strollSearch.trim()) {
              const q = strollSearch.toLowerCase();
              return (
                (path.titleFa || '').toLowerCase().includes(q) ||
                (path.titleEn || '').toLowerCase().includes(q) ||
                (path.descFa || '').toLowerCase().includes(q) ||
                (path.descEn || '').toLowerCase().includes(q)
              );
            }
            return true;
          }).map(path => {
            const isPinned = (localPinnedIds || []).includes(path.id);
            return (
              <motion.div
                key={path.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.99 }}
                className={`p-5 rounded-3xl border glass-card bg-gradient-to-br ${path.color} text-start flex flex-col justify-between gap-3.5 transition-all hover:shadow-2xl group relative`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{path.icon}</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-black">
                    <span className="px-2 py-0.5 rounded-full bg-black/30 text-slate-300 border border-white/10">
                      {path.steps.length} {isRtl ? 'گام' : 'steps'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-500/30">
                      +{path.xpReward} XP
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-sm text-[var(--text-primary)] mb-1">
                    {isRtl ? path.titleFa : path.titleEn}
                  </h3>
                  <p className="text-[11px] text-slate-300 dark:text-slate-300 text-slate-700 leading-relaxed font-medium">
                    {isRtl ? path.descFa : path.descEn}
                  </p>
                </div>

                {/* Actions: Add to My Day & Enter Stroll */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(path);
                    }}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs border shrink-0 ${
                      isPinned 
                        ? 'bg-emerald-500/25 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                        : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-purple-600 hover:border-purple-500/50'
                    }`}
                    title={isPinned ? (isRtl ? 'حذف از امروز من' : 'Remove from My Day') : (isRtl ? 'افزودن به امروز من' : 'Add to My Day')}
                  >
                    {isPinned ? (
                      <>
                        <Check size={14} className="text-emerald-500" />
                        <span className="hidden sm:inline">{isRtl ? 'در امروز من' : 'Added'}</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} className="text-purple-500" />
                        <span className="hidden sm:inline">{isRtl ? 'افزودن به امروز من' : 'To My Day'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => startPath(path)}
                    className={`flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r ${path.gradientFrom} ${path.gradientTo} text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md hover:opacity-95 active:scale-95 transition-all`}
                  >
                    <span>{isRtl ? 'ورود به راه‌رو' : 'Enter Stroll'}</span>
                    <ArrowRight size={13} className={isRtl ? 'rotate-180' : ''} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Floating Instant Feedback Toast */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 p-3 sm:p-4 rounded-3xl bg-[var(--bg-card)] border border-purple-500/50 shadow-2xl backdrop-blur-2xl flex items-center gap-3 max-w-sm sm:max-w-md w-[90%]"
            >
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-500 shrink-0">
                {toast.isAdded ? <Check size={18} /> : <Trash2 size={16} />}
              </div>
              <div className="flex-1 text-start">
                <span className="text-xs font-black text-[var(--text-primary)] block leading-tight">
                  {toast.msg}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {toast.isAdded ? (isRtl ? 'اکنون از تب «امروز من» در دسترس است' : 'Ready in My Day cockpit') : ''}
                </span>
              </div>
              {toast.isAdded && (
                <button
                  onClick={() => navigate('/my-day')}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-sm hover:opacity-90 shrink-0"
                >
                  {isRtl ? 'امروز من ➔' : 'View'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── ACTIVE STROLL RUNNER ──
  return (
    <div className="page-container flex flex-col gap-5 pb-24 max-w-3xl mx-auto">
      {/* Header + Progress */}
      <div className={`p-4 rounded-3xl border glass-card bg-gradient-to-br ${selectedPath.color}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedPath(null)}
              className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              <Home size={14} />
            </button>
            <div>
              <h1 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-1.5">
                <span>{selectedPath.icon}</span>
                <span>{isRtl ? selectedPath.titleFa : selectedPath.titleEn}</span>
              </h1>
              <p className="text-[10px] text-[var(--text-secondary)]">
                {isRtl
                  ? `گام ${currentStepIdx + 1} از ${activeSteps.length}`
                  : `Step ${currentStepIdx + 1} of ${activeSteps.length}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 hidden sm:flex">
            {activeSteps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentStepIdx(idx);
                  haptics.tap?.();
                }}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIdx
                    ? 'w-5 bg-white shadow-sm'
                    : idx < currentStepIdx
                    ? 'w-2 bg-emerald-400'
                    : 'w-2 bg-slate-600'
                }`}
                title={isRtl ? s.titleFa : s.titleEn}
              />
            ))}
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${selectedPath.gradientFrom} ${selectedPath.gradientTo}`}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Step Content */}
      {!isCompleted ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep?.id}
            initial={{ opacity: 0, x: isRtl ? 24 : -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRtl ? -24 : 24 }}
            transition={{ duration: 0.25 }}
            className={`p-6 sm:p-8 rounded-3xl border glass-card bg-gradient-to-br ${
              currentStep?.color || 'border-[var(--border)]'
            } shadow-xl space-y-5 min-h-[380px] flex flex-col justify-between`}
          >
            {/* Step Header */}
            <div className="flex items-center gap-2 text-xs font-black text-[var(--accent)]">
              <span className="text-xl">{currentStep?.icon}</span>
              <span>{isRtl ? currentStep?.titleFa : currentStep?.titleEn}</span>
            </div>

            {/* Custom Habit Step */}
            {currentStep?.isCustomHabit ? (
              <div className="space-y-4 py-4 text-center flex flex-col items-center justify-center flex-1">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-4xl border-2 border-emerald-500/40">
                  {currentStep.habitData.icon || '🎯'}
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {isRtl
                    ? currentStep.habitData.nameFa || currentStep.habitData.name
                    : currentStep.habitData.nameEn || currentStep.habitData.name}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isRtl ? 'انجام این کار را تأیید کنید' : 'Confirm completion of this habit'}
                </p>
                <button
                  onClick={() => {
                    toggleHabit(currentStep.habitData.id);
                    soundEngine.playCheckmark?.();
                    haptics.success?.();
                    addXP(
                      currentStep.habitData.xp || 15,
                      currentStep.habitData.nameFa || currentStep.habitData.name
                    );
                    addCoins(5);
                    handleNext();
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>{isRtl ? 'انجام شد، بعدی' : 'Done, Next'}</span>
                </button>
              </div>
            ) : (
              <div className="flex-1">
                <StepContent
                  step={currentStep}
                  isRtl={isRtl}
                  onJournalSave={handleJournalSave}
                  onIntentionChange={setIntentionText}
                  intentionValue={intentionText}
                  addXP={addXP}
                  aerobicState={aerobicState}
                  setAerobicState={setAerobicState}
                  learningLangState={learningLang}
                  setLearningLangState={setLearningLang}
                  learningVault={localVault}
                  onToggleVault={handleToggleVault}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
              <button
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="px-4 py-2 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition-all flex items-center gap-1"
              >
                <ChevronRight size={14} className={isRtl ? '' : 'rotate-180'} />
                <span>{isRtl ? 'قبلی' : 'Prev'}</span>
              </button>
              <button
                onClick={handleNext}
                className={`px-6 py-2.5 rounded-2xl bg-gradient-to-r ${selectedPath.gradientFrom} ${selectedPath.gradientTo} text-white font-bold text-xs shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5`}
              >
                <span>
                  {currentStepIdx === activeSteps.length - 1
                    ? isRtl
                      ? 'تکمیل مسیر 🏆'
                      : 'Complete Path 🏆'
                    : isRtl
                    ? 'گام بعدی'
                    : 'Next Step'}
                </span>
                <ChevronLeft size={14} className={isRtl ? '' : 'rotate-180'} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        /* Completion Celebration */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-3xl border border-emerald-500/50 glass-card bg-gradient-to-br from-emerald-950/40 via-[var(--bg-card)] to-teal-950/30 text-center space-y-5 shadow-2xl"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-5xl">
            👑
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-emerald-300">
              {isRtl ? 'مسیر با موفقیت تکمیل شد!' : 'Path Completed!'}
            </h2>
            <p className="text-xs text-slate-200 font-bold">
              {isRtl ? selectedPath.titleFa : selectedPath.titleEn}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {isRtl
                ? `شما این مسیر را با تعهد کامل پیمودید. +${selectedPath.xpReward} XP و +${selectedPath.coinsReward} سکه دریافت کردید.`
                : `You finished this path with full presence. You earned +${selectedPath.xpReward} XP and +${selectedPath.coinsReward} Coins.`}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setSelectedPath(null);
                setIsCompleted(false);
              }}
              className={`px-5 py-2.5 rounded-2xl bg-gradient-to-r ${selectedPath.gradientFrom} ${selectedPath.gradientTo} text-white font-bold text-xs`}
            >
              {isRtl ? 'انتخاب مسیر دیگر' : 'Choose Another Path'}
            </button>
            <Link
              to="/my-day"
              className="px-5 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-slate-200 font-bold text-xs"
            >
              {isRtl ? 'امروز من' : 'My Day'}
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
