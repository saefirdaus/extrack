import Link from 'next/link';
import type { Transaction } from '@/db/schema/transactions';
import { formatDisplayDate } from '@/lib/format';

interface RecentTransactionsListProps {
  transactions: Transaction[];
  hasAnyTransactions: boolean;
}

export function RecentTransactionsList({
  transactions,
  hasAnyTransactions,
}: RecentTransactionsListProps) {
  return (
    <section aria-label="Transaksi Terkini" className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Transaksi Terkini
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/transactions"
            className="text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            Semua →
          </Link>
        </div>
      </div>

      {/* Content / Table */}
      {transactions.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            {!hasAnyTransactions
              ? 'Belum ada transaksi tercatat.'
              : 'Tidak ada transaksi untuk filter ini.'}
          </p>
          <Link
            href="/dashboard/transactions/new"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:opacity-90 transition-opacity"
          >
            + Catat Transaksi
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/40 text-zinc-500 dark:text-zinc-400 uppercase font-mono tracking-wider text-[11px]">
                <th scope="col" className="px-5 py-3">Tanggal</th>
                <th scope="col" className="px-5 py-3">Keterangan</th>
                <th scope="col" className="px-5 py-3">Jenis</th>
                <th scope="col" className="px-5 py-3 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans">
              {transactions.map((trx) => {
                const isIncome = trx.type === 'income';
                return (
                  <tr
                    key={trx.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap text-zinc-500 dark:text-zinc-400 font-mono">
                      {formatDisplayDate(trx.transactionDate)}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                      {trx.description}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${
                          isIncome
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                        }`}
                      >
                        {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td
                      className={`px-5 py-3.5 whitespace-nowrap text-right font-mono font-semibold tabular-nums ${
                        isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? '+ ' : '- '}
                      Rp {Number(trx.amount).toLocaleString('id-ID')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
