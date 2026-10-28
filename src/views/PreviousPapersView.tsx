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
} from 'lucide-react';

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

interface TopicFrequency {
  topic: string;
  count: number;
  weight: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const PreviousPapersView: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState('Computer Networks');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [examType, setExamType] = useState('End-Semester Examination');
  const [rawPaperText, setRawPaperText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSharedProcessor, setShowSharedProcessor] = useState(false);

  // Extracted paper state
  const [extractedData, setExtractedData] = useState<{
    paperTitle: string;
    extractedQuestions: ExtractedQuestion[];
    topicFrequency: TopicFrequency[];
    practiceQuiz: QuizQuestion[];
  } | null>({
    paperTitle: 'Computer Networks End-Semester Exam (May-June 2025)',
    extractedQuestions: [
      { number: 'Q1(a)', text: 'Explain the OSI 7-layer reference model with suitable diagrams and functions of each layer.', marks: 10, unit: 'Unit 1: Architecture', topic: 'OSI Model', frequency: 'Observed 5 times in last 5 years' },
      { number: 'Q1(b)', text: 'Differentiate between Go-Back-N and Selective Repeat ARQ protocols with sliding window mechanics.', marks: 8, unit: 'Unit 1: Data Link Layer', topic: 'Sliding Window ARQ', frequency: 'Observed 3 times' },
      { number: 'Q2(a)', text: 'Derive and explain the Dijkstra algorithm for shortest path routing with an example network graph.', marks: 10, unit: 'Unit 2: Network Layer', topic: 'Shortest Path Routing', frequency: 'Observed 4 times' },
      { number: 'Q2(b)', text: 'Explain CIDR, subnetting and supernetting with IPv4 address classes.', marks: 6, unit: 'Unit 2: IP Addressing', topic: 'Subnetting & CIDR', frequency: 'Observed 3 times' },
      { number: 'Q3(a)', text: 'Explain TCP 3-way handshake connection establishment and TCP Congestion Control (Tahoe/Reno).', marks: 10, unit: 'Unit 3: Transport Layer', topic: 'TCP Handshake & Congestion', frequency: 'Observed 4 times' },
      { number: 'Q4(a)', text: 'Explain DNS recursive vs iterative query resolution and HTTP 1.1 vs HTTP/2 multiplexing.', marks: 8, unit: 'Unit 4: Application Layer', topic: 'DNS & HTTP Protocol', frequency: 'Observed 3 times' },
    ],
    topicFrequency: [
      { topic: 'OSI 7-Layer Reference Model', count: 5, weight: '22%' },
      { topic: 'Dijkstra & Distance Vector Routing', count: 4, weight: '18%' },
      { topic: 'TCP 3-Way Handshake & Congestion', count: 4, weight: '18%' },
      { topic: 'Sliding Window ARQ (GBN vs SR)', count: 3, weight: '14%' },
      { topic: 'IPv4 Subnetting & CIDR Masks', count: 3, weight: '14%' },
      { topic: 'DNS & Application Protocols', count: 3, weight: '14%' },
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
      setExtractedData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePaperExtracted = (result: ProcessedDocumentResult) => {
    const d = result.data;
    if (d.extractedQuestions || d.practiceQuiz || d.topicFrequency) {
      setExtractedData({
        paperTitle: d.paperTitle || result.fileName,
        extractedQuestions: d.extractedQuestions || [],
        topicFrequency: d.topicFrequency || [],
        practiceQuiz: d.practiceQuiz || [],
      });
      if (result.fileName) {
        setRawPaperText(`Extracted questions from ${result.fileName}`);
      }
    }
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

      {/* Analysis Workspace Tabs */}
      {extractedData && (
        <div className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-[#E8E8EF] pb-2 text-xs font-semibold">
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
              Topic Frequency & Unit Breakdown
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
                    <span className="text-xs font-bold text-[#18856B] bg-[#EAF7F3] px-2 py-0.5 rounded-md">
                      {q.marks} Marks
                    </span>
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

          {/* TAB 2: Frequency & Unit Distribution */}
          {activeTab === 'frequency' && (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#171827]">Observed Topic Frequency</h3>
                  <p className="text-xs text-[#717487]">
                    Calculated from historical 5-year question paper datasets.
                  </p>
                </div>
                <span className="text-xs bg-[#F0EEFF] text-[#7065E8] font-bold px-2 py-1 rounded-lg">
                  {selectedSubject}
                </span>
              </div>

              <div className="space-y-3">
                {extractedData.topicFrequency.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF]">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#171827] mb-1.5">
                      <span>{item.topic}</span>
                      <span className="text-[#7065E8] font-bold">{item.count} papers ({item.weight})</span>
                    </div>
                    <div className="w-full bg-[#E8E8EF] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#7065E8] h-full rounded-full"
                        style={{ width: item.weight }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Provenance disclaimer */}
              <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] text-[11px] text-[#717487] leading-relaxed">
                <strong>Provenance Guarantee: </strong> Frequency data represents observed appearances in past university papers and does not promise or guarantee upcoming exam questions. Always study all syllabus units thoroughly.
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
