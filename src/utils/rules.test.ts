import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendance,
  calculateExpenseSummary,
  validateAndAllocateStudySlots,
  checkScheduleConflict,
  calculateTopicFrequencies,
  calculateDailyBurnRate,
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

test('checkScheduleConflict: detects direct overlapping time slots on same day', () => {
  const existing = [
    {
      id: 'block-1',
      title: 'Operating Systems Lab Prep',
      startTime: '6:00 PM',
      endTime: '7:30 PM',
      day: 'Today',
    },
  ];

  // Overlapping test: 7:00 PM to 8:30 PM collides with 6:00 PM - 7:30 PM
  const overlappingBlock = {
    title: 'Computer Networks Quiz',
    startTime: '7:00 PM',
    endTime: '8:30 PM',
    day: 'Today',
  };

  const res = checkScheduleConflict(overlappingBlock, existing);
  assert.equal(res.hasConflict, true);
  assert.equal(res.conflictType, 'overlap');
  assert.equal(res.conflictingBlockTitles.includes('Operating Systems Lab Prep'), true);
  // Suggested time should be after 7:30 PM + 10 min break = 7:40 PM
  assert.equal(res.suggestedStartTime, '7:40 PM');
});

test('checkScheduleConflict: approves non-conflicting time slots', () => {
  const existing = [
    {
      id: 'block-1',
      title: 'Math Revision',
      startTime: '5:00 PM',
      endTime: '6:00 PM',
      day: 'Today',
    },
  ];

  const validBlock = {
    title: 'Algorithms Coding',
    startTime: '6:15 PM',
    endTime: '7:30 PM',
    day: 'Today',
  };

  const res = checkScheduleConflict(validBlock, existing);
  assert.equal(res.hasConflict, false);
  assert.equal(res.conflictType, 'none');
  assert.equal(res.conflicts.length, 0);
});

test('calculateTopicFrequencies: calculates exact counts and marks percentages deterministically', () => {
  const questions = [
    { number: 'Q1', text: 'Explain OSI 7-layer', marks: 10, topic: 'OSI Model' },
    { number: 'Q2', text: 'Explain OSI Transport layer', marks: 5, topic: 'OSI Model' },
    { number: 'Q3', text: 'Dijkstra Routing', marks: 10, topic: 'Shortest Path Routing' },
    { number: 'Q4', text: 'Subnetting IPv4', marks: 5, topic: 'IP Addressing' },
  ];

  // Total marks = 10 + 5 + 10 + 5 = 30
  // OSI Model marks = 15/30 = 50%
  // Routing marks = 10/30 = 33%
  // IP Addressing = 5/30 = 17%
  const frequencies = calculateTopicFrequencies(questions);
  assert.equal(frequencies.length, 3);
  assert.equal(frequencies[0].topic, 'OSI Model');
  assert.equal(frequencies[0].count, 2);
  assert.equal(frequencies[0].totalMarks, 15);
  assert.equal(frequencies[0].weightPercent, 50);
  assert.equal(frequencies[0].frequencyTier, 'High Yield');

  assert.equal(frequencies[1].topic, 'Shortest Path Routing');
  assert.equal(frequencies[1].totalMarks, 10);
  assert.equal(frequencies[1].weightPercent, 33);
  assert.equal(frequencies[1].frequencyTier, 'High Yield');

  assert.equal(frequencies[2].topic, 'IP Addressing');
  assert.equal(frequencies[2].totalMarks, 5);
  assert.equal(frequencies[2].weightPercent, 17);
  assert.equal(frequencies[2].frequencyTier, 'Important');
});

test('calculateDailyBurnRate: computes deterministic spending pacing and safe daily allowances', () => {
  const expenses = [
    { id: '1', title: 'Groceries', amount: 900, category: 'Food', date: '2026-10-10' },
    { id: '2', title: 'Books', amount: 600, category: 'Education', date: '2026-10-12' },
  ];

  // Total spent = 1500, Days elapsed = 10 -> daily avg = 150
  // 30 days total -> 20 days remaining
  // Projected month = 1500 + 150 * 20 = 4500
  // Monthly budget = 5000 -> remaining = 3500 -> safe daily allowance = 3500 / 20 = 175
  const metrics = calculateDailyBurnRate(expenses, 5000, 10, 30);
  assert.equal(metrics.totalSpent, 1500);
  assert.equal(metrics.dailyAverage, 150);
  assert.equal(metrics.projectedMonthTotal, 4500);
  assert.equal(metrics.remainingBudget, 3500);
  assert.equal(metrics.safeDailyAllowance, 175);
  assert.equal(metrics.isPacingOverBudget, false);
});

