import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { ArrowLeft, Activity, Battery, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAppStore from '../store/appStore';
import { db, getToday } from '../db/database';
import soundEngine from '../utils/audio';

export default function Analytics() {
  const { language } = useAppStore();
  const isRtl = language === 'fa';

  const [energyLogs, setEnergyLogs] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [selectedEnergy, setSelectedEnergy] = useState(3);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const eLogs = await db.energyLogs.toArray();
    setEnergyLogs(eLogs);
    
    const hLogs = await db.habitLogs.toArray();
    setHabitLogs(hLogs);
  };

  const handleLogEnergy = async () => {
    const today = getToday();
    const hour = new Date().getHours();
    let timeOfDay = 'Morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'Afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'Evening';
    else if (hour >= 21 || hour < 5) timeOfDay = 'Night';

    await db.energyLogs.add({
      date: today,
      timeOfDay,
      energyLevel: selectedEnergy,
      timestamp: Date.now()
    });
    
    soundEngine.playCheckmark();
    loadData();
  };

  // Process data for Energy Chart
  const energyData = energyLogs.reduce((acc, log) => {
    const d = new Date(log.timestamp);
    const hour = d.getHours();
    const existing = acc.find(item => item.hour === hour);
    if (existing) {
      existing.totalEnergy += log.energyLevel;
      existing.count += 1;
    } else {
      acc.push({ hour, totalEnergy: log.energyLevel, count: 1 });
    }
    return acc;
  }, []);
  
  const formattedEnergyData = energyData.map(d => ({
    hour: `${d.hour}:00`,
    avgEnergy: (d.totalEnergy / d.count).toFixed(1)
  })).sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  // If no data, provide mock data for the chart visualization
  const displayEnergyData = formattedEnergyData.length > 0 ? formattedEnergyData : [
    { hour: '08:00', avgEnergy: 3 },
    { hour: '11:00', avgEnergy: 4.5 },
    { hour: '14:00', avgEnergy: 2.5 },
    { hour: '17:00', avgEnergy: 3.5 },
    { hour: '20:00', avgEnergy: 2 },
  ];

  // Heatmap generation
  const today = new Date();
  const daysInYear = Array.from({ length: 90 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (89 - i));
    return d.toISOString().split('T')[0];
  });

  const heatmapData = daysInYear.map(date => {
    const count = habitLogs.filter(l => l.date === date && l.completed).length;
    return { date, count };
  });

  const getColorForCount = (count) => {
    if (count === 0) return 'var(--bg-secondary)';
    if (count <= 2) return '#10b98140'; // Emerald 25%
    if (count <= 4) return '#10b98180'; // Emerald 50%
    if (count <= 6) return '#10b981c0'; // Emerald 75%
    return '#10b981'; // Emerald 100%
  };

  return (
    <div className="page-container flex flex-col h-[calc(100vh-80px)] overflow-y-auto pb-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 mb-2">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white">
            <ArrowLeft size={18} className={isRtl ? 'rotate-180' : ''} />
          </Link>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2 text-cyan-400">
              <Activity size={20} />
              <span>{isRtl ? 'آنالیز پیشرفته' : 'Advanced Analytics'}</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {isRtl ? 'هیت‌مپ استمرار و نقشه انرژی' : 'Consistency heatmap & energy map'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Energy Logger */}
        <div className="glass-card p-5 rounded-3xl border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <Battery size={18} className="text-amber-400" />
            <h3 className="font-bold text-sm">{isRtl ? 'ثبت انرژی الان شما' : 'Log Current Energy'}</h3>
          </div>
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedEnergy(lvl)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedEnergy === lvl 
                    ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                    : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogEnergy}
            className="w-full py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-bold hover:bg-[var(--bg-secondary)]"
          >
            {isRtl ? 'ثبت در نقشه انرژی' : 'Log to Energy Map'}
          </button>
        </div>

        {/* Circadian Energy Map */}
        <div className="glass-card p-5 rounded-3xl border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-blue-400" />
            <h3 className="font-bold text-sm">{isRtl ? 'نقشه ریتم انرژی شما' : 'Circadian Energy Map'}</h3>
          </div>
          <div className="h-48 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayEnergyData}>
                <defs>
                  <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="hour" stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 5]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="avgEnergy" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEnergy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] text-center mt-2">
            {isRtl ? 'بر اساس ثبت انرژی در ساعات مختلف' : 'Based on logged energy at different hours'}
          </p>
        </div>

        {/* Habit Heatmap */}
        <div className="glass-card p-5 rounded-3xl border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon size={18} className="text-emerald-400" />
            <h3 className="font-bold text-sm">{isRtl ? 'هیت‌مپ استمرار (۹۰ روز اخیر)' : 'Consistency Heatmap (Last 90 Days)'}</h3>
          </div>
          
          <div className="flex flex-wrap gap-1.5 justify-end" dir="ltr">
            {heatmapData.map((day, i) => (
              <div 
                key={day.date}
                className="w-3.5 h-3.5 rounded-sm"
                style={{ backgroundColor: getColorForCount(day.count) }}
                title={`${day.date}: ${day.count} habits completed`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 text-[10px] text-[var(--text-secondary)]" dir="ltr">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-[var(--bg-secondary)]" />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#10b98140' }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#10b98180' }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#10b981c0' }} />
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#10b981' }} />
            </div>
            <span>More</span>
          </div>
        </div>

      </div>
    </div>
  );
}
