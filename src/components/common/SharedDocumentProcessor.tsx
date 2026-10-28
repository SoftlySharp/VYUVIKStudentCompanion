import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
    CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Layers,
  Calendar,
  Building,
  DollarSign,
  BookOpen,
} from 'lucide-react';
import {
  validateUploadedFile,
  formatSourceCitations,
  normalizeExtractionResult,
  SourceReference,
} from '../../utils/documentPipeline';

export type DocumentWorkflow = 'assignment' | 'notice' | 'paper' | 'receipt' | 'form' | 'vault';

export interface ProcessedDocumentResult {
  fileId: string;
  fileName: string;
  workflow: DocumentWorkflow;
  data: any;
  sourceReferences: SourceReference[];
}

interface SharedDocumentProcessorProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: DocumentWorkflow;
  title?: string;
  subtitle?: string;
  onExtractionComplete: (result: ProcessedDocumentResult) => void;
}

export const SharedDocumentProcessor: React.FC<SharedDocumentProcessorProps> = ({
  isOpen,
  onClose,
  workflow,
  title,
  subtitle,
  onExtractionComplete,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textFallback, setTextFallback] = useState('');
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pipeline processing stages
  const [stage, setStage] = useState<'idle' | 'uploading' | 'extracting' | 'review'>('idle');
  const [processingStatusText, setProcessingStatusText] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [fileId, setFileId] = useState<string>('');
  const [sourceReferences, setSourceReferences] = useState<SourceReference[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const getWorkflowConfig = () => {
    switch (workflow) {
      case 'assignment':
        return {
          defaultTitle: 'Analyze Assignment / Lab Sheet',
          defaultSub: 'Extract explicit deadlines, word limits, rubric breakdown, deliverables, and actionable checklist.',
          badge: 'Academic Assignment Pipeline',
          icon: BookOpen,
        };
      case 'notice':
        return {
          defaultTitle: 'College Notice Intelligence',
          defaultSub: 'Extract issuing authority, dates, fee amounts, eligibility, required documents, and action steps.',
          badge: 'Circular & Notice Intelligence',
          icon: Building,
        };
      case 'receipt':
        return {
          defaultTitle: 'Receipt OCR & Expense Extraction',
          defaultSub: 'Detect vendor, line items, monetary total, tax, and college category for instant budget sync.',
          badge: 'Expense OCR Pipeline',
          icon: DollarSign,
        };
      case 'paper':
        return {
          defaultTitle: 'Previous Year Paper Analyzer',
          defaultSub: 'Extract high-frequency exam questions, marks distribution, topic weighting, and self-test questions.',
          badge: 'Exam Paper Intelligence',
          icon: Layers,
        };
      case 'form':
        return {
          defaultTitle: 'Form Assistant Extraction',
          defaultSub: 'Parse official form requirements, map auto-fill fields from vault, and flag confusing terms.',
          badge: 'Form Autofill Pipeline',
          icon: FileText,
        };
      case 'vault':
      default:
        return {
          defaultTitle: 'Student Document Vault Upload',
          defaultSub: 'Secure private document storage with OCR indexing, metadata tagging, and verification.',
          badge: 'Private Storage Pipeline',
          icon: ShieldCheck,
        };
    }
  };

  const config = getWorkflowConfig();
  const HeaderIcon = config.icon;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const validation = validateUploadedFile(file);
    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Invalid file format.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const validation = validateUploadedFile(file);
    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Invalid file format.');
      return;
    }

    setSelectedFile(file);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // strip data:application/pdf;base64, prefix
        const base64Data = result.split(',')[1] || '';
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleStartProcessing = async () => {
    setErrorMsg(null);

    if (activeTab === 'file' && !selectedFile) {
      setErrorMsg('Please select a document or image to process.');
      return;
    }
    if (activeTab === 'text' && !textFallback.trim()) {
      setErrorMsg('Please paste text instructions or circular contents.');
      return;
    }

    try {
      setStage('uploading');
      setProcessingStatusText('Encrypting and uploading file to private vault storage...');

      let base64 = '';
      let mimeType = 'text/plain';
      let fileName = 'pasted-document.txt';

      if (activeTab === 'file' && selectedFile) {
        base64 = await convertFileToBase64(selectedFile);
        mimeType = selectedFile.type || 'application/pdf';
        fileName = selectedFile.name;
      }

      setStage('extracting');
      setProcessingStatusText('Running OCR & multimodal Gemini structured extraction...');

      const response = await fetch('/api/documents/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: base64,
          fileName,
          mimeType,
          targetWorkflow: workflow,
          rawText: textFallback || (selectedFile ? `File name: ${selectedFile.name}` : ''),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Document extraction failed.');
      }

      const normalized = normalizeExtractionResult(workflow, resData.extractedData);
      setExtractedData(normalized);
      setFileId(resData.fileId || `doc-${Date.now()}`);
      setSourceReferences(resData.sourceReferences || normalized.sourceReferences || []);
      setStage('review');
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setErrorMsg(err.message || 'Failed to process document. Please try again.');
      setStage('idle');
    }
  };

  const handleConfirmAndApply = () => {
    if (!extractedData) return;

    onExtractionComplete({
      fileId,
      fileName: selectedFile ? selectedFile.name : 'Extracted Document',
      workflow,
      data: extractedData,
      sourceReferences,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTextFallback('');
    setExtractedData(null);
    setStage('idle');
    setErrorMsg(null);
    setSourceReferences([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E8E8EF] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E8E8EF] flex items-center justify-between bg-[#FAFAFC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F0EEFF] text-[#7065E8] flex items-center justify-center">
              <HeaderIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#171827]">
                  {title || config.defaultTitle}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F0EEFF] text-[#7065E8]">
                  {config.badge}
                </span>
              </div>
              <p className="text-xs text-[#717487] mt-0.5">
                {subtitle || config.defaultSub}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#717487] hover:text-[#171827] p-1.5 rounded-xl hover:bg-white border border-transparent hover:border-[#E8E8EF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
              <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STAGE 1: UPLOAD / SELECTION */}
          {stage === 'idle' && (
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-[#FAFAFC] p-1 rounded-xl border border-[#E8E8EF] text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'file'
                      ? 'bg-white text-[#171827] shadow-2xs'
                      : 'text-[#717487] hover:text-[#171827]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File (PDF / Image / TXT)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'text'
                      ? 'bg-white text-[#171827] shadow-2xs'
                      : 'text-[#717487] hover:text-[#171827]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Paste Text / Circular</span>
                </button>
              </div>

              {activeTab === 'file' ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E8E8EF] hover:border-[#7065E8] bg-[#FAFAFC] hover:bg-[#F0EEFF]/20 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E8E8EF] group-hover:border-[#7065E8] text-[#7065E8] flex items-center justify-center shadow-2xs transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#171827]">
                      {selectedFile ? selectedFile.name : 'Click to browse or drag & drop'}
                    </p>
                    <p className="text-[11px] text-[#717487] mt-0.5">
                      {selectedFile
                        ? `${(selectedFile.size / 1024).toFixed(1)} KB — Click to change`
                        : 'PDF, PNG, JPG, or TXT up to 25MB'}
                    </p>
                  </div>
                  {selectedFile && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>File validated & ready for private processing</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#171827]">
                    Raw Text, Notice Content, or Syllabus Prompt
                  </label>
                  <textarea
                    rows={6}
                    value={textFallback}
                    onChange={(e) => setTextFallback(e.target.value)}
                    placeholder="Paste full text of circular, assignment requirements, syllabus, or invoice notes here..."
                    className="w-full p-3 bg-[#FAFAFC] border border-[#E8E8EF] rounded-2xl text-xs focus:outline-hidden focus:border-[#7065E8] text-[#171827] resize-none font-mono"
                  />
                </div>
              )}

              {/* Security & Pipeline Callout */}
              <div className="p-3 bg-[#FAFAFC] border border-[#E8E8EF] rounded-2xl flex items-center justify-between text-xs text-[#717487]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#7065E8]" />
                  <span>Stored securely in local private vault with OCR provenance</span>
                </div>
                <span className="text-[10px] font-bold text-[#7065E8] bg-[#F0EEFF] px-2 py-0.5 rounded-md">
                  Gemini 4 Argon
                </span>
              </div>
            </div>
          )}

          {/* STAGE 2: PROCESSING PROGRESS */}
          {(stage === 'uploading' || stage === 'extracting') && (
            <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-[#F0EEFF] text-[#7065E8] flex items-center justify-center animate-pulse">
                  <Layers className="w-8 h-8" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#E8E8EF] flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 text-[#7065E8] animate-spin" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#171827]">
                  {stage === 'uploading' ? 'Vault Storage Ingestion' : 'Document Processing & OCR Extraction'}
                </h4>
                <p className="text-xs text-[#717487] mt-1 max-w-sm">
                  {processingStatusText}
                </p>
              </div>
              <div className="w-48 h-1.5 bg-[#E8E8EF] rounded-full overflow-hidden">
                <div
                  className={`h-full bg-[#7065E8] transition-all duration-500 rounded-full ${
                    stage === 'uploading' ? 'w-1/3' : 'w-4/5'
                  }`}
                />
              </div>
            </div>
          )}

          {/* STAGE 3: REVIEW FORM & CITATIONS */}
          {stage === 'review' && extractedData && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-[#171827]">
                    Extraction Complete — Review & Edit
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-[#717487] hover:text-[#171827] flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-upload</span>
                </button>
              </div>

              {/* Dynamic Workflow-Specific Review Fields */}
              <div className="bg-[#FAFAFC] p-4 rounded-2xl border border-[#E8E8EF] space-y-3 text-xs">
                {workflow === 'assignment' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">Title</label>
                        <input
                          type="text"
                          value={extractedData.title || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                          className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">Subject</label>
                        <input
                          type="text"
                          value={extractedData.subject || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, subject: e.target.value })}
                          className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">Explicit Deadline</label>
                        <input
                          type="text"
                          value={extractedData.explicitDeadline || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, explicitDeadline: e.target.value })}
                          className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">Word Limit / Length</label>
                        <input
                          type="text"
                          value={extractedData.wordLimit || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, wordLimit: e.target.value })}
                          className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                        />
                      </div>
                    </div>
                    {extractedData.checklist && (
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">
                          Generated Checklist ({extractedData.checklist.length} items)
                        </label>
                        <div className="space-y-1 bg-white p-2.5 rounded-xl border border-[#E8E8EF]">
                          {extractedData.checklist.map((item: string, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-[#171827]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#7065E8]" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {workflow === 'notice' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">Notice Title</label>
                        <input
                          type="text"
                          value={extractedData.title || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                          className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">Issuing Authority</label>
                        <input
                          type="text"
                          value={extractedData.issuingAuthority || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, issuingAuthority: e.target.value })}
                          className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">Deadline</label>
                        <input
                          type="text"
                          value={extractedData.deadline || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, deadline: e.target.value })}
                          className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">Fee Amount</label>
                        <input
                          type="text"
                          value={extractedData.fees || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, fees: e.target.value })}
                          className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold text-[#171827] block mb-1">Summary</label>
                      <textarea
                        rows={2}
                        value={extractedData.summary || ''}
                        onChange={(e) => setExtractedData({ ...extractedData, summary: e.target.value })}
                        className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827] resize-none"
                      />
                    </div>
                  </>
                )}

                {workflow === 'receipt' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">Merchant / Vendor</label>
                        <input
                          type="text"
                          value={extractedData.merchant || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, merchant: e.target.value })}
                          className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">Amount (₹)</label>
                        <input
                          type="number"
                          value={extractedData.amount || 0}
                          onChange={(e) => setExtractedData({ ...extractedData, amount: Number(e.target.value) })}
                          className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">Category</label>
                        <input
                          type="text"
                          value={extractedData.category || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                          className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-[#171827] block mb-1">Date</label>
                        <input
                          type="date"
                          value={extractedData.date || ''}
                          onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                          className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                        />
                      </div>
                    </div>
                  </>
                )}

                {(workflow === 'paper' || workflow === 'vault' || workflow === 'form') && (
                  <div>
                    <label className="font-semibold text-[#171827] block mb-1">
                      {extractedData.paperTitle ? 'Paper Title' : 'Document Title'}
                    </label>
                    <input
                      type="text"
                      value={extractedData.paperTitle || extractedData.docTitle || extractedData.title || ''}
                      onChange={(e) =>
                        setExtractedData({
                          ...extractedData,
                          paperTitle: e.target.value,
                          docTitle: e.target.value,
                          title: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                    />
                  </div>
                )}
              </div>

              {/* Source References & Provenance */}
              <div className="p-3 bg-white rounded-2xl border border-[#E8E8EF] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#171827] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7065E8]" />
                    Source References & Citations
                  </span>
                  <span className="text-[10px] text-[#717487]">Indexed in Vault ({fileId})</span>
                </div>
                <div className="space-y-1">
                  {formatSourceCitations(sourceReferences).map((citation, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] text-[#717487] bg-[#FAFAFC] p-2 rounded-xl border border-[#E8E8EF] font-mono leading-relaxed"
                    >
                      {citation}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E8E8EF] flex items-center justify-between bg-[#FAFAFC]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#E8E8EF] text-xs font-semibold text-[#717487] hover:text-[#171827] hover:bg-white transition-colors"
          >
            Cancel
          </button>

          {stage === 'idle' ? (
            <button
              type="button"
              onClick={handleStartProcessing}
              className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Process & Extract Document</span>
            </button>
          ) : stage === 'review' ? (
            <button
              type="button"
              onClick={handleConfirmAndApply}
              className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <span>Apply to {config.badge.split(' ')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              disabled
              className="bg-[#E8E8EF] text-[#8C8FA3] px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-not-allowed"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Processing...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
