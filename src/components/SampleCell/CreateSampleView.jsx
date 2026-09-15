import React, { useState } from 'react';
import { 
  PlusCircle, 
  RefreshCw, 
  RotateCcw, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Package, 
  FlaskConical,
  ShieldCheck,
  UserCheck,
  Send
} from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function CreateSampleView({ navToSubView }) {
  const { masterData, engineers, addSample, triggerNotification } = useWorkflow();

  const generateSampleId = () => {
    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `SMP-${todayStr}-${randomNum}`;
  };

  const todayDate = new Date().toISOString().split('T')[0];

  // Form State
  const [sampleId, setSampleId] = useState(generateSampleId);
  const [isManualId, setIsManualId] = useState(false);
  const [product, setProduct] = useState('');
  const [applicant, setApplicant] = useState('');
  const [sampleType, setSampleType] = useState((masterData.sampleTypes && masterData.sampleTypes[0]) || 'Domestic Gas Stove');
  const [quantityNum, setQuantityNum] = useState('1');
  const [unit, setUnit] = useState('Pcs');
  const [dateReceived, setDateReceived] = useState(todayDate);
  const [priority, setPriority] = useState('Normal');
  const [condition, setCondition] = useState('Intact');
  const [storageLocation, setStorageLocation] = useState('Rack A-101');
  const [testingSection, setTestingSection] = useState('Mechanical');
  const [standard, setStandard] = useState((masterData.standards && masterData.standards[0]) || 'IS 4246 (2025)');
  
  // Dispatch Target State
  const [dispatchTarget, setDispatchTarget] = useState('SAMPLE_CELL');
  const [targetEngineer, setTargetEngineer] = useState((engineers && engineers[0]?.name) || 'Mariam Tyagi');

  const [remarks, setRemarks] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegenerateId = () => {
    setSampleId(generateSampleId());
    setIsManualId(false);
  };

  const handleReset = () => {
    setSampleId(generateSampleId());
    setIsManualId(false);
    setProduct('');
    setApplicant('');
    setSampleType((masterData.sampleTypes && masterData.sampleTypes[0]) || 'Domestic Gas Stove');
    setQuantityNum('1');
    setUnit('Pcs');
    setDateReceived(todayDate);
    setPriority('Normal');
    setCondition('Intact');
    setStorageLocation('Rack A-101');
    setTestingSection('Mechanical');
    setStandard((masterData.standards && masterData.standards[0]) || 'IS 4246 (2025)');
    setDispatchTarget('SAMPLE_CELL');
    setTargetEngineer((engineers && engineers[0]?.name) || 'Mariam Tyagi');
    setRemarks('');
    setFileName('');
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
      triggerNotification(`File attached: ${e.target.files[0].name}`, 'info');
    }
  };

  const handleRegisterSample = async (e, isDraft = false) => {
    if (e) e.preventDefault();

    if (!isDraft) {
      if (!product.trim()) return triggerNotification('Please enter a valid Product / Sample Name.', 'warning');
      if (!applicant.trim()) return triggerNotification('Please enter the Applicant / Client Name.', 'warning');
      if (!quantityNum || isNaN(Number(quantityNum)) || Number(quantityNum) <= 0) {
        return triggerNotification('Please enter a valid numeric Quantity greater than 0.', 'warning');
      }
    }

    try {
      setIsSubmitting(true);
      const formattedQty = `${Number(quantityNum).toFixed(3)} ${unit}`;
      const payloadId = sampleId.trim() || generateSampleId();

      let computedStatus = 'New Sample Received';
      let assignedEng = null;

      if (dispatchTarget === 'DIRECT_ENGINEER') {
        computedStatus = 'Samples Allocated';
        assignedEng = targetEngineer;
      } else if (dispatchTarget === 'DIRECT_TESTING') {
        computedStatus = 'Testing In Progress';
        assignedEng = targetEngineer;
      } else if (dispatchTarget === 'SAMPLE_CELL') {
        computedStatus = 'New Sample Received';
      } else if (dispatchTarget === 'TM_HUB') {
        computedStatus = 'New Sample Received';
      }

      await addSample({
        id: payloadId,
        product: product.trim() || 'Untitled Sample Batch',
        applicant: applicant.trim() || 'Walk-in Client',
        sampleType,
        quantity: formattedQty,
        dateReceived,
        priority,
        condition,
        storageLocation,
        testingSection,
        standard,
        assignedEngineer: assignedEng,
        allocationDate: assignedEng ? todayDate : null,
        testStartDate: dispatchTarget === 'DIRECT_TESTING' ? todayDate : null,
        remarks: remarks.trim() || 'Inwarded into system workflow pipeline.',
        type: isDraft ? 'Draft' : 'New',
        status: isDraft ? 'Draft' : computedStatus,
        documents: fileName ? [fileName] : ['Inward_Challan_Doc.pdf']
      });

      if (isDraft) {
        triggerNotification(`Sample ${payloadId} saved as Draft.`, 'info');
      } else {
        const destMsg = assignedEng ? `and allocated directly to ${assignedEng}` : 'and queued for workflow processing';
        triggerNotification(`Sample ${payloadId} registered ${destMsg}!`, 'success');
        if (navToSubView) {
          navToSubView(assignedEng ? 'Pending Samples' : 'Accept');
        }
      }

      handleReset();
    } catch (err) {
      triggerNotification(`Failed to register sample: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 pb-20 bg-[#edf3f9] text-slate-800 min-h-full font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base md:text-lg font-bold text-[#1e3a8a] tracking-tight uppercase flex items-center gap-2">
            <PlusCircle className="text-[#f59e0b]" size={20} />
            Universal Sample Inwarding & Registration
          </h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wide">
            Register new sample batches into NTB LIMS Registry with multi-role workflow routing
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            <RotateCcw size={14} /> Reset Form
          </button>
        </div>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={(e) => handleRegisterSample(e, false)} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-0">
        
        {/* Form Section 1: Identification & Basic Info */}
        <div className="p-5 md:p-6 border-b border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-[#1e3a8a] uppercase tracking-wider">
            <Package size={16} className="text-amber-500" />
            1. Sample Identification & Inward Metadata
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Sample ID with Override */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Sample ID (Tracking Code)</span>
                <span className="text-[9px] text-indigo-700 font-semibold">Auto-Generated</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={sampleId}
                  onChange={(e) => {
                    setSampleId(e.target.value);
                    setIsManualId(true);
                  }}
                  className={`w-full p-2.5 bg-slate-50 border rounded-lg font-black text-xs text-[#1e3a8a] focus:bg-white focus:outline-none ${
                    isManualId ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-300'
                  }`}
                  placeholder="SMP-20260915-0001"
                  required
                />
                <button
                  type="button"
                  onClick={handleRegenerateId}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-600 transition-colors cursor-pointer"
                  title="Regenerate tracking code"
                  aria-label="Regenerate sample ID"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Product / Sample Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                placeholder="e.g. Commercial Double Burner LPG Gas Stove Model X-50"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* Applicant / Client Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Applicant / Client Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={applicant}
                onChange={(e) => setApplicant(e.target.value)}
                placeholder="e.g. Apex Quality Appliances Ltd."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

          </div>
        </div>

        {/* Form Section 2: Technical Specifications & Quantities */}
        <div className="p-5 md:p-6 border-b border-slate-200 space-y-4 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs font-black text-[#1e3a8a] uppercase tracking-wider">
            <FlaskConical size={16} className="text-indigo-600" />
            2. Technical Parameters, Quantities & Storage
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
            
            {/* Sample Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Sample Type (Master Data) <span className="text-rose-500">*</span>
              </label>
              <select
                value={sampleType}
                onChange={(e) => setSampleType(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {(masterData.sampleTypes || []).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Quantity & Unit */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Quantity & Unit <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={quantityNum}
                  onChange={(e) => setQuantityNum(e.target.value)}
                  className="w-1/2 p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                  required
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-1/2 p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Pcs">Pcs</option>
                  <option value="Kg">Kg</option>
                  <option value="Liters">Liters</option>
                  <option value="Units">Units</option>
                  <option value="Rolls">Rolls</option>
                  <option value="Meters">Meters</option>
                  <option value="Set">Set</option>
                  <option value="Jar">Jar</option>
                </select>
              </div>
            </div>

            {/* Date Received */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Date Received
              </label>
              <input
                type="date"
                value={dateReceived}
                onChange={(e) => setDateReceived(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
                required
              />
            </div>

            {/* Storage Location */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Storage / Bay Location
              </label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="e.g. Shelf Rack B-104"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="Normal">Normal Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            {/* Condition Upon Receipt */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Condition Upon Receipt
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="Intact">Intact & Undamaged</option>
                <option value="Sealed">Sealed Factory Batch</option>
                <option value="Partial">Partial / Remnant Sample</option>
                <option value="Damaged">Damaged / Damaged Seal</option>
              </select>
            </div>

            {/* Testing Section */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Target Testing Section
              </label>
              <select
                value={testingSection}
                onChange={(e) => setTestingSection(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="Mechanical">Mechanical Section</option>
                <option value="Chemical">Chemical Section</option>
                <option value="Electrical">Electrical Section</option>
                <option value="Electronics">Electronics Section</option>
                <option value="Biological">Biological Section</option>
              </select>
            </div>

            {/* Standard Reference */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Indian Standard (IS Reference)
              </label>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                {(masterData.standards || []).map((std) => (
                  <option key={std} value={std}>{std}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Form Section 3: Workflow Target & Persona Dispatch */}
        <div className="p-5 md:p-6 border-b border-slate-200 space-y-4 bg-indigo-50/40">
          <div className="flex items-center gap-2 text-xs font-black text-[#1e3a8a] uppercase tracking-wider">
            <Send size={16} className="text-amber-500" />
            3. Workflow Target & Persona Dispatch (Multi-Role Integration)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Dispatch Target Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Initial Workflow Stage / Routing Queue <span className="text-rose-500">*</span>
              </label>
              <select
                value={dispatchTarget}
                onChange={(e) => setDispatchTarget(e.target.value)}
                className="w-full p-2.5 bg-white border border-indigo-300 rounded-lg text-xs font-extrabold text-[#1e3a8a] focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="SAMPLE_CELL">Sample Cell Inwarding Queue (Awaiting TR & Forward)</option>
                <option value="TM_HUB">Technical Manager Incoming Queue (New Sample Received)</option>
                <option value="DIRECT_ENGINEER">Direct Allocation to Technical Engineer (Allocated Queue)</option>
                <option value="DIRECT_TESTING">Direct Testing In Progress (Laboratory Testing Active)</option>
              </select>
              <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                {dispatchTarget === 'SAMPLE_CELL' && 'Queued for Sample Cell officer to generate Test Request and forward.'}
                {dispatchTarget === 'TM_HUB' && 'Appears directly under Technical Manager New Sample Received for allocation.'}
                {dispatchTarget === 'DIRECT_ENGINEER' && 'Directly assigned to specified engineer; appears in their Sample Receipt.'}
                {dispatchTarget === 'DIRECT_TESTING' && 'Marks sample active in lab testing under selected engineer.'}
              </span>
            </div>

            {/* Engineer Selection if Direct Engineer / Direct Testing */}
            {(dispatchTarget === 'DIRECT_ENGINEER' || dispatchTarget === 'DIRECT_TESTING') && (
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Assigned Technical Engineer <span className="text-rose-500">*</span>
                </label>
                <select
                  value={targetEngineer}
                  onChange={(e) => setTargetEngineer(e.target.value)}
                  className="w-full p-2.5 bg-white border border-amber-400 rounded-lg text-xs font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                >
                  {(engineers || []).map((eng) => (
                    <option key={eng.id} value={eng.name}>{eng.name} ({eng.section} Section - {eng.activeTasks} active tasks)</option>
                  ))}
                </select>
                <span className="text-[10px] text-emerald-700 font-bold block mt-1 flex items-center gap-1">
                  <UserCheck size={12} /> Will instantly appear under {targetEngineer}'s active work tasks!
                </span>
              </div>
            )}

          </div>
        </div>

        {/* Form Section 4: Remarks & Documentation Attachments */}
        <div className="p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-[#1e3a8a] uppercase tracking-wider">
            <FileText size={16} className="text-emerald-600" />
            4. Remarks & Supporting Documentation
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Remarks Textarea */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Initial Inspection Notes & Description
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Specify any visual observations, physical seals, or specific client instructions..."
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Attachment Upload */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Challan / Photo Attachment
              </label>
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-lg p-3 text-center bg-slate-50 transition-colors">
                <input
                  type="file"
                  id="sampleAttachment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label htmlFor="sampleAttachment" className="cursor-pointer flex flex-col items-center gap-1.5">
                  <Upload size={20} className="text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">
                    {fileName ? fileName : 'Upload Inward Challan / Photo'}
                  </span>
                  <span className="text-[10px] text-slate-400">PDF, PNG, JPG up to 10MB</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Sample will automatically route to chosen target persona workflow</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleRegisterSample(e, true)}
              className="w-1/2 sm:w-auto px-4 py-2.5 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-800 font-bold rounded-lg text-xs cursor-pointer transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 sm:w-auto px-6 py-2.5 bg-[#f59e0b] hover:bg-[#e09b2d] disabled:bg-amber-300 text-slate-950 font-black rounded-lg text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Register Sample</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
