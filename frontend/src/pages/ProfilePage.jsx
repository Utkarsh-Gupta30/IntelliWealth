import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, CheckCircle2, AlertCircle, Save } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [income, setIncome] = useState(user?.monthly_income || 75000);
  const [occupation, setOccupation] = useState(user?.occupation || 'Software Engineer');
  const [risk, setRisk] = useState(user?.risk_preference || 'Moderate');
  const [currency, setCurrency] = useState(user?.preferred_currency || 'INR');
  const [goals, setGoals] = useState(user?.financial_goals || 'Emergency Fund, Wealth Growth');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      await updateProfile({
        name,
        monthly_income: parseFloat(income),
        occupation,
        risk_preference: risk,
        preferred_currency: currency,
        financial_goals: goals
      });
      setSuccess('Financial Profile updated successfully!');
      setTimeout(() => setSuccess(''), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">Financial Profile & Settings</h2>
        <p className="text-xs text-slate-400 mt-1">Configure your monthly income, risk tolerance, goals, and base currency.</p>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 border border-[#232D42] space-y-4 text-xs">
        <div>
          <label className="block text-slate-400 font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Monthly Income (Base)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Occupation</label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Risk Preference</label>
            <select
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Conservative">Conservative</option>
              <option value="Moderate">Moderate</option>
              <option value="Aggressive">Aggressive</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Preferred Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 font-medium mb-1">Financial Goals Summary</label>
          <input
            type="text"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="gradient-button px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Profile Settings'}
        </button>
      </form>
    </div>
  );
};
