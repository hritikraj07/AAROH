import React, { useState, useEffect } from 'react';
import {
  Network,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Lock,
  GitBranch,
  Layers,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SkillTree, SkillTreeNode, Course } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const AdminCurriculumPage: React.FC = () => {
  const { courses, skillTrees, saveSkillTree, showToast } = useApp();

  // If no courses exist yet in the database, provide standard defaults
  const effectiveCourses: Array<Pick<Course, 'id' | 'code' | 'name'>> =
    courses.length > 0
      ? courses
      : [
          { id: 'all_cs', code: 'CS301', name: 'Operating Systems & System Architecture' },
          { id: 'cs_ds', code: 'CS201', name: 'Data Structures & Algorithms' },
          { id: 'cs_ai', code: 'CS401', name: 'Machine Learning & Deep Learning' },
        ];

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    effectiveCourses[0]?.id || 'all_cs'
  );

  // Active tree being edited
  const [nodes, setNodes] = useState<SkillTreeNode[]>([]);
  const [isAddingNode, setIsAddingNode] = useState(false);

  // New Node Form State
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [newNodeDescription, setNewNodeDescription] = useState('');
  const [newNodePrereqId, setNewNodePrereqId] = useState<string>('');
  const [newNodeLevel, setNewNodeLevel] = useState<number>(1);
  const [newNodeKeyword, setNewNodeKeyword] = useState<string>('');

  // Load tree when selected course changes
  useEffect(() => {
    const existing = skillTrees.find(
      t =>
        t.courseId === selectedCourseId ||
        t.courseCode.toLowerCase() === selectedCourseId.toLowerCase()
    );

    if (existing && existing.nodes.length > 0) {
      setNodes(existing.nodes);
    } else {
      // Initialize with standard foundation node
      setNodes([
        {
          id: `node_root_${Date.now()}`,
          courseId: selectedCourseId,
          title: 'Core Programming Fundamentals',
          description: 'Procedural logic, control flow, functions, and memory basics.',
          level: 1,
          requiredLabKeyword: 'core',
        },
      ]);
    }
  }, [selectedCourseId, skillTrees]);

  const activeCourse =
    effectiveCourses.find(c => c.id === selectedCourseId) || effectiveCourses[0];

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeTitle.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a title for the curriculum node.',
      });
      return;
    }

    const prereqNode = nodes.find(n => n.id === newNodePrereqId);

    const created: SkillTreeNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      courseId: selectedCourseId,
      title: newNodeTitle.trim(),
      description: newNodeDescription.trim() || undefined,
      prerequisiteId: newNodePrereqId || undefined,
      prerequisiteTitle: prereqNode?.title || undefined,
      level: Number(newNodeLevel) || (prereqNode ? prereqNode.level + 1 : 1),
      requiredLabKeyword: newNodeKeyword.trim() || undefined,
    };

    setNodes(prev => [...prev, created]);
    setNewNodeTitle('');
    setNewNodeDescription('');
    setNewNodePrereqId('');
    setNewNodeKeyword('');
    setNewNodeLevel(1);
    setIsAddingNode(false);

    showToast({
      type: 'info',
      title: 'Node Added to Tree',
      message: `"${created.title}" ready to save.`,
    });
  };

  const handleDeleteNode = (id: string) => {
    // Also remove from any child nodes pointing to this as prerequisite
    setNodes(prev =>
      prev
        .filter(n => n.id !== id)
        .map(n =>
          n.prerequisiteId === id
            ? { ...n, prerequisiteId: undefined, prerequisiteTitle: undefined }
            : n
        )
    );
  };

  const handleSaveTree = () => {
    if (nodes.length === 0) {
      showToast({
        type: 'error',
        title: 'Empty Curriculum',
        message: 'Add at least one node to the skill tree before saving.',
      });
      return;
    }

    const payload: Omit<SkillTree, 'updatedAt'> = {
      id: `tree_${selectedCourseId}`,
      courseId: selectedCourseId,
      courseCode: activeCourse?.code || 'CS301',
      courseName: activeCourse?.name || 'Computer Science Curriculum',
      nodes,
    };

    saveSkillTree(payload);
  };

  // Group nodes by level (Tier 1 to 5) for visual 2D display
  const nodesByLevel = [1, 2, 3, 4, 5].map(lvl => ({
    level: lvl,
    nodes: nodes.filter(n => n.level === lvl),
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Network className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Curriculum & B.Tech Skill Tree Builder</span>
            </h1>
            <Badge variant="teal" size="sm">
              Curriculum Prerequisite Engine
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Map out course syllabi as a dependency tree. Students unlock nodes by passing
            Automated Coding Labs.
          </p>
        </div>

        {/* Primary Save Button with custom 4-layer tactile depth */}
        <button
          type="button"
          onClick={handleSaveTree}
          className="rounded-full bg-teal-700 hover:bg-[#0D6861] active:bg-[#115E59] text-white text-xs px-5 py-2.5 font-medium transition-all duration-200 active:scale-95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)] inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Tree</span>
        </button>
      </div>

      {/* Course Selection & Controls Bar */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Target Course Syllabus
          </label>
          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-600"
            >
              {effectiveCourses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddingNode(prev => !prev)}
            className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs px-4 py-2 font-medium transition-all active:scale-95 border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{isAddingNode ? 'Cancel Node' : 'Add Node'}</span>
          </button>
        </div>
      </div>

      {/* Add Node Drawer Form */}
      {isAddingNode && (
        <form
          onSubmit={handleAddNode}
          className="bg-white dark:bg-[#18181B] border border-teal-500/40 rounded-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#27272A]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>Create New Curriculum Node</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Course: {activeCourse?.code}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Node Title */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Node Name (Skill / Topic) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newNodeTitle}
                onChange={e => setNewNodeTitle(e.target.value)}
                placeholder="e.g. Machine Learning"
                className="w-full text-xs px-3 py-2 bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-600"
                required
              />
            </div>

            {/* Prerequisite Node */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Prerequisite Node
              </label>
              <select
                value={newNodePrereqId}
                onChange={e => {
                  setNewNodePrereqId(e.target.value);
                  const p = nodes.find(n => n.id === e.target.value);
                  if (p) setNewNodeLevel(p.level + 1);
                }}
                className="w-full text-xs px-3 py-2 bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value="">None (Root Foundation)</option>
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    Tier {n.level}: {n.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Tier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Curriculum Tier (Level)
              </label>
              <select
                value={newNodeLevel}
                onChange={e => setNewNodeLevel(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                <option value={1}>Tier 1: Foundations</option>
                <option value={2}>Tier 2: Core Concepts</option>
                <option value={3}>Tier 3: Advanced Systems</option>
                <option value={4}>Tier 4: Specialization</option>
                <option value={5}>Tier 5: Capstone Lab</option>
              </select>
            </div>

            {/* Coding Lab Keyword Link */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Automated Coding Lab Topic (Keyword)
              </label>
              <input
                type="text"
                value={newNodeKeyword}
                onChange={e => setNewNodeKeyword(e.target.value)}
                placeholder="e.g. Python Basics, Machine Learning, Recursion"
                className="w-full text-xs px-3 py-2 bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Matches student's passed coding assignments to automatically unlock this node.
              </span>
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Syllabus Scope / Summary
              </label>
              <input
                type="text"
                value={newNodeDescription}
                onChange={e => setNewNodeDescription(e.target.value)}
                placeholder="e.g. Scikit-Learn models, loss optimization, model evaluation"
                className="w-full text-xs px-3 py-2 bg-white dark:bg-[#0E0E11] border border-slate-200 dark:border-[#27272A] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNode(false)}
              className="text-xs px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs px-4 py-2 font-medium transition-all active:scale-95 shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert Node</span>
            </button>
          </div>
        </form>
      )}

      {/* Visual 2D Tree Preview */}
      <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#27272A]">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-teal-600" />
              <span>Visual Dependency Hierarchy ({nodes.length} Nodes)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Horizontal progression of curriculum tiers. Connecting arrows represent required prerequisites.
            </p>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Course ID: {selectedCourseId}
          </span>
        </div>

        {/* 2D Tier Progression Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto min-h-[320px]">
          {nodesByLevel.map(({ level, nodes: tierNodes }) => (
            <div
              key={level}
              className="bg-slate-50/60 dark:bg-[#0E0E11]/60 rounded-xl p-3 border border-slate-200/60 dark:border-[#27272A] flex flex-col space-y-3"
            >
              {/* Level Tier Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#27272A]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 font-mono">
                  Tier {level}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  {tierNodes.length}
                </span>
              </div>

              {/* Node Cards */}
              <div className="space-y-3 flex-1">
                {tierNodes.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-center p-2 text-[11px] text-slate-400 dark:text-slate-600 font-mono">
                    No nodes in Tier {level}
                  </div>
                ) : (
                  tierNodes.map(node => (
                    <div
                      key={node.id}
                      className="group bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-xl p-3.5 shadow-sm hover:border-teal-500 dark:hover:border-teal-600 transition-all duration-150 space-y-2 relative"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {node.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteNode(node.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition-opacity"
                          title="Remove Node"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {node.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {node.description}
                        </p>
                      )}

                      {/* Prerequisite Indicator */}
                      <div className="pt-2 border-t border-slate-100 dark:border-[#27272A] flex flex-col gap-1 text-[10px]">
                        {node.prerequisiteTitle || node.prerequisiteId ? (
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <ArrowRight className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                            <span className="truncate">
                              Requires: <strong className="text-slate-700 dark:text-slate-300">{node.prerequisiteTitle || 'Prerequisite'}</strong>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Sparkles className="w-3 h-3 shrink-0" />
                            <span>Root Foundation</span>
                          </div>
                        )}

                        {node.requiredLabKeyword && (
                          <span className="text-[9px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.5 rounded self-start mt-0.5">
                            Lab: {node.requiredLabKeyword}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCurriculumPage;
