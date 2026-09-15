import React from 'react';
import { LayoutDashboard, FlaskConical, HelpCircle, FileSpreadsheet, BookOpen } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function MobileBottomNav({ currentView, onNavigate }) {
  const { samples, clarifications } = useWorkflow();

  const openClarifications = clarifications.filter(c => c.status === 'Open').length;
  const pendingSamples = samples.filter(s => s.status === 'New Sample Received' || s.status === 'Test Results Pending Verification').length;

  const items = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'Sample Handling', label: 'Samples', icon: FlaskConical, badge: pendingSamples },
    { id: 'Sample Clarifications', label: 'Clarifications', icon: HelpCircle, badge: openClarifications },
    { id: 'Reports', label: 'Reports', icon: FileSpreadsheet, badge: null },
    { id: 'User Manual', label: 'Manual', icon: BookOpen, badge: null }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 text-slate-400 flex items-center justify-around py-2 px-1 lg:hidden shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const active = currentView === item.id;
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-label={`Navigate to ${item.label}`}
            aria-current={active ? 'page' : undefined}
            className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:outline-none ${
              active 
                ? 'text-yellow-500 font-bold' 
                : 'hover:text-slate-200 text-slate-400'
            }`}
          >
            <Icon size={18} />
            <span className="text-[10px] tracking-tight">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute -top-1 right-2 bg-yellow-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
