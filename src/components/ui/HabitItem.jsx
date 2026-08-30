import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Flame, Trash2, Edit2, X } from 'lucide-react';
import clsx from 'clsx';
import useAppStore from '../../store/appStore';
import haptics from '../../utils/haptics';

const HabitItem = ({ item, completed, onToggle, onDelete, onEdit }) => {
  const language = useAppStore(s => s.language);
  const isRtl = language === 'fa';

  // Support multiple property name conventions (nameFa/name/title_fa/title)
  const title = isRtl
    ? (item.nameFa || item.title_fa || item.titleFa || item.name || item.title || '')
    : (item.nameEn || item.title_en || item.titleEn || item.name || item.title || '');

  const [showOptions, setShowOptions] = useState(false);
  let pressTimer = null;

  const startPress = () => {
    pressTimer = setTimeout(() => setShowOptions(true), 500);
  };
  const endPress = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  const handleToggle = () => {
    haptics.success();
    onToggle(item.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-2"
    >
      <div
        className={clsx(
          'habit-item',
          completed && 'completed'
        )}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
      >
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={clsx(
            'flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all duration-200',
            completed
              ? 'bg-[var(--success)] border-[var(--success)] text-white'
              : 'border-[var(--text-secondary)] text-transparent hover:border-[var(--accent)]'
          )}
        >
          <AnimatePresence>
            {completed && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Check size={14} strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Icon + Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">{item.icon || '⭐'}</span>
          <span className={clsx(
            'text-sm font-medium truncate transition-all duration-200',
            completed && 'line-through text-[var(--text-secondary)]'
          )}>
            {title}
          </span>
        </div>

        {/* Stats + Options */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {(item.reminderTime || item.alarmTime || item.dueTime) && (
            <div className="flex items-center gap-1 text-cyan-300 text-[10px] font-bold bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-full shadow-xs">
              <span>⏰</span>
              <span className="font-mono">{item.reminderTime || item.alarmTime || item.dueTime}</span>
            </div>
          )}
          {item.streak > 0 && (
            <div className="flex items-center gap-1 text-[var(--warning)] text-xs font-bold bg-[var(--warning-light)] px-2 py-0.5 rounded-full">
              <Flame size={11} />
              <span>{item.streak}</span>
            </div>
          )}
          <div className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-light)] px-2 py-0.5 rounded-full">
            +{item.xp || 10} XP
          </div>
        </div>
      </div>

      {/* Long-press context menu */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={clsx(
              'absolute top-full mt-1 flex gap-2 z-20',
              isRtl ? 'left-0' : 'right-0'
            )}
          >
            <button
              onClick={() => { onEdit && onEdit(item); setShowOptions(false); }}
              className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-lg hover:bg-[var(--accent)] hover:text-white transition-colors text-sm"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => { onDelete(item.id); setShowOptions(false); }}
              className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--danger)] shadow-lg hover:bg-[var(--danger)] hover:text-white transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={() => setShowOptions(false)}
              className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] shadow-lg"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HabitItem;
