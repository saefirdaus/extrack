'use client';

import { ActionState, createTransactionAction, updateTransactionAction } from '@/src/actions/transactions';
import { Transaction } from '@/src/db/schema/transactions';
import { useActionState, useState } from 'react';

interface TransactionFormProps {
  initialData?: Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
  isCalendarOpen?: boolean;
  onToggleCalendar?: () => void;
  transactionDate?: string;
  onDateChange?: (date: string) => void;
}

export function TransactionForm({
  initialData,
  onSuccess,
  onCancel,
  isCalendarOpen = false,
  onToggleCalendar,
  transactionDate: externalDate,
  onDateChange: externalDateChange,
}: TransactionFormProps) {
  const isEditMode = Boolean(initialData);
  const todayStr = new Date().toISOString().split('T')[0];

  const [type, setType] = useState<'income' | 'expense'>(
    (initialData?.type as 'income' | 'expense') || 'expense'
  );

  const [rawAmount, setRawAmount] = useState<string>(
    initialData ? initialData.amount.toString() : ''
  );

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
  const [internalDate, setInternalDate] = useState<string>(
    initialData ? initialData.transactionDate : todayStr
  );

  const currentDate = externalDate !== undefined ? externalDate : internalDate;
  const setDate = externalDateChange || setInternalDate;

  const formatDisplayDate = (str: string) => {
    try {
      const parts = str.split('-').map(Number);
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }).format(d);
      }
      return str;
    } catch {
      return str;
    }
  };

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
        <div className="p-3.5 mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2.5 animate-in fade-in">
          <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{state.errors._form}</span>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {/* Jenis Transaksi */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Jenis Transaksi <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center py-3 px-4 rounded-2xl text-sm font-medium border transition-all duration-200 transform active:scale-95 ${
                type === 'income'
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-bold'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
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
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center py-3 px-4 rounded-2xl text-sm font-medium border transition-all duration-200 transform active:scale-95 ${
                type === 'expense'
                  ? 'bg-rose-500/10 border-rose-500/50 text-rose-400 font-bold'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
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
              Pengeluaran
            </button>
          </div>
          {state?.errors?.type && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{state.errors.type}</p>
          )}
        </div>

        {/* Nominal Field */}
        <div>
          <label htmlFor="amount-display" className="block text-sm font-semibold text-zinc-300 mb-1.5">
            Nominal <span className="text-rose-500">*</span>
          </label>
          <input type="hidden" name="amount" value={rawAmount} />
          <input
            id="amount-display"
            type="text"
            required
            value={displayAmount}
            onChange={handleAmountChange}
            placeholder="Rp 50.000"
            className={`w-full rounded-2xl border px-4 py-3 text-sm font-bold text-zinc-100 placeholder:text-zinc-600 transition-all duration-200 focus:outline-none focus:ring-4 bg-zinc-950 ${
              state?.errors?.amount
                ? 'border-rose-500/50 focus:ring-rose-500/20'
                : 'border-zinc-800 hover:border-zinc-700 focus:border-blue-500 focus:ring-blue-500/10'
            }`}
          />
          {state?.errors?.amount && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{state.errors.amount}</p>
          )}
        </div>

        {/* Keterangan / Deskripsi */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-zinc-300 mb-1.5">
            Keterangan / Deskripsi <span className="text-rose-500">*</span>
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
            className={`w-full rounded-2xl border px-4 py-3 text-sm text-zinc-100 font-medium placeholder:text-zinc-600 transition-all duration-200 focus:outline-none focus:ring-4 bg-zinc-950 ${
              state?.errors?.description
                ? 'border-rose-500/50 focus:ring-rose-500/20'
                : 'border-zinc-800 hover:border-zinc-700 focus:border-blue-500 focus:ring-blue-500/10'
            }`}
          />
          {state?.errors?.description && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{state.errors.description}</p>
          )}
        </div>

        {/* Tanggal Transaksi Trigger */}
        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
            Tanggal Transaksi <span className="text-rose-500">*</span>
          </label>
          <input type="hidden" name="transactionDate" value={currentDate} />
          <button
            type="button"
            onClick={onToggleCalendar}
            className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 bg-zinc-950 ${
              isCalendarOpen
                ? 'border-blue-500 ring-4 ring-blue-500/10'
                : state?.errors?.transactionDate
                ? 'border-rose-500/50 focus:ring-rose-500/20'
                : 'border-zinc-800 hover:border-zinc-700 focus:ring-4 focus:ring-blue-500/10'
            }`}
          >
            <span className="text-zinc-100 font-semibold">
              {currentDate ? formatDisplayDate(currentDate) : 'Pilih Tanggal'}
            </span>
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isCalendarOpen ? 'rotate-180 bg-blue-500/10 text-blue-400' : 'text-blue-400 hover:bg-zinc-800'}`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </button>
          {state?.errors?.transactionDate && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{state.errors.transactionDate}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-5 border-t border-zinc-800/80">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-all duration-200 active:scale-95"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-2xl text-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center min-w-[150px] active:scale-95"
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
