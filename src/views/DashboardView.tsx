import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  FileSearch,
  Mic,
  Wallet,
  Briefcase,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { calculateAttendance, calculateExpenseSummary } from '../utils/rules';

interface DashboardViewProps {
  onNavigate: (route: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    profile,
    assignments,
    studyBlocks,
    toggleStudyBlock,
    notices,
    attendanceList,
    expenses,
    documents,
  } = useStudent();

  const [promptInput, setPromptInput] = useState('');

  // Calculate high-level summary
  const pendingAssignments = assignments.filter((a) => a.status !== 'completed');
  const criticalAttendance = attendanceList.filter((a) => (a.attended / a.conducted) < 0.75);
  const expenseSummary = calculateExpenseSummary(expenses, [
    { category: 'Food', monthlyLimit: 2500 },
    { category: 'Transport', monthlyLimit: 1500 },
  ]);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    onNavigate(`/assistant?q=${encodeURIComponent(promptInput)}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight">
              {getGreeting()}, {profile.name.split(' ')[0]}
            </h1>
            <span className="text-xs bg-[#F0EEFF] text-[#7065E8] font-bold px-2 py-0.5 rounded-full">
              {profile.semester}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            {profile.college} • {profile.branch}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#717487] bg-white border border-[#E8E8EF] px-3 py-1.5 rounded-xl shadow-2xs">
            📅 {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Prominent Hero AI Command Card */}
      <div className="bg-gradient-to-br from-[#7065E8] to-[#594ECE] rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="text-xs font-semibold tracking-wide uppercase text-white/90">
              VYUVIK AI Intelligence Hub
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-bold tracking-tight mb-2">
            What do you need help with today?
          </h2>

          <form onSubmit={handlePromptSubmit} className="mt-3">
            <div className="flex items-center bg-white rounded-xl p-1.5 shadow-lg border border-white/20 text-[#171827]">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="e.g. Plan my exam study blocks, understand the exam notice, review Raft assignment..."
                className="flex-1 px-3 py-2 text-xs sm:text-sm focus:outline-hidden text-[#171827] placeholder:text-[#8C8FA3]"
              />
              <button
                type="submit"
                className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0"
              >
                <span>Ask AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick Action Chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-4 text-[11px]">
            <span className="text-white/80 font-medium mr-1 hidden sm:inline">Quick shortcuts:</span>
            <button
              onClick={() => onNavigate('/college/notices')}
              className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-xs transition-colors flex items-center gap-1"
            >
              📄 Upload Notice
            </button>
            <button
              onClick={() => onNavigate('/academics/assignments')}
              className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-xs transition-colors flex items-center gap-1"
            >
              ✍️ Add Assignment
            </button>
            <button
              onClick={() => onNavigate('/academics/previous-papers')}
              className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-xs transition-colors flex items-center gap-1"
            >
              📊 Analyze Paper
            </button>
            <button
              onClick={() => onNavigate('/academics/viva')}
              className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-xs transition-colors flex items-center gap-1"
            >
              🎙️ Prepare for Viva
            </button>
            <button
              onClick={() => onNavigate('/college/forms')}
              className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-xs transition-colors flex items-center gap-1"
            >
              📋 Fill Form
            </button>
            <button
              onClick={() => onNavigate('/finance')}
              className="bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-xs transition-colors flex items-center gap-1"
            >
              💸 Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Proactive Priority Intelligence Radar */}
      {(criticalAttendance.length > 0 || pendingAssignments.some((a) => a.priority === 'high')) && (
        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <h3 className="text-xs font-bold text-[#171827] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Proactive Priority Radar (Action Required)
              </h3>
            </div>
            <span className="text-[10px] text-[#717487] font-semibold">Real-time Cross-Module Scan</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {criticalAttendance.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start justify-between gap-3 text-rose-900">
                <div>
                  <span className="font-bold block mb-0.5">Attendance Shortage Alert</span>
                  <p className="text-[11px] text-rose-800">
                    {criticalAttendance[0].name} is at {Math.round((criticalAttendance[0].attended / criticalAttendance[0].conducted) * 100)}% (Target: 75%).
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/attendance')}
                  className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold shrink-0"
                >
                  View Bunk Math
                </button>
              </div>
            )}

            {pendingAssignments.some((a) => a.priority === 'high') && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start justify-between gap-3 text-amber-900">
                <div>
                  <span className="font-bold block mb-0.5">High Urgency Assignment</span>
                  <p className="text-[11px] text-amber-800 truncate max-w-xs">
                    {pendingAssignments.find((a) => a.priority === 'high')?.title}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('/academics/planner')}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold shrink-0"
                >
                  Schedule in Planner
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigate('/academics/assignments')}
          className="bg-white p-4 rounded-2xl border border-[#E8E8EF] hover:border-[#7065E8]/40 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#717487] mb-2">
            <span className="text-xs font-semibold">Pending Tasks</span>
            <BookOpen className="w-4 h-4 text-[#7065E8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#171827]">{pendingAssignments.length}</span>
            <span className="text-[11px] text-[#B7791F] font-semibold">Due this week</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('/attendance')}
          className="bg-white p-4 rounded-2xl border border-[#E8E8EF] hover:border-[#7065E8]/40 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#717487] mb-2">
            <span className="text-xs font-semibold">Attendance Watch</span>
            <Clock className="w-4 h-4 text-[#18856B]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#171827]">
              {attendanceList.length > 0
                ? `${Math.round(
                    (attendanceList.reduce((acc, a) => acc + a.attended, 0) /
                      attendanceList.reduce((acc, a) => acc + a.conducted, 0)) *
                      100
                  )}%`
                : '100%'}
            </span>
            <span
              className={`text-[11px] font-semibold ${
                criticalAttendance.length > 0 ? 'text-[#C64545]' : 'text-[#18856B]'
              }`}
            >
              {criticalAttendance.length > 0 ? `${criticalAttendance.length} below 75%` : 'All safe'}
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('/college/notices')}
          className="bg-white p-4 rounded-2xl border border-[#E8E8EF] hover:border-[#7065E8]/40 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#717487] mb-2">
            <span className="text-xs font-semibold">Active Notices</span>
            <FileText className="w-4 h-4 text-[#7065E8]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#171827]">{notices.length}</span>
            <span className="text-[11px] text-[#7065E8] font-semibold">2 pinned urgent</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('/finance')}
          className="bg-white p-4 rounded-2xl border border-[#E8E8EF] hover:border-[#7065E8]/40 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-[#717487] mb-2">
            <span className="text-xs font-semibold">Oct Expenses</span>
            <Wallet className="w-4 h-4 text-[#B7791F]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#171827]">₹{expenseSummary.totalSpent}</span>
            <span className="text-[11px] text-[#18856B] font-semibold">Under monthly cap</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Today's Study Schedule & Upcoming Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Priorities & Study Blocks */}
          <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#171827] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#7065E8]" />
                  Today's Planned Study Blocks
                </h3>
                <p className="text-xs text-[#717487]">
                  {studyBlocks.filter((b) => b.completed).length} of {studyBlocks.length} completed
                </p>
              </div>
              <button
                onClick={() => onNavigate('/academics/planner')}
                className="text-xs font-semibold text-[#7065E8] hover:underline flex items-center gap-1"
              >
                <span>Edit Planner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {studyBlocks.map((block) => (
                <div
                  key={block.id}
                  onClick={() => toggleStudyBlock(block.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    block.completed
                      ? 'bg-[#FAFAFC] border-[#E8E8EF] opacity-60'
                      : 'bg-white border-[#E8E8EF] hover:border-[#7065E8]/50 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={block.completed}
                      onChange={() => toggleStudyBlock(block.id)}
                      className="w-4 h-4 rounded-md accent-[#7065E8] cursor-pointer"
                    />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          block.completed ? 'line-through text-[#717487]' : 'text-[#171827]'
                        }`}
                      >
                        {block.title}
                      </p>
                      <p className="text-[11px] text-[#717487]">
                        {block.subject} • {block.durationMinutes} mins
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-[#53566B] bg-[#FAFAFC] px-2 py-1 rounded-md border border-[#E8E8EF]">
                      {block.startTime} - {block.endTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments in Progress */}
          <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#171827] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#7065E8]" />
                  Active Assignments & Deadlines
                </h3>
                <p className="text-xs text-[#717487]">Track rubrics, deliverables, and checklists</p>
              </div>
              <button
                onClick={() => onNavigate('/academics/assignments')}
                className="text-xs font-semibold text-[#7065E8] hover:underline flex items-center gap-1"
              >
                <span>View All ({assignments.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  onClick={() => onNavigate('/academics/assignments')}
                  className="p-3.5 rounded-xl border border-[#E8E8EF] hover:border-[#7065E8]/40 hover:shadow-xs transition-all cursor-pointer bg-white"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7065E8] bg-[#F0EEFF] px-2 py-0.5 rounded-md">
                        {asg.subject}
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-[#171827] mt-1">
                        {asg.title}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        asg.priority === 'high'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {asg.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#717487] mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#B7791F]" />
                      <span>{asg.explicitDeadline}</span>
                    </span>
                    <span className="font-semibold text-[#171827]">{asg.progress}% done</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#FAFAFC] h-1.5 rounded-full overflow-hidden mt-2 border border-[#E8E8EF]">
                    <div
                      className="bg-[#7065E8] h-full rounded-full transition-all duration-300"
                      style={{ width: `${asg.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Notices, Attendance Warnings, Documents */}
        <div className="space-y-6">
          {/* Urgent Notices Panel */}
          <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#171827] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#7065E8]" />
                Recent College Notices
              </h3>
              <button
                onClick={() => onNavigate('/college/notices')}
                className="text-xs font-semibold text-[#7065E8] hover:underline"
              >
                All Notices
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 3).map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => onNavigate('/college/notice-intelligence')}
                  className="p-3 rounded-xl border border-[#E8E8EF] hover:border-[#7065E8]/40 hover:bg-[#FAFAFC] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#7065E8] bg-[#F0EEFF] px-1.5 py-0.5 rounded-sm">
                      {notice.category}
                    </span>
                    <span className="text-[10px] text-[#8C8FA3]">{notice.publicationDate}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#171827] line-clamp-2 leading-snug">
                    {notice.title}
                  </h4>
                  <p className="text-[11px] text-[#717487] mt-1 line-clamp-2 leading-relaxed">
                    {notice.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Safety Snapshot */}
          <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#171827] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#18856B]" />
                Subject Attendance
              </h3>
              <button
                onClick={() => onNavigate('/attendance')}
                className="text-xs font-semibold text-[#7065E8] hover:underline"
              >
                Details
              </button>
            </div>

            <div className="space-y-2.5">
              {attendanceList.slice(0, 4).map((att) => {
                const stats = calculateAttendance(att.conducted, att.attended, att.targetPercent);
                return (
                  <div key={att.id} className="p-2.5 rounded-xl border border-[#E8E8EF] bg-[#FAFAFC]">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#171827]">
                      <span className="truncate pr-2">{att.name}</span>
                      <span
                        className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                          stats.status === 'safe'
                            ? 'text-[#18856B] bg-[#EAF7F3]'
                            : 'text-[#C64545] bg-[#FDF2F2]'
                        }`}
                      >
                        {stats.percentage}%
                      </span>
                    </div>
                    <p className="text-[10px] text-[#717487] mt-1">{stats.scenarioText}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Document Vault Access */}
          <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#171827] flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#7065E8]" />
                My Verified Documents
              </h3>
              <button
                onClick={() => onNavigate('/documents')}
                className="text-xs font-semibold text-[#7065E8] hover:underline"
              >
                Vault ({documents.length})
              </button>
            </div>
            <div className="space-y-2">
              {documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onNavigate('/documents')}
                  className="p-2.5 rounded-xl border border-[#E8E8EF] flex items-center justify-between text-xs hover:bg-[#FAFAFC] cursor-pointer"
                >
                  <span className="truncate text-[#171827] font-medium pr-2">{doc.title}</span>
                  <span className="text-[10px] font-semibold text-[#7065E8] bg-[#F0EEFF] px-1.5 py-0.5 rounded-sm shrink-0">
                    {doc.fileType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
