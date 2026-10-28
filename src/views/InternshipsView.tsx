import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  ArrowRight,
  FileText,
  Building,
  MapPin,
  Calendar,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { InternshipOpp } from '../types/student';

interface InternshipsViewProps {
  onNavigate: (route: string) => void;
}

export const InternshipsView: React.FC<InternshipsViewProps> = ({ onNavigate }) => {
  const { internships, addInternship, updateInternshipStatus, deleteInternship } = useStudent();
  const [selectedOpp, setSelectedOpp] = useState<InternshipOpp | null>(internships[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMatcherModal, setShowMatcherModal] = useState(false);

  // Matcher state
  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);

  // Review & Approval draft state
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [draftType, setDraftType] = useState<'cold_email' | 'cover_letter'>('cold_email');
  const [draftContent, setDraftContent] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);

  const statuses: InternshipOpp['status'][] = [
    'interested',
    'preparing',
    'applied',
    'interview',
    'offered',
    'rejected',
  ];

  const handleRunMatch = async () => {
    if (!jobDescriptionInput.trim()) return;
    setIsMatching(true);

    try {
      const res = await fetch('/api/gemini/internship-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedOpp?.role || 'Software Engineering Intern',
          company: selectedOpp?.company || 'Razorpay',
          resumeText: 'Student B.Tech CSE, Experience with React, TypeScript, Node.js, Go, PostgreSQL, Raft consensus algorithm project, Algorithms.',
          jobDescription: jobDescriptionInput,
        }),
      });
      const data = await res.json();
      setMatchResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMatching(false);
    }
  };

  const handleOpenDraftForApproval = (type: 'cold_email' | 'cover_letter') => {
    setDraftType(type);
    if (type === 'cold_email') {
      setDraftContent(
        matchResult?.tailoredColdEmail ||
          `Subject: Application: ${selectedOpp?.role || 'SDE Intern'} - Khushi (SAREC Mirzapur CSE)\n\nHi ${selectedOpp?.company || 'Hiring'} Team,\n\nI am writing to express my strong interest in the ${selectedOpp?.role || 'Software Engineering Intern'} role at ${selectedOpp?.company || 'your team'}. As a pre-final year Computer Science student at Samrat Ashok Rajkiya Engineering College Mirzapur, I specialize in full-stack web architectures (React 19, TypeScript, Node.js) and distributed backend systems (Raft protocol in Go).\n\nRecently, I architected VYUVIK, an intelligent academic system handling complex state synchronization and document intelligence pipelines. I would love to bring this level of rigour to your engineering team.\n\nMy resume and GitHub are attached. Could we schedule a 10-minute introductory call this week?\n\nBest regards,\nKhushi\n+91 98765 43210 | khushi@sarecmirzapur.ac.in`
      );
    } else {
      setDraftContent(
        matchResult?.customCoverLetter ||
          `Dear Hiring Team at ${selectedOpp?.company || 'the organization'},\n\nI am thrilled to apply for the ${selectedOpp?.role || 'Software Development Engineer Intern'} position. With hands-on engineering experience in building full-stack web applications and robust distributed systems, I bring a solid foundation in React, TypeScript, Go, and relational database design.\n\nThank you for considering my candidacy. I look forward to the possibility of discussing how my skills align with your upcoming goals.\n\nSincerely,\nKhushi`
      );
    }
    setShowApprovalModal(true);
  };

  const handleApproveDraft = () => {
    if (!selectedOpp) return;
    // Save draft into selected opportunity notes for permanent persistence
    const updatedNotes = `${selectedOpp.notes || ''}\n\n[Approved ${draftType === 'cold_email' ? 'Cold Outreach Email' : 'Cover Letter'} on ${new Date().toLocaleDateString('en-IN')}]:\n${draftContent}`;
    selectedOpp.notes = updatedNotes;
    setShowApprovalModal(false);
    setApprovalMessage(`Approved & saved ${draftType === 'cold_email' ? 'Cold Email' : 'Cover Letter'} to ${selectedOpp.company} records!`);
    setTimeout(() => setApprovalMessage(null), 3500);
  };

  const handleCreateOpportunity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const company = (form.elements.namedItem('company') as HTMLInputElement).value;
    const role = (form.elements.namedItem('role') as HTMLInputElement).value;
    const location = (form.elements.namedItem('location') as HTMLInputElement).value;
    const stipend = (form.elements.namedItem('stipend') as HTMLInputElement).value;
    const deadline = (form.elements.namedItem('deadline') as HTMLInputElement).value;

    const newOpp: InternshipOpp = {
      id: `int-${Date.now()}`,
      company,
      role,
      location: location || 'Hybrid',
      stipend: stipend || 'Stipend undisclosed',
      deadline: deadline || 'Open',
      status: 'interested',
      matchScore: 85,
      matchingSkills: ['Core Problem Solving', 'Web Development'],
      missingSkills: ['Domain Specific Tooling'],
      notes: 'Added from manual college placement circular.',
    };

    addInternship(newOpp);
    setSelectedOpp(newOpp);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#7065E8]" />
            Internship Application Assistant
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Track applications, compare your resume to real job descriptions, and tailor cover letters with Gemini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/career/resume')}
            className="bg-[#F0EEFF] hover:bg-[#E2DEFD] text-[#7065E8] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Resume Tools</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Opportunity</span>
          </button>
        </div>
      </div>

      {/* Approval Success Banner */}
      {approvalMessage && (
        <div className="p-3.5 bg-[#EAF7F3] border border-[#A7E3D3] rounded-2xl flex items-center justify-between text-xs text-[#136652] shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#18856B]" />
            <span className="font-semibold">{approvalMessage}</span>
          </div>
          <span className="font-bold text-[#18856B]">Dossier Updated</span>
        </div>
      )}

      {/* Two-Column Workspace: Left List + Right JD Matcher & Application Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-5 space-y-3">
          {internships.map((opp) => {
            const isSelected = selectedOpp?.id === opp.id;
            return (
              <div
                key={opp.id}
                onClick={() => setSelectedOpp(opp)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#7065E8] ring-2 ring-[#7065E8]/20 shadow-xs'
                    : 'bg-white border-[#E8E8EF] hover:border-[#7065E8]/40 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#171827]">{opp.role}</h3>
                    <p className="text-xs text-[#7065E8] font-semibold">{opp.company}</p>
                  </div>
                  <span className="text-xs font-bold text-[#18856B] bg-[#EAF7F3] px-2 py-0.5 rounded-md">
                    {opp.matchScore}% Match
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#717487] mt-3 pt-2 border-t border-[#FAFAFC]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#8C8FA3]" />
                    <span>{opp.location}</span>
                  </span>
                  <span className="font-semibold text-[#171827]">{opp.stipend}</span>
                </div>

                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-[#B7791F] font-semibold">Due: {opp.deadline}</span>
                  <span className="text-[10px] uppercase font-bold text-[#717487] bg-[#FAFAFC] px-2 py-0.5 rounded-md border border-[#E8E8EF]">
                    Status: {opp.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Application Details & JD Analyzer */}
        <div className="lg:col-span-7">
          {selectedOpp ? (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 sm:p-6 shadow-2xs space-y-5">
              <div className="flex items-start justify-between border-b border-[#E8E8EF] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#7065E8] bg-[#F0EEFF] px-2 py-0.5 rounded-md">
                      {selectedOpp.company}
                    </span>
                    <span className="text-xs text-[#717487]">• {selectedOpp.location}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#171827]">
                    {selectedOpp.role}
                  </h2>
                  <p className="text-xs text-[#18856B] font-bold mt-0.5">{selectedOpp.stipend}</p>
                </div>

                <button
                  onClick={() => {
                    deleteInternship(selectedOpp.id);
                    setSelectedOpp(internships.find((i) => i.id !== selectedOpp.id) || null);
                  }}
                  className="p-1.5 text-[#8C8FA3] hover:text-[#C64545] rounded-lg"
                  title="Remove opportunity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status Selector Bar */}
              <div>
                <label className="text-[11px] font-bold text-[#171827] uppercase tracking-wider block mb-1.5">
                  Update Application Status
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
                  {statuses.map((st) => (
                    <button
                      key={st}
                      onClick={() => updateInternshipStatus(selectedOpp.id, st)}
                      className={`py-1.5 px-2 rounded-xl font-bold capitalize transition-all border text-[11px] ${
                        selectedOpp.status === st
                          ? 'bg-[#7065E8] text-white border-[#7065E8] shadow-xs'
                          : 'bg-[#FAFAFC] text-[#717487] border-[#E8E8EF] hover:bg-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Description Analyzer Trigger */}
              <div className="p-4 bg-[#F0EEFF]/50 rounded-2xl border border-[#E0DCFE] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#7065E8] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Compare with Job Description (ATS Analysis)
                  </h4>
                  <span className="text-[10px] text-[#717487]">Gemini 3.8 Flash</span>
                </div>

                <textarea
                  value={jobDescriptionInput}
                  onChange={(e) => setJobDescriptionInput(e.target.value)}
                  rows={3}
                  placeholder="Paste Job Description requirements, qualifications, and tech stack here..."
                  className="w-full p-2.5 bg-white border border-[#E8E8EF] rounded-xl text-xs text-[#171827] focus:outline-hidden focus:border-[#7065E8]"
                />

                <button
                  onClick={handleRunMatch}
                  disabled={isMatching || !jobDescriptionInput.trim()}
                  className="bg-[#7065E8] hover:bg-[#5E52E2] disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {isMatching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isMatching ? 'Analyzing Resume vs JD...' : 'Analyze Match & Bullet Improvements'}</span>
                </button>
              </div>

              {/* Analysis Results Display */}
              {matchResult && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#EAF7F3] rounded-xl border border-[#A7E3D3]">
                      <span className="font-bold text-[#18856B] flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Matching Skills
                      </span>
                      <p className="text-[#136652]">{matchResult.matchingSkills?.join(', ')}</p>
                    </div>

                    <div className="p-3 bg-[#FDF2F2] rounded-xl border border-[#F8B4B4]">
                      <span className="font-bold text-[#C64545] flex items-center gap-1 mb-1">
                        <XCircle className="w-3.5 h-3.5" /> Missing / Recommended Skills
                      </span>
                      <p className="text-[#8E1C1C]">{matchResult.missingSkills?.join(', ')}</p>
                    </div>
                  </div>

                  {/* Bullet Point Suggestions */}
                  {matchResult.bulletImprovements && (
                    <div>
                      <h4 className="text-xs font-bold text-[#171827] uppercase tracking-wider mb-2">
                        Suggested Resume Bullet Improvements
                      </h4>
                      <div className="space-y-2">
                        {matchResult.bulletImprovements.map((b: any, i: number) => (
                          <div key={i} className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] text-xs space-y-1">
                            <p className="line-through text-[#717487]">{b.original}</p>
                            <p className="text-[#18856B] font-semibold">➔ {b.improved}</p>
                            <p className="text-[10px] text-[#53566B]">Impact: {b.impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outreach Generators & Approval Actions */}
                  <div className="pt-3 border-t border-[#E8E8EF] space-y-3">
                    <h4 className="text-xs font-bold text-[#171827] uppercase tracking-wider">
                      Tailored Application Materials (with verified student skills)
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button
                        onClick={() => handleOpenDraftForApproval('cold_email')}
                        className="bg-[#FAFAFC] hover:bg-[#F0EEFF] text-[#7065E8] border border-[#E8E8EF] px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Review Tailored Cold Email</span>
                      </button>
                      <button
                        onClick={() => handleOpenDraftForApproval('cover_letter')}
                        className="bg-[#FAFAFC] hover:bg-[#F0EEFF] text-[#7065E8] border border-[#E8E8EF] px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Review Formal Cover Letter</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Notes / Dossier */}
              {selectedOpp.notes && (
                <div className="pt-3 border-t border-[#E8E8EF]">
                  <h4 className="text-xs font-bold text-[#171827] uppercase tracking-wider mb-1.5">
                    Application Dossier & Notes
                  </h4>
                  <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] text-xs text-[#53566B] whitespace-pre-wrap max-h-36 overflow-y-auto">
                    {selectedOpp.notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-8 text-center text-[#717487]">
              Select an internship opportunity to review details or run ATS analysis.
            </div>
          )}
        </div>
      </div>

      {/* Add Opportunity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
              <h3 className="text-sm font-bold text-[#171827]">Add Internship Opportunity</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#717487] hover:text-[#171827]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#171827]">Company Name *</label>
                <input
                  type="text"
                  name="company"
                  required
                  placeholder="e.g. Swiggy"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#171827]">Role Title *</label>
                <input
                  type="text"
                  name="role"
                  required
                  placeholder="e.g. Software Development Engineer Intern"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#171827]">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue="Bengaluru / Remote"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#171827]">Stipend</label>
                  <input
                    type="text"
                    name="stipend"
                    placeholder="e.g. ₹ 40,000 / month"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#171827]">Application Deadline</label>
                <input
                  type="text"
                  name="deadline"
                  placeholder="e.g. 20 Nov 2026"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E8EF]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-[#E8E8EF] rounded-xl text-[#717487] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review & Approval Modal for Application Outreach */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#171827] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#7065E8]" />
                  Review & Approve Tailored {draftType === 'cold_email' ? 'Cold Outreach Email' : 'Cover Letter'}
                </h3>
                <p className="text-[11px] text-[#717487]">
                  Personalized for {selectedOpp?.role} at {selectedOpp?.company}. You can edit directly before saving or copying.
                </p>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-[#717487] hover:text-[#171827]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-[#171827]">
                Editable Content:
              </label>
              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                rows={9}
                className="w-full p-3 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs sm:text-sm text-[#171827] leading-relaxed focus:outline-hidden focus:border-[#7065E8] font-mono"
              />
            </div>

            <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] text-[11px] text-[#53566B]">
              <span className="font-bold text-[#18856B]">Verified Profile Signals: </span>
              SAREC Mirzapur CSE, CGPA 8.62, React 19 / TypeScript, Raft Protocol (Go), VYUVIK OS.
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E8E8EF] text-xs">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(draftContent);
                  setCopiedDraft(true);
                  setTimeout(() => setCopiedDraft(false), 2000);
                }}
                className="px-3 py-1.5 border border-[#E8E8EF] hover:bg-[#FAFAFC] text-[#171827] rounded-xl font-semibold transition-colors"
              >
                {copiedDraft ? 'Copied to Clipboard!' : 'Copy Text'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-3.5 py-1.5 border border-[#E8E8EF] rounded-xl text-[#717487] font-semibold"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleApproveDraft}
                  className="px-4 py-1.5 bg-[#18856B] hover:bg-[#14705a] text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Save to Dossier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
