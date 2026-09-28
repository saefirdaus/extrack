import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getFilterPreference,
  isValidFilter,
  type TransactionFilter,
} from '@/lib/cookies/preference';
import { getDashboardData } from '@/actions/dashboard';
import { getMonthlyBudgetSummary } from '@/actions/budget';
import { parseMonthYearParams } from '@/lib/date';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { BudgetSummaryCard } from '@/components/budget/budget-summary-card';
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

  // 1. Ekstraksi dan sanitasi parameter bulan & tahun dari URL query params
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const { month, year, isCurrentMonth } = parseMonthYearParams(searchParams);

  // 2. Baca preferensi filter dari cookie
  let activeFilter: TransactionFilter = await getFilterPreference();
  const paramFilter = searchParams?.filter;
  if (typeof paramFilter === 'string' && isValidFilter(paramFilter)) {
    activeFilter = paramFilter;
  }

  // 3. Ambil data ringkasan anggaran bulanan & transaksi terfilter periode
  const [budgetSummary, data] = await Promise.all([
    getMonthlyBudgetSummary(user.id, month, year),
    getDashboardData(user.id, activeFilter, month, year),
  ]);

  return (
    <div className="space-y-6">
      {data.error && (
        <div
          role="alert"
          className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 font-mono"
        >
          Gagal memuat data keuangan. Silakan muat ulang.
        </div>
      )}

      {/* 1. Komponen Navigasi Periode Bulan & Tahun */}
      <MonthSelector
        currentMonth={month}
        currentYear={year}
        isCurrentMonth={isCurrentMonth}
      />

      {/* 2. Kartu Anggaran Bulanan (Summary, Progress Bar, & Status Indicator) */}
      <BudgetSummaryCard summary={budgetSummary} />

      {/* 3. Strip Kartu Ringkasan Finansial Akumulatif */}
      <SummaryCards
        currentBalance={data.currentBalance}
        totalIncome={data.totalIncome}
        totalExpense={data.totalExpense}
      />

      {/* 4. Filter Transaksi Berbasis Cookies */}
      <FilterSelector currentFilter={activeFilter} />

      {/* 5. Tabel Riwayat Transaksi Terbaru (Terfilter Periode Bulan) */}
      <RecentTransactionsList
        transactions={data.recentTransactions}
        hasAnyTransactions={data.hasTransactions}
      />
    </div>
  );
}
