import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';
import { Logo } from '../components/ui/Logo';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';
import { getUserRoleFromEmail } from '../data/seed';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, users, isAuthenticated, role, theme, toggleTheme } = useApp();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('aarav.sharma@aaroh.edu.in');
  const [password, setPassword] = useState('campusSecure2026');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mouse coordinate state for interactive blurred blobs
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { clientWidth, clientHeight } = currentTarget;
    const x = ((clientX / clientWidth) - 0.5) * 50;
    const y = ((clientY / clientHeight) - 0.5) * 50;
    setMouseOffset({ x, y });
  };

  // If already authenticated, redirect straight to their role portal
  if (isAuthenticated && role) {
    return <Navigate to={`/${role}`} replace />;
  }

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    if (newRole === 'student') {
      setEmail('aarav.sharma@aaroh.edu.in');
      setPassword('campusSecure2026');
    } else if (newRole === 'faculty') {
      setEmail('prof.raman@faculty.aaroh.edu.in');
      setPassword('campusSecure2026');
    } else if (newRole === 'admin') {
      setEmail('registrar@admin.aaroh.edu.in');
      setPassword('campusSecure2026');
    }
    setErrorMessage(null);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (errorMessage) setErrorMessage(null);
    const detected = getUserRoleFromEmail(val);
    if (detected) {
      setSelectedRole(detected);
    }
  };

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
        'Access restricted: Email not recognized in campus directory. Please enter a registered email ending with @aaroh.edu.in, @faculty.aaroh.edu.in, or @admin.aaroh.edu.in.'
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

  return (
    <div
      onMouseMove={handleMouseMove}
      className="h-screen w-screen overflow-hidden flex items-center justify-center bg-[#FBFBFA] dark:bg-slate-950 font-sans p-4 relative select-none transition-colors duration-300"
    >
      {/* Theme Toggle in Login Viewport */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-sm z-30 transition-all active:scale-95"
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-600" />
        )}
      </button>

      {/* Subtle Interactive Dot-Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 dark:opacity-20 pointer-events-none" />

      {/* Interactive Slow-Moving Blurred Geometric Blobs */}
      <div
        className="absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full bg-teal-700/10 dark:bg-teal-500/10 blur-[100px] pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)` }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-[440px] h-[440px] rounded-full bg-teal-700/10 dark:bg-teal-500/10 blur-[100px] pointer-events-none transition-transform duration-300 ease-out"
        style={{ transform: `translate(${-mouseOffset.x * 1.3}px, ${-mouseOffset.y * 1.3}px)` }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-teal-600/5 dark:bg-teal-400/5 blur-[90px] pointer-events-none"
      />

      {/* Centered Login Card */}
      <div className="relative z-10 bg-white max-w-md w-full p-8 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-xl shadow-sm animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700 ease-out space-y-6">
        {/* Branding & Header Hierarchy */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div>
            <h2 className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase font-mono">
              K.R. Mangalam University
            </h2>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">
              Sign In to Aaroh
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
              Unified Academic Operating System & Campus Portal
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
              Role
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={e => handleRoleChange(e.target.value as UserRole)}
                className="w-full text-xs font-medium px-3 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-500 transition-colors cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={e => handleEmailChange(e.target.value)}
                placeholder="name@aaroh.edu.in"
                className="w-full text-xs font-mono pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-500 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700 dark:focus:ring-teal-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all duration-150 active:scale-95 shadow-sm disabled:opacity-50 select-none cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Institutional System Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          <span>Enterprise SSO Gateway</span>
          <span className="text-teal-700 dark:text-teal-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            256-bit TLS
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
