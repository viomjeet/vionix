import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  altText?: string;
  postText?: string | null;
  authorName?: string;
  authorUsername?: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  counterText?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  imageUrl,
  altText = 'Post image view',
  postText,
  authorName,
  authorUsername,
  onClose,
  onNext,
  onPrev,
  counterText,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
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
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      {/* Top right actions */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-30">
        {counterText && (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-200 border border-slate-700 backdrop-blur-sm">
            {counterText}
          </span>
        )}
        <button
          onClick={onClose}
          className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full border border-slate-700 transition"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Previous Button */}
      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-700 shadow-xl backdrop-blur-sm transition z-30"
          title="Previous Photo"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next Button */}
      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-700 shadow-xl backdrop-blur-sm transition z-30"
          title="Next Photo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main card */}
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 bg-black/60 flex items-center justify-center p-2 min-h-[280px] md:min-h-[500px] max-h-[55vh] md:max-h-[85vh]">
          <img
            src={imageUrl}
            alt={altText}
            className="max-w-full max-h-[52vh] md:max-h-[82vh] object-contain rounded-md select-none"
          />
        </div>

        {Boolean(postText || authorName) && (
          <div className="w-full md:w-80 lg:w-96 bg-white flex flex-col border-t md:border-t-0 md:border-l border-slate-200 shrink-0">
            {authorName && (
              <div className="p-4 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-slate-800">{authorName}</h4>
                {authorUsername && (
                  <p className="text-xs text-slate-400">@{authorUsername}</p>
                )}
              </div>
            )}
            <div className="p-4 flex-1 overflow-y-auto max-h-48 md:max-h-[60vh]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Post Caption
              </p>
              <div className="text-sm text-slate-800 whitespace-pre-wrap break-words leading-relaxed">
                {postText || <span className="text-slate-400 italic">No text caption</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
