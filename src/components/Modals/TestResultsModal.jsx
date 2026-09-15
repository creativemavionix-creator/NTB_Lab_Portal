import React, { useState } from 'react';
import { X, ClipboardCheck } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function TestResultsModal({ sample, isOpen, onClose }) {
  const { submitTestResults, triggerNotification } = useWorkflow();
  const [testResults, setTestResults] = useState('');
  const [attachments, setAttachments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !sample) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testResults.trim()) return triggerNotification('Please enter the test results.', 'warning');
    
    try {
      setIsSubmitting(true);
      const fullText = testResults + (attachments ? ` [Attached files: ${attachments}]` : '');
      await submitTestResults(sample.id, fullText);
      triggerNotification(`Test findings submitted for sample ${sample.id}`, 'success');
      onClose();
      setTestResults('');
      setAttachments('');
    } catch (err) {
      triggerNotification(`Failed to submit test findings: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 pt-3 sm:pt-4 bg-slate-950/75 backdrop-blur-xs font-sans overflow-y-auto animate-fade-in" role="dialog" aria-modal="true" aria-label="Submit Test Results Dialog">
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md my-0 sm:my-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            <ClipboardCheck size={16} className="text-yellow-500" />
            Submit Technical Test Findings
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" aria-label="Close test results modal">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-800 dark:text-slate-200">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Task Specification</span>
            <div className="mt-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-1 text-slate-700 dark:text-slate-300 font-medium">
              <div><span className="font-bold text-slate-900 dark:text-slate-100">ID:</span> {sample.id}</div>
              <div><span className="font-bold text-slate-900 dark:text-slate-100">Product:</span> {sample.product}</div>
              <div><span className="font-bold text-slate-900 dark:text-slate-100">Required Tests:</span> {sample.requiredTests}</div>
              <div><span className="font-bold text-slate-900 dark:text-slate-100">Standard Spec:</span> {sample.standard}</div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Raw Observations / Test Findings</label>
            <textarea
              placeholder="e.g. Hydrostatic pressure tested up to 3.0 kg/cm² without deformation. Safety valve released cleanly at 1.8 kg/cm²..."
              rows={4}
              value={testResults}
              onChange={(e) => setTestResults(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white dark:bg-slate-800 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Supporting Lab Sheets / Attachments (Optional)</label>
            <input
              type="text"
              placeholder="e.g. pressure_graph_cooker.png, thickness_log.xlsx"
              value={attachments}
              onChange={(e) => setAttachments(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white dark:bg-slate-800"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg font-bold transition-colors shadow-2xs flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Findings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
