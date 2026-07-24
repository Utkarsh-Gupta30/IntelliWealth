import React, { useState, useEffect } from 'react';
import { BudgetModal } from '../components/BudgetModal';
import { PieChart, Plus, AlertTriangle, CheckCircle2, Trash2, Sparkles } from 'lucide-react';
import apiClient from '../api/client';

export const BudgetPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchBudgets = async () => {
    try {
      const res = await apiClient.get('/budgets');
      setBudgets(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this budget limit?')) {
      try {
        await apiClient.delete(`/budgets/${id}`);
        fetchBudgets();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">Budget Planner & Thresholds</h2>
          <p className="text-xs text-slate-400 mt-1">Set monthly and category spending limits with real-time overspending alerts.</p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="gradient-button px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Create Budget Limit
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-xs text-slate-500">Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <div className="col-span-full glass-panel rounded-3xl p-8 text-center border border-[#232D42]">
            <PieChart className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">No Active Budgets</h3>
            <p className="text-xs text-slate-400 mb-4">Set limits on Food, Shopping, or Overall Monthly spend to prevent overspending.</p>
            <button onClick={() => setShowModal(true)} className="gradient-button px-6 py-2.5 rounded-xl text-xs font-semibold">
              Create Your First Budget
            </button>
          </div>
        ) : (
          budgets.map((b) => {
            const isOver = b.percentage_used >= 100;
            const isWarn = b.percentage_used >= 80 && !isOver;

            return (
              <div key={b.id} className="glass-panel glass-panel-hover rounded-3xl p-6 border border-[#232D42] relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white font-display">{b.category} Budget</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isOver 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse' 
                        : (isWarn ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30')
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xl font-bold font-display text-white">₹{b.spent_amount.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-400">Limit: ₹{b.limit_amount.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-[#0B0F17] rounded-full overflow-hidden mb-3 border border-[#232D42]">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver ? 'bg-rose-500' : (isWarn ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-emerald-400')
                      }`}
                      style={{ width: `${Math.min(100, b.percentage_used)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4">
                    <span>{b.percentage_used}% used</span>
                    <span>Remaining: <strong className={b.remaining_amount < 0 ? 'text-rose-400' : 'text-emerald-400'}>₹{b.remaining_amount.toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#232D42] flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{b.period} Cycle</span>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-xl bg-[#0B0F17] text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BudgetModal isOpen={showModal} onClose={() => setShowModal(false)} onRefresh={fetchBudgets} />
    </div>
  );
};
