import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Upload,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  ChevronRight,
  FileText,
  Loader2,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { Assignment } from '../types/student';
import {
  SharedDocumentProcessor,
  ProcessedDocumentResult,
} from '../components/common/SharedDocumentProcessor';

export const AssignmentsView: React.FC = () => {
  const { assignments, addAssignment, updateAssignment, deleteAssignment, toggleChecklistItem } = useStudent();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSharedProcessor, setShowSharedProcessor] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(assignments[0] || null);

  // AI Extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [instructionText, setInstructionText] = useState('');
  const [extractedDraft, setExtractedDraft] = useState<Partial<Assignment> | null>(null);

  // Manual form state
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    dueDate: '',
    explicitDeadline: '',
    isDeadlineAmbiguous: false,
    wordLimit: '',
    formatting: '',
    priority: 'high' as 'high' | 'medium' | 'low',
    checklistText: 'Review lecture notes & assignment requirements\nImplement core solution\nFormat and verify submission',
  });

  const filteredAssignments = assignments.filter((a) => {
    const matchesFilter = activeFilter === 'all' || a.status === activeFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRunAIExtraction = async () => {
    if (!instructionText.trim()) return;
    setIsExtracting(true);

    try {
      const res = await fetch('/api/gemini/extract-assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: instructionText }),
      });
      const data = await res.json();

      setExtractedDraft({
        title: data.title || 'Extracted Course Assignment',
        subject: data.subject || 'Computer Science',
        explicitDeadline: data.explicitDeadline || 'End of Week',
        isDeadlineAmbiguous: data.isDeadlineAmbiguous || false,
        wordLimit: data.wordLimit || '1500 words',
        formatting: data.formattingRequirements || 'IEEE Standard PDF',
        rubric: data.rubric || ['Problem Statement (30%)', 'Methodology (40%)', 'Report (30%)'],
        deliverables: data.deliverables || ['Final PDF Report', 'Code Zip'],
        checklist: (data.checklist || ['Review guidelines', 'Draft code', 'Compile report']).map(
          (text: string, idx: number) => ({ id: `c-${idx}`, text, completed: false })
        ),
        priority: data.priority || 'high',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveExtractedAssignment = () => {
    if (!extractedDraft) return;

    const newAssignment: Assignment = {
      id: `asg-${Date.now()}`,
      title: extractedDraft.title || 'Course Assignment',
      subject: extractedDraft.subject || 'General Engineering',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      explicitDeadline: extractedDraft.explicitDeadline || 'Upcoming Friday',
      isDeadlineAmbiguous: extractedDraft.isDeadlineAmbiguous || false,
      wordLimit: extractedDraft.wordLimit,
      formatting: extractedDraft.formatting,
      rubric: extractedDraft.rubric || [],
      deliverables: extractedDraft.deliverables || [],
      checklist: extractedDraft.checklist || [
        { id: '1', text: 'Analyze prompt', completed: false },
        { id: '2', text: 'Draft solution', completed: false },
      ],
      priority: extractedDraft.priority || 'medium',
      progress: 0,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    addAssignment(newAssignment);
    setSelectedAssignment(newAssignment);
    setShowAddModal(false);
    setExtractedDraft(null);
    setInstructionText('');
  };

  const handleDocumentExtracted = (result: ProcessedDocumentResult) => {
    const d = result.data;
    const newAssignment: Assignment = {
      id: `asg-${Date.now()}`,
      title: d.title || 'Extracted Course Assignment',
      subject: d.subject || 'Engineering Subject',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      explicitDeadline: d.explicitDeadline || 'Upcoming Friday',
      isDeadlineAmbiguous: Boolean(d.isDeadlineAmbiguous),
      wordLimit: d.wordLimit,
      formatting: d.formatting,
      rubric: d.rubric || [],
      deliverables: d.deliverables || ['Technical Report PDF'],
      checklist: (d.checklist || ['Review requirements', 'Complete work']).map((item: string, idx: number) => ({
        id: `c-${idx}`,
        text: item,
        completed: false,
      })),
      priority: d.priority || 'medium',
      progress: 0,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    addAssignment(newAssignment);
    setSelectedAssignment(newAssignment);
  };

  const handleManualCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.subject) return;

    const checklistItems = formData.checklistText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((text, idx) => ({ id: `c-${idx}`, text, completed: false }));

    const newAssignment: Assignment = {
      id: `asg-${Date.now()}`,
      title: formData.title,
      subject: formData.subject,
      dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
      explicitDeadline: formData.explicitDeadline || 'Unspecified deadline',
      isDeadlineAmbiguous: formData.isDeadlineAmbiguous,
      wordLimit: formData.wordLimit,
      formatting: formData.formatting,
      rubric: ['Completeness (50%)', 'Technical Correctness (50%)'],
      deliverables: ['PDF Submission'],
      checklist: checklistItems,
      priority: formData.priority,
      progress: 0,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };

    addAssignment(newAssignment);
    setSelectedAssignment(newAssignment);
    setShowAddModal(false);
    setFormData({
      title: '',
      subject: '',
      dueDate: '',
      explicitDeadline: '',
      isDeadlineAmbiguous: false,
      wordLimit: '',
      formatting: '',
      priority: 'high',
      checklistText: 'Review lecture notes\nImplement solution\nFormat and verify submission',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#7065E8]" />
            AI Assignment Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Extract rubrics, detect deadlines, and track subtask checklists without manual typing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSharedProcessor(true)}
            className="bg-[#F0EEFF] hover:bg-[#E2DEFE] text-[#7065E8] border border-[#7065E8]/30 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-2xs transition-all shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Assignment Doc</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-[#E8E8EF] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {(['all', 'pending', 'in-progress', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-colors ${
                activeFilter === filter
                  ? 'bg-[#F0EEFF] text-[#7065E8]'
                  : 'text-[#717487] hover:text-[#171827] hover:bg-[#FAFAFC]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#8C8FA3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments or subjects..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs focus:outline-hidden focus:border-[#7065E8] text-[#171827]"
          />
        </div>
      </div>

      {/* Main Grid: Left List (1 col) + Right Detail Panel (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Assignment Cards List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredAssignments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-8 text-center text-[#717487]">
              <p className="text-sm font-semibold">No assignments found</p>
              <p className="text-xs mt-1">Add an assignment or paste instructions for Gemini to analyze.</p>
            </div>
          ) : (
            filteredAssignments.map((asg) => {
              const isSelected = selectedAssignment?.id === asg.id;
              return (
                <div
                  key={asg.id}
                  onClick={() => setSelectedAssignment(asg)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#7065E8] ring-2 ring-[#7065E8]/20 shadow-xs'
                      : 'bg-white border-[#E8E8EF] hover:border-[#7065E8]/40 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-[#7065E8] bg-[#F0EEFF] px-2 py-0.5 rounded-md">
                      {asg.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        asg.status === 'completed'
                          ? 'bg-[#EAF7F3] text-[#18856B]'
                          : asg.status === 'in-progress'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {asg.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-[#171827] line-clamp-2">
                    {asg.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-[#717487] mt-3">
                    <span className="flex items-center gap-1 text-[#B7791F] font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{asg.explicitDeadline}</span>
                    </span>
                    <span>{asg.checklist.filter((c) => c.completed).length}/{asg.checklist.length} subtasks</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#FAFAFC] h-1.5 rounded-full overflow-hidden mt-2 border border-[#E8E8EF]">
                    <div
                      className="bg-[#7065E8] h-full rounded-full transition-all duration-300"
                      style={{ width: `${asg.progress}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Assignment Workspace Details */}
        <div className="lg:col-span-7">
          {selectedAssignment ? (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-[#E8E8EF] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#7065E8] bg-[#F0EEFF] px-2.5 py-0.5 rounded-md">
                      {selectedAssignment.subject}
                    </span>
                    <span className="text-xs text-[#717487]">• Added {selectedAssignment.createdAt}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#171827]">
                    {selectedAssignment.title}
                  </h2>
                </div>

                <button
                  onClick={() => {
                    deleteAssignment(selectedAssignment.id);
                    setSelectedAssignment(assignments.find((a) => a.id !== selectedAssignment.id) || null);
                  }}
                  className="p-2 text-[#717487] hover:text-[#C64545] rounded-xl hover:bg-rose-50 transition-colors"
                  title="Delete Assignment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Deadline & Spec Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF]">
                  <p className="text-[10px] text-[#717487] font-semibold uppercase">Deadline</p>
                  <p className="text-xs font-bold text-[#171827] mt-0.5">{selectedAssignment.explicitDeadline}</p>
                </div>
                <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF]">
                  <p className="text-[10px] text-[#717487] font-semibold uppercase">Formatting</p>
                  <p className="text-xs font-bold text-[#171827] mt-0.5 truncate">{selectedAssignment.formatting || 'PDF'}</p>
                </div>
                <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF]">
                  <p className="text-[10px] text-[#717487] font-semibold uppercase">Word Limit</p>
                  <p className="text-xs font-bold text-[#171827] mt-0.5">{selectedAssignment.wordLimit || 'Not specified'}</p>
                </div>
              </div>

              {/* Rubric Criteria */}
              {selectedAssignment.rubric && selectedAssignment.rubric.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#171827] uppercase tracking-wider mb-2">
                    Grading Rubric Breakdown
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedAssignment.rubric.map((r, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-[#F0EEFF]/50 border border-[#E0DCFE] text-[#53566B]">
                        • {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Subtask Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#171827] uppercase tracking-wider">
                    Actionable Subtasks ({selectedAssignment.checklist.filter((c) => c.completed).length}/{selectedAssignment.checklist.length})
                  </h4>
                  <span className="text-xs font-bold text-[#7065E8]">
                    {selectedAssignment.progress}% completed
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedAssignment.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(selectedAssignment.id, item.id)}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-colors cursor-pointer ${
                        item.completed
                          ? 'bg-[#FAFAFC] border-[#E8E8EF] opacity-70'
                          : 'bg-white border-[#E8E8EF] hover:border-[#7065E8]'
                      }`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#18856B] shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#8C8FA3] shrink-0" />
                      )}
                      <span
                        className={`text-xs ${
                          item.completed ? 'line-through text-[#717487]' : 'text-[#171827] font-medium'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Responsible Academic Drafting Guidance */}
              <div className="p-3.5 bg-[#FFFBEB] rounded-xl border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#B7791F] mt-0.5" />
                <div>
                  <span className="font-bold">Academic Integrity Standard: </span>
                  VYUVIK provides research frameworks, outlines, and rubric checklists. All code, analyses, and submissions must be authored and understood by the student.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-8 text-center text-[#717487]">
              Select an assignment to view rubrics and checklist.
            </div>
          )}
        </div>
      </div>

      {/* Add / AI Extract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
              <h3 className="text-base font-bold text-[#171827] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7065E8]" />
                Add Assignment via AI Extraction or Manual Form
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#717487] hover:text-[#171827] text-sm"
              >
                ✕
              </button>
            </div>

            {/* AI Extraction Section */}
            <div className="p-4 bg-[#F0EEFF]/50 rounded-xl border border-[#E0DCFE] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#7065E8]">
                  Paste Assignment Prompt or Syllabus Guidelines:
                </span>
                <span className="text-[10px] text-[#717487]">Gemini 4 Argon OCR</span>
              </div>
              <textarea
                value={instructionText}
                onChange={(e) => setInstructionText(e.target.value)}
                rows={4}
                placeholder="Paste teacher instructions, e.g.: 'Submit a 12-page report on Raft distributed consensus with Go implementation by Nov 2. Rubric includes safety, log replication, and partition tolerance.'"
                className="w-full p-3 bg-white border border-[#E8E8EF] rounded-xl text-xs focus:outline-hidden focus:border-[#7065E8] text-[#171827]"
              />
              <button
                type="button"
                onClick={handleRunAIExtraction}
                disabled={isExtracting || !instructionText.trim()}
                className="bg-[#7065E8] hover:bg-[#5E52E2] disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
              >
                {isExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isExtracting ? 'Analyzing with Gemini...' : 'Extract Title, Rubric & Checklist'}</span>
              </button>
            </div>

            {/* Extracted Preview Review */}
            {extractedDraft && (
              <div className="p-4 bg-white border-2 border-[#7065E8] rounded-xl space-y-3">
                <span className="text-xs font-bold text-[#18856B] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> AI Extraction Preview (Review before saving)
                </span>
                <div className="text-xs space-y-1">
                  <p><span className="font-semibold text-[#171827]">Title:</span> {extractedDraft.title}</p>
                  <p><span className="font-semibold text-[#171827]">Subject:</span> {extractedDraft.subject}</p>
                  <p><span className="font-semibold text-[#171827]">Deadline:</span> {extractedDraft.explicitDeadline}</p>
                  <p><span className="font-semibold text-[#171827]">Deliverables:</span> {extractedDraft.deliverables?.join(', ')}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveExtractedAssignment}
                  className="w-full py-2 bg-[#18856B] hover:bg-[#14705a] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Save Extracted Assignment
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="text-center relative py-1">
              <span className="bg-white px-2 text-xs text-[#8C8FA3] font-semibold">Or enter manually</span>
            </div>

            {/* Manual Form */}
            <form onSubmit={handleManualCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#171827]">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Operating Systems"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#171827]">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#171827]">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Banker's Algorithm Deadlock Simulation"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#171827]">Explicit Deadline Text</label>
                  <input
                    type="text"
                    value={formData.explicitDeadline}
                    onChange={(e) => setFormData({ ...formData, explicitDeadline: e.target.value })}
                    placeholder="e.g. Nov 10, 2026 at 5:00 PM"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#171827]">Formatting / Word Limit</label>
                  <input
                    type="text"
                    value={formData.formatting}
                    onChange={(e) => setFormData({ ...formData, formatting: e.target.value })}
                    placeholder="e.g. IEEE PDF, 1500 words"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#171827]">
                  Checklist Subtasks (one per line)
                </label>
                <textarea
                  value={formData.checklistText}
                  onChange={(e) => setFormData({ ...formData, checklistText: e.target.value })}
                  rows={3}
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#E8E8EF] rounded-xl text-xs font-semibold text-[#717487]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl text-xs font-semibold"
                >
                  Save Assignment
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
        workflow="assignment"
        title="Extract Course Assignment / Lab Sheet"
        subtitle="Upload a question paper, syllabus, or lab document. Gemini parses deliverables, rubrics, and explicit deadlines with source citations."
        onExtractionComplete={handleDocumentExtracted}
      />
    </div>
  );
};
