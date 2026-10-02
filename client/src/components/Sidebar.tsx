import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Bookmark, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Avatar } from './Avatar.js';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Explore', to: '/explore', icon: Compass },
    { label: 'Saved', to: user ? `/profile/${user.username}?tab=saved` : '/login', icon: Bookmark },
    { label: 'Profile', to: user ? `/profile/${user.username}` : '/login', icon: UserIcon },
  ];

  const isItemActive = (label: string, to: string): boolean => {
    if (label === 'Home') return location.pathname === '/';
    if (label === 'Explore') return location.pathname.startsWith('/explore');
    if (label === 'Saved') {
      return location.pathname.startsWith('/profile') && location.search.includes('tab=saved');
    }
    if (label === 'Profile') {
      return location.pathname.startsWith('/profile') && !location.search.includes('tab=saved');
    }
    return location.pathname === to;
  };

  return (
    <aside className="w-full h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0b0f19] p-4 flex flex-col justify-between transition-colors">
      <div>
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 px-3 py-4 mb-4 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-teal-500/20 group-hover:scale-105 transition">
            V
          </div>
          <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
            Vionix
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.label, item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                  active
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/50 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white border border-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition ${
                    active ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      {user && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
            <div
              onClick={() => navigate(`/profile/${user.username}`)}
              className="flex items-center gap-2.5 cursor-pointer overflow-hidden flex-1"
            >
              <Avatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">@{user.username}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
