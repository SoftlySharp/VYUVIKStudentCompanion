import React, { useState } from 'react';
import {
  FileText,
    CheckCircle2,
  Download,
  Copy,
  Plus,
  Trash2,
  RefreshCw,
  Award,
  Code2,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

export const ResumeToolsView: React.FC = () => {
  const { profile } = useStudent();
  const [copied, setCopied] = useState(false);

  const [skills, setSkills] = useState('React 19, TypeScript, Node.js, Go, Python, PostgreSQL, Distributed Systems, Docker, Git, REST APIs');
  const [projects, setProjects] = useState([
    {
      id: 'p1',
      title: 'Distributed Consensus Engine (Raft Protocol in Go)',
      bullets: 'Implemented leader election, randomized heartbeat timers, and AppendEntries log replication in Go.\nSimulated network partition handling and node crash recovery under simulated latency.',
    },
    {
      id: 'p2',
      title: 'VYUVIK AI Student Companion (React + Node.js)',
      bullets: 'Architected all-in-one academic operating system with deterministic scheduling validation and server-side Gemini intelligence.\nReduced manual syllabus and college notice extraction time by over 75% for 500+ student workflows.',
    },
  ]);

  const handleCopyText = () => {
    const fullText = `AARAV SHARMA
Email: ${profile.email} | Roll: ${profile.rollNumber} | ${profile.college}
Degree: ${profile.degree} (${profile.branch}) | CGPA: 8.62

TECHNICAL SKILLS:
${skills}

PROJECTS:
${projects.map((p) => `${p.title}\n${p.bullets}`).join('\n\n')}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#7065E8]" />
            Student Resume Tools & ATS Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Optimize engineering project bullet points with action verbs, metrics, and technical keywords.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            className="bg-white border border-[#E8E8EF] hover:bg-[#FAFAFC] text-[#171827] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Plain Resume'}</span>
          </button>
        </div>
      </div>

      {/* Main Resume Builder Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Interactive Sections */}
        <div className="lg:col-span-8 space-y-5">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7065E8] uppercase tracking-wider">
                Candidate Contact & Education Header
              </span>
              <span className="text-[10px] text-[#18856B] font-bold bg-[#EAF7F3] px-2 py-0.5 rounded-full">
                ATS Ready
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#171827]">{profile.name}</h2>
            <p className="text-xs text-[#53566B]">
              {profile.email} • {profile.college} • {profile.degree} in {profile.branch} (CGPA: 8.62)
            </p>
          </div>

          {/* Technical Skills Section */}
          <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#171827] uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#7065E8]" />
                Technical Skills (Languages, Frameworks, Systems)
              </h3>
            </div>
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={2}
              className="w-full p-3 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs text-[#171827] leading-relaxed"
            />
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#171827] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#7065E8]" />
                Key Engineering Projects
              </h3>
            </div>

            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={proj.id} className="p-4 bg-[#FAFAFC] rounded-2xl border border-[#E8E8EF] space-y-2">
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setProjects((prev) =>
                        prev.map((p) => (p.id === proj.id ? { ...p, title: newTitle } : p))
                      );
                    }}
                    className="w-full font-bold text-xs sm:text-sm text-[#171827] bg-white border border-[#E8E8EF] p-2 rounded-xl"
                  />
                  <textarea
                    value={proj.bullets}
                    onChange={(e) => {
                      const newBullets = e.target.value;
                      setProjects((prev) =>
                        prev.map((p) => (p.id === proj.id ? { ...p, bullets: newBullets } : p))
                      );
                    }}
                    rows={3}
                    className="w-full text-xs text-[#53566B] bg-white border border-[#E8E8EF] p-2.5 rounded-xl leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): ATS Checklist & Guidance */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-[#171827] uppercase tracking-wider">
              ATS Scoring Checklist
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-[#EAF7F3] rounded-xl border border-[#A7E3D3] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#18856B] shrink-0" />
                <span className="font-semibold text-[#136652]">Standard fonts & simple headings</span>
              </div>
              <div className="p-3 bg-[#EAF7F3] rounded-xl border border-[#A7E3D3] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#18856B] shrink-0" />
                <span className="font-semibold text-[#136652]">Active action verbs (Architected, Designed)</span>
              </div>
              <div className="p-3 bg-[#EAF7F3] rounded-xl border border-[#A7E3D3] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#18856B] shrink-0" />
                <span className="font-semibold text-[#136652]">Quantified engineering metrics (&gt;75%, 500+)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
