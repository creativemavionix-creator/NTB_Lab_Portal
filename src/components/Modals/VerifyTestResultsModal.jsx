import React, { useState } from 'react';
import { X, CheckCircle, RotateCcw, FileCheck, User, Calendar, FileText, Download } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function VerifyTestResultsModal({ sample, isOpen, onClose }) {
  const { verifyTestResults, triggerNotification } = useWorkflow();
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [correctionRemarks, setCorrectionRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !sample) return null;

  const handleVerify = async () => {
    try {
      setIsSubmitting(true);
      await verifyTestResults(sample.id, true);
      triggerNotification(`Test results for sample ${sample.id} verified and sent to Reporting Queue`, 'success');
      onClose();
      setShowReturnForm(false);
      setCorrectionRemarks('');
    } catch (err) {
      triggerNotification(`Failed to verify results: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnForCorrection = async (e) => {
    e.preventDefault();
    if (!correctionRemarks.trim()) return triggerNotification('Please enter correction instructions for the engineer.', 'warning');
    
    try {
      setIsSubmitting(true);
      await verifyTestResults(sample.id, false, correctionRemarks);
      triggerNotification(`Sample ${sample.id} returned to engineer for correction`, 'warning');
      onClose();
      setShowReturnForm(false);
      setCorrectionRemarks('');
    } catch (err) {
      triggerNotification(`Failed to return sample: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 pt-3 sm:pt-4 bg-slate-950/75 backdrop-blur-xs font-sans overflow-y-auto animate-fade-in" role="dialog" aria-modal="true" aria-label="Verify Test Submission Dialog">
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xl my-0 sm:my-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors text-xs font-medium text-slate-800 dark:text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            <FileCheck size={16} className="text-amber-500" />
            Verify Test Submission - {sample.id}
          </h3>
          <button type="button" onClick={() => { onClose(); setShowReturnForm(false); }} className="text-slate-400 hover:text-white p-1 rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" aria-label="Close verify modal">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-thin">
          
          {/* Metadata Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 rounded-lg grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Product Name</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{sample.product}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Applicant</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{sample.applicant}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Testing Section</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{sample.testingSection || 'Mechanical'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Engineer</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <User size={12} className="text-slate-400" />
                {sample.assignedEngineer || 'Mariam Tyagi'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Standard / Specification</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{sample.standard}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Completion Date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" />
                {sample.testDate || new Date().toISOString().split('T')[0]}
              </span>
            </div>
          </div>

          {/* Engineer Findings Box */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-lg space-y-2">
            <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase font-extrabold block tracking-wider flex items-center gap-1.5">
              <FileCheck size={14} className="text-emerald-600" />
              Technical Engineer Test Findings & Observations
            </span>
            <p className="text-emerald-950 dark:text-emerald-100 font-semibold leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-900 p-3 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs">
              {sample.testResults || 'All required standard test parameters verified and compliant.'}
            </p>
          </div>

          {/* Required Test Clauses */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Required Standard Clauses Tested</span>
            <div className="mt-1 text-slate-800 dark:text-slate-200 font-semibold bg-slate-100 dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700">
              {sample.requiredTests}
            </div>
          </div>

          {/* Attached Files */}
          {sample.documents && sample.documents.length > 0 && (
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Uploaded Raw Test Datasheets</span>
              <div className="space-y-1">
                {sample.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 transition-colors">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <FileText size={13} className="text-rose-500" />
                      {doc}
                    </span>
                    <button 
                      type="button"
                      onClick={() => triggerNotification(`Downloading lab datasheet: ${doc}`, 'info')}
                      className="p-1 text-slate-400 hover:text-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
                      title="Download Datasheet"
                      aria-label={`Download lab datasheet ${doc}`}
                    >
                      <Download size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Return for Correction Remarks Form */}
          {showReturnForm && (
            <form onSubmit={handleReturnForCorrection} className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 rounded-lg space-y-3">
              <label className="block text-[10px] text-rose-900 dark:text-rose-200 font-extrabold uppercase tracking-wider">
                Correction Instructions for {sample.assignedEngineer || 'Engineer'}
              </label>
              <textarea
                placeholder="Specify missing test parameters, inaccurate clause measurements, or formatting issues..."
                rows={3}
                value={correctionRemarks}
                onChange={(e) => setCorrectionRemarks(e.target.value)}
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
                  Send Back for Correction
                </button>
              </div>
            </form>
          )}

          {/* Action Buttons */}
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
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-bold transition-colors shadow-2xs text-xs flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      <span>Verify (Transfer to Reporting Queue)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
