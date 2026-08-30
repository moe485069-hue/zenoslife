import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Edit2, Clock, Repeat, Bell, Tag } from 'lucide-react';
import clsx from 'clsx';
import haptics from '../../utils/haptics';

const SECTION_COLORS = {
  mindfulness: 'bg-teal-500',
  learning: 'bg-blue-500',
  selfDiscovery: 'bg-purple-500',
  wealth: 'bg-green-500',
  world: 'bg-orange-500',
  integrity: 'bg-yellow-500'
};

const TaskItem = ({ task, onToggle, onDelete, onEdit, language = 'fa' }) => {
  const [showOptions, setShowOptions] = useState(false);
  const isRtl = language === 'fa';
  
  const priorityColors = {
    high: 'bg-[var(--danger)]',
    medium: 'bg-[var(--warning)]',
    low: 'bg-[var(--success)]'
  };

  let pressTimer = null;
  const startPress = () => { pressTimer = setTimeout(() => setShowOptions(true), 500); };
  const endPress = () => { if (pressTimer) clearTimeout(pressTimer); };

  const handleToggle = () => {
    haptics.success();
    onToggle(task.id);
  };

  return (
    <motion.div layoutId={`task-${task.id}`} className="relative mb-2">
      <div 
        className={clsx(
          "flex items-center p-3 rounded-xl border transition-all duration-300 overflow-hidden",
          task.completed ? "bg-[var(--success)]/10 border-[var(--success)]/30" : "glass-card border-[var(--border)]"
        )}
        onTouchStart={startPress} onTouchEnd={endPress} onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
      >
        <div className={clsx("absolute top-0 bottom-0 left-0 w-1.5", priorityColors[task.priority || 'medium'])} />
        
        <button
          onClick={handleToggle}
          className={clsx(
            "ml-3 mr-3 w-6 h-6 shrink-0 rounded-md flex items-center justify-center border-2 transition-colors",
            task.completed ? "bg-[var(--success)] border-[var(--success)] text-white" : "border-[var(--text-secondary)] text-transparent hover:border-[var(--accent)]"
          )}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
                <Check size={16} strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <div className="flex-1 min-w-0">
          <div className={clsx(
            "font-medium truncate transition-all duration-300",
            task.completed && "line-through text-[var(--text-secondary)]"
          )}>
            {task.title}
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--text-secondary)]">
            {task.dueTime && (
              <div className="flex items-center gap-1">
                <Clock size={10} />
                <span>{task.dueTime}</span>
              </div>
            )}
            {task.repeat && task.repeat !== 'none' && (
              <div className="flex items-center gap-1">
                <Repeat size={10} />
                <span>{task.repeat}</span>
              </div>
            )}
            {task.reminder && (
              <div className="flex items-center gap-1 text-[var(--accent)]">
                <Bell size={10} />
              </div>
            )}
            {task.sectionId && (
              <div className="flex items-center gap-1">
                <div className={clsx("w-2 h-2 rounded-full", SECTION_COLORS[task.sectionId] || 'bg-gray-500')} />
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => onDelete(task.id)}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors rounded-lg shrink-0"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 flex justify-end gap-2 z-10"
          >
            <button onClick={() => { onEdit(task); setShowOptions(false); }} className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-lg hover:bg-[var(--accent)] hover:text-white transition-colors"><Edit2 size={16} /></button>
            <button onClick={() => setShowOptions(false)} className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] shadow-lg text-xs font-bold">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskItem;
