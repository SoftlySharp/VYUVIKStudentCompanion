import React, { useState } from 'react';
import {
  FileSearch,
  Upload,
  Sparkles,
  BarChart3,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  FileText,
  Loader2,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Calendar,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { calculateTopicFrequencies } from '../utils/rules';
import {
  SharedDocumentProcessor,
  ProcessedDocumentResult,
} from '../components/common/SharedDocumentProcessor';

interface ExtractedQuestion {
  number: string;
  text: string;
  marks: number;
  unit: string;
  topic: string;
  frequency: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const PreviousPapersView: React.FC = () => {
  const { setStudyBlocks } = useStudent();
  const [selectedSubject, setSelectedSubject] = useState('Computer Networks');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [examType, setExamType] = useState('End-Semester Examination');
  const [rawPaperText, setRawPaperText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSharedProcessor, setShowSharedProcessor] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [plannerNotification, setPlannerNotification] = useState<string | null>(null);

  // Extracted paper state
  const [extractedData, setExtractedData] = useState<{
    paperTitle: string;
    extractedQuestions: ExtractedQuestion[];
    practiceQuiz: QuizQuestion[];
  }>({
    paperTitle: 'Computer Networks End-Semester Exam (May-June 2025)',
    extractedQuestions: [
      { number: 'Q1(a)', text: 'Explain the OSI 7-layer reference model with suitable diagrams and functions of each layer.', marks: 10, unit: 'Unit 1: Architecture', topic: 'OSI Model', frequency: 'Observed 5 times in last 5 years' },
      { number: 'Q1(b)', text: 'Differentiate between Go-Back-N and Selective Repeat ARQ protocols with sliding window mechanics.', marks: 8, unit: 'Unit 1: Data Link Layer', topic: 'Sliding Window ARQ', frequency: 'Observed 3 times' },
      { number: 'Q2(a)', text: 'Derive and explain the Dijkstra algorithm for shortest path routing with an example network graph.', marks: 10, unit: 'Unit 2: Network Layer', topic: 'Shortest Path Routing', frequency: 'Observed 4 times' },
      { number: 'Q2(b)', text: 'Explain CIDR, subnetting and supernetting with IPv4 address classes.', marks: 6, unit: 'Unit 2: IP Addressing', topic: 'Subnetting & CIDR', frequency: 'Observed 3 times' },
      { number: 'Q3(a)', text: 'Explain TCP 3-way handshake connection establishment and TCP Congestion Control (Tahoe/Reno).', marks: 10, unit: 'Unit 3: Transport Layer', topic: 'TCP Handshake & Congestion', frequency: 'Observed 4 times' },
      { number: 'Q4(a)', text: 'Explain DNS recursive vs iterative query resolution and HTTP 1.1 vs HTTP/2 multiplexing.', marks: 8, unit: 'Unit 4: Application Layer', topic: 'DNS & HTTP Protocol', frequency: 'Observed 3 times' },
    ],
    practiceQuiz: [
      {
        question: 'Which layer of the OSI model is responsible for logical IP addressing and path determination across subnets?',
        options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Physical Layer'],
        correctIndex: 1,
        explanation: 'The Network Layer (Layer 3) handles logical addressing (IPv4/IPv6) and routing decisions between source and destination.',
      },
      {
        question: 'In TCP congestion control, what happens during the slow start phase when an ACK is received?',
        options: ['Congestion window doubles every RTT', 'Congestion window increments by 1 MSS per RTT', 'Threshold is halved', 'Connection terminates'],
        correctIndex: 0,
        explanation: 'In the Slow Start phase, the congestion window (cwnd) increases exponentially, doubling every round-trip time (RTT).',
      },
    ],
  });

  // Calculate dynamic, mathematically deterministic topic frequencies directly from extracted questions
  const computedFrequencies = calculateTopicFrequencies(extractedData.extractedQuestions);

  const [activeTab, setActiveTab] = useState<'questions' | 'frequency' | 'quiz'>('questions');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/gemini/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperText: rawPaperText || 'Standard end-term university question paper text with 5 units.',
          subject: selectedSubject,
          year: selectedYear,
        }),
      });
      const data = await res.json();
      setExtractedData({
        paperTitle: data.paperTitle || `${selectedSubject} Exam ${selectedYear}`,
        extractedQuestions: data.extractedQuestions || [],
        practiceQuiz: data.practiceQuiz || [],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePaperExtracted = (result: ProcessedDocumentResult) => {
    const d = result.data;
    if (d.extractedQuestions || d.practiceQuiz) {
      setExtractedData({
        paperTitle: d.paperTitle || result.fileName,
        extractedQuestions: d.extractedQuestions || [],
        practiceQuiz: d.practiceQuiz || [],
      });
      if (result.fileName) {
        setRawPaperText(`Extracted questions from ${result.fileName}`);
      }
    }
  };

  const handleAddQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const number = (form.elements.namedItem('number') as HTMLInputElement).value;
    const text = (form.elements.namedItem('text') as HTMLTextAreaElement).value;
    const marks = Number((form.elements.namedItem('marks') as HTMLInputElement).value) || 10;
    const unit = (form.elements.namedItem('unit') as HTMLInputElement).value;
    const topic = (form.elements.namedItem('topic') as HTMLInputElement).value;

    const newQ: ExtractedQuestion = {
      number: number || `Q${extractedData.extractedQuestions.length + 1}`,
      text,
      marks,
      unit: unit || 'General Unit',
      topic: topic || 'Core Topic',
      frequency: 'Observed in active paper',
    };

    setExtractedData((prev) => ({
      ...prev,
      extractedQuestions: [newQ, ...prev.extractedQuestions],
    }));

    setShowAddQuestionModal(false);
  };

  const handleScheduleHighYieldRevision = (topic: string) => {
    const newBlock = {
      id: `sb-rev-${Date.now()}`,
      title: `High-Yield PYQ Revision: ${topic}`,
      subject: selectedSubject,
      startTime: '8:00 PM',
      endTime: '9:30 PM',
      durationMinutes: 90,
      priority: 'high' as const,
      completed: false,
      day: 'Today',
    };
    setStudyBlocks((prev) => [...prev, newBlock]);
    setPlannerNotification(`Created 90-minute study session for "${topic}" in your Planner!`);
    setTimeout(() => setPlannerNotification(null), 3500);
  };

  const handleSelectQuizAnswer = (qIndex: number, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-[#7065E8]" />
            Previous Year Paper (PYQ) Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Extract questions, map recurring unit topics, and generate practice quizzes with provenance tracking.
          </p>
        </div>

        <button
          onClick={() => setShowSharedProcessor(true)}
          className="bg-[#7065E8] hover:bg-[#5E52E2] text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Paper PDF / Scan</span>
        </button>
      </div>

      {/* Input / Upload Paper Card */}
      <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-[#171827] uppercase tracking-wider">
          Upload or Paste Question Paper
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="font-semibold text-[#171827]">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
            >
              <option value="Computer Networks">Computer Networks (CO303)</option>
              <option value="Distributed Systems">Distributed Systems (CO301)</option>
              <option value="Database Systems">Database Systems (CO305)</option>
              <option value="Theory of Computation">Theory of Computation (CO307)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-[#171827]">Exam Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
            >
              <option value="2025">2025 (End-Semester)</option>
              <option value="2024">2024 (End-Semester)</option>
              <option value="2023">2023 (Mid-Semester)</option>
              <option value="2022">2022 (End-Semester)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-[#171827]">Examination Type</label>
            <input
              type="text"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#171827]">
            Paste Paper Text or OCR Questions (or click Analyze for sample paper):
          </label>
          <textarea
            value={rawPaperText}
            onChange={(e) => setRawPaperText(e.target.value)}
            rows={3}
            placeholder="Paste raw question paper text, e.g.: 'Q1. Explain OSI model and TCP 3-way handshake with 10 marks each...'"
            className="w-full mt-1 p-3 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs text-[#171827]"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[#717487]">
            Powered by Gemini 4 Argon • Historical frequency analysis
          </span>
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="bg-[#7065E8] hover:bg-[#5E52E2] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
          >
            {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isAnalyzing ? 'Extracting & Mapping...' : 'Analyze Question Paper'}</span>
          </button>
        </div>
      </div>



      {/* Planner Notification Banner */}
      {plannerNotification && (
        <div className="p-3 bg-[#EAF7F3] border border-[#A7E3D3] rounded-2xl flex items-center justify-between text-xs text-[#136652] shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#18856B]" />
            <span className="font-semibold">{plannerNotification}</span>
          </div>
          <span className="font-bold text-[#18856B]">Synced to Planner</span>
        </div>
      )}

      {/* Extracted Intelligence Results Card */}
      {extractedData && (
        <div className="space-y-4">
          {/* Paper Title Banner */}
          <div className="bg-white rounded-2xl border border-[#E8E8EF] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7065E8] bg-[#F0EEFF] px-2.5 py-0.5 rounded-full">
                Extracted Syllabus & Question Intelligence
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#171827] mt-1">
                {extractedData.paperTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="bg-[#FAFAFC] hover:bg-[#F0EEFF] text-[#7065E8] border border-[#E8E8EF] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E8E8EF] pb-2 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                activeTab === 'questions'
                  ? 'bg-[#F0EEFF] text-[#7065E8]'
                  : 'text-[#717487] hover:text-[#171827]'
              }`}
            >
              Extracted Questions ({extractedData.extractedQuestions.length})
            </button>
            <button
              onClick={() => setActiveTab('frequency')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                activeTab === 'frequency'
                  ? 'bg-[#F0EEFF] text-[#7065E8]'
                  : 'text-[#717487] hover:text-[#171827]'
              }`}
            >
              Deterministic Topic Frequencies ({computedFrequencies.length})
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                activeTab === 'quiz'
                  ? 'bg-[#F0EEFF] text-[#7065E8]'
                  : 'text-[#717487] hover:text-[#171827]'
              }`}
            >
              Interactive Practice Quiz ({extractedData.practiceQuiz.length})
            </button>
          </div>

          {/* TAB 1: Extracted Questions */}
          {activeTab === 'questions' && (
            <div className="space-y-3">
              {extractedData.extractedQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-2xl border border-[#E8E8EF] hover:border-[#7065E8]/40 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#171827] bg-[#FAFAFC] px-2 py-0.5 rounded-md border border-[#E8E8EF]">
                        {q.number}
                      </span>
                      <span className="text-[10px] font-bold text-[#7065E8] bg-[#F0EEFF] px-2 py-0.5 rounded-md">
                        {q.unit}
                      </span>
                      <span className="text-xs text-[#717487]">• {q.topic}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#18856B] bg-[#EAF7F3] px-2 py-0.5 rounded-md">
                        {q.marks} Marks
                      </span>
                      <button
                        onClick={() =>
                          setExtractedData((prev) => ({
                            ...prev,
                            extractedQuestions: prev.extractedQuestions.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-[#8C8FA3] hover:text-[#C64545] p-1 rounded-md"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[#171827] leading-relaxed font-medium">
                    {q.text}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#717487] mt-3 pt-2 border-t border-[#FAFAFC]">
                    <span className="flex items-center gap-1 text-[#B7791F]">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>{q.frequency}</span>
                    </span>
                    <span className="text-[10px] text-[#8C8FA3]">
                      Source: {extractedData.paperTitle}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Frequency & Unit Distribution (100% Deterministic derived from questions) */}
          {activeTab === 'frequency' && (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#171827]">
                    Calculated Topic Frequencies & Weightings
                  </h3>
                  <p className="text-xs text-[#717487]">
                    Mathematically derived from {extractedData.extractedQuestions.length} extracted questions ({extractedData.extractedQuestions.reduce((s, q) => s + (q.marks || 8), 0)} total marks).
                  </p>
                </div>
                <span className="text-xs bg-[#F0EEFF] text-[#7065E8] font-bold px-2.5 py-1 rounded-lg">
                  {selectedSubject}
                </span>
              </div>

              <div className="space-y-3">
                {computedFrequencies.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#171827]">{item.topic}</span>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              item.frequencyTier === 'High Yield'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : item.frequencyTier === 'Important'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.frequencyTier}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#717487] mt-0.5">
                          Questions: {item.questionNumbers.join(', ')} • {item.totalMarks} marks total ({item.count} questions)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <span className="text-[#7065E8] font-bold">{item.weightLabel} of paper</span>
                        <button
                          onClick={() => handleScheduleHighYieldRevision(item.topic)}
                          className="px-2.5 py-1 bg-white hover:bg-[#F0EEFF] text-[#7065E8] border border-[#E8E8EF] rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Schedule targeted 90-min study block in Assignment Planner"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>Add to Planner</span>
                        </button>
                      </div>
                    </div>

                    <div className="w-full bg-[#E8E8EF] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.frequencyTier === 'High Yield' ? 'bg-[#7065E8]' : 'bg-[#988EFA]'
                        }`}
                        style={{ width: `${item.weightPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Provenance disclaimer */}
              <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] text-[11px] text-[#717487] leading-relaxed">
                <strong>Deterministic Aggregation: </strong> Topic weightings are computed directly by summing marks across extracted questions and dividing by total paper marks. No arbitrary guessing or synthetic percentages.
              </div>
            </div>
          )}

          {/* TAB 3: Interactive Practice Quiz */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              {extractedData.practiceQuiz.map((quiz, qIdx) => (
                <div
                  key={qIdx}
                  className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-3"
                >
                  <p className="text-xs sm:text-sm font-bold text-[#171827]">
                    {qIdx + 1}. {quiz.question}
                  </p>

                  <div className="space-y-2 text-xs">
                    {quiz.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[qIdx] === oIdx;
                      const isCorrect = quiz.correctIndex === oIdx;
                      return (
                        <div
                          key={oIdx}
                          onClick={() => handleSelectQuizAnswer(qIdx, oIdx)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            showQuizResults
                              ? isCorrect
                                ? 'bg-[#EAF7F3] border-[#18856B] text-[#18856B] font-bold'
                                : isSelected
                                ? 'bg-[#FDF2F2] border-[#C64545] text-[#C64545]'
                                : 'bg-white border-[#E8E8EF] opacity-60'
                              : isSelected
                              ? 'bg-[#F0EEFF] border-[#7065E8] text-[#7065E8] font-semibold'
                              : 'bg-white border-[#E8E8EF] hover:border-[#7065E8]/40'
                          }`}
                        >
                          <span className="font-semibold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {showQuizResults && (
                    <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] text-xs text-[#53566B]">
                      <span className="font-bold text-[#18856B]">Explanation: </span>
                      {quiz.explanation}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowQuizResults(!showQuizResults)}
                  className="px-4 py-2 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  {showQuizResults ? 'Hide Solutions' : 'Check Answers & Explanations'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Custom Question Modal */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
              <h3 className="text-sm font-bold text-[#171827]">Add Question to Paper Dataset</h3>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="text-[#717487] hover:text-[#171827]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-[#171827]">Question Number</label>
                  <input
                    type="text"
                    name="number"
                    defaultValue={`Q${extractedData.extractedQuestions.length + 1}`}
                    required
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#171827]">Marks</label>
                  <input
                    type="number"
                    name="marks"
                    defaultValue={10}
                    min={1}
                    max={25}
                    required
                    className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#171827]">Syllabus Unit</label>
                <input
                  type="text"
                  name="unit"
                  placeholder="e.g. Unit 2: Network Layer"
                  defaultValue="Unit 2: Network Layer"
                  required
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#171827]">Core Topic Name</label>
                <input
                  type="text"
                  name="topic"
                  placeholder="e.g. Shortest Path Routing"
                  defaultValue="Shortest Path Routing"
                  required
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#171827]">Question Text</label>
                <textarea
                  name="text"
                  rows={3}
                  required
                  placeholder="Enter full exam question problem statement..."
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E8EF]">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-3.5 py-1.5 border border-[#E8E8EF] rounded-xl text-[#717487] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl font-semibold shadow-xs"
                >
                  Add & Recalculate Frequencies
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
        workflow="paper"
        title="Previous Year Paper Analysis"
        subtitle="Upload exam paper PDF, photo, or scanned question sheet. Gemini extracts units, question marks, and constructs interactive self-tests."
        onExtractionComplete={handlePaperExtracted}
      />
    </div>
  );
};
