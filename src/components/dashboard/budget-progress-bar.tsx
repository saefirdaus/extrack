import type { BudgetStatus } from '@/lib/budget-summary';

interface BudgetProgressBarProps {
  percentage: number;
  status: BudgetStatus;
}

export function BudgetProgressBar({ percentage, status }: BudgetProgressBarProps) {
  // Batasi lebar visual batang progress antara 0% hingga 100%
  const visualBarWidth = Math.min(Math.max(percentage, 0), 100);

  // Pemetaan label status konkret
  const statusLabels: Record<BudgetStatus, string> = {
    safe: 'Aman',
    warning: 'Waspada',
    danger: 'Overbudget',
    unbudgeted: 'Belum Ditetapkan',
  };

  // Pewarnaan dinamis untuk progress bar fill
  const barColorClasses: Record<BudgetStatus, string> = {
    safe: 'bg-emerald-500 dark:bg-emerald-400',
    warning: 'bg-amber-500 dark:bg-amber-400',
    danger: 'bg-rose-500 dark:bg-rose-400',
    unbudgeted: 'bg-zinc-400 dark:bg-zinc-600',
  };

  // Styling badge status
  const badgeClasses: Record<BudgetStatus, string> = {
    safe: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    unbudgeted: 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800',
  };

  return (
    <div className="space-y-2 mt-4">
      {/* Header status badge & persentase riil */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Status Penggunaan:
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${badgeClasses[status]}`}
          >
            {statusLabels[status]} ({percentage}%)
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
          {percentage}%
        </span>
      </div>

      {/* Progress Track & Animated Fill */}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Status penggunaan anggaran bulanan"
        className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColorClasses[status]}`}
          style={{ width: `${visualBarWidth}%` }}
        />
      </div>
    </div>
  );
}
