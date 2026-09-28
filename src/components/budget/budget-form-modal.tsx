'use client';

<<<<<<< HEAD
import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatRupiahInput } from '@/lib/format';
import { cleanRupiahAmount } from '@/lib/validation/budget';
import { setBudgetAction, type SetBudgetResult } from '@/actions/budget';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const QUICK_AMOUNTS = [
  { label: 'Rp 500rb', value: 500000 },
  { label: 'Rp 1jt', value: 1000000 },
  { label: 'Rp 1.5jt', value: 1500000 },
  { label: 'Rp 2jt', value: 2000000 },
];

interface BudgetFormModalProps {
  initialMonth?: number;
  initialYear?: number;
  initialAmount?: number;
  triggerButtonText?: string;
  className?: string;
}

export function BudgetFormModal({
  initialMonth = new Date().getMonth() + 1,
  initialYear = new Date().getFullYear(),
  initialAmount = 0,
  triggerButtonText = 'Atur Anggaran',
  className = '',
}: BudgetFormModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [displayAmount, setDisplayAmount] = useState(
    initialAmount > 0 ? `Rp ${new Intl.NumberFormat('id-ID').format(initialAmount)}` : ''
  );
  const [errors, setErrors] = useState<{ amount?: string[]; general?: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Close modal when Escape key is pressed
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      setDisplayAmount('');
      setErrors((prev) => ({ ...prev, amount: undefined }));
      return;
    }
    const formatted = `Rp ${new Intl.NumberFormat('id-ID').format(parseInt(digits, 10))}`;
    setDisplayAmount(formatted);
    setErrors((prev) => ({ ...prev, amount: undefined }));
  }

  function handleQuickSet(amountVal: number) {
    const formatted = `Rp ${new Intl.NumberFormat('id-ID').format(amountVal)}`;
    setDisplayAmount(formatted);
    setErrors((prev) => ({ ...prev, amount: undefined }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const rawNumber = cleanRupiahAmount(displayAmount);

    if (rawNumber <= 0) {
      setErrors({ amount: ['Nominal anggaran harus lebih dari Rp 0.'] });
      return;
    }

    if (rawNumber > 1000000000) {
      setErrors({ amount: ['Nominal anggaran maksimal Rp 1.000.000.000.'] });
      return;
    }

    const formData = new FormData();
    formData.append('month', String(month));
    formData.append('year', String(year));
    formData.append('amount', String(rawNumber));

    startTransition(async () => {
      const result: SetBudgetResult = await setBudgetAction(null, formData);

      if (result.success) {
        setIsOpen(false);
        setToastMessage(result.message || 'Anggaran berhasil disimpan!');
        router.refresh();
      } else {
        if (result.errors?.amount) {
          setErrors({ amount: result.errors.amount });
        } else {
          setErrors({ general: result.message || 'Gagal menyimpan anggaran.' });
        }
      }
    });
  }

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-mono text-xs shadow-2xl border border-zinc-800 dark:border-zinc-200 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setErrors({});
        }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 shadow-xs transition-colors cursor-pointer ${className}`}
      >
        <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{triggerButtonText}</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => !isPending && setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Atur Anggaran Bulanan
                  </h2>
                  <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    Target batas pengeluaran untuk periode terpilih
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isPending && setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Tutup (Esc)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* General Error Banner */}
            {errors.general && (
              <div
                role="alert"
                className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-mono text-rose-800 dark:text-rose-200"
              >
                {errors.general}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Periode Anggaran */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="budget-month" className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Bulan
                  </label>
                  <select
                    id="budget-month"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    disabled={isPending}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 disabled:opacity-50"
                  >
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="budget-year" className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Tahun
                  </label>
                  <select
                    id="budget-year"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    disabled={isPending}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 disabled:opacity-50"
                  >
                    {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Plafon Anggaran Input */}
              <div>
                <label htmlFor="budget-amount" className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Target Plafon Anggaran (Rp)
                </label>
                <input
                  id="budget-amount"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  disabled={isPending}
                  placeholder="e.g. Rp 1.500.000"
                  className={`w-full rounded-lg border bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none disabled:opacity-50 transition-colors ${
                    errors.amount
                      ? 'border-rose-500 focus:border-rose-600 dark:border-rose-500'
                      : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700'
                  }`}
                />
                {errors.amount && (
                  <p role="alert" className="mt-1.5 text-[11px] font-mono text-rose-600 dark:text-rose-400">
                    {errors.amount[0]}
                  </p>
                )}
              </div>

              {/* Quick Set Chips */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-500 mb-1.5">
                  Pilihan Cepat:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_AMOUNTS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleQuickSet(item.value)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Anggaran</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
=======
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
>>>>>>> feat/monthly-budget
  );
}
