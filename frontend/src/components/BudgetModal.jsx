import React, { useState } from 'react';
import { X, PieChart, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

const CATEGORIES = [
  "Overall", "Food", "Shopping", "Travel", "Bills", "Healthcare", 
  "Entertainment", "Education", "Rent", "Fuel", "Insurance", "Miscellaneous"
];

export const BudgetModal = ({ isOpen, onClose, onRefresh }) => {
  const [category, setCategory] = useState('Overall');
  const [limitAmount, setLimitAmount] = useState('');
  const [period, setPeriod] = useState('Monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!limitAmount) {
      setError('Please set a budget limit amount');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/budgets', {
        category,
        limit_amount: parseFloat(limitAmount),
        period
      });
      onRefresh();
      onClose();
    } catch (err) {
      setError('Failed to save budget limit');
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
          <PieChart className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white font-display">Create Budget Limit</h3>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Target Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Budget Limit (₹) *</label>
            <input
              type="number"
              required
              placeholder="e.g. 15000"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Time Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Monthly">Monthly Budget</option>
              <option value="Weekly">Weekly Budget</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-button py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {loading ? 'Saving Budget...' : 'Set Budget Limit'}
          </button>
        </form>
      </div>
    </div>
  );
};
