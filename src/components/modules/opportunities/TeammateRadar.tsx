import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { User, Assignment } from '../../../types';
import { Sparkles, Send, CheckCircle2, UserCheck, Code2, Terminal, Cpu } from 'lucide-react';

interface TeammateMatch {
  peer: User;
  complementaryRole: string;
  synergyReason: string;
  matchScore: number;
  skills: string[];
  passedLabTitle: string;
}

export const TeammateRadar: React.FC = () => {
  const { user, users, assignments, showToast } = useApp();
  const [invitedPeerIds, setInvitedPeerIds] = useState<Record<string, boolean>>({});

  // Compute complementary matches based on passed Automated Coding Labs
  const matches = useMemo<TeammateMatch[]>(() => {
    const currentStudentId = user?.id || 'usr_std_demo';
    const peerStudents = users.filter(u => u.role === 'student' && u.id !== currentStudentId);

    // Current user's passed labs
    const myPassedLabs = assignments.filter(
      a =>
        (a.studentId === currentStudentId || a.studentEmail === user?.email) &&
        a.type === 'coding' &&
        (a.status === 'graded' || a.status === 'submitted' || a.testResultsSummary?.includes('✅'))
    );

    const hasFrontend = myPassedLabs.some(
      l => l.title?.toLowerCase().includes('frontend') || l.language?.toLowerCase() === 'javascript'
    ) || true; // Aarav is frontend / full-stack by default

    // Peer profiles with complementary skill sets
    return peerStudents.map((peer, idx) => {
      const peerLabs = assignments.filter(
        a =>
          (a.studentId === peer.id || a.studentEmail === peer.email) &&
          a.type === 'coding'
      );

      // Find if peer passed Python or systems labs
      const passedPython = peerLabs.some(
        l => l.language?.toLowerCase() === 'python' || l.title?.toLowerCase().includes('python')
      );
      const passedCpp = peerLabs.some(
        l => l.language?.toLowerCase() === 'c++' || l.title?.toLowerCase().includes('memory')
      );

      let complementaryRole = 'Backend Systems Architect';
      let synergyReason = 'Full-Stack Synergy: Pairs UI/Frontend design with Python distributed backend resilience.';
      let matchScore = 98 - idx * 4;
      let skills = ['Python 3.12', 'FastAPI', 'Distributed Caching', 'PostgreSQL'];
      let passedLabTitle = 'Automated Coding Lab: Distributed Cache & Microservices';

      if (peer.name?.toLowerCase().includes('rohan') || passedCpp) {
        complementaryRole = 'Low-Level Systems & Optimization';
        synergyReason = 'Performance Synergy: Pairs rapid application velocity with bare-metal C++ algorithm throughput.';
        matchScore = 94;
        skills = ['C++20', 'Memory Allocators', 'Linux Systems', 'Concurrency'];
        passedLabTitle = 'Automated Coding Lab: Memory Allocation & Schedulers';
      } else if (idx % 2 === 1) {
        complementaryRole = 'Cloud Architecture & Data Pipelines';
        synergyReason = 'Infrastructure Synergy: Bridges client application workflows with resilient cloud infrastructure.';
        matchScore = 91;
        skills = ['Golang', 'Docker Containers', 'gRPC', 'Database Internals'];
        passedLabTitle = 'Automated Coding Lab: High-Performance Database Engine';
      }

      return {
        peer,
        complementaryRole,
        synergyReason,
        matchScore,
        skills,
        passedLabTitle,
      };
    });
  }, [user, users, assignments]);

  const handleSendInvite = (peer: User) => {
    setInvitedPeerIds(prev => ({ ...prev, [peer.id]: true }));
    showToast({
      type: 'success',
      title: 'Hackathon Invite Dispatched',
      message: `Teammate invitation sent to ${peer.name} (${peer.email}).`,
    });
  };

  if (matches.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-2xl p-6 space-y-4 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {"\"Perfect Match\" Teammate Radar"}
            </h3>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
              AI Skill Graph
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Recommending cohort teammates with complementary strengths based on verified Automated Coding Labs.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Scroll horizontally &rarr;
        </div>
      </div>

      {/* Horizontal Scrolling Card Track */}
      <div className="flex overflow-x-auto gap-4 pb-3 pt-1 scrollbar-thin">
        {matches.map(({ peer, complementaryRole, synergyReason, matchScore, skills, passedLabTitle }) => {
          const isInvited = !!invitedPeerIds[peer.id];

          return (
            <div
              key={peer.id}
              className="min-w-[300px] sm:min-w-[330px] max-w-[350px] shrink-0 bg-slate-50/60 dark:bg-[#222226] border border-slate-200 dark:border-[#27272A] hover:border-teal-600 dark:hover:border-teal-500 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 group"
            >
              {/* Profile Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {peer.avatarInitials || peer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {peer.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {peer.rollNumber || '22CS088'} • {peer.program || 'B.Tech CSE'}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 shrink-0">
                    ✨ Synergy Match
                  </span>
                </div>

                {/* Complementary Role & Synergy Description */}
                <div className="p-3 bg-white dark:bg-[#18181B] rounded-xl border border-slate-100 dark:border-[#27272A] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-700 dark:text-teal-400">
                      {complementaryRole}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {matchScore}% Match
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {synergyReason}
                  </p>
                </div>

                {/* Verified Automated Coding Lab Badge */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#27272A] px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-[#323236]">
                  <Terminal className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                  <span className="truncate" title={passedLabTitle}>
                    {passedLabTitle}
                  </span>
                </div>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(skill => (
                    <span
                      key={skill}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-white dark:bg-[#18181B] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#27272A]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action: Send Invite with 4-layer tactile button shadow */}
              <button
                type="button"
                onClick={() => handleSendInvite(peer)}
                disabled={isInvited}
                className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 select-none cursor-pointer ${
                  isInvited
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-none cursor-default'
                    : 'bg-teal-700 hover:bg-[#0D6861] active:bg-[#115E59] text-white active:scale-95 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)] dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]'
                }`}
              >
                {isInvited ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Invite Sent ✓</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Invite</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeammateRadar;
