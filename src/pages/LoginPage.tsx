import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/ui/Logo';
import { Lock, Mail, AlertCircle, Eye, EyeOff, GraduationCap, Briefcase, Shield, Lightbulb, TrendingUp, Users, Volume2, VolumeX } from 'lucide-react';
import { getUserRoleFromEmail, generateUserFromEmail } from '../data/seed';
import { User, UserRole } from '../types';
import { APP_CONFIG } from '../config';
import { supabase } from '../lib/supabase';
import { StorageService } from '../services/storage';
import { CustomDropdown, CustomDropdownOption } from '../components/ui/CustomDropdown';

// Configurable Video Showcase Slot: easily swappable with any campus video asset
const CAMPUS_PREVIEW_VIDEO = '/campus-preview.mp4';

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
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mouse coordinate state for interactive blurred blobs
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Enforce Light Mode on Login Page: if dark theme is enabled in home page, do not show dark theme on login page
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
    return () => {
      if (typeof document !== 'undefined') {
        const savedTheme = localStorage.getItem('aaroh_theme');
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    };
  }, []);

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

  const cacheStudentAndLogin = (data: any, authPassword?: string, fallbackRoll?: string, fallbackEmail?: string) => {
    const roleStr = (data.role || '').toLowerCase();
    let resolvedRole: UserRole = 'student';
    if (roleStr.includes('admin')) {
      resolvedRole = 'admin';
    } else if (roleStr.includes('faculty')) {
      resolvedRole = 'faculty';
    } else {
      resolvedRole = 'student';
    }

    const roll = data.username || (data.email ? data.email.split('@')[0] : (fallbackRoll || ''));
    const emailAddr = data.email || (fallbackEmail ? fallbackEmail : `${roll.toLowerCase()}@aaroh.edu.in`);
    const pwd = authPassword || data.password || roll || 'Aaroh@Krmu#2026!Key';
    const fullName = data.full_name || data.name || (resolvedRole === 'admin' ? `Administrator ${roll}` : resolvedRole === 'faculty' ? `Prof. ${roll}` : `Student ${roll}`);

    const rawCourse = data.course || data.program || 'B.Tech CSE';
    const resolvedCourse = (rawCourse.trim().toLowerCase() === 'b.tech cse (ai/ml)' || rawCourse.trim().toLowerCase() === 'b.tech cse (ai & ml)')
      ? 'B.Tech CSE (AI & ML)'
      : rawCourse.trim();

    const userObj: User = {
      id: `usr_${roll.toLowerCase()}`,
      name: fullName,
      email: emailAddr.toLowerCase(),
      username: roll,
      password: pwd.trim(),
      role: resolvedRole,
      avatarInitials: fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
      department: data.department || (resolvedRole === 'admin' ? 'Central Administration' : 'Computer Science & Engineering'),
      designation: resolvedRole === 'student' ? 'Undergraduate Scholar' : (data.designation || (resolvedRole === 'admin' ? 'Campus Administrator' : 'Faculty Member')),
      rollNumber: roll,
      program: resolvedCourse,
      course: resolvedCourse,
      section: data.division ? `Section ${data.division}` : 'Section A',
      division: data.division || 'A',
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
        password: pwd.trim(),
        role: data.role || (resolvedRole === 'admin' ? 'Admin' : resolvedRole === 'faculty' ? 'Faculty' : 'Student'),
        full_name: fullName,
        course: resolvedCourse,
        division: data.division || 'A',
        designation: userObj.designation,
        department: userObj.department,
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

    let result = login(emailAddr.toLowerCase(), pwd);
    if (!result.success) {
      result = login(roll, pwd);
    }
    if (!result.success && fallbackEmail) {
      result = login(fallbackEmail, pwd);
    }

    setLoading(false);
    navigate(`/${resolvedRole}`);
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

    // 1. Native Supabase Auth Login with RLS-protected profile query
    if (supabase) {
      try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: password.trim(),
        });

        if (error || !authData?.user) {
          // Surface Supabase Auth error directly instead of silently leaving session null
          setLoading(false);
          setErrorMessage(error?.message || 'Access Denied: Unregistered credentials or invalid password.');
          return;
        }

        // Native Supabase Auth succeeded: auth session is stored in the browser (supabase.auth.getSession() is valid)
        // Fetch user's own RLS-protected profile from public.aaroh_users
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
            .or(`email.ilike.${normalizedEmail},username.ilike.${rollNumberInput}`)
            .maybeSingle();

          if (fallbackProfile) {
            userProfile = fallbackProfile;
            if (!fallbackProfile.auth_user_id) {
              await supabase
                .from('aaroh_users')
                .update({ auth_user_id: authData.user.id })
                .eq('id', fallbackProfile.id);
            }
          }
        }

        if (userProfile) {
          // Cache returned profile into localStorage for offline resilience and route
          cacheStudentAndLogin(userProfile, password.trim(), rollNumberInput, trimmedEmail);
          return;
        } else {
          await supabase.auth.signOut().catch(() => {});
          setLoading(false);
          setErrorMessage('Access Denied: User profile not found in university directory.');
          return;
        }
      } catch (err: any) {
        setLoading(false);
        setErrorMessage(err?.message || 'Authentication service error. Please try again.');
        return;
      }
    }

    // 2. Strict Offline Fallback Guard: only executed if Supabase is unconfigured
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
  const handleQuickDemoLogin = async (targetRole: UserRole) => {
    let demoEmail = 'aarav.sharma@aaroh.edu.in';
    const demoPassword = 'Aaroh@Krmu#2026!Key';

    if (targetRole === 'admin') {
      demoEmail = 'registrar@admin.aaroh.edu.in';
    } else if (targetRole === 'faculty') {
      demoEmail = 'prof.raman@faculty.aaroh.edu.in';
    }

    // If Admin Demo and Supabase is configured, sign in using live ADM001 credentials
    if (targetRole === 'admin' && supabase) {
      setSelectedRole('admin');
      setEmail('ADM001');
      setPassword('ADM001');
      setErrorMessage(null);
      setLoading(true);

      try {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: 'adm001@aaroh.edu.in',
          password: 'ADM001',
        });

        if (!error && authData?.user) {
          const { data: profile } = await supabase
            .from('aaroh_users')
            .select('*')
            .eq('auth_user_id', authData.user.id)
            .maybeSingle();

          const userProfile = profile || {
            username: 'ADM001',
            email: 'adm001@aaroh.edu.in',
            role: 'Admin',
            full_name: 'Dr. Ananya Sengupta',
            course: 'Central Administration',
            division: 'A',
          };

          cacheStudentAndLogin(userProfile, 'ADM001', 'ADM001', 'adm001@aaroh.edu.in');
          return;
        }
      } catch {
        // Fall back to offline demo admin if needed
      }
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
    <main
      role="main"
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full h-screen overflow-hidden flex flex-col lg:flex-row items-center justify-end lg:justify-between p-4 sm:p-6 lg:p-10 xl:p-14 relative bg-[#EEF4ED] dark:bg-[#0E0E11] font-sans select-none transition-colors duration-500 ease-in-out"
    >
      {/* 1. Global Campus Background: Converted from JPG to SVG format */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src="/campus.svg"
          alt="K.R. Mangalam University Campus"
          width={1920}
          height={1080}
          className="w-full h-full min-h-screen object-cover object-center"
        />
        {/* Scrim Overlay: Deep navy scrim on the left fading to light/transparent on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07172C]/95 via-[#0A2242]/85 to-[#0A2242]/20 dark:from-black/95 dark:via-black/85 dark:to-black/40 pointer-events-none" />

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

      {/* 2. Mobile Top Banner (visible on screens < lg) */}
      <div className="lg:hidden absolute top-4 left-4 z-30 pointer-events-none select-none">
        <img
          src="/krmu_banner.svg"
          alt="K.R. Mangalam University - The Complete World of Education - NAAC Grade A"
          width={460}
          height={90}
          className="w-[240px] xs:w-[280px] max-w-[75vw] h-auto object-contain block drop-shadow-md select-none pointer-events-none"
        />
      </div>

      {/* 3. Left Hero Showcase (matching reference screenshot layout) */}
      <div className="hidden lg:flex flex-col justify-center max-w-xl xl:max-w-2xl z-20 py-4 pr-6 animate-in fade-in slide-in-from-left-4 duration-700 ease-out">
        {/* Institutional Header Banner */}
        <div className="mb-5 pointer-events-none select-none">
          <img
            src="/krmu_banner.svg"
            alt="K.R. Mangalam University - The Complete World of Education - NAAC Grade A"
            width={460}
            height={90}
            className="w-[360px] xl:w-[460px] max-w-full h-auto object-contain block drop-shadow-md select-none pointer-events-none"
          />
        </div>

        {/* Tagline Badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-0.5 bg-amber-400 rounded-full" />
          <span className="text-xs uppercase font-mono tracking-widest text-slate-200 font-bold">
            WELCOME TO AAROH
          </span>
        </div>

        {/* Headline with 'Brighter Future' highlighted */}
        <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
          Shaping a <span className="text-amber-400">Brighter Future</span>
          <br />
          Through Quality Education.
        </h1>

        {/* 4 Icon Pillars: Learn, Innovate, Grow, Collaborate */}
        <div className="grid grid-cols-4 max-w-lg mb-5 border-y border-white/20 py-2.5 backdrop-blur-xs bg-white/5 rounded-xl">
          <div className="flex flex-col items-center justify-center text-center px-2 border-r border-white/20">
            <GraduationCap className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xs font-semibold text-white tracking-wide">Learn</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-2 border-r border-white/20">
            <Lightbulb className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xs font-semibold text-white tracking-wide">Innovate</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-2 border-r border-white/20">
            <TrendingUp className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xs font-semibold text-white tracking-wide">Grow</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-2">
            <Users className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-xs font-semibold text-white tracking-wide">Collaborate</span>
          </div>
        </div>

        {/* Video Preview Card: Autoplay, No Borders, Transparent/Blended with Mute/Unmute Control */}
        <div className="relative w-full max-w-lg rounded-2xl overflow-hidden border-none shadow-2xl bg-black/30 backdrop-blur-xs group">
          <video
            ref={videoRef}
            src={CAMPUS_PREVIEW_VIDEO}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            controls={false}
            preload="metadata"
            aria-label="K.R. Mangalam University Campus Preview"
            className="w-full h-auto aspect-video object-cover border-none outline-none block pointer-events-none select-none rounded-2xl"
          />
          {/* Tactile Audio Mute / Unmute Button */}
          <button
            type="button"
            onClick={() => {
              if (videoRef.current) {
                const nextMuted = !videoRef.current.muted;
                videoRef.current.muted = nextMuted;
                setIsMuted(nextMuted);
              }
            }}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 transition-all duration-150 active:scale-95 cursor-pointer z-10 focus:outline-none focus:ring-2 focus:ring-amber-400"
            title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            aria-label={isMuted ? 'Unmute campus preview video audio' : 'Mute campus preview video audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* 4. The Glassmorphism Login Card: Floating on the right matching reference layout */}
      <div className="relative z-20 w-full max-w-sm sm:w-[400px] lg:w-[420px] max-h-[96vh] py-6 sm:py-7 px-5 sm:px-7 bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-xl backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-white/10 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700 ease-out flex flex-col justify-center overflow-y-auto shrink-0 my-auto">
        {/* Form Section: Vertically balanced with generous breathing room */}
        <div className="my-auto flex flex-col space-y-3.5 sm:space-y-4 py-1">
          {/* Header: Logo, Aaroh, Subtitle, and Sign In heading */}
          <div className="flex flex-col items-center justify-center text-center space-y-0.5 pb-1">
            <div className="flex items-center justify-center gap-2">
              <Logo size="md" />
            </div>
            <div className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase font-mono pt-0.5" title="K.R. Mangalam University">
              K.R. MANGALAM UNIVERSITY
            </div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Sign In to Aaroh
            </h1>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-2.5 bg-rose-50/80 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-tight">{errorMessage}</span>
            </div>
          )}

          {/* Login Form: Clear, spacious separation between all input boxes */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-3.5 sm:space-y-4">
            {/* 1. ROLE Dropdown */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                ROLE
              </label>
              <div className="relative">
                {/* Visual Custom Dropdown */}
                <CustomDropdown<UserRole>
                  value={selectedRole}
                  onChange={(r) => handleRoleChange(r)}
                  options={roleOptions}
                  buttonClassName="bg-white/70 dark:bg-black/60 border-slate-200/80 dark:border-white/10 py-2"
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

            {/* 2. INSTITUTIONAL EMAIL / ROLL NUMBER Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                ROLL NUMBER OR INSTITUTIONAL EMAIL
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  placeholder="e.g. 2601010006 or aarav.sharma@aaroh.edu.in"
                  className="w-full min-h-[40px] sm:min-h-[42px] text-xs font-mono pl-9 pr-3 py-2 bg-white/80 dark:bg-black/70 border border-slate-200/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#134074] dark:focus:ring-[#8DA9C4] transition-colors shadow-xs"
                />
              </div>
            </div>

            {/* 3. PASSWORD Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-mono uppercase tracking-wider">
                PASSWORD
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
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
                  className="w-full min-h-[40px] sm:min-h-[42px] text-xs font-mono pl-9 pr-10 py-2 bg-white/80 dark:bg-black/70 border border-slate-200/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#134074] dark:focus:ring-[#8DA9C4] transition-colors shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 z-10 focus:outline-none cursor-pointer transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Primary Action Button: "Sign In ->" */}
            <div className="pt-2 sm:pt-2.5">
              <button
                type="submit"
                disabled={loading}
                className={`w-full min-h-[42px] sm:min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] border border-[#8DA9C4]/30 rounded-xl transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} disabled:opacity-50 select-none cursor-pointer`}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In ->'}</span>
              </button>
            </div>
          </form>

          {/* Demo Quick Access Section with generous vertical spacing above and below */}
          <div className="pt-4 sm:pt-5 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-wider font-mono">
                <span className="bg-[#E2E8F0]/90 dark:bg-[#18181B]/90 px-3 py-0.5 text-slate-500 dark:text-slate-400 rounded-full font-bold">
                  or continue with demo
                </span>
              </div>
            </div>

            {/* Role Buttons Row: student faculty admin in this order with clear spacing from divider */}
            <div className="grid grid-cols-3 gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                disabled={loading}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-full transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 min-h-[38px] flex items-center justify-center hover:border-[#134074] dark:hover:border-[#8DA9C4] hover:text-[#134074] dark:hover:text-[#8DA9C4] text-center active:scale-95 disabled:opacity-50 select-none cursor-pointer truncate shadow-2xs"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('faculty')}
                disabled={loading}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-full transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 min-h-[38px] flex items-center justify-center hover:border-[#134074] dark:hover:border-[#8DA9C4] hover:text-[#134074] dark:hover:text-[#8DA9C4] text-center active:scale-95 disabled:opacity-50 select-none cursor-pointer truncate shadow-2xs"
              >
                Faculty Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                disabled={loading}
                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-full transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 min-h-[38px] flex items-center justify-center hover:border-[#134074] dark:hover:border-[#8DA9C4] hover:text-[#134074] dark:hover:text-[#8DA9C4] text-center active:scale-95 disabled:opacity-50 select-none cursor-pointer truncate shadow-2xs"
              >
                Admin Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
