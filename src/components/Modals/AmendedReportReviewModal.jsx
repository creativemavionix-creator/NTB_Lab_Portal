import React, { useState } from 'react';
import { X, CheckCircle, RotateCcw, FileText, Eye, AlertTriangle, User } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function AmendedReportReviewModal({ sample, isOpen, onClose }) {
  const { approveAmendedReport, returnReportForCorrection } = useWorkflow();
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [correctionNotes, setCorrectionNotes] = useState('');

  if (!isOpen || !sample) return null;

  const handleApprove = () => {
    approveAmendedReport(sample.id);
    onClose();
    setShowReturnForm(false);
    setCorrectionNotes('');
  };

  const handleReturn = (e) => {
    e.preventDefault();
    if (!correctionNotes.trim()) return alert('Please enter correction instructions for the amended report.');
    returnReportForCorrection(sample.id, correctionNotes);
    onClose();
    setShowReturnForm(false);
    setCorrectionNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors my-8 text-xs font-medium text-slate-800 dark:text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            <FileText size={16} className="text-purple-400" />
            Amended Report Review & Approval - {sample.reportNumber || sample.id}
          </h3>
          <button onClick={() => { onClose(); setShowReturnForm(false); }} className="text-slate-400 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
          
          {/* Status Alert Banner */}
          <div className="bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-purple-600 dark:text-purple-400" />
              <div>
                <span className="font-extrabold text-purple-950 dark:text-purple-200 text-xs block">Amended Report Revision Pending Approval</span>
                <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium">Review updated report details before final release authorization.</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 border border-purple-300">
              Under Review
            </span>
          </div>

          {/* Details Grid */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 rounded-lg grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Amended Report Number</span>
              <span className="font-mono font-bold text-purple-900 dark:text-purple-300">{sample.reportNumber || `AMD-REP-${sample.id}`}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Original Sample / Report Ref</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{sample.originalSampleId || sample.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Product Name</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{sample.product}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Applicant</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{sample.applicant}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Engineer</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <User size={12} className="text-slate-400" />
                {sample.assignedEngineer || 'Sunita Sharma'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Testing Section</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{sample.testingSection || 'Electrical'}</span>
            </div>
          </div>

          {/* Amendment Reason */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3.5 rounded-lg space-y-1">
            <span className="text-[10px] text-amber-900 dark:text-amber-300 font-extrabold uppercase tracking-wider block">
              Reason for Report Amendment / Scope Revision
            </span>
            <p className="text-amber-950 dark:text-amber-100 font-medium text-xs leading-relaxed">
              {sample.amendmentReason || sample.remarks || 'Correction requested for applicant address, drawing reference, and serial number formatting per BIS requirement sheet.'}
            </p>
          </div>

          {/* Revised Test Findings Summary */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Revised Technical Test Findings</span>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium text-xs leading-relaxed whitespace-pre-wrap">
              {sample.testResults || 'Re-tested and verified in accordance with amended IS standard parameters.'}
            </div>
          </div>

          {/* Correction Notes Form */}
          {showReturnForm && (
            <form onSubmit={handleReturn} className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 rounded-lg space-y-3">
              <label className="block text-[10px] text-rose-900 dark:text-rose-200 font-extrabold uppercase tracking-wider">
                Correction Instructions for Amended Report
              </label>
              <textarea
                placeholder="Specify required corrections before this amended report can be approved..."
                rows={3}
                value={correctionNotes}
                onChange={(e) => setCorrectionNotes(e.target.value)}
                className="w-full border border-rose-300 dark:border-rose-700 rounded p-2 text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-rose-500 focus:outline-none bg-white dark:bg-slate-900 text-xs"
                required
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReturnForm(false)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold shadow-2xs text-xs flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  Return Report for Correction
                </button>
              </div>
            </form>
          )}

          {/* Footer Actions */}
          {!showReturnForm && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowReturnForm(true)}
                className="px-3.5 py-2 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg font-bold transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} />
                Return for Correction
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { onClose(); setShowReturnForm(false); }}
                  className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors shadow-2xs text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={14} />
                  Approve Amended Report
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
