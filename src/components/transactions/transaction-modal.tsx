'use client';

import { Transaction } from '@/src/db/schema/transactions';
import { useEffect, useState } from 'react';
import { CalendarPanel } from './calendar-panel';
import { TransactionForm } from './transaction-form';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Transaction;
}

export function TransactionModal({ isOpen, onClose, initialData }: TransactionModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    initialData ? initialData.transactionDate : todayStr
  );

  useEffect(() => {
    if (initialData) {
      setSelectedDate(initialData.transactionDate);
    } else {
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
    setIsCalendarOpen(false);
  }, [initialData, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCalendarOpen) {
          setIsCalendarOpen(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isCalendarOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto transition-all duration-300 animate-in fade-in">
      <div
        className="flex flex-col md:flex-row items-center justify-center gap-6 transition-all duration-300 ease-out max-w-4xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Form Modal Card */}
        <div className="bg-zinc-900/95 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-800/90 p-6 sm:p-7 relative transition-all duration-300 ease-out transform animate-in zoom-in-95 backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800/80">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
                {initialData ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                {initialData ? 'Perbarui detail transaksi keuangan' : 'Isi rincian pemasukan atau pengeluaran'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 active:scale-90"
              title="Tutup"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <TransactionForm
            initialData={initialData}
            onSuccess={onClose}
            onCancel={onClose}
            isCalendarOpen={isCalendarOpen}
            onToggleCalendar={() => setIsCalendarOpen(!isCalendarOpen)}
            transactionDate={selectedDate}
            onDateChange={(newDate) => setSelectedDate(newDate)}
          />
        </div>

        {/* Side-by-Side Calendar Popover Panel */}
        {isCalendarOpen && (
          <CalendarPanel
            value={selectedDate}
            onChange={(newDate) => {
              setSelectedDate(newDate);
            }}
            onClose={() => setIsCalendarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
