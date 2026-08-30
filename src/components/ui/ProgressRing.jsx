import React from 'react';
import { motion } from 'framer-motion';

const ProgressRing = ({ 
  percentage = 0, 
  size = 80, 
  strokeWidth = 8, 
  color = 'var(--accent)', 
  label, 
  children,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const validPercentage = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (validPercentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="var(--border)"
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        {children || (
          <>
            <span className="font-bold" style={{ fontSize: size * 0.25 }}>{Math.round(validPercentage)}%</span>
            {label && <span className="text-xs text-[var(--text-secondary)]">{label}</span>}
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
