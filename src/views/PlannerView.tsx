import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import {
  validateAndAllocateStudySlots,
  checkScheduleConflict,
  ConflictCheckResult,
} from '../utils/rules';
import { StudyBlock } from '../types/student';

export const PlannerView: React.FC = () => {
  const { studyBlocks, setStudyBlocks, toggleStudyBlock, assignments, profile } = useStudent();
  const [dailyMinutes, setDailyMinutes] = useState(240); // 4 hours study per evening
  const [startHour, setStartHour] = useState(18); // 6:00 PM
  const [selectedDay, setSelectedDay] = useState('Today');
  const [showAutoPlanModal, setShowAutoPlanModal] = useState(false);
  const [showPlanReviewModal, setShowPlanReviewModal] = useState(false);
  const [proposedPlan, setProposedPlan] = useState<StudyBlock[]>([]);
  const [overflowWarning, setOverflowWarning] = useState<string | null>(null);

  // Manual block conflict state
  const [activeConflict, setActiveConflict] = useState<{
    result: ConflictCheckResult;
    pendingBlock: StudyBlock;
  } | null>(null);
  const [conflictReport, setConflictReport] = useState<string | null>(null);

  // Auto-generate plan with review step
  const handlePrepareAutoPlan = () => {
    const inputs = assignments.map((a) => ({
      id: a.id,
      title: `${a.title.slice(0, 35)}... (Module Review)`,
      subject: a.subject,
      durationMinutes: a.priority === 'high' ? 90 : 60,
      priority: a.priority,
      dueDate: a.dueDate,
    }));

    const result = validateAndAllocateStudySlots(inputs, dailyMinutes, startHour);

    const generatedBlocks: StudyBlock[] = result.allocatedSlots.map((slot) => ({
      id: `sb-${Date.now()}-${slot.id}`,
      title: slot.title,
      subject: slot.subject,
      startTime: slot.startTime,
      endTime: slot.endTime,
      durationMinutes: slot.durationMinutes,
      priority: 'high',
      completed: false,
      day: selectedDay,
    }));

    setProposedPlan(generatedBlocks);

    if (result.overflowBlocks.length > 0) {
      setOverflowWarning(
        `Capacity limit reached (${dailyMinutes} mins). ${result.overflowBlocks.length} module task(s) (${result.overflowBlocks
          .map((b) => b.subject)
          .join(', ')}) overflow into tomorrow to maintain healthy cognitive load.`
      );
    } else {
      setOverflowWarning(null);
    }

    setShowAutoPlanModal(false);
    setShowPlanReviewModal(true);
  };

  const handleApprovePlan = () => {
    // Preserve other days' blocks, replace selectedDay's blocks with approved plan
    setStudyBlocks((prev) => [
      ...prev.filter((b) => b.day !== selectedDay),
      ...proposedPlan,
    ]);
    setShowPlanReviewModal(false);
    setConflictReport(overflowWarning);
  };

  const handleAddCustomBlock = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value;
    const subject = (form.elements.namedItem('subject') as HTMLInputElement).value;
    const startTime = (form.elements.namedItem('startTime') as HTMLInputElement).value;
    const endTime = (form.elements.namedItem('endTime') as HTMLInputElement).value;
    const priority = (form.elements.namedItem('priority') as HTMLSelectElement).value as any;

    if (!title || !subject) return;

    const newBlock: StudyBlock = {
      id: `sb-${Date.now()}`,
      title,
      subject,
      startTime,
      endTime,
      durationMinutes: 60,
      priority,
      completed: false,
      day: selectedDay,
    };

    // Check for scheduling conflicts against existing blocks on the same day
    const conflict = checkScheduleConflict(newBlock, studyBlocks);

    if (conflict.hasConflict && conflict.conflictType === 'overlap') {
      setActiveConflict({ result: conflict, pendingBlock: newBlock });
      return;
    }

    setStudyBlocks((prev) => [...prev, newBlock]);
    if (conflict.conflictType === 'fatigue_warning') {
      setConflictReport(conflict.conflicts[0]);
    } else {
      setConflictReport(null);
    }
    form.reset();
  };

  const handleAcceptSuggestedTime = () => {
    if (!activeConflict || !activeConflict.result.suggestedStartTime) return;
    const adjustedBlock: StudyBlock = {
      ...activeConflict.pendingBlock,
      startTime: activeConflict.result.suggestedStartTime,
      endTime: activeConflict.result.suggestedEndTime || activeConflict.pendingBlock.endTime,
    };
    setStudyBlocks((prev) => [...prev, adjustedBlock]);
    setActiveConflict(null);
  };

  const handleForceAddBlock = () => {
    if (!activeConflict) return;
    setStudyBlocks((prev) => [...prev, activeConflict.pendingBlock]);
    setActiveConflict(null);
  };

  const totalMinutesAllocated = studyBlocks.reduce((acc, b) => acc + b.durationMinutes, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#7065E8]" />
            AI Assignment & Exam Planner
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Deterministic conflict engine + Gemini study prioritization ensuring zero impossible schedules.
          </p>
        </div>

        <button
          onClick={() => setShowAutoPlanModal(true)}
          className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Auto-Generate Study Plan</span>
        </button>
      </div>

      {/* Conflict / Capacity Notification */}
      {conflictReport && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Workload Balance Notice: </span>
            {conflictReport}
          </div>
        </div>
      )}

      {/* Daily Controls & Day Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E8EF] flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {['Today', 'Tomorrow', 'Wednesday', 'Thursday', 'Friday', 'Weekend'].map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                selectedDay === day
                  ? 'bg-[#F0EEFF] text-[#7065E8]'
                  : 'text-[#717487] hover:text-[#171827] hover:bg-[#FAFAFC]'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-xs text-[#717487]">
          <span>
            Allocated: <strong className="text-[#171827]">{Math.floor(totalMinutesAllocated / 60)}h {totalMinutesAllocated % 60}m</strong>
          </span>
          <span>
            Daily Target: <strong className="text-[#171827]">{Math.floor(dailyMinutes / 60)}h</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Scheduled Study Blocks + Add Custom Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduled Blocks List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#171827] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7065E8]" />
              Scheduled Time Blocks ({studyBlocks.length})
            </h3>
            <span className="text-xs text-[#717487]">
              {studyBlocks.filter((b) => b.completed).length} of {studyBlocks.length} completed
            </span>
          </div>

          {studyBlocks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-8 text-center text-[#717487]">
              No study blocks scheduled for {selectedDay}. Click "Auto-Generate Study Plan" to populate.
            </div>
          ) : (
            studyBlocks.map((block) => (
              <div
                key={block.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all bg-white ${
                  block.completed
                    ? 'border-[#E8E8EF] bg-[#FAFAFC] opacity-60'
                    : 'border-[#E8E8EF] hover:border-[#7065E8]/40 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={block.completed}
                    onChange={() => toggleStudyBlock(block.id)}
                    className="w-4 h-4 rounded-md accent-[#7065E8] mt-1 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase text-[#7065E8] bg-[#F0EEFF] px-2 py-0.5 rounded-md">
                        {block.subject}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                          block.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {block.priority.toUpperCase()}
                      </span>
                    </div>
                    <h4
                      className={`text-xs sm:text-sm font-semibold ${
                        block.completed ? 'line-through text-[#717487]' : 'text-[#171827]'
                      }`}
                    >
                      {block.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#171827]">
                      {block.startTime} - {block.endTime}
                    </p>
                    <p className="text-[10px] text-[#717487]">{block.durationMinutes} mins</p>
                  </div>
                  <button
                    onClick={() => setStudyBlocks((prev) => prev.filter((b) => b.id !== block.id))}
                    className="p-1.5 text-[#8C8FA3] hover:text-[#C64545] rounded-lg"
                    title="Remove study block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Panel: Add Custom Block & Backlog Recovery */}
        <div className="space-y-6">
          {/* Add Study Block Form */}
          <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs">
            <h3 className="text-xs font-bold text-[#171827] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#7065E8]" />
              Add Custom Study Block
            </h3>
            <form onSubmit={handleAddCustomBlock} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#171827]">Session Goal / Task *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Unit 3 Dijkstra Numerical Practice"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#171827]">Subject Name *</label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="e.g. Computer Networks"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#171827]">Start Time</label>
                  <input
                    type="text"
                    name="startTime"
                    defaultValue="7:00 PM"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#171827]">End Time</label>
                  <input
                    type="text"
                    name="endTime"
                    defaultValue="8:15 PM"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#171827]">Priority</label>
                <select
                  name="priority"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl font-semibold shadow-2xs transition-colors"
              >
                Add Study Block
              </button>
            </form>
          </div>

          {/* Backlog Recovery Suggestions */}
          <div className="bg-[#FAFAFC] rounded-2xl border border-[#E8E8EF] p-4 text-xs text-[#53566B] space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#171827]">
              <ShieldCheck className="w-4 h-4 text-[#18856B]" />
              <span>Backlog Prevention Tip</span>
            </div>
            <p className="leading-relaxed">
              Studying in focused 60-90 minute blocks with 10-minute active recall breaks enhances retention for high-math subjects like Algorithms and Operating Systems.
            </p>
          </div>
        </div>
      </div>

      {/* Auto Plan Modal */}
      {showAutoPlanModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
              <h3 className="text-sm font-bold text-[#171827] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#7065E8]" />
                Auto-Generate Daily Schedule
              </h3>
              <button
                onClick={() => setShowAutoPlanModal(false)}
                className="text-[#717487] hover:text-[#171827]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#171827]">
                  Available Study Duration (Minutes): {dailyMinutes} mins ({Math.floor(dailyMinutes / 60)} hrs)
                </label>
                <input
                  type="range"
                  min="60"
                  max="480"
                  step="30"
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="w-full mt-2 accent-[#7065E8]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#171827]">
                  Evening Study Start Hour: {startHour > 12 ? `${startHour - 12}:00 PM` : `${startHour}:00 AM`}
                </label>
                <input
                  type="range"
                  min="14"
                  max="21"
                  step="1"
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className="w-full mt-2 accent-[#7065E8]"
                />
              </div>

              <p className="text-[#717487] text-[11px] leading-relaxed">
                The engine will prioritize high-urgency assignments due this week ({assignments.length} detected), automatically include mandatory rest buffers, and report any conflicting overflow.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E8EF]">
              <button
                type="button"
                onClick={() => setShowAutoPlanModal(false)}
                className="px-3.5 py-1.5 border border-[#E8E8EF] rounded-xl text-xs font-semibold text-[#717487]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePrepareAutoPlan}
                className="px-4 py-1.5 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Review Proposed Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Review & Approval Modal */}
      {showPlanReviewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#171827] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#18856B]" />
                  Review & Approve Generated Study Schedule
                </h3>
                <p className="text-[11px] text-[#717487]">
                  Verify proposed time allocations for {selectedDay} before committing to your academic schedule.
                </p>
              </div>
              <button
                onClick={() => setShowPlanReviewModal(false)}
                className="text-[#717487] hover:text-[#171827]"
              >
                ✕
              </button>
            </div>

            {overflowWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{overflowWarning}</span>
              </div>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {proposedPlan.map((slot, index) => (
                <div
                  key={slot.id}
                  className="p-3 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#F0EEFF] text-[#7065E8] font-bold text-[10px] flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-[#171827]">{slot.title}</p>
                      <p className="text-[11px] text-[#7065E8] font-semibold">{slot.subject}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-[#171827] block">{slot.startTime} - {slot.endTime}</span>
                      <span className="text-[10px] text-[#717487]">{slot.durationMinutes} mins</span>
                    </div>
                    <button
                      onClick={() => setProposedPlan((prev) => prev.filter((p) => p.id !== slot.id))}
                      className="p-1 text-[#8C8FA3] hover:text-[#C64545] rounded-md"
                      title="Remove slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E8E8EF] text-xs">
              <span className="text-[#717487]">
                Total: <strong className="text-[#171827]">{proposedPlan.reduce((acc, p) => acc + p.durationMinutes, 0)} mins</strong> across {proposedPlan.length} sessions
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanReviewModal(false)}
                  className="px-3 py-1.5 border border-[#E8E8EF] rounded-xl text-[#717487] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprovePlan}
                  className="px-4 py-1.5 bg-[#18856B] hover:bg-[#14705a] text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Commit Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Conflict Resolution Modal */}
      {activeConflict && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rose-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 border-b border-[#E8E8EF] pb-3 text-rose-700">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-[#171827]">Schedule Conflict Detected</h3>
                <p className="text-[11px] text-[#717487]">Overlapping study session on {selectedDay}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-[#53566B]">
                Your new study block <strong>"{activeConflict.pendingBlock.title}"</strong> ({activeConflict.pendingBlock.startTime} - {activeConflict.pendingBlock.endTime}) collides with:
              </p>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1 text-rose-900 font-medium">
                {activeConflict.result.conflicts.map((c, i) => (
                  <p key={i}>• {c}</p>
                ))}
              </div>
              {activeConflict.result.suggestedStartTime && (
                <div className="p-3 bg-[#EAF7F3] border border-[#A7E3D3] rounded-xl text-[#136652]">
                  <span className="font-bold block mb-0.5">Recommended Conflict-Free Slot:</span>
                  <span>{activeConflict.result.suggestedStartTime} to {activeConflict.result.suggestedEndTime} (includes 10m buffer)</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-[#E8E8EF] text-xs">
              <button
                type="button"
                onClick={() => setActiveConflict(null)}
                className="w-full sm:w-auto px-3 py-1.5 border border-[#E8E8EF] rounded-xl text-[#717487] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleForceAddBlock}
                className="w-full sm:w-auto px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl font-semibold"
              >
                Force Overlap
              </button>
              {activeConflict.result.suggestedStartTime && (
                <button
                  type="button"
                  onClick={handleAcceptSuggestedTime}
                  className="w-full sm:w-auto px-4 py-1.5 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl font-semibold shadow-xs"
                >
                  Apply Suggested Time
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
