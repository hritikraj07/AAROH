import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { ClassSession } from '../../../types';

interface TimetableCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  timetable: ClassSession[];
  campusNow: Date;
}

// Helper to check if two dates fall on the exact same calendar day
const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export const TimetableCalendar: React.FC<TimetableCalendarProps> = ({
  selectedDate,
  onSelectDate,
  timetable,
  campusNow,
}) => {
  // Local viewing month/year state to allow browsing ahead or back
  const [viewYear, setViewYear] = React.useState<number>(() => selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = React.useState<number>(() => selectedDate.getMonth());

  // Keep viewing month in sync if selectedDate changes outside (e.g. today button)
  React.useEffect(() => {
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth());
  }, [selectedDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleJumpToday = () => {
    onSelectDate(new Date(campusNow));
    setViewYear(campusNow.getFullYear());
    setViewMonth(campusNow.getMonth());
  };

  // Support leap years and variable month lengths
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);

  // Monday-first offset: 0 for Monday ... 6 for Sunday
  const startDayOffset = (firstDayOfMonth.getDay() + 6) % 7;

  // Previous month trailing days for clean grid alignment
  const prevMonthDaysCount = new Date(viewYear, viewMonth, 0).getDate();

  const weekdayHeaders = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  // Check which day of week has active classes scheduled
  const activeDaysOfWeek = new Set(timetable.map(s => s.dayOfWeek));

  const daysGrid: Array<{
    date: Date;
    isCurrentMonth: boolean;
    dayNum: number;
  }> = [];

  // 1. Previous month trailing days
  for (let i = startDayOffset - 1; i >= 0; i--) {
    const d = prevMonthDaysCount - i;
    const dateObj = new Date(viewYear, viewMonth - 1, d);
    daysGrid.push({
      date: dateObj,
      isCurrentMonth: false,
      dayNum: d,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(viewYear, viewMonth, d);
    daysGrid.push({
      date: dateObj,
      isCurrentMonth: true,
      dayNum: d,
    });
  }

  // 3. Next month leading days to complete grid (multiples of 7)
  const remainingCells = (7 - (daysGrid.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const dateObj = new Date(viewYear, viewMonth + 1, d);
    daysGrid.push({
      date: dateObj,
      isCurrentMonth: false,
      dayNum: d,
    });
  }

  return (
    <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-blue-200/70 dark:border-blue-900/50 p-4 select-none transition-colors shadow-sm">
      {/* Header: Month Year & Navigation */}
      <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-blue-100 dark:border-blue-900/50">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#0F2544] dark:text-white tracking-tight">
            {monthNames[viewMonth]} {viewYear}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleJumpToday}
            className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-blue-50 hover:bg-blue-100 text-[#1D4ED8] dark:bg-blue-950/60 dark:text-blue-300 transition-colors cursor-pointer"
            title="Jump to today"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded text-slate-500 hover:text-[#1D4ED8] hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded text-slate-500 hover:text-[#1D4ED8] hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-1.5 text-center">
        {weekdayHeaders.map(wd => (
          <span
            key={wd}
            className="text-[10px] font-mono font-bold text-[#1D4ED8] dark:text-blue-400 py-0.5"
          >
            {wd}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center">
        {daysGrid.map((item, idx) => {
          const isSelected = isSameDay(item.date, selectedDate);
          const isToday = isSameDay(item.date, campusNow);
          const jsDay = item.date.getDay(); // 0 = Sun, 1-6 = Mon-Sat
          const hasClasses = jsDay >= 1 && jsDay <= 6 && activeDaysOfWeek.has(jsDay as 1 | 2 | 3 | 4 | 5 | 6);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(item.date)}
              className={`relative h-7 w-full flex flex-col items-center justify-center rounded-lg text-xs transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#1D4ED8] text-white font-bold shadow-sm'
                  : isToday
                  ? 'text-[#1D4ED8] dark:text-blue-300 font-bold ring-2 ring-[#1D4ED8]/60 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                  : item.isCurrentMonth
                  ? 'text-slate-700 dark:text-slate-200 hover:bg-blue-50/60 dark:hover:bg-blue-950/30'
                  : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <span className="leading-none text-[11px]">{item.dayNum}</span>

              {/* Indicator dot for scheduled classes */}
              {hasClasses && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 shrink-0 ${
                    isSelected
                      ? 'bg-white'
                      : 'bg-[#1D4ED8] dark:bg-blue-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
