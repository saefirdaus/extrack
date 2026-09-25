'use client';

import { useTransition } from 'react';
import { saveFilterPreferenceAction } from '@/actions/dashboard';
import type { TransactionFilter } from '@/lib/cookies/preference';

interface FilterSelectorProps {
  currentFilter: TransactionFilter;
}

const FILTER_OPTIONS: { label: string; value: TransactionFilter }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Pemasukan', value: 'income' },
  { label: 'Pengeluaran', value: 'expense' },
];

export function FilterSelector({ currentFilter }: FilterSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (filterValue: TransactionFilter) => {
    if (filterValue === currentFilter || isPending) return;

    startTransition(async () => {
      await saveFilterPreferenceAction(filterValue);
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Filter Transaksi:</span>
        <div className="inline-flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg text-sm border border-transparent dark:border-slate-700">
          {FILTER_OPTIONS.map((option) => {
            const isActive = currentFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFilterChange(option.value)}
                disabled={isPending}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm font-medium'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                } ${isPending ? 'opacity-70 cursor-wait' : ''}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2.5 py-1 rounded-md">
        <svg
          className="w-3.5 h-3.5 mr-1.5 text-blue-500 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>Preferensi Tersimpan di Cookie</span>
      </div>
    </div>
  );
}
