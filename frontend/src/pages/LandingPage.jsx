import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, LineChart, Brain, CheckCircle2 } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Header Nav */}
      <header className="h-20 px-8 border-b border-[#232D42] flex items-center justify-between backdrop-blur-md sticky top-0 z-50 bg-[#0B0F17]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-400 p-0.5 shadow-glow-blue flex items-center justify-center">
            <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <span className="font-display font-bold text-xl tracking-wide">Intelli<span className="text-blue-500">Wealth</span></span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-[#232D42] hover:bg-[#151C2C] transition-all">
            Sign In
          </Link>
          <Link to="/register" className="gradient-button px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/25">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 pt-20 pb-16 text-center relative overflow-hidden">
        {/* Glow backdrop blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-4 h-4" /> Next-Gen AI Financial Intelligence Platform
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold font-display leading-tight tracking-tight max-w-4xl mx-auto">
          Master Your Money with <span className="gradient-text">Autonomous AI Intelligence</span>
        </h1>

        <p className="mt-6 text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          IntelliWealth automatically categorizes transactions, forecasts future spending, scores your financial health, plans budgets, and provides tailored investment guidance.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/register" className="gradient-button px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-blue-500/30">
            Launch Platform Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="px-8 py-4 rounded-2xl font-bold text-sm bg-[#151C2C] border border-[#232D42] hover:border-blue-500/40 text-slate-200">
            Sign In to Account
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
          <div className="glass-panel glass-panel-hover p-6 rounded-3xl">
            <Brain className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-lg font-bold font-display text-white mb-2">Automated ML Categorization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Random Forest classifier combined with rule engines to automatically tag bank transactions instantly.</p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-3xl">
            <LineChart className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold font-display text-white mb-2">Time-Series Forecasts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Predict next month's spending and cash flow using machine learning linear regression algorithms.</p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-3xl">
            <Zap className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-lg font-bold font-display text-white mb-2">0–100 Financial Health Score</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Multi-pillar scoring system evaluating savings rate, emergency fund, and budget discipline in real time.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#232D42] py-8 text-center text-xs text-slate-500">
        <p>© 2026 IntelliWealth Platform. Built with React, FastAPI, SQLAlchemy & Scikit-Learn.</p>
      </footer>
    </div>
  );
};
