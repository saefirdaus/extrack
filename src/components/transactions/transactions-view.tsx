'use client';

import { Transaction } from '@/db/schema/transactions';
import { useState } from 'react';
import { formatRupiah } from '@/lib/format';
import { TransactionModal } from './transaction-modal';
import { TransactionTable } from './transaction-table';

interface TransactionsViewProps {
  items: Transaction[];
  status?: string;
}

export function TransactionsView({ items, status }: TransactionsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

  const handleOpenAdd = () => {
    setEditingTransaction(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Transaction) => {
    setEditingTransaction(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(undefined);
  };

  const totalIncome = items
    .filter((i) => i.type === 'income')
    .reduce((acc, i) => acc + i.amount, 0);

  const totalExpense = items
    .filter((i) => i.type === 'expense')
    .reduce((acc, i) => acc + i.amount, 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Top Ledger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Riwayat Transaksi
          </h1>
        </div>
        <div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold px-3 py-1.5 rounded-md text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
          <div className="p-4">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
              Pemasukan
            </span>
            <p className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              + {formatRupiah(totalIncome)}
            </p>
          </div>
          <div className="p-4">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
              Pengeluaran
            </span>
            <p className="text-lg font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              - {formatRupiah(totalExpense)}
            </p>
          </div>
          <div className="p-4">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-1">
              Saldo
            </span>
            <p
              className={`text-lg font-mono font-bold tabular-nums ${
                netBalance >= 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatRupiah(netBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Flash Status Messages */}
      {status === 'created' && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-mono border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2">
          <span>✓ Transaksi berhasil ditambahkan.</span>
        </div>
      )}
      {status === 'updated' && (
        <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-mono border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
          <span>✓ Transaksi berhasil diperbarui.</span>
        </div>
      )}

      {/* Transactions Table */}
      <TransactionTable
        items={items}
        onAddClick={handleOpenAdd}
        onEditClick={handleOpenEdit}
      />

      {/* Interactive Modal Sheet */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingTransaction}
      />
    </div>
  );
}
