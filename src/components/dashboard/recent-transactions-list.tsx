import Link from 'next/link';
import type { Transaction } from '@/db/schema/transactions';

interface RecentTransactionsListProps {
  transactions: Transaction[];
  hasAnyTransactions: boolean;
}

function formatDate(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return String(dateInput);
  }
}

export function RecentTransactionsList({
  transactions,
  hasAnyTransactions,
}: RecentTransactionsListProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaksi Terbaru</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Maksimal 5 transaksi terakhir sesuai filter</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/transactions/new"
            className="inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            + Catat Baru
          </Link>
          <Link
            href="/dashboard/transactions"
            className="inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium text-gray-700 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600 rounded-lg transition"
          >
            Lihat Semua
          </Link>
        </div>
      </div>

      {/* Konten Transaksi / Empty State */}
      {transactions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-slate-400">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 14.25l6-6m4.5 5.25a8.25 8.25 0 11-16.5 0 8.25 8.25 0 0116.5 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-slate-300 text-sm max-w-md mx-auto mb-6">
            {!hasAnyTransactions
              ? 'Belum ada riwayat transaksi. Klik tombol di bawah untuk mencatat pemasukan atau pengeluaran pertama Anda.'
              : 'Tidak ada transaksi yang sesuai dengan filter yang dipilih.'}
          </p>
          <Link
            href="/dashboard/transactions/new"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
          >
            + Catat Transaksi Baru
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
            <thead className="bg-gray-50 dark:bg-slate-800/80 text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th scope="col" className="px-6 py-3.5 font-medium">Tanggal</th>
                <th scope="col" className="px-6 py-3.5 font-medium">Keterangan</th>
                <th scope="col" className="px-6 py-3.5 font-medium">Jenis</th>
                <th scope="col" className="px-6 py-3.5 font-medium text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
              {transactions.map((trx) => {
                const isIncome = trx.type === 'income';
                return (
                  <tr key={trx.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-700/40 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-slate-400 text-xs">
                      {formatDate(trx.transactionDate)}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-slate-100 max-w-xs truncate">
                      {trx.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          isIncome
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        }`}
                      >
                        {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-right font-semibold ${
                        isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
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
    </div>
  );
}
