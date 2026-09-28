'use client';

import { useState } from 'react';
import type { BudgetSummary } from '@/actions/budget';
import { formatMonthYear } from '@/lib/date';
import { formatRupiah } from '@/components/dashboard/summary-cards';
import { BudgetFormModal } from './budget-form-modal';

interface BudgetSummaryCardProps {
  summary: BudgetSummary;
}

export function BudgetSummaryCard({ summary }: BudgetSummaryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status Styling Configuration
  const statusConfig = {
    safe: {
      label: 'Aman',
      badgeClass:
        'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      barClass: 'bg-emerald-500',
      description: 'Pengeluaran Anda terkontrol dengan baik.',
    },
    warning: {
      label: 'Waspada',
      badgeClass:
        'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      barClass: 'bg-amber-500',
      description: 'Pengeluaran telah mencapai 70% atau lebih dari anggaran.',
    },
    danger: {
      label: 'Overbudget',
      badgeClass:
        'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      barClass: 'bg-rose-500',
      description: 'Perhatian! Total pengeluaran telah melebihi batas anggaran.',
    },
    none: {
      label: 'Belum Diatur',
      badgeClass: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600',
      barClass: 'bg-gray-300',
      description: '',
    },
    unbudgeted: {
      label: 'Belum Diatur',
      badgeClass: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600',
      barClass: 'bg-gray-300',
      description: '',
    },
  };

  const currentStatus = statusConfig[summary.status];
  const barWidth = Math.min(100, Math.max(0, summary.percentage));
  const isOverbudget = summary.hasBudget && summary.remainingBudget < 0;

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xs border border-gray-200 dark:border-slate-700 mb-8 transition-colors">
        {/* Header Kartu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-28h6a3 3 0 013 3v12a3 3 0 01-3 3H9a3 3 0 01-3-3V6a3 3 0 013-3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Anggaran Bulanan ({formatMonthYear(summary.month, summary.year)})
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Target batas maksimal pengeluaran bulan ini
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
          >
            {summary.hasBudget ? 'Ubah Plafon' : '+ Tetapkan Anggaran'}
          </button>
        </div>

        {/* Isi Konten: Data Anggaran vs Empty State */}
        {!summary.hasBudget ? (
          <div className="py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center mx-auto mb-3 text-gray-400 dark:text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-300 font-medium">
              Belum ada plafon anggaran untuk {formatMonthYear(summary.month, summary.year)}.
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              Tetapkan batas pengeluaran bulanan agar Anda dapat memantau sisa uang dan persentase belanja.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer shadow-xs"
            >
              + Tetapkan Anggaran Sekarang
            </button>
          </div>
        ) : (
          <div className="pt-6 space-y-6">
            {/* Tiga Metrik Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Plafon Anggaran */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Plafon Anggaran</span>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {formatRupiah(summary.budgetAmount)}
                </p>
              </div>

              {/* Total Pengeluaran Aktual */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Pengeluaran Aktual</span>
                <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-1">
                  - {formatRupiah(summary.totalExpense).replace('-', '')}
                </p>
              </div>

              {/* Sisa Anggaran */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Sisa Anggaran</span>
                  {isOverbudget && (
                    <span className="text-2xs font-semibold uppercase text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                      Defisit
                    </span>
                  )}
                </div>
                <p
                  className={`text-lg font-bold mt-1 ${
                    isOverbudget
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatRupiah(summary.remainingBudget)}
                </p>
              </div>
            </div>

            {/* Indikator Visual (Progress Bar & Status) */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700 dark:text-slate-200">
                    Penggunaan: {summary.percentage}%
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold border ${currentStatus.badgeClass}`}
                  >
                    {currentStatus.label}
                  </span>
                </div>
                <span className="text-gray-400 dark:text-slate-500 text-2xs">
                  {summary.totalExpense.toLocaleString('id-ID')} / {summary.budgetAmount.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Batang Kemajuan (Progress Bar) */}
              <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                <div
                  style={{ width: `${barWidth}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${currentStatus.barClass}`}
                />
              </div>

              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                {currentStatus.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      <BudgetFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        month={summary.month}
        year={summary.year}
        initialAmount={summary.budgetAmount}
      />
    </>
  );
}
