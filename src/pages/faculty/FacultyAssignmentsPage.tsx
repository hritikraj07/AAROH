import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import {
  FileText,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  BookOpen,
  Code,
  Lock,
  Play,
  Square,
  ExternalLink,
  Trash2,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import { Assignment, TestCase } from '../../types';

const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

export const FacultyAssignmentsPage: React.FC = () => {
  const { courses, assignments, createAssignment, updateAssignmentLabStatus } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCodingModalOpen, setIsCodingModalOpen] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [incidentReviewAsg, setIncidentReviewAsg] = useState<Assignment | null>(null);

  // Standard Assignment Form State
  const [courseId, setCourseId] = useState<string>(courses[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [maxMarks, setMaxMarks] = useState<number>(20);

  // Coding Assignment Form State
  const [codingCourseId, setCodingCourseId] = useState<string>(courses[0]?.id || '');
  const [codingTitle, setCodingTitle] = useState('Lab 04: Two Sum & Hash Map Lookup');
  const [codingDescription, setCodingDescription] = useState(
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Each input will have exactly one solution.'
  );
  const [codingLanguage, setCodingLanguage] = useState('python');
  const [starterCode, setStarterCode] = useState(
    `def solution(nums, target):\n    # Write your solution below\n    # Example: return [0, 1]\n    return []`
  );
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: '1', input: 'nums = [2, 7, 11, 15], target = 9', expectedOutput: '[0, 1]' },
    { id: '2', input: 'nums = [3, 2, 4], target = 6', expectedOutput: '[1, 2]' },
  ]);
  const [codingDueDate, setCodingDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [codingMaxMarks, setCodingMaxMarks] = useState<number>(25);

  const filteredAssignments = assignments.filter(a => {
    if (selectedCourseFilter === 'all') return true;
    return a.courseId === selectedCourseFilter;
  });

  const codingAssignments = assignments.filter(a => a.type === 'coding');

  const handleCreateStandardAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const targetCourse = courses.find(c => c.id === courseId) || courses[0];
    if (!targetCourse) return;

    createAssignment({
      courseId: targetCourse.id,
      title: title.trim(),
      description: description.trim() || 'Complete the assigned problem set and submit before deadline.',
      dueDate,
      maxMarks: Number(maxMarks) || 20,
      type: 'standard',
    });

    setTitle('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  const handleAddTestCase = () => {
    setTestCases(prev => [
      ...prev,
      {
        id: String(Date.now()),
        input: 'nums = [3, 3], target = 6',
        expectedOutput: '[0, 1]',
      },
    ]);
  };

  const handleRemoveTestCase = (id: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== id));
  };

  const handleUpdateTestCase = (id: string, field: 'input' | 'expectedOutput', value: string) => {
    setTestCases(prev =>
      prev.map(tc => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  const handleCreateCodingAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codingTitle.trim() || !codingDueDate) return;

    const targetCourse = courses.find(c => c.id === codingCourseId) || courses[0];
    if (!targetCourse) return;

    createAssignment({
      courseId: targetCourse.id,
      title: codingTitle.trim(),
      description: codingDescription.trim(),
      dueDate: codingDueDate,
      maxMarks: Number(codingMaxMarks) || 25,
      type: 'coding',
      language: codingLanguage,
      starterCode: starterCode.trim(),
      testCases,
      labStatus: 'locked',
    });

    setIsCodingModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Assignment Management & Live Lab Controls
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create standard coursework or automated coding live labs, and control real-time student session execution.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {courses.length > 0 && (
            <select
              value={selectedCourseFilter}
              onChange={e => setSelectedCourseFilter(e.target.value)}
              className="text-xs font-mono px-3 py-1.5 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="all">All Courses ({assignments.length})</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              if (courses.length > 0 && !courseId) setCourseId(courses[0].id);
              setIsAddModalOpen(true);
            }}
          >
            Post Standard Task
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Code className="w-3.5 h-3.5 text-teal-200" />}
            onClick={() => {
              if (courses.length > 0 && !codingCourseId) setCodingCourseId(courses[0].id);
              setIsCodingModalOpen(true);
            }}
          >
            Create Coding Assignment
          </Button>
        </div>
      </div>

      {/* 2. Live Lab Controls Panel (For Coding Assignments) */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Live Lab Controls
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-semibold">
              {codingAssignments.length} ACTIVE LABS
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono hidden sm:block">
            Controls propagate offline in real time across student workspaces
          </p>
        </div>

        {codingAssignments.length === 0 ? (
          <div className="py-12 text-center text-xs bg-white border border-slate-200 text-slate-500 dark:bg-[#18181B] dark:border-white/5 dark:text-slate-400 rounded-2xl space-y-3 p-6 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#111115] flex items-center justify-center text-slate-400 dark:text-teal-400 mb-1 border border-slate-200 dark:border-white/5">
              <Code className="w-5 h-5 text-slate-400 dark:text-teal-400" />
            </div>
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">No Automated Coding Labs assigned yet.</p>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Configure automated test cases, starter code templates, and proctored live evaluation for your course students.
            </p>
            <button
              type="button"
              onClick={() => setIsCodingModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0D6861] active:bg-[#115E59] rounded-xl transition-all duration-200 active:scale-95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)] cursor-pointer select-none"
            >
              <Code className="w-3.5 h-3.5 text-white" />
              <span>Configure Automated Coding Lab</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {codingAssignments.map(asg => {
              const course = courses.find(c => c.id === asg.courseId);
              const status = asg.labStatus || 'locked';

              return (
                <div
                  key={asg.id}
                  className="p-4 rounded-lg border border-slate-200 dark:border-[#27272A] bg-[#FAFAFA] dark:bg-[#27272A]/40 flex flex-col justify-between space-y-3 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300 bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded">
                          {course?.code || 'CS'}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-slate-200/70 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300">
                          {asg.language || 'python'}
                        </span>
                      </div>

                      {/* Lab Status Badge */}
                      {status === 'active' ? (
                        <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          LIVE ACTIVE
                        </span>
                      ) : status === 'closed' ? (
                        <span className="text-[10px] font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full font-mono">
                          CLOSED
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                          <Lock className="w-3 h-3 text-slate-500" />
                          LOCKED
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {asg.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {asg.description}
                    </p>

                    <div className="text-[10px] text-slate-400 font-mono">
                      {asg.testCases?.length || 0} test cases • Max {asg.maxMarks} marks
                    </div>
                  </div>

                  {/* Primary Lab Control Actions */}
                  <div className="pt-3 border-t border-slate-200/80 dark:border-[#27272A] flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {status !== 'active' ? (
                        <button
                          onClick={() => updateAssignmentLabStatus(asg.id, 'active')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-[#0D6861] active:scale-95 transition-transform duration-150 rounded-md"
                        >
                          <Play className="w-3 h-3 text-teal-200 fill-teal-200" />
                          <span>Start Live Lab</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => updateAssignmentLabStatus(asg.id, 'closed')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-transform duration-150 rounded-md"
                        >
                          <Square className="w-3 h-3 text-white fill-white" />
                          <span>End Lab</span>
                        </button>
                      )}

                      {status === 'closed' && (
                        <button
                          onClick={() => updateAssignmentLabStatus(asg.id, 'locked')}
                          className="px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-md active:scale-95 transition-transform duration-150"
                        >
                          Reset Locked
                        </button>
                      )}
                    </div>

                    <Link
                      to={`/student/assignments/code/${asg.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline"
                    >
                      <span>Preview Workspace</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submitted Coding Labs & Proctoring Audit Registry */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#27272A] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
              Submitted Coding Labs & Cybersecurity Proctoring Audit
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Zero-Trust Continuous Keystroke DNA & Focus Monitoring
          </span>
        </div>

        {codingAssignments.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 font-sans">
            No Automated Coding Lab submissions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#27272A]/70 border-b border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Student & Security Status</th>
                  <th className="py-3 px-4">Lab Title & Subject</th>
                  <th className="py-3 px-4">Submission / Incident Time</th>
                  <th className="py-3 px-4">Proctoring Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                {codingAssignments.map(asg => {
                  const course = courses.find(c => c.id === asg.courseId);
                  const isBreach = asg.status === 'SECURITY_BREACH';
                  const studentDisplayName = asg.studentName || 'Aarav Sharma';

                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/50 dark:hover:bg-[#27272A]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {studentDisplayName}
                          </span>
                          {isBreach && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)] animate-pulse">
                              <ShieldAlert className="w-3 h-3 text-[#0F766E]" />
                              <span>Security Flag: Biometric / Focus Anomaly</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {asg.studentEmail || 'aarav.sharma@aaroh.edu.in'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {asg.title}
                        </div>
                        <div className="font-mono text-[10px] text-teal-800 dark:text-teal-400">
                          {course?.code || 'CS301'} • {course?.name || 'Computer Science'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {asg.submittedAt ? new Date(asg.submittedAt).toLocaleTimeString() : 'In Progress'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isBreach ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-rose-300 bg-rose-950 border border-rose-600 px-2 py-0.5 rounded">
                            <AlertOctagon className="w-3 h-3 text-rose-400" />
                            <span>SECURITY_BREACH (Strikes 2/2)</span>
                          </span>
                        ) : asg.status === 'submitted' ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified Clean</span>
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            Active / Unsubmitted
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isBreach ? (
                          <button
                            type="button"
                            onClick={() => setIncidentReviewAsg(asg)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0D6861] active:bg-[#115E59] rounded-xl transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} cursor-pointer select-none`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                            <span>Review Incident</span>
                          </button>
                        ) : (
                          <Link
                            to={`/student/assignments/code/${asg.id}`}
                            className="inline-flex items-center gap-1 text-xs text-teal-700 dark:text-teal-400 hover:text-teal-900 font-semibold px-2 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-950/40"
                          >
                            <span>Inspect Lab</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Main Coursework Registry Table */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#27272A] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            All Coursework Assignments ({filteredAssignments.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {filteredAssignments.filter(a => a.type === 'coding').length} Live Labs • {filteredAssignments.filter(a => a.type !== 'coding').length} Standard Tasks
          </span>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            No assignments match the selected course filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#27272A]/70 border-b border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Title & Type</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Max Marks</th>
                  <th className="py-3 px-4">Status / Lab State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#27272A]">
                {filteredAssignments.map(asg => (
                  <tr key={asg.id} className="hover:bg-slate-50/50 dark:hover:bg-[#27272A]/40">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-900 dark:text-teal-300">
                      {courses.find(c => c.id === asg.courseId)?.code || 'CRS'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{asg.title}</span>
                        {asg.type === 'coding' ? (
                          <span className="text-[10px] font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 px-1.5 py-0.2 rounded font-mono">
                            LIVE LAB ({asg.language})
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded">
                            STANDARD
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-md mt-0.5">
                        {asg.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {asg.dueDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {asg.maxMarks} pts
                    </td>
                    <td className="py-3.5 px-4">
                      {asg.status === 'SECURITY_BREACH' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 inline-flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3 text-rose-500" />
                          <span>SECURITY_BREACH</span>
                        </span>
                      ) : asg.type === 'coding' ? (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                            asg.labStatus === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : asg.labStatus === 'closed'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          LAB: {(asg.labStatus || 'locked').toUpperCase()}
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            asg.status === 'submitted'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : asg.status === 'overdue'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {asg.status === 'submitted' ? 'Graded' : asg.status === 'overdue' ? 'Overdue' : 'Active'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {asg.status === 'SECURITY_BREACH' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setIncidentReviewAsg(asg)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0D6861] active:bg-[#115E59] rounded-xl transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} cursor-pointer select-none`}
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                            <span>Review Incident</span>
                          </button>
                        </div>
                      ) : asg.type === 'coding' ? (
                        <Link
                          to={`/student/assignments/code/${asg.id}`}
                          className="text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 font-semibold px-2 py-1 rounded hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Open Workspace</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-xs">Standard Submission</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Standard Assignment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg shadow-sm max-w-md w-full p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-800 dark:text-teal-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Post Standard Assignment</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStandardAssignment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Course <span className="text-rose-600">*</span>
                </label>
                <select
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assignment Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Problem Set 3: Database Normalization"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#18181B] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Submission Guidelines
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions, rubric criteria, or problem set links..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#18181B] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Marks</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={maxMarks}
                    onChange={e => setMaxMarks(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#27272A]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={courses.length === 0}
                >
                  Publish Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coding Assignment Creation Modal */}
      {isCodingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg shadow-sm max-w-2xl w-full p-6 space-y-4 animate-in fade-in duration-150 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Create Live Lab Coding Assignment</h3>
              </div>
              <button
                onClick={() => setIsCodingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCodingAssignment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Course <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={codingCourseId}
                    onChange={e => setCodingCourseId(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Programming Language <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={codingLanguage}
                    onChange={e => setCodingLanguage(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  >
                    <option value="python">Python 3 (CPython)</option>
                    <option value="javascript">JavaScript (Node.js ES6)</option>
                    <option value="cpp">C++ (GCC 11)</option>
                    <option value="java">Java (OpenJDK 17)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lab Problem Title <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab 04: Binary Search Algorithm"
                  value={codingTitle}
                  onChange={e => setCodingTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#18181B] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Problem Description & Constraints
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed specifications, runtime constraints, and input format..."
                  value={codingDescription}
                  onChange={e => setCodingDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#18181B] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-700 resize-none font-sans"
                />
              </div>

              {/* Starter Code Editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Starter Code Template <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    Pre-filled in student workspace
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={starterCode}
                  onChange={e => setStarterCode(e.target.value)}
                  className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-100 rounded border border-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Dynamic Test Cases Builder */}
              <div className="p-3.5 bg-slate-50 dark:bg-[#27272A]/50 border border-slate-200 dark:border-[#27272A] rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      Automated Test Cases Builder ({testCases.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Test Case</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {testCases.map((tc, index) => (
                    <div
                      key={tc.id}
                      className="p-3 bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-md grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-0.5">
                          Test #{index + 1} Input
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. nums = [2, 7], target = 9"
                          value={tc.input}
                          onChange={e => handleUpdateTestCase(tc.id, 'input', e.target.value)}
                          className="w-full text-xs font-mono px-2 py-1 border border-slate-200 dark:border-[#27272A] rounded bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-mono text-slate-400 uppercase mb-0.5">
                          Expected Output
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. [0, 1]"
                          value={tc.expectedOutput}
                          onChange={e => handleUpdateTestCase(tc.id, 'expectedOutput', e.target.value)}
                          className="w-full text-xs font-mono px-2 py-1 border border-slate-200 dark:border-[#27272A] rounded bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                        />
                      </div>
                      <div className="flex justify-end pt-3 sm:pt-0">
                        {testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(tc.id)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                            title="Remove test case"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={codingDueDate}
                    onChange={e => setCodingDueDate(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Marks</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={codingMaxMarks}
                    onChange={e => setCodingMaxMarks(Number(e.target.value))}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 dark:border-[#27272A] rounded bg-white dark:bg-[#18181B] text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#27272A]">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCodingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={courses.length === 0}
                >
                  Create Live Lab (Locked)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Review Modal */}
      {incidentReviewAsg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-2xl w-full bg-[#18181B] border-2 border-rose-600 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0F766E] via-rose-500 to-[#0F766E]" />

            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-950 border border-rose-500/50 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Cybersecurity Incident Review
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Zero-Trust 2-Strike Proctoring Engine Audit Trail
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIncidentReviewAsg(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student & Violation Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Student Candidate</div>
                <div className="font-bold text-slate-100">{incidentReviewAsg.studentName || 'Aarav Sharma'}</div>
                <div className="text-[11px] text-teal-400">{incidentReviewAsg.studentEmail || 'aarav.sharma@aaroh.edu.in'}</div>
              </div>

              <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-1">
                <div className="text-[10px] text-slate-400 uppercase">Breach Classification</div>
                <div className="font-bold text-rose-400">Security Flag: Biometric / Focus Anomaly</div>
                <div className="text-[11px] text-amber-300">Strikes: 2 / 2 (Exam Terminated)</div>
              </div>
            </div>

            {/* Breach Reason & Trigger Log */}
            <div className="p-3.5 bg-rose-950/40 border border-rose-900/60 rounded-xl space-y-1.5 font-mono text-xs text-slate-200">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-rose-400 font-bold uppercase">Incident Log & Violation Trigger</span>
                <span className="text-slate-400">{incidentReviewAsg.submittedAt ? new Date(incidentReviewAsg.submittedAt).toLocaleTimeString() : 'Recent'}</span>
              </div>
              <p className="text-xs text-rose-200 leading-relaxed">
                {incidentReviewAsg.securityIncident?.reason ||
                  '🚨 Warning: Biometric Anomaly Detected. Unnatural typing speed or clipboard pasting is strictly prohibited.'}
              </p>
            </div>

            {/* Captured Code Snapshot */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>CAPTURED CODE SNAPSHOT AT LOCKDOWN:</span>
                <span>Language: {incidentReviewAsg.language || 'python'}</span>
              </div>
              <div className="max-h-48 overflow-y-auto bg-black/70 border border-white/10 rounded-xl p-3 font-mono text-xs text-slate-300 leading-relaxed">
                <pre className="whitespace-pre-wrap select-text">
                  {incidentReviewAsg.studentCode || incidentReviewAsg.starterCode || '// No code captured prior to lockout'}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIncidentReviewAsg(null)}
                className={`px-4 py-2 text-xs font-bold text-white bg-[#0F766E] hover:bg-[#0D6861] active:bg-[#115E59] rounded-xl transition-all duration-200 active:scale-95 ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover} cursor-pointer select-none`}
              >
                <span>Acknowledge & Close Incident</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAssignmentsPage;
