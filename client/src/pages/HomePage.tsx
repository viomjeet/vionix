import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rss } from 'lucide-react';
import { Post } from '../types/index.js';
import { useLightbox } from '../context/LightboxContext.js';
import { postService } from '../services/post.service.js';
import { CreatePost } from '../components/CreatePost.js';
import { PostCard } from '../components/PostCard.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import { EmptyState } from '../components/EmptyState.js';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { openLightbox } = useLightbox();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHomeFeed = async () => {
      try {
        const feed = await postService.getHomeFeed();
        setPosts(feed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load home feed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeFeed();
  }, []);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

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
      {/* Feed Title */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Home Feed</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Updates from you and the creators you follow</p>
      </div>

      {/* Composer */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* Posts Stream */}
      {isLoading ? (
        <LoadingSpinner size="md" label="Loading feed..." />
      ) : error ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Rss}
          title="Your feed is quiet"
          description="You haven't posted yet and aren't following anyone with recent posts. Check out the explore page to discover great creators!"
          actionText="Explore Posts"
          onAction={() => navigate('/explore')}
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
