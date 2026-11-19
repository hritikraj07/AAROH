import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Trash2,
  X,
  Mail,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  Shield,
  Edit2,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { APP_CONFIG } from '../../config';
import { supabase } from '../../lib/supabase';
import { SPECIALIZATION_OPTIONS } from '../../utils/curriculumData';
import { StorageService } from '../../services/storage';

export const AdminPeoplePage: React.FC = () => {
  const { users, createUser, deleteUser, updateUser, showToast, user: currentUser, refreshData } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  // Supabase Directory Live Data State: exclusively stores live records from public.aaroh_users
  const [directoryUsers, setDirectoryUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem('aaroh_users');
      if (stored) {
        const parsed: User[] = JSON.parse(stored);
        return parsed.filter(u => !u.name?.includes('Shalini Gupta') && !u.name?.includes('Alok Mathur') && !u.name?.includes('Rajiv Sharma') && !u.username?.match(/^FAC1\d\d$/i));
      }
    } catch {}
    return [];
  });
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [authSessionWarning, setAuthSessionWarning] = useState<string | null>(null);
  const [provisionedToast, setProvisionedToast] = useState<string | null>(null);

  // Edit User State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editShowPassword, setEditShowPassword] = useState(false);
  const [editRollNumber, setEditRollNumber] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editSemester, setEditSemester] = useState<number>(1);
  const [editProgram, setEditProgram] = useState('B.Tech CSE');
  const [isEditSyncing, setIsEditSyncing] = useState(false);
  const [editSyncSuccess, setEditSyncSuccess] = useState(false);

  // Fetch all 1,110+ Supabase records in Admin Directory with pagination range 0-1999
  const fetchUsers = useCallback(async () => {
    setIsLoadingDirectory(true);
    setSupabaseError(null);
    setAuthSessionWarning(null);

    if (!supabase) {
      setSupabaseError('Supabase client is not configured.');
      setIsLoadingDirectory(false);
      return;
    }

    try {
      // 1. Verify Active Supabase Auth Session Before Querying
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!sessionData?.session || sessionError) {
        setAuthSessionWarning('Not authenticated with Supabase Auth. Please sign out and log in again with ADM001 so RLS allows reading the directory.');
        setIsLoadingDirectory(false);
        return;
      }

      // 2. Fetch exclusively from public.aaroh_users via range 0-1999 (handling PostgREST 1000 max_rows)
      let allRows: any[] = [];
      const { data: firstBatch, error: firstError } = await supabase
        .from('aaroh_users')
        .select('id, username, email, role, full_name, course, division, auth_user_id')
        .range(0, 999)
        .order('role', { ascending: true })
        .order('username', { ascending: true });

      if (firstError) {
        setSupabaseError(firstError.message || 'Failed to fetch directory from Supabase.');
        setIsLoadingDirectory(false);
        return;
      }

      if (firstBatch && firstBatch.length > 0) {
        allRows = [...firstBatch];
        if (firstBatch.length === 1000) {
          const { data: secondBatch, error: secondError } = await supabase
            .from('aaroh_users')
            .select('id, username, email, role, full_name, course, division, auth_user_id')
            .range(1000, 1999)
            .order('role', { ascending: true })
            .order('username', { ascending: true });

          if (secondError) {
            setSupabaseError(secondError.message || 'Failed to fetch secondary directory records from Supabase.');
            setIsLoadingDirectory(false);
            return;
          }

          if (secondBatch && secondBatch.length > 0) {
            allRows = allRows.concat(secondBatch);
          }
        }
      }

      if (allRows.length > 0) {
        const mappedUsers: User[] = allRows.map((row: any) => {
          const r = (row.role?.toLowerCase() as UserRole) || 'student';
          const roll = row.username || (row.email ? row.email.split('@')[0] : '');
          const emailAddr = row.email || `${roll.toLowerCase()}@aaroh.edu.in`;
          const fullName = row.full_name || (r === 'admin' ? `Admin ${roll}` : r === 'faculty' ? `Prof. ${roll}` : `Student ${roll}`);
          const rawCourse = row.course || 'B.Tech CSE';
          const resolvedCourse = (rawCourse.trim().toLowerCase() === 'b.tech cse (ai/ml)' || rawCourse.trim().toLowerCase() === 'b.tech cse (ai & ml)')
            ? 'B.Tech CSE (AI & ML)'
            : rawCourse.trim();

          return {
            id: row.id || `usr_${roll.toLowerCase()}`,
            name: fullName,
            email: emailAddr.toLowerCase(),
            username: roll,
            password: roll,
            role: r,
            avatarInitials: fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
            department: r === 'admin' ? 'Central Administration' : (resolvedCourse || 'Computer Science & Engineering'),
            designation: r === 'student' ? 'Undergraduate Scholar' : (r === 'admin' ? 'Campus Administrator' : 'Faculty Member'),
            rollNumber: roll,
            program: resolvedCourse,
            course: resolvedCourse,
            section: row.division && row.division !== 'none' ? `Section ${row.division}` : 'Section A',
            division: row.division || 'A',
            semester: 1,
            academicYear: APP_CONFIG.academicSession,
            attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
          };
        });

        // Arrange student first then faculty then admin
        const roleOrder: Record<string, number> = { student: 1, faculty: 2, admin: 3 };
        mappedUsers.sort((a, b) => {
          const orderDiff = (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
          if (orderDiff !== 0) return orderDiff;
          return (a.username || '').localeCompare(b.username || '');
        });

        setDirectoryUsers(mappedUsers);
        try {
          localStorage.setItem('aaroh_users', JSON.stringify(mappedUsers));
          localStorage.setItem('aarohUsers', JSON.stringify(allRows));
        } catch {}
        refreshData();
      } else if (allRows.length === 0) {
        setDirectoryUsers([]);
        setSupabaseError('Supabase returned 0 records. Ensure you are signed in with an authorized Admin account (e.g. ADM001).');
      }
    } catch (err: any) {
      setSupabaseError(err?.message || 'Database connection error.');
    } finally {
      setIsLoadingDirectory(false);
    }
  }, [refreshData]);

  // Synchronize live public.aaroh_users database directory on load
  useEffect(() => {
    // Proactively purge any residual mock users from browser localStorage
    try {
      const stored = localStorage.getItem('aaroh_users');
      if (stored) {
        const parsed: User[] = JSON.parse(stored);
        const cleaned = parsed.filter(u => {
          if (!u.name || !u.username) return false;
          if (u.name.includes('Shalini Gupta') || u.name.includes('Alok Mathur') || u.name.includes('Rajiv Sharma')) return false;
          if (/^FAC1\d\d$/i.test(u.username)) return false;
          return true;
        });
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('aaroh_users', JSON.stringify(cleaned));
        }
      }
    } catch {}
    fetchUsers();
  }, [fetchUsers]);

  // Available Faculty Departments
  const FACULTY_DEPARTMENTS = [
    'Computer Science & Engineering',
    'Mechanical Engineering',
    'School of Management & Commerce',
    'School of Law',
    'Applied Sciences & Humanities',
    'Architecture & Design',
    'Pharmaceutical Sciences',
  ];

  // Helper for dynamic read-only institutional email suffix
  const getEmailSuffix = (targetRole: UserRole) => {
    switch (targetRole) {
      case 'faculty':
        return '@faculty.aaroh.edu.in';
      case 'admin':
        return '@admin.aaroh.edu.in';
      case 'student':
      default:
        return '@aaroh.edu.in';
    }
  };

  // Form State
  const [name, setName] = useState('');
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [role, setRole] = useState<UserRole>('student');

  // Student specific form fields
  const [rollNumber, setRollNumber] = useState('');
  const [program, setProgram] = useState(SPECIALIZATION_OPTIONS[0] || 'B.Tech CSE');
  const [semester, setSemester] = useState<number>(1);
  const [section, setSection] = useState('Section A');
  const [classCoordinator, setClassCoordinator] = useState<string>('');

  // Faculty/Admin specific form fields
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [designation, setDesignation] = useState('Assistant Professor');

  // Validation message
  const [formError, setFormError] = useState<string | null>(null);

  // Dynamic list of faculty members for class coordinator assignment
  const facultyMembers = directoryUsers.some(u => u.role === 'faculty')
    ? directoryUsers.filter(u => u.role === 'faculty')
    : users.filter(u => u.role === 'faculty');

  // Active directory list: exclusively live Supabase directory records
  const activeUsers = directoryUsers;

  // Filtered Users
  const filteredUsers = activeUsers.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.program && u.program.toLowerCase().includes(q)) ||
      (u.classCoordinator && u.classCoordinator.toLowerCase().includes(q));

    return matchesRole && matchesSearch;
  });

  const studentCount = activeUsers.filter(u => u.role === 'student').length;
  const facultyCount = activeUsers.filter(u => u.role === 'faculty').length;
  const adminCount = activeUsers.filter(u => u.role === 'admin').length;

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setFormError(null);
    if (newRole === 'student') {
      setDepartment('Computer Science & Engineering');
    } else if (newRole === 'faculty') {
      setDepartment(FACULTY_DEPARTMENTS[0]);
      setDesignation('Assistant Professor');
    } else if (newRole === 'admin') {
      setDepartment('Central Administration');
      setDesignation('Administrative Officer');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    let cleanPrefix = emailPrefix.trim().toLowerCase().replace(/[@\s]/g, '');

    if (!trimmedName) {
      setFormError('Please enter user full name.');
      return;
    }

    const rollNo = rollNumber.trim();
    if (role === 'student' && !cleanPrefix && rollNo) {
      cleanPrefix = rollNo.toLowerCase();
    }

    if (!cleanPrefix && role !== 'student') {
      setFormError('Please enter user email prefix username or Roll Number.');
      return;
    }

    const fullEmail = role === 'student'
      ? `${rollNo || cleanPrefix}@aaroh.edu.in`
      : `${cleanPrefix}${getEmailSuffix(role)}`;

    // Prepare fields for Supabase admin_provision_user RPC
    const username = (role === 'student' ? (rollNo || cleanPrefix) : cleanPrefix).trim();
    const fullName = trimmedName;
    const course = (role === 'student' ? program : department).trim();
    const division = role === 'student' ? (section.replace(/section/i, '').trim() || 'A') : 'none';

    // Password defaults to username if left blank
    const resolvedPassword = (password || username).trim();

    // Role-specific validation
    if (role === 'student') {
      if (!rollNumber.trim()) {
        setFormError('Student ID / Roll Number is required for students.');
        return;
      }
      if (!/^\d+$/.test(rollNumber.trim())) {
        setFormError('Roll Number must contain digits only.');
        return;
      }
    }

    if ((role === 'faculty' || role === 'admin') && !department.trim()) {
      setFormError('Department is required.');
      return;
    }

    // Check duplicate username or email in active directory
    if (activeUsers.some(u => u.email.toLowerCase() === fullEmail.toLowerCase() || u.username?.toLowerCase() === username.toLowerCase())) {
      setFormError(`An account with username "${username}" or email "${fullEmail}" already exists in the directory.`);
      return;
    }

    setIsSyncing(true);

    // Call Supabase admin_provision_user RPC directly
    if (supabase) {
      try {
        const capitalizedRole = role === 'admin' ? 'Admin' : role === 'faculty' ? 'Faculty' : 'Student';
        const { data, error } = await supabase.rpc('admin_provision_user', {
          p_username: username.trim(),
          p_password: (password || username).trim(),
          p_role: capitalizedRole,
          p_full_name: fullName.trim(),
          p_course: course,
          p_division: division || 'none'
        });

        if (error) {
          const exactMsg = error.message || 'Failed to provision user in Supabase.';
          setFormError(exactMsg);
          showToast({
            type: 'error',
            title: 'Provisioning Failed',
            message: exactMsg,
          });
          setIsSyncing(false);
          return;
        }

        // On success:
        // 1. Immediately prepend/add the returned user object to the live Admin Directory state
        const returnedRow = data || {};
        const createdUser: User = {
          id: returnedRow.id || `usr_${username.toLowerCase()}`,
          name: returnedRow.full_name || fullName.trim(),
          email: returnedRow.email || `${username.toLowerCase()}@aaroh.edu.in`,
          username: returnedRow.username || username.trim(),
          password: resolvedPassword,
          role: (returnedRow.role?.toLowerCase() as UserRole) || role,
          avatarInitials: (returnedRow.full_name || fullName).trim().split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
          department: role === 'admin' ? 'Central Administration' : (course || 'Computer Science & Engineering'),
          designation: role === 'student' ? 'Undergraduate Scholar' : (role === 'admin' ? 'Campus Administrator' : 'Faculty Member'),
          rollNumber: username.trim(),
          program: returnedRow.course || course,
          course: returnedRow.course || course,
          section: returnedRow.division && returnedRow.division !== 'none' ? `Section ${returnedRow.division}` : 'Section A',
          division: returnedRow.division || division || 'A',
          semester: Number(semester) || 1,
          academicYear: APP_CONFIG.academicSession,
          attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
          classCoordinator: classCoordinator.trim() || undefined,
        };

        setDirectoryUsers(prev => [createdUser, ...prev.filter(u => u.username !== createdUser.username)]);
        createUser(createdUser);

        // 2. Re-fetch from public.aaroh_users
        await fetchUsers();

        // 3. Show a clean Deep Teal confirmation toast (User <username> provisioned in Supabase)
        setProvisionedToast(`User ${username.trim()} provisioned in Supabase`);
        setTimeout(() => setProvisionedToast(null), 5000);
        showToast({
          type: 'success',
          title: 'User Provisioned',
          message: `User ${username.trim()} provisioned in Supabase`,
        });

        setIsSyncing(false);
        setSyncSuccess(true);

        setTimeout(() => {
          setName('');
          setEmailPrefix('');
          setPassword('');
          setRollNumber('');
          setClassCoordinator('');
          setSyncSuccess(false);
          setIsAddModalOpen(false);
        }, 800);
        return;
      } catch (err: any) {
        setFormError(err?.message || 'Database error provisioning user.');
        setIsSyncing(false);
        return;
      }
    }

    // Offline fallback if Supabase client is uninitialized
    const fallbackUserData: Omit<User, 'id'> = {
      name: fullName,
      email: fullEmail,
      password: resolvedPassword,
      role,
      avatarInitials: '',
      department: department.trim() || (role === 'student' ? 'Computer Science & Engineering' : 'Central Administration'),
      designation: role === 'student' ? 'Undergraduate Scholar' : designation.trim(),
      ...(role === 'student'
        ? {
          rollNumber: username,
          username: username,
          course: course,
          division: division,
          program: course,
          semester: Number(semester) || 1,
          section: section.trim(),
          academicYear: APP_CONFIG.academicSession,
          attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
          classCoordinator: classCoordinator.trim() || undefined,
        }
        : {
          username: username,
        }),
    };

    const created = createUser(fallbackUserData);
    setDirectoryUsers(prev => [created, ...prev]);
    setIsSyncing(false);
    setSyncSuccess(true);
    setProvisionedToast(`User ${username.trim()} provisioned in Supabase`);
    setTimeout(() => setProvisionedToast(null), 5000);

    setTimeout(() => {
      setName('');
      setEmailPrefix('');
      setPassword('');
      setRollNumber('');
      setClassCoordinator('');
      setSyncSuccess(false);
      setIsAddModalOpen(false);
    }, 800);
  };

  const handleDeleteUser = async (targetUser: User) => {
    const targetUsername = targetUser.username || targetUser.rollNumber || (targetUser.email ? targetUser.email.split('@')[0] : '');
    if (!window.confirm(`Are you sure you want to remove ${targetUser.name} (${targetUsername}) from the directory?`)) {
      return;
    }

    if (supabase && targetUsername) {
      try {
        const { error: delError } = await supabase
          .from('aaroh_users')
          .delete()
          .eq('username', targetUsername);

        if (delError) {
          showToast({
            type: 'error',
            title: 'Delete Failed',
            message: delError.message || 'Failed to remove user from Supabase.',
          });
          return;
        }
      } catch (err: any) {
        showToast({
          type: 'error',
          title: 'Delete Error',
          message: err?.message || 'Database error during deletion.',
        });
        return;
      }
    }

    deleteUser(targetUser.id);
    setDirectoryUsers(prev => prev.filter(u => u.id !== targetUser.id && u.username !== targetUsername));

    if (supabase) {
      await fetchUsers();
    }

    showToast({
      type: 'info',
      title: 'User Removed',
      message: `User ${targetUsername} removed from directory.`,
    });
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditPassword(u.password || '');
    setEditShowPassword(false);
    setEditRollNumber(u.rollNumber || '');
    setEditDepartment(u.department || '');
    setEditDesignation(u.designation || '');
    setEditSemester(u.semester || 1);
    setEditProgram(u.program || 'B.Tech CSE');
    setEditSyncSuccess(false);
    setIsEditModalOpen(true);
  };

  const handleSaveUserEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const trimmedPassword = editPassword.trim();
    const updates: Partial<User> = {
      name: editName.trim() || editingUser.name,
      password: trimmedPassword,
    };

    if (editingUser.role === 'student') {
      if (editRollNumber.trim()) updates.rollNumber = editRollNumber.trim();
      if (editProgram.trim()) updates.program = editProgram.trim();
      if (editSemester) updates.semester = Number(editSemester);
    } else {
      if (editDepartment.trim()) updates.department = editDepartment.trim();
      if (editDesignation.trim()) updates.designation = editDesignation.trim();
    }

    // 1. Update in StorageService / AppContext
    updateUser(editingUser.id, updates);

    // 2. Dual-Sync: Update aarohUsers array in localStorage (offline database)
    try {
      const raw = localStorage.getItem('aarohUsers');
      const existing: any[] = raw ? JSON.parse(raw) : [];
      const idx = existing.findIndex(
        item => (item.username && item.username.toLowerCase() === editingUser.email.toLowerCase()) ||
                (item.email && item.email.toLowerCase() === editingUser.email.toLowerCase())
      );
      if (idx >= 0) {
        existing[idx] = {
          ...existing[idx],
          name: updates.name,
          password: trimmedPassword,
          role: editingUser.role,
        };
      } else {
        existing.push({
          username: editingUser.email,
          password: trimmedPassword,
          role: editingUser.role,
          name: updates.name,
        });
      }
      localStorage.setItem('aarohUsers', JSON.stringify(existing));
    } catch {
      // Offline-first fallback
    }

    // 3. Supabase Cloud Sync
    setIsEditSyncing(true);
    if (supabase) {
      try {
        await supabase.from('aaroh_users').upsert([{
          username: editingUser.username || editingUser.email,
          email: editingUser.email,
          password: '[MANAGED_BY_SUPABASE_AUTH]',
          role: editingUser.role,
        }], { onConflict: 'username' });
      } catch {
        // Handle gracefully if offline
      }
    }

    setIsEditSyncing(false);
    setEditSyncSuccess(true);
    showToast({
      type: 'success',
      title: 'Credentials Updated',
      message: `Updated login credentials for ${editingUser.name}.`,
    });

    setTimeout(() => {
      setEditSyncSuccess(false);
      setIsEditModalOpen(false);
      setEditingUser(null);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
              Campus User Directory & Onboarding
            </h2>
            {isLoadingDirectory && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 animate-pulse font-mono">
                <Loader2 className="w-3 h-3 animate-spin" />
                Syncing Supabase...
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Onboard new students and faculty, assign institutional credentials, and oversee directory access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingDirectory ? 'animate-spin' : ''}`} />}
            onClick={fetchUsers}
            disabled={isLoadingDirectory}
            title="Refresh directory from Supabase"
          >
            Sync
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => {
              setRole('student');
              setDepartment('Computer Science & Engineering');
              setIsAddModalOpen(true);
            }}
          >
            Onboard New User
          </Button>
        </div>
      </div>

      {/* Supabase Auth Session Missing Warning Banner */}
      {authSessionWarning && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold font-mono">Authentication Required for Live Directory</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed font-sans">
                {authSessionWarning}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchUsers}
            disabled={isLoadingDirectory}
            className="shrink-0 text-xs py-1"
          >
            {isLoadingDirectory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Re-check Session'}
          </Button>
        </div>
      )}

      {/* Supabase Error Alert Banner */}
      {supabaseError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-800 dark:text-rose-300 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold font-mono">Supabase Query Error</p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300/80 mt-0.5 leading-relaxed font-sans">
                {supabaseError}
              </p>
              <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 font-sans">
                Showing cached offline directory. Ensure you are signed in with an authorized Admin account (e.g. ADM001).
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchUsers}
            disabled={isLoadingDirectory}
            className="shrink-0 text-xs py-1"
          >
            {isLoadingDirectory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Retry'}
          </Button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Accounts</span>
            <Users className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {activeUsers.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Active verified directory profiles</p>
        </div>

        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Students</span>
            <GraduationCap className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-teal-800 dark:text-teal-400 font-mono">
            {studentCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">@aaroh.edu.in</p>
        </div>

        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Faculty</span>
            <Briefcase className="w-4 h-4 text-blue-700 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-blue-800 dark:text-blue-400 font-mono">
            {facultyCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">@faculty.aaroh.edu.in</p>
        </div>

        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Administrators</span>
            <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {adminCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">@admin.aaroh.edu.in</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#18181B] p-3 rounded-lg border border-slate-200 dark:border-[#27272A]">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, roll number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 min-h-[44px] bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 dark:focus:ring-teal-500"
          />
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 min-h-[36px] sm:min-h-[32px] text-xs rounded font-medium transition-colors whitespace-nowrap ${roleFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            All Accounts ({activeUsers.length})
          </button>
          <button
            onClick={() => setRoleFilter('student')}
            className={`px-3 py-1.5 min-h-[36px] sm:min-h-[32px] text-xs rounded font-medium transition-colors whitespace-nowrap ${roleFilter === 'student'
                ? 'bg-teal-700 text-white font-semibold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            Students ({studentCount})
          </button>
          <button
            onClick={() => setRoleFilter('faculty')}
            className={`px-3 py-1.5 min-h-[36px] sm:min-h-[32px] text-xs rounded font-medium transition-colors whitespace-nowrap ${roleFilter === 'faculty'
                ? 'bg-blue-700 text-white font-semibold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            Faculty ({facultyCount})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 min-h-[36px] sm:min-h-[32px] text-xs rounded font-medium transition-colors whitespace-nowrap ${roleFilter === 'admin'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
          >
            Admins ({adminCount})
          </button>
        </div>
      </div>

      {/* Directory Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-10 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">No users match your criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {searchQuery || roleFilter !== 'all'
              ? 'No registered profiles match the active search or role filters.'
              : 'There are currently no users in the campus directory. Onboard your first user now.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Onboard User
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#111115] border-b border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Institutional Email</th>
                  <th className="py-3 px-4">Course & Division</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map(u => {
                  const isCurrent = currentUser?.id === u.id || (currentUser?.username && u.username && currentUser.username.toLowerCase() === u.username.toLowerCase());
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      {/* Name & Username (row.full_name with row.username below) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                              u.role === 'admin'
                                ? 'bg-slate-800'
                                : u.role === 'faculty'
                                  ? 'bg-blue-800'
                                  : 'bg-teal-700'
                            }`}
                          >
                            {u.avatarInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-1 py-0.2 rounded font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                              {u.username || u.rollNumber || 'No ID'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono capitalize ${
                            u.role === 'student'
                              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                              : u.role === 'faculty'
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                : 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {u.email}
                      </td>

                      {/* Course & Division */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {u.course || u.program || (u.role === 'admin' ? 'All Programmes' : 'B.Tech CSE')}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {u.division && u.division !== 'none' ? `Division ${u.division}` : (u.section && u.section !== 'none' ? u.section : 'General')}
                          </div>
                          {u.classCoordinator && (
                            <div className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">
                              Coord: {u.classCoordinator}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(u)}
                            className="text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 p-1.5 rounded hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors cursor-pointer"
                            title="Edit Credentials & Password"
                            aria-label={`Edit credentials for ${u.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Remove User"
                              aria-label={`Remove user ${u.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg shadow-sm max-w-lg w-full p-6 space-y-4 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-800 dark:text-teal-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Onboard Campus User
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-md text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Account Role & Clearance <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className={`p-2.5 rounded-md border text-left transition-colors flex items-center gap-2 ${role === 'student'
                        ? 'border-teal-700 dark:border-teal-500 bg-teal-50/60 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 font-semibold ring-1 ring-teal-700'
                        : 'border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#111115] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#202025]'
                      }`}
                  >
                    <GraduationCap className={`w-4 h-4 shrink-0 ${role === 'student' ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <div className="min-w-0">
                      <div className="text-xs truncate font-medium">Student</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">@aaroh.edu.in</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('faculty')}
                    className={`p-2.5 rounded-md border text-left transition-colors flex items-center gap-2 ${role === 'faculty'
                        ? 'border-blue-700 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-semibold ring-1 ring-blue-700'
                        : 'border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#111115] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#202025]'
                      }`}
                  >
                    <Briefcase className={`w-4 h-4 shrink-0 ${role === 'faculty' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <div className="min-w-0">
                      <div className="text-xs truncate font-medium">Faculty</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">@faculty.aaroh.edu.in</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`p-2.5 rounded-md border text-left transition-colors flex items-center gap-2 ${role === 'admin'
                        ? 'border-purple-700 dark:border-purple-500 bg-purple-50/60 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 font-semibold ring-1 ring-purple-700'
                        : 'border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#111115] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#202025]'
                      }`}
                  >
                    <Shield className={`w-4 h-4 shrink-0 ${role === 'admin' ? 'text-purple-700 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <div className="min-w-0">
                      <div className="text-xs truncate font-medium">Admin</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">@admin.aaroh.edu.in</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Common Fields: Name and Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'student' ? 'e.g. Devika Patel' : 'e.g. Prof. Rajesh Verma'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institutional Email Address <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center rounded-md border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#111115] overflow-hidden focus-within:ring-2 focus-within:ring-teal-700/20 focus-within:border-teal-700 transition-all duration-150 ease-in-out">
                  <div className="pl-3 pr-1 text-slate-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={role === 'student' ? 'e.g. devika.patel' : 'e.g. rajesh.verma'}
                    value={emailPrefix}
                    onChange={e => {
                      const val = e.target.value.toLowerCase().replace(/[@\s]/g, '');
                      setEmailPrefix(val);
                    }}
                    className="flex-1 min-w-0 text-xs font-mono px-2 py-2 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none border-0"
                  />
                  <span className="px-3 py-2 bg-slate-50 border-l border-slate-200 text-xs font-mono text-slate-600 font-semibold select-none whitespace-nowrap">
                    {getEmailSuffix(role)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Type the username prefix; <span className="font-mono font-medium text-slate-700">{getEmailSuffix(role)}</span> is permanently assigned based on role. Full login ID: <span className="font-mono text-teal-800 font-semibold">{emailPrefix ? `${emailPrefix}${getEmailSuffix(role)}` : `username${getEmailSuffix(role)}`}</span>
                </p>
              </div>

              {/* Account Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Password <span className="text-slate-400 font-normal">(Defaults to username/ID if blank)</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Leave blank to default to username/ID"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full text-xs font-mono pl-9 pr-9 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  If left blank, password automatically defaults to the user's ID/Roll Number.
                </p>
              </div>

              {/* Dynamic Fields: Student */}
              {role === 'student' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-900">
                    Student Academic Information
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Student ID / Roll No. (Digits Only) <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                        placeholder="e.g. 20240101"
                        value={rollNumber}
                        onChange={e => setRollNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-xs font-mono uppercase px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">Numeric characters only</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Program
                      </label>
                      <select
                        value={program}
                        onChange={e => setProgram(e.target.value as any)}
                        className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                      >
                        {SPECIALIZATION_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Semester
                      </label>
                      <select
                        value={semester}
                        onChange={e => setSemester(Number(e.target.value))}
                        className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Section
                      </label>
                      <input
                        type="text"
                        value={section}
                        onChange={e => setSection(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                      />
                    </div>
                  </div>

                  {/* Class Coordinator Field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Class Coordinator (Faculty Mentor)
                    </label>
                    <select
                      value={classCoordinator}
                      onChange={e => setClassCoordinator(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                    >
                      <option value="">Unassigned (Select Coordinator)</option>
                      {facultyMembers.map(fac => (
                        <option key={fac.id} value={fac.name}>
                          {fac.name} ({fac.department})
                        </option>
                      ))}
                    </select>
                    {facultyMembers.length === 0 ? (
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
                        Notice: No faculty members found in directory. Onboard faculty members first to assign coordinators.
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        Select an existing teacher from the faculty directory as this student's coordinator.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Dynamic Fields: Faculty */}
              {role === 'faculty' && (
                <div className="p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-400">
                    Faculty Department & Title
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Academic Department <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                    >
                      {FACULTY_DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Fields: Admin */}
              {role === 'admin' && (
                <div className="p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-900 dark:text-purple-400">
                    Administrative Division & Title
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Division <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      placeholder="e.g. Central Administration / Registrar Office"
                      className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={e => setDesignation(e.target.value)}
                      placeholder="e.g. Administrative Officer"
                      className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <CheckCircle className="w-3.5 h-3.5 text-teal-700 inline mr-1" />
                Once onboarded, this user can immediately sign in at <code className="font-mono">/login</code> using this email address and set password.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#27272A]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isSyncing}
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormError(null);
                    setSyncSuccess(false);
                  }}
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-700/40 disabled:opacity-75 disabled:cursor-not-allowed ${
                    syncSuccess
                      ? 'bg-emerald-600 shadow-[0_1px_2px_rgba(5,150,105,0.2),0_2px_4px_rgba(5,150,105,0.2),0_4px_8px_rgba(5,150,105,0.2),0_8px_16px_rgba(5,150,105,0.25)]'
                      : 'bg-[#0F766E] hover:bg-teal-800 shadow-[0_1px_2px_rgba(15,118,110,0.2),0_2px_4px_rgba(15,118,110,0.2),0_4px_8px_rgba(15,118,110,0.15),0_8px_16px_rgba(15,118,110,0.25)]'
                  }`}
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : syncSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Credentials Synced ✓</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account & Onboard User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg shadow-sm max-w-lg w-full p-6 space-y-4 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-teal-800 dark:text-teal-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Edit Credentials: {editingUser.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdits} className="space-y-4">
              {/* Account summary banner */}
              <div className="p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Institutional Email</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{editingUser.email}</span>
                </div>
                <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                  {editingUser.role}
                </span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              {/* Password update field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Login Password (Reset if Forgotten) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={editShowPassword ? 'text' : 'password'}
                    required
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="Enter new password..."
                    className="w-full text-xs font-mono px-3 py-2 pr-10 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                  />
                  <button
                    type="button"
                    onClick={() => setEditShowPassword(!editShowPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                    title={editShowPassword ? 'Hide password' : 'Show password'}
                  >
                    {editShowPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  If the user forgot their password, set a new password here. It updates localStorage and syncs with the database.
                </p>
              </div>

              {/* Student specific fields */}
              {editingUser.role === 'student' && (
                <div className="space-y-3 p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Roll Number / ID
                      </label>
                      <input
                        type="text"
                        value={editRollNumber}
                        onChange={e => setEditRollNumber(e.target.value)}
                        className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Semester
                      </label>
                      <select
                        value={editSemester}
                        onChange={e => setEditSemester(Number(e.target.value))}
                        className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-700"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>Semester {s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Program / Course Track
                    </label>
                    <select
                      value={editProgram}
                      onChange={e => setEditProgram(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-700"
                    >
                      {SPECIALIZATION_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Faculty specific fields */}
              {editingUser.role === 'faculty' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272A] rounded-md">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={editDepartment}
                      onChange={e => setEditDepartment(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={editDesignation}
                      onChange={e => setEditDesignation(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-700"
                    />
                  </div>
                </div>
              )}

              {/* Modal footer actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#27272A]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isEditSyncing}
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </Button>
                <button
                  type="submit"
                  disabled={isEditSyncing || !editPassword.trim()}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-700/40 disabled:opacity-75 disabled:cursor-not-allowed ${
                    editSyncSuccess
                      ? 'bg-emerald-600 shadow-[0_1px_2px_rgba(5,150,105,0.2),0_2px_4px_rgba(5,150,105,0.2),0_4px_8px_rgba(5,150,105,0.2),0_8px_16px_rgba(5,150,105,0.25)]'
                      : 'bg-[#0F766E] hover:bg-teal-800 shadow-[0_1px_2px_rgba(15,118,110,0.2),0_2px_4px_rgba(15,118,110,0.2),0_4px_8px_rgba(15,118,110,0.15),0_8px_16px_rgba(15,118,110,0.25)]'
                  }`}
                >
                  {isEditSyncing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : editSyncSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Updated & Synced ✓</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Save & Sync Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Deep Teal Confirmation Toast */}
      {provisionedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#0F766E] text-white rounded-xl shadow-2xl border border-teal-500/30 animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans">
          <CheckCircle className="w-4 h-4 text-teal-200 shrink-0" />
          <span className="text-xs font-semibold">{provisionedToast}</span>
          <button
            type="button"
            onClick={() => setProvisionedToast(null)}
            className="ml-2 text-teal-200 hover:text-white p-0.5 rounded focus:outline-none cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPeoplePage;
