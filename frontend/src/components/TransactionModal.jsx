import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import apiClient from '../api/client';

const CATEGORIES = [
  "Food", "Shopping", "Travel", "Bills", "Healthcare", 
  "Entertainment", "Education", "Salary", "Investment", 
  "Rent", "Fuel", "Insurance", "Miscellaneous"
];

export const TransactionModal = ({ isOpen, onClose, onRefresh, initialData = null }) => {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setMerchant(initialData.merchant || '');
      setAmount(initialData.amount || '');
      setType(initialData.type || 'expense');
      setCategory(initialData.category || '');
      setPaymentMethod(initialData.payment_method || 'UPI');
      setNotes(initialData.notes || '');
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setMerchant('');
    setAmount('');
    setType('expense');
    setCategory('');
    setPaymentMethod('UPI');
    setNotes('');
    setAiConfidence(null);
    setError('');
  };

  // Real-time AI Categorization Trigger on Merchant Change
  const handleMerchantChange = async (e) => {
    const val = e.target.value;
    setMerchant(val);
    if (val.length >= 3 && !initialData) {
      setAiSuggesting(true);
      try {
        const res = await apiClient.post('/transactions/auto-categorize', {
          merchant: val,
          amount: parseFloat(amount) || 100,
          notes
        });
        setCategory(res.data.category);
        setAiConfidence({
          category: res.data.category,
          confidence: res.data.confidence,
          method: res.data.method_used
        });
      } catch (err) {
        console.error(err);
      } finally {
        setAiSuggesting(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!merchant || !amount) {
      setError('Please provide merchant name and amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        merchant,
        amount: parseFloat(amount),
        type,
        category: category || 'Miscellaneous',
        payment_method: paymentMethod,
        notes,
        source: 'Manual'
      };

      if (initialData?.id) {
        await apiClient.put(`/transactions/${initialData.id}`, payload);
      } else {
        await apiClient.post('/transactions', payload);
      }

      onRefresh();
      onClose();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative border border-[#232D42] shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E293B]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-white font-display">
            {initialData ? 'Edit Transaction' : 'Add New Transaction'}
          </h3>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0F17] rounded-xl border border-[#232D42]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 rounded-lg font-semibold transition-all ${
                type === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 rounded-lg font-semibold transition-all ${
                type === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Merchant Input */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Merchant / Payee Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Zomato, Uber, Amazon, Salary"
              value={merchant}
              onChange={handleMerchantChange}
              className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Amount & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="UPI">UPI / GPay</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Category with AI Badge */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-400 font-medium">Category</label>
              {aiConfidence && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" /> Auto-categorized via {aiConfidence.method} ({Math.round(aiConfidence.confidence * 100)}%)
                </span>
              )}
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Category...</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Notes (Optional)</label>
            <textarea
              rows="2"
              placeholder="Add additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl px-3.5 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-button py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              {loading ? 'Saving...' : (initialData ? 'Update Transaction' : 'Save Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
