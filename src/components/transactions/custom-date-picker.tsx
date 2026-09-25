'use client';

import { useEffect, useRef, useState } from 'react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  name?: string;
  error?: string;
  onToggleOpen?: (isOpen: boolean) => void;
  isSidePanelMode?: boolean;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function CustomDatePicker({
  value,
  onChange,
  name = 'transactionDate',
  error,
  onToggleOpen,
  isSidePanelMode = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const toggleCalendar = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (onToggleOpen) onToggleOpen(nextState);
  };

  const closeCalendar = () => {
    setIsOpen(false);
    if (onToggleOpen) onToggleOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest('.calendar-side-panel')) {
          closeCalendar();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatISO = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplay = (str: string) => {
    try {
      const d = parseDate(str);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }).format(d);
    } catch {
      return str;
    }
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
    const dateStr = formatISO(newDate);
    onChange(dateStr);
    closeCalendar();
  };

  const handleSelectToday = () => {
    const today = new Date();
    onChange(formatISO(today));
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    closeCalendar();
  };

  const CalendarContent = (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all active:scale-90"
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
          className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-all active:scale-90"
          title="Bulan Berikutnya"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAY_NAMES.map((d, i) => (
          <span key={i} className="text-xs font-bold text-zinc-500 py-1">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center">
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

      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-medium">Klik tanggal untuk memilih</span>
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

  return (
    <div ref={containerRef} className="relative w-full">
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        onClick={toggleCalendar}
        className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 bg-zinc-950 ${
          isOpen
            ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-sm'
            : error
            ? 'border-rose-500/50 focus:ring-rose-500/20'
            : 'border-zinc-800 hover:border-zinc-700 focus:ring-4 focus:ring-blue-500/10'
        }`}
      >
        <span className="text-zinc-100 font-medium">
          {value ? formatDisplay(value) : 'Pilih Tanggal'}
        </span>
        <div className={`p-1 rounded-xl transition-transform duration-300 ${isOpen ? 'rotate-180 bg-blue-500/10 text-blue-400' : 'text-blue-400'}`}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </button>

      {!isSidePanelMode && isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
          {CalendarContent}
        </div>
      )}

      {isSidePanelMode && isOpen && (
        <div className="calendar-side-panel hidden"></div>
      )}
    </div>
  );
}
