import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FlaskConical, 
  HelpCircle, 
  FileSpreadsheet, 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  X,
  Database,
  Layers
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

export default function Sidebar({ currentView, setCurrentView, currentSubView, setCurrentSubView, sidebarOpen, setSidebarOpen }) {
  const { samples, series, clarifications, sampleRequests, selectedRole, selectedEngineer } = useWorkflow();

  const [expandedGroups, setExpandedGroups] = useState({
    handling: true,
    series: false,
    clarifications: false,
    reports: false
  });

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const navTo = (view, subView = '') => {
    setCurrentView(view);
    setCurrentSubView(subView);

    // Auto expand parent group
    if (view === 'Sample Handling') setExpandedGroups(prev => ({ ...prev, handling: true }));
    if (view === 'Series') setExpandedGroups(prev => ({ ...prev, series: true }));
    if (view === 'Sample Clarifications') setExpandedGroups(prev => ({ ...prev, clarifications: true }));
    if (view === 'Reports') setExpandedGroups(prev => ({ ...prev, reports: true }));

    // Sync URL hash
    let hash = `#${view.toLowerCase().replace(/\s+/g, '-')}`;
    if (subView) {
      hash += `/${encodeURIComponent(subView.toLowerCase().replace(/\s+/g, '-'))}`;
    }
    window.location.hash = hash;

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const isActive = (view, subView = '') => {
    if (subView) {
      return (currentView || '').toLowerCase() === view.toLowerCase() && (currentSubView || '').toLowerCase() === subView.toLowerCase();
    }
    return (currentView || '').toLowerCase() === view.toLowerCase();
  };

  // Define PDF Compliant Navigation Sub-Items per Role
  const getRoleSampleHandlingItems = () => {
    if (selectedRole === 'Technical Engineer') {
      // PDF Doc 1 Page 7 & 16
      const engSamples = samples.filter(s => s.assignedEngineer === selectedEngineer);
      return [
        { name: 'Create Sample', count: 0 },
        { name: 'Sample Receipt', count: engSamples.filter(s => ['Samples Allocated', 'Allocated', 'New Sample Received'].includes(s.status)).length },
        { name: 'Pending Samples', count: engSamples.filter(s => ['Accepted', 'Pending', 'Testing In Progress'].includes(s.status)).length },
        { name: 'Issued Test Report', count: engSamples.filter(s => ['Test Results Pending Verification', 'Reports Pending', 'Amended Reports Pending', 'Final Reports Pending', 'Sent to Sample Cell', 'Testing Completed'].includes(s.status) || s.verificationStatus === 'Verified').length }
      ];
    } else if (selectedRole === 'Sample Cell') {
      // Dynamic Data Calculations strictly matching specifications
      return [
        { name: 'Create Sample', count: 0 },
        { name: 'Accept', count: samples.filter(s => s.status === 'AWAITING_ACCEPTANCE' || s.status === 'New Sample Received' || s.status === 'Accept').length },
        { name: 'Forward', count: samples.filter(s => s.status === 'ACCEPTED_PENDING_FORWARD' || s.status === 'Pending Forwarding' || s.status === 'Forward' || s.status === 'Samples Allocated').length },
        { name: 'Pending Test Reports', count: samples.filter(s => ['FORWARDED_TO_TM', 'ALLOCATED', 'TESTING_IN_PROGRESS', 'TEST_COMPLETED_VERIFYING', 'REPORT_PENDING', 'Reports Pending', 'Pending Test Reports', 'Testing In Progress'].includes(s.status)).length },
        { name: 'Pending Amended Test Reports', count: samples.filter(s => ['AMENDMENT_REQUESTED', 'Amended Reports Pending', 'Pending Amended Test Reports'].includes(s.status) || s.type === 'Amended Report').length },
        { name: 'Final Reports', count: samples.filter(s => ['REPORT_APPROVED_AND_RECEIVED', 'FINAL_RECEIVED', 'Sent to Sample Cell', 'Testing Completed', 'Final Reports'].includes(s.status) || s.verificationStatus === 'Verified').length },
        { name: 'Disputed', count: samples.filter(s => (s.is_disputed === true || s.isDisputed === true || s.status === 'Disputed') && (s.dispute_status === 'OPEN' || s.disputeStatus === 'OPEN' || !s.disputeStatus || s.disputeStatus === 'Open')).length },
        { name: 'Return Requests', count: (sampleRequests || []).filter(r => r.type === 'RETURN' && r.status === 'PENDING').length + samples.filter(s => s.status === 'Return Requests').length },
        { name: 'Discard Requests', count: (sampleRequests || []).filter(r => r.type === 'DISCARD' && r.status === 'PENDING').length + samples.filter(s => s.status === 'Discard Requests').length },
        { name: 'Generate Test Request', count: 0 },
        { name: 'Withdrawn Samples', count: samples.filter(s => s.status === 'WITHDRAWN' || s.status === 'Withdrawn Samples').length }
      ];
    } else if (selectedRole === 'Reporting Manager') {
      // PDF Doc 2 Page 7 & 14
      return [
        { name: 'Create Sample', count: 0 },
        { name: 'Reports Pending', count: samples.filter(s => s.status === 'Reports Pending' || s.status === 'Test Results Pending Verification').length },
        { name: 'Amended Reports Pending', count: samples.filter(s => s.status === 'Amended Reports Pending').length },
        { name: 'Final Reports', count: samples.filter(s => s.status === 'Sent to Sample Cell' || s.status === 'Testing Completed').length }
      ];
    } else {
      // Technical Manager & Admin strictly matching specifications
      return [
        { name: 'Create Sample', count: 0 },
        { name: 'New Sample Received', count: samples.filter(s => s.status === 'New Sample Received' && (s.type === 'New' || !s.type)).length },
        { name: 'Supplementary Sample Received', count: samples.filter(s => s.status === 'Supplementary Sample Received' || (s.type === 'Supplementary' && s.status === 'New Sample Received')).length },
        { name: 'Amended Sample Received', count: samples.filter(s => s.status === 'Amended Sample Received' || (s.type === 'Amended' && s.status === 'New Sample Received')).length },
        { name: 'Pending Amendment Requests', count: samples.filter(s => s.status === 'Pending Amendment Requests').length },
        { name: 'Samples Allocated / Pending View', count: samples.filter(s => ['New Sample Received', 'Supplementary Sample Received', 'Amended Sample Received', 'Samples Allocated', 'Testing In Progress', 'Test Results Pending Verification'].includes(s.status) && s.status !== 'Testing Completed' && s.status !== 'Sent to Sample Cell').length },
        { name: 'Verify Test Results', count: samples.filter(s => s.status === 'Test Results Pending Verification').length },
        { name: 'Reports Pending', count: samples.filter(s => s.status === 'Reports Pending').length },
        { name: 'Amended Reports Pending', count: samples.filter(s => s.status === 'Amended Reports Pending').length },
        { name: 'Final Reports & Auto-Sync Connection', count: samples.filter(s => ['Final Reports Pending', 'Sent to Sample Cell', 'Testing Completed'].includes(s.status) || s.verificationStatus === 'Verified').length }
      ];
    }
  };

  const getRoleReportItems = () => {
    if (selectedRole === 'Technical Engineer') {
      // PDF Doc 1 Page 6 & 16: Technical Engineer only has Testing Person Report!
      return [{ name: 'Testing Person Report' }];
    }
    // Technical Manager & Reporting Manager have all 3 section reports
    return [
      { name: 'Testing Section Report' },
      { name: 'OIC Testing Report' },
      { name: 'Testing Person Report' }
    ];
  };

  const sampleHandlingSubItems = getRoleSampleHandlingItems();
  const reportSubItems = getRoleReportItems();

  return (
    <>
      {/* Mobile Toggle Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-[#1e293b] text-slate-200 transition-transform duration-300 transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static border-r border-slate-800 shadow-xl lg:shadow-none select-none font-sans`}>
        
        {/* Logo and Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-[#0f172a] border-b border-slate-800 text-white font-bold text-base tracking-wide gap-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="text-[#f59e0b] stroke-[2]" size={22} />
            <span>NTB Lab Portal</span>
          </div>
          <button 
            type="button"
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Item List strictly matching PDF Specs for active role */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin">
          
          {/* DASHBOARD */}
          <button
            type="button"
            onClick={() => navTo('Dashboard')}
            className={`flex items-center justify-between w-full px-4 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              isActive('Dashboard') 
                ? 'bg-[#f59e0b] text-slate-950 shadow-sm font-extrabold' 
                : 'hover:bg-[#334155] text-slate-300 hover:text-white'
            }`}
            aria-label="Navigate to Dashboard"
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard size={16} />
              <span>DASHBOARD</span>
            </div>
          </button>

          {/* SAMPLE HANDLING GROUP */}
          <div>
            <button
              type="button"
              onClick={() => { navTo('Sample Handling', sampleHandlingSubItems[0]?.name || ''); toggleGroup('handling'); }}
              className={`flex items-center justify-between w-full px-4 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                currentView === 'Sample Handling' 
                  ? 'bg-[#f59e0b] text-slate-950 shadow-sm font-extrabold' 
                  : 'hover:bg-[#334155] text-slate-300 hover:text-white'
              }`}
              aria-expanded={expandedGroups.handling}
              aria-label="Sample Handling group navigation"
            >
              <div className="flex items-center gap-3">
                <FlaskConical size={16} />
                <span>SAMPLE HANDLING</span>
              </div>
              {expandedGroups.handling ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {expandedGroups.handling && (
              <div className="pl-3 mt-1 space-y-0.5 border-l border-slate-800 ml-4 text-[11px]">
                {sampleHandlingSubItems.map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => navTo('Sample Handling', item.name)}
                    className={`flex items-center justify-between w-full py-1.5 px-3 rounded transition-colors text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                      isActive('Sample Handling', item.name)
                        ? 'text-[#f59e0b] font-bold bg-[#334155]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#334155]/50'
                    }`}
                    aria-label={`Navigate to Sample Handling ${item.name}`}
                  >
                    <span className="truncate pr-1">{item.name}</span>
                    {item.count > 0 && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-slate-900 text-[#f59e0b] border border-slate-700">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SERIES GROUP (Sample Cell Only per PDF Doc 3 Page 12) */}
          {selectedRole === 'Sample Cell' && (
            <div>
              <button
                type="button"
                onClick={() => { navTo('Series', 'Pending Requests'); toggleGroup('series'); }}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                  currentView === 'Series' 
                    ? 'bg-[#f59e0b] text-slate-950 shadow-sm font-extrabold' 
                    : 'hover:bg-[#334155] text-slate-300 hover:text-white'
                }`}
                aria-expanded={expandedGroups.series}
                aria-label="Series group navigation"
              >
                <div className="flex items-center gap-3">
                  <Layers size={16} />
                  <span>SERIES</span>
                </div>
                {expandedGroups.series ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {expandedGroups.series && (
                <div className="pl-3 mt-1 space-y-0.5 border-l border-slate-800 ml-4 text-[11px]">
                  {[
                    { name: 'Pending Requests', count: series.filter(s => s.status === 'Pending Requests' || s.pendingReports > 0).length },
                    { name: 'Pending Reports', count: series.filter(s => s.status === 'Pending Reports' || (s.completedReports > 0 && s.pendingReports > 0)).length },
                    { name: 'Final Reports', count: series.filter(s => s.status === 'Final Reports' || s.pendingReports === 0).length }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => navTo('Series', item.name)}
                      className={`flex items-center justify-between w-full py-1.5 px-3 rounded transition-colors text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                        isActive('Series', item.name)
                          ? 'text-[#f59e0b] font-bold bg-[#334155]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#334155]/50'
                      }`}
                      aria-label={`Navigate to Series ${item.name}`}
                    >
                      <span>{item.name}</span>
                      {item.count > 0 && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-slate-900 text-[#f59e0b] border border-slate-700">
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SAMPLE CLARIFICATIONS GROUP */}
          <div>
            <button
              type="button"
              onClick={() => { navTo('Sample Clarifications', 'All Clarifications'); toggleGroup('clarifications'); }}
              className={`flex items-center justify-between w-full px-4 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                currentView === 'Sample Clarifications' 
                  ? 'bg-[#f59e0b] text-slate-950 shadow-sm font-extrabold' 
                  : 'hover:bg-[#334155] text-slate-300 hover:text-white'
              }`}
              aria-expanded={expandedGroups.clarifications}
              aria-label="Sample Clarifications group navigation"
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={16} />
                <span>SAMPLE CLARIFICATIONS</span>
              </div>
              {expandedGroups.clarifications ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {expandedGroups.clarifications && (
              <div className="pl-3 mt-1 space-y-0.5 border-l border-slate-800 ml-4 text-[11px]">
                {[
                  { name: 'Clarifications Received', count: clarifications.filter(c => c.status === 'Open' && (selectedRole === 'Technical Engineer' ? c.sentTo === 'Technical Engineer' || c.assignedEngineer === selectedEngineer : c.sentTo === 'Technical Manager')).length },
                  { name: 'Clarifications Raised', count: clarifications.filter(c => c.status === 'Open' && c.sentTo === 'Sample Cell').length },
                  { name: 'All Clarifications', count: clarifications.length },
                  { name: 'Open Clarifications', count: clarifications.filter(c => c.status === 'Open').length },
                  { name: 'Closed Clarifications', count: clarifications.filter(c => c.status === 'Closed').length }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => navTo('Sample Clarifications', item.name)}
                    className={`flex items-center justify-between w-full py-1.5 px-3 rounded transition-colors text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                      isActive('Sample Clarifications', item.name)
                        ? 'text-[#f59e0b] font-bold bg-[#334155]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#334155]/50'
                    }`}
                    aria-label={`Navigate to Clarifications ${item.name}`}
                  >
                    <span>{item.name}</span>
                    {item.count > 0 && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-slate-900 text-[#f59e0b] border border-slate-700">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* REPORT GROUP (Technical Manager, Technical Engineer, Reporting Manager) */}
          {selectedRole !== 'Sample Cell' && selectedRole !== 'Admin' && (
            <div>
              <button
                type="button"
                onClick={() => { navTo('Reports', reportSubItems[0]?.name || 'Testing Person Report'); toggleGroup('reports'); }}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                  currentView === 'Reports' 
                    ? 'bg-[#f59e0b] text-slate-950 shadow-sm font-extrabold' 
                    : 'hover:bg-[#334155] text-slate-300 hover:text-white'
                }`}
                aria-expanded={expandedGroups.reports}
                aria-label="Reports group navigation"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={16} />
                  <span>REPORT</span>
                </div>
                {expandedGroups.reports ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {expandedGroups.reports && (
                <div className="pl-3 mt-1 space-y-0.5 border-l border-slate-800 ml-4 text-[11px]">
                  {reportSubItems.map((item) => (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() => navTo('Reports', item.name)}
                      className={`flex items-center justify-between w-full py-1.5 px-3 rounded transition-colors text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                        isActive('Reports', item.name)
                          ? 'text-[#f59e0b] font-bold bg-[#334155]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#334155]/50'
                      }`}
                      aria-label={`Navigate to Report ${item.name}`}
                    >
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* USER MANUAL */}
          <button
            type="button"
            onClick={() => navTo('User Manual')}
            className={`flex items-center justify-between w-full px-4 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              isActive('User Manual') 
                ? 'bg-[#f59e0b] text-slate-950 shadow-sm font-extrabold' 
                : 'hover:bg-[#334155] text-slate-300 hover:text-white'
            }`}
            aria-label="Navigate to User Manual"
          >
            <div className="flex items-center gap-3">
              <BookOpen size={16} />
              <span>USER MANUAL</span>
            </div>
          </button>

          {/* ADMIN CONNECTION SETTINGS (Admin Only) */}
          {selectedRole === 'Admin' && (
            <button
              type="button"
              onClick={() => navTo('Admin')}
              className={`flex items-center justify-between w-full px-4 py-2.5 mt-4 rounded-md text-xs font-bold transition-all border border-dashed cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                isActive('Admin')
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                  : 'border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database size={15} className="text-rose-500" />
                <span>ADMIN MASTER CONNECTION</span>
              </div>
            </button>
          )}

        </div>

        {/* User / Active Persona Footer */}
        <div className="p-4 bg-[#090f1a] border-t border-slate-800 flex flex-col gap-1">
          <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Active Role Workstation</div>
          <div className="text-xs font-bold text-white flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{selectedRole}</span>
          </div>
          {selectedRole === 'Technical Engineer' && (
            <div className="text-[11px] text-slate-400 pl-4">
              User: <span className="text-[#f59e0b] font-semibold">{selectedEngineer}</span>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}
