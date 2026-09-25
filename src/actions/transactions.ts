'use server';

import { db } from '@/src/db';
import { transactions } from '@/src/db/schema/transactions';
import { getCurrentUserId } from '@/src/lib/auth';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface ActionState {
  success?: boolean;
  errors?: {
    type?: string;
    amount?: string;
    description?: string;
    transactionDate?: string;
    _form?: string;
  };
}

export async function createTransactionAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawType = formData.get('type')?.toString() || '';
  const rawAmount = formData.get('amount')?.toString() || '';
  const rawDescription = formData.get('description')?.toString() || '';
  const rawTransactionDate = formData.get('transactionDate')?.toString() || '';

  const errors: ActionState['errors'] = {};

  // Validasi type
  if (!rawType || !['income', 'expense'].includes(rawType)) {
    errors.type = 'Jenis transaksi wajib dipilih (Pemasukan atau Pengeluaran)';
  }

  // Validasi amount
  const parsedAmount = parseInt(rawAmount, 10);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.amount = 'Nominal harus berupa angka lebih besar dari 0';
  }

  // Validasi description
  const trimmedDescription = rawDescription.trim();
  if (!trimmedDescription || trimmedDescription.length < 3) {
    errors.description = 'Deskripsi minimal 3 karakter';
  } else if (trimmedDescription.length > 255) {
    errors.description = 'Deskripsi maksimal 255 karakter';
  }

  // Validasi transactionDate
  if (!rawTransactionDate || isNaN(Date.parse(rawTransactionDate))) {
    errors.transactionDate = 'Tanggal transaksi tidak valid';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const currentUserId = await getCurrentUserId();

  try {
    await db.insert(transactions).values({
      userId: currentUserId,
      type: rawType as 'income' | 'expense',
      amount: parsedAmount,
      description: trimmedDescription,
      transactionDate: rawTransactionDate,
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return {
      success: false,
      errors: { _form: 'Gagal menyimpan transaksi ke database. Silakan coba lagi.' },
    };
  }

  redirect('/dashboard/transactions?status=created');
}

export async function updateTransactionAction(
  id: number,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawType = formData.get('type')?.toString() || '';
  const rawAmount = formData.get('amount')?.toString() || '';
  const rawDescription = formData.get('description')?.toString() || '';
  const rawTransactionDate = formData.get('transactionDate')?.toString() || '';

  const errors: ActionState['errors'] = {};

  if (!rawType || !['income', 'expense'].includes(rawType)) {
    errors.type = 'Jenis transaksi wajib dipilih (Pemasukan atau Pengeluaran)';
  }

  const parsedAmount = parseInt(rawAmount, 10);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    errors.amount = 'Nominal harus berupa angka lebih besar dari 0';
  }

  const trimmedDescription = rawDescription.trim();
  if (!trimmedDescription || trimmedDescription.length < 3) {
    errors.description = 'Deskripsi minimal 3 karakter';
  } else if (trimmedDescription.length > 255) {
    errors.description = 'Deskripsi maksimal 255 karakter';
  }

  if (!rawTransactionDate || isNaN(Date.parse(rawTransactionDate))) {
    errors.transactionDate = 'Tanggal transaksi tidak valid';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const currentUserId = await getCurrentUserId();

  try {
    const result = await db
      .update(transactions)
      .set({
        type: rawType as 'income' | 'expense',
        amount: parsedAmount,
        description: trimmedDescription,
        transactionDate: rawTransactionDate,
        updatedAt: new Date(),
      })
      .where(and(eq(transactions.id, id), eq(transactions.userId, currentUserId)))
      .returning();

    if (result.length === 0) {
      return {
        success: false,
        errors: { _form: 'Transaksi tidak ditemukan atau Anda tidak memiliki akses untuk mengubahnya.' },
      };
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    return {
      success: false,
      errors: { _form: 'Gagal memperbarui transaksi. Silakan coba lagi.' },
    };
  }

  redirect('/dashboard/transactions?status=updated');
}

export async function deleteTransactionAction(formData: FormData): Promise<void> {
  const rawId = formData.get('id')?.toString();
  if (!rawId) return;

  const id = parseInt(rawId, 10);
  if (isNaN(id)) return;

  const currentUserId = await getCurrentUserId();

  try {
    await db
      .delete(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.userId, currentUserId)));
  } catch (error) {
    console.error('Error deleting transaction:', error);
  }

  revalidatePath('/dashboard/transactions');
}
