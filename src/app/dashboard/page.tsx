import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getFilterPreference,
  isValidFilter,
  type TransactionFilter,
  getThemePreference,
} from '@/lib/cookies/preference';
import { getDashboardData } from '@/actions/dashboard';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { FilterSelector } from '@/components/dashboard/filter-selector';
import { RecentTransactionsList } from '@/components/dashboard/recent-transactions-list';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';

interface DashboardPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  // 1. Ambil user terotentikasi
  const user = await getCurrentUser();

  // 2. Baca preferensi tema (light / dark) dari cookie
  const theme = await getThemePreference();

  // 3. Baca preferensi filter dari cookie (dengan fallback query params jika diberikan)
  let activeFilter: TransactionFilter = await getFilterPreference();
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const paramFilter = searchParams?.filter;
  if (typeof paramFilter === 'string' && isValidFilter(paramFilter)) {
    activeFilter = paramFilter;
  }

  // 4. Ambil data agregasi & transaksi terbaru
  const data = await getDashboardData(user.id, activeFilter);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-900 transition-colors">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              EXTRACK
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
              Keuangan Mahasiswa
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Dark / Light Mode */}
            <ThemeToggle initialTheme={theme} />

            <h1 className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Halo, <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>!
            </h1>

            <form
              action={async () => {
                'use server';
                const cookieStore = await cookies();
                cookieStore.delete('auth_token');
              }}
            >
              <button
                type="submit"
                className="text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition px-2.5 py-1 rounded hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Error Container Specification */}
        {data.error && (
          <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            Gagal memuat ringkasan keuangan. Silakan segarkan halaman.
          </div>
        )}

        {/* Ringkasan Finansial (Saldo, Pemasukan, Pengeluaran) */}
        <SummaryCards
          currentBalance={data.currentBalance}
          totalIncome={data.totalIncome}
          totalExpense={data.totalExpense}
        />

        {/* Filter Transaksi dengan Persistensi Cookies */}
        <FilterSelector currentFilter={activeFilter} />

        {/* 5 Transaksi Terbaru atau Empty State */}
        <RecentTransactionsList
          transactions={data.recentTransactions}
          hasAnyTransactions={data.hasTransactions}
        />
      </main>
    </div>
  );
}
