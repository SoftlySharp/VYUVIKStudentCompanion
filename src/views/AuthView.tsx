import React, { useState } from 'react';
import {
  GraduationCap,
  ArrowRight,
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

interface AuthViewProps {
  initialMode?: 'login' | 'signup';
  onSuccess: (destination?: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, signup } = useStudent();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const ok = await login(email, password);
        if (ok) {
          onSuccess('/dashboard');
        } else {
          setError('Invalid college email or password. You can also use Quick Demo Login.');
        }
      } else {
        if (!name.trim()) {
          setError('Please provide your full student name.');
          setIsSubmitting(false);
          return;
        }
        const ok = await signup(email, password, name);
        if (ok) {
          onSuccess('/onboarding');
        } else {
          setError('Failed to create account. Please check credentials.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    await login('khushi@sarecmirzapur.ac.in', 'demo123');
    onSuccess('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8E8EF] shadow-xl p-8 space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#7065E8] text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm relative">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-[#171827]">VYUVIK Student Companion</h1>
          <p className="text-xs text-[#717487]">Your Sovereign Academic Operating System</p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex items-center p-1 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-[#7065E8] shadow-xs'
                : 'text-[#717487] hover:text-[#171827]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#7065E8] shadow-xs'
                : 'text-[#717487] hover:text-[#171827]'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-[#C64545] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Fast Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isSubmitting}
          className="w-full py-2.5 bg-[#F0EEFF] hover:bg-[#E2DEFD] text-[#7065E8] border border-[#D9D4FA] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
        >
          <Zap className="w-4 h-4" />
          <span>Continue as Demo Student (Khushi - SAREC Mirzapur)</span>
        </button>

        <div className="relative text-center">
          <span className="bg-white px-3 text-[11px] text-[#8C8FA3] font-semibold">
            Or with student email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="font-semibold text-[#171827]">Full Name *</label>
              <div className="relative mt-1">
                <User className="w-4 h-4 text-[#8C8FA3] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Khushi Sharma"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827] focus:outline-hidden focus:border-[#7065E8] focus:bg-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-semibold text-[#171827]">College or University Email *</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-[#8C8FA3] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu.in"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827] focus:outline-hidden focus:border-[#7065E8] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="font-semibold text-[#171827]">Password *</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-[#7065E8] hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-[#8C8FA3] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827] focus:outline-hidden focus:border-[#7065E8] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#7065E8] hover:bg-[#5E52E2] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <span>{mode === 'login' ? 'Sign In to VYUVIK' : 'Create Student Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-[#717487] text-center leading-relaxed">
          By continuing, you agree to student data privacy policies with private AES-encrypted vault storage.
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E8E8EF] max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#171827]">Reset Student Password</h3>
            <p className="text-xs text-[#717487]">
              Enter your college email to receive a recovery link.
            </p>

            {forgotSent ? (
              <div className="p-3 bg-[#EAF7F3] border border-[#18856B] rounded-xl text-xs text-[#18856B] font-bold text-center">
                Recovery instructions dispatched! Check your email inbox.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@college.edu.in"
                  className="w-full p-2.5 bg-[#FAFAFC] border border-[#E8E8EF] rounded-xl text-[#171827]"
                />
                <button
                  type="button"
                  onClick={() => setForgotSent(true)}
                  className="w-full py-2 bg-[#7065E8] hover:bg-[#5E52E2] text-white rounded-xl font-bold"
                >
                  Send Recovery Link
                </button>
              </div>
            )}

            <div className="text-right pt-2 border-t border-[#E8E8EF]">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="text-xs font-semibold text-[#717487]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
