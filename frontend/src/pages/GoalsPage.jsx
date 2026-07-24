import React, { useState, useEffect } from 'react';
import { GoalModal } from '../components/GoalModal';
import { Target, Plus, Calendar, Sparkles, Trash2, CheckCircle2, DollarSign } from 'lucide-react';
import apiClient from '../api/client';

export const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await apiClient.get('/goals');
      setGoals(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddFunds = async (id) => {
    const amtStr = window.prompt('Enter amount to contribute to this goal (₹):', '5000');
    if (!amtStr) return;
    const amt = parseFloat(amtStr);
    if (amt > 0) {
      try {
        await apiClient.put(`/goals/${id}/add-funds?amount=${amt}`);
        fetchGoals();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this goal target?')) {
      try {
        await apiClient.delete(`/goals/${id}`);
        fetchGoals();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">Financial Goal Planner</h2>
          <p className="text-xs text-slate-400 mt-1">Track target completion dates, emergency reserves, and AI monthly savings recommendations.</p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="gradient-button px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Create Financial Goal
        </button>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-xs text-slate-500">Loading goals...</p>
        ) : goals.length === 0 ? (
          <div className="col-span-full glass-panel rounded-3xl p-8 text-center border border-[#232D42]">
            <Target className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No Financial Goals Created</h3>
            <p className="text-xs text-slate-400 mb-4">Set target goals like Emergency Fund, Vacation, Car, or Home purchase.</p>
            <button onClick={() => setShowModal(true)} className="gradient-button px-6 py-2.5 rounded-xl text-xs font-semibold">
              Create First Goal
            </button>
          </div>
        ) : (
          goals.map((g) => (
            <div key={g.id} className="glass-panel glass-panel-hover rounded-3xl p-6 border border-[#232D42] relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold">
                    {g.category}
                  </span>
                  <button onClick={() => handleDelete(g.id)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold font-display text-white mb-3">{g.title}</h3>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-bold font-display text-white">₹{g.current_amount.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400">Target: ₹{g.target_amount.toLocaleString('en-IN')}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-[#0B0F17] rounded-full overflow-hidden mb-3 border border-[#232D42]">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${g.progress_percentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4">
                  <span>{g.progress_percentage}% achieved</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Target: {g.expected_completion_date}</span>
                </div>

                {/* AI Monthly Savings Suggestion Box */}
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-slate-300 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="text-slate-400">AI Suggested Monthly Deposit:</span>
                    <strong className="text-blue-400 block font-bold">₹{g.suggested_monthly_savings.toLocaleString('en-IN')} / month</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAddFunds(g.id)}
                className="w-full py-2.5 rounded-xl bg-[#0B0F17] hover:bg-[#151C2C] border border-[#232D42] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" /> Add Funds to Goal
              </button>
            </div>
          ))
        )}
      </div>

      <GoalModal isOpen={showModal} onClose={() => setShowModal(false)} onRefresh={fetchGoals} />
    </div>
  );
};
