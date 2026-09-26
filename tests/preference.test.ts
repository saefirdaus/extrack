import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidFilter,
  VALID_FILTERS,
  DEFAULT_FILTER,
  DEFAULT_THEME,
} from '../src/lib/cookies/preference';

test('isValidFilter validates expected filter values', () => {
  assert.equal(isValidFilter('all'), true);
  assert.equal(isValidFilter('income'), true);
  assert.equal(isValidFilter('expense'), true);

  assert.equal(isValidFilter('invalid'), false);
  assert.equal(isValidFilter(''), false);
  assert.equal(isValidFilter(null), false);
  assert.equal(isValidFilter(123), false);
});

test('preference defaults are properly configured', () => {
  assert.equal(DEFAULT_FILTER, 'all');
  assert.equal(DEFAULT_THEME, 'light');
  assert.deepEqual(VALID_FILTERS, ['all', 'income', 'expense']);
});
