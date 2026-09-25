import { Transaction } from '@/src/db/schema/transactions';
import Link from 'next/link';
import { DeleteButton } from './delete-button';

interface TransactionTableProps {
  items: Transaction[];
}

export function TransactionTable({ items }: TransactionTableProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 14l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-700 font-medium text-base mb-1">
          Belum ada catatan transaksi.
        </p>
        <p className="text-gray-500 text-sm mb-5">
          Mulai kelola keuangan Anda dengan mencatat transaksi pertama.
        </p>
        <Link
          href="/dashboard/transactions/new"
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
        >
          + Catat Transaksi Sekarang
        </Link>
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
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3">Jenis</th>
              <th className="px-4 py-3">Nominal</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const isIncome = item.type === 'income';
              return (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50/50 transition border-b border-gray-100"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {formatDate(item.transactionDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {isIncome ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Pemasukan
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Pengeluaran
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-3 font-medium whitespace-nowrap ${
                      isIncome ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {isIncome ? `+ ${formatCurrency(item.amount)}` : `- ${formatCurrency(item.amount)}`}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/dashboard/transactions/${item.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                    >
                      Edit
                    </Link>
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
