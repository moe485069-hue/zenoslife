import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const Button = ({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  icon,
  children,
  className,
  fullWidth = false,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none';
  
  const variants = {
    primary: 'bg-[var(--accent)] text-white hover:opacity-90',
    secondary: 'border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:bg-opacity-10',
    ghost: 'bg-transparent hover:bg-[var(--accent)] hover:bg-opacity-10 text-[var(--text-primary)]',
    danger: 'bg-[var(--danger)] text-white hover:opacity-90',
    success: 'bg-[var(--success)] text-white hover:opacity-90',
  };

  const sizes = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-base px-4 py-2 gap-2',
    lg: 'text-lg px-6 py-3 gap-2.5',
  };

  const classes = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    (disabled || loading) && 'opacity-50 cursor-not-allowed',
    className
  );

  return (
    <motion.button
      whileTap={!(disabled || loading) ? { scale: 0.97 } : undefined}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
