import React, { useState } from 'react';
import { X, Target, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

export const GoalModal = ({ isOpen, onClose, onRefresh }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !targetAmount || !deadline) {
      setError('Please fill in title, target amount, and target deadline');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post('/goals', {
        title,
        category,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount) || 0.0,
        deadline: new Date(deadline).toISOString()
      });
      onRefresh();
      onClose();
    } catch (err) {
      setError('Failed to create financial goal');
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
          <Target className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white font-display">Create Financial Goal</h3>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Goal Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Emergency Fund, New Bike, House Downpayment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Emergency Fund">Emergency Fund</option>
                <option value="Vacation">Vacation</option>
                <option value="Car">Car / Vehicle</option>
                <option value="House">Home / Real Estate</option>
                <option value="Education">Education</option>
                <option value="Retirement">Retirement</option>
                <option value="General">General Savings</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Amount (₹) *</label>
              <input
                type="number"
                required
                placeholder="250000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Initial Saved (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Deadline *</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2 py-[9px] text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-button py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Goal...' : 'Create Goal & Calculate Monthly Target'}
          </button>
        </form>
      </div>
    </div>
  );
};
