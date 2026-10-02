import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Heart, MessageSquare, Video as VideoIcon } from 'lucide-react';
import { Post } from '../types/index.js';
import { Avatar } from '../components/Avatar.js';
import { CommentSection } from '../components/CommentSection.js';

interface LightboxContextType {
  openLightbox: (posts: Post[], initialIndex?: number) => void;
  closeLightbox: () => void;
  isOpen: boolean;
  currentPost: Post | null;
  updatePostCommentCount: (postId: string, newCount: number) => void;
}

const LightboxContext = createContext<LightboxContextType | undefined>(undefined);

export const LightboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);

  const openLightbox = useCallback((posts: Post[], initialIndex: number = 0) => {
    // Filter posts that have either an image OR video URL
    const mediaPosts = posts.filter((p) => Boolean(p.imageUrl || p.videoUrl));
    if (mediaPosts.length === 0) return;

    setItems(mediaPosts);
    const validIndex = initialIndex >= 0 && initialIndex < mediaPosts.length ? initialIndex : 0;
    setCurrentIndex(validIndex);
    setShowComments(false);
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  const updatePostCommentCount = useCallback((postId: string, newCount: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === postId ? { ...item, commentCount: newCount } : item))
    );
  }, []);

  const goToPrev = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  }, [items.length]);

  const goToNext = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  }, [items.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Do not navigate with arrow keys if user is typing inside an input/textarea
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea';

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft' && !isInput) {
        goToPrev();
      } else if (e.key === 'ArrowRight' && !isInput) {
        goToNext();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeLightbox, goToPrev, goToNext]);

  const currentPost = items[currentIndex] || null;

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

  return (
    <LightboxContext.Provider
      value={{ openLightbox, closeLightbox, isOpen, currentPost, updatePostCommentCount }}
    >
      {children}

      {isOpen && currentPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/95 backdrop-blur-md animate-fadeIn"
          onClick={closeLightbox}
        >
          {/* Top Bar with Counter, Media Type indicator and Close Button */}
          <div className="absolute top-4 right-4 flex items-center gap-2.5 z-30">
            {Boolean(currentPost.videoUrl) && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-sky-900/80 text-sky-200 border border-sky-700 backdrop-blur-sm">
                <VideoIcon className="w-3.5 h-3.5" />
                Video
              </span>
            )}
            {items.length > 1 && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-200 border border-slate-700 backdrop-blur-sm">
                {currentIndex + 1} / {items.length}
              </span>
            )}
            <button
              onClick={closeLightbox}
              className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full border border-slate-700 transition"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Left Arrow (Previous) Button */}
          {items.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-700 shadow-xl backdrop-blur-sm transition z-30 hover:scale-105"
              title="Previous Media (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow (Next) Button */}
          {items.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-700 shadow-xl backdrop-blur-sm transition z-30 hover:scale-105"
              title="Next Media (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Main Modal Card (Media + Post Text Panel) */}
          <div
            className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media Section: Image or Video */}
            <div className="flex-1 bg-black/70 flex items-center justify-center p-2 min-h-[280px] md:min-h-[500px] max-h-[55vh] md:max-h-[85vh] relative select-none overflow-hidden">
              {currentPost.videoUrl ? (
                /* Video Player with Download Protection */
                <video
                  key={currentPost.videoUrl}
                  src={currentPost.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  className="max-w-full max-h-[52vh] md:max-h-[82vh] rounded-md shadow-2xl object-contain"
                />
              ) : (
                /* Image View with Download Protection Shield */
                <div className="relative flex items-center justify-center max-w-full max-h-full">
                  <img
                    src={currentPost.imageUrl || ''}
                    alt={`Photo by ${currentPost.author.name}`}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    style={{
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                    }}
                    className="max-w-full max-h-[52vh] md:max-h-[82vh] object-contain rounded-md select-none pointer-events-none"
                  />
                  {/* Transparent protective shield overlay preventing right-click saving */}
                  <div
                    className="absolute inset-0 z-10"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                  />
                </div>
              )}
            </div>

            {/* Post Information & Text Panel */}
            <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-slate-900 flex flex-col border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 shrink-0">
              {/* Author Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <Avatar name={currentPost.author.name} avatarUrl={currentPost.author.avatarUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {currentPost.author.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                    <span className="truncate">@{currentPost.author.username}</span>
                    <span>&middot;</span>
                    <span className="shrink-0">{formatDate(currentPost.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Post Content / Caption */}
              <div className="p-4 flex-1 overflow-y-auto max-h-48 md:max-h-[55vh]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Post Caption
                </p>
                <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words leading-relaxed mb-4">
                  {currentPost.content || <span className="text-slate-400 dark:text-slate-500 italic">No text caption</span>}
                </div>

                {/* Inline Comments Section inside Lightbox */}
                {showComments && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <CommentSection
                      postId={currentPost.id}
                      onCommentCountChange={(newCount) => {
                        updatePostCommentCount(currentPost.id, newCount);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Post Stats & Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    {currentPost.likeCount} {currentPost.likeCount === 1 ? 'like' : 'likes'}
                  </span>
                  <button
                    onClick={() => setShowComments((prev) => !prev)}
                    className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {currentPost.commentCount} {currentPost.commentCount === 1 ? 'comment' : 'comments'}
                  </button>
                </div>

                {items.length > 1 && (
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
                    <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-mono">←</kbd> <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-mono">→</kbd>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </LightboxContext.Provider>
  );
};

export const useLightbox = (): LightboxContextType => {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error('useLightbox must be used within a LightboxProvider');
  }
  return context;
};

