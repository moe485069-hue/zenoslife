import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Check, Trash2, Sparkles } from 'lucide-react';
import useMultiplayerStore from '../../store/multiplayerStore';
import soundEngine from '../../utils/audio';

export default function SoulBondModal({ isOpen, onClose }) {
  const { activeSoulBond, incomingSoulBondRequest, acceptSoulBond, rejectSoulBond, removeSoulBond } = useMultiplayerStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-pink-500/40 p-6 text-center space-y-4 shadow-2xl text-right"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-base font-black text-pink-300 flex items-center gap-1.5">
                <Heart size={18} className="text-pink-400" /> پیوند و پارتنر مجازی
              </h3>
              <button onClick={onClose} className="p-1 rounded-xl bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Incoming Request */}
            {incomingSoulBondRequest && (
              <div className="p-4 rounded-2xl bg-pink-950/40 border border-pink-500/40 space-y-3">
                <p className="text-xs font-black text-pink-200">
                  💌 درخواست پیوند روحی از طرف {incomingSoulBondRequest.senderAvatar} {incomingSoulBondRequest.senderName}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { acceptSoulBond(incomingSoulBondRequest); soundEngine.playLevelUp?.(); }}
                    className="flex-1 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs active:scale-95"
                  >
                    قبول پیوند 💍
                  </button>
                  <button
                    onClick={rejectSoulBond}
                    className="py-2 px-3 rounded-xl bg-white/10 text-slate-300 font-bold text-xs"
                  >
                    رد
                  </button>
                </div>
              </div>
            )}

            {/* Active Partner */}
            {activeSoulBond ? (
              <div className="p-5 rounded-3xl bg-gradient-to-br from-pink-900/30 to-purple-900/30 border border-pink-500/40 space-y-3 text-center">
                <div className="text-5xl animate-pulse">💍</div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    پارتنر شما: {activeSoulBond.avatar} {activeSoulBond.name}
                  </h4>
                  <p className="text-[11px] text-pink-300/80 mt-1">
                    نشان قلب اختصاصی کنار نام هر دوی شما در چت‌روم می‌درخشد.
                  </p>
                </div>
                <button
                  onClick={() => { removeSoulBond(); soundEngine.playTap?.(); }}
                  className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold hover:bg-red-500/30 active:scale-95 flex items-center gap-1 mx-auto"
                >
                  <Trash2 size={12} /> لغو پیوند
                </button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-300 leading-relaxed">
                  با کلیک روی پروفایل هر کاربر در چت‌روم، می‌توانید به او درخواست «پیوند و حلقه دوستی 💍» ارسال کنید.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
