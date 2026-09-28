import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBudgetPercentage,
  getBudgetStatus,
  getMonthDateRange,
  formatMonthYear,
} from '../src/lib/budget-summary';

test('calculateBudgetPercentage: correctly calculates usage percentage', () => {
  // 40% usage
  assert.equal(calculateBudgetPercentage(400_000, 1_000_000), 40);

  // 85% usage
  assert.equal(calculateBudgetPercentage(850_000, 1_000_000), 85);

  // 100% exact usage
  assert.equal(calculateBudgetPercentage(1_000_000, 1_000_000), 100);

  // 120% overbudget
  assert.equal(calculateBudgetPercentage(1_200_000, 1_000_000), 120);

  // 0 expense
  assert.equal(calculateBudgetPercentage(0, 1_000_000), 0);
});

test('calculateBudgetPercentage: handles zero budget and negative values gracefully (zero division guard)', () => {
  // Zero budget
  assert.equal(calculateBudgetPercentage(100_000, 0), 0);
  assert.equal(calculateBudgetPercentage(0, 0), 0);

  // Negative budget
  assert.equal(calculateBudgetPercentage(100_000, -500_000), 0);

  // Negative expense guard
  assert.equal(calculateBudgetPercentage(-50_000, 1_000_000), 0);
});

test('getBudgetStatus: correctly evaluates threshold statuses', () => {
  // Safe (< 70%)
  assert.equal(getBudgetStatus(0, true), 'safe');
  assert.equal(getBudgetStatus(50, true), 'safe');
  assert.equal(getBudgetStatus(69, true), 'safe');

  // Warning (70% - 99%)
  assert.equal(getBudgetStatus(70, true), 'warning');
  assert.equal(getBudgetStatus(85, true), 'warning');
  assert.equal(getBudgetStatus(99, true), 'warning');

  // Danger / Overbudget (>= 100%)
  assert.equal(getBudgetStatus(100, true), 'danger');
  assert.equal(getBudgetStatus(120, true), 'danger');
  assert.equal(getBudgetStatus(250, true), 'danger');

  // Unbudgeted (hasBudget = false)
  assert.equal(getBudgetStatus(0, false), 'unbudgeted');
  assert.equal(getBudgetStatus(50, false), 'unbudgeted');
});

test('getMonthDateRange: calculates calendar boundaries accurately including leap years', () => {
  // February in Leap Year (2024 -> 29 days)
  const feb2024 = getMonthDateRange(2, 2024);
  assert.equal(feb2024.startOfMonth, '2024-02-01');
  assert.equal(feb2024.endOfMonth, '2024-02-29');

  // February in Non-Leap Year (2026 -> 28 days)
  const feb2026 = getMonthDateRange(2, 2026);
  assert.equal(feb2026.startOfMonth, '2026-02-01');
  assert.equal(feb2026.endOfMonth, '2026-02-28');

  // Month with 31 days (October 2026)
  const oct2026 = getMonthDateRange(10, 2026);
  assert.equal(oct2026.startOfMonth, '2026-10-01');
  assert.equal(oct2026.endOfMonth, '2026-10-31');

  // Month with 30 days (April 2026)
  const apr2026 = getMonthDateRange(4, 2026);
  assert.equal(apr2026.startOfMonth, '2026-04-01');
  assert.equal(apr2026.endOfMonth, '2026-04-30');
});

test('formatMonthYear: produces correct Indonesian month and year strings', () => {
  assert.equal(formatMonthYear(1, 2026), 'Januari 2026');
  assert.equal(formatMonthYear(10, 2026), 'Oktober 2026');
  assert.equal(formatMonthYear(12, 2026), 'Desember 2026');
});
