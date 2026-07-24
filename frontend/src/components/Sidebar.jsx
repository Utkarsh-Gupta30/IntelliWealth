import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, CreditCard, ArrowLeftRight, PieChart, 
  Target, TrendingUp, Activity, Calculator, BookOpen, 
  MessageSquare, FileText, Settings, Building2, Sparkles
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { label: 'Bank Sync', path: '/bank-accounts', icon: Building2 },
    { label: 'Budget Planner', path: '/budget', icon: PieChart },
    { label: 'Analytics', path: '/analytics', icon: Activity },
    { label: 'Goal Planner', path: '/goals', icon: Target },
    { label: 'Spending Forecast', path: '/forecast', icon: TrendingUp },
    { label: 'Health Score', path: '/health-score', icon: Sparkles, badge: 'AI' },
    { label: 'EMI Calculator', path: '/emi-calculator', icon: Calculator },
    { label: 'Invest Education', path: '/education', icon: BookOpen },
    { label: 'AI Financial Chat', path: '/ai-chat', icon: MessageSquare, badge: 'Live' },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Settings', path: '/profile', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-[#232D42] bg-[#0B0F17] flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-[#232D42]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-0.5 shadow-glow-blue flex items-center justify-center">
          <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
        </div>
        <div>
          <h1 className="font-display font-bold text-base text-white tracking-wide leading-none">
            Intelli<span className="text-blue-500">Wealth</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">AI FinTech Agent</p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#151C2C]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-gradient-to-r from-blue-500 to-emerald-500 text-white uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="p-4 border-t border-[#232D42]">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/20 text-center">
          <p className="text-xs font-semibold text-white">AI Portfolio Protection</p>
          <p className="text-[10px] text-slate-400 mt-1">Real-time spend anomaly detection active</p>
        </div>
      </div>
    </aside>
  );
};
