import React, { useState } from 'react';
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
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { APP_CONFIG } from '../../config';
import { supabase } from '../../lib/supabase';
import { SPECIALIZATION_OPTIONS } from '../../utils/curriculumData';

export const AdminPeoplePage: React.FC = () => {
  const { users, createUser, deleteUser, updateUser, showToast, user: currentUser } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

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
  const facultyMembers = users.filter(u => u.role === 'faculty');

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.program && u.program.toLowerCase().includes(q)) ||
      (u.classCoordinator && u.classCoordinator.toLowerCase().includes(q));

    return matchesRole && matchesSearch;
  });

  const studentCount = users.filter(u => u.role === 'student').length;
  const facultyCount = users.filter(u => u.role === 'faculty').length;
  const adminCount = users.filter(u => u.role === 'admin').length;

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

    if (role === 'student' && !cleanPrefix && rollNumber.trim()) {
      cleanPrefix = rollNumber.trim().toLowerCase();
    }

    if (!cleanPrefix) {
      setFormError('Please enter user email prefix username or Roll Number.');
      return;
    }

    const fullEmail = `${cleanPrefix}${getEmailSuffix(role)}`;
    const effectivePassword = password.trim() || (role === 'student' ? rollNumber.trim() : '');

    // Password validation for all roles
    if (!effectivePassword) {
      setFormError('Account Password is required.');
      return;
    }
    if (effectivePassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

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

    // Check duplicate email
    if (users.some(u => u.email.toLowerCase() === fullEmail.toLowerCase())) {
      setFormError(`An account with email "${fullEmail}" already exists in the directory.`);
      return;
    }

    // Create User object
    const newUserData: Omit<User, 'id'> = {
      name: trimmedName,
      email: fullEmail,
      password: effectivePassword,
      role,
      avatarInitials: '',
      department: department.trim() || (role === 'student' ? 'Computer Science & Engineering' : 'Central Administration'),
      designation: role === 'student' ? 'Undergraduate Scholar' : designation.trim(),
      ...(role === 'student'
        ? {
          rollNumber: rollNumber.trim(),
          username: rollNumber.trim(),
          course: program.trim(),
          division: section.replace(/section/i, '').trim() || 'A',
          program: program.trim(),
          semester: Number(semester) || 1,
          section: section.trim(),
          academicYear: APP_CONFIG.academicSession,
          attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
          classCoordinator: classCoordinator.trim() || undefined,
        }
        : {
          username: fullEmail,
        }),
    };

    // 1. Save to primary database store (aaroh_users)
    createUser(newUserData);

    // 2. Dual-Sync: Save to aarohUsers array in localStorage
    const username = role === 'student' ? rollNumber.trim() : fullEmail;
    try {
      const existingAarohUsers = JSON.parse(localStorage.getItem('aarohUsers') || '[]');
      const idx = existingAarohUsers.findIndex(
        (u: any) => u.username?.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === fullEmail.toLowerCase()
      );
      const studentPayload = role === 'student' ? {
        username: rollNumber.trim(),
        email: fullEmail,
        password: effectivePassword,
        role: 'Student',
        full_name: trimmedName,
        course: program.trim(),
        division: section.replace(/section/i, '').trim() || 'A',
      } : {
        username: fullEmail,
        email: fullEmail,
        password: effectivePassword,
        role: role === 'admin' ? 'Admin' : 'Faculty',
        full_name: trimmedName,
      };

      if (idx >= 0) {
        existingAarohUsers[idx] = { ...existingAarohUsers[idx], ...studentPayload };
      } else {
        existingAarohUsers.push(studentPayload);
      }
      localStorage.setItem('aarohUsers', JSON.stringify(existingAarohUsers));
    } catch {
      // Offline-first fallback
    }

    // 3. UI Loading feedback state
    setIsSyncing(true);

    // 4. Asynchronous insert into Supabase aaroh_users table
    if (supabase) {
      try {
        const studentPayload = role === 'student' ? {
          username: rollNumber.trim(),
          email: fullEmail,
          password: effectivePassword,
          role: 'Student',
          full_name: trimmedName,
          course: program.trim(),
          division: section.replace(/section/i, '').trim() || 'A',
        } : {
          username: fullEmail,
          email: fullEmail,
          password: effectivePassword,
          role: role === 'admin' ? 'Admin' : 'Faculty',
          full_name: trimmedName,
        };
        await supabase.from('aaroh_users').insert([studentPayload]);
      } catch {
        // Handle gracefully if offline or username already exists
      }
    }

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
    }, 1000);
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
          username: editingUser.email,
          password: trimmedPassword,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
            Campus User Directory & Onboarding
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Onboard new students and faculty, assign institutional credentials, and oversee directory access.
          </p>
        </div>

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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-4">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Accounts</span>
            <Users className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {users.length}
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
            All Accounts ({users.length})
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
                  <th className="py-3 px-4">ID / Department</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map(u => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 ${u.role === 'admin'
                                ? 'bg-slate-800'
                                : u.role === 'faculty'
                                  ? 'bg-blue-800'
                                  : 'bg-teal-700'
                              }`}
                          >
                            {u.avatarInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {u.designation || (u.role === 'student' ? 'Student' : 'Faculty')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono capitalize ${u.role === 'student'
                              ? 'bg-teal-50 text-teal-800 border border-teal-200'
                              : u.role === 'faculty'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-purple-50 text-purple-800 border border-purple-200'
                            }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {u.email}
                      </td>

                      {/* ID / Department */}
                      <td className="py-3 px-4">
                        {u.role === 'student' ? (
                          <div className="space-y-0.5">
                            <div className="font-mono font-medium text-slate-800">
                              {u.rollNumber || 'ID Pending'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {u.program || 'B.Tech'} • Sem {u.semester || 1}
                            </div>
                            {u.classCoordinator && (
                              <div className="text-[10px] text-teal-700 font-medium">
                                Coord: {u.classCoordinator}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="font-medium text-slate-800">{u.department}</div>
                            <div className="text-[11px] text-slate-400">{u.designation}</div>
                          </div>
                        )}
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
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove ${u.name} from the directory?`)) {
                                  deleteUser(u.id);
                                }
                              }}
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
                  Account Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Set account password (min 6 characters)"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full text-xs font-mono pl-9 pr-9 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  This password will be required when logging in with this institutional email.
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
    </div>
  );
};

export default AdminPeoplePage;
