import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getThemePreference } from '@/lib/cookies/preference';
import { logoutAction } from '@/actions/auth';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const theme = await getThemePreference();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Precision Command Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200 dark:border-zinc-800/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand & Route Switcher */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <span className="font-mono text-xs font-bold tracking-wider px-2 py-1 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
                EXTRACK
              </span>
            </Link>

            <nav className="flex items-center gap-1 text-xs font-medium">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Ringkasan
              </Link>
              <Link
                href="/dashboard/transactions"
                className="px-3 py-1.5 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                Transaksi
              </Link>
            </nav>
          </div>

          {/* Action Center & Profile */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard/transactions/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors shadow-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Catat Transaksi</span>
            </Link>

            <ThemeToggle initialTheme={theme} />

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

            <div className="flex items-center gap-2 pl-1">
              <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[11px] font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="hidden sm:inline-block text-xs font-mono text-zinc-600 dark:text-zinc-400 max-w-[140px] truncate">
                {user.name}
              </span>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="p-1.5 rounded-md text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                title="Keluar"
                aria-label="Keluar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
