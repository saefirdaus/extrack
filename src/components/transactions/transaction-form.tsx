'use client';

import { ActionState, createTransactionAction, updateTransactionAction } from '@/actions/transactions';
import { Transaction } from '@/db/schema/transactions';
import { formatDisplayDate, formatISODate, formatRupiahInput } from '@/lib/format';
import { useActionState, useState } from 'react';
import { CalendarPanel } from './calendar-panel';

interface TransactionFormProps {
  initialData?: Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionForm({
  initialData,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const isEditMode = Boolean(initialData);

  const [type, setType] = useState<'income' | 'expense'>(
    initialData?.type === 'income' ? 'income' : 'expense'
  );
  const [rawAmount, setRawAmount] = useState<string>(
    initialData ? initialData.amount.toString() : ''
  );
  const [displayAmount, setDisplayAmount] = useState<string>(
    initialData ? formatRupiahInput(initialData.amount.toString()) : ''
  );
  const [description, setDescription] = useState<string>(
    initialData?.description ?? ''
  );
  const [transactionDate, setTransactionDate] = useState<string>(
    initialData?.transactionDate ?? formatISODate(new Date())
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    setRawAmount(digitsOnly);
    setDisplayAmount(formatRupiahInput(digitsOnly));
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
        <div className="p-3 mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-mono">
          {state.errors._form}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {/* Jenis Transaksi */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
            Jenis
          </label>
          <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-950/60 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                type === 'income'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
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
              className={`py-1.5 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                type === 'expense'
                  ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
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
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-mono">{state.errors.type}</p>
          )}
        </div>

        {/* Nominal Field */}
        <div>
          <label htmlFor="amount-display" className="block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
            Nominal
          </label>
          <input type="hidden" name="amount" value={rawAmount} />
          <input
            id="amount-display"
            type="text"
            required
            value={displayAmount}
            onChange={handleAmountChange}
            placeholder="Rp 0"
            className={`w-full rounded-lg border px-3 py-2 text-sm font-mono font-semibold tabular-nums text-zinc-900 dark:text-white bg-white dark:bg-zinc-950 placeholder-zinc-400 dark:placeholder-zinc-600 transition focus:outline-none focus:ring-1 ${
              state?.errors?.amount
                ? 'border-rose-500 focus:ring-rose-500'
                : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-400'
            }`}
          />
          {state?.errors?.amount && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-mono">{state.errors.amount}</p>
          )}
        </div>

        {/* Keterangan */}
        <div>
          <label htmlFor="description" className="block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
            Keterangan
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            maxLength={255}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Keterangan transaksi"
            className={`w-full rounded-lg border px-3 py-2 text-xs text-zinc-900 dark:text-white bg-white dark:bg-zinc-950 placeholder-zinc-400 dark:placeholder-zinc-600 transition focus:outline-none focus:ring-1 ${
              state?.errors?.description
                ? 'border-rose-500 focus:ring-rose-500'
                : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-zinc-400'
            }`}
          />
          {state?.errors?.description && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-mono">{state.errors.description}</p>
          )}
        </div>

        {/* Tanggal Transaksi */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
            Tanggal
          </label>
          <input type="hidden" name="transactionDate" value={transactionDate} />
          <button
            type="button"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition bg-white dark:bg-zinc-950 cursor-pointer ${
              isCalendarOpen
                ? 'border-zinc-400 dark:border-zinc-500'
                : state?.errors?.transactionDate
                ? 'border-rose-500'
                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <span className="text-zinc-900 dark:text-white font-mono">
              {formatDisplayDate(transactionDate)}
            </span>
            <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          {state?.errors?.transactionDate && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-mono">{state.errors.transactionDate}</p>
          )}

          {/* Calendar Picker Panel */}
          {isCalendarOpen && (
            <div className="mt-2 flex justify-center">
              <CalendarPanel
                value={transactionDate}
                onChange={(newDate) => {
                  setTransactionDate(newDate);
                  setIsCalendarOpen(false);
                }}
                onClose={() => setIsCalendarOpen(false)}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold px-4 py-1.5 rounded-md text-xs hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center min-w-[120px] cursor-pointer shadow-xs"
          >
            {isPending ? (
              <span className="font-mono">Menyimpan...</span>
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
