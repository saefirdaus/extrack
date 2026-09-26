import Link from 'next/link';
import { TransactionForm } from '@/components/transactions/transaction-form';

export default function NewTransactionPage() {
  return (
    <div className="max-w-md mx-auto py-4">
      <Link
        href="/dashboard/transactions"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 mb-4 transition-colors"
      >
        ← Kembali
      </Link>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-zinc-200 dark:border-zinc-800 p-5 transition-colors">
        <div className="mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Catat Transaksi
          </h1>
        </div>

        <TransactionForm />
      </div>
    </div>
  );
}
