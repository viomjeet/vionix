import React, { useState, useEffect } from 'react';
import { SuggestedUser } from '../types/index.js';
import { userService } from '../services/user.service.js';
import { UserCard } from './UserCard.js';
import { LoadingSpinner } from './LoadingSpinner.js';

export const RightSidebar: React.FC = () => {
  const [suggested, setSuggested] = useState<SuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const users = await userService.getSuggestedUsers();
        setSuggested(users);
      } catch (error) {
        console.error('Failed to load suggested users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggested();
  }, []);

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    if (isFollowing) {
      setSuggested((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  return (
    <aside className="w-full p-4 sticky top-0 h-screen hidden lg:flex flex-col justify-between bg-white dark:bg-[#0b0f19] transition-colors">
      <div>
        <div className="mb-4">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">
            Suggested for you
          </h2>

          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : suggested.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center">
              No new suggestions right now.
            </p>
          ) : (
            <div className="space-y-1">
              {suggested.map((user) => (
                <UserCard
                  key={user.id}
                  id={user.id}
                  name={user.name}
                  username={user.username}
                  avatarUrl={user.avatarUrl}
                  bio={user.bio}
                  followerCount={user.followerCount}
                  isFollowingInitially={false}
                  onFollowChange={handleFollowChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-[11px] text-slate-400 dark:text-slate-500 px-3 leading-relaxed">
        <p className="font-semibold text-slate-600 dark:text-slate-400">Vionix &copy; 2026</p>
        <p className="mt-0.5">Built with React, Express, Prisma &amp; SQLite</p>
      </div>
    </aside>
  );
};
