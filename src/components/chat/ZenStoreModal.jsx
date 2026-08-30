import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Check, Sparkles, Shield, Palette } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';

export const STORE_ITEMS = [
  // Frames
  { id: 'frame_neon_purple', type: 'frame', nameFa: 'قاب نئونی بنفش', price: 100, icon: '🟣', previewClass: 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/50' },
  { id: 'frame_fire_gold', type: 'frame', nameFa: 'قاب آتشین طلایی', price: 200, icon: '🔥', previewClass: 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/50' },
  { id: 'frame_cyber_green', type: 'frame', nameFa: 'قاب ماتریکس سبز', price: 150, icon: '🟢', previewClass: 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/50' },
  
  // Name Colors
  { id: 'color_gold_shimmer', type: 'nameColor', nameFa: 'رنگ طلایی پادشاهی', price: 80, icon: '👑', colorClass: 'text-amber-400 font-black drop-shadow' },
  { id: 'color_cyber_neon', type: 'nameColor', nameFa: 'رنگ سایبر نئون', price: 120, icon: '⚡', colorClass: 'text-cyan-400 font-black drop-shadow' },
  { id: 'color_ruby_glow', type: 'nameColor', nameFa: 'رنگ یاقوت سرخ', price: 100, icon: '💎', colorClass: 'text-rose-400 font-black drop-shadow' },
];

export default function ZenStoreModal({ isOpen, onClose }) {
  const { coins, purchasedItems, buyStoreItem, equippedFrame, equippedNameColor, setEquippedItem } = useAppStore();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'frames' | 'colors'

  const handleBuyOrEquip = (item) => {
    const isOwned = purchasedItems.includes(item.id);
    if (isOwned) {
      setEquippedItem(item.type, item.id);
      soundEngine.playCheckmark?.();
    } else {
      const res = buyStoreItem(item);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const filtered = activeTab === 'all' 
    ? STORE_ITEMS 
    : STORE_ITEMS.filter(i => activeTab === 'frames' ? i.type === 'frame' : i.type === 'nameColor');

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
            className="w-full max-w-md max-h-[560px] rounded-3xl bg-slate-900 border-2 border-yellow-500/40 flex flex-col justify-between p-5 shadow-2xl text-right"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-yellow-400" />
                <div>
                  <h3 className="text-sm font-black text-white">فروشگاه اختصاصی اقلام VIP</h3>
                  <p className="text-[10px] text-amber-400 font-bold">موجودی: {coins} سکه 🪙</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 rounded-xl bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 py-2">
              {[
                { id: 'all', label: 'همه اقلام' },
                { id: 'frames', label: 'قاب آواتار' },
                { id: 'colors', label: 'رنگ نام کاربری' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                    activeTab === t.id ? 'bg-yellow-500 text-slate-950 shadow-md' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto space-y-2 py-2">
              {filtered.map(item => {
                const isOwned = purchasedItems.includes(item.id);
                const isEquipped = (item.type === 'frame' && equippedFrame === item.id) ||
                                  (item.type === 'nameColor' && equippedNameColor === item.id);

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="text-xs font-black text-white">{item.nameFa}</h4>
                        <p className="text-[10px] text-amber-400 font-bold">{isOwned ? 'خریداری شده' : item.price + ' سکه'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBuyOrEquip(item)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
                        isEquipped
                          ? 'bg-green-500/20 border border-green-400 text-green-300'
                          : isOwned
                          ? 'bg-purple-600 text-white'
                          : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950'
                      }`}
                    >
                      {isEquipped ? 'فعال ✓' : isOwned ? 'تجهیز' : 'خرید'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-white/10">
              با بازی در مسابقات و فعالیت در زنوسلایف سکه به دست آورید!
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
