'use client';

import { useEffect, useRef, useState } from 'react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  name?: string;
  error?: string;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function CustomDatePicker({ value, onChange, name = 'transactionDate', error }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date
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

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
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
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    onChange(formatISO(today));
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input type="hidden" name={name} value={value} />

      {/* Input Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none focus:ring-2 bg-white ${
          error
            ? 'border-red-300 focus:ring-red-500'
            : 'border-gray-300 hover:border-gray-400 focus:ring-blue-500'
        }`}
      >
        <span className="text-gray-800 font-medium">
          {value ? formatDisplay(value) : 'Pilih Tanggal'}
        </span>
        <svg
          className="h-5 w-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Stylized Calendar Popover */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
              title="Bulan Sebelumnya"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold text-gray-900">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
              title="Bulan Berikutnya"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_NAMES.map((d, i) => (
              <span key={i} className="text-xs font-semibold text-gray-400 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots for month offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}

            {/* Days of current month */}
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
                  className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-medium transition ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                      : isToday
                      ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200 hover:bg-blue-100'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today Button Footer */}
          <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition py-1 px-2 rounded-md hover:bg-blue-50"
            >
              Hari Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
