export interface ValidatedTransactionInput {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  transactionDate: string;
}

export interface TransactionValidationErrors {
  type?: string;
  amount?: string;
  description?: string;
  transactionDate?: string;
  _form?: string;
}

export const MAX_POSTGRES_INT = 2_147_483_647; // 32-bit signed integer max

export function parseAndValidateTransaction(formData: FormData): {
  data?: ValidatedTransactionInput;
  errors?: TransactionValidationErrors;
} {
  const rawType = formData.get('type')?.toString() || '';
  const rawAmount = formData.get('amount')?.toString() || '';
  const rawDescription = formData.get('description')?.toString() || '';
  const rawTransactionDate = formData.get('transactionDate')?.toString() || '';

  const errors: TransactionValidationErrors = {};

  // 1. Validasi jenis transaksi
  if (!rawType || !['income', 'expense'].includes(rawType)) {
    errors.type = 'Jenis transaksi wajib dipilih (Pemasukan atau Pengeluaran)';
  }

  // 2. Validasi nominal & integer overflow
  const cleaned = rawAmount.replace(/^Rp\s*/i, '').trim();
  let sanitizedAmountStr = '';

  if (/^\d+$/.test(cleaned)) {
    sanitizedAmountStr = cleaned;
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    sanitizedAmountStr = cleaned.replace(/\./g, '');
  } else if (/^\d{1,3}(,\d{3})+$/.test(cleaned)) {
    sanitizedAmountStr = cleaned.replace(/,/g, '');
  } else {
    errors.amount = 'Nominal harus berupa angka bulat lebih besar dari 0';
  }

  let parsedAmount = 0;
  if (sanitizedAmountStr) {
    parsedAmount = Number(sanitizedAmountStr);
    if (parsedAmount <= 0) {
      errors.amount = 'Nominal harus berupa angka bulat lebih besar dari 0';
    } else if (parsedAmount > MAX_POSTGRES_INT) {
      errors.amount = 'Nominal melebihi batas maksimum (Rp 2.147.483.647)';
    }
  }

  // 3. Validasi deskripsi (termasuk penanganan karakter tak terlihat / zero-width spaces)
  const cleanedDescription = rawDescription
    .replace(/[\u200B-\u200D\uFEFF\0]/g, '')
    .trim();

  if (!cleanedDescription || cleanedDescription.length < 3) {
    errors.description = 'Deskripsi minimal 3 karakter';
  } else if (cleanedDescription.length > 255) {
    errors.description = 'Deskripsi maksimal 255 karakter';
  }

  // 4. Validasi tanggal transaksi secara kalender ketat (Strict Calendar Validation)
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
  if (!rawTransactionDate || !DATE_REGEX.test(rawTransactionDate)) {
    errors.transactionDate = 'Format tanggal harus YYYY-MM-DD';
  } else {
    const [y, m, d] = rawTransactionDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    // Pastikan tanggal benar-benar valid secara kalender (bukan rollover seperti 31 Feb -> 3 Mar)
    if (
      dateObj.getFullYear() !== y ||
      dateObj.getMonth() !== m - 1 ||
      dateObj.getDate() !== d
    ) {
      errors.transactionDate = 'Tanggal transaksi tidak valid pada kalender';
    } else if (y < 1970 || y > 2100) {
      errors.transactionDate = 'Tahun transaksi harus antara 1970 dan 2100';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      type: rawType as 'income' | 'expense',
      amount: parsedAmount,
      description: cleanedDescription,
      transactionDate: rawTransactionDate,
    },
  };
}
