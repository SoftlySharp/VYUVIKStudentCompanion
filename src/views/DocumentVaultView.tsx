import React, { useState, useRef } from 'react';
import {
  FolderLock,
  Upload,
  Search,
  Filter,
  Trash2,
  FileText,
  ShieldCheck,
  Eye,
  Plus,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { DocumentItem } from '../types/student';
import {
  SharedDocumentProcessor,
  ProcessedDocumentResult,
} from '../components/common/SharedDocumentProcessor';

export const DocumentVaultView: React.FC = () => {
  const { documents, addDocument, deleteDocument } = useStudent();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSharedProcessor, setShowSharedProcessor] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(documents[0] || null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'all', label: 'All Documents' },
    { id: 'identity', label: 'Identity / College ID' },
    { id: 'marksheet', label: 'Mark Sheets / Transcripts' },
    { id: 'resume', label: 'Resume & Portfolios' },
    { id: 'fee_receipt', label: 'Fee Receipts' },
    { id: 'certificate', label: 'Certificates & Awards' },
    { id: 'scholarship', label: 'Scholarship Documents' },
    { id: 'study_material', label: 'Study Notes & Materials' },
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesCat = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.fileType.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUploadNew = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const category = (form.elements.namedItem('category') as HTMLSelectElement).value as any;
    const fileType = (form.elements.namedItem('fileType') as HTMLSelectElement).value;

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title,
      category,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: '450 KB',
      fileType,
      extractedMeta: {
        UploadedBy: 'Student',
        Status: 'Stored Privately in Vault',
      },
      isVerified: false,
    };

    addDocument(newDoc);
    setSelectedDoc(newDoc);
    setShowUploadModal(false);
  };

  const handleVaultDocumentExtracted = (result: ProcessedDocumentResult) => {
    const d = result.data;
    const ext = result.fileName.split('.').pop()?.toUpperCase() || 'PDF';
    const newDoc: DocumentItem = {
      id: result.fileId || `doc-${Date.now()}`,
      title: d.docTitle || d.title || result.fileName,
      category: (d.docType?.toLowerCase().includes('fee') ? 'fee_receipt' :
                 d.docType?.toLowerCase().includes('transcript') ? 'marksheet' :
                 d.docType?.toLowerCase().includes('certificate') ? 'certificate' : 'identity') as any,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: '520 KB',
      fileType: ext,
      extractedMeta: {
        IssuingOrg: d.issuingOrganization || 'Educational Institute',
        Status: 'Verified by Gemini OCR',
        FieldsIdentified: d.identifiedFields ? `${d.identifiedFields.length} attributes extracted` : 'Verified',
      },
      isVerified: true,
    };
    addDocument(newDoc);
    setSelectedDoc(newDoc);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-[#7065E8]" />
            Student Document Vault
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Single repository for college IDs, marksheets, certificates, and fee receipts. Reusable across forms and internship applications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSharedProcessor(true)}
            className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document to Vault</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-[#E8E8EF] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#F0EEFF] text-[#7065E8]'
                  : 'text-[#717487] hover:text-[#171827] hover:bg-[#FAFAFC]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#8C8FA3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or metadata..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs focus:outline-hidden focus:border-[#7065E8] text-[#171827]"
          />
        </div>
      </div>

      {/* Two-Column Workspace: Doc List + Preview / Metadata Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Grid Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredDocs.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl border border-[#E8E8EF] p-8 text-center text-[#717487]">
              No documents found in this category.
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-[#7065E8] ring-2 ring-[#7065E8]/20 shadow-xs'
                      : 'bg-white border-[#E8E8EF] hover:border-[#7065E8]/40 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#7065E8] bg-[#F0EEFF] px-2 py-0.5 rounded-md uppercase">
                        {doc.fileType}
                      </span>
                      <span className="text-[10px] text-[#8C8FA3]">{doc.fileSize}</span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-[#171827] line-clamp-2">
                      {doc.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#717487] mt-3 pt-2 border-t border-[#FAFAFC]">
                    <span className="capitalize">{doc.category.replace('_', ' ')}</span>
                    <span>{doc.uploadDate}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Document Preview and Extracted Attributes */}
        <div className="lg:col-span-5">
          {selectedDoc ? (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-start justify-between border-b border-[#E8E8EF] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-[#7065E8] bg-[#F0EEFF] px-2 py-0.5 rounded-md uppercase">
                    {selectedDoc.category.replace('_', ' ')}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-[#171827] mt-1">
                    {selectedDoc.title}
                  </h3>
                  <p className="text-[11px] text-[#717487]">
                    Uploaded on {selectedDoc.uploadDate} • {selectedDoc.fileSize}
                  </p>
                </div>

                <button
                  onClick={() => {
                    deleteDocument(selectedDoc.id);
                    setSelectedDoc(documents.find((d) => d.id !== selectedDoc.id) || null);
                  }}
                  className="p-1.5 text-[#8C8FA3] hover:text-[#C64545] rounded-lg"
                  title="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Document Simulator / Preview Box */}
              <div className="h-44 bg-[#FAFAFC] rounded-xl border border-dashed border-[#D9D4FA] flex flex-col items-center justify-center p-4 text-center">
                <FileText className="w-10 h-10 text-[#7065E8] mb-2 opacity-80" />
                <p className="text-xs font-bold text-[#171827]">{selectedDoc.title}</p>
                <p className="text-[10px] text-[#717487] mt-0.5">
                  Private AES-encrypted student object storage
                </p>
              </div>

              {/* Extracted Metadata Fields */}
              {selectedDoc.extractedMeta && (
                <div>
                  <h4 className="text-xs font-bold text-[#171827] uppercase tracking-wider mb-2">
                    Extracted Metadata Attributes
                  </h4>
                  <div className="space-y-2 text-xs">
                    {Object.entries(selectedDoc.extractedMeta).map(([k, v]) => (
                      <div
                        key={k}
                        className="p-2.5 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] flex items-center justify-between"
                      >
                        <span className="font-semibold text-[#717487]">{k}:</span>
                        <span className="font-bold text-[#171827]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workflow Reuse Notice */}
              <div className="p-3 bg-[#EAF7F3] rounded-xl border border-[#A7E3D3] text-xs text-[#136652] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#18856B] shrink-0 mt-0.5" />
                <span>
                  <strong>Connected Workflow: </strong> This verified document is accessible in the AI Form Filling Assistant and Internship Application tools without re-uploading.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-8 text-center text-[#717487]">
              Select a document to inspect metadata and access controls.
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
              <h3 className="text-sm font-bold text-[#171827] flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#7065E8]" />
                Upload Document to Private Vault
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#717487] hover:text-[#171827]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadNew} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#171827]">Document Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Semester 5 Exam Admit Card"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#171827]">Category</label>
                  <select
                    name="category"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  >
                    <option value="identity">Identity Document</option>
                    <option value="marksheet">Mark Sheet / Transcript</option>
                    <option value="resume">Resume / CV</option>
                    <option value="fee_receipt">Fee Receipt</option>
                    <option value="certificate">Certificate</option>
                    <option value="scholarship">Scholarship Document</option>
                    <option value="study_material">Study Material</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#171827]">File Format</label>
                  <select
                    name="fileType"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="PNG">PNG Image</option>
                    <option value="JPEG">JPEG Photo</option>
                  </select>
                </div>
              </div>

              <div className="p-4 border-2 border-dashed border-[#D9D4FA] rounded-xl text-center bg-[#FAFAFC]">
                <Upload className="w-6 h-6 text-[#7065E8] mx-auto mb-1" />
                <p className="text-xs font-semibold text-[#171827]">Click to select file</p>
                <p className="text-[10px] text-[#717487]">Max file size: 25MB (Encrypted)</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E8EF]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-1.5 border border-[#E8E8EF] rounded-xl text-[#717487] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl font-semibold shadow-xs"
                >
                  Upload & Secure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shared Document Processing Pipeline Modal */}
      <SharedDocumentProcessor
        isOpen={showSharedProcessor}
        onClose={() => setShowSharedProcessor(false)}
        workflow="vault"
        title="Secure Document Ingestion & Verification"
        subtitle="Upload marksheets, college IDs, certificates, or fee receipts. Processed privately with OCR metadata indexing."
        onExtractionComplete={handleVaultDocumentExtracted}
      />
    </div>
  );
};
