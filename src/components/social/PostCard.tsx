'use client';

import { memo, useState, useCallback } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Repeat2, UserPlus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ImageViewer } from '@/components/shared/ImageViewer';

const resolveLocale = (lang: string) => {
  if (lang?.startsWith('es')) return 'es-ES';
  if (lang?.startsWith('ca')) return 'ca-ES';
  if (lang?.startsWith('fr')) return 'fr-FR';
  return 'en-US';
};

type Post = {
  id: string;
  content: string;
  likesCount?: number;
  commentsCount?: number;
  reposts_count?: number;
  createdAt?: string;
  image_urls?: string[];
  author?: { id: string; username?: string; fullName?: string; email?: string; avatar?: string; isFollowing?: boolean };
  isLiked?: boolean;
  userId?: string;
  workout_id?: string;
  workout?: {
    id: string;
    name: string;
    description?: string;
    difficulty?: string;
    duration_minutes?: number;
  };
  isRepost?: boolean;
  repostedBy?: {
    id: string;
    username?: string;
    fullName?: string;
  };
  repostedAt?: string;
  originalPost?: Post;
};

type PostCardProps = {
  post: Post;
  currentUserId: string | null;
  liked: Record<string, boolean>;
  followed: Record<string, boolean>;
  reposted: Record<string, boolean>;
  initialReposted: Record<string, boolean>;
  showComments?: Record<string, boolean>;
  onLike: (postId: string) => void;
  onFollow: (userId: string) => void;
  onRepost: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onLoadComments: (postId: string) => void;
  onCopyWorkout?: (workoutId: string) => void;
  formatDateTime: (value?: string) => string;
};

const PostCard = memo(function PostCard({
  post,
  currentUserId,
  liked,
  followed,
  reposted,
  initialReposted,
  showComments = {},
  onLike,
  onFollow,
  onRepost,
  onDelete,
  onLoadComments,
  onCopyWorkout,
  formatDateTime,
}: PostCardProps) {
  const { t } = useTranslation();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  const handleImageLoad = useCallback((url: string) => {
    setImageLoaded(prev => ({ ...prev, [url]: true }));
  }, []);

  const displayPost = post.isRepost && post.originalPost ? post.originalPost : post;
  const isLiked = liked[displayPost.id] || displayPost.isLiked;
  const isReposted = reposted[displayPost.id];
  const isFollowing = displayPost.author?.id ? (followed[displayPost.author.id] || displayPost.author.isFollowing) : false;

  return (
    <article className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all cursor-pointer">
      {/* Repost Header */}
      {post.isRepost && post.repostedBy && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-1 text-xs text-slate-500 dark:text-slate-400">
          <Repeat2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>
            {t('social.repostedBy', { 
              user: post.repostedBy.id === currentUserId ? t('social.you') : post.repostedBy.username || t('social.someone') 
            })}
          </span>
        </div>
      )}

      <div className="px-4 py-3 flex gap-3" onClick={(e) => {
        // Allow clicks on buttons/links to work, but make the post clickable
        if ((e.target as HTMLElement).closest('button, a')) return;
      }}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="h-12 w-12 ring-2 ring-slate-200 dark:ring-slate-700">
            <AvatarImage src={displayPost.author?.avatar} />
            <AvatarFallback className="bg-emerald-500 text-white text-sm font-semibold">
              {(displayPost.author?.fullName || displayPost.author?.username || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900 dark:text-white text-[15px] leading-5">
                {displayPost.author?.fullName || displayPost.author?.username || t('social.userFallback')}
              </h3>
              <span className="text-slate-500 dark:text-slate-400 text-[15px]">
                @{displayPost.author?.username || 'user'}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[15px]">·</span>
              <time className="text-slate-500 dark:text-slate-400 text-[15px] hover:underline" title={displayPost.createdAt ? new Date(displayPost.createdAt).toLocaleString() : ''}>
                {displayPost.createdAt && (() => {
                  const date = new Date(displayPost.createdAt);
                  const now = new Date();
                  const diffMs = now.getTime() - date.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);
                  
                  if (diffMins < 1) return 'now';
                  if (diffMins < 60) return `${diffMins}m`;
                  if (diffHours < 24) return `${diffHours}h`;
                  if (diffDays < 7) return `${diffDays}d`;
                  return formatDateTime(displayPost.createdAt);
                })()}
              </time>
            </div>
            <div className="flex items-center gap-1">
              {currentUserId && displayPost.author?.id && displayPost.author.id !== currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFollow(displayPost.author!.id!)}
                  className={`h-8 px-4 rounded-full text-sm font-semibold transition-colors ${
                    isFollowing
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                      : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                  }`}
                >
                  {isFollowing ? t('social.following') : t('social.follow')}
                </Button>
              )}
              {currentUserId && displayPost.userId === currentUserId && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(displayPost.id);
                  }}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full opacity-80 hover:opacity-100 transition-opacity"
                  title={t('social.deletePost', { defaultValue: 'Delete post' })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div className="mb-3">
            <p className="text-[15px] text-slate-900 dark:text-white leading-6 whitespace-pre-wrap break-words">
              {displayPost.content}
            </p>
          </div>

          {/* Images - Lazy Loading with adaptive sizing */}
          {displayPost.image_urls && displayPost.image_urls.length > 0 && (
            <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              {displayPost.image_urls.length === 1 ? (
                <div className="relative w-full">
                  {displayPost.image_urls[0] && !imageLoaded[displayPost.image_urls[0]] && (
                    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse min-h-[200px] max-h-[600px]" />
                  )}
                  {displayPost.image_urls[0] && (
                    <img
                      src={displayPost.image_urls[0]}
                      alt="Post"
                      loading="lazy"
                      onLoad={() => {
                        const url = displayPost.image_urls?.[0];
                        if (url) handleImageLoad(url);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = displayPost.image_urls?.[0];
                        if (url) setPreviewImage(url);
                      }}
                      className="w-full h-auto max-h-[600px] min-h-[200px] object-contain cursor-pointer hover:opacity-95 transition-opacity"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className={`grid gap-0.5 ${displayPost.image_urls.length === 2 ? 'grid-cols-2' : displayPost.image_urls.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  {displayPost.image_urls.slice(0, 4).map((url, idx) => (
                    <div key={idx} className="relative aspect-square min-h-[150px] max-h-[300px]">
                      {!imageLoaded[url] && (
                        <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      )}
                      <img
                        src={url}
                        alt={`Post image ${idx + 1}`}
                        loading="lazy"
                        onLoad={() => handleImageLoad(url)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(url);
                        }}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      {idx === 3 && displayPost.image_urls && displayPost.image_urls.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">+{displayPost.image_urls.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Workout Reference */}
          {(displayPost.workout || displayPost.workout_id) && (
            <div className="mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{t('social.referencedWorkout')}</p>
                {displayPost.workout?.difficulty && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 capitalize font-medium">
                    {displayPost.workout.difficulty}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                {displayPost.workout?.name || t('social.workoutNameNotAvailable')}
              </p>
              {displayPost.workout?.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                  {displayPost.workout.description}
                </p>
              )}
              <div className="flex gap-2">
                <Link href={`/workouts/${displayPost.workout?.id || displayPost.workout_id}?from=social`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs font-medium border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  >
                    {t('social.viewWorkoutDetails')}
                  </Button>
                </Link>
                {onCopyWorkout && (
                  <Button
                    onClick={() => onCopyWorkout(displayPost.workout?.id || displayPost.workout_id!)}
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  >
                    {t('social.copyWorkout')}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Actions - Twitter style */}
          <div className="flex items-center justify-between max-w-md mt-1 -ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onLike(displayPost.id);
              }}
              className={`group h-9 px-3 rounded-full transition-colors ${
                isLiked
                  ? 'text-pink-500 bg-pink-50 dark:bg-pink-950/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/20'
              }`}
            >
              <Heart className={`h-5 w-5 mr-2 group-hover:scale-110 transition-transform ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{displayPost.likesCount ?? 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRepost(displayPost.id);
              }}
              className={`group h-9 px-3 rounded-full transition-colors ${
                isReposted
                  ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
              }`}
            >
              <Repeat2 className={`h-5 w-5 mr-2 group-hover:scale-110 transition-transform ${isReposted ? 'fill-current' : ''}`} />
              <span className="text-sm">{displayPost.reposts_count ?? 0}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onLoadComments(displayPost.id);
              }}
              className={`group h-9 px-3 rounded-full transition-colors ${
                showComments[displayPost.id]
                  ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-500'
                  : 'hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-600 dark:text-slate-400 hover:text-blue-500'
              }`}
            >
              <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm">{displayPost.commentsCount ?? 0}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Image Preview */}
      {previewImage && (
        <ImageViewer
          src={previewImage}
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </article>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;

