import React from 'react';
import { Menu, ShieldCheck, UserCheck, Settings, Users, Search, Database, Server, LogOut, Lock, ChevronRight } from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

export default function Header({ sidebarOpen, setSidebarOpen, onOpenCommandPalette }) {
  const { 
    selectedRole, 
    selectedEngineer, 
    setSelectedEngineer, 
    engineers,
    backendConnected,
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
      <div className="flex items-center justify-between h-16 px-4 md:px-6 gap-4">
        
        {/* Sidebar Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 lg:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-base md:text-lg font-extrabold text-[#1e3a8a] tracking-tight">
              National Testing Bureau (NTB)
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Lab Management & Inward Workflow System
            </span>
          </div>
        </div>

        {/* Center Global Search Trigger (Ctrl+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors max-w-sm w-full shadow-2xs"
        >
          <Search size={15} className="text-slate-400" />
          <span className="flex-1 text-left">Quick Search (samples, views, manuals)...</span>
          <kbd className="bg-white text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono border border-slate-200 shadow-2xs">
            Ctrl+K
          </kbd>
        </button>

        {/* Right Action Icons & Backend / Supabase Badges */}
        <div className="flex items-center gap-2.5">
          
          {/* Mobile Search Button */}
          <button
            onClick={onOpenCommandPalette}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            title="Search"
          >
            <Search size={18} />
          </button>

          {/* Python REST API Connection Indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            backendConnected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <Server size={12} className={backendConnected ? "text-emerald-600" : "text-amber-600"} />
            <span>{backendConnected ? 'Python API Active' : 'Local Fallback'}</span>
          </div>

          {/* Supabase DB Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Database size={12} className="text-indigo-600" />
            <span>Supabase Sync</span>
          </div>

          {/* Persona Avatar & User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900">{currentUser?.name || 'V. K. Jain'}</span>
              <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">{currentUser?.role || selectedRole}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {currentUser?.avatar || 'VJ'}
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ml-1 cursor-pointer"
              title="Logout from current role to switch"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>

        </div>

      </div>

      {/* Locked Active Workstation Session Panel */}
      <div className="bg-[#f8fafc] border-t border-slate-200 px-4 md:px-6 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-extrabold tracking-wide uppercase text-[9px] border border-emerald-300">
            <Lock size={11} />
            Session Authenticated
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 hover:border-[#1e3a8a] hover:bg-[#1e3a8a]/5 text-slate-700 font-medium transition-all shadow-2xs cursor-pointer group touch-manipulation"
            title="Click to toggle navigation sidebar"
          >
            <span className="text-[11px] font-semibold text-slate-500 group-hover:text-[#1e3a8a]">Workstation:</span>
            <span className="font-extrabold text-[#1e3a8a] flex items-center gap-1 text-xs group-hover:text-amber-600">
              <RoleIcon size={13} className="text-[#f5b041] group-hover:scale-110 transition-transform" />
              {selectedRole === 'Technical Engineer' ? `${activeSection || 'Mechanical'} Engineer (${selectedEngineer})` : `${selectedRole} (${currentUser?.name})`}
            </span>
            <ChevronRight size={13} className="text-slate-400 group-hover:text-[#1e3a8a] group-hover:translate-x-0.5 transition-transform ml-1" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
          {/* Active Technical Engineer Dropdown (ONLY displayed inside Technical Engineer role) */}
          {selectedRole === 'Technical Engineer' && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded px-2.5 py-0.5 shadow-2xs">
              <span className="text-amber-900 font-bold text-[11px]">Active Technical Engineer:</span>
              <select
                value={selectedEngineer}
                onChange={(e) => {
                  const engName = e.target.value;
                  setSelectedEngineer(engName);
                  login('Technical Engineer', { name: engName, role: 'Technical Engineer' });
                }}
                className="bg-transparent text-xs text-amber-950 font-extrabold focus:outline-none cursor-pointer"
              >
                {engineers.map(eng => (
                  <option key={eng.id} value={eng.name}>
                    {eng.name} ({eng.section} Section)
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => {
              if (window.confirm("Reset all local storage demo samples to default state?")) {
                localStorage.removeItem('ntb_samples');
                localStorage.removeItem('ntb_clarifications');
                localStorage.removeItem('ntb_manuals');
                window.location.reload();
              }
            }}
            className="text-[10px] font-bold text-slate-500 hover:text-slate-900 hover:underline cursor-pointer"
            title="Reset cached demo data to fresh initial state"
          >
            Reset Demo Data
          </button>

          <button
            onClick={logout}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer flex items-center gap-1"
          >
            <LogOut size={12} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
