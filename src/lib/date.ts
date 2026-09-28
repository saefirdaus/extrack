const INDONESIAN_MONTHS = [
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

/**
 * Mendapatkan nama bulan dalam bahasa Indonesia (1-indexed: 1 = Januari)
 */
export function getMonthName(month: number): string {
  const safeMonth = Math.max(1, Math.min(12, month));
  return INDONESIAN_MONTHS[safeMonth - 1];
}

/**
 * Format bulan dan tahun menjadi string ramah pengguna (contoh: "September 2026")
 */
export function formatMonthYear(month: number, year: number): string {
  return `${getMonthName(month)} ${year}`;
}

/**
 * Menghitung bulan sebelumnya atau berikutnya, termasuk penanganan transisi tahun (Desember <-> Januari).
 */
export function getAdjacentMonth(
  currentMonth: number,
  currentYear: number,
  direction: 'prev' | 'next'
): { month: number; year: number } {
  if (direction === 'prev') {
    return currentMonth === 1
      ? { month: 12, year: currentYear - 1 }
      : { month: currentMonth - 1, year: currentYear };
  } else {
    return currentMonth === 12
      ? { month: 1, year: currentYear + 1 }
      : { month: currentMonth + 1, year: currentYear };
  }
}

/**
 * Mengekstrak dan memvalidasi parameter URL `month` dan `year` dengan fallback aman ke bulan berjalan.
 */
export function parseMonthYearParams(searchParams?: {
  month?: string | string[];
  year?: string | string[];
}): { month: number; year: number; isCurrentMonth: boolean } {
  const now = new Date();
  const defaultMonth = now.getMonth() + 1; // 1 - 12
  const defaultYear = now.getFullYear();

  const rawMonth = Array.isArray(searchParams?.month)
    ? searchParams?.month[0]
    : searchParams?.month;
  const rawYear = Array.isArray(searchParams?.year)
    ? searchParams?.year[0]
    : searchParams?.year;

  const parsedMonth = parseInt(rawMonth ?? '', 10);
  const parsedYear = parseInt(rawYear ?? '', 10);

  const month =
    !isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
      ? parsedMonth
      : defaultMonth;
  const year =
    !isNaN(parsedYear) && parsedYear >= 2020 && parsedYear <= 2099
      ? parsedYear
      : defaultYear;

  const isCurrentMonth = month === defaultMonth && year === defaultYear;

  return { month, year, isCurrentMonth };
}

/**
 * Menghasilkan rentang tanggal awal dan akhir (YYYY-MM-DD) untuk suatu bulan dan tahun.
 */
export function getMonthDateRange(
  month: number,
  year: number
): { startDate: string; endDate: string } {
  const monthStr = String(month).padStart(2, '0');
  const startDate = `${year}-${monthStr}-01`;

  // Hari terakhir bulan bersangkutan
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
}
