import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Trash2, Maximize2, Play, Video as VideoIcon, Bookmark } from 'lucide-react';
import { Post } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useLightbox } from '../context/LightboxContext.js';
import { postService } from '../services/post.service.js';
import { Avatar } from './Avatar.js';
import { CommentSection } from './CommentSection.js';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
  onImageClick?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted, onImageClick }) => {
  const { user } = useAuth();
  const { openLightbox, updatePostCommentCount } = useLightbox();
  const [isLiked, setIsLiked] = useState<boolean>(post.isLiked);
  const [likeCount, setLikeCount] = useState<number>(post.likeCount);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(Boolean(post.isBookmarked));
  const [isBookmarking, setIsBookmarking] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState<number>(post.commentCount);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const isAuthor = user?.id === post.author.id;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistic UI update
    const nextIsLiked = !isLiked;
    const nextLikeCount = nextIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
    setIsLiked(nextIsLiked);
    setLikeCount(nextLikeCount);

    try {
      const result = await postService.toggleLike(post.id);
      setIsLiked(result.isLiked);
      setLikeCount(result.likeCount);
    } catch (err) {
      console.error('Failed to toggle like:', err);
      // Revert optimistic update
      setIsLiked(!nextIsLiked);
      setLikeCount(likeCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (isBookmarking) return;
    setIsBookmarking(true);

    const nextIsBookmarked = !isBookmarked;
    setIsBookmarked(nextIsBookmarked);

    try {
      const result = await postService.toggleBookmark(post.id);
      setIsBookmarked(result.isBookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      setIsBookmarked(!nextIsBookmarked);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      onPostDeleted?.(post.id);
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Could not delete post');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderContentWithHashtags = (text: string) => {
    const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <Link
            key={i}
            to={`/explore?q=${encodeURIComponent(part)}`}
            className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition">
      {/* Header */}
      <div className="flex items-start justify-between">
        <Link
          to={`/profile/${post.author.username}`}
          className="flex items-center gap-3 group"
        >
          <Avatar
            name={post.author.name}
            avatarUrl={post.author.avatarUrl}
            size="md"
          />
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:underline">
              {post.author.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <span>@{post.author.username}</span>
              <span>&middot;</span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </Link>

        {isAuthor && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition disabled:opacity-50"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mt-3 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
        {renderContentWithHashtags(post.content)}
      </div>

      {/* Media: Video or Protected Image */}
      {post.videoUrl ? (
        <div
          onClick={() => {
            if (onImageClick) {
              onImageClick(post);
            } else {
              openLightbox([post], 0);
            }
          }}
          className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-96 relative group cursor-pointer"
          title="Click to view full video and caption"
        >
          <video
            src={post.videoUrl}
            preload="metadata"
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-auto object-cover max-h-96"
          />
          <div className="absolute inset-0 bg-slate-950/35 group-hover:bg-slate-950/20 transition flex items-center justify-center">
            <span className="p-3.5 rounded-full bg-slate-900/80 text-white shadow-xl backdrop-blur-xs group-hover:scale-110 transition flex items-center justify-center">
              <Play className="w-5 h-5 fill-white text-white translate-x-0.5" />
            </span>
            <span className="absolute bottom-3 left-3 bg-slate-900/80 text-white text-[11px] px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 backdrop-blur-xs">
              <VideoIcon className="w-3.5 h-3.5" />
              Watch Video & View Caption
            </span>
          </div>
        </div>
      ) : post.imageUrl ? (
        <div
          onClick={() => {
            if (onImageClick) {
              onImageClick(post);
            } else {
              openLightbox([post], 0);
            }
          }}
          className="mt-3 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 max-h-96 relative group cursor-pointer select-none"
          title="Click to view full image and caption"
        >
          <img
            src={post.imageUrl}
            alt="Post attachment"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            style={{
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
            }}
            className="w-full h-auto object-cover max-h-96 transition duration-200 group-hover:scale-[1.01] pointer-events-none select-none"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Protection overlay shield preventing right click saving */}
          <div
            className="absolute inset-0 z-10"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
          <div className="absolute inset-0 z-20 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center pointer-events-none">
            <span className="bg-slate-900/75 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-xs font-medium">
              <Maximize2 className="w-3.5 h-3.5" />
              View Full Image & Caption
            </span>
          </div>
        </div>
      ) : null}

      {/* Actions Bar */}
      <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1.5 transition ${
            isLiked
              ? 'text-rose-600 hover:text-rose-700 dark:text-rose-500'
              : 'hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${
              isLiked ? 'fill-rose-600 stroke-rose-600 dark:fill-rose-500 dark:stroke-rose-500' : 'stroke-current'
            }`}
          />
          <span>{likeCount}</span>
        </button>

        {/* Comment toggle */}
        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-300 transition"
        >
          <MessageSquare className="w-4 h-4 stroke-current" />
          <span>{commentCount}</span>
        </button>

        {/* Bookmark toggle */}
        <button
          onClick={handleBookmark}
          disabled={isBookmarking}
          className={`ml-auto flex items-center gap-1.5 transition ${
            isBookmarked
              ? 'text-amber-500 hover:text-amber-600 dark:text-amber-400'
              : 'hover:text-slate-700 dark:hover:text-slate-300'
          }`}
          title={isBookmarked ? 'Saved to bookmarks' : 'Save post'}
        >
          <Bookmark
            className={`w-4 h-4 ${
              isBookmarked ? 'fill-amber-500 stroke-amber-500 dark:fill-amber-400 dark:stroke-amber-400' : 'stroke-current'
            }`}
          />
          <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Comments section with real-time sync */}
      {showComments && (
        <CommentSection
          postId={post.id}
          onCommentCountChange={(newCount) => {
            setCommentCount(newCount);
            updatePostCommentCount(post.id, newCount);
          }}
        />
      )}
    </article>
  );
};
