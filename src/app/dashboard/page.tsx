import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getFilterPreference,
  isValidFilter,
  type TransactionFilter,
} from '@/lib/cookies/preference';
import { getDashboardData } from '@/actions/dashboard';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { FilterSelector } from '@/components/dashboard/filter-selector';
import { RecentTransactionsList } from '@/components/dashboard/recent-transactions-list';

interface DashboardPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  let activeFilter: TransactionFilter = await getFilterPreference();
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const paramFilter = searchParams?.filter;
  if (typeof paramFilter === 'string' && isValidFilter(paramFilter)) {
    activeFilter = paramFilter;
  }

  const data = await getDashboardData(user.id, activeFilter);

  return (
    <div className="space-y-6">
      {data.error && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 font-mono"
        >
          Gagal memuat data. Silakan muat ulang.
        </div>
      )}

      {/* Financial Cockpit Strip */}
      <SummaryCards
        currentBalance={data.currentBalance}
        totalIncome={data.totalIncome}
        totalExpense={data.totalExpense}
      />

      {/* Filter Selector */}
      <FilterSelector currentFilter={activeFilter} />

      {/* Recent Activity Table */}
      <RecentTransactionsList
        transactions={data.recentTransactions}
        hasAnyTransactions={data.hasTransactions}
      />
    </div>
  );
}
