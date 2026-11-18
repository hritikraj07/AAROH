import React, { useState } from 'react';
import {
  X,
  Network,
  Lock,
  Unlock,
  CheckCircle2,
  ArrowRight,
  Code2,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { SkillTree, SkillTreeNode } from '../../../types';
import { Badge } from '../../ui/Badge';
import { useNavigate } from 'react-router-dom';

interface SkillTreeModalProps {
  courseId: string;
  courseName?: string;
  courseCode?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SkillTreeModal: React.FC<SkillTreeModalProps> = ({
  courseId,
  courseName,
  courseCode,
  isOpen,
  onClose,
}) => {
  const { skillTrees, assignments, submitCodingAssignment, showToast } = useApp();
  const navigate = useNavigate();

  // Local state for interactive instant simulation in hackathon demo
  const [simulatedCompletedIds, setSimulatedCompletedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  // Retrieve matching tree or fallback to default
  const tree: SkillTree | undefined =
    skillTrees.find(
      t =>
        t.courseId === courseId ||
        t.courseCode.toLowerCase() === (courseCode || '').toLowerCase()
    ) || skillTrees[0];

  const effectiveCourseCode = courseCode || tree?.courseCode || 'CS301';
  const effectiveCourseName =
    courseName || tree?.courseName || 'Operating Systems & System Architecture';
  const allNodes: SkillTreeNode[] = tree?.nodes || [];

  // Determine which automated coding labs the student has passed
  const passedCodingLabs = assignments.filter(
    a =>
      a.type === 'coding' &&
      (a.status === 'submitted' || a.status === 'graded') &&
      (!a.testResultsSummary || !a.testResultsSummary.includes('❌'))
  );

  // Helper to test if a node is completed
  const isNodeCompleted = (node: SkillTreeNode): boolean => {
    if (simulatedCompletedIds.includes(node.id)) return true;
    if (node.isCompleted) return true;

    // Check against passed coding labs
    return passedCodingLabs.some(lab => {
      const keyword = (node.requiredLabKeyword || node.title).toLowerCase();
      const labTitle = (lab.title || '').toLowerCase();
      const labDesc = (lab.description || '').toLowerCase();
      const labLang = (lab.language || '').toLowerCase();
      return (
        labTitle.includes(keyword) ||
        labDesc.includes(keyword) ||
        labLang.includes(keyword)
      );
    });
  };

  // Helper to test if a node's prerequisites are met
  const isNodeAvailable = (node: SkillTreeNode): boolean => {
    if (isNodeCompleted(node)) return false;
    if (!node.prerequisiteId) return true; // Root node is available
    const prereq = allNodes.find(n => n.id === node.prerequisiteId);
    if (!prereq) return true;
    return isNodeCompleted(prereq);
  };

  const handleSimulatePass = (node: SkillTreeNode) => {
    setSimulatedCompletedIds(prev =>
      prev.includes(node.id) ? prev.filter(id => id !== node.id) : [...prev, node.id]
    );

    showToast({
      type: 'success',
      title: 'Automated Coding Lab Verified',
      message: `Unlocked skill badge: "${node.title}"!`,
    });
  };

  const handleLaunchLab = (node: SkillTreeNode) => {
    onClose();
    navigate('/student/academics?tab=assignments');
    showToast({
      type: 'info',
      title: 'Automated Coding Lab',
      message: `Launch coding assignment matching "${node.title}".`,
    });
  };

  // Calculate master progress percentage
  const completedCount = allNodes.filter(isNodeCompleted).length;
  const progressPct =
    allNodes.length > 0 ? Math.round((completedCount / allNodes.length) * 100) : 0;

  // Group nodes by level (Tiers 1 to 5)
  const tiers = [1, 2, 3, 4, 5].map(lvl => ({
    level: lvl,
    nodes: allNodes.filter(n => n.level === lvl),
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-3xl shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-[#27272A] flex items-center justify-between bg-slate-50/70 dark:bg-[#0E0E11]/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 flex items-center justify-center shadow-sm">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-900/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-700">
                  {effectiveCourseCode}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  B.Tech Skill Tree & Mastery Map
                </h2>
                <Badge variant="teal" size="sm">
                  Curriculum Prerequisite Progression
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {effectiveCourseName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-xs font-mono">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {completedCount}/{allNodes.length} Skills
              </span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">
                ({progressPct}%)
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors cursor-pointer"
              title="Close Skill Tree"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend & Instructions Bar */}
        <div className="px-6 py-2.5 bg-slate-100/60 dark:bg-[#0E0E11] border-b border-slate-200/80 dark:border-[#27272A] flex items-center justify-between flex-wrap gap-2 text-[11px] shrink-0 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full bg-[#0F766E] border border-teal-700" />
              <span>✅ Completed (Lab Passed)</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full bg-[#18181B] border border-teal-500 animate-pulse" />
              <span>🔓 Available (Ready)</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-500">
              <span className="w-3 h-3 rounded-full bg-[#18181B] border border-slate-800" />
              <span>🔒 Locked (Prerequisite Required)</span>
            </span>
          </div>

          <span className="text-slate-400 dark:text-slate-500 text-[10px]">
            ⚡ Click an Available node to test / launch Automated Coding Lab
          </span>
        </div>

        {/* 2D Visual Curriculum Node Map Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/40 dark:bg-[#0E0E11]/40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {tiers.map(({ level, nodes: tierNodes }) => (
              <div key={level} className="flex flex-col space-y-4">
                {/* Tier Stage Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#27272A]">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                      Tier {level}
                    </span>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {level === 1
                        ? 'Foundations'
                        : level === 2
                        ? 'Core Concepts'
                        : level === 3
                        ? 'Advanced Systems'
                        : level === 4
                        ? 'Specialization'
                        : 'Capstone'}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {tierNodes.length}
                  </span>
                </div>

                {/* Staggered Node Cards */}
                <div className="space-y-4 flex-1">
                  {tierNodes.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center justify-center p-3 text-center text-[11px] font-mono text-slate-400 dark:text-slate-600">
                      No Tier {level} modules
                    </div>
                  ) : (
                    tierNodes.map((node, nodeIdx) => {
                      const completed = isNodeCompleted(node);
                      const available = isNodeAvailable(node);
                      const locked = !completed && !available;
                      const globalIdx = allNodes.findIndex(n => n.id === node.id);

                      return (
                        <div
                          key={node.id}
                          style={{
                            animationDelay: `${Math.max(0, globalIdx) * 120}ms`,
                          }}
                          className={`animate-in fade-in zoom-in-95 duration-500 rounded-2xl p-4 transition-all duration-200 relative flex flex-col justify-between space-y-3 ${
                            completed
                              ? 'bg-[#0F766E] text-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)] border border-teal-600'
                              : available
                              ? 'border border-teal-500 animate-pulse dark:bg-[#18181B] dark:text-slate-300 bg-white text-slate-800 shadow-sm'
                              : 'bg-slate-100/80 text-slate-400 border border-slate-200 dark:bg-[#18181B] dark:text-slate-600 dark:border-slate-800'
                          }`}
                        >
                          <div>
                            {/* Status Header Badge */}
                            <div className="flex items-center justify-between gap-1 mb-2">
                              {completed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full font-mono">
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                  <span>Mastered</span>
                                </span>
                              ) : available ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700 px-2 py-0.5 rounded-full font-mono">
                                  <Unlock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                                  <span>Available</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-200/60 dark:bg-slate-900 text-slate-500 dark:text-slate-500 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full font-mono">
                                  <Lock className="w-3 h-3 text-slate-400 dark:text-slate-600" />
                                  <span>Locked</span>
                                </span>
                              )}

                              <span
                                className={`text-[10px] font-mono ${
                                  completed
                                    ? 'text-teal-100'
                                    : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                T{node.level}
                              </span>
                            </div>

                            <h4
                              className={`text-xs font-bold leading-snug ${
                                completed
                                  ? 'text-white'
                                  : available
                                  ? 'text-slate-900 dark:text-slate-100'
                                  : 'text-slate-500 dark:text-slate-600'
                              }`}
                            >
                              {node.title}
                            </h4>

                            {node.description && (
                              <p
                                className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                                  completed
                                    ? 'text-teal-50/90'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {node.description}
                              </p>
                            )}
                          </div>

                          {/* Prerequisites & Action Controls */}
                          <div
                            className={`pt-2 border-t text-[10px] space-y-2 ${
                              completed
                                ? 'border-teal-600/60 text-teal-100'
                                : 'border-slate-200/60 dark:border-[#27272A] text-slate-500 dark:text-slate-500'
                            }`}
                          >
                            {node.prerequisiteTitle || node.prerequisiteId ? (
                              <div className="flex items-center gap-1 font-mono">
                                <ArrowRight className="w-3 h-3 shrink-0" />
                                <span className="truncate">
                                  Prereq: {node.prerequisiteTitle || 'Prior Module'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-[10px] font-mono">
                                <Unlock className="w-3 h-3 text-amber-300 shrink-0" />
                                <span>No prerequisite required</span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                              {available && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleLaunchLab(node)}
                                    className="rounded-full bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-medium px-2.5 py-1 transition-all active:scale-95 shadow-sm inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Code2 className="w-3 h-3" />
                                    <span>Launch Coding Lab</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleSimulatePass(node)}
                                    className="text-[10px] font-mono px-2 py-1 rounded text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                                    title="Simulate Passing Test Cases"
                                  >
                                    Verify Pass ✓
                                  </button>
                                </>
                              )}

                              {completed && (
                                <button
                                  type="button"
                                  onClick={() => handleSimulatePass(node)}
                                  className="text-[10px] font-mono text-teal-100 underline hover:text-white"
                                >
                                  Retake Lab
                                </button>
                              )}

                              {locked && (
                                <span className="text-[10px] italic text-slate-400 dark:text-slate-600 font-mono">
                                  Complete Tier {Math.max(1, node.level - 1)} first
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#0E0E11] border-t border-slate-200 dark:border-[#27272A] flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Automated Coding Lab synchronization: Active • Offline LocalStorage Engine
          </span>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 font-medium transition-all active:scale-95 cursor-pointer"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillTreeModal;
