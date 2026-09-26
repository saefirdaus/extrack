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
    <div className="flex items-center justify-between gap-4">
      <div className="inline-flex bg-zinc-100 dark:bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
        {FILTER_OPTIONS.map((option) => {
          const isActive = currentFilter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleFilterChange(option.value)}
              disabled={isPending}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              } ${isPending ? 'opacity-50 cursor-wait' : ''}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
