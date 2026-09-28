import { formatRupiah } from '@/lib/format';

interface BudgetSummaryCardProps {
  budgetAmount: number;
  totalExpense: number;
  remainingBudget: number;
}

export function BudgetSummaryCard({
  budgetAmount,
  totalExpense,
  remainingBudget,
}: BudgetSummaryCardProps) {
  const isOverbudget = remainingBudget < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 overflow-hidden">
      {/* Plafon Anggaran */}
      <div className="p-4 flex flex-col justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
          Total Anggaran
        </span>
        <p className="text-lg sm:text-xl font-mono font-bold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
          {formatRupiah(budgetAmount)}
        </p>
      </div>

      {/* Pengeluaran Aktual */}
      <div className="p-4 flex flex-col justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
          Total Pengeluaran
        </span>
        <p className="text-lg sm:text-xl font-mono font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
          - {formatRupiah(totalExpense)}
        </p>
      </div>

      {/* Sisa Anggaran */}
      <div className="p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Sisa Anggaran
          </span>
          {isOverbudget && (
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
              Defisit
            </span>
          )}
        </div>
        <p
          className={`text-lg sm:text-xl font-mono font-bold tracking-tight tabular-nums ${
            isOverbudget
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {formatRupiah(remainingBudget)}
        </p>
      </div>
    </div>
  );
}
