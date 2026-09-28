import test from 'node:test';
import assert from 'node:assert/strict';
import {
  setBudgetSchema,
  cleanRupiahAmount,
  validateBudgetInput,
} from '../src/lib/validation/budget';

test('Budget validation: succeeds on valid input', () => {
  const result = validateBudgetInput({
    month: 10,
    year: 2026,
    amount: 1500000,
  });

  assert.equal(result.success, true);
  assert.equal(result.data?.month, 10);
  assert.equal(result.data?.year, 2026);
  assert.equal(result.data?.amount, 1500000);
  assert.equal(result.errors, undefined);
});

test('Budget validation: successfully parses formatted Rupiah input', () => {
  const result = validateBudgetInput({
    month: '9',
    year: '2026',
    amount: 'Rp 2.500.000',
  });

  assert.equal(result.success, true);
  assert.equal(result.data?.month, 9);
  assert.equal(result.data?.year, 2026);
  assert.equal(result.data?.amount, 2500000);
});

test('Budget validation: rejects zero or negative amounts', () => {
  const zeroResult = validateBudgetInput({
    month: 5,
    year: 2026,
    amount: 0,
  });
  assert.equal(zeroResult.success, false);
  assert.ok(zeroResult.errors?.amount);

  const negResult = validateBudgetInput({
    month: 5,
    year: 2026,
    amount: -50000,
  });
  assert.equal(negResult.success, false);
  assert.ok(negResult.errors?.amount);
});

test('Budget validation: rejects amounts exceeding maximum limit (Rp 1.000.000.000)', () => {
  const result = validateBudgetInput({
    month: 5,
    year: 2026,
    amount: 1000000001,
  });

  assert.equal(result.success, false);
  assert.ok(result.errors?.amount);
});

test('Budget validation: rejects invalid months (outside 1 - 12)', () => {
  const underResult = validateBudgetInput({
    month: 0,
    year: 2026,
    amount: 500000,
  });
  assert.equal(underResult.success, false);
  assert.ok(underResult.errors?.month);

  const overResult = validateBudgetInput({
    month: 13,
    year: 2026,
    amount: 500000,
  });
  assert.equal(overResult.success, false);
  assert.ok(overResult.errors?.month);
});

test('Budget validation: rejects invalid years (outside 2020 - 2099)', () => {
  const oldYear = validateBudgetInput({
    month: 1,
    year: 2019,
    amount: 500000,
  });
  assert.equal(oldYear.success, false);
  assert.ok(oldYear.errors?.year);

  const futureYear = validateBudgetInput({
    month: 1,
    year: 2100,
    amount: 500000,
  });
  assert.equal(futureYear.success, false);
  assert.ok(futureYear.errors?.year);
});

test('cleanRupiahAmount: handles various input formats accurately', () => {
  assert.equal(cleanRupiahAmount('Rp 1.500.000'), 1500000);
  assert.equal(cleanRupiahAmount('1500000'), 1500000);
  assert.equal(cleanRupiahAmount('Rp50.000'), 50000);
  assert.equal(cleanRupiahAmount(''), 0);
  assert.equal(cleanRupiahAmount(null), 0);
  assert.equal(cleanRupiahAmount(750000), 750000);
});
