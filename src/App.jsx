import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Breadcrumbs from './components/Navigation/Breadcrumbs';
import CommandPalette from './components/Navigation/CommandPalette';
import MobileBottomNav from './components/Navigation/MobileBottomNav';
import DashboardView from './components/Views/DashboardView';
import SampleCellDashboardView from './components/Views/SampleCellDashboardView';
import SampleHandlingView from './components/Views/SampleHandlingView';
import SeriesView from './components/Views/SeriesView';
import ClarificationsView from './components/Views/ClarificationsView';
import ReportsView from './components/Views/ReportsView';
import UserManualView from './components/Views/UserManualView';
import AdminView from './components/Views/AdminView';
import LandingPage from './components/LandingPage/LandingPage';
import LoginModal from './components/Auth/LoginModal';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';

function AppContent() {
  const { notifications, isAuthenticated, selectedRole } = useWorkflow();

  const getDefaultRoleView = () => {
    if (selectedRole === 'Technical Engineer') return { view: 'Sample Handling', subView: 'Sample Receipt' };
    if (selectedRole === 'Sample Cell') return { view: 'Dashboard', subView: '' };
    if (selectedRole === 'Reporting Manager') return { view: 'Sample Handling', subView: 'Reports Pending' };
    if (selectedRole === 'Admin') return { view: 'Admin', subView: '' };
    return { view: 'Dashboard', subView: '' };
  };

  const defaultRoleObj = getDefaultRoleView();
  const [currentView, setCurrentView] = useState(defaultRoleObj.view);
  const [currentSubView, setCurrentSubView] = useState(defaultRoleObj.subView);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Role Navigation Guard: Verify permitted sub-views for active role
  const isRouteAllowed = (view, subView) => {
    if (view === 'Dashboard' || view === 'User Manual') return true;
    
    if (selectedRole === 'Admin') {
      return true;
    }

    if (selectedRole === 'Technical Engineer') {
      if (view === 'Admin') return false;
      if (view === 'Reports' && subView !== 'Testing Person Report') return false;
      if (view === 'Sample Handling' && !['Sample Receipt', 'Pending Samples', 'Issued Test Report'].includes(subView)) return false;
      return true;
    }

    if (selectedRole === 'Sample Cell') {
      if (view === 'Admin') return false;
      if (view === 'Reports') return false;
      return true;
    }

    if (selectedRole === 'Reporting Manager') {
      if (view === 'Admin') return false;
      if (view === 'Sample Handling' && !['Reports Pending', 'Amended Reports Pending', 'Final Reports'].includes(subView)) return false;
      return true;
    }

    if (selectedRole !== 'Sample Cell' && subView === 'Create Sample') {
      return false;
    }

    return true;
  };

  // SubView canonical name decoder helper
  const mapSubViewName = (str) => {
    if (!str) return '';
    const decoded = decodeURIComponent(str).replace(/-/g, ' ').toLowerCase();
    
    // Explicit aliases map from section 2 target routes
    const aliases = {
      'create': 'Create Sample',
      'create-sample': 'Create Sample',
      'create sample': 'Create Sample',
      'accept': 'Accept',
      'forward': 'Forward',
      'pending-reports': 'Pending Test Reports',
      'pending test reports': 'Pending Test Reports',
      'amended-reports': 'Pending Amended Test Reports',
      'pending amended test reports': 'Pending Amended Test Reports',
      'final-reports': 'Final Reports',
      'disputed': 'Disputed',
      'returns': 'Return Requests',
      'return-requests': 'Return Requests',
      'discards': 'Discard Requests',
      'discard-requests': 'Discard Requests',
      'withdrawn': 'Withdrawn Samples',
      'withdrawn-samples': 'Withdrawn Samples',
      'requests': 'Pending Requests',
      'pending-requests': 'Pending Requests',
      'open': 'Open Clarifications',
      'open-clarifications': 'Open Clarifications'
    };

    if (aliases[decoded]) return aliases[decoded];
    if (aliases[str.toLowerCase()]) return aliases[str.toLowerCase()];

    const knownSubViews = [
      'Create Sample', 'Sample Receipt', 'Pending Samples', 'Issued Test Report',
      'New Sample Received', 'Supplementary Sample Received', 'Amended Sample Received',
      'Pending Amendment Requests', 'Samples Allocated / Pending View', 'Samples Allocated / Pending',
      'Verify Test Results', 'Reports Pending', 'Amended Reports Pending',
      'Final Reports & Auto-Sync Connection', 'Final Reports',
      'Clarifications Received', 'Clarifications Raised', 'Open Clarifications', 'Closed Clarifications', 'All Clarifications',
      'Testing Section Report', 'OIC Testing Report', 'Testing Person Report',
      'Accept', 'Forward', 'Disputed', 'Return Requests', 'Discard Requests', 'Generate Test Request', 'Withdrawn Samples',
      'Pending Requests'
    ];

    const match = knownSubViews.find(kv => kv.toLowerCase() === decoded);
    return match || str;
  };

  // Parse URL Hash & Enforce Route Guard
  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash.replace('#', '');
      if (!hash) {
        const def = getDefaultRoleView();
        setCurrentView(def.view);
        setCurrentSubView(def.subView);
        return;
      }

      // Support /sample-cell/handling/accept format
      if (hash.startsWith('/')) hash = hash.substring(1);
      if (hash.startsWith('sample-cell/')) {
        hash = hash.replace('sample-cell/', '');
      }

      const parts = hash.split('/');
      let mainPart = parts[0];
      let subPart = parts[1] ? mapSubViewName(parts[1]) : '';

      if (mainPart === 'handling') mainPart = 'sample-handling';
      if (mainPart === 'clarifications') mainPart = 'sample-clarifications';

      let targetView = 'Dashboard';
      let targetSubView = '';

      if (mainPart === 'dashboard') {
        targetView = 'Dashboard';
      } else if (mainPart === 'sample-handling') {
        targetView = 'Sample Handling';
        targetSubView = subPart || (selectedRole === 'Technical Engineer' ? 'Sample Receipt' : selectedRole === 'Sample Cell' ? 'Accept' : 'New Sample Received');
      } else if (mainPart === 'series') {
        targetView = 'Series';
        targetSubView = subPart || 'Pending Requests';
      } else if (mainPart === 'sample-clarifications') {
        targetView = 'Sample Clarifications';
        targetSubView = subPart || 'All Clarifications';
      } else if (mainPart === 'reports') {
        targetView = 'Reports';
        targetSubView = subPart || (selectedRole === 'Technical Engineer' ? 'Testing Person Report' : 'Testing Section Report');
      } else if (mainPart === 'user-manual') {
        targetView = 'User Manual';
      } else if (mainPart === 'admin') {
        targetView = 'Admin';
      }

      if (isRouteAllowed(targetView, targetSubView)) {
        setCurrentView(targetView);
        setCurrentSubView(targetSubView);
      } else {
        // Redirect unauthorized route to role default
        const def = getDefaultRoleView();
        setCurrentView(def.view);
        setCurrentSubView(def.subView);
        window.location.hash = `#${def.view.toLowerCase().replace(/\s+/g, '-')}/${encodeURIComponent(def.subView.toLowerCase().replace(/\s+/g, '-'))}`;
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedRole]);

  // Global Keyboard Shortcut (Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleNavigate = (view, subView = '') => {
    if (!isRouteAllowed(view, subView)) {
      const def = getDefaultRoleView();
      view = def.view;
      subView = def.subView;
    }

    setCurrentView(view);
    setCurrentSubView(subView);

    let hash = `#${view.toLowerCase().replace(/\s+/g, '-')}`;
    if (subView) {
      hash += `/${encodeURIComponent(subView.toLowerCase().replace(/\s+/g, '-'))}`;
    }
    window.location.hash = hash;
  };

  const renderActiveView = () => {
    switch (currentView) {
      case 'Dashboard':
        return selectedRole === 'Sample Cell' ? (
          <SampleCellDashboardView setCurrentView={setCurrentView} setCurrentSubView={setCurrentSubView} />
        ) : (
          <DashboardView setCurrentView={setCurrentView} setCurrentSubView={setCurrentSubView} />
        );
      case 'Sample Handling':
        return <SampleHandlingView subView={currentSubView} />;
      case 'Series':
        return <SeriesView subView={currentSubView} />;
      case 'Sample Clarifications':
        return <ClarificationsView subView={currentSubView} />;
      case 'Reports':
        return <ReportsView subView={currentSubView} />;
      case 'User Manual':
        return <UserManualView />;
      case 'Admin':
        return <AdminView />;
      default:
        return selectedRole === 'Sample Cell' ? (
          <SampleCellDashboardView setCurrentView={setCurrentView} setCurrentSubView={setCurrentSubView} />
        ) : (
          <DashboardView setCurrentView={setCurrentView} setCurrentSubView={setCurrentSubView} />
        );
    }
  };

  // Render Landing Page if unauthenticated
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onOpenLogin={() => setIsLoginModalOpen(true)} />
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />

        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl shadow-xl border text-xs font-bold flex items-center justify-between text-white pointer-events-auto transform translate-y-0 transition-all duration-300 ${
                notif.type === 'success' ? 'bg-emerald-600 border-emerald-500' :
                notif.type === 'warning' ? 'bg-amber-600 border-amber-500' :
                'bg-slate-900 border-slate-800'
              }`}
            >
              <span>{notif.message}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Workstation Dashboard View when Authenticated
  return (
    <div className="flex h-screen overflow-hidden bg-[#edf3f9] text-slate-800 font-sans select-none antialiased">
      
      {/* Sidebar Navigation Drawer (Dark Navy #0e1726) */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        currentSubView={currentSubView}
        setCurrentSubView={setCurrentSubView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Panel (Soft Light Ice Blue Canvas #edf3f9) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#edf3f9]">
        
        {/* Header containing Simulator selector & Global Search trigger */}
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        {/* Dynamic Breadcrumbs Navigation */}
        <Breadcrumbs 
          currentView={currentView} 
          currentSubView={currentSubView} 
          onNavigate={handleNavigate}
        />

        {/* Scrollable View Area (Exact PDF Canvas) */}
        <main className="flex-1 overflow-y-auto bg-[#edf3f9] scrollbar-thin">
          <div className="max-w-[1600px] w-full mx-auto">
            {renderActiveView()}
          </div>
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar (< lg breakpoint) */}
      <MobileBottomNav 
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Command Palette Overlay (Ctrl+K) */}
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Login / Switch Account Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-16 lg:bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-xl shadow-xl border text-xs font-bold flex items-center justify-between text-white pointer-events-auto transform translate-y-0 transition-all duration-300 ${
              notif.type === 'success' ? 'bg-emerald-600 border-emerald-500' :
              notif.type === 'warning' ? 'bg-amber-600 border-amber-500' :
              'bg-slate-900 border-slate-800'
            }`}
          >
            <span>{notif.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default function App() {
  return (
    <WorkflowProvider>
      <AppContent />
    </WorkflowProvider>
  );
}
