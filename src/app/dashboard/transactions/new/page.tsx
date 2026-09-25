import { TransactionForm } from '@/src/components/transactions/transaction-form';

export default function NewTransactionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
          Catat Transaksi Baru
        </h2>
        <TransactionForm />
      </div>
    </div>
  );
}
