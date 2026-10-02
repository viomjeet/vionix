import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from './Avatar.js';
import { userService } from '../services/user.service.js';

interface UserCardProps {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  followerCount?: number;
  isFollowingInitially?: boolean;
  onFollowChange?: (userId: string, isFollowing: boolean) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  id,
  name,
  username,
  avatarUrl,
  bio,
  followerCount,
  isFollowingInitially = false,
  onFollowChange,
}) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(isFollowingInitially);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(id);
        setIsFollowing(false);
        onFollowChange?.(id, false);
      } else {
        await userService.followUser(id);
        setIsFollowing(true);
        onFollowChange?.(id, true);
      }
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={() => navigate(`/profile/${username}`)}
      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition cursor-pointer"
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <Avatar name={name} avatarUrl={avatarUrl} size="sm" />
        <div className="truncate">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate hover:underline">{name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">@{username}</p>
          {followerCount !== undefined && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
            </p>
          )}
          {bio && <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-[140px]">{bio}</p>}
        </div>
      </div>

      <button
        disabled={isLoading}
        onClick={handleToggleFollow}
        className={`px-3 py-1 text-xs font-semibold rounded-lg transition shrink-0 ${
          isFollowing
            ? 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-900'
            : 'bg-brand-600 text-white hover:bg-brand-700 shadow-xs'
        } disabled:opacity-50`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};
