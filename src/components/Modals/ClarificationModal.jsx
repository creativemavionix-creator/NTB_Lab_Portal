import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function ClarificationModal({ sample, clarification, isOpen, onClose, mode }) {
  const { raiseClarification, respondClarification, selectedRole, triggerNotification } = useWorkflow();

  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) return triggerNotification('Subject and details are required.', 'warning');
    
    try {
      setIsSubmitting(true);
      await raiseClarification(sample.id, subject, details, 'Sample Cell');
      triggerNotification(`Technical query raised for sample ${sample.id}`, 'success');
      onClose();
      setSubject('');
      setDetails('');
    } catch (err) {
      triggerNotification(`Failed to raise clarification: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    if (!response.trim()) return triggerNotification('Please enter your response.', 'warning');
    
    try {
      setIsSubmitting(true);
      await respondClarification(clarification.id, response);
      triggerNotification('Clarification response submitted successfully', 'success');
      onClose();
      setResponse('');
    } catch (err) {
      triggerNotification(`Failed to submit response: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 pt-3 sm:pt-4 bg-slate-950/75 backdrop-blur-xs font-sans overflow-y-auto animate-fade-in" role="dialog" aria-modal="true" aria-label="Technical Clarification Thread Dialog">
      <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md my-0 sm:my-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            <HelpCircle size={16} className="text-yellow-500" />
            {mode === 'raise' ? 'Raise Technical Clarification' : 'Clarification Thread Chat'}
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" aria-label="Close clarification modal">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-xs text-slate-800 dark:text-slate-200">
          {mode === 'raise' && sample && (
            <form onSubmit={handleRaiseSubmit} className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Regarding Sample</span>
                <div className="mt-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-100 font-semibold">
                  {sample.id} - {sample.product} ({sample.standard})
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Missing electrical wiring layout diagram..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Clarification details</label>
                <textarea
                  placeholder="State the exact clarification required from Sample Cell..."
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800 resize-none"
                  required
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
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-slate-950 rounded-lg font-bold shadow-2xs flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Submit Query</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {mode === 'respond' && clarification && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-200 space-y-2 min-w-0 break-words">
                <div className="min-w-0">
                  <span className="font-bold block text-[9px] uppercase tracking-wide text-slate-400">Subject</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold text-xs break-words">{clarification.subject}</span>
                </div>
                <div className="min-w-0">
                  <span className="font-bold block text-[9px] uppercase tracking-wide text-slate-400">Query ({clarification.raisedBy})</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5 whitespace-pre-wrap break-words">{clarification.clarification}</p>
                </div>
                <div className="text-[10px] text-slate-400 italic">
                  Raised on: {clarification.dateRaised}
                </div>
              </div>

              {clarification.status === 'Closed' ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold block text-[9px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Response (Sample Cell)</span>
                  <p className="mt-0.5 whitespace-pre-wrap">{clarification.response}</p>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 italic mt-1">
                    Resolved on: {clarification.responseDate}
                  </div>
                </div>
              ) : selectedRole === 'Sample Cell' ? (
                <form onSubmit={handleResponseSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Your Response</label>
                    <textarea
                      placeholder="Write explanation or attach required document layout here..."
                      rows={3}
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800 resize-none"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
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
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-slate-950 rounded-lg font-bold shadow-2xs flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Submit Response</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-amber-800 dark:text-amber-300 text-center font-medium">
                  Waiting for response from Sample Cell.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
