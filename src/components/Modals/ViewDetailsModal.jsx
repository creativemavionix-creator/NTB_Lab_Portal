import React, { useState } from 'react';
import { X, FileText, Download } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function ViewDetailsModal({ sample, isOpen, onClose, _onAction }) {
  const { triggerNotification } = useWorkflow();
  const [activeTab, setActiveTab] = useState('metadata');

  if (!isOpen || !sample) return null;

  // Determine stage (1..8) for Lifecycle Stepper
  const getStageIndex = (st) => {
    if (['New Sample Received', 'Accept'].includes(st)) return 1;
    if (['Pending Forwarding', 'Forward'].includes(st)) return 2;
    if (['Samples Allocated', 'Allocated'].includes(st)) return 3;
    if (['Pending', 'Accepted', 'Testing In Progress'].includes(st)) return 4;
    if (st === 'Test Results Pending Verification') return 5;
    if (st === 'Reports Pending') return 6;
    if (['Amended Reports Pending', 'Final Reports Pending', 'Sent to Sample Cell', 'Testing Completed'].includes(st)) return 7;
    return 8;
  };

  const currentStage = getStageIndex(sample.status);

  const stages = [
    { num: 1, title: 'Ingestion' },
    { num: 2, title: 'Acceptance' },
    { num: 3, title: 'Forwarding' },
    { num: 4, title: 'TM Allocation' },
    { num: 5, title: 'Engineer Testing' },
    { num: 6, title: 'TM Verification' },
    { num: 7, title: 'Final Reporting' },
    { num: 8, title: 'Completed' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 pt-3 sm:pt-4 bg-slate-950/75 backdrop-blur-xs font-sans overflow-y-auto" role="dialog" aria-modal="true" aria-label="Sample Details Dialog">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] my-0 sm:my-auto flex flex-col overflow-hidden border border-slate-300 text-slate-800 text-xs">
        
        {/* Header */}
        <div className="bg-[#1e293b] text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f59e0b] text-slate-950 rounded-lg">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide uppercase">
                COMPREHENSIVE SAMPLE PROFILE - {sample.id}
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                App Ref: <span className="font-bold text-[#f59e0b]">APP-2026-{sample.id}</span> | Product: {sample.product}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* 8-Stage Lifecycle Stepper Banner */}
        <div className="bg-slate-100 border-b border-slate-200 p-3 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[650px] px-2">
            {stages.map((st, idx) => {
              const isPast = currentStage > st.num;
              const isCurrent = currentStage === st.num;
              return (
                <React.Fragment key={st.num}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isCurrent ? 'bg-[#f59e0b] text-slate-950 ring-2 ring-amber-300' :
                      isPast ? 'bg-emerald-600 text-white' :
                      'bg-slate-300 text-slate-600'
                    }`}>
                      {isPast ? '✓' : st.num}
                    </div>
                    <span className={`text-[9px] font-bold mt-1 ${isCurrent ? 'text-amber-900 font-black' : isPast ? 'text-emerald-800' : 'text-slate-500'}`}>
                      {st.title}
                    </span>
                  </div>
                  {idx < stages.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 ${isPast ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 5 Tabs Header */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 text-xs font-bold gap-2">
          {[
            { id: 'metadata', label: '1. Metadata & Status' },
            { id: 'stepper', label: '2. Lifecycle Stepper' },
            { id: 'assignment', label: '3. Location & Assignment' },
            { id: 'reports', label: '4. Test Results & PDF' },
            { id: 'history', label: '5. Logs & History' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 border-b-2 font-black transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#f59e0b] text-[#1e3a8a] bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: METADATA & STATUS */}
          {activeTab === 'metadata' && (
            <div className="space-y-4 font-medium">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Sample ID</span>
                  <span className="font-extrabold text-[#1e3a8a] text-sm">{sample.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Status</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
                    {sample.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Priority</span>
                  <span className="font-bold text-rose-700">{sample.priority || 'Medium'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Date Received</span>
                  <span className="font-bold text-slate-800">{sample.dateReceived}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Product Name</span>
                  <span className="font-bold text-slate-900">{sample.product}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Applicant / Brand</span>
                  <span className="font-bold text-slate-900">{sample.applicant}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Sample Type</span>
                  <span className="font-semibold text-slate-800">{sample.sampleType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Standard Applied</span>
                  <span className="font-bold text-indigo-700">{sample.standard}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Quantity Received</span>
                  <span className="font-bold text-slate-800">{sample.quantity || '1.00'} units</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Testing Section</span>
                  <span className="font-bold text-indigo-700">{sample.testingSection || 'Mechanical'}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg space-y-1">
                <span className="text-[10px] text-blue-900 font-bold uppercase block">Required Test Clauses</span>
                <p className="text-slate-800 font-semibold">{sample.requiredTests || 'Clause 6.1 Pressure Leakage & Thermal Efficiency'}</p>
              </div>

              {sample.remarks && (
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg space-y-1">
                  <span className="text-[10px] text-amber-950 font-bold uppercase block">Remarks & Inward Notes</span>
                  <p className="text-slate-800">{sample.remarks}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LIFECYCLE STEPPER DETAILS */}
          {activeTab === 'stepper' && (
            <div className="space-y-4 font-medium">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Full Workflow Progression History
              </h4>
              <div className="space-y-3 pl-2 border-l-2 border-slate-300">
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white"></div>
                  <span className="text-[10px] font-bold text-slate-500">Stage 1: Sample Ingestion & Accept</span>
                  <p className="font-bold text-slate-900">Inward accepted by Sample Cell Officer on {sample.dateReceived}</p>
                </div>
                <div className="relative pl-6">
                  <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${currentStage >= 2 ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
                  <span className="text-[10px] font-bold text-slate-500">Stage 2: Test Request Generation</span>
                  <p className="font-bold text-slate-900">TR #{sample.testRequestId || `TR-${sample.id}`} generated and dispatched to Technical Manager</p>
                </div>
                <div className="relative pl-6">
                  <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${currentStage >= 3 ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
                  <span className="text-[10px] font-bold text-slate-500">Stage 3: Manager Allocation</span>
                  <p className="font-bold text-slate-900">Allocated to Engineer: {sample.assignedEngineer || 'Mariam Tyagi'}</p>
                </div>
                <div className="relative pl-6">
                  <div className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 border-white ${currentStage >= 4 ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
                  <span className="text-[10px] font-bold text-slate-500">Stage 4: Laboratory Testing</span>
                  <p className="font-bold text-slate-900">Active testing in progress in {sample.testingSection || 'Mechanical'} Section</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOCATION & ASSIGNMENT */}
          {activeTab === 'assignment' && (
            <div className="space-y-4 font-medium">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Location</span>
                  <span className="font-extrabold text-[#1e3a8a] text-sm">{sample.testingSection ? `${sample.testingSection} Section Lab` : 'Sample Cell Store Room'}</span>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Engineer</span>
                  <span className="font-extrabold text-indigo-700 text-sm">{sample.assignedEngineer || 'Mariam Tyagi'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEST RESULTS & PDF */}
          {activeTab === 'reports' && (
            <div className="space-y-4 font-medium">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <span className="text-[10px] text-emerald-900 font-bold uppercase block">Verified Test Results</span>
                <p className="text-slate-900 font-semibold">{sample.testResults || 'Sample passed hydrostatic pressure limit test at 3.0 kg/cm² without seepage or deformation.'}</p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="font-bold text-slate-700">Report Certificate Number: <span className="text-[#1e3a8a]">{sample.reportNumber || `REP-2026-${sample.id}`}</span></span>
                  <button
                    type="button"
                    onClick={() => triggerNotification(`Downloading official PDF certificate (${sample.reportNumber || sample.id}).pdf`, 'success')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                    aria-label={`Download official PDF certificate for ${sample.id}`}
                  >
                    <Download size={13} />
                    <span>Download Final PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LOGS & HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3 font-medium">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Chronological Ingestion Activity Log</span>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between">
                  <span>Sample inward accepted into Sample Cell portal</span>
                  <span className="font-bold text-slate-500">{sample.dateReceived}</span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between">
                  <span>TR #{sample.testRequestId || `TR-${sample.id}`} forwarded to Technical Manager</span>
                  <span className="font-bold text-slate-500">{sample.forwardedOn || sample.dateReceived}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-[#1e293b] hover:bg-slate-900 text-white font-bold rounded cursor-pointer">
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
}
