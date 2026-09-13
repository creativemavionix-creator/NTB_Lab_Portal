import React from 'react';
import { Activity, Clock, ShieldCheck, ArrowRight, CheckCircle, HelpCircle } from 'lucide-react';
import MetricCards from '../MetricCards';
import { useWorkflow } from '../../context/WorkflowContext';

export default function DashboardView({ setCurrentView, setCurrentSubView }) {
  const { logs, selectedRole, samples, clarifications } = useWorkflow();

  const handleCardClick = (view, subView) => {
    setCurrentView(view);
    setCurrentSubView(subView);
    window.location.hash = `#${view.toLowerCase().replace(/\s+/g, '-')}/${encodeURIComponent(subView.toLowerCase().replace(/\s+/g, '-'))}`;
  };

  const pendingVerificationCount = samples.filter(s => s.status === 'Test Results Pending Verification').length;
  const openClarificationCount = clarifications.filter(c => c.status === 'Open').length;

  return (
    <div className="flex-1 space-y-6 pb-20 bg-[#edf3f9] min-h-full font-sans text-slate-800">
      
      {/* Welcome Banner: Clean Corporate Light Blue Accent Header */}
      <div className="bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#1e3a8a] p-6 md:p-8 rounded-xl shadow-sm text-white flex flex-col md:flex-row md:items-center justify-between gap-6 mx-4 md:mx-6 mt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f5b041] text-slate-950 font-bold text-[10px] uppercase tracking-wider">
              Lab Management Hub
            </span>
            <span className="text-xs text-blue-100 font-medium">National Testing Bureau</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {selectedRole} Workstation
          </h2>
          <p className="text-blue-100 text-xs md:text-sm max-w-2xl leading-relaxed font-medium">
            Manage allocations, verify test records, audit laboratory transitions, compile certificates, and synchronize inward testing workflows.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/60 border border-blue-400/30 px-4 py-2.5 rounded-lg text-xs">
            <Clock size={16} className="text-[#f5b041]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-blue-200 font-semibold uppercase">Active Persona</span>
              <span className="font-bold text-[#f5b041]">{selectedRole}</span>
            </div>
          </div>

          <button
            onClick={() => handleCardClick('Sample Handling', 'New Sample Received')}
            className="bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 px-4 py-2.5 rounded-lg font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
          >
            <span>View New Samples</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Quick Action Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-4 md:mx-6 text-xs">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{pendingVerificationCount} Pending Verifications</p>
              <p className="text-slate-500 text-[11px]">Test results awaiting Technical Manager sign-off</p>
            </div>
          </div>
          <button
            onClick={() => handleCardClick('Sample Handling', 'Verify Test Results')}
            className="px-3.5 py-2 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded-lg font-bold text-xs transition-colors shadow-2xs cursor-pointer touch-manipulation text-center"
          >
            Verify Now
          </button>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <HelpCircle size={20} />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{openClarificationCount} Open Clarifications</p>
              <p className="text-slate-500 text-[11px]">Active technical query threads with Sample Cell</p>
            </div>
          </div>
          <button
            onClick={() => handleCardClick('Sample Clarifications', 'Open Clarifications')}
            className="px-3.5 py-2 bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 rounded-lg font-bold text-xs transition-colors shadow-2xs cursor-pointer touch-manipulation text-center"
          >
            Review Threads
          </button>
        </div>
      </div>

      {/* Metrics Card Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4 md:px-6 mb-2">
          Sample & Testing Status Summary
        </h3>
        <MetricCards onCardClick={handleCardClick} />
      </div>

      {/* Audit Log / Event Feed */}
      <div className="mx-4 md:mx-6 bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Activity size={16} className="text-[#1e3a8a]" />
            Recent Workflow Transitions & Audit Logs
          </h3>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
            Live Audit Stream
          </span>
        </div>

        <div className="p-6">
          {logs && logs.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
              {logs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-start text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold whitespace-nowrap min-w-36 text-center border border-slate-200 self-start">
                    {log.time}
                  </div>
                  <div className="flex-1 text-slate-800 font-medium leading-relaxed">
                    {log.text}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full self-start">
                    <ShieldCheck size={12} />
                    Verified
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 italic">No activity recorded yet.</div>
          )}
        </div>
      </div>

    </div>
  );
}
