import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Trophy, AlertTriangle, ShieldCheck, Target, Award, 
  HelpCircle, BookOpen, Compass, Zap, Move, Globe
} from 'lucide-react';
import soundEngine from '../../utils/audio';

export default function SnookerRulesModal({ isOpen, onClose, isRtl: initialIsRtl = true }) {
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'controls' | 'tactics'
  const [lang, setLang] = useState(initialIsRtl ? 'fa' : 'en');
  const isRtl = lang === 'fa';

  if (!isOpen) return null;

  const balls = [
    { nameFa: 'قرمز (۱۵ عدد)', nameEn: 'Red (15)', pts: 1, color: '#dc2626' },
    { nameFa: 'زرد', nameEn: 'Yellow', pts: 2, color: '#eab308' },
    { nameFa: 'سبز', nameEn: 'Green', pts: 3, color: '#16a34a' },
    { nameFa: 'قهوه‌ای', nameEn: 'Brown', pts: 4, color: '#854d0e' },
    { nameFa: 'آبی', nameEn: 'Blue', pts: 5, color: '#2563eb' },
    { nameFa: 'صورتی', nameEn: 'Pink', pts: 6, color: '#ec4899' },
    { nameFa: 'مشکی', nameEn: 'Black', pts: 7, color: '#18181b' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-lg bg-gradient-to-b from-[#111625] via-[#0d111d] to-[#080a12] border border-indigo-500/30 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col text-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎱</span>
              <div>
                <h3 className="text-base font-black text-white leading-tight">
                  {isRtl ? 'آموزش و قوانین رسمی اسنوکر' : 'Snooker Guide & Official Rules'}
                </h3>
                <p className="text-[10px] text-indigo-400 font-bold">
                  {isRtl ? 'راهنمای جامع بازی، نحوه کنترل و قوانین بین‌المللی' : 'Complete Gameplay, Controls & WPBSA Rules'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => {
                  soundEngine?.playTap?.();
                  setLang(prev => (prev === 'fa' ? 'en' : 'fa'));
                }}
                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-300 font-bold text-[11px] flex items-center gap-1.5 transition-colors"
                title="تغییر زبان / Switch Language"
              >
                <Globe size={13} />
                <span>{lang === 'fa' ? 'English' : 'فارسی'}</span>
              </button>

              <button
                onClick={() => { soundEngine?.playTap?.(); onClose(); }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-2xl bg-black/40 p-1 border border-white/10 gap-1 text-xs">
            <button
              onClick={() => { soundEngine?.playTap?.(); setActiveTab('rules'); }}
              className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'rules'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen size={14} />
              <span>{isRtl ? 'قوانین و امتیازات' : 'Rules & Points'}</span>
            </button>

            <button
              onClick={() => { soundEngine?.playTap?.(); setActiveTab('controls'); }}
              className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'controls'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Move size={14} />
              <span>{isRtl ? 'کنترل و ضربه' : 'Controls & Cue'}</span>
            </button>

            <button
              onClick={() => { soundEngine?.playTap?.(); setActiveTab('tactics'); }}
              className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'tactics'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass size={14} />
              <span>{isRtl ? 'ترفند و استراتژی' : 'Tactics & Break'}</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="overflow-y-auto space-y-3.5 text-xs pr-1 custom-scrollbar flex-1">
            {activeTab === 'rules' && (
              <>
                {/* 1. Ball Points */}
                <div>
                  <h4 className="font-black text-amber-400 mb-2 flex items-center gap-1.5">
                    <Target size={14} />
                    <span>{isRtl ? 'ارزش امتیازی توپ‌ها (۲۲ توپ رسمی)' : 'Ball Point Values (22 Official Balls)'}</span>
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center">
                    {balls.map((b, idx) => (
                      <div key={idx} className="p-2 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-1 shadow-sm">
                        <span
                          className="w-4 h-4 rounded-full shadow-md border border-white/20"
                          style={{ backgroundColor: b.color }}
                        />
                        <span className="text-[10px] text-slate-300 font-bold">{isRtl ? b.nameFa : b.nameEn}</span>
                        <span className="text-xs font-mono font-black text-amber-400">+{b.pts}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Order of Play */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                  <h4 className="font-black text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck size={15} />
                    <span>{isRtl ? 'چرخه بازی و بریک زدن (Order of Play)' : 'Order of Play & Breaks'}</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                    <li>{isRtl ? '۱. بازی همیشه با هدف‌گیری یک توپ قرمز آغاز می‌شود (۱ امتیاز).' : '1. Must hit and pot a Red ball first (+1 point).'}</li>
                    <li>{isRtl ? '۲. پس از پاکت شدن قرمز، باید یک توپ رنگی (زرد تا مشکی) را نامزد کرده و پاکت کنید (۲ تا ۷ امتیاز).' : '2. After potting a Red, nominate and pot any Colour (+2 to +7 points).'}</li>
                    <li>{isRtl ? '۳. مادامی که قرمز روی میز باقی مانده، توپ‌های رنگی پس از پاکت شدن مجدداً به نقطه اصلی‌شان برمی‌گردند.' : '3. As long as Reds remain, pocketed Colours respawn on their original spots.'}</li>
                    <li>{isRtl ? '۴. این چرخه مداوم (قرمز ⬅️ رنگی دلخواه ⬅️ قرمز) تا پاکت شدن تمام ۱۵ توپ قرمز ادامه می‌یابد.' : '4. Continue alternating Red -> Colour until all 15 Reds are cleared.'}</li>
                    <li>{isRtl ? '۵. فاز پایانی (Sequence): ۶ توپ رنگی باید دقیقاً به ترتیب صعودی پاکت شوند: زرد(۲) ⬅️ سبز(۳) ⬅️ قهوه‌ای(۴) ⬅️ آبی(۵) ⬅️ صورتی(۶) ⬅️ مشکی(۷). در این فاز توپ‌ها ری‌اسپاون نمی‌شوند.' : '5. Final sequence: Pot all 6 colours in ascending order: Yellow(2) -> Green(3) -> Brown(4) -> Blue(5) -> Pink(6) -> Black(7).'}</li>
                  </ul>
                </div>

                {/* 3. Fouls & Penalties */}
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-rose-200">
                  <h4 className="font-black text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle size={15} />
                    <span>{isRtl ? 'خطاها و جریمه‌ها (Fouls & Penalties)' : 'Fouls & Penalties'}</span>
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-rose-300/90">
                    <li>{isRtl ? 'افتادن توپ سفید در پاکت (In-Off): کیوبال پاکت شود، خطا است و توپ در منطقه D به دست حریف داده می‌شود.' : 'Cue ball in pocket (In-Off): Ball-in-hand awarded to opponent inside D zone.'}</li>
                    <li>{isRtl ? 'عدم برخورد با هیچ توپی (Miss): کیوبال به هیچ توپی برخورد نکند.' : 'Miss: Cue ball misses all balls completely.'}</li>
                    <li>{isRtl ? 'برخورد با توپ اشتباه: در نوبت قرمز با رنگی برخورد کنید یا بالعکس.' : 'Hitting wrong target ball first.'}</li>
                    <li>{isRtl ? 'پاکت شدن توپ اشتباه: مثلاً پاکت شدن همزمان رنگی و قرمز.' : 'Potting illegal or unnominated ball.'}</li>
                    <li>{isRtl ? 'میزان جریمه: حداقل ۴ امتیاز به حریف اضافه می‌شود (یا معادل امتیاز بالاترین توپ خطاکار تا ۷ امتیاز).' : 'Penalty points: Minimum 4 points (or involved ball value up to 7 pts) given to opponent.'}</li>
                  </ul>
                </div>
              </>
            )}

            {activeTab === 'controls' && (
              <div className="space-y-3">
                {/* 1. Drag White Ball in D zone */}
                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
                  <h4 className="font-black text-indigo-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white border border-indigo-400" />
                    <span>{isRtl ? 'جابجایی توپ سفید در نیم‌دایره D (بدون نیاز به دابل‌کلیک)' : 'Repositioning Cue Ball in D (Direct Touch)'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isRtl 
                      ? 'در ابتدای بازی یا پس از خطای حریف، برای تغییر جایگاه توپ سفید کافیست انگشت خود را روی توپ سفید بگذارید و آن را آزادانه درون نیم‌دایره D حرکت دهید. با رها کردن دست، توپ در همان نقطه قفل شده و آماده ضربه است!' 
                      : 'At match start or after opponent fouls, simply hold and drag the white ball anywhere inside the D arc. Releasing your finger locks it in position immediately with no confirmation needed!'}
                  </p>
                </div>

                {/* 2. Aiming & Laser */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="font-black text-amber-300 flex items-center gap-2">
                    <Target size={15} className="text-amber-400" />
                    <span>{isRtl ? 'هدف‌گیری چوب و خط راهنما' : 'Aiming & Trajectory Guideline'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isRtl
                      ? 'برای هدف‌گیری، کافیست هر نقطه از میز را لمس کنید تا چوب اسنوکر به همان سمت نشانه برود. خط راهنمای برخورد و خط مسیر توپ هدف به سمت پاکت‌ها نمایش داده می‌شود.'
                      : 'Tap anywhere on the baize to orient your cue stick. Ghost ball alignment and target deflection arrows show the trajectory toward the pockets.'}
                  </p>
                </div>

                {/* 3. Horizontal Strike Slider */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="font-black text-violet-300 flex items-center gap-2">
                    <Zap size={15} className="text-violet-400" />
                    <span>{isRtl ? 'اسلایدر قدرت و دکمه ضربه بزن ↗' : 'Power Slider & Strike Button ↗'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isRtl
                      ? 'در پایین صفحه، اسلایدر افقی بنفش به شما امکان تنظیم قدرت از ۵٪ تا ۱۰۰٪ را می‌دهد. سپس با زدن دکمه «ضربه بزن ↗»، ضربه زده شده و پنل برای مشاهده واضح مسیر توپ‌ها محو می‌گردد.'
                      : 'At the bottom, use the horizontal slider to select power (5% to 100%). Press the Strike button ↗ to fire. The panel disappears instantly for complete view of the table.'}
                  </p>
                </div>

                {/* 4. English & Spin */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="font-black text-sky-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>{isRtl ? 'پیچ، بک‌اسپین (اسکرو) و تاپ‌اسپین' : 'Cue Ball Spin (Screw, Follow & English)'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isRtl
                      ? 'با لمس آیکون توپ سفید در سمت راست صفحه، محل برخورد سرچوب با کیوبال را مشخص کنید: پایین برای بک‌اسپین (برگشت سفید به عقب)، بالا برای تاپ‌اسپین (دنبال کردن توپ) و چپ/راست برای افه بغل.'
                      : 'Tap the cue ball widget on the right to set tip impact: bottom for backspin/screw-back, top for topspin follow-through, and sides for deflection spin.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'tactics' && (
              <div className="space-y-3">
                {/* 1. Maximum Break 147 */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-300">
                  <div>
                    <p className="font-black text-xs">{isRtl ? 'بریک طلایی ۱۴۷ امتیازی (Maximum Break)' : 'Maximum 147 Break'}</p>
                    <p className="text-[10px] text-amber-400/80 leading-relaxed">
                      {isRtl ? '۱۵ قرمز (۱۵×۱) + ۱۵ بار مشکی (۱۵×۷) + ۲۷ امتیاز ۶ رنگی پایانی = ۱۴۷ امتیاز اسطوره‌ای!' : '15 Reds (15) + 15 Blacks (105) + 6 Sequential Colours (27) = 147 perfect points!'}
                    </p>
                  </div>
                  <span className="text-2xl font-mono font-black shrink-0 mr-2">۱۴۷ 👑</span>
                </div>

                {/* 2. Snooker Concept */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="font-black text-emerald-400">{isRtl ? 'اسنوکر کردن حریف چیست؟' : 'What is a "Snooker"?'}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isRtl
                      ? 'وقتی کیوبال پشت یک توپ دیگر پنهان شود به گونه‌ای که حریف دید مستقیم به توپ هدف خود نداشته باشد، حریف «اسنوکر» شده و مجبور است با باند ضربه بزند که احتمال خطا و کسب امتیاز خطا برای شما بسیار بالا می‌رود.'
                      : 'When the cue ball is hidden behind an intervening ball so that the opponent cannot hit both edges of a legal ball directly, they are snookered and must escape off cushions.'}
                  </p>
                </div>

                {/* 3. Safety Play */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                  <h4 className="font-black text-cyan-400">{isRtl ? 'بازی دفاعی (Safety Play)' : 'Safety Play'}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {isRtl
                      ? 'اگر موقعیت پاکت کردن مناسبی وجود ندارد، سعی نکنید شانس خود را با شوت‌های پرریسک امتحان کنید. توپ سفید را به آرامی به باند بالایی (نزدیک مشکی) یا برعکس به باند پایینی پشت قهوه‌ای و سبز بفرستید تا نوبت به حریف با موقعیتی دشوار واگذار شود.'
                      : 'When no clear pot is on, play a defensive safety shot: gently touch a legal red and tuck the cue ball safe against the baulk cushion to leave your opponent in trouble.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <button
            onClick={() => { soundEngine?.playTap?.(); onClose(); }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
          >
            {isRtl ? 'متوجه شدم، بزن بریم مسابقه 🎱' : 'Understood, Let’s Play! 🎱'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
