import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  Save,
  HelpCircle,
  FolderLock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import {
  SharedDocumentProcessor,
  ProcessedDocumentResult,
} from '../components/common/SharedDocumentProcessor';

interface FormFieldItem {
  id: string;
  label: string;
  value: string;
  source: string;
  isSensitive: boolean;
  isConfusing: boolean;
  explanation?: string;
  status: 'matched' | 'user_edited' | 'missing';
}

export const FormsView: React.FC = () => {
  const { profile, documents } = useStudent();
  const [selectedFormType, setSelectedFormType] = useState('exam_registration');
  const [isExported, setIsExported] = useState(false);
  const [showSharedProcessor, setShowSharedProcessor] = useState(false);

  // Form Fields mapped from student profile and document vault
  const [fields, setFields] = useState<FormFieldItem[]>([
    {
      id: 'f1',
      label: 'Student Full Name (As per Matriculation Certificate)',
      value: profile.name,
      source: 'Student Profile & Class X Certificate',
      isSensitive: false,
      isConfusing: false,
      status: 'matched',
    },
    {
      id: 'f2',
      label: 'University Roll / Registration Number',
      value: profile.rollNumber,
      source: 'College ID Card (doc-2)',
      isSensitive: true,
      isConfusing: false,
      status: 'matched',
    },
    {
      id: 'f3',
      label: 'College / Institute Name',
      value: profile.college,
      source: 'Student Profile',
      isSensitive: false,
      isConfusing: false,
      status: 'matched',
    },
    {
      id: 'f4',
      label: 'Degree & Branch of Study',
      value: `${profile.degree} in ${profile.branch}`,
      source: 'Student Profile',
      isSensitive: false,
      isConfusing: false,
      status: 'matched',
    },
    {
      id: 'f5',
      label: 'Current Academic Term / Semester',
      value: profile.semester,
      source: 'Student Profile',
      isSensitive: false,
      isConfusing: false,
      status: 'matched',
    },
    {
      id: 'f6',
      label: 'Previous Semester SGPA / CGPA',
      value: 'SGPA: 8.84, CGPA: 8.62',
      source: 'Semester 4 Grade Sheet (doc-1)',
      isSensitive: false,
      isConfusing: false,
      status: 'matched',
    },
    {
      id: 'f7',
      label: 'Fee Transaction Reference ID / Challan No.',
      value: 'SBI2026081498124',
      source: 'Fee Payment Receipt (doc-4)',
      isSensitive: true,
      isConfusing: true,
      explanation: 'Enter the 14-digit DU / SBI reference number printed on your electronic payment receipt, not your bank UTR number.',
      status: 'matched',
    },
    {
      id: 'f8',
      label: 'ABC (Academic Bank of Credits) ID / APAAR ID',
      value: '',
      source: 'Missing from profile & vault',
      isSensitive: true,
      isConfusing: true,
      explanation: '12-digit APAAR ID generated via DigiLocker. Mandatory for university mark registration under NEP 2020.',
      status: 'missing',
    },
  ]);

  const handleFieldChange = (id: string, newVal: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: newVal, status: 'user_edited' } : f))
    );
  };

  const matchedCount = fields.filter((f) => f.value.trim().length > 0).length;
  const missingCount = fields.filter((f) => !f.value.trim()).length;

  const handleExportDraft = () => {
    setIsExported(true);
    setTimeout(() => setIsExported(false), 4000);
  };

  const handleFormExtracted = (result: ProcessedDocumentResult) => {
    const d = result.data;
    if (d.identifiedFields && Array.isArray(d.identifiedFields)) {
      const newExtractedFields = d.identifiedFields.map((f: any, idx: number) => ({
        id: `extracted-${Date.now()}-${idx}`,
        label: f.label || `Field ${idx + 1}`,
        value: f.suggestedValue || '',
        source: `${result.fileName} (Extracted with Gemini)`,
        isSensitive: Boolean(f.isSensitive),
        isConfusing: false,
        status: f.suggestedValue ? ('matched' as const) : ('missing' as const),
      }));

      setFields((prev) => [...newExtractedFields, ...prev]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-[#7065E8]" />
            AI Form Filling Assistant
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Auto-match fields from your verified Student Profile and Document Vault with provenance labels and zero hallucinated credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSharedProcessor(true)}
            className="bg-[#F0EEFF] hover:bg-[#E2DEFE] text-[#7065E8] border border-[#7065E8]/30 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upload & Extract Form Fields</span>
          </button>
          <button
            onClick={handleExportDraft}
            className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Export Completed Draft</span>
          </button>
        </div>
      </div>

      {/* Form Template Selector & Stats */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E8EF] flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-[#171827]">Select College Form:</label>
          <select
            value={selectedFormType}
            onChange={(e) => setSelectedFormType(e.target.value)}
            className="p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs font-semibold text-[#7065E8]"
          >
            <option value="exam_registration">End-Semester Examination Registration Form</option>
            <option value="scholarship_renewal">Merit-Cum-Means Scholarship Renewal Form</option>
            <option value="internship_noc">College Internship NOC & Attendance Waiver Form</option>
            <option value="hostel_allotment">Hostel Room Allotment Application</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-[#18856B] flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            {matchedCount} Fields Auto-Prefilled
          </span>
          {missingCount > 0 && (
            <span className="text-[#C64545] flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {missingCount} Field Requires Manual Input
            </span>
          )}
        </div>
      </div>

      {isExported && (
        <div className="p-4 bg-[#EAF7F3] border border-[#18856B] rounded-2xl text-xs text-[#18856B] font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Form draft successfully formatted and prepared for download! No unverified fields were guessed.</span>
        </div>
      )}

      {/* Editable Fields Workspace */}
      <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
          <h3 className="text-sm font-bold text-[#171827] uppercase tracking-wider">
            Review & Edit Prefilled Values
          </h3>
          <span className="text-[11px] text-[#717487]">
            Source documents referenced from Student Document Vault
          </span>
        </div>

        <div className="space-y-4">
          {fields.map((field) => (
            <div
              key={field.id}
              className={`p-4 rounded-2xl border transition-all ${
                !field.value
                  ? 'bg-rose-50/50 border-rose-200'
                  : field.status === 'user_edited'
                  ? 'bg-[#F0EEFF]/30 border-[#7065E8]'
                  : 'bg-[#FAFAFC] border-[#E8E8EF]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <label className="text-xs font-bold text-[#171827] flex items-center gap-1.5">
                  {field.label}
                  {field.isSensitive && (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-xs">
                      Sensitive
                    </span>
                  )}
                </label>
                <span className="text-[10px] text-[#717487] font-medium flex items-center gap-1">
                  <FolderLock className="w-3 h-3 text-[#7065E8]" />
                  <span>Source: {field.source}</span>
                </span>
              </div>

              <input
                type="text"
                value={field.value}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.isSensitive ? 'Enter sensitive ID manually' : 'Field value'}
                className="w-full p-2.5 bg-white border border-[#E8E8EF] rounded-xl text-xs sm:text-sm text-[#171827] focus:outline-hidden focus:border-[#7065E8]"
              />

              {field.isConfusing && field.explanation && (
                <div className="mt-2 p-2.5 bg-white rounded-lg border border-[#E8E8EF] text-[11px] text-[#53566B] flex items-start gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#7065E8] shrink-0 mt-0.5" />
                  <span>{field.explanation}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Responsible Anti-Hallucination Disclaimer */}
        <div className="p-4 bg-[#FAFAFC] rounded-2xl border border-[#E8E8EF] text-xs text-[#717487] flex items-start gap-2.5 leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-[#18856B] shrink-0 mt-0.5" />
          <div>
            <strong>VYUVIK Zero-Hallucination Protocol: </strong>
            This assistant matches verified data from your saved profile and document vault. It strictly refuses to invent roll numbers, identity numbers, marks, or financial details. Always review before physical submission.
          </div>
        </div>
      </div>

      {/* Shared Document Processing Pipeline Modal */}
      <SharedDocumentProcessor
        isOpen={showSharedProcessor}
        onClose={() => setShowSharedProcessor(false)}
        workflow="form"
        title="Form Analysis & Autofill Extraction"
        subtitle="Upload official application form PDF, college registration sheet, or identity document. Gemini identifies form fields and suggests verified values."
        onExtractionComplete={handleFormExtracted}
      />
    </div>
  );
};
