import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User as UserIcon, FileText, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { userService } from '../services/user.service.js';
import { SearchResults } from '../types/index.js';
import { Avatar } from './Avatar.js';
import { useLightbox } from '../context/LightboxContext.js';

export const SearchBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { openLightbox } = useLightbox();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await userService.search(query.trim());
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      setIsOpen(false);
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectUser = (username: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/profile/${username}`);
  };

  const handleSelectPost = (post: SearchResults['posts'][0]) => {
    setIsOpen(false);
    if (post.imageUrl || post.videoUrl) {
      openLightbox([post], 0);
    } else {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const hasResults = results && (results.users.length > 0 || results.posts.length > 0);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Field */}
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search creators, posts, #hashtags..."
          className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-brand-500 rounded-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition shadow-xs"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults(null);
            }}
            className="absolute right-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Live Dropdown Results */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto animate-fadeIn">
          {isLoading && (
            <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
              Searching...
            </div>
          )}

          {!isLoading && !hasResults && (
            <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              No users or posts found matching "{query}"
            </div>
          )}

          {!isLoading && results && (
            <div>
              {/* Users / Creators Section */}
              {results.users.length > 0 && (
                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Creators</span>
                  </div>
                  {results.users.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleSelectUser(u.username)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition"
                    >
                      <Avatar name={u.name} avatarUrl={u.avatarUrl} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {u.name}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          @{u.username} &middot; {u.followerCount} followers
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Posts Section */}
              {results.posts.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Posts</span>
                  </div>
                  {results.posts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPost(p)}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition"
                    >
                      <div className="pt-0.5">
                        {p.videoUrl ? (
                          <VideoIcon className="w-4 h-4 text-sky-500 shrink-0" />
                        ) : p.imageUrl ? (
                          <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2">
                          {p.content}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          by @{p.author.username}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Press enter footer */}
              <div
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
                }}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] text-brand-600 dark:text-brand-400 font-medium text-center cursor-pointer border-t border-slate-100 dark:border-slate-800 transition"
              >
                Press <span className="font-semibold underline">Enter</span> to view all results on Explore page &rarr;
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
