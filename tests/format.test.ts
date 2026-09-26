import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRupiah,
  formatRupiahInput,
  parseDate,
  formatISODate,
  formatDisplayDate,
} from '../src/lib/format';

test('formatRupiah correctly formats positive, negative, and zero values', () => {
  assert.equal(formatRupiah(100000), 'Rp 100.000');
  assert.equal(formatRupiah(-50000), '- Rp 50.000');
  assert.equal(formatRupiah(0), 'Rp 0');
  assert.equal(formatRupiah(2500000), 'Rp 2.500.000');
});

test('formatRupiahInput formats raw input strings with thousand separators', () => {
  assert.equal(formatRupiahInput('50000'), 'Rp 50.000');
  assert.equal(formatRupiahInput('1250000'), 'Rp 1.250.000');
  assert.equal(formatRupiahInput(''), '');
  assert.equal(formatRupiahInput('abc'), '');
  assert.equal(formatRupiahInput('Rp 75.000'), 'Rp 75.000');
});

test('parseDate correctly parses YYYY-MM-DD strings', () => {
  const parsed = parseDate('2026-09-25');
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 8); // 0-indexed, 8 is September
  assert.equal(parsed.getDate(), 25);
});

test('formatISODate produces correct YYYY-MM-DD format', () => {
  const d = new Date(2026, 8, 25);
  assert.equal(formatISODate(d), '2026-09-25');
});

test('formatDisplayDate formats date strings to dd/mm/yyyy localized', () => {
  const formatted = formatDisplayDate('2026-09-25');
  assert.equal(formatted, '25/09/2026');
});
