import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/ui/Logo';
import {
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  GraduationCap,
  Briefcase,
  Shield,
  Lightbulb,
  TrendingUp,
  Users,
  Volume2,
  VolumeX,
  ArrowRight,
  QrCode,
  Code2,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Check
} from 'lucide-react';
import { getUserRoleFromEmail, generateUserFromEmail } from '../data/seed';
import { User, UserRole } from '../types';
import { APP_CONFIG } from '../config';
import { supabase } from '../lib/supabase';
import { StorageService } from '../services/storage';
import { CustomDropdown, CustomDropdownOption } from '../components/ui/CustomDropdown';

// Configurable Video Showcase Slot
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

  // Landing Page Interactive State
  const [previewRole, setPreviewRole] = useState<UserRole>('student');
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  // Mouse coordinate state for interactive blurred blobs
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Enforce Light Mode on Login Page
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
          setLoading(false);
          setErrorMessage(error?.message || 'Access Denied: Unregistered credentials or invalid password.');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('aaroh_users')
          .select('*')
          .eq('auth_user_id', authData.user.id)
          .single();

        let userProfile = profile;
        if (profileError || !userProfile) {
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

    // 2. Strict Offline Fallback Guard
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

  const handleQuickDemoLogin = async (targetRole: UserRole) => {
    let demoEmail = 'aarav.sharma@aaroh.edu.in';
    const demoPassword = 'Aaroh@Krmu#2026!Key';

    if (targetRole === 'admin') {
      demoEmail = 'registrar@admin.aaroh.edu.in';
    } else if (targetRole === 'faculty') {
      demoEmail = 'prof.raman@faculty.aaroh.edu.in';
    }

    // Sign in using live credentials if available in Supabase
    if (supabase && targetRole === 'admin') {
      try {
        setLoading(true);
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: 'adm001@aaroh.edu.in',
          password: 'Aaroh@Krmu#2026!Key',
        });
        if (!error && authData?.user) {
          const { data: profile } = await supabase
            .from('aaroh_users')
            .select('*')
            .eq('auth_user_id', authData.user.id)
            .single();

          if (profile) {
            cacheStudentAndLogin(profile, 'Aaroh@Krmu#2026!Key', 'ADM001', 'adm001@aaroh.edu.in');
            return;
          }
        }
      } catch {
        // Fallback to local admin
      } finally {
        setLoading(false);
      }
    }

    let demoUser = users.find(u => u.role === targetRole);
    if (demoUser) {
      demoEmail = demoUser.email;
    } else {
      const generated = generateUserFromEmail(demoEmail);
      demoUser = {
        ...generated,
        password: demoPassword,
      };
      if (targetRole === 'admin') {
        demoUser.name = 'Registrar Office';
        demoUser.designation = 'Chief Academic Administrator';
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
      className="min-h-screen w-full relative bg-[#F4F7F5] dark:bg-[#0E0E11] font-sans transition-colors duration-500 ease-in-out flex flex-col justify-start overflow-hidden"
    >
      {/* Background Ambience: Campus SVG & Interactive Light Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <img
          src="/campus.svg"
          alt="K.R. Mangalam University Campus"
          width={1920}
          height={1080}
          className="w-full h-full object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F4F7F5]/90 via-[#F4F7F5]/95 to-[#F4F7F5] pointer-events-none" />

        {/* Ambient Interactive Shifting Blobs */}
        <div
          className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-[#485C7A]/10 blur-[100px] pointer-events-none transition-transform duration-300 ease-out"
          style={{ transform: `translate(${mouseOffset.x}px, ${mouseOffset.y}px)` }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[480px] h-[480px] rounded-full bg-[#D0C4B3]/20 blur-[100px] pointer-events-none transition-transform duration-300 ease-out"
          style={{ transform: `translate(${-mouseOffset.x * 1.3}px, ${-mouseOffset.y * 1.3}px)` }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/krmu_banner.svg"
            alt="K.R. Mangalam University - The Complete World of Education - NAAC Grade A"
            width={460}
            height={90}
            className="w-[200px] sm:w-[260px] md:w-[300px] h-auto object-contain block drop-shadow-xs select-none"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsSignInModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0F2544] hover:bg-[#1E3A5F] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Main Content Container: Hero & Bento Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col space-y-8 sm:space-y-10 overflow-y-auto max-h-[calc(100vh-80px)]">
        
        {/* SECTION 1: INTERACTIVE HERO (Above the Fold) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Headline, Subtitle & Primary Actions */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-left-4 duration-500 ease-out">
            {/* Top Live Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#15803D]" />
              </span>
              <span className="text-xs font-semibold text-emerald-800 tracking-wide">
                K.R. Mangalam University • 2026-2027 Academic Portal
              </span>
            </div>

            {/* Crisp Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F2544] tracking-tight leading-[1.15]">
              One Unified Campus Portal for <span className="text-[#1D4ED8]">Academic Excellence.</span>
            </h1>

            {/* Concise 2-line Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Consolidating real-time lecture timetables, statutory attendance monitoring, automated coding laboratories, and university circulars into one role-secured platform.
            </p>

            {/* Primary Action Button & Quick Demos */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsSignInModalOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0F2544] text-white font-semibold text-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider px-1">or test drive:</span>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('student')}
                  className="px-3 py-2 rounded-xl bg-white border border-[#E5ECE8] text-xs font-semibold text-slate-700 hover:text-[#0F2544] hover:bg-slate-50 transition-all duration-150 active:scale-95 shadow-2xs"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('faculty')}
                  className="px-3 py-2 rounded-xl bg-white border border-[#E5ECE8] text-xs font-semibold text-slate-700 hover:text-[#0F2544] hover:bg-slate-50 transition-all duration-150 active:scale-95 shadow-2xs"
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="px-3 py-2 rounded-xl bg-white border border-[#E5ECE8] text-xs font-semibold text-slate-700 hover:text-[#0F2544] hover:bg-slate-50 transition-all duration-150 active:scale-95 shadow-2xs"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Micro Stats Strip */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200/80 w-full max-w-lg">
              <div>
                <div className="text-lg sm:text-xl font-bold text-[#0F2544] tabular-nums">1,110</div>
                <div className="text-xs text-slate-500 font-medium">Verified Accounts</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-[#15803D] tabular-nums">75%</div>
                <div className="text-xs text-slate-500 font-medium">Statutory Compliance</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-[#1D4ED8] tabular-nums">100%</div>
                <div className="text-xs text-slate-500 font-medium">Digital Workspaces</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Role-Preview Card with /krmu-campus.jpg */}
          <div className="lg:col-span-5 relative w-full animate-in fade-in zoom-in-95 duration-500 ease-out">
            <div className="relative w-full rounded-2xl overflow-hidden border border-[#E5ECE8] shadow-lg bg-white">
              {/* Framed Backdrop Photo */}
              <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-100">
                <img
                  src="/krmu-campus.jpg"
                  alt="K.R. Mangalam University Campus"
                  width={800}
                  height={500}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    // Graceful fallback background color if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2544]/90 via-[#0F2544]/30 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                  KRMU Main Campus
                </div>
              </div>

              {/* Segmented Tab Switcher */}
              <div className="p-4 sm:p-5 flex flex-col space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Portal Previews</span>
                  <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPreviewRole('student')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        previewRole === 'student'
                          ? 'bg-white text-[#0F2544] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewRole('faculty')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        previewRole === 'faculty'
                          ? 'bg-white text-[#0F2544] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Faculty
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewRole('admin')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        previewRole === 'admin'
                          ? 'bg-white text-[#0F2544] shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>

                {/* Role Specific Cross-Fading Preview Content */}
                <div className="min-h-[140px] flex flex-col justify-between space-y-3">
                  {previewRole === 'student' && (
                    <div className="flex flex-col space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F7F5] border border-[#E5ECE8]">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                          <span className="text-xs font-medium text-slate-700">Attendance Standing</span>
                        </div>
                        <span className="text-xs font-bold text-[#15803D] bg-emerald-100/60 px-2 py-0.5 rounded-md">87.5% (Safe)</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F7F5] border border-[#E5ECE8]">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#1D4ED8]" />
                          <span className="text-xs font-medium text-slate-700">Next Scheduled Lecture</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-800">AI & ML • Room 402</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F7F5] border border-[#E5ECE8]">
                        <div className="flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-slate-700">Automated Coding Labs</span>
                        </div>
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">Unit 2: Active</span>
                      </div>
                    </div>
                  )}

                  {previewRole === 'faculty' && (
                    <div className="flex flex-col space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F7F5] border border-[#E5ECE8]">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-[#15803D]" />
                          <span className="text-xs font-medium text-slate-700">Active Roll Call Session</span>
                        </div>
                        <span className="text-xs font-bold text-[#15803D] bg-emerald-100/60 px-2 py-0.5 rounded-md">QR Generated</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F7F5] border border-[#E5ECE8]">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#134074]" />
                          <span className="text-xs font-medium text-slate-700">Assigned Cohort</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-800">B.Tech CSE (Sec D)</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F7F5] border border-[#E5ECE8]">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-medium text-slate-700">Gradebook Review</span>
                        </div>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">42 Submissions</span>
                      </div>
                    </div>
                  )}

                  {previewRole === 'admin' && (
                    <div className="flex flex-col space-y-2.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F7F5] border border-[#E5ECE8]">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#0F2544]" />
                          <span className="text-xs font-medium text-slate-700">Campus Directory</span>
                        </div>
                        <span className="text-xs font-bold text-[#0F2544] bg-slate-200 px-2 py-0.5 rounded-md">1,110 Accounts</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F7F5] border border-[#E5ECE8]">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#1D4ED8]" />
                          <span className="text-xs font-medium text-slate-700">Master Timetable</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-800">Mon-Sat Matrix</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F7F5] border border-[#E5ECE8]">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                          <span className="text-xs font-medium text-slate-700">Cloud Data Sync</span>
                        </div>
                        <span className="text-xs font-bold text-[#15803D] bg-emerald-100/60 px-2 py-0.5 rounded-md">Operational</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin(previewRole)}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-150 active:scale-98 cursor-pointer"
                  >
                    <span>Launch {previewRole.charAt(0).toUpperCase() + previewRole.slice(1)} Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: INTERACTIVE FEATURE BENTO GRID (Hover Micro-Demos) */}
        <div className="pt-2">
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0F2544] tracking-tight">Core Institutional Capabilities</h2>
            <p className="text-xs sm:text-sm text-slate-500">Interactive live micro-previews: hover over each module to explore feature behavior.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-6">
            {/* Bento Card 1: QR Attendance */}
            <div className="group bg-white rounded-2xl border border-[#E5ECE8] p-5 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#15803D] mb-3">
                  <QrCode className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0F2544] mb-1">Dynamic QR Attendance</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Time-expiring lecture hall roll call with instant attendance threshold calculation.
                </p>
              </div>

              {/* Minimalist Stylized QR Box with Hover Scanning Line */}
              <div className="relative w-full h-32 rounded-xl bg-[#F4F7F5] border border-[#E5ECE8] flex flex-col items-center justify-center overflow-hidden p-3">
                <div className="relative w-16 h-16 border-2 border-slate-300 rounded-lg p-1 flex items-center justify-center bg-white shadow-2xs">
                  <QrCode className="w-full h-full text-slate-700" />
                  {/* Gliding Emerald Scan Line on Hover */}
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-[#15803D] shadow-[0_0_8px_rgba(21,128,61,0.8)] -translate-y-2 group-hover:translate-y-16 transition-transform duration-700 ease-in-out pointer-events-none" />
                </div>

                {/* Marked Present Pill */}
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-[#15803D] transition-colors duration-200">
                  <Check className="w-3.5 h-3.5" />
                  <span>Marked Present</span>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Automated Coding Labs */}
            <div className="group bg-white rounded-2xl border border-[#E5ECE8] p-5 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1D4ED8] mb-3">
                  <Code2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0F2544] mb-1">Automated Coding Labs</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  In-browser Monaco editor workspace with automated test runners and anti-cheat monitors.
                </p>
              </div>

              {/* Compact Code Check Preview */}
              <div className="relative w-full h-32 rounded-xl bg-[#1E2530] text-slate-300 font-mono text-[11px] p-3 flex flex-col justify-between border border-slate-700/60 overflow-hidden">
                <div>
                  <div className="text-slate-500 text-[10px] mb-1">// Python Automated Suite</div>
                  <div className="text-blue-300">def evaluate_solution(arr):</div>
                  <div className="text-emerald-400 pl-3">return sorted(set(arr))</div>
                </div>

                {/* All Tests Passed Badge: Smooth Scale & Fade in on Hover */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                  <span className="text-[10px] text-slate-400">Status:</span>
                  <div className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#15803D] text-white text-[10px] font-bold shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>All Tests Passed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Unified Campus Search */}
            <div className="group bg-white rounded-2xl border border-[#E5ECE8] p-5 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-3">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0F2544] mb-1">Unified Campus Search</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Fast command palette providing instant autocomplete across courses, notices, and tickets.
                </p>
              </div>

              {/* Mock Pill Search Bar & Elevating Sample Dropdown Item */}
              <div className="relative w-full h-32 rounded-xl bg-[#F4F7F5] border border-[#E5ECE8] p-3 flex flex-col justify-between overflow-hidden">
                {/* Mock Search Bar */}
                <div className="w-full px-3 py-1.5 rounded-full bg-white border border-slate-200 flex items-center justify-between text-xs text-slate-400 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span>Search notices, events...</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-100 rounded text-slate-500 font-mono font-semibold">Ctrl + K</kbd>
                </div>

                {/* Sample Dropdown Item: Elevates on Card Hover */}
                <div className="p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs group-hover:border-[#1D4ED8]/40 group-hover:bg-[#1D4ED8]/5 group-hover:-translate-y-0.5 group-hover:shadow-xs transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                    <span className="font-semibold text-slate-700 group-hover:text-[#0F2544]">B.Tech Timetable • Sem 5</span>
                  </div>
                  <span className="text-[10px] text-slate-400 group-hover:text-[#1D4ED8] font-mono">Navigate -&gt;</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: INSTITUTIONAL SIGN IN MODAL / DIALOG */}
      {isSignInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end sm:justify-end p-4 sm:p-6 lg:p-10 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          {/* Glassmorphic Login Card */}
          <div className="relative z-20 w-full max-w-sm sm:w-[400px] lg:w-[420px] max-h-[96vh] py-6 sm:py-7 px-5 sm:px-7 bg-white/30 dark:bg-black/30 backdrop-blur-md shadow-xl backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20 dark:border-white/10 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700 ease-out flex flex-col justify-center overflow-y-auto shrink-0 my-auto">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsSignInModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/60 hover:bg-white text-slate-600 transition-colors cursor-pointer"
              aria-label="Close Sign In Dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Form Section */}
            <div className="my-auto flex flex-col space-y-3.5 sm:space-y-4 py-1">
              {/* Header */}
              <div className="flex flex-col items-center justify-center text-center space-y-0.5 pb-1">
                <div className="flex items-center justify-center gap-2">
                  <Logo size="md" />
                  <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">Aaroh</span>
                </div>
                <p className="text-[11px] font-mono tracking-widest text-slate-600 uppercase font-semibold">
                  K.R. MANGALAM UNIVERSITY
                </p>
                <h2 className="text-lg font-bold text-slate-900 pt-1">Sign In to Aaroh</h2>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-2 text-red-900 text-xs animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
                {/* Role Selector */}
                <div>
                  <label htmlFor="role-select" className="block text-[11px] font-bold text-slate-700 tracking-wider mb-1 uppercase font-mono">
                    ROLE
                  </label>
                  <CustomDropdown
                    options={roleOptions}
                    value={selectedRole}
                    onChange={handleRoleChange}
                    aria-label="Role"
                  />
                  {/* Accessible fallback select */}
                  <select
                    id="role-select"
                    value={selectedRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <option value="student">student</option>
                    <option value="faculty">faculty</option>
                    <option value="admin">admin</option>
                  </select>
                </div>

                {/* Roll Number or Email */}
                <div>
                  <label htmlFor="email-input" className="block text-[11px] font-bold text-slate-700 tracking-wider mb-1 uppercase font-mono">
                    ROLL NUMBER OR INSTITUTIONAL EMAIL
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="email-input"
                      type="text"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="e.g. 2601010006 or aarav.sharma@aaroh.edu.in"
                      className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#134074] text-slate-900 placeholder:text-slate-400 transition-all shadow-xs"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Password Input with Eye/EyeOff toggle */}
                <div>
                  <label htmlFor="password-input" className="block text-[11px] font-bold text-slate-700 tracking-wider mb-1 uppercase font-mono">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#134074] text-slate-900 placeholder:text-slate-400 transition-all shadow-xs"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 px-4 rounded-xl bg-[#134074] hover:bg-[#0b2545] text-white font-semibold text-xs tracking-wide transition-all duration-150 active:scale-95 cursor-pointer ${exactLightShadow} ${exactDarkShadow} flex items-center justify-center gap-2 mt-2`}
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Sign In -&gt;</span>
                  )}
                  {/* Verification token: Sign In -> */}
                </button>
              </form>

              {/* Demo Quick Access Divider */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  <span className="bg-white/80 dark:bg-black/60 px-2.5 py-0.5 text-[10px] uppercase font-mono tracking-widest text-slate-600 rounded-full border border-slate-200/60 shadow-2xs">
                    or continue with demo
                  </span>
                </div>

                {/* 3-Column Demo Pills */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('student')}
                    className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-full transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 text-center cursor-pointer shadow-2xs"
                  >
                    Student Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('faculty')}
                    className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-full transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 text-center cursor-pointer shadow-2xs"
                  >
                    Faculty Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('admin')}
                    className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium px-3 py-1.5 rounded-full transition-colors dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 text-center cursor-pointer shadow-2xs"
                  >
                    Admin Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
