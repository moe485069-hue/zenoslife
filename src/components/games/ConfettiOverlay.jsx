import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ConfettiOverlay — full-screen particle burst on game win.
 * Usage: <ConfettiOverlay active={won} onDone={() => setWon(false)} />
 */
export default function ConfettiOverlay({ active, onDone }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  const COLORS = [
    '#f59e0b', '#ef4444', '#10b981', '#3b82f6',
    '#a855f7', '#ec4899', '#06b6d4', '#84cc16',
    '#f97316', '#8b5cf6'
  ];

  const createParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width;
    const H = canvas.height;
    const count = Math.min(180, Math.floor(W / 4));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.3 - H * 0.1,
      w: Math.random() * 10 + 5,
      h: Math.random() * 5 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      angle: Math.random() * 360,
      spin: (Math.random() - 0.5) * 8,
      gravity: 0.18 + Math.random() * 0.12,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }));
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let alive = false;
    particlesRef.current.forEach(p => {
      if (p.opacity <= 0) return;
      alive = true;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.995;
      p.angle += p.spin;

      if (p.y > canvas.height) {
        p.opacity -= 0.05;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    });

    if (alive) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      onDone?.();
    }
  };

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    createParticles();
    animRef.current = requestAnimationFrame(animate);

    // Auto stop after 4.5 seconds
    const timeout = setTimeout(() => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      onDone?.();
    }, 4500);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      clearTimeout(timeout);
    };
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[100]"
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
