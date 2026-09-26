import { db } from '@/db';
import { transactions } from '@/db/schema/transactions';
import { getCurrentUserId } from '@/lib/auth';
import { TransactionsView } from '@/components/transactions/transactions-view';
import { desc, eq } from 'drizzle-orm';

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

  return <TransactionsView items={items} status={status} />;
}
