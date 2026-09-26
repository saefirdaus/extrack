'use client';

import { Transaction } from '@/db/schema/transactions';
import Link from 'next/link';
import { formatDisplayDate, formatRupiah } from '@/lib/format';
import { DeleteButton } from './delete-button';

interface TransactionTableProps {
  items: Transaction[];
  onAddClick?: () => void;
  onEditClick?: (item: Transaction) => void;
}

export function TransactionTable({ items, onAddClick, onEditClick }: TransactionTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-xs">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          Belum ada catatan transaksi.
        </p>
        {onAddClick ? (
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center gap-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold px-3 py-1.5 rounded-md text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            + Catat Transaksi
          </button>
        ) : (
          <Link
            href="/dashboard/transactions/new"
            className="inline-flex items-center gap-1 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold px-3 py-1.5 rounded-md text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            + Catat Transaksi
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-950/40 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
              <th className="px-5 py-3">Tanggal</th>
              <th className="px-5 py-3">Keterangan</th>
              <th className="px-5 py-3">Jenis</th>
              <th className="px-5 py-3 text-right">Nominal</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans">
            {items.map((item) => {
              const isIncome = item.type === 'income';
              return (
                <tr
                  key={item.id}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-5 py-3.5 whitespace-nowrap text-zinc-500 dark:text-zinc-400 font-mono">
                    {formatDisplayDate(item.transactionDate)}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-900 dark:text-zinc-100 max-w-xs truncate font-medium">
                    {item.description}
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
                    {isIncome ? `+ ${formatRupiah(item.amount)}` : `- ${formatRupiah(item.amount)}`}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono">
                    {onEditClick ? (
                      <button
                        type="button"
                        onClick={() => onEditClick(item)}
                        className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer mr-3 transition-colors"
                      >
                        Edit
                      </button>
                    ) : (
                      <Link
                        href={`/dashboard/transactions/${item.id}/edit`}
                        className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mr-3 transition-colors"
                      >
                        Edit
                      </Link>
                    )}
                    <DeleteButton id={item.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
