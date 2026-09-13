import React, { useState } from 'react';
import { HelpCircle, PlusCircle, FileText, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import EmptyState from '../EmptyState';
import ClarificationModal from '../Modals/ClarificationModal';

export default function ClarificationsView({ subView }) {
  const { clarifications, selectedRole, selectedEngineer, samples } = useWorkflow();
  const [selectedClar, setSelectedClar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRaiseOpen, setIsRaiseOpen] = useState(false);

  const activeSubViewName = subView || 'All Clarifications';

  const calculateDaysOpen = (dateRaised) => {
    if (!dateRaised) return '1 day';
    const start = new Date(dateRaised);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  };

  const getFilteredClarifications = () => {
    let list = [...clarifications];

    // Data Scoping Guardrail for Technical Engineer
    if (selectedRole === 'Technical Engineer') {
      list = list.filter(c => 
        c.assignedEngineer === selectedEngineer || 
        c.raisedBy === selectedEngineer || 
        c.sentTo === 'Technical Engineer' ||
        (c.receivedFrom && c.receivedFrom.includes(selectedEngineer))
      );
    }

    switch (activeSubViewName) {
      case 'Clarifications Received':
        if (selectedRole === 'Technical Engineer') {
          list = list.filter(c => c.sentTo === 'Technical Engineer' || c.assignedEngineer === selectedEngineer);
        } else if (selectedRole === 'Sample Cell') {
          list = list.filter(c => c.sentTo === 'Sample Cell');
        } else {
          list = list.filter(c => c.sentTo === 'Technical Manager');
        }
        break;
      case 'Clarifications Raised':
        if (selectedRole === 'Technical Engineer') {
          list = list.filter(c => c.raisedBy === selectedEngineer || c.sentTo === 'Sample Cell');
        } else if (selectedRole === 'Sample Cell') {
          list = list.filter(c => c.sentTo === 'Technical Manager');
        } else {
          list = list.filter(c => c.sentTo === 'Sample Cell');
        }
        break;
      case 'Open Clarifications':
        list = list.filter(c => c.status === 'Open');
        break;
      case 'Closed Clarifications':
        list = list.filter(c => c.status === 'Closed');
        break;
      case 'All Clarifications':
      default:
        break;
    }
    return list;
  };

  const filteredList = getFilteredClarifications();

  const handleRowClick = (clar) => {
    setSelectedClar(clar);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 pb-20 bg-[#edf3f9] text-slate-800 min-h-full font-sans">
      
      {/* Title Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <div className="flex items-center gap-3">
          <h2 className="text-sm md:text-base font-extrabold text-[#1e3a8a] uppercase tracking-tight">
            SAMPLE CLARIFICATIONS MODULE - {activeSubViewName.toUpperCase()}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-semibold">
            <span className="text-slate-700 font-bold">{filteredList.length} Results</span>
          </div>
        </div>

        <button
          onClick={() => { setSelectedClar(null); setIsRaiseOpen(true); }}
          className="bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer touch-manipulation"
        >
          <PlusCircle size={13} />
          <span>Raise Technical Query</span>
        </button>
      </div>

      {/* Table */}
      {filteredList.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
          
          {/* Mobile View */}
          <div className="block sm:hidden space-y-3 p-3 bg-slate-50 divide-y divide-slate-200">
            {filteredList.map((clar, idx) => (
              <div key={clar.id} className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-2 text-xs pt-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-mono font-bold text-indigo-900 text-xs">#{clar.id}</span>
                  <div className="flex items-center gap-1.5">
                    {clar.status === 'Open' && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        {calculateDaysOpen(clar.dateRaised)} Open
                      </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      clar.status === 'Open' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {clar.status === 'Open' ? 'Open Query' : 'Closed'}
                    </span>
                  </div>
                </div>

                <div className="font-bold text-slate-900 text-xs">{clar.subject}</div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div>
                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Sample Ref</span>
                    <span className="font-mono font-bold text-indigo-700">{clar.sampleId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Raised On</span>
                    <span className="font-semibold text-slate-700">{clar.dateRaised || clar.dateReceived}</span>
                  </div>
                </div>

                {clar.clarification && (
                  <div className="bg-slate-50 border border-slate-200 rounded p-2 text-[10px] text-slate-700">
                    <span className="font-bold block text-[8px] uppercase text-slate-500">Query Details</span>
                    {clar.clarification}
                  </div>
                )}

                {clar.response && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-[10px] text-emerald-900">
                    <span className="font-bold block text-[8px] uppercase text-emerald-700">Resolution</span>
                    {clar.response}
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-slate-100 gap-1.5">
                  <button
                    onClick={() => handleRowClick(clar)}
                    className="bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 px-3 py-1 rounded font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                  >
                    <span>{clar.status === 'Open' ? 'Respond / Close' : 'View Resolution'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1e3a8a] text-white uppercase tracking-wider font-bold text-[10px] border-b border-slate-800 select-none">
                  {activeSubViewName === 'Clarifications Received' ? (
                    <>
                      <th className="p-3">Clarification ID</th>
                      <th className="p-3">Sample ID</th>
                      <th className="p-3">Received From</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </>
                  ) : activeSubViewName === 'Clarifications Raised' ? (
                    <>
                      <th className="p-3">Clarification ID</th>
                      <th className="p-3">Sample ID</th>
                      <th className="p-3">Raised By</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </>
                  ) : activeSubViewName === 'Closed Clarifications' ? (
                    <>
                      <th className="p-3">Clarification ID</th>
                      <th className="p-3">Sample ID</th>
                      <th className="p-3">Resolution Summary</th>
                      <th className="p-3">Closed By</th>
                      <th className="p-3">Closed Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </>
                  ) : (
                    <>
                      <th className="p-3">Clarification ID</th>
                      <th className="p-3">Sample ID</th>
                      <th className="p-3">Issue</th>
                      <th className="p-3">Assigned User</th>
                      <th className="p-3">Date Raised</th>
                      <th className="p-3 text-center">Days Open</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-slate-800 font-medium">
                {filteredList.map((clar) => (
                  <tr key={clar.id} className="hover:bg-slate-50 transition-colors">
                    {activeSubViewName === 'Clarifications Received' ? (
                      <>
                        <td className="p-3 font-mono font-bold text-slate-900">#{clar.id}</td>
                        <td className="p-3 font-mono font-bold text-indigo-700">{clar.sampleId}</td>
                        <td className="p-3 font-semibold text-slate-800">{clar.receivedFrom || 'Technical Engineer'}</td>
                        <td className="p-3 font-semibold text-slate-900 max-w-[200px] truncate" title={clar.subject}>{clar.subject}</td>
                        <td className="p-3 text-slate-600">{clar.dateReceived || clar.dateRaised}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${clar.status === 'Open' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                            {clar.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRowClick(clar)}
                            className="bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer inline-flex"
                          >
                            <MessageSquare size={11} />
                            <span>Respond</span>
                          </button>
                        </td>
                      </>
                    ) : activeSubViewName === 'Clarifications Raised' ? (
                      <>
                        <td className="p-3 font-mono font-bold text-slate-900">#{clar.id}</td>
                        <td className="p-3 font-mono font-bold text-indigo-700">{clar.sampleId}</td>
                        <td className="p-3 font-semibold text-slate-800">{clar.raisedBy || selectedEngineer}</td>
                        <td className="p-3 font-semibold text-slate-900 max-w-[200px] truncate" title={clar.subject}>{clar.subject}</td>
                        <td className="p-3 text-slate-600">{clar.dateRaised || clar.dateReceived}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${clar.status === 'Open' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                            {clar.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRowClick(clar)}
                            className="bg-slate-700 hover:bg-slate-800 text-white px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer inline-flex"
                          >
                            <MessageSquare size={11} />
                            <span>View Response</span>
                          </button>
                        </td>
                      </>
                    ) : activeSubViewName === 'Closed Clarifications' ? (
                      <>
                        <td className="p-3 font-mono font-bold text-slate-900">#{clar.id}</td>
                        <td className="p-3 font-mono font-bold text-indigo-700">{clar.sampleId}</td>
                        <td className="p-3 text-emerald-900 font-semibold max-w-[220px] truncate" title={clar.response || 'Resolved'}>
                          {clar.response || 'Resolution verified and query closed.'}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{clar.closedBy || 'Sample Cell Officer'}</td>
                        <td className="p-3 text-slate-600">{clar.responseDate || clar.dateRaised}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                            CLOSED
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRowClick(clar)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 py-1 rounded font-bold text-[11px] cursor-pointer inline-flex"
                          >
                            View Record
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 font-mono font-bold text-slate-900">#{clar.id}</td>
                        <td className="p-3 font-mono font-bold text-indigo-700">{clar.sampleId}</td>
                        <td className="p-3 font-semibold text-slate-900 max-w-[200px] truncate" title={clar.subject}>{clar.subject}</td>
                        <td className="p-3 font-semibold text-slate-800">{clar.assignedEngineer || selectedEngineer}</td>
                        <td className="p-3 text-slate-600">{clar.dateRaised || clar.dateReceived}</td>
                        <td className="p-3 text-center font-bold text-amber-800">
                          <span className="bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                            {calculateDaysOpen(clar.dateRaised)}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${clar.status === 'Open' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}`}>
                            {clar.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRowClick(clar)}
                            className="bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 px-2.5 py-1 rounded font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer inline-flex"
                          >
                            <MessageSquare size={11} />
                            <span>Resolve / Close</span>
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER MODALS */}
      <ClarificationModal
        isOpen={isModalOpen}
        clarification={selectedClar}
        mode="respond"
        onClose={() => { setIsModalOpen(false); setSelectedClar(null); }}
      />

      <ClarificationModal
        isOpen={isRaiseOpen}
        sample={samples[0] || null}
        mode="raise"
        onClose={() => setIsRaiseOpen(false)}
      />

    </div>
  );
}
