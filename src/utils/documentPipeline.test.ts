import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateUploadedFile,
  formatSourceCitations,
  normalizeExtractionResult,
} from './documentPipeline';

test('validateUploadedFile: accepts valid PDF and PNG under 25MB', () => {
  const validPdf = validateUploadedFile({ name: 'assignment_prompt.pdf', size: 1024 * 500, type: 'application/pdf' });
  assert.equal(validPdf.isValid, true);
  assert.equal(validPdf.normalizedMimeType, 'application/pdf');

  const validPng = validateUploadedFile({ name: 'canteen_receipt.png', size: 1024 * 300, type: 'image/png' });
  assert.equal(validPng.isValid, true);
  assert.equal(validPng.normalizedMimeType, 'image/png');
});

test('validateUploadedFile: rejects files over 25MB or unsupported extensions', () => {
  const oversized = validateUploadedFile({ name: 'heavy_scan.pdf', size: 30 * 1024 * 1024, type: 'application/pdf' });
  assert.equal(oversized.isValid, false);
  assert.match(oversized.error!, /exceeds the 25MB limit/);

  const exeFile = validateUploadedFile({ name: 'malicious.exe', size: 1024, type: 'application/x-msdownload' });
  assert.equal(exeFile.isValid, false);
  assert.match(exeFile.error!, /Unsupported file format/);
});

test('formatSourceCitations: formats page and section provenance properly', () => {
  const citations = formatSourceCitations([
    { pageNumber: 3, sourceQuote: 'The assignment submission is due Nov 2 on portal', confidence: 0.95 },
  ]);
  assert.equal(citations.length, 1);
  assert.match(citations[0], /Page 3: "The assignment submission/);
  assert.match(citations[0], /Confidence: 95%/);
});

test('normalizeExtractionResult: guards missing fields and normalizes schema', () => {
  const normAsg = normalizeExtractionResult('assignment', {
    title: 'Lab 4 Raft',
    priority: 'invalid_priority',
  });
  assert.equal(normAsg.title, 'Lab 4 Raft');
  assert.equal(normAsg.priority, 'medium'); // defaults to medium
  assert.equal(normAsg.explicitDeadline, 'End of term');
});
