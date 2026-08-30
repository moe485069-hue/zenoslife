import React, { useState, useEffect } from 'react';
import jalaali from 'jalaali-js';
import clsx from 'clsx';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const PERSIAN_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const GREGORIAN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const FA_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const EN_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CalendarView = ({ selectedDate, onDateSelect, tasks = [], mode = 'jalali', onModeChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Use useEffect to sync internal date if needed
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(new Date(selectedDate));
    }
  }, [selectedDate]);

  const isJalali = mode === 'jalali';
  const jDate = jalaali.toJalaali(currentDate);

  const currentMonthName = isJalali ? PERSIAN_MONTHS[jDate.jm - 1] : GREGORIAN_MONTHS[currentDate.getMonth()];
  const currentYear = isJalali ? jDate.jy : currentDate.getFullYear();

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    if (isJalali) {
      let { jy, jm } = jalaali.toJalaali(newDate);
      jm -= 1;
      if (jm < 1) { jm = 12; jy -= 1; }
      const g = jalaali.toGregorian(jy, jm, 1);
      setCurrentDate(new Date(g.gy, g.gm - 1, g.gd));
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    if (isJalali) {
      let { jy, jm } = jalaali.toJalaali(newDate);
      jm += 1;
      if (jm > 12) { jm = 1; jy += 1; }
      const g = jalaali.toGregorian(jy, jm, 1);
      setCurrentDate(new Date(g.gy, g.gm - 1, g.gd));
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
    }
  };

  const getDaysInMonth = () => {
    if (isJalali) {
      return jalaali.jalaaliMonthLength(jDate.jy, jDate.jm);
    }
    return new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    if (isJalali) {
      const g = jalaali.toGregorian(jDate.jy, jDate.jm, 1);
      const d = new Date(g.gy, g.gm - 1, g.gd).getDay();
      return (d + 1) % 7; // Adjust for saturday start in Jalali
    }
    return new Date(currentYear, currentDate.getMonth(), 1).getDay();
  };

  const generateDays = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handleDayClick = (day) => {
    if (!day) return;
    let selected;
    if (isJalali) {
      const g = jalaali.toGregorian(jDate.jy, jDate.jm, day);
      selected = new Date(g.gy, g.gm - 1, g.gd);
    } else {
      selected = new Date(currentYear, currentDate.getMonth(), day);
    }
    
    // Format YYYY-MM-DD
    const dateStr = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`;
    onDateSelect(dateStr);
  };

  const getTasksForDay = (day) => {
    if (!day) return [];
    let d;
    if (isJalali) {
      const g = jalaali.toGregorian(jDate.jy, jDate.jm, day);
      d = new Date(g.gy, g.gm - 1, g.gd);
    } else {
      d = new Date(currentYear, currentDate.getMonth(), day);
    }
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return tasks.filter(t => t.date === dateStr);
  };

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const isDaySelected = (day) => {
    if (!day || !selectedDate) return false;
    let d;
    if (isJalali) {
      const g = jalaali.toGregorian(jDate.jy, jDate.jm, day);
      d = new Date(g.gy, g.gm - 1, g.gd);
    } else {
      d = new Date(currentYear, currentDate.getMonth(), day);
    }
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return dateStr === selectedDate;
  };

  const isDayToday = (day) => {
    if (!day) return false;
    let d;
    if (isJalali) {
      const g = jalaali.toGregorian(jDate.jy, jDate.jm, day);
      d = new Date(g.gy, g.gm - 1, g.gd);
    } else {
      d = new Date(currentYear, currentDate.getMonth(), day);
    }
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return dateStr === todayStr;
  };

  const daysLabels = isJalali ? FA_DAYS : EN_DAYS;

  return (
    <div className="glass-card rounded-2xl p-4 select-none">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-[var(--bg-secondary)]">
          <ChevronRight className={isJalali ? '' : 'rotate-180'} />
        </button>
        <div className="flex flex-col items-center">
          <h3 className="font-bold text-lg">{currentMonthName} {currentYear}</h3>
          <button 
            onClick={() => onModeChange(isJalali ? 'gregorian' : 'jalali')}
            className="text-xs text-[var(--accent)] mt-1 hover:underline"
          >
            {isJalali ? 'Switch to Gregorian' : 'تغییر به شمسی'}
          </button>
        </div>
        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-[var(--bg-secondary)]">
          <ChevronLeft className={isJalali ? '' : 'rotate-180'} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysLabels.map((day, i) => (
          <div key={i} className="text-xs font-bold text-[var(--text-secondary)]">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {generateDays().map((day, i) => {
          const dayTasks = getTasksForDay(day);
          const selected = isDaySelected(day);
          const today = isDayToday(day);
          
          return (
            <div
              key={i}
              onClick={() => handleDayClick(day)}
              className={clsx(
                "h-10 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors relative",
                !day && "invisible",
                day && !selected && "hover:bg-[var(--bg-secondary)]",
                selected && "bg-[var(--accent)] text-white font-bold shadow-md",
                today && !selected && "border border-[var(--accent)] text-[var(--accent)] font-bold"
              )}
            >
              <span className="text-sm">{day}</span>
              {dayTasks.length > 0 && (
                <div className="flex gap-0.5 absolute bottom-1">
                  {dayTasks.slice(0, 3).map((t, idx) => (
                    <div 
                      key={idx} 
                      className={clsx(
                        "w-1 h-1 rounded-full",
                        t.completed ? "bg-gray-400" : "bg-[var(--warning)]"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
