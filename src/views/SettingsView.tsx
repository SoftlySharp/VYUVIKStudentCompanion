import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  Sparkles,
  Save,
  CheckCircle2,
  Trash2,
  Key,
  Globe,
  Bell,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, resetToDemoData } = useStudent();
  const [formData, setFormData] = useState({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#7065E8]" />
          Account & Academic Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
          Manage your verified college profile, academic preferences, and privacy controls.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-[#EAF7F3] border border-[#18856B] rounded-2xl text-xs text-[#18856B] font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile and academic preferences successfully saved!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Student Profile Card */}
        <div className="bg-white rounded-2xl border border-[#E8E8EF] p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-[#171827] uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-[#7065E8]" />
            Student Identity & College Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[#171827]">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#171827]">College Email ID</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#171827]">College / University Name *</label>
              <input
                type="text"
                required
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#171827]">University Roll / Registration No. *</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#171827]">Degree Program</label>
              <input
                type="text"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#171827]">Branch / Major</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#171827]">Current Semester</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#171827]">Time Zone</label>
              <input
                type="text"
                value={formData.timeZone}
                onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#171827]">Academic Goals & Placements Focus</label>
            <textarea
              rows={2}
              value={formData.academicGoals}
              onChange={(e) => setFormData({ ...formData, academicGoals: e.target.value })}
              className="w-full mt-1 p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </div>

        {/* AI & Integration Diagnostics */}
        <div className="bg-white rounded-2xl border border-[#E8E8EF] p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-[#171827] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7065E8]" />
            AI Architecture & Server Capabilities
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#171827]">Server-Side Gemini Integration</p>
                <p className="text-[11px] text-[#717487]">API keys are managed securely on the server side and never sent to browser bundles.</p>
              </div>
              <span className="text-xs font-bold text-[#18856B] bg-[#EAF7F3] px-2.5 py-1 rounded-lg">
                Active
              </span>
            </div>

            <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] flex items-center justify-between">
              <div>
                <p className="font-bold text-[#171827]">Supported Models</p>
                <p className="text-[11px] text-[#717487]">gemini-4-argon (Thinking: HIGH), gemini-3.8-flash, gemini-3.1-flash-lite, gemini-3.5-transcribe</p>
              </div>
              <span className="text-xs font-bold text-[#7065E8] bg-[#F0EEFF] px-2.5 py-1 rounded-lg">
                Ready
              </span>
            </div>
          </div>
        </div>

        {/* Privacy & Data Deletion */}
        <div className="bg-white rounded-2xl border border-[#E8E8EF] p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-[#171827] uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#18856B]" />
            Privacy & Local Storage Controls
          </h2>

          <p className="text-xs text-[#53566B] leading-relaxed">
            All your academic notes, marks, ID files, and transactions are stored with isolated student ownership. You can reset or wipe all locally cached demonstration records at any time.
          </p>

          <div className="pt-1 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to reset all records to the initial clean demo state?')) {
                  resetToDemoData();
                  setFormData({ ...profile });
                  alert('Reset successfully!');
                }
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-[#C64545] border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset to Clean Demo Records</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
