'use client';

import { ActionState, createTransactionAction, updateTransactionAction } from '@/src/actions/transactions';
import { Transaction } from '@/src/db/schema/transactions';
import Link from 'next/link';
import { useActionState, useState } from 'react';

interface TransactionFormProps {
  initialData?: Transaction;
}

export function TransactionForm({ initialData }: TransactionFormProps) {
  const isEditMode = Boolean(initialData);

  const todayStr = new Date().toISOString().split('T')[0];

  const [type, setType] = useState<'income' | 'expense'>(initialData?.type as 'income' | 'expense' || 'expense');
  const [amount, setAmount] = useState<string>(initialData ? initialData.amount.toString() : '');
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [transactionDate, setTransactionDate] = useState<string>(
    initialData ? initialData.transactionDate : todayStr
  );

  const boundAction = isEditMode && initialData
    ? updateTransactionAction.bind(null, initialData.id)
    : createTransactionAction;

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    boundAction,
    {}
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {isEditMode ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
      </h2>

      {state?.errors?._form && (
        <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          {state.errors._form}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {/* Jenis Transaksi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Transaksi <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="income"
                checked={type === 'income'}
                onChange={() => setType('income')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">Pemasukan</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={type === 'expense'}
                onChange={() => setType('expense')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">Pengeluaran</span>
            </label>
          </div>
          {state?.errors?.type && (
            <p className="mt-1 text-xs text-red-600 font-medium">{state.errors.type}</p>
          )}
        </div>

        {/* Nominal */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Nominal (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="1"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Contoh: 50000"
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              state?.errors?.amount
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {state?.errors?.amount && (
            <p className="mt-1 text-xs text-red-600 font-medium">{state.errors.amount}</p>
          )}
        </div>

        {/* Keterangan / Deskripsi */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Keterangan / Deskripsi <span className="text-red-500">*</span>
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            maxLength={255}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Pembayaran Modul Praktikum"
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              state?.errors?.description
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {state?.errors?.description && (
            <p className="mt-1 text-xs text-red-600 font-medium">{state.errors.description}</p>
          )}
        </div>

        {/* Tanggal Transaksi */}
        <div>
          <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Transaksi <span className="text-red-500">*</span>
          </label>
          <input
            id="transactionDate"
            name="transactionDate"
            type="date"
            required
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              state?.errors?.transactionDate
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {state?.errors?.transactionDate && (
            <p className="mt-1 text-xs text-red-600 font-medium">{state.errors.transactionDate}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
          <Link
            href="/dashboard/transactions"
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
          >
            {isPending ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          </button>
        </div>
      </form>
    </div>
  );
}
