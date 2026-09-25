import { db } from '@/src/db';
import { transactions } from '@/src/db/schema/transactions';
import { getCurrentUserId } from '@/src/lib/auth';
import { TransactionTable } from '@/src/components/transactions/transaction-table';
import { and, desc, eq } from 'drizzle-orm';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const currentUserId = await getCurrentUserId();
  const { status } = await searchParams;

  let items: typeof transactions.$inferSelect[] = [];
  try {
    items = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, currentUserId))
      .orderBy(desc(transactions.transactionDate), desc(transactions.createdAt))
      .limit(50);
  } catch (error) {
    console.error('Error loading transactions:', error);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi Keuangan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan catat riwayat arus kas pemasukan dan pengeluaran Anda.
          </p>
        </div>
        <Link
          href="/dashboard/transactions/new"
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm"
        >
          + Catat Transaksi Baru
        </Link>
      </div>

      {/* Flash Messages */}
      {status === 'created' && (
        <div className="p-4 mb-6 rounded-xl bg-green-50 text-green-800 text-sm border border-green-200 flex items-center justify-between">
          <span>Transaksi baru berhasil disimpan!</span>
        </div>
      )}
      {status === 'updated' && (
        <div className="p-4 mb-6 rounded-xl bg-blue-50 text-blue-800 text-sm border border-blue-200 flex items-center justify-between">
          <span>Perubahan transaksi berhasil disimpan!</span>
        </div>
      )}

      {/* Transactions List */}
      <TransactionTable items={items} />
    </div>
  );
}
