/**
 * Shared document-processing pipeline logic and schema normalizers for VYUVIK
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  normalizedMimeType: string;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'text/plain',
]);

/**
 * Validates uploaded file extension, size and MIME type.
 */
export function validateUploadedFile(file: {
  name: string;
  size: number;
  type: string;
}): FileValidationResult {
  if (!file.name || !file.name.includes('.')) {
    return { isValid: false, error: 'Invalid file name. Extension is required.', normalizedMimeType: '' };
  }

  if (file.size <= 0) {
    return { isValid: false, error: 'File is empty.', normalizedMimeType: '' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds the 25MB limit (provided ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
      normalizedMimeType: '',
    };
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  let mime = file.type || '';

  if (!mime || mime === 'application/octet-stream') {
    if (ext === 'pdf') mime = 'application/pdf';
    else if (ext === 'png') mime = 'image/png';
    else if (ext === 'jpg' || ext === 'jpeg') mime = 'image/jpeg';
    else if (ext === 'txt') mime = 'text/plain';
  }

  if (!ALLOWED_MIME_TYPES.has(mime)) {
    return {
      isValid: false,
      error: `Unsupported file format (${ext || mime}). Please upload a PDF, PNG, JPG, or TXT file.`,
      normalizedMimeType: '',
    };
  }

  return { isValid: true, normalizedMimeType: mime };
}

export interface SourceReference {
  pageNumber?: number;
  sectionHeader?: string;
  sourceQuote: string;
  confidence: number; // 0.0 - 1.0
}

/**
 * Formats citations and provenance guarantees.
 */
export function formatSourceCitations(refs: SourceReference[]): string[] {
  if (!refs || refs.length === 0) return ['Extracted from uploaded document text'];
  return refs.map((ref) => {
    const loc = ref.pageNumber ? `Page ${ref.pageNumber}` : ref.sectionHeader ? `Section: ${ref.sectionHeader}` : 'Document';
    const conf = Math.round((ref.confidence || 0.9) * 100);
    return `${loc}: "${ref.sourceQuote.slice(0, 80)}..." (Confidence: ${conf}%)`;
  });
}

/**
 * Normalizes and guards AI extraction results against nulls or invalid schemas
 */
export function normalizeExtractionResult(
  workflow: 'assignment' | 'notice' | 'paper' | 'receipt' | 'form' | 'vault',
  raw: any
) {
  const data = raw || {};

  switch (workflow) {
    case 'assignment':
      return {
        title: String(data.title || 'Course Assignment'),
        subject: String(data.subject || 'Engineering Subject'),
        explicitDeadline: String(data.explicitDeadline || 'End of term'),
        isDeadlineAmbiguous: Boolean(data.isDeadlineAmbiguous),
        wordLimit: data.wordLimit ? String(data.wordLimit) : 'N/A',
        formatting: String(data.formatting || 'Standard PDF format'),
        rubric: Array.isArray(data.rubric) ? data.rubric.map(String) : ['Technical completeness (100%)'],
        deliverables: Array.isArray(data.deliverables) ? data.deliverables.map(String) : ['Report PDF'],
        checklist: Array.isArray(data.checklist) ? data.checklist.map(String) : ['Review prompt', 'Complete subtasks'],
        priority: ['high', 'medium', 'low'].includes(data.priority) ? data.priority : 'medium',
        sourceReferences: Array.isArray(data.sourceReferences) ? data.sourceReferences : [],
      };

    case 'notice':
      return {
        title: String(data.title || 'University Circular'),
        issuingAuthority: String(data.issuingAuthority || 'College Administration'),
        publicationDate: String(data.publicationDate || new Date().toISOString().split('T')[0]),
        deadline: data.deadline ? String(data.deadline) : null,
        isDeadlineAmbiguous: Boolean(data.isDeadlineAmbiguous),
        eligibleStudents: String(data.eligibleStudents || 'Enrolled students'),
        fees: data.fees ? String(data.fees) : null,
        requiredDocuments: Array.isArray(data.requiredDocuments) ? data.requiredDocuments.map(String) : [],
        summary: String(data.summary || 'Official notification from university administration.'),
        actionRequired: String(data.actionRequired || 'Check circular instructions.'),
        checklist: Array.isArray(data.checklist) ? data.checklist.map(String) : ['Review details'],
        missingInfoWarnings: Array.isArray(data.missingInfoWarnings) ? data.missingInfoWarnings.map(String) : [],
        sourceReferences: Array.isArray(data.sourceReferences) ? data.sourceReferences : [],
      };

    case 'receipt':
      return {
        merchant: String(data.merchant || 'Campus Vendor'),
        amount: Math.max(0, Number(data.amount) || 0),
        currency: String(data.currency || 'INR'),
        date: String(data.date || new Date().toISOString().split('T')[0]),
        category: String(data.category || 'Printing'),
        detectedItems: Array.isArray(data.detectedItems) ? data.detectedItems.map(String) : ['Store items'],
        confidence: Number(data.confidence) || 0.9,
      };

    default:
      return data;
  }
}
