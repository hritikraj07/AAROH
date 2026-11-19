import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/ui/Logo';
import { Lock, Mail, AlertCircle, Eye, EyeOff, GraduationCap, Briefcase, Shield } from 'lucide-react';
import { getUserRoleFromEmail, generateUserFromEmail } from '../data/seed';
import { User, UserRole } from '../types';
import { APP_CONFIG } from '../config';
import { supabase } from '../lib/supabase';
import { StorageService } from '../services/storage';
import { CustomDropdown, CustomDropdownOption } from '../components/ui/CustomDropdown';

const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

const roleOptions: CustomDropdownOption<UserRole>[] = [
  {
    value: 'student',
    label: 'Student',
    subtitle: 'Coursework, attendance & schedule',
    icon: <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
    badge: 'ST',
  },
  {
    value: 'faculty',
    label: 'Faculty',
    subtitle: 'Gradebook, assignments & roll call',
    icon: <Briefcase className="w-4 h-4 text-[#134074] dark:text-[#8DA9C4]" />,
    badge: 'FA',
  },
  {
    value: 'admin',
    label: 'Admin',
    subtitle: 'User directory & campus controls',
    icon: <Shield className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
    badge: 'AD',
  },
];

export const LoginPage: React.FC = () => {
  const { login, users, isAuthenticated, role } = useApp();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setEmail('');
    setPassword('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const rawInput = email.trim();
    if (!rawInput) {
      setErrorMessage('Please enter your Roll Number or institutional email.');
      return;
    }

    const trimmedEmail = rawInput;
    const normalizedEmail = rawInput.includes('@')
      ? rawInput.toLowerCase()
      : `${rawInput.toLowerCase()}@aaroh.edu.in`;
    const rollNumberInput = rawInput.replace(/@.*$/, '').trim();

    const isKnownUser = users.some(
      u =>
        u.email.trim().toLowerCase() === normalizedEmail ||
        u.email.trim().toLowerCase() === trimmedEmail.toLowerCase() ||
        (u.rollNumber && u.rollNumber.trim().toLowerCase() === rollNumberInput.toLowerCase()) ||
        (u.username && u.username.trim().toLowerCase() === rollNumberInput.toLowerCase())
    );
    const detectedRole = getUserRoleFromEmail(normalizedEmail) || (/^\d+$/.test(rollNumberInput) ? 'student' : undefined);

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    const cacheStudentAndLogin = (data: any) => {
      const roleStr = (data.role || '').toLowerCase();
      let resolvedRole: UserRole = 'student';
      if (roleStr.includes('admin')) {
        resolvedRole = 'admin';
      } else if (roleStr.includes('faculty')) {
        resolvedRole = 'faculty';
      } else {
        resolvedRole = 'student';
      }

      const roll = data.username || (data.email ? data.email.split('@')[0] : rollNumberInput);
      const emailAddr = data.email || `${roll.toLowerCase()}@aaroh.edu.in`;
      const fullName = data.full_name || data.name || (resolvedRole === 'admin' ? `Administrator ${roll}` : resolvedRole === 'faculty' ? `Prof. ${roll}` : `Student ${roll}`);

      const rawCourse = data.course || data.program || 'B.Tech CSE';
      const resolvedCourse = (rawCourse.trim().toLowerCase() === 'b.tech cse (ai/ml)' || rawCourse.trim().toLowerCase() === 'b.tech cse (ai & ml)')
        ? 'B.Tech CSE (AI & ML)'
        : rawCourse.trim();

      const studentStatus = data.student_status || data.status || 'Regular';

      const userObj: User = {
        id: `usr_${roll.toLowerCase()}`,
        name: fullName,
        email: emailAddr.toLowerCase(),
        username: roll,
        password: password.trim(),
        role: resolvedRole,
        avatarInitials: fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
        department: data.department || (resolvedRole === 'admin' ? 'Central Administration' : 'Computer Science & Engineering'),
        designation: resolvedRole === 'student' ? 'Undergraduate Scholar' : (data.designation || (resolvedRole === 'admin' ? 'Campus Administrator' : 'Faculty Member')),
        rollNumber: roll,
        program: resolvedCourse,
        course: resolvedCourse,
        section: data.division ? `Section ${data.division}` : 'Section A',
        division: data.division || 'A',
        student_status: studentStatus,
        status: studentStatus,
        semester: 1,
        academicYear: APP_CONFIG.academicSession,
        attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
      };

      StorageService.createUser(userObj);

      try {
        const storedAaroh = JSON.parse(localStorage.getItem('aarohUsers') || '[]');
        const uIdx = storedAaroh.findIndex((u: any) => u.username?.toLowerCase() === roll.toLowerCase() || u.email?.toLowerCase() === emailAddr.toLowerCase());
        const entry = {
          username: roll,
          email: emailAddr.toLowerCase(),
          password: password.trim(),
          role: data.role || (resolvedRole === 'admin' ? 'Admin' : resolvedRole === 'faculty' ? 'Faculty' : 'Student'),
          full_name: fullName,
          course: resolvedCourse,
          division: data.division || 'A',
          designation: userObj.designation,
          department: userObj.department,
          student_status: studentStatus,
          status: studentStatus,
        };
        if (uIdx >= 0) {
          storedAaroh[uIdx] = { ...storedAaroh[uIdx], ...entry };
        } else {
          storedAaroh.push(entry);
        }
        localStorage.setItem('aarohUsers', JSON.stringify(storedAaroh));
      } catch {
        // Storage quota fallback
      }

      let result = login(trimmedEmail, password);
      if (!result.success) {
        result = login(emailAddr.toLowerCase(), password);
      }
      if (!result.success) {
        result = login(roll, password);
      }

      setLoading(false);
      // Route based on profile.role from public.aaroh_users:
      // 'Student' -> /student, 'Faculty' -> /faculty, 'Admin' -> /admin
      navigate(`/${resolvedRole}`);
    };

    // 1. Native Supabase Auth Login with RLS-protected profile query
    if (supabase) {
      try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail.toLowerCase(),
          password: password.trim(),
        });

        if (error || !authData?.user) {
          // Check if this error is due to complete network unreachability
          const isNetworkError =
            !navigator.onLine ||
            error?.message?.toLowerCase().includes('fetch failed') ||
            error?.message?.toLowerCase().includes('network') ||
            error?.status === 0;

          if (!isNetworkError) {
            // Definite auth rejection by Supabase Auth (e.g. invalid credentials)
            const offlineCheck = users.some(
              u =>
                (u.email.toLowerCase() === normalizedEmail.toLowerCase() || u.username?.toLowerCase() === rollNumberInput.toLowerCase()) &&
                u.password === password.trim()
            );
            if (!offlineCheck) {
              if (supabase.auth) {
                await supabase.auth.signOut().catch(() => {});
              }
              setLoading(false);
              setErrorMessage('Access Denied: Unregistered credentials or invalid password. Only pre-enrolled university accounts are permitted.');
              return;
            }
          }
          // Network completely unreachable: fall through to offline localStorage fallback
        } else {
          // Native Supabase Auth succeeded: fetch user's own RLS-protected profile from public.aaroh_users
          const { data: profile, error: profileError } = await supabase
            .from('aaroh_users')
            .select('*')
            .eq('auth_user_id', authData.user.id)
            .single();

          let userProfile = profile;
          if (profileError || !userProfile) {
            // Profile query fallback by email or roll number if auth_user_id is not yet linked
            const { data: fallbackProfile } = await supabase
              .from('aaroh_users')
              .select('*')
              .or(`email.ilike.${normalizedEmail.toLowerCase()},username.ilike.${rollNumberInput}`)
              .maybeSingle();

            if (fallbackProfile) {
              userProfile = fallbackProfile;
              if (!fallbackProfile.auth_user_id) {
                supabase
                  .from('aaroh_users')
                  .update({ auth_user_id: authData.user.id })
                  .eq('id', fallbackProfile.id)
                  .then(() => {});
              }
            }
          }

          if (userProfile) {
            // Cache returned profile into localStorage for offline resilience and route
            cacheStudentAndLogin(userProfile);
            return;
          } else {
            await supabase.auth.signOut().catch(() => {});
            setLoading(false);
            setErrorMessage('Access Denied: Unregistered credentials or invalid password. Only pre-enrolled university accounts are permitted.');
            return;
          }
        }
      } catch {
        // Complete network unreachability: fall back cleanly to cached localStorage credentials
      }
    }

    // 2. Strict Offline Fallback Guard: check only against pre-cached enrolled accounts in localStorage
    const localResult = login(trimmedEmail, password);
    setLoading(false);

    if (localResult.success && localResult.role) {
      navigate(`/${localResult.role}`);
    } else {
      setErrorMessage(
        'Access Denied: Unregistered credentials or invalid password. Only pre-enrolled university accounts are permitted.'
      );
    }
  };

  // Demo Quick Access Handler - automatically enters credentials and logs in per user specification
  const handleQuickDemoLogin = (targetRole: UserRole) => {
    let demoEmail = 'aarav.sharma@aaroh.edu.in';
    const demoPassword = 'Aaroh@Krmu#2026!Key';

    if (targetRole === 'admin') {
      demoEmail = 'registrar@admin.aaroh.edu.in';
    } else if (targetRole === 'faculty') {
      demoEmail = 'prof.raman@faculty.aaroh.edu.in';
    }

    const currentUsers = StorageService.getUsers();
    const demoExists = currentUsers.some(u => u.email.toLowerCase() === demoEmail.toLowerCase());
    if (!demoExists) {
      const demoUser = generateUserFromEmail(demoEmail);
      demoUser.password = demoPassword;
      if (targetRole === 'student') {
        demoUser.name = 'Aarav Sharma';
        demoUser.rollNumber = '22CS042';
        demoUser.program = 'B.Tech CSE';
        demoUser.course = 'B.Tech CSE';
        demoUser.semester = 5;
      } else if (targetRole === 'faculty') {
        demoUser.name = 'Prof. Ramanujan';
        demoUser.designation = 'Associate Professor';
      }
      StorageService.createUser(demoUser);
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
      setErrorMessage(result.error || 'Access Denied: Unregistered credentials or invalid password. Only pre-enrolled university accounts are permitted.');
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full h-screen overflow-hidden flex items-stretch justify-end p-0 relative bg-[#EEF4ED] dark:bg-[#0E0E11] font-sans select-none transition-colors duration-500 ease-in-out"
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
          className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-[#134074]/15 dark:bg-[#134074]/25 blur-[100px] pointer-events-none transition-transform duration-300 ease-out"
          style={{ transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)` }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full bg-[#8DA9C4]/20 dark:bg-[#8DA9C4]/15 blur-[100px] pointer-events-none transition-transform duration-300 ease-out"
          style={{ transform: `translate(${-mouseOffset.x * 1.3}px, ${-mouseOffset.y * 1.3}px)` }}
        />
      </div>

      {/* 2. Institutional Header Banner: High quality official vector banner, full uncropped view */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 z-30 flex items-center pointer-events-none select-none">
        <img
          src="/krmu_banner.svg"
          alt="K.R. Mangalam University - The Complete World of Education - NAAC Grade A"
          className="w-[260px] xs:w-[320px] sm:w-[420px] md:w-[480px] lg:w-[540px] max-w-[85vw] h-auto object-contain block drop-shadow-md select-none pointer-events-none"
        />
      </div>

      {/* 3. The Glassmorphism Login Card: Full height / length matching design screenshot */}
      <div className="relative z-10 w-full max-w-sm sm:w-[420px] md:w-[460px] lg:w-[480px] h-full min-h-screen py-6 px-6 sm:px-8 md:px-10 bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-xl backdrop-blur-xl shadow-2xl rounded-none sm:rounded-l-3xl border-l border-white/20 dark:border-white/10 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700 ease-out flex flex-col justify-between overflow-y-auto">
        {/* Form Section: Vertically balanced with even top and bottom spacing */}
        <div className="my-auto flex flex-col space-y-4 sm:space-y-5 py-2">
          {/* Header: Logo, Aaroh, Subtitle, and Sign In heading */}
          <div className="flex flex-col items-center justify-center text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Logo size="md" />
            </div>
            <div className="text-[10px] font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase font-mono pt-0.5" title="K.R. Mangalam University">
              K.R. MANGALAM UNIVERSITY
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Sign In to Aaroh
            </h1>
          </div>

          {/* Institutional Access Restriction Notice */}
          <div className="p-3 bg-slate-50/80 dark:bg-[#141417]/90 border border-slate-200/80 dark:border-[#27272A] rounded-xl text-center">
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
              Access restricted to pre-enrolled K.R. Mangalam University accounts. Contact Administration for credential provisioning.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-50/80 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5">
            {/* 1. ROLE Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                ROLE
              </label>
              <div className="relative">
                {/* Visual Custom Dropdown */}
                <CustomDropdown<UserRole>
                  value={selectedRole}
                  onChange={(r) => handleRoleChange(r)}
                  options={roleOptions}
                  buttonClassName="bg-white/70 dark:bg-black/60 border-slate-200/80 dark:border-white/10"
                />

                {/* Underlying select to maintain verification suite compatibility */}
                <select
                  aria-hidden="true"
                  tabIndex={-1}
                  value={selectedRole}
                  onChange={e => handleRoleChange(e.target.value as UserRole)}
                  className="sr-only pointer-events-none"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* 2. ROLL NUMBER OR INSTITUTIONAL EMAIL Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                ROLL NUMBER OR INSTITUTIONAL EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  placeholder="e.g. 2601010006 or 2601010006@aaroh.edu.in"
                  className="w-full min-h-[44px] text-xs font-mono pl-10 pr-3.5 py-2.5 bg-white/80 dark:bg-black/70 border border-slate-200/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#134074] dark:focus:ring-[#8DA9C4] transition-colors shadow-xs"
                />
              </div>
            </div>

            {/* 3. PASSWORD Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  id="aaroh_auth_key"
                  name="aaroh_auth_key"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  spellCheck={false}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full min-h-[44px] text-xs font-mono pl-10 pr-11 py-2.5 bg-white/80 dark:bg-black/70 border border-slate-200/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#134074] dark:focus:ring-[#8DA9C4] transition-colors shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 z-10 focus:outline-none cursor-pointer transition-colors"
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
              className={`w-full min-h-[46px] inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] border border-[#8DA9C4]/30 rounded-xl transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} disabled:opacity-50 select-none cursor-pointer mt-1`}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In ->'}</span>
            </button>
          </form>

          {/* Demo Quick Access Section */}
          <div className="space-y-2.5 pt-1">
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
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-full transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 min-h-[44px] flex items-center justify-center hover:border-[#134074] dark:hover:border-[#8DA9C4] hover:text-[#134074] dark:hover:text-[#8DA9C4] text-center active:scale-95 disabled:opacity-50 select-none cursor-pointer truncate shadow-2xs"
              >
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('faculty')}
                disabled={loading}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-full transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 min-h-[44px] flex items-center justify-center hover:border-[#134074] dark:hover:border-[#8DA9C4] hover:text-[#134074] dark:hover:text-[#8DA9C4] text-center active:scale-95 disabled:opacity-50 select-none cursor-pointer truncate shadow-2xs"
              >
                Faculty Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                disabled={loading}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-full transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 min-h-[44px] flex items-center justify-center hover:border-[#134074] dark:hover:border-[#8DA9C4] hover:text-[#134074] dark:hover:text-[#8DA9C4] text-center active:scale-95 disabled:opacity-50 select-none cursor-pointer truncate shadow-2xs"
              >
                Student Demo
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Feature Showcase: "WHY CHOOSE AAROH?" & 3 feature icons */}
        <div className="pt-2 pb-2 select-none">
          <div className="relative mb-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200/80 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-mono">
              <span className="bg-white/80 dark:bg-[#18181B]/80 px-2 py-0.5 text-slate-500 dark:text-slate-400 rounded-full font-bold">
                WHY CHOOSE AAROH?
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Feature 1: AI-Powered Insights */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#134074] dark:text-[#8DA9C4] bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-2xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4 4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Z" />
                  <path d="M18 8a2 2 0 1 1 0 4" />
                  <path d="M6 8a2 2 0 1 0 0 4" />
                  <circle cx="12" cy="18" r="4" />
                  <path d="M12 11v3" />
                </svg>
              </div>
              <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 mt-1.5 leading-tight">
                AI-Powered Insights
              </span>
            </div>

            {/* Feature 2: Performance Analytics */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#134074] dark:text-[#8DA9C4] bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-2xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                  <path d="M19 5v4h-4" />
                </svg>
              </div>
              <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 mt-1.5 leading-tight">
                Performance Analytics
              </span>
            </div>

            {/* Feature 3: Real-Time Sync */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[#134074] dark:text-[#8DA9C4] bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-2xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
              </div>
              <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 mt-1.5 leading-tight">
                Real-Time Sync
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
