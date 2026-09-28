import type { BudgetSummaryData } from '@/actions/budget-summary';
import { BudgetSummaryCard } from './budget-summary-card';
import { BudgetProgressBar } from './budget-progress-bar';

interface BudgetSectionProps {
  summary: BudgetSummaryData;
  onOpenBudgetModal?: () => void;
}

export function BudgetSection({ summary, onOpenBudgetModal }: BudgetSectionProps) {
  return (
    <section
      aria-label="Ringkasan dan Indikator Anggaran Bulanan"
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 shadow-xs"
    >
      {/* Header Periode & Tombol Aksi */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-zinc-100 dark:border-zinc-800/80">
        <div>
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Anggaran Bulan Ini
          </h2>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {summary.monthYearLabel}
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={onOpenBudgetModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer shadow-2xs"
          >
            <svg
              className="w-3.5 h-3.5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              />
            </svg>
            {summary.hasBudget ? 'Ubah Anggaran' : 'Atur Anggaran'}
          </button>
        </div>
      </div>

      {/* Error Alert Container */}
      {summary.error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-mono text-rose-800 dark:text-rose-200"
        >
          {summary.error}
        </div>
      )}

      {/* Empty State Banner (Jika Belum Ada Anggaran Ditetapkan) */}
      {!summary.hasBudget ? (
        <div className="py-8 px-4 text-center rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
          <div className="mx-auto w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Target Anggaran Belum Ditetapkan
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-4">
            Tentukan batas pengeluaran untuk memantau kesehatan keuangan dan sisa kuota belanja Anda pada {summary.monthYearLabel}.
          </p>
          <button
            type="button"
            onClick={onOpenBudgetModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            + Atur Anggaran Bulan Ini
          </button>
        </div>
      ) : (
        /* Normal / Active Budget State */
        <div>
          <BudgetSummaryCard
            budgetAmount={summary.budgetAmount}
            totalExpense={summary.totalExpense}
            remainingBudget={summary.remainingBudget}
          />

          <BudgetProgressBar
            percentage={summary.usagePercentage}
            status={summary.status}
          />
        </div>
      )}
    </section>
  );
}
