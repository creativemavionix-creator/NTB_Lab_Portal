import React from 'react';
import { 
  FileText, 
  Layers, 
  FileEdit, 
  HelpCircle, 
  UserPlus, 
  UserCheck, 
  Activity, 
  CheckSquare, 
  ClipboardCheck, 
  FilePlus, 
  RotateCcw, 
  Inbox 
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

export default function MetricCards({ onCardClick }) {
  const { samples, selectedRole, selectedEngineer, engineers } = useWorkflow();

  const activeEngineerObj = engineers?.find(e => e.name === selectedEngineer);
  const activeSection = activeEngineerObj ? activeEngineerObj.section : 'Mechanical';

  // Scoped list for active engineer
  const engSamples = samples.filter(s => s.assignedEngineer === selectedEngineer || s.testingSection === activeSection);

  if (selectedRole === 'Technical Engineer') {
    const engineerCards = [
      {
        id: 'sample_receipts',
        title: 'Sample Receipts',
        subView: 'Sample Receipt',
        count: engSamples.filter(s => ['Samples Allocated', 'Allocated'].includes(s.status) && (s.assignedEngineer === selectedEngineer || !s.assignedEngineer)).length,
        icon: Inbox,
        color: 'border-l-4 border-amber-500 text-amber-600 bg-amber-50/50 hover:bg-amber-100/60'
      },
      {
        id: 'pending_samples',
        title: 'Pending Samples',
        subView: 'Pending Samples',
        count: engSamples.filter(s => ['Accepted', 'Pending', 'Testing In Progress'].includes(s.status)).length,
        icon: Activity,
        color: 'border-l-4 border-blue-500 text-blue-600 bg-blue-50/50 hover:bg-blue-100/60'
      },
      {
        id: 'issued_reports',
        title: 'Issued Test Reports',
        subView: 'Issued Test Report',
        count: engSamples.filter(s => ['Test Results Pending Verification', 'Reports Pending', 'Amended Reports Pending', 'Final Reports Pending', 'Sent to Sample Cell', 'Testing Completed'].includes(s.status) || s.verificationStatus === 'Verified').length,
        icon: ClipboardCheck,
        color: 'border-l-4 border-emerald-500 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100/60'
      }
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 md:p-6">
        {engineerCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              type="button"
              key={card.id}
              onClick={() => onCardClick('Sample Handling', card.subView)}
              className={`p-5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between text-left focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${card.color}`}
              aria-label={`View ${card.title} (${card.count} items)`}
            >
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-800">
                  {card.title}
                </h3>
                <p className="text-3xl font-black text-slate-800 tracking-tight">
                  {card.count}
                </p>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 underline">
                  Click to view {card.title.toLowerCase()} →
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-2xs border border-slate-100 group-hover:scale-110 transition-transform">
                <Icon size={24} className="stroke-[2]" />
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  const getMetricCount = (key) => {
    switch (key) {
      case 'new':
        return samples.filter(s => s.status === 'New Sample Received').length;
      case 'supplementary':
        return samples.filter(s => s.status === 'Supplementary Sample Received').length;
      case 'amended':
        return samples.filter(s => s.status === 'Amended Sample Received').length;
      case 'pending_amendments':
        return samples.filter(s => s.status === 'Pending Amendment Requests').length;
      case 'pending_allocation':
        return samples.filter(s => !s.assignedEngineer && ['New Sample Received', 'Supplementary Sample Received', 'Amended Sample Received'].includes(s.status)).length;
      case 'allocated':
        return samples.filter(s => s.status === 'Samples Allocated').length;
      case 'testing_progress':
        return samples.filter(s => s.status === 'Testing In Progress').length;
      case 'testing_completed':
        return samples.filter(s => ['Test Results Pending Verification', 'Reports Pending', 'Amended Reports Pending', 'Final Reports Pending', 'Sent to Sample Cell', 'Testing Completed'].includes(s.status)).length;
      case 'pending_verification':
        return samples.filter(s => s.status === 'Test Results Pending Verification').length;
      case 'reports_pending':
        return samples.filter(s => s.status === 'Reports Pending').length;
      case 'amended_reports_pending':
        return samples.filter(s => s.status === 'Amended Reports Pending').length;
      case 'final_reports_pending':
        return samples.filter(s => s.status === 'Final Reports Pending').length;
      default:
        return 0;
    }
  };

  const cards = [
    {
      id: 'new',
      title: 'New Samples Received',
      subView: 'New Sample Received',
      icon: FileText,
      color: 'border-l-4 border-blue-500 text-blue-600 bg-blue-50/50'
    },
    {
      id: 'supplementary',
      title: 'Supplementary Samples',
      subView: 'Supplementary Sample Received',
      icon: Layers,
      color: 'border-l-4 border-indigo-500 text-indigo-600 bg-indigo-50/50'
    },
    {
      id: 'amended',
      title: 'Amended Samples',
      subView: 'Amended Sample Received',
      icon: FileEdit,
      color: 'border-l-4 border-purple-500 text-purple-600 bg-purple-50/50'
    },
    {
      id: 'pending_amendments',
      title: 'Pending Amendments',
      subView: 'Pending Amendment Requests',
      icon: HelpCircle,
      color: 'border-l-4 border-amber-500 text-amber-600 bg-amber-50/50'
    },
    {
      id: 'pending_allocation',
      title: 'Pending Allocation',
      subView: 'Samples Allocated / Pending',
      icon: UserPlus,
      color: 'border-l-4 border-orange-500 text-orange-600 bg-orange-50/50'
    },
    {
      id: 'allocated',
      title: 'Samples Allocated',
      subView: 'Samples Allocated / Pending',
      icon: UserCheck,
      color: 'border-l-4 border-teal-500 text-teal-600 bg-teal-50/50'
    },
    {
      id: 'testing_progress',
      title: 'Testing In Progress',
      subView: 'Samples Allocated / Pending',
      icon: Activity,
      color: 'border-l-4 border-emerald-500 text-emerald-600 bg-emerald-50/50'
    },
    {
      id: 'testing_completed',
      title: 'Testing Completed',
      subView: 'Testing Completed',
      icon: CheckSquare,
      color: 'border-l-4 border-green-500 text-green-600 bg-green-50/50'
    },
    {
      id: 'pending_verification',
      title: 'Pending Verification',
      subView: 'Verify Test Results',
      icon: ClipboardCheck,
      color: 'border-l-4 border-rose-500 text-rose-600 bg-rose-50/50'
    },
    {
      id: 'reports_pending',
      title: 'Reports Pending',
      subView: 'Reports Pending',
      icon: FilePlus,
      color: 'border-l-4 border-cyan-500 text-cyan-600 bg-cyan-50/50'
    },
    {
      id: 'amended_reports_pending',
      title: 'Amended Reports',
      subView: 'Amended Reports Pending',
      icon: RotateCcw,
      color: 'border-l-4 border-pink-500 text-pink-600 bg-pink-50/50'
    },
    {
      id: 'final_reports_pending',
      title: 'Final Reports Pending',
      subView: 'Testing Completed',
      icon: Inbox,
      color: 'border-l-4 border-slate-700 text-slate-700 bg-slate-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4 md:p-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const count = getMetricCount(card.id);
        return (
          <button
            type="button"
            key={card.id}
            onClick={() => onCardClick('Sample Handling', card.subView)}
            className={`flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-md transition-all text-left group cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${card.color}`}
            aria-label={`View ${card.title} (${count} items)`}
          >
            <div className="flex flex-col gap-1 pr-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-800 transition-colors">
                {card.title}
              </span>
              <span className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                {count}
              </span>
            </div>
            <div className="p-3 bg-white rounded-full border border-slate-100 shadow-2xs group-hover:scale-110 transition-transform">
              <Icon size={20} className="stroke-[2]" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
