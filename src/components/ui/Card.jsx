import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Card({ title, icon: Icon, children, onClick, className, variant = 'default' }) {
  const baseStyle = "rounded-2xl p-4 transition-all duration-300";
  const variants = {
    default: "bg-bg-secondary border border-border hover:shadow-lg",
    glass: "glass-card hover:bg-bg-card/90 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]",
    elevated: "bg-bg-card shadow-xl border border-border/50"
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={clsx(baseStyle, variants[variant], className, onClick && 'cursor-pointer')}
    >
      {(title || Icon) && (
        <div className="flex items-center gap-3 mb-3 border-b border-border pb-2">
          {Icon && <Icon className="text-accent" size={20} />}
          {title && <h3 className="font-semibold text-lg">{title}</h3>}
        </div>
      )}
      <div className="text-text-secondary">{children}</div>
    </motion.div>
  );
}
