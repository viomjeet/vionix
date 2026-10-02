import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Comment } from '../types/index.js';
import { postService } from '../services/post.service.js';
import { Avatar } from './Avatar.js';
import { LoadingSpinner } from './LoadingSpinner.js';

interface CommentSectionProps {
  postId: string;
  onCommentCountChange?: (newCount: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  onCommentCountChange,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadComments = async () => {
      try {
        const data = await postService.getComments(postId);
        if (isMounted) {
          setComments(data);
          onCommentCountChange?.(data.length);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadComments();
    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newComment = await postService.addComment(postId, content.trim());
      const updated = [...comments, newComment];
      setComments(updated);
      setContent('');
      onCommentCountChange?.(updated.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 disabled:opacity-50 transition shrink-0 shadow-xs"
        >
          {isSubmitting ? 'Posting...' : 'Comment'}
        </button>
      </form>

      {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

      {/* Comments List */}
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500 py-1 text-center">No comments yet.</p>
      ) : (
        <div className="space-y-2 pt-1">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl text-xs"
            >
              <Avatar name={comment.user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/profile/${comment.user.username}`}
                      className="font-semibold text-slate-800 dark:text-slate-200 hover:underline"
                    >
                      {comment.user.name}
                    </Link>
                    <span className="text-slate-400 dark:text-slate-500">@{comment.user.username}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
