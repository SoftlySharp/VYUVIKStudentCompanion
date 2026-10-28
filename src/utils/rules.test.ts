import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendance,
  calculateExpenseSummary,
  validateAndAllocateStudySlots,
} from './rules';

test('calculateAttendance: calculates percentage, safe status, and bunk margin correctly', () => {
  // Attended 32 out of 40 classes -> 80% (target 75%)
  const res = calculateAttendance(40, 32, 75);
  assert.equal(res.percentage, 80);
  assert.equal(res.status, 'safe');
  assert.equal(res.classesNeededFor75, 0);
  // (32 * 100) / 75 = 42.66 -> max total 42 classes -> 42 - 40 = 2 bunks
  assert.equal(res.safeBunksAvailable, 2);
  assert.match(res.scenarioText, /safely miss 2 classes/);
});

test('calculateAttendance: warns and computes recovery classes when below target', () => {
  // Attended 20 out of 30 classes -> 66.7% (target 75%)
  const res = calculateAttendance(30, 20, 75);
  assert.equal(res.percentage, 66.7);
  assert.equal(res.status, 'warning');
  assert.equal(res.safeBunksAvailable, 0);
  // (75 * 30 - 2000) / (25) = (2250 - 2000) / 25 = 10 classes
  assert.equal(res.classesNeededFor75, 10);
  assert.match(res.scenarioText, /Attend next 10 classes consecutively/);
});

test('calculateExpenseSummary: aggregates totals and budgets', () => {
  const expenses = [
    { id: '1', title: 'College Canteen', amount: 150, category: 'Food', date: '2026-10-25' },
    { id: '2', title: 'Lab Record Print', amount: 80, category: 'Printing', date: '2026-10-26' },
    { id: '3', title: 'Bus Pass', amount: 450, category: 'Transport', date: '2026-10-27' },
  ];
  const budgets = [
    { category: 'Food', monthlyLimit: 2000 },
    { category: 'Printing', monthlyLimit: 200 },
  ];
  const summary = calculateExpenseSummary(expenses, budgets);
  assert.equal(summary.totalSpent, 680);
  assert.equal(summary.categoryTotals['Food'], 150);
  assert.equal(summary.categoryTotals['Printing'], 80);
  assert.equal(summary.categoryTotals['Transport'], 450);
  assert.equal(summary.budgetComparison[0].remaining, 1850);
  assert.equal(summary.budgetComparison[1].remaining, 120);
});

test('validateAndAllocateStudySlots: allocates high priority first and flags overflows', () => {
  const blocks = [
    { id: 'b1', title: 'Low priority reading', subject: 'Math', durationMinutes: 60, priority: 'low' as const },
    { id: 'b2', title: 'High priority assignment', subject: 'OS', durationMinutes: 90, priority: 'high' as const },
  ];
  // 120 minutes available
  const result = validateAndAllocateStudySlots(blocks, 120, 18);
  assert.equal(result.allocatedSlots.length, 1);
  assert.equal(result.allocatedSlots[0].blockId, 'b2');
  assert.equal(result.overflowBlocks.length, 1);
  assert.equal(result.overflowBlocks[0].id, 'b1');
});
