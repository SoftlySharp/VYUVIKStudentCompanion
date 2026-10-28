import React, { useState } from 'react';
import {
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Percent,
  TrendingUp,
  Info,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { calculateAttendance } from '../utils/rules';
import { AttendanceSubject } from '../types/student';

export const AttendanceView: React.FC = () => {
  const { attendanceList, updateAttendance, addAttendanceSubject } = useStudent();
  const [showAddModal, setShowAddModal] = useState(false);

  const totalConducted = attendanceList.reduce((acc, s) => acc + s.conducted, 0);
  const totalAttended = attendanceList.reduce((acc, s) => acc + s.attended, 0);
  const overallPercentage =
    totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 1000) / 10 : 100;

  const handleAddSubject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const code = (form.elements.namedItem('code') as HTMLInputElement).value;
    const conducted = Number((form.elements.namedItem('conducted') as HTMLInputElement).value) || 0;
    const attended = Number((form.elements.namedItem('attended') as HTMLInputElement).value) || 0;

    const newSubj: AttendanceSubject = {
      id: `att-${Date.now()}`,
      name,
      code: code || 'SUBJ101',
      conducted,
      attended,
      targetPercent: 75,
    };

    addAttendanceSubject(newSubj);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#7065E8]" />
            Attendance Tracker & Policy Scenarios
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Deterministic arithmetic with 75% target threshold scenarios and exam hall ticket eligibility analysis.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Overall Metric Card */}
      <div className="bg-gradient-to-r from-[#7065E8] to-[#5549CA] text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">
            Aggregate Semester Attendance
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold">{overallPercentage}%</span>
            <span className="text-xs text-white/90">
              ({totalAttended} attended / {totalConducted} conducted)
            </span>
          </div>
          <p className="text-xs text-white/80 mt-1">
            Required university exam criterion: 75.0% minimum across all enrolled subjects.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 text-xs">
          <p className="font-semibold text-white/90">Eligibility Status:</p>
          <p className="font-bold text-sm text-[#86EFAC] mt-0.5">
            {overallPercentage >= 75 ? '✓ Safe for End-Semester Examinations' : '⚠️ At Risk of Exam Detention'}
          </p>
        </div>
      </div>

      {/* Subject Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {attendanceList.map((subj) => {
          const stats = calculateAttendance(subj.conducted, subj.attended, subj.targetPercent);
          return (
            <div
              key={subj.id}
              className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-4 hover:border-[#7065E8]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-[#7065E8] bg-[#F0EEFF] px-2 py-0.5 rounded-md">
                    {subj.code}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                      stats.status === 'safe'
                        ? 'bg-[#EAF7F3] text-[#18856B]'
                        : 'bg-[#FDF2F2] text-[#C64545]'
                    }`}
                  >
                    {stats.percentage}%
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#171827]">{subj.name}</h3>

                {/* Progress bar */}
                <div className="w-full bg-[#E8E8EF] h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      stats.status === 'safe' ? 'bg-[#18856B]' : 'bg-[#C64545]'
                    }`}
                    style={{ width: `${Math.min(100, stats.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#717487] mt-2">
                  <span>Attended: {subj.attended}</span>
                  <span>Conducted: {subj.conducted}</span>
                </div>
              </div>

              {/* Scenario Calculation */}
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  stats.status === 'safe'
                    ? 'bg-[#EAF7F3]/60 border-[#A7E3D3] text-[#136652]'
                    : 'bg-[#FDF2F2] border-[#F8B4B4] text-[#8E1C1C]'
                }`}
              >
                <div className="flex items-center gap-1 font-bold mb-0.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>Scenario Analysis:</span>
                </div>
                <p>{stats.scenarioText}</p>
              </div>

              {/* Quick Update Stepper */}
              <div className="pt-2 border-t border-[#FAFAFC] flex items-center justify-between text-xs">
                <span className="text-[#717487] font-semibold">Mark today:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateAttendance(subj.id, subj.attended + 1, subj.conducted + 1)}
                    className="px-2.5 py-1 bg-[#EAF7F3] hover:bg-[#d2f1e8] text-[#18856B] rounded-lg font-bold transition-colors"
                  >
                    + Present
                  </button>
                  <button
                    onClick={() => updateAttendance(subj.id, subj.attended, subj.conducted + 1)}
                    className="px-2.5 py-1 bg-[#FDF2F2] hover:bg-[#fad8d8] text-[#C64545] rounded-lg font-bold transition-colors"
                  >
                    + Absent
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
              <h3 className="text-sm font-bold text-[#171827]">Add Academic Subject</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#717487]">✕</button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#171827]">Subject Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Compiler Design"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#171827]">Course Code</label>
                <input
                  type="text"
                  name="code"
                  defaultValue="CO311"
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#171827]">Conducted Classes</label>
                  <input
                    type="number"
                    name="conducted"
                    defaultValue="20"
                    min="1"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#171827]">Attended Classes</label>
                  <input
                    type="number"
                    name="attended"
                    defaultValue="17"
                    min="0"
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  />
                </div>
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
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
