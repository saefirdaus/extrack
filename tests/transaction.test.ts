import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAndValidateTransaction } from '../src/lib/validation/transaction';

function createFormData(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.append(key, value);
  }
  return fd;
}

test('Transaction validation: succeeds on valid standard input', () => {
  const fd = createFormData({
    type: 'income',
    amount: '1500000',
    description: 'Honor Asisten Praktikum',
    transactionDate: '2026-09-20',
  });

  const { data, errors } = parseAndValidateTransaction(fd);
  assert.equal(errors, undefined);
  assert.deepEqual(data, {
    type: 'income',
    amount: 1500000,
    description: 'Honor Asisten Praktikum',
    transactionDate: '2026-09-20',
  });
});

test('Transaction validation: gracefully parses formatted Rupiah input', () => {
  const fd = createFormData({
    type: 'expense',
    amount: 'Rp 250.000',
    description: 'Buku Pemrograman Web',
    transactionDate: '2026-09-15',
  });

  const { data, errors } = parseAndValidateTransaction(fd);
  assert.equal(errors, undefined);
  assert.equal(data?.amount, 250000);
});

test('Transaction validation: enforces Postgres 32-bit integer limits (max 2.147.483.647)', () => {
  // Boundary value: exact max int
  const maxAllowed = createFormData({
    type: 'income',
    amount: '2147483647',
    description: 'Investasi Modal Usaha',
    transactionDate: '2026-09-15',
  });
  const resMax = parseAndValidateTransaction(maxAllowed);
  assert.equal(resMax.errors, undefined);
  assert.equal(resMax.data?.amount, 2147483647);

  // Extreme overflow value requested: 99999999999
  const extremeOverflow = createFormData({
    type: 'income',
    amount: '99999999999',
    description: 'Investasi Modal Usaha',
    transactionDate: '2026-09-15',
  });
  const resExtreme = parseAndValidateTransaction(extremeOverflow);
  assert.ok(resExtreme.errors?.amount);
  assert.match(resExtreme.errors!.amount!, /melebihi batas maksimum/);

  // Formatted variant of extreme overflow: Rp 99.999.999.999
  const formattedExtreme = createFormData({
    type: 'income',
    amount: 'Rp 99.999.999.999',
    description: 'Investasi Modal Usaha',
    transactionDate: '2026-09-15',
  });
  const resFormattedExtreme = parseAndValidateTransaction(formattedExtreme);
  assert.ok(resFormattedExtreme.errors?.amount);
  assert.match(resFormattedExtreme.errors!.amount!, /melebihi batas maksimum/);
});

test('Transaction validation: rejects invalid amounts (decimals, zero, negatives, non-digits)', () => {
  const zero = createFormData({ type: 'expense', amount: '0', description: 'Parkir', transactionDate: '2026-09-15' });
  assert.ok(parseAndValidateTransaction(zero).errors?.amount);

  const negative = createFormData({ type: 'expense', amount: '-5000', description: 'Parkir', transactionDate: '2026-09-15' });
  assert.ok(parseAndValidateTransaction(negative).errors?.amount);

  const decimal = createFormData({ type: 'expense', amount: '5000.50', description: 'Parkir', transactionDate: '2026-09-15' });
  assert.ok(parseAndValidateTransaction(decimal).errors?.amount);

  const text = createFormData({ type: 'expense', amount: 'seratus', description: 'Parkir', transactionDate: '2026-09-15' });
  assert.ok(parseAndValidateTransaction(text).errors?.amount);
});

test('Transaction validation: strictly validates calendar dates (non-existent days & leap years)', () => {
  // Leap year: 2024-02-29 is valid
  const leapValid = createFormData({
    type: 'expense',
    amount: '10000',
    description: 'Kopi',
    transactionDate: '2024-02-29',
  });
  assert.equal(parseAndValidateTransaction(leapValid).errors, undefined);

  // Non-leap year: 2025-02-29 does not exist
  const leapInvalid = createFormData({
    type: 'expense',
    amount: '10000',
    description: 'Kopi',
    transactionDate: '2025-02-29',
  });
  assert.ok(parseAndValidateTransaction(leapInvalid).errors?.transactionDate);

  // Non-existent day: February 31
  const feb31 = createFormData({
    type: 'expense',
    amount: '10000',
    description: 'Kopi',
    transactionDate: '2026-02-31',
  });
  assert.ok(parseAndValidateTransaction(feb31).errors?.transactionDate);

  // Non-existent day: April 31
  const apr31 = createFormData({
    type: 'expense',
    amount: '10000',
    description: 'Kopi',
    transactionDate: '2026-04-31',
  });
  assert.ok(parseAndValidateTransaction(apr31).errors?.transactionDate);

  // Year out of reasonable range (< 1970 or > 2100)
  const tooOld = createFormData({
    type: 'expense',
    amount: '10000',
    description: 'Kopi',
    transactionDate: '1899-01-01',
  });
  assert.ok(parseAndValidateTransaction(tooOld).errors?.transactionDate);
});

test('Transaction validation: strips zero-width spaces and handles emojis in description', () => {
  // Zero-width characters only -> effectively empty -> rejected
  const zeroWidth = createFormData({
    type: 'expense',
    amount: '10000',
    description: '\u200B\u200B\u200B\u200B',
    transactionDate: '2026-09-15',
  });
  assert.ok(parseAndValidateTransaction(zeroWidth).errors?.description);

  // Emojis preserved and valid
  const emojiDesc = createFormData({
    type: 'expense',
    amount: '25000',
    description: '☕ Sarapan & Roti 🥐',
    transactionDate: '2026-09-15',
  });
  const resEmoji = parseAndValidateTransaction(emojiDesc);
  assert.equal(resEmoji.errors, undefined);
  assert.equal(resEmoji.data?.description, '☕ Sarapan & Roti 🥐');

  // Exact 255 chars -> accepted
  const exact255 = createFormData({
    type: 'expense',
    amount: '25000',
    description: 'A'.repeat(255),
    transactionDate: '2026-09-15',
  });
  assert.equal(parseAndValidateTransaction(exact255).errors, undefined);

  // 256 chars -> rejected
  const over255 = createFormData({
    type: 'expense',
    amount: '25000',
    description: 'A'.repeat(256),
    transactionDate: '2026-09-15',
  });
  assert.ok(parseAndValidateTransaction(over255).errors?.description);
});
