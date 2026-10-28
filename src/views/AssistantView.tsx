import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Bot,
  User,
  CheckCircle,
  XCircle,
  Zap,
  Command,
  Brain,
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  Volume2,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  proposedAction?: {
    type: 'create_assignment' | 'add_study_block' | 'record_expense' | 'open_notice';
    title: string;
    details: string;
    payload: any;
  };
}

export const AssistantView: React.FC = () => {
  const { profile, addAssignment, studyBlocks, setStudyBlocks, addExpense } = useStudent();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      role: 'assistant',
      content: `Namaste ${profile.name.split(' ')[0]}! I am your VYUVIK Command Center assistant. I have full context of your semester courses (${profile.branch}), pending assignments, and college calendar.\n\nYou can ask me anything in English, Hindi, or Hinglish — for example:
• "Mere pending assignments aur upcoming exams ke liye study plan suggest karo."
• "Is notice mein exam fee aur deadline kya hai?"
• "Operating Systems Unit 3 ke imp questions explain karo."`,
      timestamp: 'Just now',
      modelUsed: 'gemini-3.8-flash',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(true); // gemini-4-argon with thinkingLevel: HIGH
  const [latencyMode, setLatencyMode] = useState(false); // gemini-3.1-flash-lite
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; base64: string } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() && !selectedFile) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query || `Attached file: ${selectedFile?.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    const filePayload = selectedFile;
    setSelectedFile(null);
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/command-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          history: messages.slice(-6),
          studentContext: {
            name: profile.name,
            college: profile.college,
            branch: profile.branch,
            semester: profile.semester,
          },
          thinkingMode,
          latencyMode,
          fileData: filePayload?.base64,
          mimeType: filePayload?.type,
        }),
      });

      const data = await res.json();

      // Check if user query matches action patterns to propose an action
      let action: any = undefined;
      const lower = query.toLowerCase();
      if (lower.includes('study plan') || lower.includes('banao plan') || lower.includes('schedule')) {
        action = {
          type: 'add_study_block',
          title: 'Add Dedicated Focus Study Block',
          details: 'Slot: 8:00 PM - 9:30 PM for Raft Protocol Implementation',
          payload: {
            id: `sb-${Date.now()}`,
            title: 'High Priority Assignment Coding: Raft Consensus',
            subject: 'Distributed Systems',
            startTime: '8:00 PM',
            endTime: '9:30 PM',
            durationMinutes: 90,
            priority: 'high',
            completed: false,
            day: 'Today',
          },
        };
      } else if (lower.includes('expense') || lower.includes('kharcha') || lower.includes('rupaye') || lower.includes('rs.')) {
        action = {
          type: 'record_expense',
          title: 'Confirm College Expense Entry',
          details: 'Amount: ₹250 for Study Materials & Printing',
          payload: {
            id: `exp-${Date.now()}`,
            title: 'Photocopy & Assignment Binding',
            amount: 250,
            category: 'Printing',
            date: new Date().toISOString().split('T')[0],
          },
        };
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Request processed.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: thinkingMode ? 'gemini-4-argon (Thinking: HIGH)' : latencyMode ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash',
        proposedAction: action,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          content: 'I encountered an error connecting to the service. Please check your network or try again.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = (msgId: string, action: NonNullable<Message['proposedAction']>) => {
    if (action.type === 'add_study_block') {
      setStudyBlocks((prev) => [...prev, action.payload]);
    } else if (action.type === 'record_expense') {
      addExpense(action.payload);
    } else if (action.type === 'create_assignment') {
      addAssignment(action.payload);
    }

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, proposedAction: undefined, content: m.content + '\n\n✅ Action successfully confirmed and saved to your records!' } : m
      )
    );
  };

  // Voice Recording simulation & transcription endpoint
  const handleToggleVoice = async () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingStatus('Listening to your query... (click again to transcribe)');
    } else {
      setIsRecording(false);
      setRecordingStatus('Transcribing via gemini-3.5-transcribe...');
      try {
        const res = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioData: 'mock_audio_sample' }),
        });
        const data = await res.json();
        const transcribedText = data.transcription || 'Mere teen assignments pending hain aur Friday ko exam hai. Study plan banao.';
        setInput(transcribedText);
        setRecordingStatus('');
      } catch (e) {
        setRecordingStatus('');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setSelectedFile({
        name: file.name,
        type: file.type || 'application/pdf',
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto bg-white rounded-2xl border border-[#E8E8EF] shadow-2xs overflow-hidden">
      {/* Top Assistant Header & Mode Controls */}
      <div className="p-4 border-b border-[#E8E8EF] bg-[#FAFAFC] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7065E8] text-white flex items-center justify-center shadow-xs">
            <Command className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#171827]">Student Command Center</h2>
              <span className="text-[10px] bg-[#EAF7F3] text-[#18856B] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#18856B]" />
                Live Context
              </span>
            </div>
            <p className="text-[11px] text-[#717487]">
              Multilingual (English, Hindi, Hinglish) • Autonomous Verified Actions
            </p>
          </div>
        </div>

        {/* Model & Thinking Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setThinkingMode(!thinkingMode);
              if (!thinkingMode) setLatencyMode(false);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              thinkingMode
                ? 'bg-[#F0EEFF] text-[#7065E8] border-[#D9D4FA] shadow-xs'
                : 'bg-white text-[#717487] border-[#E8E8EF] hover:bg-[#FAFAFC]'
            }`}
            title="Uses gemini-4-argon with thinkingLevel: ThinkingLevel.HIGH for complex reasoning"
          >
            <Brain className="w-3.5 h-3.5 text-[#7065E8]" />
            <span>High Thinking Mode</span>
            {thinkingMode && <span className="text-[9px] bg-[#7065E8] text-white px-1 rounded-sm">Argon</span>}
          </button>

          <button
            onClick={() => {
              setLatencyMode(!latencyMode);
              if (!latencyMode) setThinkingMode(false);
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              latencyMode
                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-xs'
                : 'bg-white text-[#717487] border-[#E8E8EF] hover:bg-[#FAFAFC]'
            }`}
            title="Uses gemini-3.1-flash-lite for instant low-latency responses"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Fast / Low-Latency</span>
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-[#171827] text-white'
                  : 'bg-[#F0EEFF] text-[#7065E8] border border-[#E8E8EF]'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#7065E8] text-white rounded-tr-xs'
                    : 'bg-[#FAFAFC] text-[#171827] border border-[#E8E8EF] rounded-tl-xs shadow-2xs'
                }`}
              >
                {msg.content}

                {/* Proposed Action Confirmation Card */}
                {msg.proposedAction && (
                  <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#7065E8]/30 shadow-xs text-left">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#7065E8] mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Proposed Action: {msg.proposedAction.title}</span>
                    </div>
                    <p className="text-xs text-[#53566B] mb-3">{msg.proposedAction.details}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConfirmAction(msg.id, msg.proposedAction!)}
                        className="px-3 py-1.5 rounded-lg bg-[#18856B] text-white text-xs font-semibold hover:bg-[#14705a] flex items-center gap-1 shadow-2xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirm & Execute</span>
                      </button>
                      <button
                        onClick={() =>
                          setMessages((prev) =>
                            prev.map((m) =>
                              m.id === msg.id ? { ...m, proposedAction: undefined } : m
                            )
                          )
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-[#E8E8EF] text-[#717487] text-xs font-medium hover:bg-[#FAFAFC]"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Message metadata footer */}
              <div
                className={`flex items-center gap-2 mt-1 text-[10px] text-[#8C8FA3] ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.modelUsed && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-[#7065E8]">{msg.modelUsed}</span>
                  </>
                )}
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleSpeak(msg.content)}
                    className="p-1 hover:text-[#171827] text-[#8C8FA3]"
                    title="Read aloud"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F0EEFF] text-[#7065E8] flex items-center justify-center">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-[#FAFAFC] p-3 rounded-2xl border border-[#E8E8EF] text-xs text-[#717487] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7065E8]" />
              <span>
                {thinkingMode ? 'Gemini 4 Argon reasoning with deep thinking...' : 'Generating response...'}
              </span>
            </div>
          </div>
        )}

        {recordingStatus && (
          <div className="text-center text-xs text-[#7065E8] font-semibold bg-[#F0EEFF] py-2 rounded-xl border border-[#D9D4FA] animate-pulse">
            🎙️ {recordingStatus}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-[#E8E8EF] bg-[#FAFAFC] flex items-center gap-2 overflow-x-auto text-[11px]">
        <span className="text-[#8C8FA3] font-semibold shrink-0">Try asking:</span>
        <button
          onClick={() => handleSend('Mere teen assignments pending hain aur Friday ko exam hai. Study plan banao.')}
          className="bg-white border border-[#E8E8EF] px-2.5 py-1 rounded-lg hover:border-[#7065E8] hover:text-[#7065E8] shrink-0 text-[#53566B]"
        >
          Study plan for 3 assignments + exam
        </button>
        <button
          onClick={() => handleSend('Recent college exam notice ke main points aur deadlines summarize karo.')}
          className="bg-white border border-[#E8E8EF] px-2.5 py-1 rounded-lg hover:border-[#7065E8] hover:text-[#7065E8] shrink-0 text-[#53566B]"
        >
          Explain latest exam notice
        </button>
        <button
          onClick={() => handleSend('Record ₹180 expense for Xerox and Lab Record binding.')}
          className="bg-white border border-[#E8E8EF] px-2.5 py-1 rounded-lg hover:border-[#7065E8] hover:text-[#7065E8] shrink-0 text-[#53566B]"
        >
          Add ₹180 printing expense
        </button>
      </div>

      {/* Selected file preview */}
      {selectedFile && (
        <div className="px-4 py-1.5 bg-[#F0EEFF] border-t border-[#D9D4FA] flex items-center justify-between text-xs text-[#7065E8]">
          <span className="flex items-center gap-1.5 truncate">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-semibold">{selectedFile.name}</span>
          </span>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-xs hover:underline text-[#C64545]"
          >
            Remove
          </button>
        </div>
      )}

      {/* Input Box Bar */}
      <div className="p-3 bg-white border-t border-[#E8E8EF]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.txt"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-[#717487] hover:text-[#171827] hover:bg-[#FAFAFC] rounded-xl border border-[#E8E8EF] transition-colors"
            title="Attach Notice or Assignment Document"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-xl border transition-colors ${
              isRecording
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'text-[#717487] hover:text-[#171827] hover:bg-[#FAFAFC] border-[#E8E8EF]'
            }`}
            title="Voice input via gemini-3.5-transcribe"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or request in English, Hindi, or Hinglish..."
            className="flex-1 px-4 py-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#7065E8] focus:bg-white text-[#171827] transition-all placeholder:text-[#8C8FA3]"
          />

          <button
            type="submit"
            disabled={loading || (!input.trim() && !selectedFile)}
            className="bg-[#7065E8] hover:bg-[#5E52E2] disabled:opacity-50 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span className="hidden sm:inline">Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
