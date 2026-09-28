'use server';

import { revalidatePath } from 'next/cache';
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
      .insert(budgets)
      .values({
        userId: user.id,
        month,
        year,
        amount,
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
