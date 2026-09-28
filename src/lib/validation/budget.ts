import { z } from 'zod';

export const setBudgetSchema = z.object({
  month: z.coerce
    .number()
    .int('Bulan harus berupa bilangan bulat.')
    .min(1, 'Bulan tidak valid (minimal 1).')
    .max(12, 'Bulan tidak valid (maksimal 12).'),
  year: z.coerce
    .number()
    .int('Tahun harus berupa bilangan bulat.')
    .min(2020, 'Tahun tidak valid (minimal 2020).')
    .max(2099, 'Tahun tidak valid (maksimal 2099).'),
  amount: z.coerce
    .number({ message: 'Nominal anggaran harus berupa angka.' })
    .int('Nominal anggaran harus berupa bilangan bulat.')
    .positive('Nominal anggaran harus lebih besar dari 0.')
    .min(1000, 'Minimal anggaran adalah Rp 1.000.')
    .max(10_000_000_000, 'Nominal anggaran maksimal Rp 10.000.000.000.'),
});

export type SetBudgetInput = z.infer<typeof setBudgetSchema>;

export interface BudgetValidationErrors {
  month?: string[];
  year?: string[];
  amount?: string[];
  _form?: string[];
}

/**
 * Membersihkan format string Rupiah atau input teks menjadi angka bulat murni.
 * Contoh: "Rp 1.500.000" -> 1500000
 */
export function cleanRupiahAmount(raw: unknown): number {
  if (typeof raw === 'number') return Math.floor(raw);
  if (!raw || typeof raw !== 'string') return 0;
  const digitsOnly = raw.replace(/\D/g, '').trim();
  return Number(digitsOnly) || 0;
}

/**
 * Memvalidasi input form anggaran menggunakan setBudgetSchema.
 */
export function validateBudgetInput(rawInput: {
  month: unknown;
  year: unknown;
  amount: unknown;
}): {
  success: boolean;
  data?: SetBudgetInput;
  errors?: BudgetValidationErrors;
} {
  const parsedAmount =
    typeof rawInput.amount === 'string'
      ? cleanRupiahAmount(rawInput.amount)
      : rawInput.amount;

  const result = setBudgetSchema.safeParse({
    month: rawInput.month,
    year: rawInput.year,
    amount: parsedAmount,
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors as BudgetValidationErrors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

