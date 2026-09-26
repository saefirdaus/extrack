/**
 * Shared utility functions for currency and date formatting.
 * Eliminates redundant implementations across components.
 */

export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absFormatted = Math.abs(amount).toLocaleString('id-ID');
  return isNegative ? `- Rp ${absFormatted}` : `Rp ${absFormatted}`;
}

export function formatRupiahInput(numStr: string): string {
  const digits = numStr.replace(/\D/g, '');
  if (!digits) return '';
  return `Rp ${new Intl.NumberFormat('id-ID').format(parseInt(digits, 10))}`;
}

export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateInput: string | Date): string {
  try {
    const d = typeof dateInput === 'string' ? parseDate(dateInput) : dateInput;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}
