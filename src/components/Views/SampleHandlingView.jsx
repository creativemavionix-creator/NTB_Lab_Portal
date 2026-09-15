import React, { useState } from 'react';
import { 
  Filter, 
  Download, 
  PlusCircle, 
  Send,
  HelpCircle,
  Clock,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  FileCheck,
  UserCheck,
  Eye,
  FileText,
  Play,
  ClipboardCheck
} from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import EmptyState from '../EmptyState';
import AllocateModal from '../Modals/AllocateModal';
import ClarificationModal from '../Modals/ClarificationModal';
import TestResultsModal from '../Modals/TestResultsModal';
import ReportPrepareModal from '../Modals/ReportPrepareModal';
import ViewDetailsModal from '../Modals/ViewDetailsModal';
import LifecycleTimelineModal from '../Modals/LifecycleTimelineModal';
import VerifyTestResultsModal from '../Modals/VerifyTestResultsModal';
import AmendedReportReviewModal from '../Modals/AmendedReportReviewModal';
import ViewSubmittedReportModal from '../Modals/ViewSubmittedReportModal';
import CreateSampleView from '../SampleCell/CreateSampleView';

export default function SampleHandlingView({ subView }) {
  const { 
    samples, 
    clarifications, 
    selectedRole, 
    selectedEngineer, 
    engineers,
    sampleRequests,
    addSample, 
    acceptSample,
    startTesting,
    sendReportToSampleCell,
    triggerNotification 
  } = useWorkflow();

  const activeSubViewName = subView || (selectedRole === 'Technical Engineer' ? 'Sample Receipt' : selectedRole === 'Sample Cell' ? 'Accept' : 'New Sample Received');

  // Search & Filter State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchIsNumber, setSearchIsNumber] = useState('');
  const [sectionFilter, setSectionFilter] = useState('All');

  // Determine active engineer's section (e.g., Mechanical, Chemical, Electrical, etc.)
  const activeEngineerObj = engineers?.find(e => e.name === selectedEngineer);
  const activeSection = activeEngineerObj ? activeEngineerObj.section : 'Mechanical';

  // Modals state
  const [activeSample, setActiveSample] = useState(null);
  const [activeClarification, setActiveClarification] = useState(null);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isClarifyOpen, setIsClarifyOpen] = useState(false);
  const [clarifyMode, setClarifyMode] = useState('raise');
  const [isTestSubmitOpen, setIsTestSubmitOpen] = useState(false);
  const [isReportPrepareOpen, setIsReportPrepareOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isAmendedReviewModalOpen, setIsAmendedReviewModalOpen] = useState(false);
  const [isSubmittedReportModalOpen, setIsSubmittedReportModalOpen] = useState(false);

  // Calculate Days Pending helper
  const calculateDaysPending = (dateReceived) => {
    if (!dateReceived) return '1 day';
    const start = new Date(dateReceived);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  };

  // Filtering samples based on Sub-View & Data Scoping Guardrails
  const getFilteredSamples = () => {
    let list = [...samples];

    // DATA SCOPING GUARDRAILS:
    if (selectedRole === 'Technical Engineer') {
      list = list.filter(s => s.testingSection === activeSection || s.assignedEngineer === selectedEngineer);
    } else if (selectedRole === 'Technical Manager') {
      if (sectionFilter !== 'All') {
        list = list.filter(s => s.testingSection === sectionFilter);
      }
    }

    switch (activeSubViewName) {
      // SAMPLE CELL SPECIFIC SUBVIEWS (Exact Specs)
      case 'Accept':
        list = list.filter(s => s.status === 'AWAITING_ACCEPTANCE' || s.status === 'New Sample Received' || s.status === 'Accept');
        break;
      case 'Forward':
        list = list.filter(s => s.status === 'ACCEPTED_PENDING_FORWARD' || s.status === 'Pending Forwarding' || s.status === 'Forward' || s.status === 'Samples Allocated' || s.status === 'New Sample Received');
        break;
      case 'Pending Test Reports':
        list = list.filter(s => ['FORWARDED_TO_TM', 'ALLOCATED', 'TESTING_IN_PROGRESS', 'TEST_COMPLETED_VERIFYING', 'REPORT_PENDING', 'Reports Pending', 'Pending Test Reports', 'Testing In Progress', 'Samples Allocated'].includes(s.status));
        break;
      case 'Pending Amended Test Reports':
        list = list.filter(s => ['AMENDMENT_REQUESTED', 'Amended Reports Pending', 'Pending Amended Test Reports'].includes(s.status) || s.type === 'Amended Report');
        break;
      case 'Final Reports':
      case 'Final Reports & Auto-Sync Connection':
        list = list.filter(s => ['REPORT_APPROVED_AND_RECEIVED', 'FINAL_RECEIVED', 'Sent to Sample Cell', 'Testing Completed', 'Final Reports'].includes(s.status) || s.verificationStatus === 'Verified');
        break;
      case 'Disputed':
        list = list.filter(s => s.is_disputed === true || s.isDisputed === true || s.status === 'Disputed');
        break;
      case 'Return Requests':
        list = (sampleRequests || []).filter(r => r.type === 'RETURN').map(r => {
          const matchingSample = samples.find(s => s.id === r.sampleId);
          return {
            id: r.id,
            sampleId: r.sampleId,
            product: r.product || matchingSample?.product || 'Sample',
            requestDate: r.requestDate,
            reason: r.reason,
            status: r.status,
            requestedBy: r.requestedBy,
            sample: matchingSample
          };
        });
        if (list.length === 0) {
          list = samples.filter(s => s.status === 'Return Requests').map(s => ({
            id: `REQ-RET-${s.id}`,
            sampleId: s.id,
            product: s.product,
            requestDate: s.dateReceived,
            reason: s.returnReason || 'Sample return requested by applicant',
            status: 'PENDING',
            sample: s
          }));
        }
        break;
      case 'Discard Requests':
        list = (sampleRequests || []).filter(r => r.type === 'DISCARD').map(r => {
          const matchingSample = samples.find(s => s.id === r.sampleId);
          return {
            id: r.id,
            sampleId: r.sampleId,
            product: r.product || matchingSample?.product || 'Sample',
            requestDate: r.requestDate,
            reason: r.reason,
            status: r.status,
            requestedBy: r.requestedBy,
            sample: matchingSample
          };
        });
        if (list.length === 0) {
          list = samples.filter(s => s.status === 'Discard Requests').map(s => ({
            id: `REQ-DISC-${s.id}`,
            sampleId: s.id,
            product: s.product,
            requestDate: s.dateReceived,
            reason: s.discardReason || 'Sample remnant discard requested',
            status: 'PENDING',
            sample: s
          }));
        }
        break;
      case 'Withdrawn Samples':
        list = list.filter(s => s.status === 'WITHDRAWN' || s.status === 'Withdrawn Samples');
        break;

      // TECHNICAL ENGINEER SUBVIEWS
      case 'Sample Receipt':
        list = list.filter(s => 
          ['Samples Allocated', 'Allocated'].includes(s.status) &&
          (s.assignedEngineer === selectedEngineer || (!s.assignedEngineer && s.testingSection === activeSection))
        );
        break;
      case 'Pending Samples':
        list = list.filter(s => 
          ['Accepted', 'Pending', 'Testing In Progress'].includes(s.status) &&
          (s.assignedEngineer === selectedEngineer || s.testingSection === activeSection)
        );
        break;
      case 'Issued Test Report':
        list = list.filter(s => 
          (['Test Results Pending Verification', 'Reports Pending', 'Amended Reports Pending', 'Final Reports Pending', 'Sent to Sample Cell', 'Testing Completed'].includes(s.status) || s.verificationStatus === 'Verified') &&
          (s.assignedEngineer === selectedEngineer || s.testingSection === activeSection)
        );
        break;

      // TECHNICAL MANAGER & OTHER SUBVIEWS
      case 'New Sample Received':
        list = list.filter(s => s.status === 'New Sample Received' && (s.type === 'New' || !s.type));
        break;
      case 'Supplementary Sample Received':
        list = list.filter(s => s.status === 'Supplementary Sample Received' || s.type === 'Supplementary');
        break;
      case 'Amended Sample Received':
        list = list.filter(s => s.status === 'Amended Sample Received' || s.type === 'Amended');
        break;
      case 'Pending Amendment Requests':
        list = list.filter(s => s.status === 'Pending Amendment Requests' || s.type === 'Amendment Request');
        break;
      case 'Samples Allocated / Pending View':
      case 'Samples Allocated / Pending':
        list = list.filter(s => 
          ['Samples Allocated', 'Allocated', 'Accepted', 'Pending', 'Testing In Progress'].includes(s.status)
        );
        break;
      case 'Verify Test Results':
        list = list.filter(s => s.status === 'Test Results Pending Verification');
        break;
      case 'Reports Pending':
        list = list.filter(s => s.status === 'Reports Pending');
        break;
      case 'Amended Reports Pending':
        list = list.filter(s => s.status === 'Amended Reports Pending' || s.type === 'Amended Report');
        break;
      default:
        break;
    }

    if (fromDate) list = list.filter(s => (s.dateReceived || s.requestDate) >= fromDate);
    if (toDate) list = list.filter(s => (s.dateReceived || s.requestDate) <= toDate);
    if (searchIsNumber) list = list.filter(s => (s.standard || '').toLowerCase().includes(searchIsNumber.toLowerCase()) || (s.id || '').toLowerCase().includes(searchIsNumber.toLowerCase()) || (s.sampleId || '').toLowerCase().includes(searchIsNumber.toLowerCase()));

    return list;
  };

  const filteredList = getFilteredSamples();

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setSearchIsNumber('');
  };

  const handleExportCSV = () => {
    if (filteredList.length === 0) return triggerNotification('No records available to export.', 'warning');

    const headers = ['ID', 'Product', 'Applicant', 'Standard', 'Quantity', 'Priority', 'Status', 'Assigned Engineer', 'Received Date'];
    const rows = filteredList.map(s => [
      s.id,
      `"${s.product}"`,
      `"${s.applicant}"`,
      `"${s.standard}"`,
      s.quantity,
      s.priority,
      `"${s.status}"`,
      `"${s.assignedEngineer || 'Unallocated'}"`,
      s.dateReceived
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NTB_${activeSubViewName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerNotification('CSV export downloaded successfully', 'success');
  };

  const handleSampleSubmit = (e) => {
    e.preventDefault();
    if (!product || !applicant || !requiredTests) return triggerNotification('Please fill in Product Name, Applicant Name, and Required Tests.', 'warning');
    
    addSample({
      product,
      applicant,
      sampleType,
      quantity,
      standard,
      requiredTests,
      remarks,
      priority,
      type: 'New'
    });

    setProduct('');
    setApplicant('');
    setSampleType('');
    setQuantity('1.00');
    setRequiredTests('');
    setRemarks('');
  };

  const handleActionClick = (sample, actionType) => {
    setActiveSample(sample);
    if (actionType === 'allocate' || actionType === 'reallocate') {
      setIsAllocateOpen(true);
    } else if (actionType === 'view') {
      setIsDetailsOpen(true);
    } else if (actionType === 'timeline') {
      setIsTimelineOpen(true);
    } else if (actionType === 'clarify') {
      setClarifyMode('raise');
      setIsClarifyOpen(true);
    } else if (actionType === 'submit_results') {
      setIsTestSubmitOpen(true);
    } else if (actionType === 'prepare_report') {
      setIsReportPrepareOpen(true);
    } else if (actionType === 'verify') {
      setIsVerifyModalOpen(true);
    } else if (actionType === 'review_amended') {
      setIsAmendedReviewModalOpen(true);
    } else if (actionType === 'view_submitted_report') {
      setIsSubmittedReportModalOpen(true);
    } else if (actionType === 'send_to_sample_cell') {
      sendReportToSampleCell(sample.id);
    } else if (actionType === 'accept') {
      acceptSample(sample.id);
    } else if (actionType === 'start_testing') {
      startTesting(sample.id);
    }
  };

  const handleClarificationChat = (sample) => {
    const relatedClar = clarifications.find(c => c.sampleId === sample.id);
    if (relatedClar) {
      setActiveClarification(relatedClar);
      setClarifyMode('respond');
      setIsClarifyOpen(true);
    } else {
      setActiveSample(sample);
      setClarifyMode('raise');
      setIsClarifyOpen(true);
    }
  };

  // Lifecycle stage helper for Samples Allocated / Pending View
  const renderLifecycleStatus = (sample) => {
    const status = sample.status || '';
    let stage = 1; // Pending Allocation
    if (sample.assignedEngineer) stage = 2; // Allocated
    if (status === 'Testing In Progress') stage = 3; // Testing In Progress
    if (['Test Results Pending Verification', 'Reports Pending', 'Amended Reports Pending', 'Final Reports Pending', 'Sent to Sample Cell', 'Testing Completed'].includes(status) || sample.verificationStatus === 'Verified') {
      stage = 4; // Testing Completed
    }

    return (
      <div className="flex flex-col gap-1 text-[10px]">
        <div className="flex items-center gap-1 font-bold text-slate-800">
          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-extrabold ${
            stage === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
            stage === 2 ? 'bg-blue-100 text-blue-900 border border-blue-300' :
            stage === 3 ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' :
            'bg-emerald-100 text-emerald-900 border border-emerald-300'
          }`}>
            {stage === 1 && 'Pending Allocation'}
            {stage === 2 && 'Allocated'}
            {stage === 3 && 'Testing In Progress'}
            {stage === 4 && 'Testing Completed'}
          </span>
        </div>
        <div className="flex items-center gap-0.5 text-[8px] font-bold text-slate-400 select-none">
          <span className={stage >= 1 ? 'text-amber-600 font-extrabold' : ''}>Pending</span>
          <span>→</span>
          <span className={stage >= 2 ? 'text-blue-600 font-extrabold' : ''}>Allocated</span>
          <span>→</span>
          <span className={stage >= 3 ? 'text-indigo-600 font-extrabold' : ''}>Testing</span>
          <span>→</span>
          <span className={stage >= 4 ? 'text-emerald-600 font-extrabold' : ''}>Completed</span>
        </div>
      </div>
    );
  };

  if (activeSubViewName === 'Create Sample') {
    return <CreateSampleView />;
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 pb-20 bg-[#edf3f9] text-slate-800 min-h-full font-sans">
      
      {/* View Title Bar */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <div className="flex items-center gap-3">
          <h2 className="text-sm md:text-base font-extrabold text-[#1e3a8a] uppercase tracking-tight">
            {activeSubViewName.toUpperCase()}
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-slate-600 font-semibold">
            <span className="flex items-center gap-1">
              <Filter size={13} className="text-indigo-600" />
              Filter
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="cursor-pointer hover:text-indigo-600 text-slate-500 font-bold focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
              aria-label="Reset search filters"
            >
              Reset
            </button>
            <span className="text-slate-400">|</span>
            <span className="text-slate-700 font-bold">{filteredList.length} Results</span>
            {selectedRole === 'Technical Manager' && (
              <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded px-2 py-0.5 shadow-2xs">
                <span className="text-slate-600 font-bold text-[10px]">Filter Section:</span>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="bg-transparent text-[11px] text-slate-900 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="All">All Sections</option>
                  <option value="Mechanical">Mechanical Section</option>
                  <option value="Chemical">Chemical Section</option>
                  <option value="Electrical">Electrical Section</option>
                  <option value="Electronics">Electronics Section</option>
                  <option value="Biological">Biological Section</option>
                </select>
              </div>
            )}
            {selectedRole === 'Technical Engineer' && (
              <span className="text-xs bg-slate-200 border border-slate-300 px-2.5 py-1 rounded text-slate-800 font-bold">
                Filtered for: {selectedEngineer} ({activeEngineerObj?.id || 'ENG-101'}) - {activeSection} Laboratory
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded shadow-2xs transition-colors"
          >
            <FileSpreadsheet size={13} />
            <span>CSV Export</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-1 text-slate-500 hover:text-slate-900"
            title="Print View"
          >
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/* SAMPLE CELL INWARD FORM SIMULATOR */}
      {selectedRole === 'Sample Cell' && (activeSubViewName.includes('Received') || activeSubViewName.includes('Allocated')) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3 text-xs">
          <h3 className="text-xs font-bold text-amber-900 tracking-wider uppercase flex items-center gap-2">
            <PlusCircle size={15} />
            [Sample Cell Role Workstation] Inward New Test Sample to Technical Manager
          </h3>
          <form onSubmit={handleSampleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-medium">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Product/Sample Name</label>
              <input 
                type="text" 
                placeholder="e.g. Domestic Gas Stove"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Applicant / Manufacturer</label>
              <input 
                type="text" 
                placeholder="e.g. Apex Appliances Ltd."
                value={applicant}
                onChange={(e) => setApplicant(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Standard Reference</label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 text-xs font-semibold"
              >
                <option value="IS 4246 (2025)">IS 4246 (2025)</option>
                <option value="IS 2347 (2023)">IS 2347 (2023)</option>
                <option value="IS 3025 (2021)">IS 3025 (2021)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Quantity Received</label>
              <input 
                type="text" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 text-xs font-semibold"
                required
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Required Testing Clauses</label>
              <input 
                type="text" 
                placeholder="e.g. Thermal efficiency & gas leakage test"
                value={requiredTests}
                onChange={(e) => setRequiredTests(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 text-xs font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-slate-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white text-slate-800 text-xs font-semibold"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="flex items-end justify-end">
              <button
                type="submit"
                className="w-full px-4 py-1.5 bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 font-bold rounded flex items-center justify-center gap-1 shadow-2xs text-xs cursor-pointer"
              >
                <Send size={13} />
                Send to TM
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SAMPLES DATA TABLE */}
      {filteredList.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
          
          {/* Mobile Stacked Card View (< 640px) */}
          <div className="block sm:hidden space-y-3 p-3 bg-slate-50 divide-y divide-slate-200">
            {filteredList.map((sample) => (
              <div key={sample.id} className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-2 text-xs pt-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-mono font-bold text-indigo-900 text-xs">{sample.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    sample.status.includes('Completed') || sample.status.includes('Sent') ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    sample.status.includes('Verification') || sample.status.includes('Allocated') ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {sample.status}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-xs">{sample.product}</div>
                  <div className="text-slate-500 text-[10px]">{sample.applicant}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                  <div>
                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Standard / Spec</span>
                    <span className="font-semibold text-slate-800">{sample.standard || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Assigned Engineer</span>
                    <span className="font-bold text-indigo-700">{sample.assignedEngineer || 'Unallocated'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Received Date</span>
                    <span className="font-medium text-slate-700">{sample.dateReceived}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[8px] uppercase">Priority / Pending</span>
                    <span className="font-bold text-amber-900">{calculateDaysPending(sample.dateReceived)}</span>
                  </div>
                </div>

                {/* Mobile Card Action Buttons */}
                <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-2 mt-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleActionClick(sample, 'view')}
                      className="px-2 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-bold text-[10px] flex items-center gap-1"
                    >
                      <Eye size={12} /> View
                    </button>
                    <button
                      onClick={() => handleClarificationChat(sample)}
                      className="px-2 py-1 bg-amber-50 text-amber-800 rounded hover:bg-amber-100 font-bold text-[10px] flex items-center gap-1"
                    >
                      <HelpCircle size={12} /> Clarification
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Technical Engineer Actions */}
                    {selectedRole === 'Technical Engineer' && (
                      <>
                        {activeSubViewName === 'Sample Receipt' && (
                          <button
                            onClick={() => handleActionClick(sample, 'accept')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px] flex items-center gap-1 shadow-2xs"
                          >
                            <CheckCircle size={11} /> Accept Sample
                          </button>
                        )}

                        {(activeSubViewName === 'Sample Receipt' || activeSubViewName === 'Pending Samples') && sample.status !== 'Testing In Progress' && (
                          <button
                            onClick={() => handleActionClick(sample, 'start_testing')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2 py-1 rounded text-[10px] flex items-center gap-1 shadow-2xs"
                          >
                            <Play size={11} /> Start Testing
                          </button>
                        )}

                        {activeSubViewName === 'Pending Samples' && (
                          <button
                            onClick={() => handleActionClick(sample, 'submit_results')}
                            className="bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold px-2 py-1 rounded text-[10px] flex items-center gap-1 shadow-2xs"
                          >
                            <ClipboardCheck size={11} /> Submit Results
                          </button>
                        )}

                        {activeSubViewName === 'Issued Test Report' && (
                          <button
                            onClick={() => handleActionClick(sample, 'view_submitted_report')}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-2 py-1 rounded text-[10px] flex items-center gap-1 shadow-2xs"
                          >
                            <FileText size={11} /> View Report
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              
              {/* Table Header */}
              <thead>
                <tr className="bg-[#1e3a8a] text-white uppercase tracking-wider font-bold text-[10px] select-none border-b border-slate-800">
                  {/* TECHNICAL ENGINEER SPECIFIC TABLE HEADERS */}
                  {selectedRole === 'Technical Engineer' && activeSubViewName === 'Sample Receipt' ? (
                    <>
                      <th className="p-3">Sample ID</th>
                      <th className="p-3">Product / Sample</th>
                      <th className="p-3">Sample Type</th>
                      <th className="p-3">Applicant</th>
                      <th className="p-3">Received Date</th>
                      <th className="p-3">Allocated Date</th>
                      <th className="p-3">Testing Section</th>
                      <th className="p-3">Required Test</th>
                      <th className="p-3">Standard Spec</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3">Due Date</th>
                    </>
                  ) : selectedRole === 'Technical Engineer' && activeSubViewName === 'Pending Samples' ? (
                    <>
                      <th className="p-3">Sample ID</th>
                      <th className="p-3">Product / Sample</th>
                      <th className="p-3">Test Request ID</th>
                      <th className="p-3">Required Test</th>
                      <th className="p-3">Standard Spec</th>
                      <th className="p-3">Received Date</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3 text-center">Days Pending</th>
                      <th className="p-3 text-center">Priority</th>
                    </>
                  ) : selectedRole === 'Technical Engineer' && activeSubViewName === 'Issued Test Report' ? (
                    <>
                      <th className="p-3">Sample ID</th>
                      <th className="p-3">Test Request ID</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Test Type</th>
                      <th className="p-3">Test Date</th>
                      <th className="p-3">Test Findings Result</th>
                      <th className="p-3">Technical Manager</th>
                      <th className="p-3">Verification Status</th>
                    </>
                  ) : activeSubViewName === 'Supplementary Sample Received' ? (
                    <>
                      <th className="p-3">Supp. Sample ID</th>
                      <th className="p-3">Main Sample ID</th>
                      <th className="p-3">Product / Applicant</th>
                      <th className="p-3">Received Date</th>
                      <th className="p-3">Reason / Clause</th>
                    </>
                  ) : activeSubViewName === 'Amended Sample Received' ? (
                    <>
                      <th className="p-3">Amended Sample ID</th>
                      <th className="p-3">Original Sample ID</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Amendment Reason</th>
                      <th className="p-3">Received Date</th>
                    </>
                  ) : activeSubViewName === 'Pending Amendment Requests' ? (
                    <>
                      <th className="p-3">Request ID</th>
                      <th className="p-3">Sample ID</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Retest Reason</th>
                      <th className="p-3">Requested By</th>
                      <th className="p-3">Request Date</th>
                    </>
                  ) : (
                    <>
                      <th className="p-3">Sample ID</th>
                      <th className="p-3">Product / Applicant</th>
                      <th className="p-3">Standard Spec</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-center">Priority</th>
                      <th className="p-3">Required Tests</th>
                      <th className="p-3">Received Date</th>
                    </>
                  )}

                  {selectedRole !== 'Technical Engineer' && (activeSubViewName.includes('Allocated') || activeSubViewName.includes('Pending View')) && (
                    <>
                      <th className="p-3">Assigned Engineer</th>
                      <th className="p-3">Lifecycle Progress</th>
                    </>
                  )}
                  {selectedRole !== 'Technical Engineer' && activeSubViewName === 'Verify Test Results' && (
                    <>
                      <th className="p-3">Tested By</th>
                      <th className="p-3">Test Findings</th>
                    </>
                  )}
                  {selectedRole !== 'Technical Engineer' && activeSubViewName === 'Reports Pending' && (
                    <>
                      <th className="p-3">Testing Section</th>
                      <th className="p-3">Assigned Eng.</th>
                    </>
                  )}
                  {selectedRole !== 'Technical Engineer' && activeSubViewName === 'Amended Reports Pending' && (
                    <>
                      <th className="p-3">Report Number</th>
                      <th className="p-3">Assigned Eng.</th>
                    </>
                  )}

                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Jobcard</th>
                  <th className="p-3 text-center">Clarify</th>
                  <th className="p-3 text-center">History</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              {/* Rows */}
              <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
                {filteredList.map((sample) => (
                  <tr key={sample.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* TECHNICAL ENGINEER SPECIFIC ROW METADATA */}
                    {selectedRole === 'Technical Engineer' && activeSubViewName === 'Sample Receipt' ? (
                      <>
                        <td className="p-3 font-mono font-bold text-slate-900">{sample.id}</td>
                        <td className="p-3 font-semibold text-slate-900">{sample.product}</td>
                        <td className="p-3 font-semibold text-slate-700">{sample.sampleType}</td>
                        <td className="p-3 text-slate-600 font-semibold">{sample.applicant}</td>
                        <td className="p-3 text-slate-600 font-medium">{sample.dateReceived}</td>
                        <td className="p-3 text-slate-600 font-medium">{sample.allocationDate || sample.dateReceived}</td>
                        <td className="p-3 font-semibold text-indigo-600">{sample.testingSection || 'Mechanical'}</td>
                        <td className="p-3 text-slate-700 max-w-[160px] truncate" title={sample.requiredTests}>{sample.requiredTests}</td>
                        <td className="p-3 font-semibold text-slate-800">{sample.standard}</td>
                        <td className="p-3 text-center font-bold">{sample.quantity || '1.00'}</td>
                        <td className="p-3 text-slate-600 font-semibold">{sample.dueDate || '2026-03-01'}</td>
                      </>
                    ) : selectedRole === 'Technical Engineer' && activeSubViewName === 'Pending Samples' ? (
                      <>
                        <td className="p-3 font-mono font-bold text-slate-900">{sample.id}</td>
                        <td className="p-3 font-semibold text-slate-900">
                          <div>{sample.product}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{sample.applicant}</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-indigo-700">{sample.testRequestId || `TR-${sample.id}`}</td>
                        <td className="p-3 text-slate-700 max-w-[180px] truncate" title={sample.requiredTests}>{sample.requiredTests}</td>
                        <td className="p-3 font-semibold text-slate-800">{sample.standard}</td>
                        <td className="p-3 text-slate-600 font-medium">{sample.dateReceived}</td>
                        <td className="p-3 text-slate-600 font-semibold">{sample.dueDate || '2026-03-01'}</td>
                        <td className="p-3 text-center font-bold text-amber-900">{calculateDaysPending(sample.dateReceived)}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            sample.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                            sample.priority === 'Medium' ? 'bg-amber-100 text-amber-900' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {sample.priority || 'Medium'}
                          </span>
                        </td>
                      </>
                    ) : selectedRole === 'Technical Engineer' && activeSubViewName === 'Issued Test Report' ? (
                      <>
                        <td className="p-3 font-mono font-bold text-slate-900">{sample.id}</td>
                        <td className="p-3 font-mono font-bold text-indigo-700">{sample.testRequestId || `TR-${sample.id}`}</td>
                        <td className="p-3 font-semibold text-slate-900">{sample.product}</td>
                        <td className="p-3 font-semibold text-slate-800">{sample.standard} ({sample.testType || 'All'})</td>
                        <td className="p-3 text-slate-600 font-medium">{sample.testDate || sample.dateReceived}</td>
                        <td className="p-3 text-emerald-800 font-semibold max-w-[180px] truncate" title={sample.testResults}>
                          {sample.testResults || 'Passed standard parameters'}
                        </td>
                        <td className="p-3 font-bold text-slate-800">{sample.reportingManager || 'V. K. Jain'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            sample.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {sample.verificationStatus || 'Pending Verification'}
                          </span>
                        </td>
                      </>
                    ) : activeSubViewName === 'Supplementary Sample Received' ? (
                      <>
                        <td className="p-3 font-mono font-bold text-amber-900">{sample.id}</td>
                        <td className="p-3 font-mono font-semibold text-slate-700">{sample.mainSampleId || '25M3AFE89'}</td>
                        <td className="p-3 font-semibold text-slate-900">
                          <div>{sample.product}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{sample.applicant}</div>
                        </td>
                        <td className="p-3 text-slate-600 font-semibold">{sample.dateReceived}</td>
                        <td className="p-3 text-slate-700 max-w-[180px] font-medium truncate" title={sample.reason || sample.requiredTests}>
                          {sample.reason || sample.requiredTests}
                        </td>
                      </>
                    ) : activeSubViewName === 'Amended Sample Received' ? (
                      <>
                        <td className="p-3 font-mono font-bold text-purple-900">{sample.id}</td>
                        <td className="p-3 font-mono font-semibold text-slate-700">{sample.originalSampleId || '26M4D4CE1'}</td>
                        <td className="p-3 font-semibold text-slate-900">{sample.product}</td>
                        <td className="p-3 text-slate-700 max-w-[180px] font-medium truncate" title={sample.amendmentReason}>
                          {sample.amendmentReason || 'Revision per BIS standard sheet'}
                        </td>
                        <td className="p-3 text-slate-600 font-semibold">{sample.dateReceived}</td>
                      </>
                    ) : activeSubViewName === 'Pending Amendment Requests' ? (
                      <>
                        <td className="p-3 font-mono font-bold text-rose-900">{sample.id}</td>
                        <td className="p-3 font-mono font-semibold text-slate-700">{sample.sampleId || '26M695518'}</td>
                        <td className="p-3 font-semibold text-slate-900">{sample.product}</td>
                        <td className="p-3 text-slate-700 max-w-[160px] font-medium truncate" title={sample.reason}>
                          {sample.reason || 'Retest requested by applicant'}
                        </td>
                        <td className="p-3 text-slate-600 font-semibold">{sample.requestedBy || 'Suraksha Quality Manager'}</td>
                        <td className="p-3 text-slate-600 font-semibold">{sample.requestDate || sample.dateReceived}</td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 font-mono font-bold text-slate-900">{sample.id}</td>
                        <td className="p-3 font-semibold text-slate-900">
                          <div>{sample.product}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{sample.applicant}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{sample.standard}</td>
                        <td className="p-3 text-center font-bold text-slate-900">{sample.quantity || '1.00'}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            sample.priority === 'High' ? 'bg-rose-100 text-rose-800' :
                            sample.priority === 'Medium' ? 'bg-amber-100 text-amber-900' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {sample.priority || '-'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 max-w-[180px] font-semibold truncate" title={sample.requiredTests}>
                          {sample.requiredTests}
                        </td>
                        <td className="p-3 text-slate-600 font-semibold">{sample.dateReceived}</td>
                      </>
                    )}

                    {selectedRole !== 'Technical Engineer' && (activeSubViewName.includes('Allocated') || activeSubViewName.includes('Pending View')) && (
                      <>
                        <td className="p-3 font-bold text-indigo-700">{sample.assignedEngineer || <span className="text-slate-400 font-normal italic">Unallocated</span>}</td>
                        <td className="p-3">{renderLifecycleStatus(sample)}</td>
                      </>
                    )}

                    {selectedRole !== 'Technical Engineer' && activeSubViewName === 'Verify Test Results' && (
                      <>
                        <td className="p-3 font-bold text-indigo-700">{sample.assignedEngineer || 'Mariam Tyagi'}</td>
                        <td className="p-3 text-emerald-800 font-semibold max-w-[180px] truncate" title={sample.testResults}>
                          {sample.testResults || 'Findings submitted'}
                        </td>
                      </>
                    )}

                    {selectedRole !== 'Technical Engineer' && activeSubViewName === 'Reports Pending' && (
                      <>
                        <td className="p-3 font-semibold text-slate-800">{sample.testingSection || 'Mechanical'}</td>
                        <td className="p-3 font-bold text-indigo-700">{sample.assignedEngineer || 'Harendra Singh'}</td>
                      </>
                    )}

                    {selectedRole !== 'Technical Engineer' && activeSubViewName === 'Amended Reports Pending' && (
                      <>
                        <td className="p-3 font-mono font-bold text-purple-900">{sample.reportNumber || 'AMD-REP-2026-02'}</td>
                        <td className="p-3 font-bold text-indigo-700">{sample.assignedEngineer || 'Sunita Sharma'}</td>
                      </>
                    )}

                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        sample.status.includes('Completed') || sample.status.includes('Sent') ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        sample.status.includes('Verification') || sample.status.includes('Allocated') ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {sample.status}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => triggerNotification(`Downloading Jobcard specification file for ${sample.id} (${sample.standard || sample.product})`, 'info')}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                        title="Download Jobcard"
                        aria-label={`Download Jobcard specification for ${sample.id}`}
                      >
                        <Download size={14} />
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      <button 
                        onClick={() => handleClarificationChat(sample)}
                        className={`p-1 rounded ${
                          clarifications.some(c => c.sampleId === sample.id && c.status === 'Open')
                            ? 'text-amber-600 hover:bg-amber-100'
                            : 'text-slate-400 hover:text-slate-800'
                        }`}
                        title="Clarifications Chat"
                      >
                        <HelpCircle size={15} />
                      </button>
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleActionClick(sample, 'timeline')}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                        title="View History Logs"
                      >
                        <Clock size={14} />
                      </button>
                    </td>

                    {/* Actions Column */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* VIEW ACTION */}
                        <button
                          type="button"
                          onClick={() => handleActionClick(sample, 'view')}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="View Full Metadata"
                        >
                          <Eye size={11} /> View
                        </button>

                        {/* TECHNICAL ENGINEER SPECIFIC ACTIONS */}
                        {selectedRole === 'Technical Engineer' ? (
                          <>
                            {activeSubViewName === 'Sample Receipt' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleActionClick(sample, 'accept')}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                  title="Accept Sample into Lab Queue"
                                >
                                  <CheckCircle size={11} /> Accept Sample
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleActionClick(sample, 'start_testing')}
                                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                  title="Start Active Testing"
                                >
                                  <Play size={11} /> Start Testing
                                </button>
                              </>
                            )}

                            {activeSubViewName === 'Pending Samples' && (
                              <>
                                {sample.status !== 'Testing In Progress' && (
                                  <button
                                    type="button"
                                    onClick={() => handleActionClick(sample, 'start_testing')}
                                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                    title="Start Active Testing"
                                  >
                                    <Play size={11} /> Start Testing
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleActionClick(sample, 'submit_results')}
                                  className="px-2 py-1 bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold rounded text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                  title="Submit Completed Test Findings"
                                >
                                  <ClipboardCheck size={11} /> Submit Results
                                </button>
                              </>
                            )}

                            {activeSubViewName === 'Issued Test Report' && (
                              <button
                                type="button"
                                onClick={() => handleActionClick(sample, 'view_submitted_report')}
                                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="View Official Certificate Report"
                              >
                                <FileText size={11} /> View Report
                              </button>
                            )}
                          </>
                        ) : (
                          /* TECHNICAL MANAGER / OTHER ROLES ACTIONS */
                          <>
                            {activeSubViewName === 'Verify Test Results' ? (
                              <button
                                type="button"
                                onClick={() => handleActionClick(sample, 'verify')}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Inspect & Verify Results"
                              >
                                <FileCheck size={11} /> Verify Results
                              </button>
                            ) : activeSubViewName === 'Reports Pending' ? (
                              <button
                                type="button"
                                onClick={() => handleActionClick(sample, 'prepare_report')}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Prepare & Draft Final Report"
                              >
                                <FileText size={11} /> Prepare Report
                              </button>
                            ) : activeSubViewName === 'Amended Reports Pending' ? (
                              <button
                                type="button"
                                onClick={() => handleActionClick(sample, 'review_amended')}
                                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Review & Approve Amended Report"
                              >
                                <FileText size={11} /> Review & Approve
                              </button>
                            ) : (activeSubViewName.includes('Final Reports') || sample.status === 'Final Reports Pending' || sample.status === 'Testing Completed') && sample.status !== 'Sent to Sample Cell' ? (
                              <button
                                type="button"
                                onClick={() => handleActionClick(sample, 'send_to_sample_cell')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Send Report & PDF to Sample Cell"
                              >
                                <Send size={11} /> Send to Sample Cell
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleActionClick(sample, 'allocate')}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                                title="Allocate Engineer"
                              >
                                <UserCheck size={11} /> {sample.assignedEngineer ? 'Reallocate' : 'Allocate'}
                              </button>
                            )}
                          </>
                        )}

                        {/* RAISE CLARIFICATION ACTION */}
                        <button
                          type="button"
                          onClick={() => handleClarificationChat(sample)}
                          className="px-2 py-1 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                          title="Raise / View Clarifications"
                        >
                          <HelpCircle size={11} /> Clarification
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER MODALS */}
      <AllocateModal 
        isOpen={isAllocateOpen} 
        sample={activeSample} 
        onClose={() => { setIsAllocateOpen(false); setActiveSample(null); }} 
      />

      <ClarificationModal
        isOpen={isClarifyOpen}
        sample={activeSample}
        clarification={activeClarification}
        mode={clarifyMode}
        onClose={() => { 
          setIsClarifyOpen(false); 
          setActiveSample(null); 
          setActiveClarification(null); 
        }}
      />

      <TestResultsModal
        isOpen={isTestSubmitOpen}
        sample={activeSample}
        onClose={() => { setIsTestSubmitOpen(false); setActiveSample(null); }}
      />

      <ReportPrepareModal
        isOpen={isReportPrepareOpen}
        sample={activeSample}
        onClose={() => { setIsReportPrepareOpen(false); setActiveSample(null); }}
      />

      <ViewDetailsModal
        isOpen={isDetailsOpen}
        sample={activeSample}
        onClose={() => { setIsDetailsOpen(false); setActiveSample(null); }}
        onAction={handleActionClick}
      />

      <LifecycleTimelineModal
        isOpen={isTimelineOpen}
        sample={activeSample}
        onClose={() => { setIsTimelineOpen(false); setActiveSample(null); }}
      />

      <VerifyTestResultsModal
        isOpen={isVerifyModalOpen}
        sample={activeSample}
        onClose={() => { setIsVerifyModalOpen(false); setActiveSample(null); }}
      />

      <AmendedReportReviewModal
        isOpen={isAmendedReviewModalOpen}
        sample={activeSample}
        onClose={() => { setIsAmendedReviewModalOpen(false); setActiveSample(null); }}
      />

      <ViewSubmittedReportModal
        isOpen={isSubmittedReportModalOpen}
        sample={activeSample}
        onClose={() => { setIsSubmittedReportModalOpen(false); setActiveSample(null); }}
      />

    </div>
  );
}
