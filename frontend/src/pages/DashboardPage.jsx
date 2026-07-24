import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { TransactionModal } from '../components/TransactionModal';
import { BankConnectModal } from '../components/BankConnectModal';
import { CSVUploadModal } from '../components/CSVUploadModal';
import { 
  TrendingUp, TrendingDown, Wallet, PiggyBank, Plus, 
  Building2, Upload, ArrowUpRight, ArrowDownRight, Sparkles 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import apiClient from '../api/client';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddTx, setShowAddTx] = useState(false);
  const [showBankConnect, setShowBankConnect] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await apiClient.get('/dashboard/summary');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-[#151C2C] rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[#151C2C] rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">
            Welcome back, <span className="gradient-text">{data?.user_name || 'User'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Here is your automated financial intelligence overview for this month.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowCSVUpload(true)}
            className="px-4 py-2.5 rounded-xl bg-[#151C2C] border border-[#232D42] hover:border-blue-500/40 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4 text-emerald-400" /> Import CSV
          </button>
          <button 
            onClick={() => setShowBankConnect(true)}
            className="px-4 py-2.5 rounded-xl bg-[#151C2C] border border-[#232D42] hover:border-blue-500/40 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-all"
          >
            <Building2 className="w-4 h-4 text-blue-400" /> Connect Bank
          </button>
          <button 
            onClick={() => setShowAddTx(true)}
            className="gradient-button px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Monthly Income" 
          value={data?.total_income || 0} 
          change="+8.4%" 
          isPositive={true} 
          icon={TrendingUp}
          subtext="Salary + Secondary Incomes"
        />
        <StatCard 
          title="Total Monthly Expense" 
          value={data?.total_expense || 0} 
          change="-3.2%" 
          isPositive={true} 
          icon={TrendingDown}
          subtext="Automated transaction tracking"
        />
        <StatCard 
          title="Net Monthly Savings" 
          value={data?.savings || 0} 
          change={`${data?.savings_rate_percent || 0}% rate`} 
          isPositive={true} 
          icon={PiggyBank}
          subtext="Allocated towards financial goals"
        />
        <StatCard 
          title="Total Bank Balance" 
          value={data?.current_balance || 0} 
          icon={Wallet}
          subtext="Connected bank accounts sum"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Cash Flow Trend Area Chart */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-[#232D42]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Monthly Cash Flow Trend</h3>
              <p className="text-[11px] text-slate-400">Income vs Expenses over recent months</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-medium">
              6 Months View
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthly_trend || []}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151C2C', borderColor: '#232D42', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Distribution Pie Chart */}
        <div className="glass-panel rounded-3xl p-6 border border-[#232D42] flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-display mb-1">Expense Breakdown</h3>
            <p className="text-[11px] text-slate-400 mb-4">Category distribution for this period</p>
          </div>

          <div className="h-60 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.category_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="amount"
                  nameKey="category"
                >
                  {(data?.category_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151C2C', borderColor: '#232D42', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#232D42]">
            {(data?.category_distribution || []).slice(0, 4).map((c, i) => (
              <div key={c.category} className="flex items-center gap-1.5 text-[11px]">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <span className="text-slate-400 truncate">{c.category}</span>
                <span className="font-semibold text-white ml-auto">₹{(c.amount / 1000).toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-panel rounded-3xl p-6 border border-[#232D42]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Recent Transactions</h3>
            <p className="text-[11px] text-slate-400">Latest activity from your bank & manual entries</p>
          </div>
          <a href="/transactions" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
            View All Transactions <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#232D42] text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Merchant / Payee</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232D42]/60">
              {data?.recent_transactions?.map((t) => (
                <tr key={t.id} className="hover:bg-[#151C2C]/50 transition-colors">
                  <td className="py-3 text-slate-400">{t.date}</td>
                  <td className="py-3 font-medium text-white">{t.merchant}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-medium">
                      {t.category}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{t.payment_method}</td>
                  <td className={`py-3 text-right font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <TransactionModal isOpen={showAddTx} onClose={() => setShowAddTx(false)} onRefresh={fetchSummary} />
      <BankConnectModal isOpen={showBankConnect} onClose={() => setShowBankConnect(false)} onRefresh={fetchSummary} />
      <CSVUploadModal isOpen={showCSVUpload} onClose={() => setShowCSVUpload(false)} onRefresh={fetchSummary} />
    </div>
  );
};
