import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Bookmark, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const MobileNav: React.FC = () => {
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 z-50 flex justify-around items-center transition-colors">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(item.label, item.to);
        return (
          <Link
            key={item.label}
            to={item.to}
            className={`flex flex-col items-center py-1 px-3 text-[11px] font-medium transition ${
              active
                ? 'text-teal-600 dark:text-teal-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <button
        onClick={handleLogout}
        className="flex flex-col items-center py-1 px-3 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
      >
        <LogOut className="w-5 h-5 mb-0.5" />
        <span>Logout</span>
      </button>
    </div>
  );
};
