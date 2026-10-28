import React, { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
    Plus,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

interface AppHeaderProps {
  onOpenMobileSidebar: () => void;
  onNavigate: (route: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenMobileSidebar,
  onNavigate,
}) => {
  const { profile, notifications, markNotificationRead, markAllNotificationsRead, resetToDemoData, logout } = useStudent();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route to assistant with the search query
    onNavigate(`/assistant?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#E8E8EF] px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left section: mobile hamburger & global search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-[#717487] hover:text-[#171827] rounded-lg border border-[#E8E8EF]"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="w-4 h-4 text-[#8C8FA3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignments, notices..."
            className="w-full pl-9 pr-20 py-2 rounded-xl bg-[#FAFAFC] border border-[#E8E8EF] text-xs focus:outline-hidden focus:border-[#7065E8] focus:bg-white transition-all text-[#171827] placeholder:text-[#8C8FA3]"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold bg-[#F0EEFF] text-[#7065E8] hover:bg-[#E3E0FE] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Search className="w-3 h-3" />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Right section: Quick actions, notifications, profile */}
      <div className="flex items-center gap-2.5">
        {/* Quick action menu */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7065E8] text-white hover:bg-[#5E52E2] text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Action</span>
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8E8EF] rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => {
                  onNavigate('/academics/assignments');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#171827] hover:bg-[#FAFAFC] flex items-center justify-between"
              >
                <span>Add Assignment</span>
                <span className="text-[10px] text-[#717487]">+New</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('/college/notices');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#171827] hover:bg-[#FAFAFC] flex items-center justify-between"
              >
                <span>Upload Notice</span>
                <span className="text-[10px] text-[#717487]">PDF/Img</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('/finance');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#171827] hover:bg-[#FAFAFC] flex items-center justify-between"
              >
                <span>Record Expense</span>
                <span className="text-[10px] text-[#717487]">Receipt</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('/academics/viva');
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#171827] hover:bg-[#FAFAFC] flex items-center justify-between"
              >
                <span>Start Viva Prep</span>
                <span className="text-[10px] text-[#7065E8] font-bold">AI</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-[#53566B] hover:text-[#171827] hover:bg-[#FAFAFC] border border-[#E8E8EF] relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C64545] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E8E8EF] rounded-2xl shadow-xl p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E8EF] mb-2">
                <span className="text-xs font-bold text-[#171827]">
                  Notifications ({unreadCount} new)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-[#7065E8] hover:underline font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#717487] text-center py-4">No notifications yet.</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.linkRoute) {
                          onNavigate(notif.linkRoute);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                        notif.read
                          ? 'bg-white border-[#E8E8EF] opacity-80'
                          : 'bg-[#F0EEFF]/50 border-[#D9D4FA]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#171827]">{notif.title}</span>
                        <span className="text-[10px] text-[#8C8FA3]">{notif.time}</span>
                      </div>
                      <p className="text-[11px] text-[#53566B] leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Demo reset button */}
        <button
          onClick={() => {
            if (confirm('Reset to initial Indian college student demo records?')) {
              resetToDemoData();
            }
          }}
          title="Reset Demo Records"
          className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E8E8EF] text-[#717487] hover:text-[#171827] hover:bg-[#FAFAFC] text-[11px] font-medium"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Demo Reset</span>
        </button>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 border-l border-[#E8E8EF] hover:opacity-80 transition-opacity"
            aria-label="Profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-[#E0DCFE] text-[#7065E8] font-bold text-xs flex items-center justify-center">
              {profile.name.charAt(0)}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-[#171827] leading-tight">{profile.name}</p>
              <p className="text-[10px] text-[#717487] leading-tight">{profile.branch.split(' ')[0]}</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E8E8EF] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in">
              <div className="p-2 border-b border-[#E8E8EF] mb-1">
                <p className="text-xs font-bold text-[#171827]">{profile.name}</p>
                <p className="text-[11px] text-[#717487] truncate">{profile.email}</p>
              </div>

              <button
                onClick={() => {
                  onNavigate('/settings');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#171827] hover:bg-[#FAFAFC] rounded-xl flex items-center justify-between"
              >
                <span>Academic Profile & Goals</span>
                <span className="text-[10px] text-[#7065E8]">Edit</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('/documents');
                  setShowProfileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#171827] hover:bg-[#FAFAFC] rounded-xl flex items-center justify-between"
              >
                <span>Document Vault</span>
                <span className="text-[10px] text-[#717487]">AES-256</span>
              </button>

              <button
                onClick={() => {
                  resetToDemoData();
                  setShowProfileMenu(false);
                  onNavigate('/dashboard');
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#7065E8] hover:bg-[#F0EEFF] rounded-xl flex items-center justify-between"
              >
                <span>Reset Demo Records</span>
                <RefreshCw className="w-3 h-3 text-[#7065E8]" />
              </button>

              <div className="pt-1 mt-1 border-t border-[#E8E8EF]">
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                    onNavigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#C64545] hover:bg-rose-50 rounded-xl font-semibold flex items-center justify-between"
                >
                  <span>Sign Out</span>
                  <span className="text-[10px]">Exit</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
