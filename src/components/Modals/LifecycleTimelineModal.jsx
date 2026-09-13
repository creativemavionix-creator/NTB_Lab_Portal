import React from 'react';
import { X, CheckCircle2, Clock, FileText, UserCheck, ShieldCheck, Send } from 'lucide-react';

export default function LifecycleTimelineModal({ isOpen, sample, onClose }) {
  if (!isOpen || !sample) return null;

  const steps = [
    {
      title: 'Sample Received & Inwarded',
      by: 'Sample Cell Officer',
      date: sample.dateReceived || 'N/A',
      detail: `Received ${sample.quantity} unit(s) of ${sample.product} under ${sample.standard}.`,
      status: 'completed',
      icon: FileText
    },
    {
      title: 'Testing Section Allocation',
      by: 'Technical Manager',
      date: sample.allocationDate || 'Pending',
      detail: sample.assignedEngineer 
        ? `Allocated to ${sample.assignedEngineer} in ${sample.testingSection} Section (Due: ${sample.dueDate || 'N/A'}).`
        : 'Awaiting allocation by Head Technical Manager.',
      status: sample.assignedEngineer ? 'completed' : 'current',
      icon: UserCheck
    },
    {
      title: 'Laboratory Testing Execution',
      by: sample.assignedEngineer || 'Assigned Engineer',
      date: sample.testDate || 'In Progress',
      detail: sample.testResults 
        ? `Findings recorded: "${sample.testResults}"`
        : 'Engineers performing accredited physical & chemical testing parameters.',
      status: sample.testResults ? 'completed' : sample.assignedEngineer ? 'current' : 'upcoming',
      icon: Clock
    },
    {
      title: 'Technical Verification & Approval',
      by: 'Head Technical Manager',
      date: sample.verificationStatus === 'Verified' ? 'Approved' : 'Pending',
      detail: sample.verificationStatus === 'Verified'
        ? 'Test results audited and verified compliant with IS specifications.'
        : 'Pending technical verification and sign-off.',
      status: sample.verificationStatus === 'Verified' ? 'completed' : sample.testResults ? 'current' : 'upcoming',
      icon: ShieldCheck
    },
    {
      title: 'Final Certificate Dispatch',
      by: 'Sample Cell & Admin',
      date: sample.status === 'Sent to Sample Cell' ? 'Dispatched' : 'Pending',
      detail: sample.status === 'Sent to Sample Cell'
        ? `Certificate ${sample.reportNumber || ''} sent to applicant.`
        : 'Final test report pending dispatch to applicant.',
      status: sample.status === 'Sent to Sample Cell' ? 'completed' : 'upcoming',
      icon: Send
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div>
            <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Lifecycle Timeline Audit</span>
            <h3 className="text-base font-bold flex items-center gap-2">
              Sample Code: <span className="font-mono text-yellow-400">{sample.id}</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6 scrollbar-thin text-xs">
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center text-slate-700 dark:text-slate-200">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{sample.product}</p>
              <p className="text-[11px] text-slate-400">Applicant: {sample.applicant}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 font-bold text-[10px]">
              {sample.status}
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isDone = step.status === 'completed';
              const isCurrent = step.status === 'current';

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                    isDone ? 'bg-emerald-500 shadow-emerald-200 shadow-md' :
                    isCurrent ? 'bg-amber-500 animate-pulse ring-4 ring-amber-100 dark:ring-amber-900/50' :
                    'bg-slate-300 dark:bg-slate-700'
                  }`}>
                    {isDone ? <CheckCircle2 size={12} /> : idx + 1}
                  </div>

                  <div className="flex-1 bg-white dark:bg-slate-950 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                        <Icon size={14} className={isDone ? 'text-emerald-500' : isCurrent ? 'text-amber-500' : 'text-slate-400'} />
                        {step.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{step.date}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium text-[11px] leading-relaxed">
                      {step.detail}
                    </p>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-wider">
                      Role Responsible: {step.by}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-xs"
          >
            Close Audit
          </button>
        </div>

      </div>
    </div>
  );
}
