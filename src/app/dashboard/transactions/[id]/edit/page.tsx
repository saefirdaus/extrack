import Link from 'next/link';
import { db } from '@/db';
import { transactions } from '@/db/schema/transactions';
import { getCurrentUserId } from '@/lib/auth';
import { TransactionForm } from '@/components/transactions/transaction-form';
import { and, eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTransactionPage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) {
    notFound();
  }

  const currentUserId = await getCurrentUserId();

  let item: typeof transactions.$inferSelect | undefined;
  try {
    const results = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, currentUserId)))
      .limit(1);
    item = results[0];
  } catch (error) {
    console.error('Error fetching transaction for edit:', error);
  }

  if (!item) {
    notFound();
  }

  return (
    <div className="max-w-md mx-auto py-4">
      <Link
        href="/dashboard/transactions"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 mb-4 transition-colors"
      >
        ← Kembali
      </Link>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xs border border-zinc-200 dark:border-zinc-800 p-5 transition-colors">
        <div className="mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Edit Transaksi
          </h1>
          <span className="text-xs font-mono text-zinc-400">
            #{item.id}
          </span>
        </div>

        <TransactionForm initialData={item} />
      </div>
    </div>
  );
}
