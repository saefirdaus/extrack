'use client';

import { Transaction } from '@/src/db/schema/transactions';
import { useEffect } from 'react';
import { TransactionForm } from './transaction-form';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Transaction;
}

export function TransactionModal({ isOpen, onClose, initialData }: TransactionModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 p-6 relative my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'Edit Transaksi' : 'Catat Transaksi Baru'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            title="Tutup"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <TransactionForm
          initialData={initialData}
          onSuccess={onClose}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
