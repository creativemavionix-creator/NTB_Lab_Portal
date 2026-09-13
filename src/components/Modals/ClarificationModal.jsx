import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function ClarificationModal({ sample, clarification, isOpen, onClose, mode }) {
  const { raiseClarification, respondClarification, selectedRole } = useWorkflow();

  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [response, setResponse] = useState('');

  if (!isOpen) return null;

  const handleRaiseSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) return alert('Subject and details are required.');
    
    raiseClarification(sample.id, subject, details, 'Sample Cell');
    onClose();
    setSubject('');
    setDetails('');
  };

  const handleResponseSubmit = (e) => {
    e.preventDefault();
    if (!response.trim()) return alert('Please enter your response.');
    
    respondClarification(clarification.id, response);
    onClose();
    setResponse('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            <HelpCircle size={16} className="text-yellow-500" />
            {mode === 'raise' ? 'Raise Technical Clarification' : 'Clarification Thread Chat'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
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
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-lg font-bold shadow-2xs"
                >
                  Send Query to Sample Cell
                </button>
              </div>
            </form>
          )}

          {mode === 'respond' && clarification && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-slate-800 dark:text-slate-200 space-y-2">
                <div>
                  <span className="font-bold block text-[9px] uppercase tracking-wide text-slate-400">Subject</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold text-xs">{clarification.subject}</span>
                </div>
                <div>
                  <span className="font-bold block text-[9px] uppercase tracking-wide text-slate-400">Query ({clarification.raisedBy})</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5 whitespace-pre-wrap">{clarification.clarification}</p>
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
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-lg font-bold shadow-2xs"
                    >
                      Submit Response
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
