import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';
import { Button } from '../components/ui/Button';
import { ShieldCheck, ArrowRight, UserCheck, Lock, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAsDemoStudent, student } = useApp();
  const navigate = useNavigate();

  const [rollNumber, setRollNumber] = useState(student.rollNumber || '22CS042');
  const [password, setPassword] = useState('••••••••');

  const handleDemoLogin = () => {
    loginAsDemoStudent();
    navigate('/');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsDemoStudent();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-border rounded-lg shadow-card p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              {APP_CONFIG.appName}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
              Unified Portal
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {APP_CONFIG.collegeName}
          </p>
          <p className="text-xs text-slate-400 pt-1">
            Single sign-on for academics, notices, events, and campus opportunities.
          </p>
        </div>

        {/* Quick 1-Click Demo Login Box */}
        <div className="p-4 rounded-lg bg-teal-50/60 border border-teal-200/80 space-y-3">
          <div className="flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-slate-900 block">
                Official Hackathon Evaluation Account
              </span>
              <p className="text-slate-600 mt-0.5">
                Pre-configured with 5th semester enrolled courses, low attendance warnings, clashing events, and pending submissions.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleDemoLogin}
            className="w-full justify-between shadow-sm"
          >
            <span>Enter Demo as Aarav Sharma ({student.rollNumber})</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink mx-3 text-slate-400 text-[11px] uppercase tracking-wider">
            Or Standard Credentials
          </span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        {/* Standard Form (Prefilled) */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Institute Roll Number / Student ID
            </label>
            <input
              type="text"
              required
              value={rollNumber}
              onChange={e => setRollNumber(e.target.value)}
              className="w-full text-xs font-mono px-3 py-2 bg-slate-50/60 border border-border rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campus Central Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50/60 border border-border rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <Button type="submit" variant="secondary" size="md" className="w-full">
            Sign In with Campus ID
          </Button>
        </form>

        {/* Offline Disclaimer */}
        <div className="pt-2 border-t border-border flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Standalone offline demonstration • Built for judges review</span>
        </div>
      </div>
    </div>
  );
};
