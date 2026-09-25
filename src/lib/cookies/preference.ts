import { cookies } from 'next/headers';

export type TransactionFilter = 'all' | 'income' | 'expense';
export type ThemePreference = 'light' | 'dark';

export const FILTER_COOKIE_NAME = 'pref_transaction_filter';
export const THEME_COOKIE_NAME = 'pref_theme';
export const VALID_FILTERS: TransactionFilter[] = ['all', 'income', 'expense'];
export const DEFAULT_FILTER: TransactionFilter = 'all';
export const DEFAULT_THEME: ThemePreference = 'light';

/**
 * Memvalidasi apakah string merupakan nilai filter yang valid.
 */
export function isValidFilter(value: unknown): value is TransactionFilter {
  return typeof value === 'string' && VALID_FILTERS.includes(value as TransactionFilter);
}

/**
 * Membaca preferensi filter transaksi dari cookie browser (Server Component / Action).
 * Fallback ke 'all' jika cookie tidak ada atau nilainya tidak dikenal.
 */
export async function getFilterPreference(): Promise<TransactionFilter> {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(FILTER_COOKIE_NAME)?.value;

  if (isValidFilter(rawValue)) {
    return rawValue;
  }

  return DEFAULT_FILTER;
}

/**
 * Menyimpan preferensi filter transaksi ke cookie browser.
 */
export async function setFilterPreference(filterValue: string): Promise<TransactionFilter> {
  const safeFilter: TransactionFilter = isValidFilter(filterValue) ? filterValue : DEFAULT_FILTER;

  const cookieStore = await cookies();
  cookieStore.set(FILTER_COOKIE_NAME, safeFilter, {
    maxAge: 60 * 60 * 24 * 30, // 30 hari
    path: '/',
    httpOnly: false, // Boleh diakses client/server
    sameSite: 'lax',
  });

  return safeFilter;
}

/**
 * Membaca preferensi tema (light / dark) dari cookie browser.
 */
export async function getThemePreference(): Promise<ThemePreference> {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(THEME_COOKIE_NAME)?.value;

  if (rawValue === 'dark' || rawValue === 'light') {
    return rawValue;
  }

  return DEFAULT_THEME;
}

/**
 * Menyimpan preferensi tema (light / dark) ke cookie browser.
 */
export async function setThemePreference(theme: ThemePreference): Promise<ThemePreference> {
  const safeTheme: ThemePreference = theme === 'dark' ? 'dark' : 'light';

  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE_NAME, safeTheme, {
    maxAge: 60 * 60 * 24 * 365, // 1 tahun
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
  });

  return safeTheme;
}
