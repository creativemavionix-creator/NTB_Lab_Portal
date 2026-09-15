import React, { useState, useEffect } from 'react';
import { X, FileText, Send } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function ReportPrepareModal({ sample, isOpen, onClose }) {
  const { reportingManagers, prepareReport, triggerNotification } = useWorkflow();

  const [reportNo, setReportNo] = useState('');
  const [selectedRm, setSelectedRm] = useState('');
  const [remarks, setRemarks] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sample) {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      setReportNo(`REP-${new Date().getFullYear()}-${randomId}`);
      if (reportingManagers.length > 0) {
        setSelectedRm(reportingManagers[0].name);
      }
    }
  }, [sample, reportingManagers]);

  if (!isOpen || !sample) return null;

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!reportNo.trim()) return triggerNotification('Please enter a valid Report Number.', 'warning');
    
    try {
      setIsSubmitting(true);
      await prepareReport(sample.id, reportNo, selectedRm);
      triggerNotification(`Final Report Prepared: ${reportNo}`, 'success');
      onClose();
      setPreviewMode(false);
    } catch (err) {
      triggerNotification(`Failed to prepare report: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 pt-3 sm:pt-4 bg-slate-950/75 backdrop-blur-xs font-sans overflow-y-auto animate-fade-in" role="dialog" aria-modal="true" aria-label="Prepare Test Report Dialog">
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl my-0 sm:my-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            <FileText size={16} className="text-yellow-500" />
            {previewMode ? 'Certificate Preview & Sign-Off' : 'Prepare Test Report Certificate'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" aria-label="Close report prepare modal">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {!previewMode ? (
          <form onSubmit={(e) => { e.preventDefault(); setPreviewMode(true); }} className="p-6 space-y-4 text-xs text-slate-800 dark:text-slate-200 font-medium">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Generated Report Draft ID</label>
                <input
                  type="text"
                  value={reportNo}
                  onChange={(e) => setReportNo(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-bold focus:ring-1 focus:ring-cyan-500 focus:outline-none bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Signing Authority / Reporting Manager</label>
                <select
                  value={selectedRm}
                  onChange={(e) => setSelectedRm(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none bg-white dark:bg-slate-800"
                  required
                >
                  {reportingManagers.map(rm => (
                    <option key={rm.id} value={rm.name}>{rm.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Lab Results Summary</span>
              <div className="mt-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
                <div><span className="font-bold text-slate-900 dark:text-slate-100">Sample ID:</span> {sample.id}</div>
                <div><span className="font-bold text-slate-900 dark:text-slate-100">Applicant:</span> {sample.applicant}</div>
                <div><span className="font-bold text-slate-900 dark:text-slate-100">Testing Standard:</span> {sample.standard}</div>
                <div><span className="font-bold text-slate-900 dark:text-slate-100">Engineer Findings:</span> <p className="text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-700 rounded">{sample.testResults}</p></div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Final Remarks / Executive Comments</label>
              <textarea
                placeholder="The sample was tested in accordance with specified IS clauses and found to comply with all safety limit margins. Fit for commercial circulation."
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-cyan-500 focus:outline-none bg-white dark:bg-slate-800 resize-none"
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
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold transition-colors shadow-2xs"
              >
                Preview Official Certificate
              </button>
            </div>
          </form>
        ) : (
          /* Visual PDF Preview of Certificate */
          <div className="p-6 space-y-6">
            <div className="border-[6px] border-double border-slate-700 dark:border-slate-600 p-8 bg-slate-50 text-slate-900 relative rounded-lg">
              
              <div className="text-center border-b-2 border-slate-700 pb-4">
                <h2 className="font-extrabold text-lg text-slate-950 tracking-wider">
                  NATIONAL TESTING BUREAU
                </h2>
                <p className="text-[9px] text-slate-500 tracking-wide uppercase font-bold">
                  Government of India Quality Verification Laboratory
                </p>
                <p className="text-[9px] text-slate-500 italic mt-0.5">
                  Ghaziabad, Uttar Pradesh - 201001
                </p>
                <h3 className="font-bold text-sm text-slate-900 tracking-widest uppercase mt-4 bg-slate-200 py-1 border border-slate-300">
                  Certificate of Analysis / Test Report
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] mt-6 text-slate-900 font-medium">
                <div><span className="font-bold">Report Number:</span> <span className="font-mono bg-yellow-200 px-1 font-bold">{reportNo}</span></div>
                <div><span className="font-bold">Date of Report:</span> {new Date().toLocaleDateString()}</div>
                <div><span className="font-bold">Sample ID Reference:</span> {sample.id}</div>
                <div><span className="font-bold">Sample Inward Date:</span> {sample.dateReceived}</div>
                <div><span className="font-bold">Tested Standard:</span> {sample.standard}</div>
                <div><span className="font-bold">Quantity Received:</span> {sample.quantity}</div>
                <div className="col-span-2"><span className="font-bold">Product / Sample Name:</span> {sample.product} ({sample.sampleType})</div>
                <div className="col-span-2"><span className="font-bold">Applicant / Manufacturer:</span> {sample.applicant}</div>
              </div>

              <div className="mt-6 border border-slate-400 text-[10px]">
                <div className="grid grid-cols-3 font-bold bg-slate-200 border-b border-slate-400 p-1.5 uppercase text-[9px]">
                  <div>Test Clause</div>
                  <div className="col-span-2">Technical Observations & Values Obtained</div>
                </div>
                <div className="grid grid-cols-3 p-2 border-b border-slate-200">
                  <div className="font-semibold text-slate-950">{sample.requiredTests}</div>
                  <div className="col-span-2 text-slate-800 leading-relaxed whitespace-pre-wrap">{sample.testResults}</div>
                </div>
                {remarks && (
                  <div className="p-2 bg-slate-100/80">
                    <span className="font-bold block text-slate-900 text-[8px] uppercase tracking-wide">Manager Conclusion:</span>
                    <p className="text-slate-700 mt-0.5 leading-relaxed italic">{remarks}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end mt-12 text-[9px]">
                <div className="space-y-1 text-slate-500">
                  <div>Verification Authority: <span className="font-bold text-slate-900">V. K. Jain (Technical Manager)</span></div>
                  <div>Status: <span className="text-emerald-700 font-bold">Tested & Verified (Pass)</span></div>
                </div>
                <div className="text-center border-t border-slate-400 pt-1 px-4 min-w-44">
                  <div className="font-serif italic text-slate-600 text-xs mb-1">Digitally Signed</div>
                  <div className="font-bold text-slate-900">{selectedRm}</div>
                  <div className="text-slate-500 font-bold uppercase tracking-wider text-[7px]">Reporting Manager</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
              >
                Go Back & Edit
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Approve and Sign Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
