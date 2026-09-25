'use client';

import { useEffect, useState } from 'react';

interface CalendarPanelProps {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function CalendarPanel({ value, onChange, onClose }: CalendarPanelProps) {
  const parseDate = (str: string) => {
    if (!str) return new Date();
    const parts = str.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date();
  };

  const selectedDate = parseDate(value);
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());

  useEffect(() => {
    const d = parseDate(value);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
  }, [value]);

  const formatISO = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onChange(formatISO(newDate));
  };

  const handleSelectToday = () => {
    const today = new Date();
    onChange(formatISO(today));
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  return (
    <div className="w-80 bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 p-5 shrink-0 transition-all duration-300 ease-out animate-in fade-in slide-in-from-left-6 zoom-in-95 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <h3 className="text-sm font-bold text-zinc-100 tracking-tight">
            Pilih Tanggal Transaksi
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition active:scale-90"
          title="Tutup Kalender"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Month & Year Navigation Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all active:scale-90"
          title="Bulan Sebelumnya"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-bold text-zinc-100 tracking-tight">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all active:scale-90"
          title="Bulan Berikutnya"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAY_NAMES.map((d, i) => (
          <span key={i} className="text-xs font-bold text-zinc-500 py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Day Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <span key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateObj = new Date(currentYear, currentMonth, day);
          const dateStr = formatISO(dateObj);
          const isSelected = dateStr === value;
          const isToday = formatISO(new Date()) === dateStr;

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleSelectDay(day)}
              className={`h-9 w-9 mx-auto flex items-center justify-center rounded-xl text-xs font-semibold transition-all transform active:scale-90 ${
                isSelected
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 scale-105'
                  : isToday
                  ? 'bg-blue-500/10 text-blue-400 font-bold border border-blue-500/30 hover:bg-blue-500/20 hover:scale-105'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:scale-105'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Today Button Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-medium">Format: YYYY-MM-DD</span>
        <button
          type="button"
          onClick={handleSelectToday}
          className="text-xs font-bold text-blue-400 hover:text-blue-300 transition py-1 px-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 active:scale-95"
        >
          Hari Ini
        </button>
      </div>
    </div>
  );
}
