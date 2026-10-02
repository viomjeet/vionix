import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Calendar, UserCheck, UserPlus, FileText, Image as ImageIcon, Bookmark, Edit3, Grid, Play, Video as VideoIcon } from 'lucide-react';
import { UserProfile, Post } from '../types/index.js';
import { userService } from '../services/user.service.js';
import { postService } from '../services/post.service.js';
import { useLightbox } from '../context/LightboxContext.js';
import { Avatar } from '../components/Avatar.js';
import { PostCard } from '../components/PostCard.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import { EmptyState } from '../components/EmptyState.js';
import { EditProfileModal } from '../components/EditProfileModal.js';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { openLightbox } = useLightbox();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initialTab = searchParams.get('tab') === 'saved' ? 'saved' : 'posts';
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'saved'>(initialTab);

  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Sync tab with URL search parameter if changed
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'saved') {
      setActiveTab('saved');
    }
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!username) return;
      setIsLoading(true);
      setError(null);

      try {
        const data = await userService.getUserProfile(username);
        if (isMounted) {
          setProfile(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'User profile not found');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [username]);

  // Load bookmarks when Saved tab is active and it's self
  useEffect(() => {
    if (activeTab === 'saved' && profile?.isSelf) {
      const loadBookmarks = async () => {
        setIsLoadingBookmarks(true);
        try {
          const posts = await postService.getBookmarkedPosts();
          setBookmarkedPosts(posts);
        } catch (err) {
          console.error('Failed to load bookmarks:', err);
        } finally {
          setIsLoadingBookmarks(false);
        }
      };
      loadBookmarks();
    }
  }, [activeTab, profile?.isSelf]);

  const handleTabChange = (tab: 'posts' | 'media' | 'saved') => {
    setActiveTab(tab);
    if (tab === 'saved') {
      setSearchParams({ tab: 'saved' });
    } else {
      setSearchParams({});
    }
  };

  const handleToggleFollow = async () => {
    if (!profile || profile.isSelf || isFollowLoading) return;

    setIsFollowLoading(true);
    const nextIsFollowing = !profile.isFollowing;
    const nextFollowerCount = nextIsFollowing
      ? profile.followerCount + 1
      : Math.max(0, profile.followerCount - 1);

    // Optimistic update
    setProfile({
      ...profile,
      isFollowing: nextIsFollowing,
      followerCount: nextFollowerCount,
    });

    try {
      if (nextIsFollowing) {
        await userService.followUser(profile.id);
      } else {
        await userService.unfollowUser(profile.id);
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
      // Revert optimistic update
      setProfile({
        ...profile,
        isFollowing: !nextIsFollowing,
        followerCount: profile.followerCount,
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handlePostDeleted = (deletedPostId: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      posts: profile.posts.filter((p) => p.id !== deletedPostId),
    });
    setBookmarkedPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
  };

  const handleProfileUpdated = (updated: UserProfile) => {
    setProfile(updated);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Loading profile..." />;
  }

  if (error || !profile) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center my-6">
        <h2 className="text-base font-bold text-slate-800 dark:text-white">User Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {error || "The user you are looking for doesn't exist."}
        </p>
        <Link
          to="/"
          className="mt-4 inline-block px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-sm"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 mb-6 shadow-sm transition">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={profile.name} avatarUrl={profile.avatarUrl} size="xl" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {profile.name}
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                @{profile.username}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {!profile.isSelf ? (
            <button
              onClick={handleToggleFollow}
              disabled={isFollowLoading}
              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition disabled:opacity-50 ${
                profile.isFollowing
                  ? 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-900'
                  : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'
              }`}
            >
              {profile.isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Follow</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition shadow-xs self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-brand-500" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
            {profile.bio}
          </p>
        )}

        {/* Metrics Bar */}
        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">{profile.followerCount}</span>{' '}
            <span>Followers</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white">{profile.followingCount}</span>{' '}
            <span>Following</span>
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white">{profile.posts.length}</span>{' '}
            <span>Posts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 bg-white dark:bg-slate-900 rounded-2xl px-2 shadow-xs transition">
        <button
          onClick={() => handleTabChange('posts')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'posts'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Posts ({profile.posts.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('media')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
            activeTab === 'media'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>
            Photos &amp; Videos ({profile.posts.filter((p) => Boolean(p.imageUrl || p.videoUrl)).length})
          </span>
        </button>

        {profile.isSelf && (
          <button
            onClick={() => handleTabChange('saved')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'saved'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Posts</span>
          </button>
        )}
      </div>

      {/* Content based on Active Tab */}
      {(() => {
        const mediaPosts = profile.posts.filter((p) => Boolean(p.imageUrl || p.videoUrl));
        const handleImageClick = (post: Post) => {
          const index = mediaPosts.findIndex((p) => p.id === post.id);
          openLightbox(mediaPosts, Math.max(0, index));
        };

        if (activeTab === 'posts') {
          return profile.posts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No posts yet"
              description={`@${profile.username} hasn't published any posts so far.`}
            />
          ) : (
            <div className="space-y-4">
              {profile.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onImageClick={handleImageClick}
                />
              ))}
            </div>
          );
        }

        if (activeTab === 'media') {
          if (mediaPosts.length === 0) {
            return (
              <EmptyState
                icon={Grid}
                title="No media uploaded"
                description={`@${profile.username} has not posted any photos or videos yet.`}
              />
            );
          }

          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaPosts.map((post, index) => (
                <div
                  key={post.id}
                  onClick={() => openLightbox(mediaPosts, index)}
                  className="aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 relative group cursor-pointer select-none"
                  title="Click to view media and caption"
                >
                  {post.videoUrl ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-black">
                      <video
                        src={post.videoUrl}
                        preload="metadata"
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute top-2 right-2 bg-slate-900/80 p-1.5 rounded-full text-white shadow-md">
                        <VideoIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition flex items-center justify-center">
                        <span className="p-2.5 rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur-xs group-hover:scale-110 transition">
                          <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      <img
                        src={post.imageUrl!}
                        alt="User photo"
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        style={{
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          userSelect: 'none',
                        }}
                        className="w-full h-full object-cover transition duration-200 group-hover:scale-105 pointer-events-none select-none"
                      />
                      <div
                        className="absolute inset-0 z-10"
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                      />
                      <div className="absolute inset-0 z-20 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
                        <span className="text-white text-xs bg-slate-900/70 px-2.5 py-1 rounded-md font-medium">
                          View Photo
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        }

        /* Saved Posts Tab */
        if (activeTab === 'saved') {
          if (isLoadingBookmarks) {
            return <LoadingSpinner size="md" label="Loading saved posts..." />;
          }

          if (bookmarkedPosts.length === 0) {
            return (
              <EmptyState
                icon={Bookmark}
                title="No saved posts yet"
                description="Save posts by tapping the bookmark icon to revisit them whenever you want."
              />
            );
          }

          return (
            <div className="space-y-4">
              {bookmarkedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                />
              ))}
            </div>
          );
        }

        return null;
      })()}

      {/* Edit Profile Modal */}
      {profile.isSelf && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};
