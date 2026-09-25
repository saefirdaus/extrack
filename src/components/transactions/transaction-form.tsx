'use client';

import { ActionState, createTransactionAction, updateTransactionAction } from '@/src/actions/transactions';
import { Transaction } from '@/src/db/schema/transactions';
import { CustomDatePicker } from './custom-date-picker';
import { useActionState, useState } from 'react';

interface TransactionFormProps {
  initialData?: Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({ initialData, onSuccess, onCancel }: TransactionFormProps) {
  const isEditMode = Boolean(initialData);
  const todayStr = new Date().toISOString().split('T')[0];

  const [type, setType] = useState<'income' | 'expense'>(
    (initialData?.type as 'income' | 'expense') || 'expense'
  );

  // Raw digits string for database (e.g. "1900000")
  const [rawAmount, setRawAmount] = useState<string>(
    initialData ? initialData.amount.toString() : ''
  );

  // Display text formatted with Rupiah (e.g. "Rp 1.900.000")
  const formatRupiahDisplay = (numStr: string) => {
    const digits = numStr.replace(/\D/g, '');
    if (!digits) return '';
    return `Rp ${new Intl.NumberFormat('id-ID').format(parseInt(digits, 10))}`;
  };

  const [displayAmount, setDisplayAmount] = useState<string>(
    initialData ? formatRupiahDisplay(initialData.amount.toString()) : ''
  );

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, '');
    setRawAmount(digitsOnly);
    setDisplayAmount(formatRupiahDisplay(digitsOnly));
  };

  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [transactionDate, setTransactionDate] = useState<string>(
    initialData ? initialData.transactionDate : todayStr
  );

  const boundAction = isEditMode && initialData
    ? updateTransactionAction.bind(null, initialData.id)
    : createTransactionAction;

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (prevState: ActionState, formData: FormData) => {
      const res = await boundAction(prevState, formData);
      if (res && res.success !== false) {
        if (onSuccess) onSuccess();
      }
      return res;
    },
    {}
  );

  return (
    <div className="w-full">
      {state?.errors?._form && (
        <div className="p-3.5 mb-5 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 flex items-start gap-2">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{state.errors._form}</span>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {/* Jenis Transaksi */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Jenis Transaksi <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium border transition ${
                type === 'income'
                  ? 'bg-green-50 border-green-500 text-green-700 font-bold shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="type"
                value="income"
                checked={type === 'income'}
                onChange={() => setType('income')}
                className="sr-only"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2" />
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium border transition ${
                type === 'expense'
                  ? 'bg-red-50 border-red-500 text-red-700 font-bold shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="type"
                value="expense"
                checked={type === 'expense'}
                onChange={() => setType('expense')}
                className="sr-only"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-2" />
              Pengeluaran
            </button>
          </div>
          {state?.errors?.type && (
            <p className="mt-1 text-xs text-red-600 font-medium">{state.errors.type}</p>
          )}
        </div>

        {/* Nominal Field */}
        <div>
          <label htmlFor="amount-display" className="block text-sm font-semibold text-gray-700 mb-1.5">
            Nominal <span className="text-red-500">*</span>
          </label>
          <input type="hidden" name="amount" value={rawAmount} />
          <input
            id="amount-display"
            type="text"
            required
            value={displayAmount}
            onChange={handleAmountChange}
            placeholder="Rp 50.000"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-semibold text-gray-900 transition focus:outline-none focus:ring-2 bg-white ${
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
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
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
            placeholder="Contoh: Beli Makan Siang / Uang Saku"
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 transition focus:outline-none focus:ring-2 bg-white ${
              state?.errors?.description
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {state?.errors?.description && (
            <p className="mt-1 text-xs text-red-600 font-medium">{state.errors.description}</p>
          )}
        </div>

        {/* Custom Stylized Date Picker */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Tanggal Transaksi <span className="text-red-500">*</span>
          </label>
          <CustomDatePicker
            value={transactionDate}
            onChange={setTransactionDate}
            name="transactionDate"
            error={state?.errors?.transactionDate}
          />
          {state?.errors?.transactionDate && (
            <p className="mt-1 text-xs text-red-600 font-medium">{state.errors.transactionDate}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-5 border-t border-gray-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[140px]"
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyimpan...
              </>
            ) : isEditMode ? (
              'Simpan Perubahan'
            ) : (
              'Simpan Transaksi'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
