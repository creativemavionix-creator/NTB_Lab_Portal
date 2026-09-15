import React, { useState } from 'react';
import { X, CheckCircle2, FlaskConical } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function GenerateTestRequestModal({ isOpen, onClose, defaultSample }) {
  const { samples, masterData, generateTestRequest, triggerNotification } = useWorkflow();

  const sampleIdOptions = samples.filter(s => ['New Sample Received', 'Pending Forwarding', 'Accept'].includes(s.status) || !s.testRequestId);

  const [selectedSampleId, setSelectedSampleId] = useState(defaultSample?.id || (sampleIdOptions[0]?.id || ''));
  const [product, setProduct] = useState(defaultSample?.product || '');
  const [sampleType, setSampleType] = useState(defaultSample?.sampleType || masterData.sampleTypes[0]);
  const [standard, setStandard] = useState(defaultSample?.standard || masterData.standards[0]);
  const [testType, setTestType] = useState(masterData.testTypes[0]);
  const [testingSection, setTestingSection] = useState(defaultSample?.testingSection || 'Mechanical');
  const [selectedParameters, setSelectedParameters] = useState(['Hydrostatic Pressure Test']);
  const [priority, setPriority] = useState('Medium');
  const [requiredDate, setRequiredDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSampleSelect = (id) => {
    setSelectedSampleId(id);
    const target = samples.find(s => s.id === id);
    if (target) {
      setProduct(target.product);
      setSampleType(target.sampleType || masterData.sampleTypes[0]);
      setStandard(target.standard || masterData.standards[0]);
      setTestingSection(target.testingSection || 'Mechanical');
    }
  };

  const toggleParameter = (param) => {
    if (selectedParameters.includes(param)) {
      setSelectedParameters(selectedParameters.filter(p => p !== param));
    } else {
      setSelectedParameters([...selectedParameters, param]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSampleId) return triggerNotification('Please select a valid Sample ID.', 'warning');

    try {
      setIsSubmitting(true);
      await generateTestRequest({
        sampleId: selectedSampleId,
        product,
        sampleType,
        standard,
        testType,
        testingSection,
        testParameters: selectedParameters,
        priority,
        requiredDate,
        remarks
      });

      triggerNotification(`Test Request generated successfully for ${selectedSampleId}`, 'success');
      onClose();
    } catch (err) {
      triggerNotification(`Failed to generate test request: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 pt-3 sm:pt-4 bg-slate-950/75 backdrop-blur-xs font-sans overflow-y-auto animate-fade-in" role="dialog" aria-modal="true" aria-label="Generate Test Request Dialog">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-0 sm:my-auto max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1e293b] text-white border-b border-slate-800">
          <h3 className="font-extrabold text-sm tracking-wide uppercase flex items-center gap-2">
            <FlaskConical size={18} className="text-[#f5b041]" />
            Generate Internal Test Request (TR) & Forward
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none" aria-label="Close generate test request modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-medium">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Select Sample ID
              </label>
              <select
                value={selectedSampleId}
                onChange={(e) => handleSampleSelect(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-extrabold text-[#1e3a8a] focus:outline-none cursor-pointer"
              >
                {sampleIdOptions.map(s => (
                  <option key={s.id} value={s.id}>{s.id} - {s.product}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-bold text-slate-900 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Sample Type (Admin Master)
              </label>
              <select
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded font-medium focus:outline-none"
              >
                {masterData.sampleTypes.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Standard (Admin Master)
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded font-medium focus:outline-none"
              >
                {masterData.standards.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Test Type (Admin Master)
              </label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded font-medium focus:outline-none"
              >
                {masterData.testTypes.map(tt => (
                  <option key={tt} value={tt}>{tt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Testing Section / Lab
              </label>
              <select
                value={testingSection}
                onChange={(e) => setTestingSection(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded font-medium focus:outline-none"
              >
                {masterData.laboratories.map(lab => (
                  <option key={lab} value={lab.replace(' Laboratory', '')}>{lab}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded font-bold focus:outline-none"
              >
                <option value="Normal">Normal Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
                Required Due Date
              </label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Test Parameters Multi-Select */}
          <div>
            <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1.5">
              Required Test Parameters (Multi-Select)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              {masterData.testParameters.map((param) => {
                const checked = selectedParameters.includes(param);
                return (
                  <label
                    key={param}
                    onClick={() => toggleParameter(param)}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-colors select-none text-[11px] font-semibold ${
                      checked ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input type="checkbox" checked={checked} readOnly className="rounded text-[#f59e0b]" />
                    <span className="truncate">{param}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase text-[10px] tracking-wider mb-1">
              Remarks & Inward Notes
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded font-medium focus:outline-none"
            />
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#f59e0b] hover:bg-[#e09b2d] disabled:bg-amber-300 text-slate-950 font-black rounded shadow-md transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Generate TR & Forward to TM</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
