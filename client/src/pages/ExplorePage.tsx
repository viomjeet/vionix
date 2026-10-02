import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, X } from 'lucide-react';
import { Post, SuggestedUser } from '../types/index.js';
import { useLightbox } from '../context/LightboxContext.js';
import { postService } from '../services/post.service.js';
import { userService } from '../services/user.service.js';
import { PostCard } from '../components/PostCard.js';
import { UserCard } from '../components/UserCard.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import { EmptyState } from '../components/EmptyState.js';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const { openLightbox } = useLightbox();

  const [posts, setPosts] = useState<Post[]>([]);
  const [matchedUsers, setMatchedUsers] = useState<SuggestedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (searchQuery.trim()) {
          const results = await userService.search(searchQuery.trim());
          setPosts(results.posts);
          setMatchedUsers(results.users);
        } else {
          setMatchedUsers([]);
          const data = await postService.getExploreFeed();
          setPosts(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  const handlePostDeleted = (deletedPostId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
  };

  const handleImageClick = (post: Post) => {
    const mediaPosts = posts.filter((p) => Boolean(p.imageUrl || p.videoUrl));
    const index = mediaPosts.findIndex((p) => p.id === post.id);
    openLightbox(mediaPosts, Math.max(0, index));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        {searchQuery ? (
          <div className="flex items-center justify-between bg-brand-50 dark:bg-slate-900 border border-brand-200 dark:border-slate-800 rounded-2xl p-4 mb-2">
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                Results for <span className="text-brand-600 dark:text-brand-400">"{searchQuery}"</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Found {posts.length} posts and {matchedUsers.length} creators
              </p>
            </div>
            <button
              onClick={() => setSearchParams({})}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Explore</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Discover recent posts from everyone across the platform
            </p>
          </div>
        )}
      </div>

      {/* If search query has matched users, show creators carousel/strip */}
      {matchedUsers.length > 0 && (
        <div className="mb-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Matching Creators ({matchedUsers.length})
          </h2>
          <div className="space-y-1">
            {matchedUsers.map((user) => (
              <UserCard
                key={user.id}
                id={user.id}
                name={user.name}
                username={user.username}
                avatarUrl={user.avatarUrl}
                bio={user.bio}
                followerCount={user.followerCount}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stream */}
      {isLoading ? (
        <LoadingSpinner size="md" label="Loading explore feed..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={searchQuery ? `No posts matching "${searchQuery}"` : 'No posts discovered yet'}
          description={
            searchQuery
              ? 'Try searching for other words or creator names.'
              : 'Be the first to share something with the community!'
          }
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
              onImageClick={handleImageClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};
