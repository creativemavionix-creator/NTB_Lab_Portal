import React from 'react';
import { X, FileText, CheckCircle, Download, Printer, User, Calendar, ShieldCheck } from 'lucide-react';

export default function ViewSubmittedReportModal({ sample, isOpen, onClose }) {
  if (!isOpen || !sample) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors my-8 text-xs font-medium text-slate-800 dark:text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            <FileText size={16} className="text-amber-500" />
            Submitted Test Report Certificate - {sample.reportNumber || `REP-${sample.id}`}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Content - Visual Official Test Certificate */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin">
          
          <div className="border-[6px] border-double border-slate-700 dark:border-slate-600 p-6 bg-slate-50 text-slate-900 relative rounded-lg">
            
            {/* Header */}
            <div className="text-center border-b-2 border-slate-700 pb-3">
              <h2 className="font-extrabold text-base text-slate-950 tracking-wider">
                NATIONAL TESTING BUREAU (NTB)
              </h2>
              <p className="text-[9px] text-slate-500 tracking-wide uppercase font-bold">
                Government Quality Assurance Laboratory, Ghaziabad
              </p>
              <h3 className="font-bold text-xs text-slate-900 tracking-widest uppercase mt-3 bg-slate-200 py-1 border border-slate-300">
                Official Test Report & Quality Certificate
              </h3>
            </div>

            {/* Certificate Details */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[10px] mt-4 text-slate-900 font-medium">
              <div><span className="font-bold">Report Number:</span> <span className="font-mono bg-amber-200 px-1 font-bold">{sample.reportNumber || `REP-${sample.id}`}</span></div>
              <div><span className="font-bold">Test Request ID:</span> <span className="font-mono font-bold">{sample.testRequestId || `TR-${sample.id}`}</span></div>
              <div><span className="font-bold">Sample ID Reference:</span> {sample.id}</div>
              <div><span className="font-bold">Inward Received Date:</span> {sample.dateReceived}</div>
              <div><span className="font-bold">Testing Standard:</span> {sample.standard}</div>
              <div><span className="font-bold">Testing Section:</span> {sample.testingSection || 'Mechanical'}</div>
              <div className="col-span-2"><span className="font-bold">Product / Sample:</span> {sample.product} ({sample.sampleType})</div>
              <div className="col-span-2"><span className="font-bold">Applicant / Manufacturer:</span> {sample.applicant}</div>
            </div>

            {/* Test Findings Summary */}
            <div className="mt-4 border border-slate-400 text-[10px]">
              <div className="grid grid-cols-3 font-bold bg-slate-200 border-b border-slate-400 p-1.5 uppercase text-[9px]">
                <div>Required Test Clauses</div>
                <div className="col-span-2">Technical Observations & Values Obtained</div>
              </div>
              <div className="grid grid-cols-3 p-2 border-b border-slate-200 bg-white">
                <div className="font-semibold text-slate-950">{sample.requiredTests}</div>
                <div className="col-span-2 text-slate-800 leading-relaxed whitespace-pre-wrap">{sample.testResults || 'Passed all standard testing criteria.'}</div>
              </div>
            </div>

            {/* Verification & Signatures */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-slate-300 text-[9px]">
              <div className="space-y-1">
                <div className="text-slate-500 font-bold uppercase">Submitted By Testing Person:</div>
                <div className="font-bold text-slate-950 flex items-center gap-1">
                  <User size={12} className="text-indigo-600" />
                  {sample.assignedEngineer || 'Mariam Tyagi'} (Technical Engineer)
                </div>
                <div className="text-slate-600">Test Date: {sample.testDate || sample.dateReceived}</div>
              </div>

              <div className="space-y-1 text-right">
                <div className="text-slate-500 font-bold uppercase">Verification Status:</div>
                <div className="inline-block">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    sample.verificationStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {sample.verificationStatus || 'Pending Verification'}
                  </span>
                </div>
                <div className="text-slate-600">Technical Manager: {sample.reportingManager || 'V. K. Jain'}</div>
              </div>
            </div>

          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1"
              >
                <Printer size={13} /> Print Certificate
              </button>
              <button
                onClick={() => alert(`Downloaded PDF: ${sample.reportNumber || sample.id}.pdf`)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs"
              >
                <Download size={13} /> Download PDF
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
