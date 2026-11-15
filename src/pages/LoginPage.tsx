import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';
import { Button } from '../components/ui/Button';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, GraduationCap, Briefcase, ShieldAlert } from 'lucide-react';
import { getUserRoleFromEmail } from '../data/seed';

export const LoginPage: React.FC = () => {
  const { login, loginWithDomain, users, isAuthenticated, role } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect straight to their role portal
  if (isAuthenticated && role) {
    return <Navigate to={`/${role}`} replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }

    const isKnownUser = users.some(u => u.email.trim().toLowerCase() === trimmedEmail.toLowerCase());
    const detectedRole = getUserRoleFromEmail(trimmedEmail);

    if (!isKnownUser && !detectedRole) {
      setErrorMessage(
        'Access restricted: Email not recognized in campus directory. Please enter a registered email or institutional address ending with @aaroh.edu.in, @faculty.aaroh.edu.in, or @admin.aaroh.edu.in.'
      );
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    const result = login(trimmedEmail, password);
    setLoading(false);

    if (result.success && result.role) {
      navigate(`/${result.role}`);
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('campusSecure2026');
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
            Unified access portal for students, faculty, and administration
          </p>
        </div>

        {/* Domain-based RBAC Notice */}
        <div className="p-3 bg-slate-50 border border-border rounded-md text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Institutional Domain Routing</span>
          </div>
          <div className="grid grid-cols-1 gap-1 text-[11px] text-slate-500 pl-6">
            <div className="flex items-center justify-between">
              <span>Student Portal:</span>
              <code className="font-mono text-teal-800 font-medium">@aaroh.edu.in</code>
            </div>
            <div className="flex items-center justify-between">
              <span>Faculty Portal:</span>
              <code className="font-mono text-teal-800 font-medium">@faculty.aaroh.edu.in</code>
            </div>
            <div className="flex items-center justify-between">
              <span>Admin Console:</span>
              <code className="font-mono text-teal-800 font-medium">@admin.aaroh.edu.in</code>
            </div>
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
                placeholder="name@aaroh.edu.in"
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
            <span>Authenticate & Enter Portal</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Evaluator Quick-Fill Options */}
        <div className="pt-3 border-t border-border space-y-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block text-center">
            Evaluator One-Click Logins
          </span>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => handleFillDemo('aarav.sharma@aaroh.edu.in')}
              className="flex items-center justify-between px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-border rounded text-slate-700 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
                <span className="font-semibold text-slate-800">Student:</span>
                <span className="font-mono text-[11px] text-slate-600">aarav.sharma@aaroh.edu.in</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Fill</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('prof.raman@faculty.aaroh.edu.in')}
              className="flex items-center justify-between px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-border rounded text-slate-700 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-blue-700" />
                <span className="font-semibold text-slate-800">Faculty:</span>
                <span className="font-mono text-[11px] text-slate-600">prof.raman@faculty.aaroh.edu.in</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Fill</span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('registrar@admin.aaroh.edu.in')}
              className="flex items-center justify-between px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-border rounded text-slate-700 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span className="font-semibold text-slate-800">Admin:</span>
                <span className="font-mono text-[11px] text-slate-600">registrar@admin.aaroh.edu.in</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Fill</span>
            </button>
          </div>
        </div>

        {/* Institutional System Footer */}
        <div className="pt-1 text-center text-[11px] text-slate-400">
          <span>Role-Based Single Sign-On (RBAC) Architecture</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
