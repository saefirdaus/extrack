'use client';

import { Transaction } from '@/src/db/schema/transactions';
import { useState } from 'react';
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

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center max-w-5xl mx-auto px-4 py-8">
      {/* Header section centered with table */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transaksi Keuangan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan catat riwayat arus kas pemasukan dan pengeluaran Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm hover:shadow-md cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Catat Transaksi Baru
        </button>
      </div>

      {/* Flash Status Messages */}
      {status === 'created' && (
        <div className="p-4 mb-6 rounded-2xl bg-green-50 text-green-800 text-sm font-medium border border-green-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Transaksi baru berhasil disimpan!</span>
          </div>
        </div>
      )}
      {status === 'updated' && (
        <div className="p-4 mb-6 rounded-2xl bg-blue-50 text-blue-800 text-sm font-medium border border-blue-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Perubahan transaksi berhasil disimpan!</span>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <TransactionTable
        items={items}
        onAddClick={handleOpenAdd}
        onEditClick={handleOpenEdit}
      />

      {/* Interactive Modal Popup Window */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingTransaction}
      />
    </div>
  );
}
