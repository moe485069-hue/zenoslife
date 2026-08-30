import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../../store/appStore';

const EMOTIONS = [
  {
    id: 'joy',
    nameFa: 'شادی و نشاط',
    nameEn: 'Joy',
    color: '#fbbf24',
    icon: '✨',
    subs: [
      { id: 'serenity', nameFa: 'آرامش عمیق', nameEn: 'Serenity' },
      { id: 'optimism', nameFa: 'امیدواری', nameEn: 'Optimism' },
      { id: 'ecstasy', nameFa: 'وجد و شوق', nameEn: 'Ecstasy' }
    ]
  },
  {
    id: 'trust',
    nameFa: 'اعتماد و آرامش',
    nameEn: 'Trust',
    color: '#34d399',
    icon: '🤝',
    subs: [
      { id: 'acceptance', nameFa: 'پذیرش', nameEn: 'Acceptance' },
      { id: 'admiration', nameFa: 'تحسین و احترام', nameEn: 'Admiration' },
      { id: 'security', nameFa: 'احساس امنیت', nameEn: 'Security' }
    ]
  },
  {
    id: 'fear',
    nameFa: 'ترس و اضطراب',
    nameEn: 'Fear',
    color: '#a855f7',
    icon: '⚡',
    subs: [
      { id: 'apprehension', nameFa: 'نگرانی ملایم', nameEn: 'Apprehension' },
      { id: 'anxiety', nameFa: 'اضطراب و دلشوره', nameEn: 'Anxiety' },
      { id: 'terror', nameFa: 'وحشت و بهت', nameEn: 'Terror' }
    ]
  },
  {
    id: 'surprise',
    nameFa: 'شگفتی و تعجب',
    nameEn: 'Surprise',
    color: '#38bdf8',
    icon: '🌟',
    subs: [
      { id: 'distraction', nameFa: 'کنجکاوی', nameEn: 'Curiosity' },
      { id: 'amazement', nameFa: 'حیرت و شگفتی', nameEn: 'Amazement' },
      { id: 'awe', nameFa: 'هیبت و شکوه', nameEn: 'Awe' }
    ]
  },
  {
    id: 'sadness',
    nameFa: 'غم و دلتنگی',
    nameEn: 'Sadness',
    color: '#60a5fa',
    icon: '🌧️',
    subs: [
      { id: 'pensiveness', nameFa: 'تأمل و اندوه', nameEn: 'Pensiveness' },
      { id: 'grief', nameFa: 'سوگ و رنج', nameEn: 'Grief' },
      { id: 'loneliness', nameFa: 'تنهایی و غربت', nameEn: 'Loneliness' }
    ]
  },
  {
    id: 'disgust',
    nameFa: 'انزجار و دلزدگی',
    nameEn: 'Disgust',
    color: '#ec4899',
    icon: '🥀',
    subs: [
      { id: 'boredom', nameFa: 'کسالت و بی‌حوصلگی', nameEn: 'Boredom' },
      { id: 'loathing', nameFa: 'بیزاری و خستگی', nameEn: 'Aversion' },
      { id: 'disapproval', nameFa: 'نارضایتی', nameEn: 'Disapproval' }
    ]
  },
  {
    id: 'anger',
    nameFa: 'خشم و برآشفتگی',
    nameEn: 'Anger',
    color: '#f87171',
    icon: '🔥',
    subs: [
      { id: 'annoyance', nameFa: 'کلافگی و رنجش', nameEn: 'Annoyance' },
      { id: 'rage', nameFa: 'خشم شدید', nameEn: 'Rage' },
      { id: 'frustration', nameFa: 'ناکامی', nameEn: 'Frustration' }
    ]
  },
  {
    id: 'anticipation',
    nameFa: 'اشتیاق و انتظار',
    nameEn: 'Anticipation',
    color: '#fb923c',
    icon: '🚀',
    subs: [
      { id: 'interest', nameFa: 'علاقه‌مندی', nameEn: 'Interest' },
      { id: 'vigilance', nameFa: 'هوشیاری بالا', nameEn: 'Vigilance' },
      { id: 'enthusiasm', nameFa: 'شور و انگیزه', nameEn: 'Enthusiasm' }
    ]
  }
];

export default function EmotionWheel({ onSelect, selectedEmotion }) {
  const { language } = useAppStore();
  const isRtl = language === 'fa';
  const [activePrimary, setActivePrimary] = useState(EMOTIONS[0]);

  const handleSelectSub = (sub, parent) => {
    if (onSelect) {
      onSelect({
        primary: isRtl ? parent.nameFa : parent.nameEn,
        sub: isRtl ? sub.nameFa : sub.nameEn,
        color: parent.color,
        icon: parent.icon
      });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Primary Emotion Grid / Circular Selection */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {EMOTIONS.map((emotion) => {
          const isSelected = activePrimary.id === emotion.id;
          return (
            <motion.button
              key={emotion.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActivePrimary(emotion)}
              className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 border transition-all text-center ${
                isSelected
                  ? 'ring-2 ring-offset-2 ring-[var(--accent)] shadow-lg'
                  : 'bg-[var(--bg-secondary)] border-[var(--border)] opacity-80 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isSelected ? `${emotion.color}25` : undefined,
                borderColor: isSelected ? emotion.color : undefined
              }}
            >
              <span className="text-xl">{emotion.icon}</span>
              <span className="text-[10px] font-bold truncate max-w-full" style={{ color: 'var(--text-primary)' }}>
                {isRtl ? emotion.nameFa.split(' ')[0] : emotion.nameEn}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Sub-emotions for Active Primary */}
      <div
        className="p-4 rounded-2xl border transition-all"
        style={{
          backgroundColor: `${activePrimary.color}15`,
          borderColor: `${activePrimary.color}50`
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{activePrimary.icon}</span>
          <h4 className="text-sm font-bold" style={{ color: activePrimary.color }}>
            {isRtl ? `طیف احساسی ${activePrimary.nameFa}:` : `${activePrimary.nameEn} Nuances:`}
          </h4>
        </div>

        <div className="flex flex-wrap gap-2">
          {activePrimary.subs.map((sub) => {
            const isSelected = selectedEmotion?.sub === (isRtl ? sub.nameFa : sub.nameEn);
            return (
              <motion.button
                key={sub.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectSub(sub, activePrimary)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'text-white shadow-md'
                    : 'bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)]'
                }`}
                style={{
                  backgroundColor: isSelected ? activePrimary.color : undefined,
                  color: isSelected ? '#ffffff' : 'var(--text-primary)'
                }}
              >
                {isRtl ? sub.nameFa : sub.nameEn}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
