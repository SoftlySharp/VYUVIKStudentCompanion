import React, { useState } from 'react';
import {
  BellRing,
  Pin,
  PinOff,
  Search,
  Filter,
  Plus,
  Trash2,
  CheckCircle,
  ExternalLink,
  Sparkles,
  FileText,
  Calendar,
  Building,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { Notice } from '../types/student';

interface NoticesViewProps {
  onNavigate: (route: string) => void;
}

export const NoticesView: React.FC<NoticesViewProps> = ({ onNavigate }) => {
  const { notices, addNotice, toggleNoticePin, toggleNoticeRead, deleteNotice } = useStudent();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(notices[0] || null);

  const categories = ['All', 'Examinations', 'Internships', 'Scholarships', 'Fees', 'Events', 'General'];

  const filteredNotices = notices.filter((n) => {
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddNotice = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const issuingAuthority = (form.elements.namedItem('authority') as HTMLInputElement).value;
    const category = (form.elements.namedItem('category') as HTMLSelectElement).value as any;
    const summary = (form.elements.namedItem('summary') as HTMLTextAreaElement).value;
    const deadline = (form.elements.namedItem('deadline') as HTMLInputElement).value;

    const newNotice: Notice = {
      id: `not-${Date.now()}`,
      title,
      issuingAuthority: issuingAuthority || 'College Administration',
      publicationDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      deadline: deadline || undefined,
      category,
      summary,
      actionRequired: 'Review conditions and submit required documents before deadline.',
      checklist: ['Review notice details', 'Prepare documents', 'Submit to college office'],
      isPinned: false,
      isRead: false,
      sourceType: 'Uploaded Circular',
    };

    addNotice(newNotice);
    setSelectedNotice(newNotice);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <BellRing className="w-6 h-6 text-[#7065E8]" />
            College Notice Center
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Unified inbox for circulars, exam notifications, fee reminders, and scholarship deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/college/notice-intelligence')}
            className="bg-[#F0EEFF] hover:bg-[#E2DEFD] text-[#7065E8] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Notice Intelligence</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Notice</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-[#E8E8EF] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#F0EEFF] text-[#7065E8]'
                  : 'text-[#717487] hover:text-[#171827] hover:bg-[#FAFAFC]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#8C8FA3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices or circulars..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs focus:outline-hidden focus:border-[#7065E8] text-[#171827]"
          />
        </div>
      </div>

      {/* Two Column Layout: Notice List + Notice Detail Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Notice List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredNotices.map((n) => {
            const isSelected = selectedNotice?.id === n.id;
            return (
              <div
                key={n.id}
                onClick={() => {
                  setSelectedNotice(n);
                  if (!n.isRead) toggleNoticeRead(n.id);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#7065E8] ring-2 ring-[#7065E8]/20 shadow-xs'
                    : 'bg-white border-[#E8E8EF] hover:border-[#7065E8]/40 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#7065E8] bg-[#F0EEFF] px-2 py-0.5 rounded-md">
                      {n.category}
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#7065E8]" title="Unread" />
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNoticePin(n.id);
                    }}
                    className={`p-1 rounded-md hover:bg-gray-100 ${
                      n.isPinned ? 'text-[#7065E8]' : 'text-[#8C8FA3]'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-[#171827] line-clamp-2 leading-snug">
                  {n.title}
                </h3>

                <p className="text-[11px] text-[#717487] line-clamp-2 mt-1 leading-relaxed">
                  {n.summary}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#8C8FA3] mt-3 pt-2 border-t border-[#FAFAFC]">
                  <span>{n.publicationDate}</span>
                  {n.deadline && (
                    <span className="text-[#B7791F] font-semibold">Due: {n.deadline}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Notice Reader Detail */}
        <div className="lg:col-span-7">
          {selectedNotice ? (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-6 shadow-2xs space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-[#E8E8EF] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#7065E8] bg-[#F0EEFF] px-2.5 py-0.5 rounded-md">
                      {selectedNotice.category}
                    </span>
                    <span className="text-xs text-[#717487]">
                      Published: {selectedNotice.publicationDate}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#171827] leading-snug">
                    {selectedNotice.title}
                  </h2>
                  <p className="text-xs text-[#717487] mt-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Issuing Authority: {selectedNotice.issuingAuthority}</span>
                  </p>
                </div>

                <button
                  onClick={() => deleteNotice(selectedNotice.id)}
                  className="p-2 text-[#717487] hover:text-[#C64545] rounded-xl hover:bg-rose-50"
                  title="Archive notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Deadline & Quick intelligence chip */}
              {selectedNotice.deadline && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                  <span className="font-semibold">⚠️ Official Submission Deadline:</span>
                  <span className="font-bold">{selectedNotice.deadline}</span>
                </div>
              )}

              {/* Summary */}
              <div>
                <h4 className="text-xs font-bold text-[#171827] uppercase tracking-wider mb-2">
                  Plain-Language Summary
                </h4>
                <p className="text-xs sm:text-sm text-[#53566B] leading-relaxed bg-[#FAFAFC] p-4 rounded-xl border border-[#E8E8EF]">
                  {selectedNotice.summary}
                </p>
              </div>

              {/* Required Student Actions */}
              <div>
                <h4 className="text-xs font-bold text-[#171827] uppercase tracking-wider mb-2">
                  What You Must Do Next
                </h4>
                <div className="p-4 bg-[#F0EEFF]/60 rounded-xl border border-[#D9D4FA] text-xs text-[#171827] font-medium leading-relaxed">
                  {selectedNotice.actionRequired}
                </div>
              </div>

              {/* Checklist */}
              {selectedNotice.checklist && selectedNotice.checklist.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#171827] uppercase tracking-wider mb-2">
                    Action Checklist
                  </h4>
                  <div className="space-y-2">
                    {selectedNotice.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-[#53566B]">
                        <CheckCircle className="w-4 h-4 text-[#18856B]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deep Analysis CTA */}
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/college/notice-intelligence')}
                  className="w-full py-2.5 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Deep Analyze with Notice Intelligence & Create Task</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-8 text-center text-[#717487]">
              Select a notice to view details.
            </div>
          )}
        </div>
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
              <h3 className="text-sm font-bold text-[#171827]">Add / Upload College Notice</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#717487] hover:text-[#171827]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNotice} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#171827]">Notice Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. End Semester Practical Examination Dates"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#171827]">Issuing Authority</label>
                  <input
                    type="text"
                    name="authority"
                    defaultValue="Dean Academic Affairs"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#171827]">Category</label>
                  <select
                    name="category"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  >
                    <option value="Examinations">Examinations</option>
                    <option value="Internships">Internships</option>
                    <option value="Scholarships">Scholarships</option>
                    <option value="Fees">Fees</option>
                    <option value="Events">Events</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#171827]">Deadline (if applicable)</label>
                <input
                  type="text"
                  name="deadline"
                  placeholder="e.g. 15 Nov 2026, 5:00 PM"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#171827]">Summary / Body Content *</label>
                <textarea
                  name="summary"
                  required
                  rows={3}
                  placeholder="Paste or summarize notice text..."
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
                  Save Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
