import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles } from 'lucide-react';
import useAppStore from '../../store/appStore';
import useSectionsStore from '../../store/sectionsStore';

export default function CustomItemModal({ isOpen, onClose, sectionId, sectionTitle, defaultType = 'habit', onSaved }) {
  const { language, addXP } = useAppStore();
  const { addHabit } = useSectionsStore();
  const isRtl = language === 'fa';

  const [nameFa, setNameFa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [icon, setIcon] = useState('✨');
  const [xp, setXp] = useState(15);
  const [color, setColor] = useState('#a855f7');

  const EMOJI_OPTIONS = ['✨', '🎯', '🧘', '🔥', '📚', '💡', '💎', '💪', '💰', '🌟', '🌱', '🌍', '❤️', '⚡'];
  const COLOR_OPTIONS = ['#a855f7', '#6366f1', '#10b981', '#f97316', '#eab308', '#ec4899', '#06b6d4'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameFa.trim()) return;

    await addHabit({
      sectionId,
      name: nameEn.trim() || nameFa.trim(),
      nameFa: nameFa.trim(),
      icon,
      color,
      xp: Number(xp) || 15
    });

    addXP(10);
    if (onSaved) onSaved();
    setNameFa('');
    setNameEn('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="glass-card w-full max-w-md p-6 rounded-3xl relative border border-[var(--border)]"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]">
                <Plus size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {isRtl ? `افزودن آیتم سفارشی به ${sectionTitle}` : `Add Custom Item to ${sectionTitle}`}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'آیتم جدید ذخیره شده و پاداش XP خواهد داشت' : 'Will be saved locally with XP rewards'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Title FA */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {isRtl ? 'عنوان آیتم یا تمرین (فارسی) *' : 'Title (Persian) *'}
              </label>
              <input
                type="text"
                required
                value={nameFa}
                onChange={(e) => setNameFa(e.target.value)}
                placeholder={isRtl ? 'مثلاً: ۲۰ دقیقه مطالعه تخصصی...' : 'e.g., 20 mins deep reading...'}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            {/* Title EN (Optional) */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {isRtl ? 'عنوان انگلیسی (اختیاری)' : 'Title (English - Optional)'}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g., 20 mins deep reading"
                className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]"
                style={{ color: 'var(--text-primary)', direction: 'ltr' }}
              />
            </div>

            {/* Emoji selector */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {isRtl ? 'انتخاب آیکون' : 'Choose Icon'}
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setIcon(em)}
                    className={`w-10 h-10 rounded-2xl text-lg flex items-center justify-center border transition-all ${
                      icon === em
                        ? 'border-[var(--accent)] bg-[var(--accent)]/20 scale-110'
                        : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:scale-105'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selector */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {isRtl ? 'رنگ شاخص' : 'Accent Color'}
              </label>
              <div className="flex gap-2.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-[var(--accent)] scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* XP reward */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {isRtl ? 'پاداش تجربه (XP)' : 'XP Reward'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={xp}
                  onChange={(e) => setXp(e.target.value)}
                  className="flex-1 accent-[var(--accent)]"
                />
                <span className="text-sm font-bold text-[var(--warning)] px-2.5 py-1 rounded-xl bg-[var(--warning)]/15 border border-[var(--warning)]/30">
                  +{xp} XP
                </span>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-[var(--border)] text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              >
                {isRtl ? 'انصراف' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-[var(--accent)] text-white text-sm font-bold shadow-lg hover:opacity-90 active:scale-98 transition-transform"
              >
                {isRtl ? 'ثبت و افزودن' : 'Save Item'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
