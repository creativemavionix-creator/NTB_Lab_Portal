import React, { useState } from 'react';
import { Layers, FileSpreadsheet, Printer } from 'lucide-react';
import { useWorkflow } from '../../context/WorkflowContext';
import EmptyState from '../EmptyState';

export default function SeriesView({ subView }) {
  const { series, triggerNotification } = useWorkflow();
  const activeSubViewName = subView || 'Pending Requests';

  const [searchQuery, setSearchQuery] = useState('');

  const getFilteredSeries = () => {
    let list = [...series];
    if (activeSubViewName === 'Pending Requests') {
      list = list.filter(s => s.status === 'Pending Requests' || s.pendingReports > 0);
    } else if (activeSubViewName === 'Pending Reports') {
      list = list.filter(s => s.status === 'Pending Reports' || (s.completedReports > 0 && s.pendingReports > 0));
    } else if (activeSubViewName === 'Final Reports') {
      list = list.filter(s => s.status === 'Final Reports' || s.pendingReports === 0);
    }

    if (searchQuery) {
      list = list.filter(s => 
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.applicant.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return list;
  };

  const filteredSeriesList = getFilteredSeries();

  const handleExportCSV = () => {
    if (filteredSeriesList.length === 0) {
      return triggerNotification('No series records available to export.', 'warning');
    }

    const headers = ['Series ID', 'Product', 'Applicant', 'Request Date', 'Total Samples', 'Completed Reports', 'Pending Reports', 'Status'];
    const rows = filteredSeriesList.map(s => [
      s.id,
      `"${s.product}"`,
      `"${s.applicant}"`,
      s.requestDate,
      s.sampleCount,
      s.completedReports,
      s.pendingReports,
      s.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NTB_Series_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification(`Exported ${filteredSeriesList.length} series records to CSV`, 'success');
  };

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 pb-20 bg-[#edf3f9] text-slate-800 min-h-full font-sans">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 bg-[#1e293b] text-[#f59e0b] rounded-lg shadow-2xs shrink-0">
            <Layers size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm md:text-base font-extrabold text-[#1e3a8a] uppercase tracking-tight truncate">
              SERIES MANAGEMENT MODULE - {activeSubViewName.toUpperCase()}
            </h2>
            <p className="text-[11px] text-slate-500 font-semibold truncate">
              Tracking multi-sample series batches, cumulative testing progress, and series certificates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <FileSpreadsheet size={13} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer shrink-0"
            title="Print Series View"
          >
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs flex items-center gap-3 text-xs min-w-0">
        <span className="font-bold text-slate-600 uppercase text-[10px] shrink-0">Filter Series:</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Series ID, Product name, or Applicant..."
          className="flex-1 min-w-0 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded font-medium focus:outline-none text-slate-900"
        />
      </div>

      {/* Series Grid Table */}
      {filteredSeriesList.length === 0 ? (
        <EmptyState title="No Series Batches Found" message={`No series records found for ${activeSubViewName}.`} />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1e293b] text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  {activeSubViewName === 'Pending Requests' ? (
                    <>
                      <th className="p-3">Series ID</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Applicant</th>
                      <th className="p-3">Request Date</th>
                      <th className="p-3 text-center">Number of Samples</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </>
                  ) : activeSubViewName === 'Pending Reports' ? (
                    <>
                      <th className="p-3">Series ID</th>
                      <th className="p-3 text-center">Total Samples</th>
                      <th className="p-3 text-center">Completed Reports</th>
                      <th className="p-3 text-center">Pending Reports</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </>
                  ) : (
                    <>
                      <th className="p-3">Series ID</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Applicant</th>
                      <th className="p-3">Report Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredSeriesList.map((ser) => (
                  <tr key={ser.id} className="hover:bg-slate-50/80 transition-colors">
                    {activeSubViewName === 'Pending Requests' ? (
                      <>
                        <td className="p-3 font-extrabold text-[#1e3a8a]">{ser.id}</td>
                        <td className="p-3 font-bold text-slate-900">{ser.product}</td>
                        <td className="p-3 text-slate-700">{ser.applicant}</td>
                        <td className="p-3 text-slate-600">{ser.requestDate}</td>
                        <td className="p-3 text-center font-bold text-slate-800">{ser.sampleCount} Samples</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                            {ser.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => triggerNotification(`Processing Series Batch ${ser.id}`, 'success')}
                            className="bg-[#f5b041] hover:bg-[#e09b2d] text-slate-950 px-3 py-1 rounded font-black text-xs shadow-2xs transition-colors cursor-pointer uppercase tracking-wider"
                          >
                            Process Series
                          </button>
                        </td>
                      </>
                    ) : activeSubViewName === 'Pending Reports' ? (
                      <>
                        <td className="p-3 font-extrabold text-[#1e3a8a]">{ser.id}</td>
                        <td className="p-3 text-center font-bold text-slate-800">{ser.sampleCount}</td>
                        <td className="p-3 text-center font-bold text-emerald-700">{ser.completedReports}</td>
                        <td className="p-3 text-center font-bold text-amber-700">{ser.pendingReports}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300 uppercase">
                            {ser.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => triggerNotification(`Viewing progress for Series ${ser.id}`, 'info')}
                            className="bg-[#1e3a8a] hover:bg-blue-800 text-white px-3 py-1 rounded font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                          >
                            View Progress
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 font-extrabold text-[#1e3a8a]">{ser.id}</td>
                        <td className="p-3 font-bold text-slate-900">{ser.product}</td>
                        <td className="p-3 text-slate-700">{ser.applicant}</td>
                        <td className="p-3 text-slate-600">{ser.requestDate}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase">
                            FINAL_RECEIVED
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => triggerNotification(`Downloading Series PDF for ${ser.id}`, 'success')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded font-bold text-xs shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <FileSpreadsheet size={12} />
                            <span>Download Series PDF</span>
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
