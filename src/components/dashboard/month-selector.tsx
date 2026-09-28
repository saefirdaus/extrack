'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAdjacentMonth, formatMonthYear } from '@/lib/date';

interface MonthSelectorProps {
  currentMonth: number;
  currentYear: number;
  isCurrentMonth: boolean;
}

export function MonthSelector({
  currentMonth,
  currentYear,
  isCurrentMonth,
}: MonthSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const navigateToPeriod = (targetMonth: number, targetYear: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.set('month', targetMonth.toString());
      params.set('year', targetYear.toString());
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  const handlePrev = () => {
    const prev = getAdjacentMonth(currentMonth, currentYear, 'prev');
    navigateToPeriod(prev.month, prev.year);
  };

  const handleNext = () => {
    const next = getAdjacentMonth(currentMonth, currentYear, 'next');
    navigateToPeriod(next.month, next.year);
  };

  const handleResetToCurrent = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      params.delete('month');
      params.delete('year');
      const query = params.toString() ? `?${params.toString()}` : '';
      router.push(`/dashboard${query}`);
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs mb-6 transition-colors">
      <div className="flex items-center gap-2">
        {/* Tombol Bulan Sebelumnya */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={isPending}
          aria-label="Bulan sebelumnya"
          title="Bulan Sebelumnya"
          className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Label Bulan & Tahun Aktif */}
        <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white px-2 tracking-tight select-none">
          {formatMonthYear(currentMonth, currentYear)}
        </span>

        {/* Tombol Bulan Berikutnya */}
        <button
          type="button"
          onClick={handleNext}
          disabled={isPending}
          aria-label="Bulan berikutnya"
          title="Bulan Berikutnya"
          className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {isPending && (
          <span className="text-xs text-blue-600 dark:text-blue-400 font-medium animate-pulse ml-2">
            Memuat...
          </span>
        )}
      </div>

      {/* Tombol Pintas Kembali ke Bulan Ini */}
      {!isCurrentMonth && (
        <button
          type="button"
          onClick={handleResetToCurrent}
          disabled={isPending}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline px-2.5 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
        >
          Kembali ke Bulan Ini
        </button>
      )}
    </div>
  );
}
