'use server';

import { revalidatePath } from 'next/cache';
import { eq, and, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import { budgets, type Budget } from '@/db/schema/budgets';
import { transactions } from '@/db/schema/transactions';
import { getCurrentUser } from '@/lib/auth/session';
import {
  validateBudgetInput,
  type BudgetValidationErrors,
} from '@/lib/validation/budget';
import { getMonthDateRange, formatMonthYear } from '@/lib/date';

export interface SetBudgetResult {
  success: boolean;
  message?: string;
  data?: Budget;
  errors?: BudgetValidationErrors;
}

export type SetBudgetState = SetBudgetResult;

export type BudgetStatus = 'safe' | 'warning' | 'danger' | 'unbudgeted' | 'none';

export interface BudgetSummary {
  month: number;
  year: number;
  monthYearLabel: string;
  hasBudget: boolean;
  budgetAmount: number;
  totalExpense: number;
  remainingBudget: number;
  percentage: number;
  usagePercentage: number;
  status: BudgetStatus;
  error?: string | null;
}

/**
 * Server Action untuk menetapkan atau memperbarui target anggaran bulanan (Upsert).
 * Menggunakan identitas user dari token JWT session secara aman.
 */
export async function setBudgetAction(
  prevState: SetBudgetResult | null,
  formData: FormData
): Promise<SetBudgetResult> {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    return {
      success: false,
      message: 'Sesi tidak valid atau telah berakhir. Silakan login kembali.',
    };
  }

  const rawMonth = formData.get('month');
  const rawYear = formData.get('year');
  const rawAmount = formData.get('amount');

  const validation = validateBudgetInput({
    month: rawMonth,
    year: rawYear,
    amount: rawAmount,
  });

  if (!validation.success || !validation.data) {
    return {
      success: false,
      message: 'Validasi input anggaran gagal.',
      errors: validation.errors,
    };
  }

  const { month, year, amount } = validation.data;

  try {
    const [savedBudget] = await db
      .insert(budgets)
      .values({
        userId: user.id,
        month,
        year,
        amount,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [budgets.userId, budgets.month, budgets.year],
        set: {
          amount,
          updatedAt: new Date(),
        },
      })
      .returning();

    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Anggaran bulanan berhasil disimpan.',
      data: savedBudget,
    };
  } catch (error) {
    console.error('Database error in setBudgetAction:', error);
    return {
      success: false,
      message: 'Gagal menyimpan anggaran ke database. Silakan coba kembali.',
    };
  }
}

/**
 * Mengambil data anggaran bulanan milik pengguna aktif untuk periode bulan dan tahun tertentu.
 */
export async function getBudgetAction(
  month: number,
  year: number
): Promise<Budget | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  try {
    const result = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, user.id),
          eq(budgets.month, month),
          eq(budgets.year, year)
        )
      )
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error('Database error in getBudgetAction:', error);
    return null;
  }
}

/**
 * Mengambil ringkasan anggaran bulanan, total pengeluaran aktual, sisa anggaran, dan indikator status.
 */
export async function getMonthlyBudgetSummary(
  userId: number,
  month?: number,
  year?: number
): Promise<BudgetSummary> {
  const now = new Date();
  const targetMonth =
    typeof month === 'number' && month >= 1 && month <= 12 ? month : now.getMonth() + 1;
  const targetYear =
    typeof year === 'number' && year >= 2020 && year <= 2099 ? year : now.getFullYear();

  const monthYearLabel = formatMonthYear(targetMonth, targetYear);
  const { startDate, endDate } = getMonthDateRange(targetMonth, targetYear);

  try {
    const budgetRecords = await db
      .select({
        id: budgets.id,
        amount: budgets.amount,
      })
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
          eq(budgets.month, targetMonth),
          eq(budgets.year, targetYear)
        )
      )
      .limit(1);

    const hasBudget = budgetRecords.length > 0;
    const budgetAmount = hasBudget ? Number(budgetRecords[0].amount) : 0;

    const userExpenseTransactions = await db
      .select({
        amount: transactions.amount,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'expense'),
          gte(transactions.transactionDate, startDate),
          lte(transactions.transactionDate, endDate)
        )
      );

    let totalExpense = 0;
    for (const trx of userExpenseTransactions) {
      totalExpense += Number(trx.amount) || 0;
    }

    const remainingBudget = budgetAmount - totalExpense;
    const percentage =
      budgetAmount > 0
        ? Math.round((totalExpense / budgetAmount) * 100 * 10) / 10
        : 0;

    let status: BudgetStatus = 'none';
    if (hasBudget) {
      if (percentage >= 100) {
        status = 'danger';
      } else if (percentage >= 70) {
        status = 'warning';
      } else {
        status = 'safe';
      }
    }

    return {
      month: targetMonth,
      year: targetYear,
      monthYearLabel,
      hasBudget,
      budgetAmount,
      totalExpense,
      remainingBudget,
      percentage,
      usagePercentage: percentage,
      status,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching getMonthlyBudgetSummary:', error);
    return {
      month: targetMonth,
      year: targetYear,
      monthYearLabel,
      hasBudget: false,
      budgetAmount: 0,
      totalExpense: 0,
      remainingBudget: 0,
      percentage: 0,
      usagePercentage: 0,
      status: 'none',
      error: 'Gagal memuat ringkasan anggaran.',
    };
  }
}

