import React, { useState } from 'react';
import { Database, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function AdminView() {
  const { engineers, oics, masterData, addMasterItem, deleteMasterItem, backendConnected } = useWorkflow();

  const [activeTab, setActiveTab] = useState('Personnel');
  const [inputValues, setInputValues] = useState({});

  const handleInputChange = (categoryKey, val) => {
    setInputValues(prev => ({ ...prev, [categoryKey]: val }));
  };

  const handleAddItem = (categoryKey, e) => {
    e.preventDefault();
    const val = inputValues[categoryKey];
    if (val && val.trim()) {
      addMasterItem(categoryKey, val);
      setInputValues(prev => ({ ...prev, [categoryKey]: '' }));
    }
  };

  const masterGroups = {
    Personnel: [
      { name: 'Technical Managers', key: null, items: ['V. K. Jain (Head TM)', 'A. K. Sharma (TM)'] },
      { name: 'Reporting Managers', key: null, items: ['S. P. Yadav', 'Neha Chaudhry'] },
      { name: 'OICs (Officers in Charge)', key: null, items: oics.map(o => `${o.name} (${o.section})`) },
      { name: 'Technical Engineers', key: null, items: engineers.map(e => `${e.name} (${e.section}) - ${e.activeTasks} active tasks`) },
    ],
    Structure: [
      { name: 'Laboratories', key: 'laboratories', items: masterData.laboratories || [] },
      { name: 'Testing Sections', key: null, items: ['Mechanical', 'Chemical', 'Electrical', 'Electronics', 'Biological'] },
      { name: 'Product Categories', key: null, items: ['Gas Appliances', 'Pressure Vessels', 'Pipes & Fittings', 'Electrical Wiring', 'Chemical Testing'] },
    ],
    Testing: [
      { name: 'Standards Reference', key: 'standards', items: masterData.standards || [] },
      { name: 'Sample Types', key: 'sampleTypes', items: masterData.sampleTypes || [] },
      { name: 'Test Types', key: 'testTypes', items: masterData.testTypes || [] },
      { name: 'Test Parameters', key: 'testParameters', items: masterData.testParameters || [] },
    ]
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 pb-20 bg-[#edf3f9] text-slate-800 min-h-full font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base md:text-lg font-bold text-[#1e3a8a] tracking-tight uppercase flex items-center gap-2">
            <Database className="text-rose-500" size={20} />
            NTB Admin Master Connection
          </h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wide">
            Master Data & Personnel Configuration Synchronized with NTB Central Registry
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            backendConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}>
            {backendConnected ? 'Express REST API Synced' : 'Offline / Local Storage Persisted'}
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 gap-2" role="tablist" aria-label="Admin master records tabs">
        {['Personnel', 'Structure', 'Testing'].map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-label={`${tab} Master Records`}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
              activeTab === tab 
                ? 'border-[#1e3a8a] text-[#1e3a8a]' 
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab} Master Records
          </button>
        ))}
      </div>

      {/* Master Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {masterGroups[activeTab].map((group) => (
          <div key={group.name} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{group.name}</h3>
              <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {group.key ? 'Live State Editable' : 'System Fixed'}
              </span>
            </div>

            {/* List of items */}
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium max-h-60 overflow-y-auto pr-1">
              {group.items.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                  <span className="truncate pr-2">{item}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle size={10} /> Active
                    </span>
                    {group.key && (
                      <button
                        type="button"
                        onClick={() => deleteMasterItem(group.key, item)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded focus-visible:ring-1 focus-visible:ring-rose-500 focus-visible:outline-none transition-colors cursor-pointer"
                        title={`Delete ${item}`}
                        aria-label={`Delete ${item}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Add New Item Form if editable */}
            {group.key && (
              <form onSubmit={(e) => handleAddItem(group.key, e)} className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder={`Add new ${group.name.toLowerCase()}...`}
                  value={inputValues[group.key] || ''}
                  onChange={(e) => handleInputChange(group.key, e.target.value)}
                  className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#1e3a8a] hover:bg-[#1e293b] text-white font-bold rounded text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  <Plus size={14} /> Add
                </button>
              </form>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
