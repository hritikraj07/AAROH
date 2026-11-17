import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/ui/Logo';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getUserRoleFromEmail } from '../data/seed';
import { UserRole } from '../types';

const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

export const LoginPage: React.FC = () => {
  const { login, users, isAuthenticated, role } = useApp();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('registrar@admin.aaroh.edu.in');
  const [password, setPassword] = useState('campusSecure2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mouse coordinate state for interactive blurred blobs
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { clientWidth, clientHeight } = currentTarget;
    const x = ((clientX / clientWidth) - 0.5) * 40;
    const y = ((clientY / clientHeight) - 0.5) * 40;
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

  // Demo Quick Access Handler - immediately injects credentials and executes login
  const handleQuickDemoLogin = (targetRole: UserRole) => {
    let demoEmail = '';
    const demoPassword = 'campusSecure2026';

    if (targetRole === 'admin') {
      demoEmail = 'registrar@admin.aaroh.edu.in';
    } else if (targetRole === 'faculty') {
      demoEmail = 'prof.raman@faculty.aaroh.edu.in';
    } else {
      demoEmail = 'aarav.sharma@aaroh.edu.in';
    }

    setSelectedRole(targetRole);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage(null);

    setLoading(true);
    const result = login(demoEmail, demoPassword);
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
      className="min-h-screen w-full h-screen overflow-hidden flex items-center justify-center sm:justify-end px-4 sm:px-10 lg:px-20 relative bg-[#EEF4ED] dark:bg-[#0E0E11] font-sans select-none transition-colors duration-500 ease-in-out"
    >
      {/* 1. Global Campus Background: Converted from JPG to SVG format */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/campus.svg"
          alt="K.R. Mangalam University Campus"
          className="w-full h-full min-h-screen object-cover object-center"
        />
        {/* Ambient overlay for dark/light mode readability */}
        <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/60" />

        {/* Ambient Interactive Blurred Geometric Blobs for Depth */}
        <div
          className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-teal-600/10 dark:bg-teal-500/15 blur-[100px] pointer-events-none transition-transform duration-300 ease-out"
          style={{ transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)` }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full bg-teal-700/15 dark:bg-teal-500/20 blur-[100px] pointer-events-none transition-transform duration-300 ease-out"
          style={{ transform: `translate(${-mouseOffset.x * 1.3}px, ${-mouseOffset.y * 1.3}px)` }}
        />
      </div>

      {/* 2. Institutional Header Banner: High quality enhanced SVG, no hover pop-up, completely static */}
      <div className="absolute top-5 left-4 sm:top-6 sm:left-6 md:top-7 md:left-8 z-30 flex items-center pointer-events-none select-none">
        <img
          src="/krmu_banner.svg"
          alt="K.R. Mangalam University - The Complete World of Education - NAAC Grade A"
          className="w-[280px] sm:w-[340px] md:w-[390px] lg:w-[430px] max-w-full h-auto object-contain block drop-shadow-md select-none pointer-events-none"
        />
      </div>

      {/* 3. The Glassmorphism Login Card: Precisely aligned to white outline (Y: ~11.6% to ~88.4%, X: ~69.5% to ~95.1%) */}
      <div className="relative z-10 w-full max-w-sm sm:w-[400px] lg:w-[420px] h-[77vh] min-h-[520px] max-h-[670px] p-6 sm:p-7 bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-xl backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-white/10 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700 ease-out flex flex-col justify-between">
        {/* Header: Logo, Aaroh, Subtitle, and Sign In heading */}
        <div className="flex flex-col items-center justify-center text-center space-y-1 pt-1">
          <div className="flex items-center justify-center">
            <Logo size="md" />
          </div>
          <div className="text-[10px] font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase font-mono pt-0.5" title="K.R. Mangalam University">
            K.R. MANGALAM UNIVERSITY
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Sign In to Aaroh
          </h1>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-2.5 bg-rose-50/80 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 my-auto">
          {/* 1. ROLE Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono uppercase tracking-wider">
              Role
            </label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={e => handleRoleChange(e.target.value as UserRole)}
                className="w-full text-xs font-medium px-3 py-2 bg-white/40 dark:bg-black/40 border border-slate-200/60 dark:border-white/10 backdrop-blur-md rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500 transition-colors cursor-pointer"
              >
                <option value="student" className="bg-white dark:bg-[#18181B] text-slate-900 dark:text-slate-100">Student</option>
                <option value="faculty" className="bg-white dark:bg-[#18181B] text-slate-900 dark:text-slate-100">Faculty</option>
                <option value="admin" className="bg-white dark:bg-[#18181B] text-slate-900 dark:text-slate-100">Admin</option>
              </select>
            </div>
          </div>

          {/* 2. INSTITUTIONAL EMAIL Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono uppercase tracking-wider">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                type="email"
                required
                value={email}
                onChange={e => handleEmailChange(e.target.value)}
                placeholder="aarav.sharma@aaroh.edu.in"
                className="w-full text-xs font-mono pl-9 pr-3 py-2 bg-white/40 dark:bg-black/40 border border-slate-200/60 dark:border-white/10 backdrop-blur-md rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500 transition-colors"
              />
            </div>
          </div>

          {/* 3. PASSWORD Input */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="••••••••••••"
                className="w-full text-xs font-mono pl-9 pr-10 py-2 bg-white/40 dark:bg-black/40 border border-slate-200/60 dark:border-white/10 backdrop-blur-md rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 z-10 p-0.5 focus:outline-none cursor-pointer transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button: "Sign In ->" */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0D6861] active:bg-[#115E59] rounded-xl transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} disabled:opacity-50 select-none cursor-pointer`}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In ->'}</span>
          </button>
        </form>

        {/* Demo Quick Access Section */}
        <div className="space-y-2.5 pt-1 pb-1">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-mono">
              <span className="bg-white/80 dark:bg-[#18181B]/80 px-2 text-slate-400 dark:text-slate-500 rounded">
                or continue with demo
              </span>
            </div>
          </div>

          {/* Role Buttons Row */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              disabled={loading}
              className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-full transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 hover:border-teal-600 dark:hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-400 text-center active:scale-95 disabled:opacity-50 select-none cursor-pointer truncate"
            >
              Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('faculty')}
              disabled={loading}
              className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-full transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 hover:border-teal-600 dark:hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-400 text-center active:scale-95 disabled:opacity-50 select-none cursor-pointer truncate"
            >
              Faculty Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student')}
              disabled={loading}
              className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-full transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 hover:border-teal-600 dark:hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-400 text-center active:scale-95 disabled:opacity-50 select-none cursor-pointer truncate"
            >
              Student Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
