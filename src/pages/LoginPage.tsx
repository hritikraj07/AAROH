import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';
import { Button } from '../components/ui/Button';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithDomain, isAuthenticated } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }

    if (!trimmedEmail.toLowerCase().endsWith('@aaroh.edu.in')) {
      setErrorMessage('Access restricted: Institutional email must end with @aaroh.edu.in');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    const result = loginWithDomain(trimmedEmail, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('studentPass2026');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white border border-border rounded-lg shadow-card p-6 sm:p-8 space-y-6">
        {/* Header Wordmark & Institutional Brand */}
        <div className="text-center space-y-1.5 pb-2 border-b border-border">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              {APP_CONFIG.appName}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
              SSO Gateway
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            {APP_CONFIG.collegeName}
          </p>
          <p className="text-xs text-slate-400">
            Unified student access for academics, notifications, and campus life
          </p>
        </div>

        {/* Domain Restriction Notice */}
        <div className="p-3 bg-slate-50 border border-border rounded-md text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-800 block">Domain Restricted Access</span>
            Sign in is strictly permitted for verified student accounts ending with{' '}
            <strong className="font-mono text-teal-800">@aaroh.edu.in</strong>.
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Institutional Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="username@aaroh.edu.in"
                className="w-full text-xs font-mono pl-9 pr-3 py-2 bg-white border border-border rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••••••"
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-border rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:border-teal-700 transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full shadow-subtle justify-center"
          >
            <span>Sign In to Student Account</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Quick Testing Facilitator */}
        <div className="pt-3 border-t border-border space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block text-center">
            Evaluator Quick Fill Options
          </span>
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <button
              type="button"
              onClick={() => handleFillDemo('aarav.sharma@aaroh.edu.in')}
              className="px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-slate-100 border border-border rounded font-mono text-slate-700 transition-colors"
            >
              aarav.sharma@aaroh.edu.in
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('priya.nair@aaroh.edu.in')}
              className="px-2.5 py-1 text-[11px] bg-slate-50 hover:bg-slate-100 border border-border rounded font-mono text-slate-700 transition-colors"
            >
              priya.nair@aaroh.edu.in
            </button>
          </div>
        </div>

        {/* Institutional System Footer */}
        <div className="pt-2 text-center text-[11px] text-slate-400">
          <span>Single institutional credential for all campus services</span>
        </div>
      </div>
    </div>
  );
};
