import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Calendar,
  Building,
  FileText,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { Assignment } from '../types/student';
import {
  SharedDocumentProcessor,
  ProcessedDocumentResult,
} from '../components/common/SharedDocumentProcessor';

interface NoticeIntelligenceViewProps {
  onNavigate: (route: string) => void;
}

export const NoticeIntelligenceView: React.FC<NoticeIntelligenceViewProps> = ({ onNavigate }) => {
  const { addAssignment } = useStudent();
  const [showSharedProcessor, setShowSharedProcessor] = useState(false);
  const [sourceReferences, setSourceReferences] = useState<any[]>([]);
  const [inputText, setInputText] = useState(
    `OFFICIAL CIRCULAR — DELHI TECHNOLOGICAL UNIVERSITY
Ref: DTU/Exam/Odd/2026/892
Dated: 26th October 2026

Sub: Submission of Examination Forms & Regular End-Semester Fees for Odd Semester 2026-27

1. All registered students of B.Tech 3rd, 5th, and 7th Semester are hereby informed that the portal for examination registration is active.
2. The regular examination fee of ₹1,800/- must be paid via the SBI Collect portal.
3. The deadline for receipt of fee payment and submission of printed acknowledgment form to the Academic Window is 08th November 2026 up to 5:00 PM. Late fees of ₹500/- per week will apply thereafter.
4. Candidates must attach:
   a) Semester Fee Receipt
   b) College ID Card Xerox
   c) Hall Ticket Application Form
5. Minimum 75% attendance is mandatory. Students with attendance shortage must meet respective course coordinators before 04th November 2026.`
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>({
    title: 'Submission of Examination Forms & Regular End-Semester Fees',
    issuingAuthority: 'Delhi Technological University (Office of COE)',
    publicationDate: '26 Oct 2026',
    deadline: '08 Nov 2026, 5:00 PM',
    isDeadlineAmbiguous: false,
    eligibleStudents: 'B.Tech 3rd, 5th, and 7th Semester students',
    fees: '₹ 1,800 Regular Exam Fee (+₹500/week late fine)',
    requiredDocuments: [
      'Semester Fee Receipt',
      'College ID Card Xerox',
      'Hall Ticket Application Form',
    ],
    summary:
      'The university has activated the examination registration portal. Students must pay ₹1,800 regular exam fee on SBI Collect and submit the physical hard copy acknowledgment to the Academic Window before 08 Nov 2026 (5 PM). A minimum 75% attendance criterion is strictly enforced.',
    actionRequired:
      'Pay ₹1,800 exam fee online, print acknowledgment receipt, gather ID card copy, and submit to the Academic Window before November 8.',
    checklist: [
      'Verify course attendance > 75%',
      'Pay ₹1,800 on SBI Collect portal',
      'Download & print fee transaction receipt',
      'Attach College ID Card photocopy',
      'Submit hard copy to Academic Window before Nov 8, 5:00 PM',
    ],
    missingInfoWarnings: [
      'Specific course code elective list for 5th semester open electives is not detailed in this circular.',
    ],
  });

  const [addedTaskSuccess, setAddedTaskSuccess] = useState(false);

  const handleRunIntelligence = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setAddedTaskSuccess(false);

    try {
      const res = await fetch('/api/gemini/notice-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeText: inputText }),
      });
      const data = await res.json();
      setExtractedData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvertToChecklistTask = () => {
    if (!extractedData) return;

    const newTask: Assignment = {
      id: `task-notice-${Date.now()}`,
      title: extractedData.title || 'Notice Action Item',
      subject: 'College Admin / Examination',
      dueDate: '2026-11-08',
      explicitDeadline: extractedData.deadline || '08 Nov 2026, 5:00 PM',
      isDeadlineAmbiguous: extractedData.isDeadlineAmbiguous || false,
      wordLimit: 'N/A',
      formatting: 'Document submission',
      rubric: ['Official college requirement'],
      deliverables: extractedData.requiredDocuments || ['Fee Receipt', 'ID Card Copy'],
      checklist: (extractedData.checklist || ['Submit form']).map((text: string, i: number) => ({
        id: `nc-${i}`,
        text,
        completed: false,
      })),
      priority: 'high',
      progress: 0,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    addAssignment(newTask);
    setAddedTaskSuccess(true);
  };

  const handleNoticeExtracted = (result: ProcessedDocumentResult) => {
    const d = result.data;
    setExtractedData(d);
    setSourceReferences(result.sourceReferences || d.sourceReferences || []);
    if (d.summary) {
      setInputText(`[Processed ${result.fileName}]\n\n${d.summary}\n\nKey instructions:\n${d.actionRequired || ''}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#7065E8]" />
            College Notice Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            AI breakdown converting complicated university circulars into plain English, actionable checklists, and verified deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowSharedProcessor(true)}
          className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>Upload Circular / Notice PDF</span>
        </button>
      </div>

      {/* Input Circular Box */}
      <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#171827] uppercase tracking-wider">
            Notice Text / Circular Scanner
          </span>
          <span className="text-[11px] text-[#7065E8] font-semibold">Gemini 4 Argon Extraction</span>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={5}
          placeholder="Paste full text of college notice or WhatsApp circular..."
          className="w-full p-3 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs text-[#171827] leading-relaxed focus:outline-hidden focus:border-[#7065E8]"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[#717487]">
            Dates normalized to student timezone (Asia/Kolkata IST)
          </span>
          <button
            onClick={handleRunIntelligence}
            disabled={isProcessing || !inputText.trim()}
            className="bg-[#7065E8] hover:bg-[#5E52E2] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isProcessing ? 'Extracting Intelligence...' : 'Extract Intelligence & Actions'}</span>
          </button>
        </div>
      </div>

      {/* Intelligence Results Grid */}
      {extractedData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Summary & What To Do Next */}
          <div className="lg:col-span-7 space-y-5">
            {/* Plain-Language Summary Card */}
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
                <span className="text-xs font-bold text-[#7065E8] uppercase tracking-wider">
                  Plain-Language Summary
                </span>
                <span className="text-xs text-[#717487]">{extractedData.publicationDate}</span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-[#171827]">
                {extractedData.title}
              </h2>

              <p className="text-xs sm:text-sm text-[#53566B] leading-relaxed bg-[#FAFAFC] p-4 rounded-xl border border-[#E8E8EF]">
                {extractedData.summary}
              </p>

              {/* What Should I Do Next Card */}
              <div className="p-4 bg-[#F0EEFF] rounded-xl border border-[#D9D4FA] space-y-2">
                <h3 className="text-xs font-bold text-[#7065E8] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  What Should I Do Next?
                </h3>
                <p className="text-xs sm:text-sm text-[#171827] font-semibold leading-relaxed">
                  {extractedData.actionRequired}
                </p>
              </div>

              {/* Editable Checklist */}
              <div>
                <h4 className="text-xs font-bold text-[#171827] uppercase tracking-wider mb-2">
                  Actionable Checklist
                </h4>
                <div className="space-y-2">
                  {extractedData.checklist?.map((item: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-[#E8E8EF] bg-white flex items-center gap-2.5 text-xs text-[#171827]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#18856B] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add to Tasks CTA */}
              <div className="pt-2">
                {addedTaskSuccess ? (
                  <div className="p-3 bg-[#EAF7F3] border border-[#18856B] rounded-xl text-xs text-[#18856B] font-bold text-center">
                    ✓ Task created and linked to Assignment Manager!
                  </div>
                ) : (
                  <button
                    onClick={handleConvertToChecklistTask}
                    className="w-full py-2.5 bg-[#18856B] hover:bg-[#14705a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add as Verified Task to Assignment Manager</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Metadata, Required Documents, Missing Warnings */}
          <div className="lg:col-span-5 space-y-5">
            {/* Key Facts Snapshot */}
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-[#171827] uppercase tracking-wider">
                Extracted Conditions & Metadata
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF]">
                  <p className="text-[10px] text-[#717487] font-semibold uppercase">Official Deadline</p>
                  <p className="text-xs font-bold text-[#C64545] mt-0.5">{extractedData.deadline || 'Needs confirmation'}</p>
                </div>

                <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF]">
                  <p className="text-[10px] text-[#717487] font-semibold uppercase">Eligible Students</p>
                  <p className="text-xs font-semibold text-[#171827] mt-0.5">{extractedData.eligibleStudents || 'All students'}</p>
                </div>

                <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF]">
                  <p className="text-[10px] text-[#717487] font-semibold uppercase">Applicable Fees</p>
                  <p className="text-xs font-bold text-[#18856B] mt-0.5">{extractedData.fees || 'Nil'}</p>
                </div>
              </div>
            </div>

            {/* Required Documents Checklist */}
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-[#171827] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#7065E8]" />
                Required Documents
              </h3>

              <div className="space-y-2 text-xs">
                {extractedData.requiredDocuments?.map((doc: string, idx: number) => (
                  <div key={idx} className="p-2.5 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] flex items-center justify-between">
                    <span className="font-semibold text-[#171827]">• {doc}</span>
                    <button
                      onClick={() => onNavigate('/documents')}
                      className="text-[10px] font-bold text-[#7065E8] hover:underline"
                    >
                      Attach from Vault
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Info Warning */}
            {extractedData.missingInfoWarnings && extractedData.missingInfoWarnings.length > 0 && (
              <div className="bg-[#FFFBEB] rounded-2xl border border-[#FDE68A] p-4 text-xs text-[#92400E] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
                  <span>Missing Information Notice</span>
                </div>
                {extractedData.missingInfoWarnings.map((warn: string, i: number) => (
                  <p key={i} className="leading-relaxed">{warn}</p>
                ))}
              </div>
            )}

            {/* Source Provenance Citations */}
            {sourceReferences.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E8EF] p-4 text-xs space-y-2">
                <span className="font-bold text-[#171827] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Provenance Citations
                </span>
                <div className="space-y-1">
                  {sourceReferences.map((ref: any, idx: number) => (
                    <div key={idx} className="p-2 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] text-[11px] text-[#717487] font-mono">
                      Page {ref.pageNumber || 1}: "{ref.sourceQuote}" (Confidence: {Math.round((ref.confidence || 0.9) * 100)}%)
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shared Document Processing Pipeline Modal */}
      <SharedDocumentProcessor
        isOpen={showSharedProcessor}
        onClose={() => setShowSharedProcessor(false)}
        workflow="notice"
        title="Analyze College Notice or Circular"
        subtitle="Upload official PDF circular, exam fee notice, or administrative order. Gemini extracts verified dates, eligibility, and action items."
        onExtractionComplete={handleNoticeExtracted}
      />
    </div>
  );
};
