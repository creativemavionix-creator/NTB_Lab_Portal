import React, { useState } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function ReportsView({ subView }) {
  const { samples, engineers, oics, selectedRole, selectedEngineer } = useWorkflow();

  const activeSubViewName = subView || (selectedRole === 'Technical Engineer' ? 'Testing Person Report' : 'Testing Section Report');

  // Filters State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [testTypeFilter, setTestTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEngSelection, setActiveEngSelection] = useState(selectedEngineer);

  // 1. Compile Section Report Data
  const getSectionReport = () => {
    const departments = ['Mechanical', 'Chemical', 'Electrical', 'Electronics', 'Biological'];
    
    return departments.map(dept => {
      const deptSamples = samples.filter(s => s.testingSection === dept);

      const pr = (fn) => deptSamples.filter(s => s.priority === 'High' && fn(s)).length;
      const npr = (fn) => deptSamples.filter(s => s.priority !== 'High' && fn(s)).length;

      return {
        department: dept,
        carriedOverPr: 0,
        carriedOverNpr: 0,
        receivedPr: pr(s => (!fromDate || s.dateReceived >= fromDate) && (!toDate || s.dateReceived <= toDate)),
        receivedNpr: npr(s => (!fromDate || s.dateReceived >= fromDate) && (!toDate || s.dateReceived <= toDate)),
        notStartedPr: pr(s => s.status === 'Samples Allocated'),
        notStartedNpr: npr(s => s.status === 'Samples Allocated'),
        startedPr: pr(s => s.status === 'Testing In Progress'),
        startedNpr: npr(s => s.status === 'Testing In Progress'),
        clarifyPr: pr(s => s.status === 'Pending Amendment Requests'),
        clarifyNpr: npr(s => s.status === 'Pending Amendment Requests'),
        finalizedPr: pr(s => ['Final Reports Pending', 'Sent to Sample Cell', 'Testing Completed'].includes(s.status)),
        finalizedNpr: npr(s => ['Final Reports Pending', 'Sent to Sample Cell', 'Testing Completed'].includes(s.status)),
      };
    });
  };

  // 2. Compile OIC Report Data
  const getOicReport = () => {
    return oics.map(oic => {
      const oicSamples = samples.filter(s => s.testingSection === oic.section);
      
      const pr = (fn) => oicSamples.filter(s => s.priority === 'High' && fn(s)).length;
      const npr = (fn) => oicSamples.filter(s => s.priority !== 'High' && fn(s)).length;

      return {
        oicName: oic.name,
        department: oic.section,
        carriedOverPr: 0,
        carriedOverNpr: 0,
        receivedPr: pr(s => (!fromDate || s.dateReceived >= fromDate) && (!toDate || s.dateReceived <= toDate)),
        receivedNpr: npr(s => (!fromDate || s.dateReceived >= fromDate) && (!toDate || s.dateReceived <= toDate)),
        notStartedPr: pr(s => s.status === 'Samples Allocated'),
        notStartedNpr: npr(s => s.status === 'Samples Allocated'),
        startedPr: pr(s => s.status === 'Testing In Progress'),
        startedNpr: npr(s => s.status === 'Testing In Progress'),
        finalizedPr: pr(s => ['Final Reports Pending', 'Sent to Sample Cell', 'Testing Completed'].includes(s.status)),
        finalizedNpr: npr(s => ['Final Reports Pending', 'Sent to Sample Cell', 'Testing Completed'].includes(s.status)),
      };
    });
  };

  // 3. Compile Testing Person Report Data (Data Scoped per Engineer)
  const targetEngName = selectedRole === 'Technical Engineer' ? selectedEngineer : activeEngSelection;
  const engSamples = samples.filter(s => s.assignedEngineer === targetEngName);

  // Filtered Test Records
  const getFilteredPersonRecords = () => {
    let list = [...engSamples];
    if (fromDate) list = list.filter(s => s.dateReceived >= fromDate);
    if (toDate) list = list.filter(s => s.dateReceived <= toDate);
    if (testTypeFilter) list = list.filter(s => (s.standard || '').toLowerCase().includes(testTypeFilter.toLowerCase()) || (s.testType || '').toLowerCase().includes(testTypeFilter.toLowerCase()));
    if (statusFilter) list = list.filter(s => (s.status || '').toLowerCase().includes(statusFilter.toLowerCase()));
    if (searchQuery) list = list.filter(s => s.id.toLowerCase().includes(searchQuery.toLowerCase()) || s.product.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  };

  const filteredPersonRecords = getFilteredPersonRecords();

  // Summary Metrics
  const metrics = {
    totalReceived: engSamples.length,
    pending: engSamples.filter(s => s.status === 'Samples Allocated' || s.status === 'New Sample Received' || s.status === 'Pending' || s.status === 'Accepted').length,
    underTesting: engSamples.filter(s => s.status === 'Testing In Progress').length,
    testingCompleted: engSamples.filter(s => ['Test Results Pending Verification', 'Reports Pending', 'Amended Reports Pending', 'Final Reports Pending', 'Sent to Sample Cell', 'Testing Completed'].includes(s.status)).length,
    resultsSubmitted: engSamples.filter(s => ['Test Results Pending Verification', 'Reports Pending', 'Final Reports Pending', 'Sent to Sample Cell'].includes(s.status) || s.testResults).length,
    reportsIssued: engSamples.filter(s => s.status === 'Sent to Sample Cell' || s.verificationStatus === 'Verified').length
  };

  const sectionData = getSectionReport();
  const oicData = getOicReport();

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 pb-20 bg-[#edf3f9] text-slate-800 min-h-full font-sans text-xs">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2 min-w-0">
        <h2 className="text-sm font-extrabold text-[#1e3a8a] uppercase tracking-tight truncate min-w-0 flex-1">
          {activeSubViewName === 'Testing Section Report' && 'REPORT BY TESTING SECTION - NATIONAL TESTING BUREAU'}
          {activeSubViewName === 'OIC Testing Report' && 'REPORT BY OIC TESTING - NATIONAL TESTING BUREAU'}
          {activeSubViewName === 'Testing Person Report' && `SYSTEM REPORT - TESTING PERSON PERFORMANCE (${targetEngName})`}
        </h2>
        
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {selectedRole !== 'Technical Engineer' && activeSubViewName === 'Testing Person Report' && (
            <select
              value={activeEngSelection}
              onChange={(e) => setActiveEngSelection(e.target.value)}
              className="border border-slate-300 rounded p-1 bg-white text-xs font-bold text-slate-800 shrink-0 max-w-[200px] truncate"
            >
              {engineers.map(e => (
                <option key={e.id} value={e.name}>{e.name} ({e.section})</option>
              ))}
            </select>
          )}
          <span 
            className="text-[11px] text-slate-500 font-semibold cursor-pointer hover:underline shrink-0" 
            onClick={() => { setFromDate(''); setToDate(''); setTestTypeFilter(''); setStatusFilter(''); setSearchQuery(''); }}
          >
            Reset Filters
          </span>
        </div>
      </div>

      {/* TESTING PERSON REPORT SUMMARY METRICS CARDS */}
      {activeSubViewName === 'Testing Person Report' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Received</span>
            <span className="text-lg font-extrabold text-slate-900 mt-1 block">{metrics.totalReceived}</span>
            <span className="text-[9px] text-slate-400 font-semibold">Allocated Jobs</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
            <span className="text-[10px] text-amber-700 font-bold uppercase block">Pending Samples</span>
            <span className="text-lg font-extrabold text-amber-900 mt-1 block">{metrics.pending}</span>
            <span className="text-[9px] text-amber-600 font-semibold">Queued in Lab</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
            <span className="text-[10px] text-indigo-700 font-bold uppercase block">Under Testing</span>
            <span className="text-lg font-extrabold text-indigo-900 mt-1 block">{metrics.underTesting}</span>
            <span className="text-[9px] text-indigo-600 font-semibold">Active In Progress</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">Testing Completed</span>
            <span className="text-lg font-extrabold text-emerald-900 mt-1 block">{metrics.testingCompleted}</span>
            <span className="text-[9px] text-emerald-600 font-semibold">Tests Executed</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
            <span className="text-[10px] text-cyan-700 font-bold uppercase block">Results Submitted</span>
            <span className="text-lg font-extrabold text-cyan-900 mt-1 block">{metrics.resultsSubmitted}</span>
            <span className="text-[9px] text-cyan-600 font-semibold">Sent to Manager</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
            <span className="text-[10px] text-blue-700 font-bold uppercase block">Reports Issued</span>
            <span className="text-lg font-extrabold text-blue-900 mt-1 block">{metrics.reportsIssued}</span>
            <span className="text-[9px] text-blue-600 font-semibold">Verified Certificates</span>
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded p-3 flex flex-col md:flex-row items-end gap-3 text-xs font-semibold shadow-2xs">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full">
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-1">Search Sample / Product</label>
            <input
              type="text"
              placeholder="Search Code or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-1">Received From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-1">Received To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 font-bold mb-1">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-800 rounded p-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Allocated">Allocated</option>
              <option value="Testing In Progress">Testing In Progress</option>
              <option value="Verification">Pending Verification</option>
              <option value="Completed">Testing Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* TESTING PERSON REPORT RECORDS TABLE */}
      {activeSubViewName === 'Testing Person Report' && (
        <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1e3a8a] text-white uppercase text-[9px] font-bold border-b border-slate-800 select-none">
                  <th className="p-3">Sample ID</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Test Type / Standard</th>
                  <th className="p-3">Date Received</th>
                  <th className="p-3">Test Start Date</th>
                  <th className="p-3">Completion Date</th>
                  <th className="p-3">Test Result Findings</th>
                  <th className="p-3">Verification Status</th>
                  <th className="p-3">Report Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
                {filteredPersonRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-400 font-semibold italic">
                      No matching testing records found for {targetEngName}.
                    </td>
                  </tr>
                ) : (
                  filteredPersonRecords.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">{s.id}</td>
                      <td className="p-3 font-semibold text-slate-900">
                        <div>{s.product}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{s.applicant}</div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{s.standard} ({s.testType || 'All'})</td>
                      <td className="p-3 text-slate-600 font-medium">{s.dateReceived}</td>
                      <td className="p-3 text-slate-600 font-medium">{s.testStartDate || s.allocationDate || '-'}</td>
                      <td className="p-3 text-slate-600 font-medium">{s.testDate || '-'}</td>
                      <td className="p-3 text-slate-800 font-semibold max-w-[200px] truncate" title={s.testResults || 'Pending'}>
                        {s.testResults || <span className="text-slate-400 font-normal italic">In Progress</span>}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          s.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          s.verificationStatus === 'Returned for Correction' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                          'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {s.verificationStatus || 'Pending Verification'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          s.status === 'Sent to Sample Cell' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          s.status.includes('Reports') ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' :
                          'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION & OIC REPORTS FOR MANAGEMENT ROLES */}
      {activeSubViewName === 'Testing Section Report' && (
        <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden text-center text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#1e3a8a] text-white uppercase text-[9px] font-bold border-b border-slate-800 select-none">
                  <th className="p-3 text-left border-r border-slate-700 min-w-36" rowSpan={2}>DEPARTMENT</th>
                  <th className="p-1.5 border-b border-r border-slate-700" colSpan={2}>CARRIED OVER</th>
                  <th className="p-1.5 border-b border-r border-slate-700" colSpan={2}>RECEIVED</th>
                  <th className="p-1.5 border-b border-r border-slate-700" colSpan={2}>TESTING NOT STARTED</th>
                  <th className="p-1.5 border-b border-r border-slate-700" colSpan={2}>TESTING STARTED</th>
                  <th className="p-1.5 border-b border-r border-slate-700" colSpan={2}>CLARIFICATION PENDING</th>
                  <th className="p-1.5 border-b border-slate-700" colSpan={2}>TR FINALIZED</th>
                </tr>
                <tr className="bg-[#1e3a8a] text-white text-[8px] font-bold border-b border-slate-700 select-none">
                  <th className="p-1 border-r border-slate-700">PR</th>
                  <th className="p-1 border-r border-slate-700">NPR</th>
                  <th className="p-1 border-r border-slate-700">PR</th>
                  <th className="p-1 border-r border-slate-700">NPR</th>
                  <th className="p-1 border-r border-slate-700">PR</th>
                  <th className="p-1 border-r border-slate-700">NPR</th>
                  <th className="p-1 border-r border-slate-700">PR</th>
                  <th className="p-1 border-r border-slate-700">NPR</th>
                  <th className="p-1 border-r border-slate-700">PR</th>
                  <th className="p-1 border-r border-slate-700">NPR</th>
                  <th className="p-1 border-r border-slate-700">PR</th>
                  <th className="p-1">NPR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
                {sectionData.map((row) => (
                  <tr key={row.department} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-left border-r border-slate-200 font-semibold text-slate-900">{row.department}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.carriedOverPr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.carriedOverNpr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.receivedPr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.receivedNpr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.notStartedPr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.notStartedNpr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.startedPr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.startedNpr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.clarifyPr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.clarifyNpr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.finalizedPr}</td>
                    <td className="p-3 text-blue-600 font-semibold">{row.finalizedNpr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubViewName === 'OIC Testing Report' && (
        <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden text-center text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[#1e3a8a] text-white uppercase text-[9px] font-bold border-b border-slate-800 select-none">
                  <th className="p-3 text-left border-r border-slate-700 min-w-32" rowSpan={2}>TESTING PERSON</th>
                  <th className="p-3 text-left border-r border-slate-700 min-w-32" rowSpan={2}>DEPARTMENT</th>
                  <th className="p-1.5 border-b border-r border-slate-700" colSpan={2}>CARRIED OVER</th>
                  <th className="p-1.5 border-b border-r border-slate-700" colSpan={2}>RECEIVED</th>
                  <th className="p-1.5 border-b border-r border-slate-700" colSpan={2}>TESTING NOT STARTED</th>
                  <th className="p-1.5 border-b border-r border-slate-700" colSpan={2}>TESTING IN PROGRESS</th>
                  <th className="p-1.5 border-b border-r border-slate-700" colSpan={2}>TR FINALIZED</th>
                  <th className="p-1.5 border-b border-slate-700" colSpan={2}>TR FINALIZED - IN TOTAL</th>
                </tr>
                <tr className="bg-[#1e3a8a] text-white text-[8px] font-bold border-b border-slate-700 select-none">
                  <th className="p-1 border-r border-slate-700">PR</th>
                  <th className="p-1 border-r border-slate-700">NPR</th>
                  <th className="p-1 border-r border-slate-700">PR</th>
                  <th className="p-1 border-r border-slate-700">NPR</th>
                  <th className="p-1 border-r border-slate-700">PR</th>
                  <th className="p-1 border-r border-slate-700">NPR</th>
                  <th className="p-1 border-r border-slate-700">PR</th>
                  <th className="p-1 border-r border-slate-700">NPR</th>
                  <th className="p-1 border-r border-slate-700">PR</th>
                  <th className="p-1 border-r border-slate-700">NPR</th>
                  <th className="p-1 border-r border-slate-700">PR</th>
                  <th className="p-1">NPR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
                {oicData.map((row) => (
                  <tr key={row.oicName} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-left border-r border-slate-200 font-semibold text-slate-900">{row.oicName}</td>
                    <td className="p-3 text-left border-r border-slate-200 text-slate-600 font-semibold">{row.department}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.carriedOverPr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.carriedOverNpr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.receivedPr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.receivedNpr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.notStartedPr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.notStartedNpr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.startedPr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.startedNpr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.finalizedPr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.finalizedNpr}</td>
                    <td className="p-3 border-r border-slate-200 text-blue-600 font-semibold">{row.finalizedPr}</td>
                    <td className="p-3 text-blue-600 font-semibold">{row.finalizedNpr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
