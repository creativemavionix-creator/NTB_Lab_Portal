import React from 'react';
import { ChevronRight, Home, FlaskConical, HelpCircle, FileSpreadsheet, BookOpen, Database } from 'lucide-react';

const viewIconMap = {
  'Dashboard': Home,
  'Sample Handling': FlaskConical,
  'Sample Clarifications': HelpCircle,
  'Reports': FileSpreadsheet,
  'User Manual': BookOpen,
  'Admin': Database
};

export default function Breadcrumbs({ currentView, currentSubView, onNavigate }) {
  const ViewIcon = viewIconMap[currentView] || Home;

  return (
    <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 py-1.5 px-4 md:px-6 bg-[#edf3f9] border-b border-slate-200 overflow-x-auto whitespace-nowrap">
      
      {/* Home / Root */}
      <button 
        onClick={() => onNavigate('Dashboard')}
        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
      >
        <Home size={14} />
        <span>NTB Portal</span>
      </button>

      {currentView !== 'Dashboard' && (
        <>
          <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
          <button 
            onClick={() => onNavigate(currentView)}
            className={`flex items-center gap-1 hover:text-indigo-600 transition-colors ${
              !currentSubView ? 'text-indigo-600 font-bold' : ''
            }`}
          >
            <ViewIcon size={14} />
            <span>{currentView}</span>
          </button>
        </>
      )}

      {currentSubView && (
        <>
          <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
          <span className="text-indigo-600 font-bold">
            {currentSubView}
          </span>
        </>
      )}

    </nav>
  );
}
