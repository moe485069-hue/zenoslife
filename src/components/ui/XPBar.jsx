import React from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../../store/appStore';

const XPBar = ({ compact = false }) => {
  const { xp, level } = useAppStore();
  const xpForNextLevel = level * 100;
  const currentLevelXp = xp - ((level - 1) * 100);
  const percentage = Math.min(100, Math.max(0, (currentLevelXp / 100) * 100));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-[var(--accent)]/30">
          {level}
        </div>
        <div className="w-24 h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[var(--accent)] to-purple-400"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full glass-card p-4 rounded-xl flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-[var(--accent)]/50 border-2 border-[var(--bg-card)]">
            {level}
          </div>
          <div>
            <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Level</div>
            <div className="font-bold">Lvl {level}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-[var(--accent)]">{xp} XP</div>
          <div className="text-xs text-[var(--text-secondary)]">/ {xpForNextLevel} XP</div>
        </div>
      </div>
      
      <div className="w-full h-3 bg-[var(--border)] rounded-full overflow-hidden relative">
        <motion.div 
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[var(--accent)] to-purple-400"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, type: 'spring' }}
        />
      </div>
    </div>
  );
};

export default XPBar;
