import React, { useState } from 'react';
import { Database } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';

export default function AdminView() {
  const { engineers, oics, backendConnected } = useWorkflow();

  const [activeTab, setActiveTab] = useState('Personnel');

  const masterLists = {
    Personnel: [
      { name: 'Technical Managers', items: ['V. K. Jain (Head TM)', 'A. K. Sharma (TM)'] },
      { name: 'Reporting Managers', items: ['S. P. Yadav', 'Neha Chaudhry'] },
      { name: 'OICs (Officers in Charge)', items: oics.map(o => `${o.name} (${o.section})`) },
      { name: 'Technical Engineers', items: engineers.map(e => `${e.name} (${e.section})`) },
    ],
    Structure: [
      { name: 'Testing Sections', items: ['Mechanical', 'Chemical', 'Electrical', 'Electronics', 'Biological'] },
      { name: 'Laboratories', items: ['BIS Central Lab Ghaziabad', 'National Test House Northern Region', 'Regional Quality Assurance Lab'] },
      { name: 'Product Categories', items: ['Gas Appliances', 'Pressure Vessels', 'Pipes & Fittings', 'Electrical Wiring', 'Chemical Testing'] },
    ],
    Testing: [
      { name: 'Test Types', items: ['Pressure Test', 'Leakage & Valve Endurance', 'Flame Stability', 'Chemical Purity Trace', 'Tensile Strength'] },
      { name: 'Test Parameters', items: ['Hydrostatic Pressure (kg/cm²)', 'Flame Temperature (°C)', 'Gas Leakage Rate (cc/hr)', 'Material Thickness (mm)'] },
      { name: 'Standards Reference', items: ['IS 4246 (2025)', 'IS 2347 (2023)', 'IS 3025 (2021)', 'IS 156 (2022)'] },
      { name: 'Sample Types', items: ['Domestic Gas Stove', 'LPG Gas Regulator', 'Aluminium Cooker (5L)', 'Brass Valve Fitting'] }
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
            Master Data & Personnel Configuration Synchronized with NTB Admin Dashboard (PDF Section 15)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            backendConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}>
            {backendConnected ? 'Express REST API Synced' : 'Offline / Local Persistence'}
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {['Personnel', 'Structure', 'Testing'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
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
        {masterLists[activeTab].map((group) => (
          <div key={group.name} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">{group.name}</h3>
              <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Admin Managed
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
              {group.items.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <span>{item}</span>
                  <span className="text-[9px] text-emerald-700 font-bold">Active</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  );
}
