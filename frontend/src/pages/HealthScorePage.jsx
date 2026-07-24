import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, ArrowUpRight, HeartPulse } from 'lucide-react';
import apiClient from '../api/client';

export const HealthScorePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/health-score')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-xs text-slate-500">Evaluating Financial Health Score...</div>;
  }

  const score = data?.score || 75;
  const tier = data?.tier || 'Good';

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">Financial Health Score</h2>
        <p className="text-xs text-slate-400 mt-1">Multi-factor 0–100 evaluation of your savings, emergency fund, budget discipline, and debt ratio.</p>
      </div>

      {/* Main Score Hero Card */}
      <div className="glass-panel rounded-3xl p-8 border border-[#232D42] text-center relative overflow-hidden bg-gradient-to-b from-[#151C2C] to-[#0B0F17]">
        <div className="w-40 h-40 rounded-full border-8 border-blue-500/20 border-t-blue-500 border-r-emerald-400 mx-auto flex items-center justify-center flex-col shadow-glow-blue mb-4">
          <span className="text-4xl font-extrabold font-display text-white">{score}</span>
          <span className="text-xs font-semibold text-slate-400">out of 100</span>
        </div>

        <h3 className="text-2xl font-bold font-display text-white mb-1">
          Rating Tier: <span style={{ color: data?.color || '#3B82F6' }}>{tier}</span>
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Your financial metrics indicate a {tier.toLowerCase()} financial structure with healthy savings discipline.
        </p>
      </div>

      {/* 6 Metrics Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-[#232D42]">
          <span className="text-xs text-slate-400 block mb-1">Savings Rate Score</span>
          <span className="text-xl font-bold text-white">{data?.metrics_breakdown?.savings_score} / 25 pts</span>
          <p className="text-[11px] text-emerald-400 mt-1">Savings Rate: {data?.metrics_breakdown?.savings_rate_percent}%</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[#232D42]">
          <span className="text-xs text-slate-400 block mb-1">Emergency Fund Score</span>
          <span className="text-xl font-bold text-white">{data?.metrics_breakdown?.emergency_score} / 20 pts</span>
          <p className="text-[11px] text-blue-400 mt-1">Covers {data?.metrics_breakdown?.emergency_fund_months} months expenses</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[#232D42]">
          <span className="text-xs text-slate-400 block mb-1">Budget Discipline</span>
          <span className="text-xl font-bold text-white">{data?.metrics_breakdown?.budget_discipline_score} / 20 pts</span>
          <p className="text-[11px] text-slate-400 mt-1">Adherence to set limits</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[#232D42]">
          <span className="text-xs text-slate-400 block mb-1">Debt & Overhead Ratio</span>
          <span className="text-xl font-bold text-white">{data?.metrics_breakdown?.debt_ratio_score} / 15 pts</span>
          <p className="text-[11px] text-slate-400 mt-1">Fixed overhead vs income ratio</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[#232D42]">
          <span className="text-xs text-slate-400 block mb-1">Income Stability</span>
          <span className="text-xl font-bold text-white">{data?.metrics_breakdown?.stability_score} / 10 pts</span>
          <p className="text-[11px] text-slate-400 mt-1">Consistency of monthly inflow</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-[#232D42]">
          <span className="text-xs text-slate-400 block mb-1">Investment Habit</span>
          <span className="text-xl font-bold text-white">{data?.metrics_breakdown?.investment_score} / 10 pts</span>
          <p className="text-[11px] text-emerald-400 mt-1">Active SIP & asset allocation</p>
        </div>
      </div>

      {/* Improvement Suggestions */}
      <div className="glass-panel rounded-3xl p-6 border border-[#232D42]">
        <div className="flex items-center gap-2 mb-4">
          <HeartPulse className="w-5 h-5 text-rose-400" />
          <h3 className="text-base font-bold text-white font-display">Actionable Score Improvement Plan</h3>
        </div>

        <div className="space-y-3">
          {data?.suggestions?.map((sug, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-[#0B0F17] border border-[#232D42] flex items-start gap-3 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{sug}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
