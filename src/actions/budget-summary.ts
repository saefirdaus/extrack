'use server';

import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '@/db';
import { transactions } from '@/db/schema/transactions';
import {
  calculateBudgetPercentage,
  getBudgetStatus,
  getMonthDateRange,
  formatMonthYear,
  type BudgetStatus,
} from '@/lib/budget-summary';

export interface BudgetSummaryData {
  month: number;
  year: number;
  monthYearLabel: string;
  budgetAmount: number;
  totalExpense: number;
  remainingBudget: number;
  usagePercentage: number;
  status: BudgetStatus;
  hasBudget: boolean;
  error?: string | null;
}

/**
 * Mengambil ringkasan anggaran bulanan dan akumulasi transaksi pengeluaran.
 * Menerapkan Owner Isolation (hanya data milik userId aktif).
 *
 * Catatan Arsitektur:
 * Tabel budgets di-query secara aman menggunakan parameterized SQL template.
 * Jika tabel belum dibuat (menunggu PRD set anggaran di-merge), sistem menerapkan
 * graceful fallback ke status unbudgeted tanpa memicu server crash.
 */
export async function getMonthlyBudgetSummary(
  userId: number,
  month?: number,
  year?: number
): Promise<BudgetSummaryData> {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Validasi parameter periode dengan fallback ke bulan berjalan
  const targetMonth =
    typeof month === 'number' && month >= 1 && month <= 12 ? month : currentMonth;
  const targetYear =
    typeof year === 'number' && year >= 2020 && year <= 2099 ? year : currentYear;

  const monthYearLabel = formatMonthYear(targetMonth, targetYear);
  const { startOfMonth, endOfMonth } = getMonthDateRange(targetMonth, targetYear);

  try {
    // 1. Ambil data anggaran pengguna untuk periode (targetMonth, targetYear)
    let budgetAmount = 0;
    let hasBudget = false;

    try {
      const budgetQuery = await db.execute<{ amount: number }>(
        sql`SELECT amount FROM budgets WHERE user_id = ${userId} AND month = ${targetMonth} AND year = ${targetYear} LIMIT 1`
      );

      const budgetRow = budgetQuery.rows[0];
      if (budgetRow && budgetRow.amount !== null && budgetRow.amount !== undefined) {
        budgetAmount = Number(budgetRow.amount) || 0;
        hasBudget = true;
      }
    } catch {
      // Jika tabel budgets belum ada di database, biarkan hasBudget = false
      hasBudget = false;
      budgetAmount = 0;
    }

    // 2. Agregasi pengeluaran riil milik user pada rentang tanggal bulan tersebut
    const expenseQuery = await db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)::int` })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.transactionDate, startOfMonth),
          lte(transactions.transactionDate, endOfMonth)
        )
      );

    const totalExpense = Number(expenseQuery[0]?.total) || 0;
    const remainingBudget = budgetAmount - totalExpense;
    const usagePercentage = calculateBudgetPercentage(totalExpense, budgetAmount);
    const status = getBudgetStatus(usagePercentage, hasBudget);

    return {
      month: targetMonth,
      year: targetYear,
      monthYearLabel,
      budgetAmount,
      totalExpense,
      remainingBudget,
      usagePercentage,
      status,
      hasBudget,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching monthly budget summary:', error);
    return {
      month: targetMonth,
      year: targetYear,
      monthYearLabel,
      budgetAmount: 0,
      totalExpense: 0,
      remainingBudget: 0,
      usagePercentage: 0,
      status: 'unbudgeted',
      hasBudget: false,
      error: 'Gagal memuat ringkasan anggaran. Silakan muat ulang halaman.',
    };
  }
}
