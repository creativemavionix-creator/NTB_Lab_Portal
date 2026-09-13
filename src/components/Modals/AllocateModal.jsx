import React, { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function AllocateModal({ sample, isOpen, onClose }) {
  const { engineers, sections, allocateSample } = useWorkflow();

  const [selectedSection, setSelectedSection] = useState('Mechanical');
  const [selectedEng, setSelectedEng] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');

  const filteredEngineers = engineers.filter(e => e.section === selectedSection);

  useEffect(() => {
    if (filteredEngineers.length > 0) {
      setSelectedEng(filteredEngineers[0].name);
    } else {
      setSelectedEng('');
    }
  }, [selectedSection]);

  useEffect(() => {
    if (sample) {
      setSelectedSection(sample.testingSection || 'Mechanical');
      setPriority(sample.priority || 'Medium');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      setDueDate(sample.dueDate || defaultDate.toISOString().split('T')[0]);
    }
  }, [sample]);

  if (!isOpen || !sample) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEng) return alert('Please select a Technical Engineer.');
    
    allocateSample(sample.id, selectedEng, selectedSection, dueDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-2">
            <UserCheck size={16} className="text-yellow-500" />
            Allocate Sample / Testing Task
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-medium text-slate-800 dark:text-slate-200">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Sample Metadata</span>
            <div className="mt-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-1 text-slate-700 dark:text-slate-300">
              <div><span className="font-bold text-slate-900 dark:text-slate-100">Code:</span> {sample.id}</div>
              <div><span className="font-bold text-slate-900 dark:text-slate-100">Product:</span> {sample.product}</div>
              <div><span className="font-bold text-slate-900 dark:text-slate-100">Standard:</span> {sample.standard}</div>
              <div><span className="font-bold text-slate-900 dark:text-slate-100">Tests:</span> {sample.requiredTests}</div>
            </div>
          </div>

          {/* Testing Section */}
          <div>
            <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Testing Section</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800"
            >
              {sections.map(sec => (
                <option key={sec} value={sec}>{sec} Section</option>
              ))}
            </select>
          </div>

          {/* Assigned Engineer */}
          <div>
            <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Technical Engineer</label>
            <select
              value={selectedEng}
              onChange={(e) => setSelectedEng(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800"
              required
            >
              {filteredEngineers.length > 0 ? (
                filteredEngineers.map(eng => (
                  <option key={eng.id} value={eng.name}>{eng.name}</option>
                ))
              ) : (
                <option value="">No Engineers in this section</option>
              )}
            </select>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-800 dark:text-slate-100 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white dark:bg-slate-800"
                required
              />
            </div>
          </div>

          {/* Actions */}
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
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-lg font-bold transition-colors shadow-2xs"
            >
              Confirm Allocation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
