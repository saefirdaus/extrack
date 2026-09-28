'use server';

import { revalidatePath } from 'next/cache';
<<<<<<< HEAD
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { budgets, type Budget } from '@/db/schema/budgets';
import { getCurrentUser } from '@/lib/auth/session';
import {
  validateBudgetInput,
  type BudgetValidationErrors,
} from '@/lib/validation/budget';

export interface SetBudgetResult {
  success: boolean;
  message?: string;
  data?: Budget;
  errors?: BudgetValidationErrors;
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
  if (!user) {
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
=======
import { eq, and, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import { budgets } from '@/db/schema/budgets';
import { transactions } from '@/db/schema/transactions';
import { getCurrentUser } from '@/lib/auth/session';
import { setBudgetSchema } from '@/lib/validation/budget';
import { getMonthDateRange } from '@/lib/date';

export type BudgetStatus = 'none' | 'safe' | 'warning' | 'danger';

export interface BudgetSummary {
  month: number;
  year: number;
  hasBudget: boolean;
  budgetAmount: number;
  totalExpense: number;
  remainingBudget: number;
  percentage: number;
  status: BudgetStatus;
  error?: string | null;
}

export interface SetBudgetState {
  success?: boolean;
  message?: string;
  errors?: {
    amount?: string[];
    month?: string[];
    year?: string[];
  };
}

/**
 * Server Action untuk menetapkan atau memperbarui plafon anggaran bulanan (Upsert Pattern).
 * Dilindungi dengan otorisasi Owner Isolation dari session pengguna login.
 */
export async function setBudgetAction(
  _prevState: SetBudgetState,
  formData: FormData
): Promise<SetBudgetState> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return { success: false, message: 'Sesi tidak valid. Silakan login kembali.' };
    }

    const rawData = {
      amount: formData.get('amount'),
      month: formData.get('month'),
      year: formData.get('year'),
    };

    const validated = setBudgetSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { amount, month, year } = validated.data;

    // Upsert menggunakan onConflictDoUpdate pada kombinasi uniqueIndex (userId, month, year)
    await db
>>>>>>> feat/monthly-budget
      .insert(budgets)
      .values({
        userId: user.id,
        month,
        year,
        amount,
<<<<<<< HEAD
=======
        updatedAt: new Date(),
>>>>>>> feat/monthly-budget
      })
      .onConflictDoUpdate({
        target: [budgets.userId, budgets.month, budgets.year],
        set: {
          amount,
          updatedAt: new Date(),
        },
<<<<<<< HEAD
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
=======
      });

    revalidatePath('/dashboard');
    return { success: true, message: 'Anggaran bulanan berhasil disimpan.' };
  } catch (error) {
    console.error('Error executing setBudgetAction:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan pada server saat menyimpan anggaran.',
>>>>>>> feat/monthly-budget
    };
  }
}

/**
<<<<<<< HEAD
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
=======
 * Mengambil ringkasan anggaran bulanan, total pengeluaran aktual, sisa anggaran, dan indikator status.
 */
export async function getMonthlyBudgetSummary(
  userId: number,
  month: number,
  year: number
): Promise<BudgetSummary> {
  try {
    // 1. Ambil data anggaran pada bulan & tahun bersangkutan
    const budgetRecords = await db
      .select({
        id: budgets.id,
        amount: budgets.amount,
      })
      .from(budgets)
      .where(
        and(
          eq(budgets.userId, userId),
>>>>>>> feat/monthly-budget
          eq(budgets.month, month),
          eq(budgets.year, year)
        )
      )
      .limit(1);

<<<<<<< HEAD
    return result[0] || null;
  } catch (error) {
    console.error('Database error in getBudgetAction:', error);
    return null;
=======
    const hasBudget = budgetRecords.length > 0;
    const budgetAmount = hasBudget ? Number(budgetRecords[0].amount) : 0;

    // 2. Ambil total pengeluaran aktual (expense) pada bulan & tahun bersangkutan
    const { startDate, endDate } = getMonthDateRange(month, year);

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
        status = 'danger'; // Overbudget (>= 100%)
      } else if (percentage >= 70) {
        status = 'warning'; // Waspada (70% - 99.9%)
      } else {
        status = 'safe'; // Aman (< 70%)
      }
    }

    return {
      month,
      year,
      hasBudget,
      budgetAmount,
      totalExpense,
      remainingBudget,
      percentage,
      status,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching getMonthlyBudgetSummary:', error);
    return {
      month,
      year,
      hasBudget: false,
      budgetAmount: 0,
      totalExpense: 0,
      remainingBudget: 0,
      percentage: 0,
      status: 'none',
      error: 'DATABASE_ERROR',
    };
>>>>>>> feat/monthly-budget
  }
}
