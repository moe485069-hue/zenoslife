import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Plus, Minus, Trash2, Check } from 'lucide-react';
import useAppStore from '../../store/appStore';
import useSectionsStore from '../../store/sectionsStore';

const WidgetCard = ({ widget, index }) => {
  const language = useAppStore(s => s.language);
  const isRtl = language === 'fa';
  const { updateWidget, deleteWidget } = useSectionsStore();

  const title = isRtl
    ? (widget.titleFa || widget.titleEn || '')
    : (widget.titleEn || widget.titleFa || '');

  const [showDelete, setShowDelete] = useState(false);
  const [localChecks, setLocalChecks] = useState(widget.checkStates || []);

  const accentStyle = {
    borderTop: `3px solid ${widget.color || 'var(--accent)'}`,
  };

  const toggleCheck = async (i) => {
    const next = [...localChecks];
    next[i] = !next[i];
    setLocalChecks(next);
    await updateWidget(widget.id, { checkStates: next });
  };

  const updateCounter = async (delta) => {
    const newVal = Math.max(0, (widget.counterValue || 0) + delta);
    await updateWidget(widget.id, { counterValue: newVal });
  };

  const getCountdown = () => {
    if (!widget.targetDate) return null;
    const diff = new Date(widget.targetDate) - new Date();
    if (diff <= 0) return isRtl ? 'گذشت!' : 'Passed!';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return isRtl ? `${days} روز مانده` : `${days} days left`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ delay: index * 0.05 }}
      className="widget-card"
      style={accentStyle}
      onLongPress={() => setShowDelete(true)}
    >
      {/* Delete button on hover */}
      <button
        onClick={() => setShowDelete(v => !v)}
        className="absolute top-2 end-2 p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
        title={isRtl ? 'حذف' : 'Delete'}
        style={{ opacity: showDelete ? 1 : undefined }}
      >
        <Trash2 size={13} />
      </button>

      {showDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[var(--danger-light)] border border-[var(--danger)] rounded-xl flex flex-col items-center justify-center gap-2 z-10"
        >
          <p className="text-sm font-semibold text-[var(--danger)]">
            {isRtl ? 'حذف شود؟' : 'Delete this widget?'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => deleteWidget(widget.id)}
              className="px-3 py-1.5 bg-[var(--danger)] text-white text-xs rounded-lg font-bold"
            >
              {isRtl ? 'بله' : 'Yes'}
            </button>
            <button
              onClick={() => setShowDelete(false)}
              className="px-3 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs rounded-lg font-bold"
            >
              {isRtl ? 'نه' : 'No'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{widget.icon || '⭐'}</span>
        <h4 className="text-sm font-bold text-[var(--text-primary)] flex-1 truncate">{title}</h4>
      </div>

      {/* Content by type */}
      {widget.type === 'note' && (
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {widget.content}
        </p>
      )}

      {widget.type === 'quote' && (
        <blockquote className="border-s-2 ps-3 italic text-xs text-[var(--text-secondary)] leading-relaxed"
          style={{ borderColor: widget.color || 'var(--accent)' }}>
          {widget.content}
        </blockquote>
      )}

      {widget.type === 'link' && widget.content && (
        <a
          href={widget.content}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium hover:underline"
          style={{ color: widget.color || 'var(--accent)' }}
        >
          <ExternalLink size={12} />
          <span className="truncate">{widget.content}</span>
        </a>
      )}

      {widget.type === 'checklist' && (
        <div className="space-y-1.5">
          {(widget.checkItems || []).map((item, i) => (
            <button
              key={i}
              onClick={() => toggleCheck(i)}
              className="flex items-center gap-2 w-full text-xs text-start"
            >
              <div className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                localChecks[i]
                  ? 'bg-[var(--success)] border-[var(--success)] text-white'
                  : 'border-[var(--border)]'
              }`}>
                {localChecks[i] && <Check size={10} strokeWidth={3} />}
              </div>
              <span className={`flex-1 ${localChecks[i] ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                {item}
              </span>
            </button>
          ))}
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            {localChecks.filter(Boolean).length}/{widget.checkItems?.length || 0}
          </p>
        </div>
      )}

      {widget.type === 'counter' && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">{widget.counterLabel}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateCounter(-1)}
              className="w-7 h-7 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-secondary)]"
            >
              <Minus size={12} />
            </button>
            <span className="text-lg font-bold" style={{ color: widget.color || 'var(--accent)' }}>
              {widget.counterValue || 0}
            </span>
            <button
              onClick={() => updateCounter(1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: widget.color || 'var(--accent)' }}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>
      )}

      {widget.type === 'countdown' && (
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: widget.color || 'var(--accent)' }}>
            {getCountdown()}
          </p>
          {widget.targetDate && (
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {new Date(widget.targetDate).toLocaleDateString(isRtl ? 'fa-IR' : 'en-US')}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default WidgetCard;
