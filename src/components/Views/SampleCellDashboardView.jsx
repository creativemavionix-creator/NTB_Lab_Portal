import React, { useState } from 'react';
import { 
  FlaskConical, 
  Inbox, 
  Send, 
  FileCheck, 
  FileEdit, 
  CheckSquare, 
  AlertTriangle, 
  RotateCcw, 
  Trash2, 
  XCircle, 
  Layers, 
  HelpCircle, 
  PlusCircle, 
  Download, 
  Clock 
} from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import GenerateTestRequestModal from '../Modals/GenerateTestRequestModal';
import ViewDetailsModal from '../Modals/ViewDetailsModal';

export default function SampleCellDashboardView({ setCurrentView, setCurrentSubView, navToSubView }) {
  const { 
    samples, 
    series, 
    clarifications, 
    logs,
    sampleRequests,
    acceptSampleCell, 
    forwardSampleCell, 
    resolveDispute,
    approveReturnRequest,
    approveDiscardRequest,
    triggerNotification 
  } = useWorkflow();

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedSampleDetails, setSelectedSampleDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // 1. KPI SUMMARY CARD CALCULATION LOGIC (DATA FORMULAS)
  const totalSamples = samples.length;
  const pendingAcceptance = samples.filter(s => s.status === 'AWAITING_ACCEPTANCE' || s.status === 'New Sample Received' || s.status === 'Accept').length;
  const pendingForwarding = samples.filter(s => s.status === 'ACCEPTED_PENDING_FORWARD' || s.status === 'Pending Forwarding' || s.status === 'Forward').length;
  const pendingTestReports = samples.filter(s => ['FORWARDED_TO_TM', 'ALLOCATED', 'TESTING_IN_PROGRESS', 'TEST_COMPLETED_VERIFYING', 'REPORT_PENDING', 'Reports Pending', 'Samples Allocated', 'Testing In Progress', 'Test Results Pending Verification', 'Pending Test Reports'].includes(s.status)).length;
  const pendingAmendedReports = samples.filter(s => s.status === 'AMENDMENT_REQUESTED' || s.status === 'Amended Reports Pending' || s.status === 'Pending Amended Test Reports' || s.type === 'Amended Report').length;
  const finalReports = samples.filter(s => ['REPORT_APPROVED_AND_RECEIVED', 'FINAL_RECEIVED', 'Sent to Sample Cell', 'Testing Completed', 'Final Reports'].includes(s.status) || s.verificationStatus === 'Verified').length;
  const disputedSamples = samples.filter(s => (s.is_disputed === true || s.isDisputed === true || s.status === 'Disputed') && (s.dispute_status === 'OPEN' || s.disputeStatus === 'OPEN' || !s.disputeStatus || s.disputeStatus === 'Open')).length;
  const returnRequestsCount = (sampleRequests || []).filter(r => r.type === 'RETURN' && r.status === 'PENDING').length + samples.filter(s => s.status === 'Return Requests').length;
  const discardRequestsCount = (sampleRequests || []).filter(r => r.type === 'DISCARD' && r.status === 'PENDING').length + samples.filter(s => s.status === 'Discard Requests').length;
  const withdrawnSamples = samples.filter(s => s.status === 'WITHDRAWN' || s.status === 'Withdrawn Samples').length;
  const seriesRequests = series.filter(s => s.status === 'PENDING_REQUEST' || s.status === 'PENDING' || s.status === 'Pending Requests').length;
  const seriesReports = series.filter(s => s.status === 'TESTING_IN_PROGRESS' || s.status === 'REPORTS_PENDING' || s.status === 'Pending Reports').length;
  const openClarifications = clarifications.filter(c => c.status === 'OPEN' || c.status === 'Open').length;

  const handleOpenDetails = (sample) => {
    setSelectedSampleDetails(sample);
    setIsDetailsModalOpen(true);
  };

  // 2. CARD CLICK & ROUTING STATE MAP
  const navToRoute = (view, subView, hashRoute) => {
    if (setCurrentView) setCurrentView(view);
    if (setCurrentSubView) setCurrentSubView(subView);
    if (navToSubView) navToSubView(subView);
    window.location.hash = hashRoute;
  };

  const metricCards = [
    { title: 'Total Samples', count: totalSamples, icon: FlaskConical, color: 'border-l-4 border-[#1e3a8a] bg-blue-50/60 text-[#1e3a8a]', view: 'Sample Handling', subView: 'Accept', route: '#/sample-cell/handling/accept' },
    { title: 'Pending Acceptance', count: pendingAcceptance, icon: Inbox, color: 'border-l-4 border-amber-500 bg-amber-50/60 text-amber-900', view: 'Sample Handling', subView: 'Accept', route: '#/sample-cell/handling/accept' },
    { title: 'Pending Forwarding', count: pendingForwarding, icon: Send, color: 'border-l-4 border-indigo-500 bg-indigo-50/60 text-indigo-900', view: 'Sample Handling', subView: 'Forward', route: '#/sample-cell/handling/forward' },
    { title: 'Pending Test Reports', count: pendingTestReports, icon: FileCheck, color: 'border-l-4 border-cyan-500 bg-cyan-50/60 text-cyan-900', view: 'Sample Handling', subView: 'Pending Test Reports', route: '#/sample-cell/handling/pending-reports' },
    { title: 'Pending Amended Reports', count: pendingAmendedReports, icon: FileEdit, color: 'border-l-4 border-purple-500 bg-purple-50/60 text-purple-900', view: 'Sample Handling', subView: 'Pending Amended Test Reports', route: '#/sample-cell/handling/amended-reports' },
    { title: 'Final Reports', count: finalReports, icon: CheckSquare, color: 'border-l-4 border-emerald-500 bg-emerald-50/60 text-emerald-900', view: 'Sample Handling', subView: 'Final Reports', route: '#/sample-cell/handling/final-reports' },
    { title: 'Disputed Samples', count: disputedSamples, icon: AlertTriangle, color: 'border-l-4 border-rose-500 bg-rose-50/60 text-rose-900', view: 'Sample Handling', subView: 'Disputed', route: '#/sample-cell/handling/disputed' },
    { title: 'Return Requests', count: returnRequestsCount, icon: RotateCcw, color: 'border-l-4 border-orange-500 bg-orange-50/60 text-orange-900', view: 'Sample Handling', subView: 'Return Requests', route: '#/sample-cell/handling/returns' },
    { title: 'Discard Requests', count: discardRequestsCount, icon: Trash2, color: 'border-l-4 border-red-500 bg-red-50/60 text-red-900', view: 'Sample Handling', subView: 'Discard Requests', route: '#/sample-cell/handling/discards' },
    { title: 'Withdrawn Samples', count: withdrawnSamples, icon: XCircle, color: 'border-l-4 border-slate-600 bg-slate-100 text-slate-900', view: 'Sample Handling', subView: 'Withdrawn Samples', route: '#/sample-cell/handling/withdrawn' },
    { title: 'Pending Series Requests', count: seriesRequests, icon: Layers, color: 'border-l-4 border-teal-500 bg-teal-50/60 text-teal-900', view: 'Series', subView: 'Pending Requests', route: '#/sample-cell/series/requests' },
    { title: 'Pending Series Reports', count: seriesReports, icon: Layers, color: 'border-l-4 border-sky-500 bg-sky-50/60 text-sky-900', view: 'Series', subView: 'Pending Reports', route: '#/sample-cell/series/pending-reports' },
    { title: 'Open Clarifications', count: openClarifications, icon: HelpCircle, color: 'border-l-4 border-amber-600 bg-amber-100/60 text-amber-950', view: 'Sample Clarifications', subView: 'Open Clarifications', route: '#/sample-cell/clarifications/open' },
  ];

  // 4. RECENT ACTIVITY & PENDING ACTIONS WIDGETS
  const recentActivities = (logs || []).slice(0, 10).map(l => ({
    id: l.id,
    time: l.time,
    text: l.text,
    sampleId: l.text.match(/#[A-Za-z0-9-]+/) ? l.text.match(/#[A-Za-z0-9-]+/)[0].replace('#', '') : null
  }));

  // Aggregated Pending Actions requiring urgent Sample Cell action
  const pendingActions = [
    ...samples.filter(s => s.status === 'New Sample Received' || s.status === 'AWAITING_ACCEPTANCE').map(s => ({
      id: s.id,
      title: `Unaccepted Inward Sample #${s.id}`,
      subtitle: `${s.product} - ${s.applicant}`,
      priority: s.priority === 'High' ? 'URGENT' : 'HIGH',
      type: 'Accept',
      sample: s,
      actionLabel: 'Accept Sample',
      onAction: () => acceptSampleCell(s.id)
    })),
    ...samples.filter(s => s.status === 'Pending Forwarding' || s.status === 'ACCEPTED_PENDING_FORWARD').map(s => ({
      id: s.id,
      title: `Unforwarded Sample #${s.id}`,
      subtitle: `Accepted sample pending TM dispatch`,
      priority: 'HIGH',
      type: 'Forward',
      sample: s,
      actionLabel: 'Forward to TM',
      onAction: () => forwardSampleCell(s.id, 'Technical Manager')
    })),
    ...samples.filter(s => (s.is_disputed === true || s.isDisputed === true || s.status === 'Disputed') && (s.dispute_status === 'OPEN' || s.disputeStatus === 'OPEN' || !s.disputeStatus)).map(s => ({
      id: s.id,
      title: `Unresolved Dispute for #${s.id}`,
      subtitle: s.disputeReason || 'Specification dispute open',
      priority: 'URGENT',
      type: 'Dispute',
      sample: s,
      actionLabel: 'Resolve Dispute',
      onAction: () => resolveDispute(s.id)
    })),
    ...(sampleRequests || []).filter(r => r.status === 'PENDING').map(r => ({
      id: r.id,
      title: `${r.type === 'RETURN' ? 'Return' : 'Discard'} Request #${r.id}`,
      subtitle: `Sample #${r.sampleId} - ${r.reason}`,
      priority: 'MEDIUM',
      type: r.type,
      sample: samples.find(s => s.id === r.sampleId) || { id: r.sampleId, product: r.product },
      actionLabel: `Approve ${r.type === 'RETURN' ? 'Return' : 'Discard'}`,
      onAction: () => r.type === 'RETURN' ? approveReturnRequest(r.id) : approveDiscardRequest(r.id)
    }))
  ].sort((a, b) => (a.priority === 'URGENT' ? -1 : b.priority === 'URGENT' ? 1 : a.priority === 'HIGH' ? -1 : 1));

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 pb-20 bg-[#edf3f9] text-slate-800 min-h-full font-sans">
      
      {/* Sample Cell Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#1e3a8a] p-6 md:p-8 rounded-xl shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f5b041] text-slate-950 font-black text-[10px] uppercase tracking-wider">
              NTB Sample Cell Hub
            </span>
            <span className="text-xs text-blue-200 font-semibold">BIS LIMS Gateway</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-100">
            Sample Cell Management Dashboard & Workflow Portal
          </h1>
          <p className="text-blue-100 text-xs md:text-sm max-w-3xl leading-relaxed font-medium">
            Inward sample ingestion, Test Request generation, real-time dispatch forwarding, dispute tracking, and automated Return Loop final report PDF ingestion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navToRoute('Sample Handling', 'Create Sample', '#/sample-cell/handling/create')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer touch-manipulation uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          >
            <PlusCircle size={16} />
            <span>Register New Sample</span>
          </button>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 px-4 py-2.5 rounded-lg font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer touch-manipulation uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            <PlusCircle size={16} />
            <span>Generate Test Request</span>
          </button>
        </div>
      </div>

      {/* 13 Interactive Metric Cards */}
      <div className="space-y-2">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
          Sample Cell Operations & Ingestion Metrics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {metricCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                onClick={() => navToRoute(card.view, card.subView, card.route)}
                className={`p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${card.color}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wider truncate">{card.title}</span>
                  <Icon size={16} className="shrink-0" />
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-2xl font-black text-slate-900">{card.count}</span>
                  <span className="text-[9px] font-extrabold underline opacity-80 group-hover:opacity-100">View →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: RECENT ACTIVITY & PENDING ACTIONS WIDGETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity Feed Widget */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-[#f5b041]" />
              Recent Activity Feed (Real-Time Ingestion Stream)
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Top 10 Live Events</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {recentActivities.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-3 text-center">No recent activity logs recorded yet.</div>
            ) : (
              recentActivities.map((act) => {
                const targetSample = samples.find(s => s.id === act.sampleId);
                return (
                  <div key={act.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5 flex-1">
                      <div className="font-semibold text-slate-800 leading-snug">{act.text}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{act.time}</div>
                    </div>
                    {targetSample && (
                      <button
                        onClick={() => handleOpenDetails(targetSample)}
                        className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-extrabold rounded text-[10px] cursor-pointer shrink-0"
                      >
                        View Record →
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pending Actions Widget */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-600" />
              Pending Urgent Actions Widget (Sample Cell Desk)
            </h3>
            <span className="px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 font-black text-[10px] rounded-full">
              {pendingActions.length} Actions Required
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {pendingActions.length === 0 ? (
              <div className="text-xs text-emerald-700 font-bold p-4 text-center bg-emerald-50 rounded-lg border border-emerald-200">
                ✓ All pending Sample Cell operations are up to date!
              </div>
            ) : (
              pendingActions.map((act) => (
                <div key={act.id} className="p-2.5 bg-amber-50/50 border border-amber-200 rounded-lg flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                        act.priority === 'URGENT' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {act.priority}
                      </span>
                      <span className="font-bold text-slate-900 truncate">{act.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 truncate">{act.subtitle}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {act.sample && (
                      <button
                        onClick={() => handleOpenDetails(act.sample)}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-800 text-white font-bold text-[10px] rounded cursor-pointer"
                      >
                        View
                      </button>
                    )}
                    <button
                      onClick={act.onAction}
                      className="px-2.5 py-1 bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 font-black text-[10px] rounded shadow-2xs cursor-pointer uppercase tracking-wider"
                    >
                      {act.actionLabel}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ACTION QUICK-SECTIONS GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Accept Quick-Grid */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <Inbox size={16} className="text-[#f5b041]" />
              Inward Accept Queue (New Samples)
            </h3>
            <button onClick={() => navToSubView('Accept')} className="text-[11px] font-bold text-indigo-700 hover:underline">
              View All Inward →
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-2">Sample ID</th>
                  <th className="p-2">Product</th>
                  <th className="p-2">Applicant</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {samples.slice(0, 4).map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(s)}
                        className="font-bold text-[#1e3a8a] hover:underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded text-left"
                        aria-label={`View details for sample ${s.id}`}
                      >
                        {s.id}
                      </button>
                    </td>
                    <td className="p-2 text-slate-900 font-bold truncate max-w-[120px]">{s.product}</td>
                    <td className="p-2 text-slate-600 truncate max-w-[100px]">{s.applicant}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-2 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => acceptSampleCell(s.id)}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                        aria-label={`Accept sample ${s.id}`}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(s)}
                        className="px-2 py-0.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-[10px] font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:outline-none"
                        aria-label={`View details for sample ${s.id}`}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Forward Quick-Grid */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black text-[#1e3a8a] uppercase tracking-wider flex items-center gap-2">
              <Send size={16} className="text-[#f5b041]" />
              Forwarding Queue to Technical Manager
            </h3>
            <button
              type="button"
              onClick={() => navToSubView('Forward')}
              className="text-[11px] font-bold text-indigo-700 hover:underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
            >
              View All Forwarding →
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-2">Sample ID</th>
                  <th className="p-2">Product</th>
                  <th className="p-2">Testing Section</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {samples.slice(0, 4).map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(s)}
                        className="font-bold text-[#1e3a8a] hover:underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded text-left"
                        aria-label={`View details for sample ${s.id}`}
                      >
                        {s.id}
                      </button>
                    </td>
                    <td className="p-2 text-slate-900 font-bold truncate max-w-[120px]">{s.product}</td>
                    <td className="p-2 font-bold text-indigo-700">{s.testingSection || 'Mechanical'}</td>
                    <td className="p-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <button
                        type="button"
                        onClick={() => forwardSampleCell(s.id, 'Technical Manager')}
                        className="px-2.5 py-0.5 bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 rounded text-[10px] font-black cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                        aria-label={`Forward sample ${s.id} to Technical Manager`}
                      >
                        Forward to TM
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* FINAL REPORTS AUTO-SYNC INGESTION GRID */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2">
            <CheckSquare size={18} className="text-emerald-600" />
            Automatic Ingestion of Approved Final Reports & Certificates (Return Loop Sync)
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-extrabold">
            Auto-Synced from Reporting Manager
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1e293b] text-slate-200 font-bold uppercase text-[10px]">
                <th className="p-2.5">Sample ID</th>
                <th className="p-2.5">Report Number</th>
                <th className="p-2.5">Product</th>
                <th className="p-2.5">Testing Section</th>
                <th className="p-2.5">Report Date</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {samples.filter(s => ['Sent to Sample Cell', 'Testing Completed', 'Final Reports'].includes(s.status) || s.verificationStatus === 'Verified').slice(0, 5).map(s => (
                <tr key={s.id} className="hover:bg-emerald-50/50">
                  <td className="p-2.5">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(s)}
                      className="font-black text-[#1e3a8a] hover:underline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded text-left"
                      aria-label={`View details for sample ${s.id}`}
                    >
                      {s.id}
                    </button>
                  </td>
                  <td className="p-2.5 font-bold text-slate-800">{s.reportNumber || `REP-2026-${s.id}`}</td>
                  <td className="p-2.5 font-bold text-slate-900">{s.product}</td>
                  <td className="p-2.5 font-bold text-indigo-700">{s.testingSection}</td>
                  <td className="p-2.5 text-slate-600">{s.reportDate || '2026-02-05'}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                      Approved & Synced
                    </span>
                  </td>
                  <td className="p-2.5 text-right space-x-2">
                    <button onClick={() => handleOpenDetails(s)} className="px-2.5 py-1 bg-[#1e3a8a] hover:bg-blue-800 text-white rounded text-[10px] font-bold cursor-pointer">
                      View Report
                    </button>
                    <button onClick={() => triggerNotification(`Downloading PDF: Final_Test_Report_${s.id}.pdf`, 'success')} className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1">
                      <Download size={11} />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <GenerateTestRequestModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />

      <ViewDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        sample={selectedSampleDetails}
      />

    </div>
  );
}
