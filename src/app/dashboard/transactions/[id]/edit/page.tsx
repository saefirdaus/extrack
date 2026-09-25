import { db } from '@/src/db';
import { transactions } from '@/src/db/schema/transactions';
import { getCurrentUserId } from '@/src/lib/auth';
import { TransactionForm } from '@/src/components/transactions/transaction-form';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
          Edit Transaksi
        </h2>
        <TransactionForm initialData={item} />
      </div>
    </div>
  );
}
