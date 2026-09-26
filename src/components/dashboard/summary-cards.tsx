import { formatRupiah } from '@/lib/format';

interface SummaryCardsProps {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export { formatRupiah };

export function SummaryCards({
  currentBalance,
  totalIncome,
  totalExpense,
}: SummaryCardsProps) {
  const isDeficit = currentBalance < 0;

  return (
    <section aria-label="Ringkasan Saldo dan Arus Kas">
      {/* Precision Financial Cockpit */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
          {/* Net Liquidity / Balance */}
          <div className="p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Saldo Bersih
              </span>
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
                  isDeficit
                    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                }`}
              >
                {isDeficit ? 'Defisit' : 'Surplus'}
              </span>
            </div>
            <div>
              <p
                className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight tabular-nums ${
                  isDeficit
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-zinc-900 dark:text-zinc-50'
                }`}
              >
                {formatRupiah(currentBalance)}
              </p>
            </div>
          </div>

          {/* Inflow */}
          <div className="p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Pemasukan
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
                </svg>
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                + Rp {Math.abs(totalIncome).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Outflow */}
          <div className="p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Pengeluaran
              </span>
              <span className="text-rose-600 dark:text-rose-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
                - Rp {Math.abs(totalExpense).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
