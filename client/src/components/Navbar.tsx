import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Avatar } from './Avatar.js';
import { SearchBar } from './SearchBar.js';
import { ThemeToggle } from './ThemeToggle.js';

export const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-5 py-2.5 transition-colors">
      <div className="w-full flex items-center justify-between gap-3">
        {/* Mobile brand (hidden on md) */}
        <Link to="/" className="md:hidden flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            V
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight hidden xs:inline">
            Vionix
          </span>
        </Link>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <ThemeToggle />

          {user && (
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-teal-500/40 transition"
              title={`@${user.username}`}
            >
              <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
