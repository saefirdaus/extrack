import { z } from 'zod';

export const setBudgetSchema = z.object({
  amount: z.coerce
    .number({ message: 'Nominal anggaran harus berupa angka.' })
    .int('Nominal anggaran harus berupa bilangan bulat.')
    .positive('Nominal anggaran harus lebih besar dari 0.')
    .min(1000, 'Minimal anggaran adalah Rp 1.000.')
    .max(10_000_000_000, 'Maksimal anggaran adalah Rp 10.000.000.000.'),
  month: z.coerce
    .number()
    .int()
    .min(1, 'Bulan harus bernilai 1-12.')
    .max(12, 'Bulan harus bernilai 1-12.'),
  year: z.coerce
    .number()
    .int()
    .min(2020, 'Tahun minimal adalah 2020.')
    .max(2099, 'Tahun maksimal adalah 2099.'),
});

export type SetBudgetInput = z.infer<typeof setBudgetSchema>;
