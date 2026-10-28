import React, { useState } from 'react';
import {
  BookMarked,
  Sparkles,
  Layers,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Search,
  CheckCircle2,
  FileText,
  Loader2,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

export const StudyAssistantView: React.FC = () => {
  const { profile } = useStudent();
  const [topic, setTopic] = useState('Operating Systems: Deadlock Avoidance');
  const [question, setQuestion] = useState('Explain Banker\'s algorithm safety check step by step with need matrix calculation.');
  const [activeTab, setActiveTab] = useState<'qa' | 'flashcards' | 'revision'>('qa');

  const [isLoading, setIsLoading] = useState(false);
  const [answerResult, setAnswerResult] = useState<any>({
    answer: `The Banker's Algorithm is a deadlock avoidance algorithm named after the banking system where a bank never allocates cash exceeding its reserve.\n\n1. Data Structures:\n• Available[m]: Available instances of each resource type.\n• Max[n][m]: Maximum demand of each process.\n• Allocation[n][m]: Currently allocated resource instances.\n• Need[n][m]: Remaining needed resources = Max[i][j] - Allocation[i][j].\n\n2. Safety Algorithm Steps:\nStep 1: Initialize Work = Available, Finish[i] = false for all i.\nStep 2: Find an index i such that Finish[i] == false and Need[i] <= Work. If no such i exists, go to Step 4.\nStep 3: Work = Work + Allocation[i], Finish[i] = true. Go back to Step 2.\nStep 4: If Finish[i] == true for all i, the system is in a SAFE STATE.`,
    citations: ['Galvin & Silberschatz: Operating System Concepts (10th Ed), Chapter 8: Deadlocks, Pages 321-326'],
  });

  const [flashcards, setFlashcards] = useState([
    { front: 'What is the Coffman Mutual Exclusion condition?', back: 'At least one resource must be held in a non-shareable mode; only one process can use the resource at any given time.' },
    { front: 'What is the difference between Deadlock Prevention and Deadlock Avoidance?', back: 'Prevention eliminates at least one Coffman condition statically. Avoidance dynamically tracks state transitions (e.g. Banker\'s algorithm) to prevent unsafe states.' },
    { front: 'What is a Resource Allocation Graph (RAG) cycle implication?', back: 'If each resource has only 1 instance, a cycle strictly implies deadlock. If resources have multiple instances, a cycle is a necessary but not sufficient condition.' },
  ]);

  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'qa', topic, question }),
      });
      const data = await res.json();
      setAnswerResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/study-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'flashcards', topic }),
      });
      const data = await res.json();
      if (data.flashcards && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171827] tracking-tight flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-[#7065E8]" />
            AI Study Assistant & Revision Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#717487] mt-0.5">
            Grounded conceptual explanations with textbook citations, active-recall flashcards, and revision notes.
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8E8EF] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('qa')}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'qa' ? 'bg-[#F0EEFF] text-[#7065E8]' : 'text-[#717487] hover:text-[#171827]'
          }`}
        >
          Grounded Conceptual Q&A
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            activeTab === 'flashcards' ? 'bg-[#F0EEFF] text-[#7065E8]' : 'text-[#717487] hover:text-[#171827]'
          }`}
        >
          Active-Recall Flashcards ({flashcards.length})
        </button>
      </div>

      {/* TAB 1: Grounded Q&A */}
      {activeTab === 'qa' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] p-5 shadow-2xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-1">
                <label className="font-semibold text-[#171827]">Course Topic / Module</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-[#171827]">Your Question / Concept to Clarify</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full mt-1 p-2 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleAskQuestion}
                disabled={isLoading || !question.trim()}
                className="bg-[#7065E8] hover:bg-[#5E52E2] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isLoading ? 'Researching notes...' : 'Ask Study Assistant'}</span>
              </button>
            </div>
          </div>

          {/* Answer Output */}
          {answerResult && (
            <div className="bg-white rounded-2xl border border-[#E8E8EF] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E8EF] pb-3">
                <span className="text-xs font-bold text-[#7065E8] uppercase tracking-wider">
                  Grounded Concept Explanation
                </span>
                <span className="text-xs text-[#717487]">Gemini 3.8 Flash</span>
              </div>

              <div className="text-xs sm:text-sm text-[#171827] whitespace-pre-wrap leading-relaxed font-normal">
                {answerResult.answer}
              </div>

              {answerResult.citations && answerResult.citations.length > 0 && (
                <div className="p-3 bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] text-xs text-[#53566B]">
                  <span className="font-bold text-[#7065E8]">Verified Course Citation: </span>
                  {answerResult.citations.join('; ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#717487]">Click any flashcard to flip between prompt and concept definition.</p>
            <button
              onClick={handleGenerateFlashcards}
              disabled={isLoading}
              className="bg-[#F0EEFF] text-[#7065E8] hover:bg-[#E2DEFD] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Generate 5 New Flashcards</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flashcards.map((card, i) => {
              const isFlipped = flippedCards[i];
              return (
                <div
                  key={i}
                  onClick={() => setFlippedCards((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className={`min-h-[180px] p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isFlipped
                      ? 'bg-[#171827] text-white border-[#171827] shadow-md'
                      : 'bg-white border-[#E8E8EF] hover:border-[#7065E8]/40 shadow-2xs text-[#171827]'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isFlipped ? 'text-[#A59DF7]' : 'text-[#7065E8]'
                    }`}
                  >
                    {isFlipped ? 'RECALL DEFINITION' : 'PROMPT QUESTION'}
                  </span>

                  <p className="text-xs sm:text-sm font-semibold leading-relaxed my-auto">
                    {isFlipped ? card.back : card.front}
                  </p>

                  <span className="text-[10px] opacity-70 text-right">Click to flip ↺</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
