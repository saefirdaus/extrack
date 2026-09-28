'use client';

import { useActionState, useEffect } from 'react';
import { setBudgetAction, type SetBudgetState } from '@/actions/budget';
import { formatMonthYear } from '@/lib/date';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: number;
  year: number;
  initialAmount?: number;
}

const initialState: SetBudgetState = {
  success: false,
  message: '',
  errors: {},
};

export function BudgetFormModal({
  isOpen,
  onClose,
  month,
  year,
  initialAmount = 0,
}: BudgetFormModalProps) {
  const [state, formAction, isPending] = useActionState(setBudgetAction, initialState);

  // Tutup modal secara otomatis jika aksi berhasil
  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 w-full max-w-md overflow-hidden transition-colors">
        {/* Header Modal */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {initialAmount > 0 ? 'Ubah Plafon Anggaran' : 'Tetapkan Anggaran Bulanan'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              Periode:{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatMonthYear(month, year)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form
          key={`${month}-${year}-${initialAmount}`}
          action={formAction}
          className="p-6 space-y-4"
        >
          <input type="hidden" name="month" value={month} />
          <input type="hidden" name="year" value={year} />

          {/* Form-level Error Alert */}
          {state.message && !state.success && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
              {state.message}
            </div>
          )}

          <div>
            <label
              htmlFor="amount"
              className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-1.5"
            >
              Target Batas Pengeluaran (Rupiah)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-semibold text-gray-400 dark:text-slate-500">
                Rp
              </span>
              <input
                id="amount"
                name="amount"
                type="number"
                min="1000"
                step="1000"
                required
                placeholder="misal: 1500000"
                defaultValue={initialAmount > 0 ? initialAmount : ''}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
              />
            </div>
            {state.errors?.amount && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {state.errors.amount[0]}
              </p>
            )}
            <p className="mt-1.5 text-xs text-gray-400 dark:text-slate-500">
              Pengeluaran transaksi Anda pada bulan ini akan dipantau terhadap plafon ini.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Simpan Anggaran'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
