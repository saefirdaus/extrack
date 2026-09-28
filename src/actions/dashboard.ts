'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import { transactions, type Transaction } from '@/db/schema/transactions';
import { getMonthDateRange } from '@/lib/date';
import {
  setFilterPreference,
  isValidFilter,
  type TransactionFilter,
  DEFAULT_FILTER,
  setThemePreference,
  type ThemePreference,
} from '@/lib/cookies/preference';

export interface DashboardData {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactions: Transaction[];
  filter: TransactionFilter;
  hasTransactions: boolean;
  error?: string | null;
}

/**
 * Server Action untuk menyimpan preferensi tema (dark/light) ke cookie.
 */
export async function toggleThemeAction(theme: ThemePreference): Promise<void> {
  await setThemePreference(theme);
  revalidatePath('/dashboard');
}

/**
 * Server Action untuk menyimpan preferensi filter transaksi ke cookie dan merevalidasi halaman dashboard.
 */
export async function saveFilterPreferenceAction(filterValue: string): Promise<void> {
  const safeFilter = isValidFilter(filterValue) ? filterValue : DEFAULT_FILTER;
  await setFilterPreference(safeFilter);
  revalidatePath('/dashboard');
}

/**
 * Mengambil ringkasan keuangan dan 5 transaksi terbaru milik current user.
 * Mendukung pemilahan periode bulan dan tahun opsional.
 * Menerapkan isolasi user (Owner Isolation) dan penanganan kegagalan database secara aman.
 */
export async function getDashboardData(
  userId: number,
  filter: TransactionFilter,
  month?: number,
  year?: number
): Promise<DashboardData> {
  try {
    // 1. Ambil seluruh transaksi milik user untuk kalkulasi total agregasi
    const allUserTransactions = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
      })
      .from(transactions)
      .where(eq(transactions.userId, userId));

    let totalIncome = 0;
    let totalExpense = 0;

    for (const trx of allUserTransactions) {
      if (trx.type === 'income') {
        totalIncome += Number(trx.amount) || 0;
      } else if (trx.type === 'expense') {
        totalExpense += Number(trx.amount) || 0;
      }
    }

    const currentBalance = totalIncome - totalExpense;
    const hasTransactions = allUserTransactions.length > 0;

    // 2. Ambil 5 transaksi terbaru sesuai preferensi filter dan periode (jika ada)
    let whereConditions =
      filter === 'all'
        ? eq(transactions.userId, userId)
        : and(eq(transactions.userId, userId), eq(transactions.type, filter));

    if (month && year) {
      const { startDate, endDate } = getMonthDateRange(month, year);
      whereConditions = and(
        whereConditions,
        gte(transactions.transactionDate, startDate),
        lte(transactions.transactionDate, endDate)
      );
    }

    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(whereConditions)
      .orderBy(desc(transactions.transactionDate), desc(transactions.id))
      .limit(5);

    return {
      currentBalance,
      totalIncome,
      totalExpense,
      recentTransactions,
      filter,
      hasTransactions,
      error: null,
    };
  } catch (error) {
    console.error('Database query failure in getDashboardData:', error);
    return {
      currentBalance: 0,
      totalIncome: 0,
      totalExpense: 0,
      recentTransactions: [],
      filter,
      hasTransactions: false,
      error: 'DATABASE_ERROR',
    };
  }
}
