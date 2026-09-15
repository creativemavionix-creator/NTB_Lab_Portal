import React, { useState, useEffect } from 'react';
import { Search, FlaskConical, HelpCircle, BookOpen, LayoutDashboard, FileSpreadsheet, Database, X, ArrowRight } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function CommandPalette({ isOpen, onClose, onNavigate }) {
  const { samples, clarifications, manuals } = useWorkflow();
  const [query, setQuery] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Navigation targets
  const viewsList = [
    { label: 'Dashboard Workstation', view: 'Dashboard', subView: '', icon: LayoutDashboard, category: 'View' },
    { label: 'New Sample Received', view: 'Sample Handling', subView: 'New Sample Received', icon: FlaskConical, category: 'Sample SubView' },
    { label: 'Samples Pending Allocation', view: 'Sample Handling', subView: 'Samples Allocated / Pending', icon: FlaskConical, category: 'Sample SubView' },
    { label: 'Verify Test Results', view: 'Sample Handling', subView: 'Verify Test Results', icon: FlaskConical, category: 'Sample SubView' },
    { label: 'Testing Section Report', view: 'Reports', subView: 'Testing Section Report', icon: FileSpreadsheet, category: 'Report' },
    { label: 'User Manual SOPs', view: 'User Manual', subView: '', icon: BookOpen, category: 'Manual' },
    { label: 'Admin Master Database Settings', view: 'Admin', subView: '', icon: Database, category: 'Admin' }
  ];

  const matchedViews = viewsList.filter(v => v.label.toLowerCase().includes(q) || v.category.toLowerCase().includes(q));

  const matchedSamples = samples.filter(s => 
    s.id.toLowerCase().includes(q) || 
    s.product.toLowerCase().includes(q) || 
    s.applicant.toLowerCase().includes(q) ||
    s.standard.toLowerCase().includes(q)
  ).slice(0, 5);

  const matchedClarifications = clarifications.filter(c => 
    c.id.toLowerCase().includes(q) || 
    c.subject.toLowerCase().includes(q) || 
    c.sampleId.toLowerCase().includes(q)
  ).slice(0, 4);

  const matchedManuals = manuals.filter(m => 
    m.title.toLowerCase().includes(q)
  ).slice(0, 4);

  const handleSelect = (view, subView = '') => {
    onNavigate(view, subView);
    onClose();
    setQuery('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in" role="dialog" aria-modal="true" aria-label="Global Search Palette">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col z-10 transition-colors">
        
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search size={20} className="text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            autoFocus
            placeholder="Type to search samples, views, reports, clarifications or manuals... (Esc to cancel)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm font-medium"
            aria-label="Search query"
          />
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label="Close search dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 scrollbar-thin text-xs">
          
          {/* Quick Views */}
          {matchedViews.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
                Workstation Navigation
              </div>
              <div className="space-y-1">
                {matchedViews.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(item.view, item.subView)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors text-slate-700 dark:text-slate-200 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-bold">
                        <span>Jump</span>
                        <ArrowRight size={12} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Samples Match */}
          {matchedSamples.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
                Matching Samples ({matchedSamples.length})
              </div>
              <div className="space-y-1">
                {matchedSamples.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelect('Sample Handling', 'New Sample Received')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800/80 text-left transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-slate-700"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{sample.id}</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{sample.product}</span>
                        <span className="text-slate-400 text-[10px]">({sample.standard})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Applicant: <strong>{sample.applicant}</strong> | Status: <span className="text-amber-600 font-semibold">{sample.status}</span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clarifications Match */}
          {matchedClarifications.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
                Clarification Queries
              </div>
              <div className="space-y-1">
                {matchedClarifications.map((clar) => (
                  <button
                    key={clar.id}
                    onClick={() => handleSelect('Sample Clarifications', 'All Clarifications')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-800/80 text-left transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <HelpCircle size={14} className="text-amber-600" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">#{clar.id} - {clar.subject}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Sample Ref: <strong>{clar.sampleId}</strong> | Status: {clar.status}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manuals Match */}
          {matchedManuals.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
                User Manual SOP Documents
              </div>
              <div className="space-y-1">
                {matchedManuals.map((man) => (
                  <button
                    key={man.id}
                    onClick={() => handleSelect('User Manual')}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-blue-500" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{man.title}</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedViews.length === 0 && matchedSamples.length === 0 && matchedClarifications.length === 0 && matchedManuals.length === 0 && (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">
              No matching results found for "{query}".
            </div>
          )}

        </div>

        {/* Footer shortcuts tip */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
          <span>Tip: Press <strong>Esc</strong> to dismiss</span>
          <span>National Testing Bureau Portal</span>
        </div>

      </div>
    </div>
  );
}
