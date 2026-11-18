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
  AlertCircle
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { APP_CONFIG } from '../../config';

export const AdminPeoplePage: React.FC = () => {
  const { users, createUser, deleteUser, user: currentUser } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

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
  const [role, setRole] = useState<UserRole>('student');

  // Student specific form fields
  const [rollNumber, setRollNumber] = useState('');
  const [program, setProgram] = useState('B.Tech Computer Science');
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

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    const cleanPrefix = emailPrefix.trim().toLowerCase().replace(/[@\s]/g, '');

    if (!trimmedName) {
      setFormError('Please enter user full name.');
      return;
    }

    if (!cleanPrefix) {
      setFormError('Please enter user email prefix username.');
      return;
    }

    const fullEmail = `${cleanPrefix}${getEmailSuffix(role)}`;

    // Role-specific validation
    if (role === 'student' && !rollNumber.trim()) {
      setFormError('Student ID / Roll Number is required for students.');
      return;
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
      role,
      avatarInitials: '',
      department: department.trim() || (role === 'student' ? 'Computer Science & Engineering' : 'Central Administration'),
      designation: role === 'student' ? 'Undergraduate Scholar' : designation.trim(),
      ...(role === 'student'
        ? {
          rollNumber: rollNumber.trim().toUpperCase(),
          program: program.trim(),
          semester: Number(semester) || 1,
          section: section.trim(),
          academicYear: APP_CONFIG.academicSession,
          attendanceMinimum: APP_CONFIG.defaultAttendanceThreshold,
          classCoordinator: classCoordinator.trim() || undefined,
        }
        : {}),
    };

    createUser(newUserData);

    // Reset Form
    setName('');
    setEmailPrefix('');
    setRollNumber('');
    setClassCoordinator('');
    setIsAddModalOpen(false);
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
                        {!isCurrent && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove ${u.name} from the directory?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors"
                            title="Remove User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className={`p-3 rounded-md border text-left transition-colors flex items-center gap-2.5 ${role === 'student'
                        ? 'border-teal-700 dark:border-teal-500 bg-teal-50/60 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 font-semibold ring-1 ring-teal-700'
                        : 'border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#111115] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#202025]'
                      }`}
                  >
                    <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <div>
                      <div className="text-xs">Student</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">@aaroh.edu.in</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('faculty')}
                    className={`p-3 rounded-md border text-left transition-colors flex items-center gap-2.5 ${role === 'faculty'
                        ? 'border-blue-700 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-semibold ring-1 ring-blue-700'
                        : 'border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#111115] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#202025]'
                      }`}
                  >
                    <Briefcase className={`w-4 h-4 ${role === 'faculty' ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <div>
                      <div className="text-xs">Faculty</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">@faculty.aaroh.edu.in</div>
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

              {/* Dynamic Fields: Student */}
              {role === 'student' && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-900">
                    Student Academic Information
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Student ID / Roll No. <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 23CS014"
                        value={rollNumber}
                        onChange={e => setRollNumber(e.target.value)}
                        className="w-full text-xs font-mono uppercase px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Program
                      </label>
                      <select
                        value={program}
                        onChange={e => setProgram(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded-md bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-all duration-150 ease-in-out"
                      >
                        <option value="B.Tech Computer Science">B.Tech Computer Science</option>
                        <option value="B.Tech Electronics & Comm.">B.Tech Electronics & Comm.</option>
                        <option value="B.Tech Mechanical">B.Tech Mechanical</option>
                        <option value="BBA / MBA">School of Management</option>
                        <option value="BA LL.B / BBA LL.B">School of Law</option>
                        <option value="B.Pharm">Pharmaceutical Sciences</option>
                        <option value="B.Sc / M.Sc Applied Sciences">Applied Sciences</option>
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

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-slate-500 leading-relaxed">
                <CheckCircle className="w-3.5 h-3.5 text-teal-700 inline mr-1" />
                Once onboarded, this user can immediately sign in at <code className="font-mono">/login</code> using this email address.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save & Onboard User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPeoplePage;
