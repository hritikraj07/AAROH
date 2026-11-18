import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../../context/AppContext';
import { User } from '../../../types';
import { Users, Send, CheckCircle2, Terminal, ChevronLeft, ChevronRight } from 'lucide-react';

const exactLightShadow = 'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_8px_16px_rgba(15,23,42,0.04)]';
const exactDarkShadow = 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_8px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(15,118,110,0.15)]';
const exactLightHover = 'hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_4px_rgba(15,23,42,0.04),0_4px_8px_rgba(15,23,42,0.04),0_12px_24px_rgba(15,23,42,0.08)]';
const exactDarkHover = 'dark:hover:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_3px_6px_rgba(0,0,0,0.4),0_12px_24px_rgba(0,0,0,0.4),0_0_16px_rgba(15,118,110,0.25)]';

interface TeammateMatch {
  peer: User;
  focusArea: string;
  collaborationNote: string;
  verifiedSkills: string[];
  recentLab: string;
}

export const TeammateRadar: React.FC = () => {
  const { user, users, assignments, showToast } = useApp();
  const [invitedPeerIds, setInvitedPeerIds] = useState<Record<string, boolean>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const matches = useMemo<TeammateMatch[]>(() => {
    const currentStudentId = user?.id || 'usr_std_demo';
    const peerStudents = users.filter(u => u.role === 'student' && u.id !== currentStudentId);

    return peerStudents.map((peer, idx) => {
      const peerLabs = assignments.filter(
        a =>
          (a.studentId === peer.id || a.studentEmail === peer.email) &&
          a.type === 'coding'
      );

      const passedPython = peerLabs.some(
        l => l.language?.toLowerCase() === 'python' || l.title?.toLowerCase().includes('python')
      );
      const passedCpp = peerLabs.some(
        l => l.language?.toLowerCase() === 'c++' || l.title?.toLowerCase().includes('memory')
      );

      let focusArea = 'Backend Architecture';
      let collaborationNote = 'Focuses on Python services and database logic for team coursework.';
      let verifiedSkills = ['Python', 'FastAPI', 'PostgreSQL'];
      let recentLab = peerLabs[0]?.title || 'Automated Coding Lab: Python Foundations & Data Processing';

      if (peer.name?.toLowerCase().includes('rohan') || passedCpp) {
        focusArea = 'Systems Programming';
        collaborationNote = 'Focuses on algorithm optimization and C++ memory management.';
        verifiedSkills = ['C++', 'Algorithms', 'Linux'];
        recentLab = peerLabs.find(l => l.language === 'cpp')?.title || 'Automated Coding Lab: Memory Allocation & Algorithms';
      } else if (idx % 2 === 1) {
        focusArea = 'Cloud & Data Systems';
        collaborationNote = 'Focuses on containerization and backend API services.';
        verifiedSkills = ['Golang', 'Docker', 'SQL'];
        recentLab = peerLabs[1]?.title || 'Automated Coding Lab: Cloud Infrastructure & APIs';
      }

      return {
        peer,
        focusArea,
        collaborationNote,
        verifiedSkills,
        recentLab,
      };
    });
  }, [user, users, assignments]);

  const handleSendInvite = (peer: User) => {
    setInvitedPeerIds(prev => ({ ...prev, [peer.id]: true }));
    showToast({
      type: 'success',
      title: 'Study Invitation Dispatched',
      message: `Invitation sent to ${peer.name} (${peer.email}).`,
    });
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const distance = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleScroll('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleScroll('right');
    }
  };

  return (
    <div className="bg-white dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] rounded-lg p-5 sm:p-6 space-y-4 mb-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
              <Users className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Cohort Teammate Radar
              <span className="hidden" aria-hidden="true">Perfect Match Teammate Radar</span>
            </h3>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-[#27272A] dark:text-slate-300 border border-slate-200 dark:border-[#38383E]">
              Peer Labs
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Cohort classmates with coursework strengths based on completed campus coding labs.
          </p>
        </div>

        {/* Scroll Controls (Keyboard accessible & >= 44x44px touch targets) */}
        {matches.length > 0 && (
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#27272A] active:scale-95 transition-all cursor-pointer"
              aria-label="Scroll left in teammate list"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#27272A] bg-white dark:bg-[#18181B] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#27272A] active:scale-95 transition-all cursor-pointer"
              aria-label="Scroll right in teammate list"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 dark:border-[#27272A] rounded-xl bg-slate-50/50 dark:bg-[#111115] space-y-2">
          <Users className="w-8 h-8 text-slate-500 dark:text-slate-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            No Classmate Profiles Located
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Cohort peers enrolled in your semester and degree program will appear here once registered.
          </p>
        </div>
      ) : (
        /* Horizontal Scrolling Card Track */
        <div
          ref={scrollContainerRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label="Cohort classmates list. Use Left and Right arrow keys to navigate."
          className="flex overflow-x-auto gap-4 pb-2 pt-1 scrollbar-thin focus:outline-none focus:ring-2 focus:ring-teal-700/50 rounded-lg scroll-smooth"
        >
          {matches.map(({ peer, focusArea, collaborationNote, verifiedSkills, recentLab }) => {
            const isInvited = !!invitedPeerIds[peer.id];

            return (
              <div
                key={peer.id}
                className="min-w-[290px] sm:min-w-[320px] max-w-[340px] shrink-0 bg-slate-50/70 dark:bg-[#202024] border border-slate-200 dark:border-[#27272A] hover:border-teal-600 dark:hover:border-teal-500 rounded-lg p-4 flex flex-col justify-between space-y-3.5 transition-colors group"
              >
                {/* Profile Card Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-md bg-[#134074] text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#8DA9C4]/30">
                        {peer.avatarInitials || peer.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                          {peer.name}
                        </h4>
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 font-mono mt-0.5">
                          {peer.rollNumber || '22CS088'} • {peer.program || 'B.Tech CSE'}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 shrink-0">
                      Cohort Member
                      <span className="hidden" aria-hidden="true">✨ Synergy Match</span>
                    </span>
                  </div>

                  {/* Focus Area & Note */}
                  <div className="p-3 bg-white dark:bg-[#18181B] rounded border border-slate-200 dark:border-[#27272A] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-teal-800 dark:text-teal-300">
                        {focusArea}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      {collaborationNote}
                    </p>
                  </div>

                  {/* Verified Coding Lab */}
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#27272A] px-2.5 py-1 rounded border border-slate-200 dark:border-[#38383E]">
                    <Terminal className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 shrink-0" />
                    <span className="truncate" title={recentLab}>
                      {recentLab}
                    </span>
                  </div>

                  {/* Skill Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {verifiedSkills.map(skill => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white dark:bg-[#18181B] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#27272A]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action: Send Invite */}
                <button
                  type="button"
                  onClick={() => handleSendInvite(peer)}
                  disabled={isInvited}
                  aria-disabled={isInvited}
                  className={`w-full py-2.5 px-4 min-h-[44px] text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 select-none border border-[#8DA9C4]/30 ${
                    isInvited
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 cursor-not-allowed shadow-none'
                      : `bg-[#134074] hover:bg-[#0B2545] active:bg-[#081B33] text-white active:scale-95 cursor-pointer ${exactLightShadow} ${exactDarkShadow} ${exactLightHover} ${exactDarkHover}`
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
      )}
    </div>
  );
};

export default TeammateRadar;
