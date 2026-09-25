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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <TransactionForm initialData={item} />
    </div>
  );
}
