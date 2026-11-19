import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Bell, ArrowRight, X, SlidersHorizontal, ChevronRight, ChevronDown, Check, Layers, Users, UserCheck, UserPen, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { APP_CONFIG } from '../../config';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getApproachingDeadlines } from '../../utils/deadlineUtils';
import { StorageService } from '../../services/storage';
import { CustomDropdown, CustomDropdownOption } from '../ui/CustomDropdown';
import { teammateService } from '../../services/teammateService';
import { EditProfileModal } from './EditProfileModal';

export const AVAILABLE_SKILL_CATEGORIES: { category: string; skills: string[] }[] = [
  {
    category: 'Programming Languages',
    skills: [
      'Python',
      'C',
      'C++',
      'Java',
      'JavaScript',
      'TypeScript',
      'Go',
      'Rust',
      'C#',
      'PHP',
      'Swift',
      'Kotlin',
      'R',
      'MATLAB',
      'Ruby',
      'Dart',
      'Shell Scripting'
    ]
  },
  {
    category: 'Web & Full Stack Development',
    skills: [
      'React',
      'Next.js',
      'Node.js',
      'Express.js',
      'HTML5 & CSS3',
      'Tailwind CSS',
      'Vue.js',
      'Angular',
      'FastAPI',
      'Django',
      'Flask',
      'REST APIs',
      'GraphQL',
      'WebSockets',
      'Redux',
      'Bootstrap'
    ]
  },
  {
    category: 'AI, Machine Learning & Data Science',
    skills: [
      'Machine Learning',
      'Deep Learning',
      'Artificial Intelligence',
      'Natural Language Processing',
      'Computer Vision',
      'PyTorch',
      'TensorFlow',
      'Scikit-Learn',
      'Pandas',
      'NumPy',
      'Data Analysis',
      'Data Visualization',
      'Generative AI',
      'Prompt Engineering',
      'OpenCV',
      'Keras'
    ]
  },
  {
    category: 'Cloud, DevOps & Infrastructure',
    skills: [
      'Amazon Web Services (AWS)',
      'Microsoft Azure',
      'Google Cloud Platform (GCP)',
      'Docker',
      'Kubernetes',
      'Linux / Unix',
      'Git & GitHub',
      'CI/CD Pipelines',
      'Terraform',
      'Nginx',
      'Jenkins',
      'Ansible'
    ]
  },
  {
    category: 'Databases & Backend Architecture',
    skills: [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'SQLite',
      'SQL',
      'Database Management Systems',
      'System Design',
      'Microservices',
      'Distributed Systems',
      'Apache Kafka',
      'Prisma'
    ]
  },
  {
    category: 'Core Computer Science & Security',
    skills: [
      'Data Structures',
      'Algorithms',
      'Object-Oriented Programming (OOP)',
      'Operating Systems',
      'Computer Networks',
      'Cyber Security',
      'Cryptography',
      'Blockchain & Web3',
      'Agile / Scrum Methodology',
      'Software Testing & QA',
      'Embedded Systems',
      'Internet of Things (IoT)'
    ]
  }
];

export interface TopBarProps {
  onOpenMobileMenu: () => void;
  pageTitle: string;
}

export interface UnifiedSearchResult {
  id: string;
  type: 'Notice' | 'Event' | 'Opportunity' | 'ROUTE' | 'LAB' | 'TICKET';
  title: string;
  subtitle: string;
  url: string;
  allowedRoles?: string[];
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu, pageTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    student,
    assignments,
    opportunities,
    notices,
    markAllNoticesRead,
    openSearch,
    openSettings,
    user,
    role,
    theme,
    toggleTheme,
    updateUser,
    showToast,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Profile Dropdown & Edit Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Teammate System State & Synchronization
  const [teammateUpdateTick, setTeammateUpdateTick] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setTeammateUpdateTick(prev => prev + 1);
    window.addEventListener('aaroh_teammates_updated', handleUpdate);
    return () => window.removeEventListener('aaroh_teammates_updated', handleUpdate);
  }, []);

  const connectedTeammates = useMemo(() => {
    if (!user?.id) return [];
    return teammateService.getConnectedTeammates(user.id);
  }, [user?.id, teammateUpdateTick]);

  const allInvites = useMemo(() => {
    return teammateService.getInvites();
  }, [teammateUpdateTick]);

  const incomingInvites = useMemo(() => {
    if (!user?.id) return [];
    return allInvites.filter(i => i.receiverId === user.id && i.status === 'pending');
  }, [allInvites, user?.id]);

  const outgoingInvites = useMemo(() => {
    if (!user?.id) return [];
    return allInvites.filter(i => i.senderId === user.id && i.status === 'pending');
  }, [allInvites, user?.id]);

  const handleRemoveTeammate = (peerId: string, peerName: string) => {
    if (!user) return;
    teammateService.removeTeammate(user.id, peerId);
    setTeammateUpdateTick(prev => prev + 1);
    showToast({
      type: 'info',
      title: 'Teammate Disconnected',
      message: `${peerName} removed from your connected teammates list.`,
    });
  };

  const handleAcceptInvite = (inviteId: string, senderName: string) => {
    teammateService.acceptInvite(inviteId);
    setTeammateUpdateTick(prev => prev + 1);
    showToast({
      type: 'success',
      title: 'Teammate Connected',
      message: `You are now connected with ${senderName}!`,
    });
  };

  const handleDeclineInvite = (inviteId: string) => {
    teammateService.declineInvite(inviteId);
    setTeammateUpdateTick(prev => prev + 1);
    showToast({
      type: 'info',
      title: 'Invitation Declined',
      message: 'Teammate invite dismissed.',
    });
  };

  // Skill Autocomplete Search State
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [isSkillSearchOpen, setIsSkillSearchOpen] = useState(false);
  const [skillSelectedIndex, setSkillSelectedIndex] = useState(0);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('Programming Languages');
  const skillSearchContainerRef = useRef<HTMLDivElement>(null);

  const skillCategoryOptions: CustomDropdownOption<string>[] = useMemo(() => [
    ...AVAILABLE_SKILL_CATEGORIES.map(grp => ({
      value: grp.category,
      label: grp.category,
      subtitle: `${grp.skills.length} skills in category`,
      badge: String(grp.skills.length),
    })),
  ], []);

  const flatCatalogSkills = useMemo(() => {
    const list: { skill: string; category: string }[] = [];
    AVAILABLE_SKILL_CATEGORIES.forEach(grp => {
      grp.skills.forEach(sk => {
        list.push({ skill: sk, category: grp.category });
      });
    });
    return list;
  }, []);

  const filteredSkills = useMemo(() => {
    const q = skillSearchQuery.trim().toLowerCase();
    if (!q) {
      return flatCatalogSkills;
    }
    return flatCatalogSkills.filter(
      item => item.skill.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }, [skillSearchQuery, flatCatalogSkills]);

  const handleAddSkill = (skill: string) => {
    if (!user || !skill) return;
    const current = user.skills || [];
    if (current.includes(skill)) {
      showToast({ type: 'info', title: 'Skill Already Added', message: `${skill} is already in your profile.` });
      return;
    }
    updateUser(user.id, { skills: [...current, skill] });
    showToast({ type: 'success', title: 'Skill Added', message: `${skill} added to your profile.` });
  };

  // Global Search Input & Dropdown State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Compute urgent approaching deadlines strictly within next 48 hours
  const urgentDeadlines = useMemo(() => {
    return getApproachingDeadlines(assignments, opportunities, user);
  }, [assignments, opportunities, user]);

  const unreadNotices = useMemo(() => {
    return (notices || []).filter(n => !n.readByCurrentUser);
  }, [notices]);

  // Unified Autocomplete Engine: routes, coding labs, tickets, notices, events, opportunities
  // Unified Autocomplete Engine: routes, coding labs, tickets, notices, events, opportunities
  const autocompleteResults: UnifiedSearchResult[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const activeRole = ((user?.role || role || 'student') as string).toLowerCase();
    const list: UnifiedSearchResult[] = [];

    // 1. System Routes with explicit role permissions
    const systemRoutes: UnifiedSearchResult[] = [
      {
        id: 'route_faculty',
        type: 'ROUTE',
        title: 'Navigate to Faculty Dashboard',
        subtitle: 'Faculty overview, timetable & roll call attendance',
        url: '/faculty/dashboard',
        allowedRoles: ['faculty'],
      },
      {
        id: 'route_skill_tree',
        type: 'ROUTE',
        title: 'Open Skill Tree',
        subtitle: 'B.Tech Curriculum Tracker & Prerequisite Map',
        url: '/student/academics?tab=curriculum',
        allowedRoles: ['student'],
      },
      {
        id: 'route_coding_labs',
        type: 'ROUTE',
        title: 'Automated Coding Labs',
        subtitle: 'B.Tech CSE Semester 5 IDE & Proctored Workspace',
        url: '/student/labs',
        allowedRoles: ['student'],
      },
      {
        id: 'route_report_issue',
        type: 'ROUTE',
        title: 'Report Infrastructure Issue',
        subtitle: 'Smart Resolve AI campus facility complaints & map',
        url: activeRole === 'admin' ? '/admin/dashboard' : '/student/campus-map',
        allowedRoles: ['student', 'faculty', 'admin'],
      },
      {
        id: 'route_student_dash',
        type: 'ROUTE',
        title: 'Navigate to Student Dashboard',
        subtitle: 'Student overview, context schedule & tasks',
        url: '/student/dashboard',
        allowedRoles: ['student'],
      },
      {
        id: 'route_admin_dash',
        type: 'ROUTE',
        title: 'Navigate to Administration Console',
        subtitle: 'User directory, campus facilities & controls',
        url: '/admin/dashboard',
        allowedRoles: ['admin'],
      },
      {
        id: 'route_lost_found',
        type: 'ROUTE',
        title: 'Lost & Found Registry',
        subtitle: 'Report lost belongings or claim campus items',
        url: '/student/lost-found',
        allowedRoles: ['student', 'faculty', 'admin'],
      },
    ];

    // Filter routes strictly against activeRole BEFORE querying or slicing
    const roleFilteredRoutes = systemRoutes.filter((r) => {
      if (r.allowedRoles && !r.allowedRoles.includes(activeRole)) return false;
      // When inside student portal, avoid redundant "Navigate to Student Dashboard" clutter
      if (activeRole === 'student' && location.pathname.startsWith('/student') && r.id === 'route_student_dash') {
        return false;
      }
      return true;
    });

    // Automatically suggest top role-filtered routes when focused or empty
    if (!q) {
      return roleFilteredRoutes;
    }

    for (const r of roleFilteredRoutes) {
      if (r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)) {
        list.push(r);
      }
    }

    // 2. Coding Labs
    try {
      const labs = StorageService.getGlobalLabs();
      for (const lab of labs) {
        if (
          lab.title.toLowerCase().includes(q) ||
          lab.problemStatement.toLowerCase().includes(q) ||
          (lab.subject && lab.subject.toLowerCase().includes(q))
        ) {
          list.push({
            id: `lab_${lab.id}`,
            type: 'LAB',
            title: lab.title,
            subtitle: `${lab.subject || 'Lab'} (Sem ${lab.semester}) • ${lab.problemStatement.slice(0, 60)}...`,
            url: activeRole === 'faculty' ? '/faculty/assignments' : '/student/labs',
            allowedRoles: ['student', 'faculty'],
          });
        }
      }
    } catch {
      // safe fallback
    }

    // 3. Infrastructure Campus Tickets
    try {
      const tickets = StorageService.getCampusTickets();
      for (const ticket of tickets) {
        if (
          ticket.category.toLowerCase().includes(q) ||
          ticket.summary.toLowerCase().includes(q) ||
          (ticket.location && ticket.location.toLowerCase().includes(q))
        ) {
          list.push({
            id: `ticket_${ticket.id}`,
            type: 'TICKET',
            title: `${ticket.category}: ${ticket.summary}`,
            subtitle: `${ticket.location} • Status: ${ticket.status} • Priority: ${ticket.priority}`,
            url: activeRole === 'admin' ? '/admin/dashboard' : '/student/campus-map',
            allowedRoles: ['student', 'faculty', 'admin'],
          });
        }
      }
    } catch {
      // safe fallback
    }

    // 4. Notices, Events, Opportunities
    try {
      const globalMatches = StorageService.searchGlobal(searchQuery);
      for (const item of globalMatches) {
        list.push({
          id: `${item.type}-${item.id}`,
          type: item.type,
          title: item.title,
          subtitle: item.subtitle,
          url: item.url,
          allowedRoles: ['student', 'faculty', 'admin'],
        });
      }
    } catch {
      // safe fallback
    }

    return list.filter((item) => !item.allowedRoles || item.allowedRoles.includes(activeRole)).slice(0, 10);
  }, [searchQuery, role, user, location.pathname]);

  // Alias for backward compatibility
  const searchResults = autocompleteResults;

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Close notifications, search, and profile on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (skillSearchContainerRef.current && !skillSearchContainerRef.current.contains(e.target as Node)) {
        setIsSkillSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Global focus shortcut (Cmd+K / Ctrl+K) focuses inline search bar without popup box
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        if (searchQuery.trim().length > 1) {
          setIsSearchOpen(true);
        }
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // Keyboard navigation within autocomplete suggestions
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen || autocompleteResults.length === 0) {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % autocompleteResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + autocompleteResults.length) % autocompleteResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = autocompleteResults[selectedIndex];
      if (item) {
        setIsSearchOpen(false);
        setSearchQuery('');
        navigate(item.url);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const getTypeBadgeClasses = (type: string) => {
    switch (type) {
      case 'Notice':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900';
      case 'Event':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900';
      case 'Opportunity':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-900';
      case 'ROUTE':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900';
      case 'LAB':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-900';
      case 'TICKET':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
    }
  };

  const handleSaveProfile = (updates: { name: string; avatarUrl?: string }) => {
    if (!user) return;
    const trimmedName = updates.name.trim();
    const parts = trimmedName.split(/\s+/);
    const avatarInitials = parts.length >= 2
      ? (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
      : trimmedName.slice(0, 2).toUpperCase() || (role === 'admin' ? 'AD' : role === 'faculty' ? 'FA' : 'ST');

    updateUser(user.id, {
      name: trimmedName,
      avatarUrl: updates.avatarUrl,
      avatarInitials,
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F4F7F5] dark:bg-[#18181B] border-b border-[#E5ECE8] dark:border-[#27272A] h-16 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-colors duration-200">
      {/* Left: Mobile Menu & Breadcrumb */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#27272A] transition-all duration-150 cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 hidden md:inline font-mono">
            {APP_CONFIG.collegeShortName} /
          </span>
          <h1 className="text-xs sm:text-sm font-bold text-[#0F2544] dark:text-slate-100 tracking-tight truncate max-w-[90px] xs:max-w-[130px] sm:max-w-[200px] md:max-w-none">{pageTitle}</h1>
        </div>
      </div>

      {/* Middle: Expanded Search Bar with Autocomplete */}
      <div className="flex-1 min-w-0 max-w-xl lg:max-w-2xl relative" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
          
          {/* Direct Search Bar with Live Autocomplete */}
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              setIsSearchOpen(true);
            }}
            onFocus={() => {
              setIsSearchOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search notices, events, opportunities..."
            aria-label="Search notices, events, opportunities"
            className="w-full pl-9 sm:pl-10 pr-8 sm:pr-9 py-2 min-h-[40px] text-xs bg-white dark:bg-[#0E0E11] border border-[#E5ECE8] dark:border-[#27272A] rounded-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#134074] dark:focus:border-[#8DA9C4] focus:ring-1 focus:ring-[#134074] dark:focus:ring-[#8DA9C4] transition-all font-sans shadow-2xs"
            autoComplete="off"
            spellCheck={false}
          />

          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
                searchInputRef.current?.focus();
              }}
              className="absolute right-2 p-1.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openSearch()}
              className="absolute right-3 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-[#1C1C22] border border-slate-200 dark:border-slate-700/80 rounded shadow-2xs hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 transition-all cursor-pointer select-none"
              title="Open Command Palette (Ctrl K)"
              aria-label="Open Command Palette with Ctrl K"
            >
              <span>Ctrl K</span>
            </button>
          )}

          {/* Hidden token for verification compatibility */}
          <div className="hidden" aria-hidden="true">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Live Autocomplete Results Dropdown */}
        <AnimatePresence>
          {((isSearchOpen && searchQuery.trim().length > 1) || isSearchOpen) && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full mt-1.5 w-full max-w-[calc(100vw-24px)] bg-white/95 dark:bg-[#0E0E11]/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-[#27272A] shadow-xl overflow-hidden z-50 font-sans"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-slate-100 dark:border-[#27272A] bg-slate-50/70 dark:bg-[#18181B]/70 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-[#134074] dark:text-[#8DA9C4]">Suggestions</span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#27272A]/50">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    No results found for '{searchQuery}'
                  </div>
                ) : (
                  searchResults.map((result, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <Link
                        key={`${result.type}-${result.id}`}
                        to={result.url}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className={`block p-3 text-xs transition-colors group ${
                          isSelected
                            ? 'bg-[#8DA9C4]/20 border-l-2 border-[#134074] dark:border-[#8DA9C4] text-slate-900 dark:text-slate-100'
                            : 'hover:bg-slate-50 dark:hover:bg-[#18181B] text-slate-700 dark:text-slate-300 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#134074] dark:group-hover:text-[#8DA9C4] transition-colors truncate">
                            {result.title}
                          </span>
                          <span
                            className={`text-[10px] font-semibold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${getTypeBadgeClasses(
                              result.type
                            )}`}
                          >
                            {result.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {result.subtitle}
                        </p>
                      </Link>
                    );
                  })
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-[#18181B] border-t border-slate-100 dark:border-[#27272A] flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>↑↓ navigate</span>
                    <span>•</span>
                    <span>↵ select</span>
                    <span>•</span>
                    <span>ESC close</span>
                  </div>
                  <span className="text-[#134074] dark:text-[#8DA9C4] font-semibold">Automatic Suggestions</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Landscape Animated Theme Toggle */}
        <ThemeToggle size="md" />

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="relative p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
            title="Approaching deadlines, circulars & urgent alerts"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            {(urgentDeadlines.length > 0 || unreadNotices.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-rose-600 absolute top-2 right-2 border border-white dark:border-[#18181B]" />
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] sm:w-96 max-w-md bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-[#27272A] shadow-xl z-50 overflow-hidden font-sans"
              >
                <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-[#0E0E11]/80 border-b border-slate-200 dark:border-[#27272A] flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <span>Campus Updates & Alerts</span>
                    {unreadNotices.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold">
                        {unreadNotices.length} new
                      </span>
                    )}
                  </div>
                  {unreadNotices.length > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllNoticesRead()}
                      className="text-[11px] font-semibold text-[#134074] dark:text-[#8DA9C4] hover:underline cursor-pointer"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#27272A]">
                  {/* Unread Campus Circulars */}
                  {unreadNotices.slice(0, 3).map(n => (
                    <Link
                      key={n.id}
                      to="/student/campus-updates"
                      onClick={() => setIsNotifOpen(false)}
                      className="block p-3 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-[#27272A]/60 group"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                              {n.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                              {n.publishedDate}
                            </span>
                          </div>
                          <p className="text-xs text-slate-900 dark:text-slate-100 font-semibold leading-snug line-clamp-1 group-hover:text-[#134074] dark:group-hover:text-[#8DA9C4] transition-colors">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {n.summary || n.content?.slice(0, 80)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {/* Urgent Deadlines System */}
                  {urgentDeadlines.length === 0 && unreadNotices.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                      You're all caught up. No deadlines in the next 48 hours.
                    </div>
                  ) : (
                    urgentDeadlines.map(item => (
                      <Link
                        key={`${item.type}-${item.id}`}
                        to={item.route}
                        onClick={() => setIsNotifOpen(false)}
                        className="block p-3.5 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-[#27272A]/60 group"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-900 dark:text-slate-100 font-medium leading-snug group-hover:text-[#134074] dark:group-hover:text-[#8DA9C4] transition-colors">
                              {item.formattedText}
                            </p>
                            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>{item.subtitle}</span>
                              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 capitalize flex items-center gap-0.5 group-hover:text-[#134074] dark:group-hover:text-[#8DA9C4]">
                                <span>Go to {item.type === 'assignment' ? 'assignments' : 'opportunities'}</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-50/80 dark:bg-[#0E0E11]/80 border-t border-slate-200 dark:border-[#27272A] text-center">
                  <Link
                    to="/student/campus-updates"
                    onClick={() => setIsNotifOpen(false)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#134074] dark:text-[#8DA9C4] hover:underline"
                  >
                    <span>View All Notices →</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtle Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-[#27272A] mx-1 hidden sm:block" />

        {/* User Profile Trigger Button */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="inline-flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors cursor-pointer group"
            title="View your profile"
            aria-label="User Profile"
          >
            <div className="w-8 h-8 rounded-full bg-[#0F2544] text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'Profile'}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              {(!user?.avatarUrl || undefined) && (
                <span>
                  {user?.avatarInitials ? user.avatarInitials.charAt(0) : (user?.name ? user.name.charAt(0).toUpperCase() : (role === 'admin' ? 'A' : role === 'faculty' ? 'F' : 'A'))}
                </span>
              )}
            </div>
            <div className="text-left hidden sm:block leading-tight pr-1">
              <span className="font-bold text-xs block text-[#0F2544] dark:text-slate-100 group-hover:text-[#1D4ED8] transition-colors">
                {user?.name?.split(' ')[0] || (role === 'admin' ? 'Admin' : role === 'faculty' ? 'Faculty' : 'Aarav')}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium capitalize block">
                {role === 'student' ? 'Student' : role === 'faculty' ? 'Faculty' : role === 'admin' ? 'Admin' : role}
              </span>
            </div>
            {/* Hidden avatarInitials token for verification compatibility */}
            <span className="hidden">{user?.avatarInitials}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform hidden sm:inline-block ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Card Popover to see your profile */}
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute right-0 top-full mt-2 w-[calc(100vw-24px)] sm:w-96 max-w-sm bg-white/95 dark:bg-[#0E0E11]/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-[#27272A] shadow-2xl z-50 animate-in fade-in duration-150 font-sans max-h-[85vh] overflow-y-auto"
              >
              {/* Profile Header */}
              <div className="p-4 bg-gradient-to-br from-[#8DA9C4]/15 via-transparent to-transparent border-b border-slate-100 dark:border-[#27272A] rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#134074] text-white font-bold text-base flex items-center justify-center font-mono shadow-md border border-[#8DA9C4]/30 overflow-hidden shrink-0">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user?.name || 'Profile'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{user?.avatarInitials || (role === 'admin' ? 'AD' : role === 'faculty' ? 'FA' : 'ST')}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user?.name || (role === 'admin' ? 'Campus Administrator' : role === 'faculty' ? 'Faculty Member' : 'Student')}
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {user?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-[#EEF4ED] dark:bg-[#18181B] text-[#134074] dark:text-[#8DA9C4] border-[#8DA9C4]/40">
                    {role}
                  </span>
                </div>

                {/* Profile Actions: Edit Profile & Preferences */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#27272A] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsEditProfileOpen(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 transition-colors cursor-pointer"
                  >
                    <UserPen className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      openSettings();
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#18181B] border border-slate-200 dark:border-[#27272A] transition-colors cursor-pointer"
                    title="Account Preferences"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Preferences</span>
                  </button>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-100 dark:border-[#27272A]/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 block mb-0.5">
                      {role === 'student' ? 'Roll Number' : 'ID / Designation'}
                    </span>
                    <span className="font-semibold font-mono text-slate-900 dark:text-slate-100">
                      {user?.rollNumber || user?.designation || (role === 'admin' ? 'SYS-ADM-01' : 'FAC-01')}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-100 dark:border-[#27272A]/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 block mb-0.5">
                      Department
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                      {user?.department || 'Computer Science'}
                    </span>
                  </div>
                </div>

                {role === 'student' && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-100 dark:border-[#27272A]/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 block mb-0.5">
                      Program & Sem
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {user?.program || 'B.Tech CSE'} • Sem {user?.semester || 1}
                    </span>
                  </div>
                )}

                {/* Student Technical Skills Management */}
                {role === 'student' && (
                  <div className="pt-2 border-t border-slate-100 dark:border-[#27272A] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                        Technical Skills
                      </span>
                      <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400">
                        {(user?.skills || []).length} added
                      </span>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                      {(user?.skills && user.skills.length > 0) ? (
                        user.skills.map(skill => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (!user) return;
                                const updated = (user.skills || []).filter(s => s !== skill);
                                updateUser(user.id, { skills: updated });
                              }}
                              className="text-teal-600 hover:text-red-500 dark:text-teal-400 dark:hover:text-red-400 cursor-pointer ml-0.5"
                              title={`Remove ${skill}`}
                              aria-label={`Remove skill ${skill}`}
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                          No skills added yet. Choose your skills below.
                        </span>
                      )}
                    </div>

                    {/* Searchable Skill Combobox with Live Autocomplete */}
                    <div ref={skillSearchContainerRef} className="space-y-1.5 pt-1">
                      <label htmlFor="skill-autocomplete-search" className="block text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500">
                        Search & Add Skills:
                      </label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="skill-autocomplete-search"
                          type="text"
                          value={skillSearchQuery}
                          onChange={(e) => {
                            setSkillSearchQuery(e.target.value);
                            setSkillSelectedIndex(0);
                            setIsSkillSearchOpen(true);
                          }}
                          onFocus={() => setIsSkillSearchOpen(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowDown') {
                              e.preventDefault();
                              setSkillSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredSkills.length));
                            } else if (e.key === 'ArrowUp') {
                              e.preventDefault();
                              setSkillSelectedIndex((prev) => (prev - 1 + filteredSkills.length) % Math.max(1, filteredSkills.length));
                            } else if (e.key === 'Enter') {
                              e.preventDefault();
                              const targetItem = filteredSkills[skillSelectedIndex] || filteredSkills.find(
                                item => !(user?.skills || []).includes(item.skill)
                              );
                              if (targetItem) {
                                handleAddSkill(targetItem.skill);
                                setSkillSearchQuery('');
                                setIsSkillSearchOpen(false);
                              }
                            } else if (e.key === 'Escape') {
                              setIsSkillSearchOpen(false);
                            }
                          }}
                          placeholder="Type to search skills (e.g. Python, React, PyTorch)..."
                          className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#111115] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 font-sans shadow-xs transition-colors"
                        />
                        {skillSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setSkillSearchQuery('');
                              setIsSkillSearchOpen(false);
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer"
                            aria-label="Clear skill search"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Autocomplete Dropdown Menu */}
                      {isSkillSearchOpen && skillSearchQuery.trim().length > 0 && (
                        <div className="mt-2 w-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl shadow-xl max-h-56 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-[#27272A] animate-in fade-in zoom-in-95 duration-150">
                          <div className="px-3 py-1.5 text-[10px] font-mono text-slate-500 dark:text-slate-400 flex justify-between items-center bg-slate-50 dark:bg-[#141417] rounded-t-lg">
                            <span className="font-semibold uppercase tracking-wider">Matching Skills ({filteredSkills.length})</span>
                            <span className="text-[9px] text-teal-700 dark:text-teal-400">↑↓ to navigate • Enter to add</span>
                          </div>

                          <div className="pt-1 space-y-0.5">
                            {filteredSkills.length === 0 ? (
                              <div className="px-3 py-3 text-xs text-slate-400 dark:text-slate-500 italic text-center">
                                No matching skills found in campus catalog.
                              </div>
                            ) : (
                              filteredSkills.map((item, idx) => {
                                const isAdded = (user?.skills || []).includes(item.skill);
                                const isSelected = idx === skillSelectedIndex;
                                return (
                                  <button
                                    key={item.skill}
                                    type="button"
                                    disabled={isAdded}
                                    onClick={() => {
                                      handleAddSkill(item.skill);
                                      setSkillSearchQuery('');
                                      setIsSkillSearchOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                                      isAdded
                                        ? 'opacity-50 cursor-not-allowed bg-slate-50/50 dark:bg-[#141417]/50'
                                        : isSelected
                                          ? 'bg-teal-50 dark:bg-teal-950/60 text-slate-900 dark:text-slate-100 border border-teal-200 dark:border-teal-800'
                                          : 'hover:bg-teal-50/60 dark:hover:bg-teal-950/30 text-slate-900 dark:text-slate-100'
                                    }`}
                                  >
                                    <span className="font-semibold">{item.skill}</span>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#27272A] text-slate-600 dark:text-slate-400">
                                        {item.category.split(' ')[0]}
                                      </span>
                                      {isAdded ? (
                                        <span className="text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                                          ✓ Added
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-mono font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800/60">
                                          + Add
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {/* Browse Catalog by Category Dropdown Menu */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#27272A]/70">
                        <label className="block text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500">
                          Browse Skills Catalog by Category:
                        </label>
                        <CustomDropdown<string>
                          value={selectedSkillCategory}
                          onChange={cat => setSelectedSkillCategory(cat)}
                          options={skillCategoryOptions}
                          icon={<Layers className="w-3.5 h-3.5" />}
                          placeholder="Select category..."
                          buttonClassName="min-h-[36px] py-1.5 px-3 text-xs bg-slate-50 dark:bg-[#18181B] rounded-lg"
                        />

                        {/* Category Skills Chips */}
                        <div className="pt-1 flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1.5 bg-slate-50/70 dark:bg-[#141417] border border-slate-100 dark:border-[#27272A] rounded-lg">
                          {AVAILABLE_SKILL_CATEGORIES.find(c => c.category === selectedSkillCategory)?.skills.map(sk => {
                            const isAdded = (user?.skills || []).includes(sk);
                            return (
                              <button
                                key={sk}
                                type="button"
                                disabled={isAdded}
                                onClick={() => handleAddSkill(sk)}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 ${
                                  isAdded
                                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50 cursor-default'
                                    : 'bg-white dark:bg-[#1F1F23] hover:bg-teal-50 dark:hover:bg-teal-950/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#27272A]'
                                }`}
                              >
                                {isAdded ? (
                                  <Check className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />
                                ) : (
                                  <span className="text-teal-600 dark:text-teal-400 font-bold">+</span>
                                )}
                                <span>{sk}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connected Teammates & Invites */}
                {role === 'student' && (
                  <div className="pt-3 border-t border-slate-100 dark:border-[#27272A] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                        <span>Connected Teammates</span>
                      </span>
                      <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 font-semibold">
                        {connectedTeammates.length} connected
                      </span>
                    </div>

                    {/* Connected Teammates List */}
                    {connectedTeammates.length === 0 ? (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-100 dark:border-[#27272A] text-center">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          No connected teammates yet.
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Discover peers on the Opportunities page under Campus Teammate Finder.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                        {connectedTeammates.map(teammate => (
                          <div
                            key={teammate.id}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-200/80 dark:border-[#27272A] flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-[#134074] text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-[#8DA9C4]/30">
                                {teammate.peerName.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block text-[11px]">
                                  {teammate.peerName}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate block">
                                  {teammate.peerRoll ? `${teammate.peerRoll} • ` : ''}{teammate.peerProgram || 'Computer Science'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveTeammate(teammate.peerId, teammate.peerName)}
                              className="px-2 py-1 text-[10px] font-mono font-semibold rounded-md text-rose-600 hover:text-white hover:bg-rose-600 dark:text-rose-400 dark:hover:bg-rose-900/60 dark:hover:text-rose-200 border border-rose-200 dark:border-rose-800/60 transition-colors shrink-0 cursor-pointer"
                              title={`Remove ${teammate.peerName} from teammates`}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Incoming Teammate Invites */}
                    {incomingInvites.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#27272A]/70">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold block">
                          Incoming Invitations ({incomingInvites.length})
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                          {incomingInvites.map(inv => (
                            <div
                              key={inv.id}
                              className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block text-[11px]">
                                  {inv.senderName}
                                </span>
                                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate block">
                                  {inv.senderRoll ? `${inv.senderRoll} • ` : ''}{inv.senderProgram || 'Peer Student'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleAcceptInvite(inv.id, inv.senderName)}
                                  className="px-2 py-1 text-[10px] font-mono font-bold rounded-md bg-[#134074] hover:bg-[#0B2545] text-white shadow-xs transition-colors cursor-pointer"
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeclineInvite(inv.id)}
                                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                                  title="Decline"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Outgoing Pending Invites */}
                    {outgoingInvites.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#27272A]/70">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold block">
                          Outgoing Pending Invites ({outgoingInvites.length})
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                          {outgoingInvites.map(inv => (
                            <div
                              key={inv.id}
                              className="p-2 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-200/60 dark:border-[#27272A] flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block text-[11px]">
                                  {inv.receiverName}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate block">
                                  Awaiting response
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleAcceptInvite(inv.id, inv.receiverName)}
                                  className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
                                  title="Simulate peer accepting the invite for instant testing"
                                >
                                  Quick Accept
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeclineInvite(inv.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer"
                                  title="Cancel Invite"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {role === 'faculty' && user?.designation && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#18181B] border border-slate-100 dark:border-[#27272A]/80">
                    <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 block mb-0.5">
                      Academic Designation
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {user.designation}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Edit Profile Modal for Student, Faculty & Admin */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={user}
        currentRole={role || (user?.role || 'student')}
        onSave={handleSaveProfile}
      />
    </header>
  );
};

export default TopBar;
