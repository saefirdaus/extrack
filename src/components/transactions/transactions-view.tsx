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

  const totalIncome = items
    .filter((i) => i.type === 'income')
    .reduce((acc, i) => acc + i.amount, 0);

  const totalExpense = items
    .filter((i) => i.type === 'expense')
    .reduce((acc, i) => acc + i.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center max-w-5xl mx-auto px-4 py-8">
      {/* Header section with Dark Tech glass card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 bg-zinc-900/90 p-6 rounded-3xl border border-zinc-800/80 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Financial Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
            Manajemen Transaksi
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Pantau arus kas pemasukan dan pengeluaran secara real-time.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 active:scale-95 cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Catat Transaksi Baru
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Income Card */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 p-5 rounded-3xl shadow-xl backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Total Pemasukan
            </p>
            <p className="text-xl font-bold text-emerald-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </div>
        </div>

        {/* Total Expense Card */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 p-5 rounded-3xl shadow-xl backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Total Pengeluaran
            </p>
            <p className="text-xl font-bold text-rose-400">
              {formatCurrency(totalExpense)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-zinc-900/90 border border-zinc-800/80 p-5 rounded-3xl shadow-xl backdrop-blur-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Saldo Arus Kas
            </p>
            <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              {formatCurrency(netBalance)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Flash Status Messages */}
      {status === 'created' && (
        <div className="p-4 mb-6 rounded-2xl bg-emerald-500/10 text-emerald-300 text-sm font-medium border border-emerald-500/30 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Transaksi baru berhasil disimpan ke database!</span>
          </div>
        </div>
      )}
      {status === 'updated' && (
        <div className="p-4 mb-6 rounded-2xl bg-blue-500/10 text-blue-300 text-sm font-medium border border-blue-500/30 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Perubahan transaksi berhasil diperbarui!</span>
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
