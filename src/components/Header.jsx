import React from 'react';
import { Menu, ShieldCheck, UserCheck, Settings, Users, Search, LogOut, Lock } from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

export default function Header({ sidebarOpen, setSidebarOpen, onOpenCommandPalette }) {
  const { 
    selectedRole, 
    selectedEngineer, 
    setSelectedEngineer, 
    engineers,
    currentUser,
    logout
  } = useWorkflow();

  const roleIcons = {
    'Technical Manager': ShieldCheck,
    'Technical Engineer': Users,
    'Sample Cell': UserCheck,
    'Reporting Manager': Settings,
    'Admin': Settings
  };

  const RoleIcon = roleIcons[selectedRole] || ShieldCheck;

  const activeSection = engineers.find(e => e.name === selectedEngineer)?.section || 'Mechanical';

  return (
    <header className="flex flex-col bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs font-sans">
      
      {/* Top Main Bar */}
      <div className="flex items-center justify-between min-h-[3.5rem] py-2 px-3 sm:px-4 md:px-6 gap-2 sm:gap-4">
        
        {/* Sidebar Toggle & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label="Toggle Navigation Drawer"
            aria-expanded={sidebarOpen}
          >
            <Menu size={22} />
          </button>
          
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-[#1e3a8a] tracking-tight truncate">
              National Testing Bureau (NTB)
            </h1>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold tracking-wider uppercase truncate">
              Lab Management & Inward Workflow System
            </span>
          </div>
        </div>

        {/* Center Global Search Trigger (Ctrl+K) */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium transition-colors max-w-xs lg:max-w-sm w-full shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          aria-label="Open global search palette (Ctrl+K)"
        >
          <Search size={15} className="text-slate-400 shrink-0" />
          <span className="flex-1 text-left truncate">Quick Search (samples, views, manuals)...</span>
          <kbd className="bg-white text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200 shadow-2xs shrink-0">
            Ctrl+K
          </kbd>
        </button>

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg touch-manipulation cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label="Open search dialog"
            title="Search"
          >
            <Search size={20} />
          </button>



          {/* Persona Avatar & User Profile */}
          <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{currentUser?.name || 'V. K. Jain'}</span>
              <span className="text-[9px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 truncate max-w-[120px]">{currentUser?.role || selectedRole}</span>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0">
              {currentUser?.avatar || 'VJ'}
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1 min-h-[36px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ml-0.5 cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none"
              aria-label="Logout user account"
              title="Logout from current role to switch"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>

      </div>

      {/* Locked Active Workstation Session Panel */}
      <div className="bg-[#f8fafc] border-t border-slate-200 px-3 sm:px-4 md:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-extrabold tracking-wide uppercase text-[9px] border border-emerald-300">
            <Lock size={11} />
            Authenticated
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#f1f5f9] border border-slate-300 text-slate-700 font-medium shadow-2xs min-h-[36px] select-none"
          >
            <span className="text-[11px] font-semibold text-slate-500">Workstation:</span>
            <span className="font-extrabold text-[#1e3a8a] flex items-center gap-1 text-xs truncate max-w-[200px] sm:max-w-none">
              <RoleIcon size={13} className="text-[#f5b041] shrink-0" />
              {selectedRole === 'Technical Engineer' ? `${activeSection || 'Mechanical'} Engineer (${selectedEngineer})` : `${selectedRole} (${currentUser?.name})`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 text-[11px] text-slate-500 font-medium pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200">
          {/* Active Technical Engineer Dropdown */}
          {selectedRole === 'Technical Engineer' && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded px-2.5 py-1 shadow-2xs min-h-[36px]">
              <span className="text-amber-900 font-bold text-[11px] shrink-0">Engineer:</span>
              <select
                value={selectedEngineer}
                onChange={(e) => {
                  const engName = e.target.value;
                  setSelectedEngineer(engName);
                  login('Technical Engineer', { name: engName, role: 'Technical Engineer' });
                }}
                className="bg-transparent text-xs text-amber-950 font-extrabold focus:outline-none cursor-pointer"
                aria-label="Select Active Technical Engineer"
              >
                {engineers.map(eng => (
                  <option key={eng.id} value={eng.name}>
                    {eng.name} ({eng.section})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset all local storage demo samples to default state?")) {
                localStorage.removeItem('ntb_samples');
                localStorage.removeItem('ntb_clarifications');
                localStorage.removeItem('ntb_manuals');
                window.location.reload();
              }
            }}
            className="text-[10px] font-bold text-slate-500 hover:text-slate-900 hover:underline cursor-pointer py-1 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:outline-none"
            aria-label="Reset local demo data"
            title="Reset cached demo data to fresh initial state"
          >
            Reset Demo Data
          </button>
        </div>
      </div>
    </header>
  );
}
