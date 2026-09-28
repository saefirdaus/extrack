/**
 * Utilitas dan kalkulasi untuk fitur Ringkasan & Indikator Anggaran Bulanan.
 * Sesuai spesifikasi prd-budget-summary-indikator-2.md.
 */

export type BudgetStatus = 'safe' | 'warning' | 'danger' | 'unbudgeted';

/**
 * Menghitung persentase penggunaan anggaran.
 * Dilengkapi pengaman pembagian dengan nol (division by zero guard).
 */
export function calculateBudgetPercentage(expense: number, budget: number): number {
  if (!budget || budget <= 0) {
    return 0;
  }
  const safeExpense = Math.max(0, expense);
  return Math.round((safeExpense / budget) * 100);
}

/**
 * Menentukan status penggunaan anggaran berdasarkan persentase.
 * - Safe: < 70%
 * - Warning: 70% s/d 99%
 * - Danger (Overbudget): >= 100%
 * - Unbudgeted: jika belum ada anggaran yang ditetapkan
 */
export function getBudgetStatus(percentage: number, hasBudget: boolean): BudgetStatus {
  if (!hasBudget) {
    return 'unbudgeted';
  }
  if (percentage >= 100) {
    return 'danger';
  }
  if (percentage >= 70) {
    return 'warning';
  }
  return 'safe';
}

/**
 * Menghitung rentang tanggal ISO (YYYY-MM-DD) awal dan akhir bulan secara presisi,
 * termasuk penanganan tahun kabisat (leap year) di bulan Februari.
 */
export function getMonthDateRange(
  month: number,
  year: number
): { startOfMonth: string; endOfMonth: string } {
  const safeMonth = Math.min(Math.max(month, 1), 12);
  const safeYear = Math.min(Math.max(year, 1970), 2100);

  const monthStr = String(safeMonth).padStart(2, '0');
  const startOfMonth = `${safeYear}-${monthStr}-01`;

  // Hari terakhir bulan diperoleh dengan meminta tanggal 0 pada bulan berikutnya (month base-1 di JS)
  const lastDay = new Date(safeYear, safeMonth, 0).getDate();
  const endOfMonth = `${safeYear}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

  return { startOfMonth, endOfMonth };
}

/**
 * Memformat nama bulan dan tahun ke dalam bahasa Indonesia (misal: "Oktober 2026").
 */
export function formatMonthYear(month: number, year: number): string {
  const MONTH_NAMES = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const monthName = MONTH_NAMES[month - 1] || 'Bulan';
  return `${monthName} ${year}`;
}
