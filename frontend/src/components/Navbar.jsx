import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, Search, User, LogOut, Sparkles, 
  ShieldCheck, Wallet, ChevronDown, CheckCircle2, AlertTriangle
} from 'lucide-react';
import apiClient from '../api/client';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await apiClient.put('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="h-16 border-b border-[#232D42] bg-[#0B0F17]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      <div className="relative w-72 hidden md:block">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search transactions, insights..." 
          className="w-full bg-[#151C2C] border border-[#232D42] rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      {/* User Actions & Notifications */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Currency Pill */}
        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5" />
          <span>{user?.preferred_currency || 'INR'} (₹)</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-[#151C2C] border border-[#232D42] text-slate-300 hover:text-white hover:border-blue-500/40 relative transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl p-4 shadow-2xl z-50 border border-[#232D42]">
              <div className="flex items-center justify-between pb-3 border-b border-[#232D42]">
                <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Notifications
                </h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto mt-2 space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-2.5 rounded-xl border text-xs transition-all ${
                        n.is_read ? 'bg-[#151C2C]/50 border-transparent text-slate-400' : 'bg-blue-500/10 border-blue-500/30 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-medium mb-1 text-white">
                        {n.type === 'warning' ? <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {n.title}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl bg-[#151C2C] border border-[#232D42] hover:border-blue-500/40 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="text-left hidden sm:block pr-1">
              <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400">{user?.occupation || 'Member'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl p-2 shadow-2xl z-50 border border-[#232D42]">
              <div className="px-3 py-2 border-b border-[#232D42]">
                <p className="text-xs font-medium text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <a 
                href="/profile" 
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-[#1E293B] hover:text-white flex items-center gap-2 mt-1"
              >
                <User className="w-3.5 h-3.5 text-blue-400" /> Financial Profile
              </a>
              <button 
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
