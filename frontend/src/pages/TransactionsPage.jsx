import React, { useState, useEffect } from 'react';
import { TransactionModal } from '../components/TransactionModal';
import { 
  Search, Filter, Plus, Edit2, Trash2, Sparkles, 
  ChevronLeft, ChevronRight, ArrowUpDown, Download 
} from 'lucide-react';
import apiClient from '../api/client';

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/transactions', {
        params: {
          search: search || undefined,
          category: category || undefined,
          type: type || undefined,
          sort_by: sortBy,
          order,
          page,
          limit: 20
        }
      });
      setTransactions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, category, type, sortBy, order, page]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await apiClient.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">Transactions Management</h2>
          <p className="text-xs text-slate-400 mt-1">View, search, filter, and edit all automated & manual ledger entries.</p>
        </div>
        <button 
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="gradient-button px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Add Transaction
        </button>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-[#232D42] flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search merchant or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F17] border border-[#232D42] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category & Type Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#0B0F17] border border-[#232D42] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {["Food", "Shopping", "Travel", "Bills", "Healthcare", "Entertainment", "Education", "Salary", "Investment", "Rent", "Fuel", "Insurance"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-[#0B0F17] border border-[#232D42] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Incomes Only</option>
          </select>

          <button
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 rounded-xl bg-[#0B0F17] border border-[#232D42] text-xs text-slate-300 flex items-center gap-1 hover:border-blue-500/40"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort: {order.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-3xl border border-[#232D42] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#232D42] text-slate-400 uppercase text-[10px] tracking-wider bg-[#151C2C]/50">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Merchant / Payee</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Source</th>
                <th className="p-4 font-semibold">Payment Method</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232D42]/60">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">Loading transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">No transactions match your query.</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#151C2C]/60 transition-colors">
                    <td className="p-4 text-slate-400">{t.date?.substring(0, 10)}</td>
                    <td className="p-4 font-medium text-white">
                      <div>{t.merchant}</div>
                      {t.notes && <div className="text-[10px] text-slate-500 truncate max-w-xs">{t.notes}</div>}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-medium inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-400" /> {t.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{t.source}</td>
                    <td className="p-4 text-slate-400">{t.payment_method}</td>
                    <td className={`p-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => { setEditItem(t); setShowModal(true); }}
                          className="p-1.5 rounded-lg bg-[#0B0F17] text-slate-400 hover:text-white hover:border-blue-500/40 border border-[#232D42]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded-lg bg-[#0B0F17] text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[#232D42] flex items-center justify-between text-xs text-slate-400">
          <span>Page {page}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-xl bg-[#0B0F17] border border-[#232D42] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={transactions.length < 20}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-xl bg-[#0B0F17] border border-[#232D42] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <TransactionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onRefresh={fetchTransactions} 
        initialData={editItem}
      />
    </div>
  );
};
