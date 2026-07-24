import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, Brain, ShieldAlert, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/client';

export const ForecastPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/forecast')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-xs text-slate-500">Calculating Machine Learning Forecasts...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">AI Spending & Cash Flow Forecast</h2>
        <p className="text-xs text-slate-400 mt-1">Predictive machine learning analytics using Linear Regression time-series modeling.</p>
      </div>

      {/* Model Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-[#232D42]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Predicted Next Month Spend</span>
          <span className="text-3xl font-bold font-display text-white">₹{data?.predicted_next_month_spending?.toLocaleString('en-IN')}</span>
          <div className="mt-2 text-xs text-blue-400 font-medium flex items-center gap-1">
            <Brain className="w-3.5 h-3.5" /> Linear Regression Model ({(data?.confidence_score * 100).toFixed(0)}% Confidence)
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-[#232D42]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Predicted Surplus Savings</span>
          <span className="text-3xl font-bold font-display text-emerald-400">₹{data?.predicted_next_month_savings?.toLocaleString('en-IN')}</span>
          <div className="mt-2 text-xs text-slate-400">Net after projected overheads</div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-[#232D42]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Cash Flow Health Status</span>
          <span className="text-2xl font-bold font-display text-blue-400">{data?.cash_flow_forecast}</span>
          <div className="mt-2 text-xs text-slate-400">Trend Direction: <strong className="capitalize text-white">{data?.trend_direction}</strong></div>
        </div>
      </div>

      {/* Category Wise Forecast Table */}
      <div className="glass-panel rounded-3xl p-6 border border-[#232D42]">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white font-display">Category-wise Forecast Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.category_forecasts?.map((cat) => (
            <div key={cat.category} className="p-4 rounded-2xl bg-[#0B0F17] border border-[#232D42] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">{cat.category}</h4>
                <p className="text-[10px] text-slate-400">Projected budget demand</p>
              </div>
              <span className="text-sm font-bold font-display text-blue-400">₹{cat.predicted_amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
