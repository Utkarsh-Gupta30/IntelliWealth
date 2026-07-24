import React, { useState, useEffect } from 'react';
import { BankConnectModal } from '../components/BankConnectModal';
import { CSVUploadModal } from '../components/CSVUploadModal';
import { Building2, RefreshCw, Upload, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import apiClient from '../api/client';

export const BankAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [showConnect, setShowConnect] = useState(false);
  const [showCSV, setShowCSV] = useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await apiClient.get('/bank/accounts');
      setAccounts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSync = async (id) => {
    setSyncingId(id);
    try {
      await apiClient.post(`/bank/sync/${id}`);
      fetchAccounts();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingId(null);
    }
  };

  const handleDisconnect = async (id) => {
    if (window.confirm('Disconnect this bank account?')) {
      try {
        await apiClient.delete(`/bank/disconnect/${id}`);
        fetchAccounts();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">Bank Accounts & Integrations</h2>
          <p className="text-xs text-slate-400 mt-1">Manage connected financial institutions, auto-sync schedules, and statement imports.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCSV(true)}
            className="px-4 py-2.5 rounded-xl bg-[#151C2C] border border-[#232D42] hover:border-blue-500/40 text-xs font-semibold text-slate-200 flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-emerald-400" /> Upload Statement CSV
          </button>
          <button 
            onClick={() => setShowConnect(true)}
            className="gradient-button px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Connect Bank Account
          </button>
        </div>
      </div>

      {/* Security Status Banner */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0" />
        <div>
          <p className="font-semibold text-white">256-Bit Financial Grade Encryption</p>
          <p className="text-[11px] text-slate-400">IntelliWealth uses read-only OAuth authentication tokens. We never store or access raw netbanking passwords.</p>
        </div>
      </div>

      {/* Connected Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-xs text-slate-500">Loading bank accounts...</p>
        ) : accounts.length === 0 ? (
          <div className="col-span-full glass-panel rounded-3xl p-8 text-center border border-[#232D42]">
            <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No Connected Bank Accounts</h3>
            <p className="text-xs text-slate-400 mb-4">Connect HDFC, ICICI, SBI or upload a statement CSV to enable auto transaction sync.</p>
            <button onClick={() => setShowConnect(true)} className="gradient-button px-6 py-2.5 rounded-xl text-xs font-semibold">
              Connect Your Bank
            </button>
          </div>
        ) : (
          accounts.map((acc) => (
            <div key={acc.id} className="glass-panel glass-panel-hover rounded-3xl p-6 border border-[#232D42] relative group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
                      🏦
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-display">{acc.bank_name}</h4>
                      <p className="text-[10px] text-slate-400">{acc.account_type} • {acc.account_number_mask}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
                </div>

                <div className="my-4">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Account Balance</span>
                  <span className="text-2xl font-bold font-display text-white">₹{acc.balance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#232D42] flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">
                  Last Synced: {new Date(acc.last_synced_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSync(acc.id)}
                    disabled={syncingId === acc.id}
                    className="px-3 py-1.5 rounded-xl bg-[#0B0F17] border border-[#232D42] text-slate-300 hover:text-white hover:border-blue-500/40 text-[11px] font-medium flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 text-blue-400 ${syncingId === acc.id ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                  <button
                    onClick={() => handleDisconnect(acc.id)}
                    className="p-1.5 rounded-xl bg-[#0B0F17] border border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BankConnectModal isOpen={showConnect} onClose={() => setShowConnect(false)} onRefresh={fetchAccounts} />
      <CSVUploadModal isOpen={showCSV} onClose={() => setShowCSV(false)} onRefresh={fetchAccounts} />
    </div>
  );
};
