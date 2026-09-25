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
      <div className="text-center py-14 px-6 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-xl mx-auto">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-900 font-bold text-lg mb-1">
          Belum ada catatan transaksi.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Mulai kelola keuangan Anda dengan mencatat transaksi pertama.
        </p>
        {onAddClick ? (
          <button
            type="button"
            onClick={onAddClick}
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
          >
            + Catat Transaksi Sekarang
          </button>
        ) : (
          <Link
            href="/dashboard/transactions/new"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 border-collapse">
          <thead>
            <tr className="bg-gray-50/80 text-gray-700 font-bold border-b border-gray-100">
              <th className="px-5 py-3.5">Tanggal</th>
              <th className="px-5 py-3.5">Keterangan</th>
              <th className="px-5 py-3.5">Jenis</th>
              <th className="px-5 py-3.5">Nominal</th>
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const isIncome = item.type === 'income';
              return (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/60 transition border-b border-gray-100"
                >
                  <td className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {formatDate(item.transactionDate)}
                  </td>
                  <td className="px-5 py-4 text-gray-800 max-w-xs truncate font-medium">
                    {item.description}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {isIncome ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        Pemasukan
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        Pengeluaran
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-5 py-4 font-bold whitespace-nowrap ${
                      isIncome ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {isIncome ? `+ ${formatCurrency(item.amount)}` : `- ${formatCurrency(item.amount)}`}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    {onEditClick ? (
                      <button
                        type="button"
                        onClick={() => onEditClick(item)}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs cursor-pointer"
                      >
                        Edit
                      </button>
                    ) : (
                      <Link
                        href={`/dashboard/transactions/${item.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
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
