import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

export const CSVUploadModal = ({ isOpen, onClose, onRefresh }) => {
  const [file, setFile] = useState(null);
  const [bankName, setBankName] = useState('Statement Import');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV statement file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bank_name', bankName);

    try {
      const res = await apiClient.post('/bank/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message);
      setTimeout(() => {
        onRefresh();
        onClose();
        setFile(null);
        setMessage('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error parsing CSV statement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative border border-[#232D42]">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white font-display">Upload Bank CSV Statement</h3>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Source Bank / Label</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="border-2 border-dashed border-[#232D42] hover:border-blue-500/50 rounded-2xl p-6 text-center bg-[#0B0F17]/50 relative transition-all">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <UploadCloud className="w-10 h-10 text-blue-400 mx-auto mb-2" />
            <p className="font-semibold text-white">{file ? file.name : 'Click or Drag CSV file here'}</p>
            <p className="text-[11px] text-slate-400 mt-1">Supports HDFC, ICICI, SBI, Chase & Custom CSV formats</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-button py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {loading ? 'Parsing & Categorizing...' : 'Import CSV Transactions'}
          </button>
        </form>
      </div>
    </div>
  );
};
