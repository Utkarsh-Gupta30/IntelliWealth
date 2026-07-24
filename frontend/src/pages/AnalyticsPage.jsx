import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, ShoppingBag, Calendar, AlertCircle, 
  Lightbulb, CheckCircle2, ShieldAlert, Award 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell 
} from 'recharts';
import apiClient from '../api/client';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/analytics/details')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-xs text-slate-500">Generating ML Analytics...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">Expense Analytics & Intelligence</h2>
        <p className="text-xs text-slate-400 mt-1">Deep-dive category breakdown, weekend spending spikes, top merchants, and recurring costs.</p>
      </div>

      {/* AI Financial Insights Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-blue-500/30 relative overflow-hidden bg-gradient-to-r from-blue-900/20 to-indigo-900/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white font-display">Automated AI Spending Insights</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Observed Patterns:</h4>
            {data?.insights?.map((ins, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-[#0B0F17]/50 p-2.5 rounded-xl border border-[#232D42]">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{ins}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">AI Saving Action Plan:</h4>
            {data?.recommendations?.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-[#0B0F17]/50 p-2.5 rounded-xl border border-[#232D42]">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#232D42] flex items-center justify-between text-xs">
          <span className="text-slate-400">Potential Monthly Savings Identified:</span>
          <span className="text-base font-bold font-display text-emerald-400">₹{data?.potential_monthly_savings?.toLocaleString('en-IN')} / month</span>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Spending Distribution */}
        <div className="glass-panel rounded-3xl p-6 border border-[#232D42]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Weekly Spending Pattern</h3>
              <p className="text-[11px] text-slate-400">Day-of-week expense distribution</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
              Weekend: {data?.weekend_spending_percent}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.weekly_spending || []}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#151C2C', borderColor: '#232D42', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                  {(data?.weekly_spending || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.day === 'Saturday' || entry.day === 'Sunday' ? '#F59E0B' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Merchants Leaderboard */}
        <div className="glass-panel rounded-3xl p-6 border border-[#232D42]">
          <h3 className="text-sm font-bold text-white font-display mb-1">Top Merchant Spending</h3>
          <p className="text-[11px] text-slate-400 mb-4">Highest cumulative transaction payees</p>

          <div className="space-y-3">
            {data?.top_merchants?.map((m, idx) => (
              <div key={m.merchant} className="flex items-center justify-between p-3 rounded-2xl bg-[#0B0F17] border border-[#232D42]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-xs text-blue-400">
                    #{idx + 1}
                  </div>
                  <span className="text-xs font-semibold text-white">{m.merchant}</span>
                </div>
                <span className="text-xs font-bold font-display text-slate-200">₹{m.total_spent.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recurring Subscriptions Detector */}
      <div className="glass-panel rounded-3xl p-6 border border-[#232D42]">
        <h3 className="text-sm font-bold text-white font-display mb-1">Detected Recurring Subscriptions</h3>
        <p className="text-[11px] text-slate-400 mb-4">Auto-detected recurring membership & billing schedules</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.recurring_expenses?.length === 0 ? (
            <p className="text-xs text-slate-500 col-span-full">No recurring subscription anomalies detected.</p>
          ) : (
            data?.recurring_expenses?.map((sub) => (
              <div key={sub.merchant} className="p-4 rounded-2xl bg-[#0B0F17] border border-[#232D42] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{sub.merchant}</h4>
                  <p className="text-[10px] text-slate-400">Frequency: {sub.frequency} charges</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-400">₹{sub.average_amount.toLocaleString('en-IN')}</span>
                  <span className="block text-[9px] text-slate-500">avg / billing</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
