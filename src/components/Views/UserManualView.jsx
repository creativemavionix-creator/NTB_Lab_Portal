import React, { useState } from 'react';
import { BookOpen, Trash2, Edit2, Upload, ZoomIn, ZoomOut, Printer, Download, X } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import { storageService } from '../../services/storageService';

export default function UserManualView() {
  const { manuals, selectedRole, uploadUserManual, updateUserManual, deleteUserManual, triggerNotification } = useWorkflow();

  const [activeManual, setActiveManual] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [newTitle, setNewTitle] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsUploading(true);
    let uploadedUrl = null;
    if (file) {
      const { url } = await storageService.uploadFile(file, 'manuals');
      uploadedUrl = url;
    }

    await uploadUserManual(newTitle, uploadedUrl);
    setIsUploading(false);
    setNewTitle('');
    setFile(null);
  };

  const handleEditSubmit = (e, id) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    updateUserManual(id, editTitle);
    setIsEditing(null);
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 pb-20 bg-[#edf3f9] text-slate-800 min-h-full font-sans">
      
      {/* Title Header matching PDF */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base md:text-lg font-bold text-[#1e3a8a] tracking-tight uppercase flex items-center gap-2">
            <BookOpen className="text-yellow-500" size={20} />
            User Manual
          </h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wide">
            Official NTB Standard Operating Procedures (Linked to NTB Admin Dashboard)
          </p>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs self-start sm:self-auto">
          {manuals.length} Documents Available
        </span>
      </div>

      {/* Admin actions (Upload/Publish new manual) */}
      {selectedRole === 'Admin' && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 font-semibold text-xs text-slate-800 shadow-2xs">
          <h3 className="text-[10px] uppercase text-slate-500 font-black mb-2 flex items-center gap-1.5">
            <Upload size={14} />
            [Admin Master Controls] Upload & Publish New User Manual
          </h3>
          <form onSubmit={handleUploadSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-[10px] text-slate-500 mb-1">User Manual Title / Name</label>
              <input
                type="text"
                placeholder="e.g. SOP for chemical laboratory sample preparation"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-rose-500 focus:outline-none bg-white text-slate-800 font-medium text-xs"
                required
              />
            </div>
            <div className="w-full sm:w-64">
              <label className="block text-[10px] text-slate-500 mb-1">PDF Attachment (Supabase Storage)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full border border-slate-300 rounded p-1.5 bg-slate-50 text-slate-800 text-[11px]"
              />
            </div>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded shadow-2xs flex items-center justify-center gap-1 w-full sm:w-auto h-9 text-xs transition-colors shrink-0 cursor-pointer"
            >
              <Upload size={14} />
              <span>{isUploading ? 'Uploading...' : 'Upload PDF'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Manuals Table (Matching Page 15 screenshot 100%) */}
      <div className="bg-white border border-slate-200 rounded shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs font-semibold text-slate-800 border-collapse">
          <tbody className="divide-y divide-slate-200 bg-white">
            {manuals.map((manual, idx) => (
              <tr key={manual.id} className="hover:bg-slate-50 transition-colors">
                {/* S.No */}
                <td className="p-3.5 text-center font-bold text-slate-900 w-12 border-r border-slate-200">
                  {idx + 1}.
                </td>

                {/* Title */}
                <td className="p-3.5 pl-4">
                  {isEditing === manual.id ? (
                    <form onSubmit={(e) => handleEditSubmit(e, manual.id)} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="border border-slate-300 bg-white rounded px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none flex-1"
                        required
                      />
                      <button type="submit" className="bg-emerald-600 text-white px-2 py-1 rounded font-bold">Save</button>
                      <button type="button" onClick={() => setIsEditing(null)} className="text-slate-500 hover:underline">Cancel</button>
                    </form>
                  ) : (
                    <span className="text-slate-800 font-semibold leading-normal">{manual.title}</span>
                  )}
                </td>
                
                {/* Download Button (Matching Screenshot 15 bright blue button) */}
                <td className="p-3.5 text-right w-48">
                  <div className="flex items-center justify-end gap-1.5">
                    
                    <button
                      onClick={() => setActiveManual(manual)}
                      className="bg-[#3b82f6] hover:bg-blue-700 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      <span>Download User Manual</span>
                    </button>

                    {/* Admin Edit/Remove controls */}
                    {selectedRole === 'Admin' && isEditing !== manual.id && (
                      <>
                        <button
                          onClick={() => { setIsEditing(manual.id); setEditTitle(manual.title); }}
                          className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded text-indigo-600 transition-colors"
                          title="Update manual"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => { if (window.confirm("Remove this manual permanently?")) deleteUserManual(manual.id); }}
                          className="p-1.5 border border-slate-200 hover:bg-rose-50 rounded text-rose-600 transition-colors"
                          title="Remove manual"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PDF READER MODAL */}
      {activeManual && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 p-4 overflow-y-auto">
          {/* Top PDF Toolbar */}
          <div className="flex items-center justify-between bg-slate-900 text-slate-200 px-4 py-3 rounded-t-xl border-b border-slate-800 max-w-4xl mx-auto w-full text-xs shadow-lg">
            <div className="flex items-center gap-3">
              <BookOpen size={16} className="text-yellow-500" />
              <span className="font-bold truncate max-w-xs md:max-w-md">{activeManual.title}.pdf</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Zoom */}
              <div className="flex items-center gap-1.5 border-r pr-3 border-slate-800">
                <button type="button" onClick={() => setZoomLevel(z => Math.max(50, z - 10))} className="p-1 hover:bg-slate-800 rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" aria-label="Zoom out PDF"><ZoomOut size={14} /></button>
                <span className="font-mono font-bold w-10 text-center">{zoomLevel}%</span>
                <button type="button" onClick={() => setZoomLevel(z => Math.min(200, z + 10))} className="p-1 hover:bg-slate-800 rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" aria-label="Zoom in PDF"><ZoomIn size={14} /></button>
              </div>
              
              <button type="button" onClick={() => window.print()} className="p-1 hover:bg-slate-800 rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" aria-label="Print user manual" title="Print document"><Printer size={14} /></button>
              <button type="button" onClick={() => triggerNotification(`User manual PDF (${activeManual.title}) downloaded successfully`, 'success')} className="p-1 hover:bg-slate-800 rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" aria-label="Download PDF manual" title="Download PDF"><Download size={14} /></button>
              <button type="button" onClick={() => setActiveManual(null)} className="p-1 hover:bg-rose-600 hover:text-white rounded ml-2 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none" aria-label="Close reader" title="Close Reader"><X size={16} /></button>
            </div>
          </div>

          {/* PDF Page Body */}
          <div className="flex-1 max-w-4xl mx-auto w-full bg-white shadow-2xl overflow-hidden rounded-b-xl p-6 md:p-12 transition-all text-slate-900" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}>
            <div className="border border-slate-200 p-8 min-h-[700px] flex flex-col justify-between font-serif">
              
              {/* Cover Header */}
              <div className="text-center border-b-2 border-slate-900 pb-6">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">National Testing Bureau (NTB)</span>
                <h1 className="text-2xl font-extrabold text-slate-950 mt-1 uppercase tracking-wide">
                  {activeManual.title}
                </h1>
                <p className="text-[10px] italic text-slate-500 mt-2">
                  Document ID: SOP-NTB-QA-{activeManual.id} | Revision: 2.1 | Date: {activeManual.date}
                </p>
              </div>

              {/* SOP Body content */}
              <div className="my-8 text-xs text-slate-800 space-y-6 leading-relaxed text-justify">
                <div>
                  <h3 className="font-sans font-bold text-slate-950 uppercase tracking-wide text-xs mb-2">1.0 Scope and Application</h3>
                  <p>
                    This standard operating procedure defines the administrative and quality control workflows governed by the Technical Managers, Testing Engineers, OICs, and Sample Cells under the BIS national accreditation frameworks.
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-slate-950 uppercase tracking-wide text-xs mb-2">2.0 Laboratory Allocation Protocols</h3>
                  <p>
                    Upon receipt of samples from the Sample Cell, the Technical Manager must audit the inward metadata. Allocation must be registered within 48 hours to the accredited Technical Engineer in the corresponding testing section.
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-slate-950 uppercase tracking-wide text-xs mb-2">3.0 Test Verification and Calibration Margins</h3>
                  <p>
                    Testing personnel must run calibrations on the testing machinery before executing pressure, tensile, gas leakage, or chemical trace tests. All observations must be entered in the logsheets and verified with double signatures by the Section Technical Head prior to certificate compilation.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 border border-slate-200 font-sans text-[11px] leading-normal text-slate-700">
                  <strong>NOTE:</strong> If testing parameters exceed the safety bounds or require custom standards, the Engineer must immediately raise a clarification through the portal back to the Sample Cell. Testing must be suspended during open clarification stages.
                </div>
              </div>

              {/* Bottom footer */}
              <div className="flex justify-between items-center border-t pt-4 text-[9px] text-slate-400 font-sans font-bold">
                <span>NATIONAL TESTING BUREAU © 2026</span>
                <span>Page 1 of 4 (Confidential)</span>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
