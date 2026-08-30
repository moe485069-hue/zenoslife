import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Lock } from 'lucide-react';

const Badge = ({ badge, language = 'fa' }) => {
  const isRtl = language === 'fa';
  const name = isRtl ? badge.name_fa : badge.name_en;
  const description = isRtl ? badge.description_fa : badge.description_en;
  const earned = badge.earned;

  return (
    <motion.div
      whileHover={earned ? { scale: 1.05 } : {}}
      initial={earned ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className="group relative flex flex-col items-center gap-2 cursor-help"
    >
      <div className={clsx(
        'w-16 h-16 rounded-xl flex items-center justify-center text-3xl relative transition-all duration-300',
        earned 
          ? 'bg-gradient-to-br from-[var(--accent)] to-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.5)] border border-purple-400/30'
          : 'bg-[var(--bg-secondary)] opacity-50 grayscale'
      )}>
        {badge.icon}
        {!earned && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
            <Lock size={20} className="text-white/70" />
          </div>
        )}
      </div>
      
      <span className="text-xs font-medium text-center w-20 truncate" title={name}>
        {name}
      </span>

      {/* Tooltip */}
      <div className={clsx(
        "absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bottom-full mb-2 pointer-events-none z-10 w-48 p-2 rounded-lg text-xs text-white glass-card bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border)] shadow-xl",
        isRtl ? "text-right" : "text-left"
      )}>
        <p className="font-bold text-[var(--accent)] mb-1">{name}</p>
        <p className="text-[var(--text-secondary)]">{description}</p>
      </div>
    </motion.div>
  );
};

export default Badge;
