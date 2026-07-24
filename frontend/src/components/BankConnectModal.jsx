import React, { useState } from 'react';
import { X, Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/client';

const SUPPORTED_BANKS = [
  { name: 'HDFC Bank', logo: '🏦', color: 'from-blue-600 to-indigo-700' },
  { name: 'ICICI Bank', logo: '💳', color: 'from-amber-600 to-orange-700' },
  { name: 'State Bank of India (SBI)', logo: '🏛️', color: 'from-cyan-600 to-blue-700' },
  { name: 'Axis Bank', logo: '🏢', color: 'from-rose-600 to-pink-700' },
  { name: 'Chase Bank', logo: '🌐', color: 'from-sky-600 to-blue-800' }
];

export const BankConnectModal = ({ isOpen, onClose, onRefresh }) => {
  const [step, setStep] = useState(1); // 1: Choose Bank, 2: Auth, 3: Consent & Sync, 4: Success
  const [selectedBank, setSelectedBank] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async () => {
    if (!selectedBank) return;
    setLoading(true);
    try {
      await apiClient.post('/bank/connect', {
        bank_name: selectedBank.name,
        account_type: 'Savings Account',
        username: username || 'user_demo',
        password: password || 'pass_demo'
      });
      setStep(4);
      setTimeout(() => {
        onRefresh();
        onClose();
        reset();
      }, 1800);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedBank(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative border border-[#232D42]">
        <button onClick={() => { onClose(); reset(); }} className="absolute right-4 top-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {step === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white font-display">Connect Bank Account</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Select your financial institution for secure 256-bit encrypted automatic transaction sync.</p>

            <div className="space-y-2 mb-6">
              {SUPPORTED_BANKS.map((b) => (
                <button
                  key={b.name}
                  onClick={() => { setSelectedBank(b); setStep(2); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0B0F17] border border-[#232D42] hover:border-blue-500/50 hover:bg-[#151C2C] transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{b.logo}</span>
                    <span className="text-xs font-semibold text-white group-hover:text-blue-400">{b.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Auto-Sync</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{selectedBank.logo}</span>
              <h3 className="text-base font-bold text-white font-display">Authenticate with {selectedBank.name}</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Enter netbanking credentials. Your password is never stored.</p>

            <div className="space-y-3 text-xs mb-6">
              <div>
                <label className="block text-slate-400 mb-1">Customer ID / Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. 94820194"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">NetBanking Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="w-1/3 py-2.5 rounded-xl border border-[#232D42] text-xs text-slate-300">Back</button>
              <button onClick={() => setStep(3)} className="w-2/3 gradient-button py-2.5 rounded-xl text-xs font-semibold">Authenticate</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="text-center py-4">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-pulse" />
              <h3 className="text-base font-bold text-white mb-1">Grant Consent</h3>
              <p className="text-xs text-slate-400 mb-4">IntelliWealth requests read-only permission to sync transactions from {selectedBank.name}.</p>
            </div>

            <div className="bg-[#0B0F17] rounded-xl p-3 border border-[#232D42] text-[11px] text-slate-300 space-y-1.5 mb-6">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Read-Only Transaction Sync</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit Financial Encryption</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Disconnect Anytime</div>
            </div>

            <button 
              onClick={handleConnect} 
              disabled={loading}
              className="w-full gradient-button py-3 rounded-xl text-xs font-semibold"
            >
              {loading ? 'Connecting & Syncing...' : 'Grant Consent & Sync'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Bank Connected Successfully!</h3>
            <p className="text-xs text-slate-400 mt-1">Transactions auto-synced to dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};
