import { test, describe } from 'node:test';
import assert from 'node:assert';
import { db } from '@/db';
import { budgets } from '@/db/schema/budgets';
import { users } from '@/db/schema/users';
import { eq, and } from 'drizzle-orm';
import { getMonthlyBudgetSummary } from '@/actions/budget';
import {
  parseMonthYearParams,
  getAdjacentMonth,
  formatMonthYear,
  getMonthDateRange,
} from '@/lib/date';

describe('Fitur Anggaran Bulanan (Monthly Budget)', () => {
  test('Navigasi dan utilitas tanggal berfungsi dengan tepat', () => {
    // 1. Transisi Januari ke Desember tahun sebelumnya
    const prevJan = getAdjacentMonth(1, 2026, 'prev');
    assert.strictEqual(prevJan.month, 12);
    assert.strictEqual(prevJan.year, 2025);

    // 2. Transisi Desember ke Januari tahun berikutnya
    const nextDes = getAdjacentMonth(12, 2025, 'next');
    assert.strictEqual(nextDes.month, 1);
    assert.strictEqual(nextDes.year, 2026);

    // 3. Format bulan
    assert.strictEqual(formatMonthYear(9, 2026), 'September 2026');

    // 4. Rentang tanggal
    const range = getMonthDateRange(9, 2026);
    assert.strictEqual(range.startDate, '2026-09-01');
    assert.strictEqual(range.endDate, '2026-09-30');

    // 5. Sanitasi query searchParams
    const parsedValid = parseMonthYearParams({ month: '9', year: '2026' });
    assert.strictEqual(parsedValid.month, 9);
    assert.strictEqual(parsedValid.year, 2026);

    const parsedInvalid = parseMonthYearParams({ month: 'invalid', year: '9999' });
    const now = new Date();
    assert.strictEqual(parsedInvalid.month, now.getMonth() + 1);
    assert.strictEqual(parsedInvalid.year, now.getFullYear());
  });

  test('Kalkulasi ringkasan anggaran, sisa anggaran, dan indikator status', async () => {
    // Pastikan user test id: 1 ada
    const existingUser = await db.select().from(users).where(eq(users.id, 1)).limit(1);
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: 1,
        name: 'John Doe',
        email: 'john@kampus.ac.id',
        password: 'hashedpassword',
      });
    }

    // Bersihkan budget untuk bulan 9 tahun 2026
    await db
      .delete(budgets)
      .where(and(eq(budgets.userId, 1), eq(budgets.month, 9), eq(budgets.year, 2026)));

    // Status saat belum ada budget
    const emptySummary = await getMonthlyBudgetSummary(1, 9, 2026);
    assert.strictEqual(emptySummary.hasBudget, false);
    assert.strictEqual(emptySummary.status, 'none');

    // Upsert budget Rp 2.000.000 (Pengeluaran = Rp 310.000 -> Sisa = Rp 1.690.000, Status: safe)
    await db
      .insert(budgets)
      .values({
        userId: 1,
        month: 9,
        year: 2026,
        amount: 2000000,
      })
      .onConflictDoUpdate({
        target: [budgets.userId, budgets.month, budgets.year],
        set: {
          amount: 2000000,
          updatedAt: new Date(),
        },
      });

    const safeSummary = await getMonthlyBudgetSummary(1, 9, 2026);
    assert.strictEqual(safeSummary.hasBudget, true);
    assert.strictEqual(safeSummary.budgetAmount, 2000000);
    assert.strictEqual(safeSummary.totalExpense, 310000);
    assert.strictEqual(safeSummary.remainingBudget, 1690000);
    assert.strictEqual(safeSummary.status, 'safe');

    // Ubah budget menjadi Rp 200.000 (Pengeluaran = Rp 310.000 > 200.000 -> Defisit, Status: danger)
    await db
      .insert(budgets)
      .values({
        userId: 1,
        month: 9,
        year: 2026,
        amount: 200000,
      })
      .onConflictDoUpdate({
        target: [budgets.userId, budgets.month, budgets.year],
        set: {
          amount: 200000,
          updatedAt: new Date(),
        },
      });

    const overbudgetSummary = await getMonthlyBudgetSummary(1, 9, 2026);
    assert.strictEqual(overbudgetSummary.budgetAmount, 200000);
    assert.ok(overbudgetSummary.remainingBudget < 0, 'Sisa anggaran harus negatif (defisit)');
    assert.strictEqual(overbudgetSummary.status, 'danger');
  });
});
