import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

interface OnboardingViewProps {
  onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const { updateProfile } = useStudent();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: '',
    college: '',
    degree: 'B.Tech',
    branch: 'Computer Science & Engineering',
    semester: 'Semester 5',
    rollNumber: '',
    academicGoals: 'Maintain >8.5 CGPA and crack top product internships',
    preferredStudyHours: '6:00 PM - 10:00 PM',
  });

  const handleNext = () => {
    if (step === 1 && (!form.name || !form.college)) {
      alert('Please enter your name and college');
      return;
    }
    if (step < 2) {
      setStep(step + 1);
    } else {
      updateProfile({
        name: form.name,
        college: form.college,
        degree: form.degree,
        branch: form.branch,
        semester: form.semester,
        rollNumber: form.rollNumber || '2K23/CO/101',
        academicGoals: form.academicGoals,
        preferredStudyHours: form.preferredStudyHours,
        isOnboarded: true,
      });
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] flex flex-col justify-center items-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-[#E8E8EF] shadow-xl p-8 space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#7065E8] text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-[#171827]">Welcome to VYUVIK</h1>
          <p className="text-xs text-[#717487]">Your College Life, Simplified by AI</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-1.5 w-16 rounded-full ${step >= 1 ? 'bg-[#7065E8]' : 'bg-[#E8E8EF]'}`} />
          <div className={`h-1.5 w-16 rounded-full ${step >= 2 ? 'bg-[#7065E8]' : 'bg-[#E8E8EF]'}`} />
        </div>

        {step === 1 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#171827]">Step 1: Your Academic Identity</h2>
            <div>
              <label className="font-semibold text-[#171827]">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#171827]">College / University Name *</label>
              <input
                type="text"
                required
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                placeholder="e.g. Delhi Technological University"
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-[#171827]">Degree</label>
                <input
                  type="text"
                  value={form.degree}
                  onChange={(e) => setForm({ ...form, degree: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#171827]">Semester</label>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 7">Semester 7</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#171827]">Step 2: Study Habits & Goals</h2>
            <div>
              <label className="font-semibold text-[#171827]">Branch / Stream</label>
              <input
                type="text"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#171827]">Preferred Evening Study Window</label>
              <input
                type="text"
                value={form.preferredStudyHours}
                onChange={(e) => setForm({ ...form, preferredStudyHours: e.target.value })}
                placeholder="e.g. 6:00 PM - 10:00 PM"
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#171827]">Semester Goals</label>
              <textarea
                value={form.academicGoals}
                onChange={(e) => setForm({ ...form, academicGoals: e.target.value })}
                rows={2}
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              />
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-semibold text-[#717487] hover:text-[#171827]"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <span>{step === 2 ? 'Launch VYUVIK' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
