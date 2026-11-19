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
    <div className="bg-[#FFFFFF] dark:bg-[#18181B] rounded-[10px] border border-[#EAE9E4] dark:border-[#27272A] p-3.5 select-none transition-colors">
      {/* Header: Month Year & Navigation */}
      <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#EAE9E4] dark:border-[#27272A]">
        <div>
          <h3 className="text-xs font-bold text-[#252823] dark:text-[#EAE9E4] tracking-tight">
            {monthNames[viewMonth]} {viewYear}
          </h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleJumpToday}
            className="text-[10px] font-mono px-2 py-0.5 rounded text-[#77786F] hover:text-[#252823] hover:bg-[#F7F6F2] dark:hover:bg-[#202025] dark:hover:text-[#EAE9E4] transition-colors cursor-pointer"
            title="Jump to today"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded text-[#77786F] hover:text-[#252823] hover:bg-[#F7F6F2] dark:hover:bg-[#202025] dark:hover:text-[#EAE9E4] transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded text-[#77786F] hover:text-[#252823] hover:bg-[#F7F6F2] dark:hover:bg-[#202025] dark:hover:text-[#EAE9E4] transition-colors cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-1 text-center">
        {weekdayHeaders.map(wd => (
          <span
            key={wd}
            className="text-[10px] font-mono font-medium text-[#77786F] dark:text-[#A1A1AA] py-0.5"
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
              className={`relative h-7 w-full flex flex-col items-center justify-center rounded-[6px] text-xs transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#252823] text-white dark:bg-[#EAE9E4] dark:text-[#252823] font-semibold'
                  : isToday
                  ? 'text-[#252823] dark:text-[#EAE9E4] font-semibold ring-1 ring-[#A49B83] dark:ring-[#A49B83] hover:bg-[#F7F6F2] dark:hover:bg-[#202025]'
                  : item.isCurrentMonth
                  ? 'text-[#252823] dark:text-[#EAE9E4] hover:bg-[#F7F6F2] dark:hover:bg-[#202025]'
                  : 'text-[#77786F]/40 dark:text-[#77786F]/40 hover:bg-[#F7F6F2]/60 dark:hover:bg-[#202025]/40'
              }`}
            >
              <span className="leading-none text-[11px]">{item.dayNum}</span>

              {/* Small monochrome indicator for scheduled classes */}
              {hasClasses && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 shrink-0 ${
                    isSelected
                      ? 'bg-white dark:bg-[#252823]'
                      : 'bg-[#77786F] dark:bg-[#A1A1AA]'
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
