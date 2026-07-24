import React from 'react';
import { FileText, Download, FileSpreadsheet, Sparkles, CheckCircle2 } from 'lucide-react';

export const ReportsPage = () => {
  const handleDownloadPDF = () => {
    const token = localStorage.getItem('intelliwealth_token');
    window.open(`http://localhost:8000/api/v1/reports/pdf?token=${token}`, '_blank');
  };

  const handleDownloadCSV = () => {
    const token = localStorage.getItem('intelliwealth_token');
    window.open(`http://localhost:8000/api/v1/reports/csv?token=${token}`, '_blank');
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">Financial Reports & Exports</h2>
        <p className="text-xs text-slate-400 mt-1">Export comprehensive PDF executive summaries or raw CSV transaction ledgers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Executive Report */}
        <div className="glass-panel rounded-3xl p-6 border border-[#232D42] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-display">Executive PDF Summary Report</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Contains executive financial health score, category breakdown graphs, top recommendations, and recent transaction tables.
            </p>

            <div className="my-4 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Includes Health Score & Pillars</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> AI Spending Recommendations</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Professional ReportLab Layout</div>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="gradient-button w-full py-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
        </div>

        {/* CSV Raw Data Export */}
        <div className="glass-panel rounded-3xl p-6 border border-[#232D42] flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-display">Raw CSV Transaction Ledger</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Export all manual, bank-synced, and CSV imported transaction logs in standardized CSV format for tax accounting.
            </p>

            <div className="my-4 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Standard CSV Headers</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Category & Payment Method Tags</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Compatible with Excel & Tally</div>
            </div>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="w-full py-3 rounded-xl bg-[#151C2C] hover:bg-[#1C263B] border border-[#232D42] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Download CSV Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
