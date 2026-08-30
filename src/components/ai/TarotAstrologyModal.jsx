import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Compass, Moon, Sun, Star, Lock, Zap } from 'lucide-react';
import useAppStore from '../../store/appStore';
import soundEngine from '../../utils/audio';

export const TAROT_CARDS = [
  { id: 't1', name: 'جادوگر (The Magician)', symbol: '🪄', desc: 'نیروی اراده، تسلط بر ابزارها، و آفرینش امکانات از هیچ.' },
  { id: 't2', name: 'کاهنه اعظم (High Priestess)', symbol: '🔮', desc: 'شهود درون، رازهای پنهان، و گوش فرادادن به صدای درون.' },
  { id: 't3', name: 'امپراتور (The Emperor)', symbol: '👑', desc: 'نظم، اقتدار، ثبات، و تسلط بر جهان مادی.' },
  { id: 't4', name: 'چرخ بخت (Wheel of Fortune)', symbol: '☸️', desc: 'چرخش سرنوشت، تحول ناگهانی، و گشایش فرصت‌های نو.' },
  { id: 't5', name: 'ستاره (The Star)', symbol: '⭐', desc: 'امید، الهام کیهانی، شفا، و آرامش ژرف پس از توفان.' },
  { id: 't6', name: 'خورشید (The Sun)', symbol: '☀️', desc: 'روشنایی حقیقت، نشاط، پیروزی حتمی، و سرزندگی.' }
];

export default function TarotAstrologyModal({ isOpen, onClose }) {
  const { birthChartData, saveBirthChart, isVip } = useAppStore();
  const [activeTab, setActiveTab] = useState('tarot'); // 'tarot' | 'astrology'

  // Tarot State
  const [drawnCards, setDrawnCards] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Astrology Form
  const [birthDate, setBirthDate] = useState('1375/06/15');
  const [birthTime, setBirthTime] = useState('14:30');
  const [birthCity, setBirthCity] = useState('تهران');
  const [generatedChart, setGeneratedChart] = useState(birthChartData);

  const handleDrawTarot = () => {
    setIsDrawing(true);
    soundEngine.playTap?.();
    setTimeout(() => {
      const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5);
      setDrawnCards([
        { ...shuffled[0], label: 'گذشته و ریشه ماجرا' },
        { ...shuffled[1], label: 'وضعیت در حال حاضر' },
        { ...shuffled[2], label: 'چشم‌انداز و پیام آینده' }
      ]);
      setIsDrawing(false);
      soundEngine.playLevelUp?.();
    }, 1200);
  };

  const handleGenerateChart = () => {
    soundEngine.playTap?.();
    const chart = {
      sunSign: 'سنبله (شهریور ♍)',
      moonSign: 'عقرب (آبان ♏)',
      ascendant: 'کماندار (آذر ♐)',
      element: 'خاک و آتش (پشتکار و اراده بالا)',
      destinyQuote: 'رسالت شما برقراری تعادل میان نظم زمینی و آگاهی کیهانی است.'
    };
    setGeneratedChart(chart);
    saveBirthChart(chart);
    soundEngine.playLevelUp?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md max-h-[90vh] rounded-3xl bg-slate-900 border-2 border-purple-500/40 flex flex-col justify-between p-5 shadow-2xl text-right overflow-y-auto"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">فال تاروت و چارت تولد کیهانی</h3>
                  <p className="text-[10px] text-pink-300 font-bold">بینش عمیق کهن‌الگوها و ستاره‌شناسی با هوش مصنوعی</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 my-2">
              <button
                onClick={() => { setActiveTab('tarot'); soundEngine.playTap?.(); }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'tarot' ? 'bg-purple-600 text-white shadow' : 'bg-white/5 text-slate-400'
                }`}
              >
                🃏 فال ۳ کارتی تاروت
              </button>
              <button
                onClick={() => { setActiveTab('astrology'); soundEngine.playTap?.(); }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'astrology' ? 'bg-purple-600 text-white shadow' : 'bg-white/5 text-slate-400'
                }`}
              >
                🌌 چارت تولد آسترولوژی
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 my-2">
              {activeTab === 'tarot' ? (
                <div className="space-y-3 text-center">
                  {drawnCards.length === 0 ? (
                    <div className="py-8 space-y-3">
                      <div className="text-6xl animate-pulse">🔮</div>
                      <h4 className="text-sm font-black text-amber-300">نیت کنید و کارت‌ها را بر بزنید</h4>
                      <p className="text-xs text-slate-300">۳ کارت برای گذشته، حال و آینده شما کشیده می‌شود.</p>
                      <button
                        onClick={handleDrawTarot}
                        disabled={isDrawing}
                        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs shadow-xl active:scale-95"
                      >
                        {isDrawing ? 'در حال گشودن رازها...' : '✨ بر زدن و کشیدن کارت‌ها'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 text-right">
                      {drawnCards.map((c, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/30 flex items-start gap-3"
                        >
                          <span className="text-3xl p-1 rounded-xl bg-black/40">{c.symbol}</span>
                          <div>
                            <span className="text-[10px] text-pink-400 font-bold block">{c.label}</span>
                            <h4 className="text-xs font-black text-amber-300">{c.name}</h4>
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{c.desc}</p>
                          </div>
                        </motion.div>
                      ))}

                      <button
                        onClick={handleDrawTarot}
                        className="w-full py-2.5 rounded-2xl bg-white/10 text-slate-300 text-xs font-bold active:scale-95"
                      >
                        🔄 نیت مجدد
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Astrology Natal Chart */
                <div className="space-y-3 text-right">
                  {!generatedChart ? (
                    <div className="space-y-2.5">
                      <p className="text-xs text-slate-300">اطلاعات تولد خود را جهت محاسبه چارت آسترولوژی وارد نمایید:</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">تاریخ تولد:</label>
                          <input
                            type="text"
                            value={birthDate}
                            onChange={e => setBirthDate(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">ساعت تولد:</label>
                          <input
                            type="text"
                            value={birthTime}
                            onChange={e => setBirthTime(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">شهر محل تولد:</label>
                        <input
                          type="text"
                          value={birthCity}
                          onChange={e => setBirthCity(e.target.value)}
                          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                        />
                      </div>

                      <button
                        onClick={handleGenerateChart}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-lg active:scale-95 mt-2"
                      >
                        🌌 محاسبه چارت کیهانی من
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 p-4 rounded-3xl bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border border-purple-500/40">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                          <Sun size={14} className="text-yellow-400 mx-auto" />
                          <span className="text-[9px] text-slate-400 block mt-1">نشان خورشیدی</span>
                          <span className="font-black text-amber-300">{generatedChart.sunSign}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                          <Moon size={14} className="text-blue-300 mx-auto" />
                          <span className="text-[9px] text-slate-400 block mt-1">نشان ماه</span>
                          <span className="font-black text-blue-200">{generatedChart.moonSign}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                          <Compass size={14} className="text-pink-400 mx-auto" />
                          <span className="text-[9px] text-slate-400 block mt-1">طالع (طالع‌نما)</span>
                          <span className="font-black text-pink-300">{generatedChart.ascendant}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed pt-2">
                        ✨ <span className="font-bold text-amber-300">عنصر غالب:</span> {generatedChart.element}
                      </p>
                      <p className="text-xs text-purple-200 leading-relaxed font-bold">
                        📜 {generatedChart.destinyQuote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
