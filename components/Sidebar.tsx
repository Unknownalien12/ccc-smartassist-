import React, { useState } from 'react';
import { MessageSquare, Settings, ShieldCheck, LogOut, GraduationCap, Plus, History, UserCircle, Search, X, Trash2 } from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
  onLogout: () => void;
  userType: 'student' | 'admin';
  themeColor: 'blue' | 'emerald' | 'violet';
  systemName: string;
  userName?: string;
  onClose?: () => void;
  onSettingsClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearHistory,
  onLogout,
  userType,
  themeColor,
  systemName,
  userName,
  onClose,
  onSettingsClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const themes = {
    blue: {
      iconBg: 'from-blue-600 to-violet-600',
      iconShadow: 'shadow-blue-500/20',
      button: 'bg-slate-900 hover:bg-slate-800',
      selected: 'bg-blue-50 border-blue-200 text-blue-700',
      userIcon: 'from-blue-400 to-indigo-500'
    },
    emerald: {
      iconBg: 'from-emerald-600 to-teal-600',
      iconShadow: 'shadow-emerald-500/20',
      button: 'bg-emerald-900 hover:bg-emerald-800',
      selected: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      userIcon: 'from-emerald-400 to-teal-500'
    },
    violet: {
      iconBg: 'from-violet-600 to-fuchsia-600',
      iconShadow: 'shadow-violet-500/20',
      button: 'bg-violet-900 hover:bg-violet-800',
      selected: 'bg-violet-50 border-violet-200 text-violet-700',
      userIcon: 'from-violet-400 to-fuchsia-500'
    }
  };

  const theme = themes[themeColor];

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 h-full flex flex-col glass-panel border-r border-white/40 bg-white/60 backdrop-blur-xl md:rounded-l-[2.5rem]">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`bg-gradient-to-br ${theme.iconBg} p-2.5 rounded-2xl shadow-lg ${theme.iconShadow}`}>
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-slate-800">{systemName}</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Student Portal v2.0</p>
          </div>
        </div>
        {/* Mobile Close Button - Prominent for Touch */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden flex items-center justify-center w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 active:scale-95 transition-all shadow-sm"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Main Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => {
            onNewSession();
            if (onClose) onClose();
          }}
          className={`w-full flex items-center justify-center gap-2 ${theme.button} text-white py-3.5 rounded-2xl transition-all shadow-xl shadow-slate-200 font-semibold active:scale-95`}
        >
          <Plus className="w-4 h-4" />
          <span>New Inquiry</span>
        </button>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        <div>
          <div className="flex justify-between items-center px-2 mb-3">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chat History</h3>
            {sessions.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[10px] font-bold text-red-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                title="Clear all history"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative mb-3 px-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3 w-3 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-slate-200/60 rounded-xl leading-5 bg-white/40 text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 sm:text-xs transition-all font-medium"
              placeholder="Filter conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            {filteredSessions.map(session => (
              <div
                key={session.id}
                className={`group w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all border cursor-pointer ${currentSessionId === session.id
                  ? `${theme.selected} shadow-sm`
                  : 'border-transparent text-slate-600 hover:bg-white/50 hover:border-slate-100'
                  }`}
                onClick={() => {
                  onSelectSession(session.id);
                  if (onClose) onClose();
                }}
              >
                <div className="flex items-center gap-3 truncate flex-1">
                  <History className="w-3 h-3 opacity-50 flex-shrink-0" />
                  <span className="truncate font-medium">{session.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this conversation?')) {
                      onDeleteSession(session.id);
                    }
                  }}
                  className="bg-transparent p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  title="Delete conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-xs text-slate-400 px-4 italic">No chat history found.</p>
            )}
            {sessions.length > 0 && filteredSessions.length === 0 && (
              <p className="text-xs text-slate-400 px-4 italic">No matching conversations.</p>
            )}
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-200/50 bg-white/30">
        {userType === 'student' && onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="flex items-center gap-3 w-full p-3 rounded-2xl bg-white/50 border border-white/50 shadow-sm mb-3 hover:bg-white transition-all group"
          >
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${theme.userIcon} flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform`}>
              {userName ? userName[0].toUpperCase() : 'S'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-slate-800 truncate">
                {userName || 'Student Profile'}
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Account Settings
              </p>
            </div>
            <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        )}

        {userType === 'admin' && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/50 border border-white/50 shadow-sm mb-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold shadow-md`}>
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {userName || 'Admin Core'}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-red-500 py-2 transition-colors uppercase tracking-wider"
        >
          <LogOut className="w-3 h-3" />
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default Sidebar;