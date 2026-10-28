import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  ArrowRight,
  RotateCcw,
  Volume2,
  FileText,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

interface VivaQuestion {
  id: string;
  question: string;
  concept: string;
  expectedKeyPoints: string[];
}

interface EvaluationResult {
  score: number;
  rubricBreakdown?: {
    conceptualAccuracy: number;
    technicalDepth: number;
    communicationClarity: number;
  };
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  idealAnswer: string;
  followUpQuestion?: string;
}

export const VivaView: React.FC = () => {
  const { profile, documents } = useStudent();
  const [subject, setSubject] = useState('Distributed Consensus (Raft)');
  const [mode, setMode] = useState<'basic' | 'technical' | 'project_defense' | 'rapid_fire'>('technical');
  const [projectSummary, setProjectSummary] = useState(
    'Implementation of the Raft distributed consensus protocol in Go. Handles randomized election timers, leader election, and AppendEntries log replication.'
  );

  const [questions, setQuestions] = useState<VivaQuestion[]>([
    {
      id: 'vq1',
      question: 'What is the split-vote problem in Raft leader election, and how does your implementation prevent it?',
      concept: 'Leader Election Safety',
      expectedKeyPoints: ['Randomized election timeouts (150-300ms)', 'Candidate state transition', 'Majority quorum'],
    },
    {
      id: 'vq2',
      question: 'How do you ensure state machine safety if a leader crashes immediately after receiving a client command but before committing?',
      concept: 'Log Replication & Commitment',
      expectedKeyPoints: ['Uncommitted entries overwritten by new leader', 'Commit index monotonicity', 'MatchIndex tracking'],
    },
    {
      id: 'vq3',
      question: 'Explain the difference between linearizability and eventual consistency in distributed systems.',
      concept: 'Consistency Models',
      expectedKeyPoints: ['Real-time ordering', 'Read-after-write semantics', 'CAP theorem trade-offs'],
    },
  ]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [sessionScoreHistory, setSessionScoreHistory] = useState<number[]>([]);
  const [savedSessionMessage, setSavedSessionMessage] = useState<string | null>(null);

  const currentQ = questions[currentIdx];

  const handleEvaluate = async () => {
    if (!studentAnswer.trim() || !currentQ) return;
    setIsEvaluating(true);

    try {
      const res = await fetch('/api/gemini/viva-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate_answer',
          currentQuestion: currentQ.question,
          studentAnswer,
        }),
      });
      const data = await res.json();
      setEvaluation(data);
      if (typeof data.score === 'number') {
        setSessionScoreHistory((prev) => [...prev, data.score]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setEvaluation(null);
    setStudentAnswer('');
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCurrentIdx(0);
    }
  };

  const handleGenerateNewQuestions = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/gemini/viva-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_questions',
          subject,
          mode,
          projectSummary,
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        setEvaluation(null);
        setStudentAnswer('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSpeakQuestion = () => {
    if ('speechSynthesis' in window && currentQ) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQ.question);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-[#7065E8]" />
            AI Viva Examination Preparation
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Interactive university external viva simulator with voice / typed responses and objective scoring.
          </p>
        </div>

        {sessionScoreHistory.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-[#E8E8EF] shadow-2xs">
            <span className="text-xs text-[#717487]">Avg Score:</span>
            <span className="text-sm font-bold text-[#7065E8]">
              {(
                sessionScoreHistory.reduce((a, b) => a + b, 0) / sessionScoreHistory.length
              ).toFixed(1)}
              /10
            </span>
          </div>
        )}
      </div>

      {savedSessionMessage && (
        <div className="p-3 bg-[#EAF7F3] border border-[#A7E3D3] rounded-2xl flex items-center gap-2 text-xs text-[#136652] shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#18856B]" />
          <span className="font-semibold">{savedSessionMessage}</span>
        </div>
      )}

      {/* Mode and Topic Setup */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E8EF] flex flex-wrap items-center justify-between gap-4 shadow-2xs text-xs">
        <div className="flex items-center gap-3">
          <label className="font-bold text-[#171827]">Viva Mode:</label>
          <div className="flex items-center gap-1.5">
            {(['basic', 'technical', 'project_defense', 'rapid_fire'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
                  mode === m
                    ? 'bg-[#F0EEFF] text-[#7065E8]'
                    : 'text-[#717487] hover:text-[#171827] hover:bg-[#FAFAFC]'
                }`}
              >
                {m.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerateNewQuestions}
          className="bg-[#FAFAFC] hover:bg-[#F0EEFF] text-[#7065E8] border border-[#E8E8EF] px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Viva Questions Set</span>
        </button>
      </div>

      {/* Main Viva Room (One Question at a Time) */}
      <div className="bg-white rounded-2xl border border-[#E8E8EF] p-6 shadow-2xs space-y-6">
        {/* Examiner Question Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#7065E8] bg-[#F0EEFF] px-2.5 py-0.5 rounded-md uppercase">
                Examiner Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-xs text-[#717487]">• Concept: {currentQ?.concept}</span>
            </div>

            <button
              onClick={handleSpeakQuestion}
              className="p-1.5 text-[#7065E8] hover:bg-[#F0EEFF] rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Examiner reads question"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Aloud</span>
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-[#171827] leading-relaxed">
            "{currentQ?.question}"
          </h2>

          <div className="flex flex-wrap gap-1.5 text-[11px] text-[#717487]">
            <span className="font-semibold text-[#171827]">Examiner looks for:</span>
            {currentQ?.expectedKeyPoints.map((kp, i) => (
              <span key={i} className="bg-[#FAFAFC] border border-[#E8E8EF] px-2 py-0.5 rounded-md">
                {kp}
              </span>
            ))}
          </div>
        </div>

        {/* Student Response Area */}
        <div className="space-y-3 pt-2 border-t border-[#E8E8EF]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#171827]">
              Your Verbal / Typed Answer:
            </label>
            <button
              type="button"
              onClick={() => {
                if (!isRecording) {
                  setIsRecording(true);
                  // Voice simulation
                  setStudentAnswer(
                    'In Raft, randomized election timeouts (e.g. 150ms to 300ms) prevent simultaneous splits. When a follower timer elapses, it increments term and transitions to candidate. Since clocks diverge randomly, one server typically gathers majority quorum before another starts.'
                  );
                } else {
                  setIsRecording(false);
                }
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-white text-[#717487] border-[#E8E8EF] hover:bg-[#FAFAFC]'
              }`}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isRecording ? 'Listening...' : 'Simulate Voice Mic'}</span>
            </button>
          </div>

          <textarea
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            rows={4}
            placeholder="Type or speak your academic answer as you would explain to an external university examiner..."
            className="w-full p-3 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs sm:text-sm text-[#171827] leading-relaxed focus:outline-hidden focus:border-[#7065E8]"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#717487]">
              Evaluated on technical clarity, trade-offs, and conceptual accuracy
            </span>
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !studentAnswer.trim()}
              className="bg-[#7065E8] hover:bg-[#5E52E2] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {isEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{isEvaluating ? 'Examiner Evaluating...' : 'Submit Answer for Viva Evaluation'}</span>
            </button>
          </div>
        </div>

        {/* Examiner Feedback Drawer */}
        {evaluation && (
          <div className="p-5 bg-[#FAFAFC] rounded-2xl border border-[#D9D4FA] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#171827]">Examiner Assessment</span>
                <span className="text-xs font-bold text-white bg-[#7065E8] px-2.5 py-0.5 rounded-full">
                  Overall Score: {evaluation.score} / 10
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSavedSessionMessage(`Viva evaluation for "${currentQ.concept}" (Score: ${evaluation.score}/10) saved to performance portfolio.`);
                    setTimeout(() => setSavedSessionMessage(null), 3500);
                  }}
                  className="px-3 py-1 border border-[#E8E8EF] hover:bg-white text-[#171827] rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#18856B]" />
                  <span>Save Record</span>
                </button>
                <button
                  onClick={handleNextQuestion}
                  className="bg-[#18856B] hover:bg-[#14705a] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Structured Rubric Breakdown */}
            {evaluation.rubricBreakdown && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 bg-white rounded-xl border border-[#E8E8EF] text-xs">
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-[#171827]">Conceptual Accuracy</span>
                    <span className="font-bold text-[#7065E8]">{evaluation.rubricBreakdown.conceptualAccuracy}/10</span>
                  </div>
                  <div className="w-full bg-[#E8E8EF] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#7065E8] h-full rounded-full" style={{ width: `${evaluation.rubricBreakdown.conceptualAccuracy * 10}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-[#171827]">Technical Depth</span>
                    <span className="font-bold text-[#18856B]">{evaluation.rubricBreakdown.technicalDepth}/10</span>
                  </div>
                  <div className="w-full bg-[#E8E8EF] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#18856B] h-full rounded-full" style={{ width: `${evaluation.rubricBreakdown.technicalDepth * 10}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-[#171827]">Communication Clarity</span>
                    <span className="font-bold text-[#B7791F]">{evaluation.rubricBreakdown.communicationClarity}/10</span>
                  </div>
                  <div className="w-full bg-[#E8E8EF] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#B7791F] h-full rounded-full" style={{ width: `${evaluation.rubricBreakdown.communicationClarity * 10}%` }} />
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs sm:text-sm text-[#171827] leading-relaxed">
              {evaluation.feedback}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#EAF7F3] rounded-xl border border-[#A7E3D3]">
                <span className="font-bold text-[#18856B] flex items-center gap-1 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                </span>
                <ul className="space-y-1 text-[#136652]">
                  {evaluation.strengths?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-[#FFFBEB] rounded-xl border border-[#FDE68A]">
                <span className="font-bold text-[#B7791F] flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Areas to Expand
                </span>
                <ul className="space-y-1 text-[#92400E]">
                  {evaluation.areasForImprovement?.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Model Ideal Answer */}
            <div>
              <h4 className="text-xs font-bold text-[#171827] uppercase tracking-wider mb-1.5">
                Model Ideal Answer
              </h4>
              <p className="p-3 bg-white rounded-xl border border-[#E8E8EF] text-xs text-[#53566B] leading-relaxed">
                {evaluation.idealAnswer}
              </p>
            </div>

            {/* Follow-up Probing Question */}
            {evaluation.followUpQuestion && (
              <div className="p-3.5 bg-[#F0EEFF] rounded-xl border border-[#D9D4FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-[#7065E8] block mb-0.5">Examiner Follow-Up Question:</span>
                  <span className="text-[#171827] font-medium">"{evaluation.followUpQuestion}"</span>
                </div>
                <button
                  onClick={() => {
                    setStudentAnswer('');
                    setEvaluation(null);
                    setQuestions((prev) => [
                      ...prev,
                      {
                        id: `vq-fu-${Date.now()}`,
                        question: evaluation.followUpQuestion!,
                        concept: 'Probing Follow-Up',
                        expectedKeyPoints: ['Deep trade-offs', 'Failure recovery scenario'],
                      },
                    ]);
                    setCurrentIdx(questions.length);
                  }}
                  className="px-3 py-1.5 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl font-semibold shrink-0"
                >
                  Answer Follow-Up
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
