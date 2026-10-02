import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Video as VideoIcon, Link as LinkIcon, X, Send } from 'lucide-react';
import { Post } from '../types/index.js';
import { postService } from '../services/post.service.js';
import { useAuth } from '../context/AuthContext.js';
import { Avatar } from './Avatar.js';

interface CreatePostProps {
  onPostCreated: (newPost: Post) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlType, setUrlType] = useState<'image' | 'video'>('image');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileAccept, setFileAccept] = useState<string>('image/*');

  const handleFileClick = (accept: string) => {
    setFileAccept(accept);
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 25MB for video/image base64)
    if (file.size > 25 * 1024 * 1024) {
      setError('File size must be under 25MB');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (file.type.startsWith('image/')) {
          setImageUrl(reader.result);
          setVideoUrl('');
        } else if (file.type.startsWith('video/')) {
          setVideoUrl(reader.result);
          setImageUrl('');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setImageUrl('');
    setVideoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const createdPost = await postService.createPost({
        content: content.trim(),
        imageUrl: imageUrl.trim() ? imageUrl.trim() : null,
        videoUrl: videoUrl.trim() ? videoUrl.trim() : null,
      });

      // Clear form
      setContent('');
      setImageUrl('');
      setVideoUrl('');
      setShowUrlInput(false);

      // Notify parent to prepend to feed
      onPostCreated(createdPost);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm transition">
      <div className="flex gap-3 items-start">
        {user && (
          <Avatar
            name={user.name}
            avatarUrl={user.avatarUrl}
            size="md"
          />
        )}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit}>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening? Share thoughts, #hashtags, photos or videos..."
              className="w-full text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-transparent border-0 focus:ring-0 p-0 resize-none focus:outline-none"
              maxLength={2000}
            />

            {/* Media Preview Box */}
            {(imageUrl || videoUrl) && (
              <div className="relative mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 max-h-72 flex items-center justify-center">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Upload Preview"
                    className="max-h-72 w-full object-contain"
                  />
                )}
                {videoUrl && (
                  <video
                    src={videoUrl}
                    controls
                    className="max-h-72 w-full object-contain"
                  />
                )}
                <button
                  type="button"
                  onClick={removeMedia}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition shadow-md"
                  title="Remove media"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* URL Input Box (alternative) */}
            {showUrlInput && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Paste {urlType === 'image' ? 'Image' : 'Video'} Web URL:
                  </span>
                  <div className="flex text-xs ml-auto gap-1">
                    <button
                      type="button"
                      onClick={() => setUrlType('image')}
                      className={`px-2 py-0.5 rounded ${urlType === 'image' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrlType('video')}
                      className={`px-2 py-0.5 rounded ${urlType === 'video' ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Video
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlType === 'image' ? imageUrl : videoUrl}
                    onChange={(e) => {
                      if (urlType === 'image') {
                        setImageUrl(e.target.value);
                        setVideoUrl('');
                      } else {
                        setVideoUrl(e.target.value);
                        setImageUrl('');
                      }
                    }}
                    placeholder={`https://example.com/media.${urlType === 'image' ? 'jpg' : 'mp4'}`}
                    className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(false)}
                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="mt-2 text-xs text-red-500 dark:text-red-400">{error}</p>
            )}

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept={fileAccept}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Controls Bar */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Upload Local Photo */}
                <button
                  type="button"
                  onClick={() => handleFileClick('image/*')}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Upload image from device"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Photo</span>
                </button>

                {/* Upload Local Video */}
                <button
                  type="button"
                  onClick={() => handleFileClick('video/*')}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Upload video from device"
                >
                  <VideoIcon className="w-4 h-4 text-sky-500" />
                  <span className="hidden sm:inline">Video</span>
                </button>

                {/* Paste URL */}
                <button
                  type="button"
                  onClick={() => setShowUrlInput((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition ${
                    showUrlInput
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title="Paste media link"
                >
                  <LinkIcon className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline">Web Link</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl transition shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
