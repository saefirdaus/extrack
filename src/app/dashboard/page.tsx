import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getFilterPreference,
  isValidFilter,
  type TransactionFilter,
} from '@/lib/cookies/preference';
import { getDashboardData } from '@/actions/dashboard';
import { getBudgetAction } from '@/actions/budget';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { FilterSelector } from '@/components/dashboard/filter-selector';
import { RecentTransactionsList } from '@/components/dashboard/recent-transactions-list';
import { BudgetFormModal } from '@/components/budget/budget-form-modal';

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

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [data, currentBudget] = await Promise.all([
    getDashboardData(user.id, activeFilter),
    getBudgetAction(currentMonth, currentYear),
  ]);

  const monthName = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

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

      {/* Monthly Budget Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              Plafon Anggaran ({monthName})
            </span>
            {currentBudget ? (
              <span className="text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                Rp {new Intl.NumberFormat('id-ID').format(currentBudget.amount)}
              </span>
            ) : (
              <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 italic">
                Belum ditetapkan
              </span>
            )}
          </div>
        </div>

        <BudgetFormModal
          initialMonth={currentMonth}
          initialYear={currentYear}
          initialAmount={currentBudget?.amount || 0}
          triggerButtonText={currentBudget ? 'Ubah Anggaran' : 'Tetapkan Anggaran'}
        />
      </div>

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
