import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, DollarSign, Wallet, Plus, Trash2, PiggyBank, Target, Calculator, ArrowUpRight, ArrowDownRight, Check, BookOpen, ChevronDown, ChevronUp, Sparkles, Shield, Archive, Bookmark
} from 'lucide-react';
import useAppStore from '../store/appStore';
import useSectionsStore from '../store/sectionsStore';
import HabitItem from '../components/ui/HabitItem';
import CustomItemModal from '../components/ui/CustomItemModal';
import SectionWidgets from '../components/ui/SectionWidgets';
import soundEngine from '../utils/audio';
import haptics from '../utils/haptics';
import { WEALTH_ACADEMY_MODULES, WEALTH_ACTION_CHECKLIST } from '../data/wealthData';

const EXPENSE_CATEGORIES = [
  { id: 'food', nameFa: 'خوراک و مواد غذایی', icon: '🍔' },
  { id: 'housing', nameFa: 'مسکن و قبوض', icon: '🏠' },
  { id: 'transport', nameFa: 'حمل‌ونقل و بنزین', icon: '🚗' },
  { id: 'health', nameFa: 'سلامت و درمان', icon: '💊' },
  { id: 'education', nameFa: 'آموزش و کتاب', icon: '📚' },
  { id: 'entertainment', nameFa: 'تفریح و گردش', icon: '🎮' },
  { id: 'shopping', nameFa: 'پوشاک و خرید شخصی', icon: '🛍️' },
  { id: 'other', nameFa: 'سایر هزینه‌ها', icon: '📦' }
];

const INCOME_CATEGORIES = [
  { id: 'salary', nameFa: 'حقوق ثابت', icon: '💼' },
  { id: 'freelance', nameFa: 'پروژه و فریلنسری', icon: '💻' },
  { id: 'investment', nameFa: 'سرمایه‌گذاری و سود', icon: '📈' },
  { id: 'gift', nameFa: 'هدیه و پاداش', icon: '🎁' },
  { id: 'other', nameFa: 'سایر درآمدها', icon: '➕' }
];

export default function Wealth() {
  const { language, addXP, learningVault, toggleVaultItem } = useAppStore();
  const { 
    habits, todayLogs, loadHabits, toggleHabit, deleteHabit,
    finances, financeGoals, loadFinances, addFinance, deleteFinance, addFinanceGoal, updateFinanceGoal
  } = useSectionsStore();
  const isRtl = language === 'fa';

  const [currency, setCurrency] = useState('toman'); // 'toman' | 'usd'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'income' | 'expense'

  // Modals
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // New Tx Form
  const [txType, setTxType] = useState('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState(EXPENSE_CATEGORIES[0].nameFa);
  const [txNote, setTxNote] = useState('');

  // New Goal Form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('0');
  const [goalDeadline, setGoalDeadline] = useState('');

  // Add progress to goal modal
  const [activeGoalToFund, setActiveGoalToFund] = useState(null);
  const [fundAmount, setFundAmount] = useState('');

  // Compound interest calculator state
  const [initialCapital, setInitialCapital] = useState(20000000);
  const [monthlyDeposit, setMonthlyDeposit] = useState(3000000);
  const [annualRate, setAnnualRate] = useState(25);
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  const [completedChecklist, setCompletedChecklist] = useState({});

  useEffect(() => {
    loadHabits('wealth');
    loadFinances();
  }, [loadHabits, loadFinances]);

  // Calculations
  const totalIncome = finances
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const totalExpense = finances
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const netSavings = totalIncome - totalExpense;

  const formatMoney = (val) => {
    const num = Math.round(Number(val) || 0);
    return num.toLocaleString('fa-IR');
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!txAmount || Number(txAmount) <= 0) return;

    await addFinance({
      type: txType,
      amount: Number(txAmount),
      category: txCategory,
      note: txNote.trim()
    });

    addXP(10, 'ثبت تراکنش مالی');
    setTxAmount('');
    setTxNote('');
    setIsAddTxModalOpen(false);
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTarget) return;

    await addFinanceGoal({
      title: goalTitle.trim(),
      targetAmount: Number(goalTarget),
      currentAmount: Number(goalCurrent) || 0,
      deadline: goalDeadline,
      icon: '🎯',
      color: '#22c55e'
    });

    addXP(15, 'تعریف هدف مالی');
    setGoalTitle('');
    setGoalTarget('');
    setGoalCurrent('0');
    setIsAddGoalModalOpen(false);
  };

  const handleFundGoal = async (e) => {
    e.preventDefault();
    if (!activeGoalToFund || !fundAmount) return;

    const newAmount = Number(activeGoalToFund.currentAmount || 0) + Number(fundAmount);
    await updateFinanceGoal(activeGoalToFund.id, newAmount);

    soundEngine.playLevelUp();
    addXP(20, 'افزایش پس‌انداز هدف');
    setActiveGoalToFund(null);
    setFundAmount('');
  };

  // Compound Interest Calculation
  const calculateCompoundInterest = () => {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    let futureValue = initialCapital * Math.pow(1 + r, n);
    for (let i = 1; i <= n; i++) {
      futureValue += monthlyDeposit * Math.pow(1 + r, n - i);
    }
    const totalContributed = initialCapital + monthlyDeposit * n;
    const totalProfit = futureValue - totalContributed;
    return { futureValue, totalContributed, totalProfit };
  };

  const compoundResult = calculateCompoundInterest();
  const filteredFinances = finances.filter((f) => filterType === 'all' || f.type === filterType);
  const wealthHabits = habits.filter((h) => h.sectionId === 'wealth');

  return (
    <div className="page-container flex flex-col gap-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <span>💰</span>
            {isRtl ? 'درآمد، ثروت و مدیریت مالی' : 'Income & Wealth Management'}
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isRtl ? 'سواد مالی، ردیابی بودجه، اهداف پس‌انداز و رشد سرمایه' : 'Financial literacy, budget tracking, savings vaults & compound growth'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          <Link
            to="/history?section=wealth"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)] text-xs font-bold transition-all"
          >
            <Archive size={16} />
            <span>{isRtl ? 'تاریخچه' : 'History'}</span>
          </Link>
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>{isRtl ? 'افزودن تمرین مالی' : 'Add Habit'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: BALANCE & STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Income */}
        <div className="glass-card p-4 rounded-3xl border-t-4 border-t-[var(--success)] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-semibold">{isRtl ? 'مجموع درآمد' : 'Total Income'}</span>
            <div className="p-1.5 rounded-xl bg-[var(--success)]/15 text-[var(--success)]">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-xl font-black text-[var(--success)] tabular-nums">
            +{formatMoney(totalIncome)} <span className="text-xs font-normal">{isRtl ? 'تومان' : 'Toman'}</span>
          </div>
        </div>

        {/* Expenses */}
        <div className="glass-card p-4 rounded-3xl border-t-4 border-t-[var(--danger)] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-semibold">{isRtl ? 'مجموع هزینه‌ها' : 'Total Expenses'}</span>
            <div className="p-1.5 rounded-xl bg-[var(--danger)]/15 text-[var(--danger)]">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div className="text-xl font-black text-[var(--danger)] tabular-nums">
            -{formatMoney(totalExpense)} <span className="text-xs font-normal">{isRtl ? 'تومان' : 'Toman'}</span>
          </div>
        </div>

        {/* Net Savings */}
        <div className="glass-card p-4 rounded-3xl border-t-4 border-t-[var(--accent)] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-semibold">{isRtl ? 'خالص پس‌انداز' : 'Net Savings'}</span>
            <div className="p-1.5 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
              <Wallet size={16} />
            </div>
          </div>
          <div className={`text-xl font-black tabular-nums ${netSavings >= 0 ? 'text-[var(--accent)]' : 'text-[var(--danger)]'}`}>
            {formatMoney(netSavings)} <span className="text-xs font-normal">{isRtl ? 'تومان' : 'Toman'}</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: TRANSACTION LEDGER */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-[var(--accent)]" size={20} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {isRtl ? 'دفترچه تراکنش‌های اخیر' : 'Recent Transactions'}
            </h2>
          </div>

          <button
            onClick={() => setIsAddTxModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-90 active:scale-95"
          >
            <Plus size={14} />
            <span>{isRtl ? 'تراکنش جدید' : 'Add Tx'}</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'all', label: isRtl ? 'همه تراکنش‌ها' : 'All' },
            { id: 'income', label: isRtl ? 'درآمدها' : 'Income' },
            { id: 'expense', label: isRtl ? 'هزینه‌ها' : 'Expenses' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filterType === f.id
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {filteredFinances.length > 0 ? (
          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredFinances.map((tx) => (
              <div
                key={tx.id}
                className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                      tx.type === 'income' ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--danger)]/20 text-[var(--danger)]'
                    }`}
                  >
                    {tx.type === 'income' ? '↗' : '↘'}
                  </div>
                  <div>
                    <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                      {tx.category}
                    </span>
                    {tx.note && (
                      <span className="text-[10px] text-[var(--text-secondary)]">{tx.note}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-black tabular-nums ${
                      tx.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--danger)]'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)} {isRtl ? 'تومان' : ''}
                  </span>
                  <button
                    onClick={() => deleteFinance(tx.id)}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--danger)]"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[var(--text-secondary)]">
            {isRtl ? 'تراکنشی ثبت نشده است. دکمه "تراکنش جدید" را بزنید.' : 'No transactions found. Tap "Add Tx" to log one.'}
          </div>
        )}
      </div>

      {/* SECTION 3: FINANCIAL SAVINGS GOALS & VAULTS */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PiggyBank className="text-[var(--success)]" size={20} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {isRtl ? 'اهداف مالی و صندوق‌های پس‌انداز' : 'Financial Goals & Savings Vaults'}
            </h2>
          </div>

          <button
            onClick={() => setIsAddGoalModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--accent)] hover:border-[var(--accent)] active:scale-95"
          >
            <Plus size={14} />
            <span>{isRtl ? 'هدف جدید' : 'New Goal'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {financeGoals.map((goal) => {
            const percentage = Math.min(
              100,
              Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100)
            );
            return (
              <div
                key={goal.id}
                className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{goal.icon || '🎯'}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                      {goal.title}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[var(--accent)]">{percentage}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: goal.color || 'var(--success)'
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>{formatMoney(goal.currentAmount)} / {formatMoney(goal.targetAmount)} تومان</span>
                  <button
                    onClick={() => setActiveGoalToFund(goal)}
                    className="px-2.5 py-1 rounded-xl bg-[var(--accent)] text-white text-[10px] font-bold hover:opacity-90 active:scale-95"
                  >
                    + {isRtl ? 'واریز پس‌انداز' : 'Add Funds'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: COMPOUND INTEREST CALCULATOR & 50/30/20 RULE */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="text-[#eab308]" size={20} />
          <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {isRtl ? 'ماشین‌حساب جادوی سود مرکب (Compound Interest)' : 'Compound Interest Simulator'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Inputs */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                {isRtl ? 'سرمایه اولیه (تومان):' : 'Initial Capital:'}
              </label>
              <input
                type="number"
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                {isRtl ? 'پس‌انداز ماهانه جدید (تومان):' : 'Monthly Contribution:'}
              </label>
              <input
                type="number"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'بازدهی سالانه (%):' : 'Annual Return %:'}
                </label>
                <input
                  type="number"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'افق زمانی (سال):' : 'Time Horizon (Years):'}
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Results Output */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--accent)]/15 to-purple-900/10 border border-[var(--accent)]/40 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--accent)] block mb-1">
                {isRtl ? `ثروت پیش‌بینی‌شده پس از ${years} سال:` : `Projected Wealth in ${years} Years:`}
              </span>
              <div className="text-2xl font-black text-[var(--accent)] tabular-nums mb-3">
                {formatMoney(compoundResult.futureValue)} <span className="text-xs">{isRtl ? 'تومان' : ''}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-xs border-t border-[var(--border)] pt-2.5">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>{isRtl ? 'اصل پول واریزی شما:' : 'Total Contributed:'}</span>
                <span className="font-bold">{formatMoney(compoundResult.totalContributed)}</span>
              </div>
              <div className="flex justify-between text-[var(--success)]">
                <span>{isRtl ? 'سود مرکب خالص حاصل‌شده:' : 'Compound Interest Profit:'}</span>
                <span className="font-bold">+{formatMoney(compoundResult.totalProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: WEALTH ACADEMY & FINANCIAL MASTERY */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <BookOpen size={18} className="text-emerald-500" />
            <span>{isRtl ? 'آکادمی هوش مالی و سرمایه‌گذاری' : 'Financial Intelligence Academy'}</span>
          </h2>
          <span className="text-xs text-[var(--text-secondary)]">
            {WEALTH_ACADEMY_MODULES.length} {isRtl ? 'درس جامع' : 'masteries'}
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {isRtl
            ? 'دانش کاربردی و اصول رفتاری برای عبور از تورم، بودجه‌بندی نفوذناپذیر و ساختن استقلال مالی پایدار.'
            : 'Actionable financial intelligence to beat inflation, master budgeting, and build lasting wealth.'}
        </p>

        {/* Modules Accordion Grid */}
        <div className="space-y-3">
          {WEALTH_ACADEMY_MODULES.map((mod) => {
            const isExpanded = expandedArticleId === mod.id;
            return (
              <div
                key={mod.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isExpanded
                    ? 'bg-[var(--bg-secondary)] border-emerald-500/50 shadow-md'
                    : 'bg-[var(--bg-secondary)]/50 border-[var(--border)] hover:border-emerald-500/30'
                }`}
              >
                <div
                  onClick={() => {
                    setExpandedArticleId(isExpanded ? null : mod.id);
                    haptics.tap();
                  }}
                  className="flex items-center justify-between cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">{mod.icon}</span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {isRtl ? mod.titleFa : mod.titleEn}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--text-secondary)]">
                        <span className="font-semibold text-emerald-400">{isRtl ? mod.categoryFa : mod.categoryEn}</span>
                        <span>•</span>
                        <span>{isRtl ? mod.readTimeFa : mod.readTimeEn}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bookmark to Vault button */}
                    {(() => {
                      const isSaved = (learningVault || []).some(v => v.id === `wealth_${mod.id}` || v.title === mod.titleFa);
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVaultItem({
                              id: `wealth_${mod.id}`,
                              title: isRtl ? mod.titleFa : mod.titleEn,
                              titleFa: mod.titleFa,
                              categoryFa: 'ثروت و هوش مالی',
                              categoryEn: 'Wealth & Finance',
                              meaningFa: mod.keyTakeawayFa || mod.summaryEn,
                              descFa: mod.contentFa,
                              sectionId: 'wealth',
                              type: 'wealth',
                              icon: mod.icon || '💰'
                            });
                          }}
                          className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                            isSaved
                              ? 'bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                              : 'bg-white/5 border-[var(--border)] text-slate-400 hover:text-amber-300 hover:border-amber-500/40'
                          }`}
                          title={isSaved ? (isRtl ? 'در گنجینه ذخیره است' : 'Saved in Vault') : (isRtl ? 'افزودن به گنجینه' : 'Add to Vault')}
                        >
                          <Bookmark size={13} className={isSaved ? 'fill-current' : ''} />
                          <span className="text-[10px] hidden sm:inline">{isSaved ? (isRtl ? 'در گنجینه' : 'Saved') : (isRtl ? '💎 گنجینه' : '💎 Vault')}</span>
                        </button>
                      );
                    })()}

                    <button className="p-1 text-[var(--text-secondary)]">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-primary)] leading-relaxed space-y-3"
                    >
                      <div className="whitespace-pre-line font-medium leading-loose text-slate-200">
                        {isRtl ? mod.contentFa : mod.summaryEn}
                      </div>

                      {mod.keyTakeawayFa && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center gap-2">
                          <Sparkles size={14} className="flex-shrink-0" />
                          <span>{isRtl ? `نکته کلیدی: ${mod.keyTakeawayFa}` : mod.keyTakeawayFa}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Actionable Wealth Checklist */}
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <h3 className="text-xs font-bold text-[var(--text-primary)] mb-2.5 flex items-center gap-1.5">
            <Shield size={14} className="text-emerald-400" />
            <span>{isRtl ? 'چک‌لیست هفتگی تسلط بر ثروت:' : 'Weekly Wealth Action Checklist:'}</span>
          </h3>

          <div className="space-y-2">
            {WEALTH_ACTION_CHECKLIST.map((item) => {
              const isDone = !!completedChecklist[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setCompletedChecklist(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                    if (!isDone) {
                      soundEngine.playCheckmark();
                      haptics.success();
                      addXP(item.xp, item.titleFa);
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isDone ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[var(--border)]'}`}>
                      {isDone && <Check size={11} strokeWidth={3} />}
                    </div>
                    <span className={isDone ? 'line-through opacity-80' : ''}>
                      {isRtl ? item.titleFa : item.titleEn}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                    +{item.xp} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 6: HABITS */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border)]">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <span>💎</span>
          {isRtl ? 'عادت‌های روزانه ثروت‌سازی' : 'Daily Wealth Habits'}
        </h2>

        <div className="flex flex-col gap-2.5">
          {wealthHabits.map((item) => (
            <HabitItem
              key={item.id}
              item={item}
              completed={!!todayLogs[item.id]}
              onToggle={() => {
                toggleHabit(item.id);
                if (!todayLogs[item.id]) {
                  addXP(item.xp || 15, item.nameFa || item.name);
                }
              }}
              onDelete={() => deleteHabit(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Modal: Add Transaction */}
      {isAddTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-3xl border border-[var(--border)]"
            style={{ background: 'var(--bg-card)' }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {isRtl ? 'ثبت تراکنش مالی جدید' : 'Add New Transaction'}
            </h3>

            <form onSubmit={handleAddTransaction} className="flex flex-col gap-3.5">
              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('expense');
                    setTxCategory(EXPENSE_CATEGORIES[0].nameFa);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    txType === 'expense' ? 'bg-[var(--danger)] text-white shadow-sm' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {isRtl ? 'هزینه (پرداخت)' : 'Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('income');
                    setTxCategory(INCOME_CATEGORIES[0].nameFa);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    txType === 'income' ? 'bg-[var(--success)] text-white shadow-sm' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {isRtl ? 'درآمد (دریافت)' : 'Income'}
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'مبلغ (تومان) *' : 'Amount *'}
                </label>
                <input
                  type="number"
                  required
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: ۲۵۰۰۰۰' : 'e.g., 250000'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'دسته‌بندی' : 'Category'}
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {(txType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                    <option key={cat.id} value={cat.nameFa}>
                      {cat.icon} {cat.nameFa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'یادداشت یا توضیحات (اختیاری)' : 'Note'}
                </label>
                <input
                  type="text"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  placeholder={isRtl ? 'توضیحات کوتاه...' : 'Short description...'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTxModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)]"
                >
                  {isRtl ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-90"
                >
                  {isRtl ? 'ثبت تراکنش (+۱۰ XP)' : 'Save (+10 XP)'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Add Goal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 rounded-3xl border border-[var(--border)]"
            style={{ background: 'var(--bg-card)' }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {isRtl ? 'تعریف هدف مالی و پس‌انداز جدید' : 'New Financial Goal'}
            </h3>

            <form onSubmit={handleAddGoal} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'عنوان هدف *' : 'Goal Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: خرید لپ‌تاپ جدید، سفر...' : 'e.g., Laptop, Travel...'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'مبلغ کل هدف (تومان) *' : 'Target Amount (Toman) *'}
                </label>
                <input
                  type="number"
                  required
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: ۵۰۰۰۰۰۰۰' : '50000000'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'موجودی اولیه فعلی (اختیاری)' : 'Current Amount (Optional)'}
                </label>
                <input
                  type="number"
                  value={goalCurrent}
                  onChange={(e) => setGoalCurrent(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)]"
                >
                  {isRtl ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-90"
                >
                  {isRtl ? 'ایجاد هدف (+۱۵ XP)' : 'Create Goal (+15 XP)'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal: Fund Goal */}
      {activeGoalToFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-sm p-6 rounded-3xl border border-[var(--border)]"
            style={{ background: 'var(--bg-card)' }}
          >
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {isRtl ? `واریز پس‌انداز به «${activeGoalToFund.title}»` : `Add Funds to ${activeGoalToFund.title}`}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              {isRtl ? `موجودی فعلی: ${formatMoney(activeGoalToFund.currentAmount)} تومان` : `Current: ${formatMoney(activeGoalToFund.currentAmount)}`}
            </p>

            <form onSubmit={handleFundGoal} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'مبلغ واریزی جدید (تومان) *' : 'Amount to add *'}
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder={isRtl ? 'مثلاً: ۲۰۰۰۰۰۰' : '2000000'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setActiveGoalToFund(null)}
                  className="flex-1 py-2.5 rounded-2xl border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)]"
                >
                  {isRtl ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-[var(--success)] text-white text-xs font-bold shadow-md hover:opacity-90"
                >
                  {isRtl ? 'ثبت واریز (+۲۰ XP)' : 'Deposit (+20 XP)'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Custom Widgets Section */}
      <SectionWidgets sectionId="wealth" />

      {/* Custom Item Modal */}
      <CustomItemModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        sectionId="wealth"
        sectionTitle={isRtl ? 'درآمد و ثروت' : 'Wealth'}
      />
    </div>
  );
}
