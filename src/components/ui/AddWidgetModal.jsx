import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileText, CheckSquare, Link2, Quote, Hash, Clock,
  Palette, Smile, Plus, Trash2
} from 'lucide-react';
import useAppStore from '../../store/appStore';
import useSectionsStore from '../../store/sectionsStore';

const WIDGET_TYPES = [
  { id: 'note',     icon: <FileText size={18} />,    fa: 'یادداشت',      en: 'Note' },
  { id: 'checklist',icon: <CheckSquare size={18} />, fa: 'چک‌لیست',      en: 'Checklist' },
  { id: 'link',     icon: <Link2 size={18} />,       fa: 'لینک',         en: 'Link' },
  { id: 'quote',    icon: <Quote size={18} />,       fa: 'نقل‌قول',      en: 'Quote' },
  { id: 'counter',  icon: <Hash size={18} />,        fa: 'شمارنده',      en: 'Counter' },
  { id: 'countdown',icon: <Clock size={18} />,       fa: 'شمارش معکوس',  en: 'Countdown' },
];

const COLORS = [
  '#8b5cf6', '#6366f1', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#ef4444', '#84cc16',
];

const EMOJIS = [
  '⭐','📌','💡','🔥','🎯','📚','💪','🌱',
  '🧘','🌟','🎨','🎵','🌙','☀️','🌊','🦋',
  '💎','🚀','🌿','❤️','🎉','🏆','✨','🎭',
];

const AddWidgetModal = ({ sectionId, onClose }) => {
  const language = useAppStore(s => s.language);
  const isRtl = language === 'fa';
  const addWidget = useSectionsStore(s => s.addWidget);

  const [type, setType] = useState('note');
  const [titleFa, setTitleFa] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#8b5cf6');
  const [icon, setIcon] = useState('⭐');
  const [checkItems, setCheckItems] = useState(['']);
  const [targetDate, setTargetDate] = useState('');
  const [counterLabel, setCounterLabel] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);

  const handleSave = async () => {
    const title = isRtl ? (titleFa || titleEn) : (titleEn || titleFa);
    if (!title.trim()) return;

    await addWidget({
      sectionId,
      type,
      titleFa: titleFa || titleEn,
      titleEn: titleEn || titleFa,
      content,
      color,
      icon,
      checkItems: type === 'checklist' ? checkItems.filter(c => c.trim()) : [],
      checkStates: type === 'checklist' ? checkItems.filter(c => c.trim()).map(() => false) : [],
      targetDate: type === 'countdown' ? targetDate : null,
      counterLabel: type === 'counter' ? counterLabel : '',
      counterValue: type === 'counter' ? 0 : null,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  const addCheckItem = () => setCheckItems(prev => [...prev, '']);
  const updateCheckItem = (i, val) => {
    const next = [...checkItems];
    next[i] = val;
    setCheckItems(next);
  };
  const removeCheckItem = (i) => setCheckItems(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <motion.div
        className="modal-panel"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {isRtl ? 'افزودن ویجت جدید' : 'Add New Widget'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Widget Type */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
              {isRtl ? 'نوع ویجت' : 'Widget Type'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WIDGET_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    type === t.id
                      ? 'bg-[var(--accent-light)] border-[var(--accent)] text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                  }`}
                >
                  {t.icon}
                  <span>{isRtl ? t.fa : t.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon + Color Row */}
          <div className="flex gap-3">
            {/* Emoji Picker */}
            <div className="flex-1 relative">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                {isRtl ? 'آیکون' : 'Icon'}
              </label>
              <button
                onClick={() => setShowEmojis(v => !v)}
                className="w-full h-10 rounded-xl border border-[var(--border)] flex items-center justify-center text-2xl glass-card"
              >
                {icon}
              </button>
              <AnimatePresence>
                {showEmojis && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute bottom-full mb-2 left-0 right-0 z-30 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-3 shadow-xl"
                  >
                    <div className="grid grid-cols-8 gap-1">
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => { setIcon(e); setShowEmojis(false); }}
                          className="text-xl p-1 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
                          {e}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Color Picker */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                {isRtl ? 'رنگ' : 'Color'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white ring-offset-1' : 'hover:scale-110'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                عنوان فارسی
              </label>
              <input
                value={titleFa}
                onChange={e => setTitleFa(e.target.value)}
                dir="rtl"
                placeholder="عنوان..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                English Title
              </label>
              <input
                value={titleEn}
                onChange={e => setTitleEn(e.target.value)}
                dir="ltr"
                placeholder="Title..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* Type-specific fields */}
          {type === 'note' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                {isRtl ? 'متن یادداشت' : 'Note Content'}
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                dir={isRtl ? 'rtl' : 'ltr'}
                rows={3}
                placeholder={isRtl ? 'یادداشت خود را بنویسید...' : 'Write your note...'}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none"
              />
            </div>
          )}

          {type === 'quote' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                {isRtl ? 'متن نقل‌قول' : 'Quote Text'}
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                dir={isRtl ? 'rtl' : 'ltr'}
                rows={3}
                placeholder={isRtl ? 'نقل‌قول مورد علاقه‌ات...' : 'Your favorite quote...'}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none"
              />
            </div>
          )}

          {type === 'link' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  {isRtl ? 'آدرس لینک' : 'URL'}
                </label>
                <input
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  dir="ltr"
                  type="url"
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          )}

          {type === 'checklist' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                {isRtl ? 'آیتم‌های چک‌لیست' : 'Checklist Items'}
              </label>
              <div className="space-y-2">
                {checkItems.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={item}
                      onChange={e => updateCheckItem(i, e.target.value)}
                      dir={isRtl ? 'rtl' : 'ltr'}
                      placeholder={isRtl ? `آیتم ${i + 1}` : `Item ${i + 1}`}
                      className="flex-1 px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                    {checkItems.length > 1 && (
                      <button onClick={() => removeCheckItem(i)}
                        className="text-[var(--danger)] p-1 hover:bg-[var(--danger-light)] rounded-lg">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addCheckItem}
                  className="flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline mt-1"
                >
                  <Plus size={14} />
                  {isRtl ? 'افزودن آیتم' : 'Add Item'}
                </button>
              </div>
            </div>
          )}

          {type === 'counter' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                {isRtl ? 'برچسب شمارنده (مثلاً: لیوان آب)' : 'Counter Label (e.g. Glasses of water)'}
              </label>
              <input
                value={counterLabel}
                onChange={e => setCounterLabel(e.target.value)}
                dir={isRtl ? 'rtl' : 'ltr'}
                placeholder={isRtl ? 'برچسب...' : 'Label...'}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}

          {type === 'countdown' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                {isRtl ? 'تاریخ هدف' : 'Target Date'}
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!(isRtl ? titleFa : titleEn).trim() && !titleFa.trim() && !titleEn.trim()}
            className="w-full py-3 rounded-xl font-bold text-white transition-all disabled:opacity-40"
            style={{ background: color }}
          >
            {isRtl ? '✨ ذخیره ویجت' : '✨ Save Widget'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddWidgetModal;
