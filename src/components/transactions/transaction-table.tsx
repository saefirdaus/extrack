'use client';

import { Transaction } from '@/src/db/schema/transactions';
import Link from 'next/link';
import { DeleteButton } from './delete-button';

interface TransactionTableProps {
  items: Transaction[];
  onAddClick?: () => void;
  onEditClick?: (item: Transaction) => void;
}

export function TransactionTable({ items, onAddClick, onEditClick }: TransactionTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-zinc-900/90 rounded-3xl shadow-2xl border border-zinc-800/80 max-w-xl mx-auto backdrop-blur-xl">
        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-zinc-100 font-bold text-lg mb-1">
          Belum ada catatan transaksi.
        </p>
        <p className="text-zinc-400 text-sm mb-6">
          Mulai kelola keuangan Anda dengan mencatat transaksi pertama.
        </p>
        {onAddClick ? (
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-all duration-200 active:scale-95"
          >
            + Catat Transaksi Sekarang
          </button>
        ) : (
          <Link
            href="/dashboard/transactions/new"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-all duration-200 active:scale-95"
          >
            + Catat Transaksi Sekarang
          </Link>
        )}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-').map(Number);
      if (parts.length === 3) {
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        return new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(date);
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-zinc-900/90 rounded-3xl shadow-2xl border border-zinc-800/80 overflow-hidden backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-300 border-collapse">
          <thead>
            <tr className="bg-zinc-950/60 text-zinc-400 font-bold border-b border-zinc-800/80 uppercase tracking-wider text-xs">
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Keterangan</th>
              <th className="px-6 py-4">Jenis</th>
              <th className="px-6 py-4">Nominal</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {items.map((item) => {
              const isIncome = item.type === 'income';
              return (
                <tr
                  key={item.id}
                  className="hover:bg-zinc-800/40 transition-colors duration-150 border-b border-zinc-800/50"
                >
                  <td className="px-6 py-4 font-semibold text-zinc-200 whitespace-nowrap">
                    {formatDate(item.transactionDate)}
                  </td>
                  <td className="px-6 py-4 text-zinc-300 max-w-xs truncate font-medium">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isIncome ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Pemasukan
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Pengeluaran
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-6 py-4 font-bold whitespace-nowrap ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isIncome ? `+ ${formatCurrency(item.amount)}` : `- ${formatCurrency(item.amount)}`}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {onEditClick ? (
                      <button
                        type="button"
                        onClick={() => onEditClick(item)}
                        className="text-blue-400 hover:text-blue-300 font-semibold text-xs cursor-pointer transition-colors duration-150"
                      >
                        Edit
                      </button>
                    ) : (
                      <Link
                        href={`/dashboard/transactions/${item.id}/edit`}
                        className="text-blue-400 hover:text-blue-300 font-semibold text-xs transition-colors duration-150"
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
