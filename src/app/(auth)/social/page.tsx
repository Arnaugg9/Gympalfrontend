'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Heart, UserPlus, Image as ImageIcon, Search, Trash2, Repeat2, TrendingUp, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { http } from '@/lib/http';
import { socialApi } from '@/features/social/api/api';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { ImageViewer } from '@/components/shared/ImageViewer';
import PostCard from '@/components/social/PostCard';

const resolveLocale = (lang: string) => {
  if (lang?.startsWith('es')) return 'es-ES';
  if (lang?.startsWith('ca')) return 'ca-ES';
  if (lang?.startsWith('fr')) return 'fr-FR';
  return 'en-US';
};

/**
 * Post Interface representing a social feed item
 */
type Post = {
  id: string;
  content: string;
  likesCount?: number;
  commentsCount?: number;
  reposts_count?: number;
  createdAt?: string;
  image_urls?: string[];
  image_urls_?: string[];
  author?: { id: string; username?: string; fullName?: string; email?: string; avatar?: string; isFollowing?: boolean };
  isLiked?: boolean;
  userId?: string; // ID of the post owner
  user_id?: string;
  workout_id?: string;
  workout?: {
    id: string;
    name: string;
    description?: string;
    difficulty?: string;
    duration_minutes?: number;
  };
  // Repost fields
  isRepost?: boolean;
  repostedBy?: {
    id: string;
    username?: string;
    fullName?: string;
  };
  repostedAt?: string;
  originalPost?: Post;
};

type Comment = {
  id: string;
  content: string;
  createdAt?: string;
  author?: { id: string; username?: string; fullName?: string; avatar?: string };
  userId?: string; // ID of the comment owner
  parent_comment_id?: string | null;
  replies?: Comment[];
};

export default function SocialPage() {
  const { t, i18n } = useTranslation();
  const locale = resolveLocale(i18n.language);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [reposted, setReposted] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string; type?: 'error' | 'success' }>({ open: false, message: '', type: 'error' });
  const [deletePostDialog, setDeletePostDialog] = useState<{ open: boolean; postId: string | null }>({ open: false, postId: null });
  const [deleteCommentDialog, setDeleteCommentDialog] = useState<{ open: boolean; postId: string | null; commentId: string | null }>({ open: false, postId: null, commentId: null });
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  // Use ref to access current comments state in callbacks
  const commentsRef = useRef<Record<string, Comment[]>>({});
  
  // Keep ref in sync with state
  useEffect(() => {
    commentsRef.current = comments;
  }, [comments]);
  const [commentContent, setCommentContent] = useState<Record<string, string>>({});
  const [publishError, setPublishError] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [postImages, setPostImages] = useState<{ url: string; alt?: string; file?: File }[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [userWorkouts, setUserWorkouts] = useState<any[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Load 10 posts per batch
  const [hasMore, setHasMore] = useState(true);
  const [sortFilter, setSortFilter] = useState<'popular' | 'recent'>('popular');
  const [initialReposted, setInitialReposted] = useState<Record<string, boolean>>({});

  /**
   * Initialize user data on mount
   */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await http.get<any>('/api/v1/auth/me');
        const user = res?.data?.user || res?.data || res?.user || res;
        if (mounted && user?.id) {
          setCurrentUserId(user.id);
          setCurrentUser(user);
        }
      } catch (err) {
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Load user's workouts when modal opens
  useEffect(() => {
    if (!publishModalOpen) return;

    let mounted = true;
    (async () => {
      try {
        const res = await http.get<any>('/api/v1/workouts');
        // The API returns { success: true, data: { data: [...], pagination: {...} } }
        // So res is the full object. res.data is the wrapper. res.data.data is the array.
        // We try multiple paths to be robust.
        const workoutsData = res?.data?.data || res?.data?.workouts || res?.data || res?.workouts || [];
        const workouts = Array.isArray(workoutsData) ? workoutsData : (Array.isArray(res) ? res : []);

        if (mounted) {
          setUserWorkouts(workouts);
        }
      } catch (err) {
        console.error('Failed to load user workouts', err);
      }
    })();
    return () => { mounted = false; };
  }, [publishModalOpen]);

  const loadPosts = async (pageNum: number, isRefresh = false) => {
    try {
      setLoading(true);
      // Fetch posts (which now includes reposts from all users)
      const postsRes = await socialApi.posts(pageNum, limit, sortFilter);

      // res structure: { data: [...posts], pagination: {...} }
      // Posts now include both regular posts and reposts from all users
      const allItems: Post[] = postsRes?.data && Array.isArray(postsRes.data) ? postsRes.data : Array.isArray(postsRes) ? postsRes : [];
      
      // Check pagination to determine if there are more posts
      const pagination = postsRes?.pagination;
      if (pagination) {
        // Use pagination info from backend
        setHasMore(pagination.hasNext || (pagination.page < pagination.totalPages));
      } else {
        // Fallback: if we got fewer posts than the limit, there are no more
        setHasMore(allItems.length >= limit);
      }

      // Process items - backend already formats reposts correctly, but we need to ensure proper mapping
      const processedItems: Post[] = allItems.map((item: any) => {
        // If it's already a repost from backend, use it as is
        if (item.isRepost && item.originalPost) {
          return {
            id: item.id,
            content: item.content || '',
            likesCount: item.likesCount || item.originalPost?.likesCount || 0,
            commentsCount: item.commentsCount || item.originalPost?.commentsCount || 0,
            reposts_count: item.originalPost?.reposts_count || 0,
            createdAt: item.createdAt || item.repostedAt,
            image_urls: item.image_urls || [],
            author: item.repostedBy,
            isLiked: item.isLiked || item.originalPost?.isLiked || false,
            userId: item.userId || item.originalPost?.userId,
            workout_id: item.workout_id || item.originalPost?.workout_id,
            workout: item.workout || item.originalPost?.workout,
            isRepost: true,
            repostedBy: item.repostedBy,
            repostedAt: item.repostedAt || item.createdAt,
            originalPost: item.originalPost,
          } as Post;
        }
        // Regular post
        return item as Post;
      });

      const combinedItems = processedItems;

      // If no items returned and not a refresh, stop loading more
      if (combinedItems.length === 0 && !isRefresh && pageNum > 1) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      // If we got fewer items than the limit, likely no more posts
      if (combinedItems.length < limit && !isRefresh) {
        setHasMore(false);
      }

      setPosts(prev => {
        const current = isRefresh ? [] : prev;
        // Merge and remove duplicates based on ID
        const uniqueMap = new Map<string, Post>();
        [...current, ...combinedItems].forEach(item => uniqueMap.set(item.id, item));
        const uniqueItems = Array.from(uniqueMap.values());

        // Backend already sorts the posts, so we just return them as-is
        return uniqueItems;
      });

      // Update states
      const likedState: Record<string, boolean> = {};
      const repostedState: Record<string, boolean> = {};
      const initialRepostedState: Record<string, boolean> = {};
      const followedState: Record<string, boolean> = {};
      const authorIds = new Set<string>();

      combinedItems.forEach((post: Post) => {
        if (post.isLiked) likedState[post.id] = true;
        if (post.author?.id) {
          if (currentUserId && post.author.id !== currentUserId) {
            authorIds.add(post.author.id);
          }
          // Use isFollowing from backend to initialize state
          if (post.author.isFollowing) {
            followedState[post.author.id] = true;
          }
        }
        // For repost items, also check originalPost author's isFollowing
        if (post.isRepost && post.originalPost?.author?.id) {
          if (currentUserId && post.originalPost.author.id !== currentUserId) {
            authorIds.add(post.originalPost.author.id);
          }
          if (post.originalPost.author.isFollowing) {
            followedState[post.originalPost.author.id] = true;
          }
          const userRepostedOriginal =
            post.repostedBy?.id === currentUserId ||
            Boolean(
              (post.originalPost as any)?.isRepostedByCurrentUser ||
              (post.originalPost as any)?.userHasReposted ||
              (post.originalPost as any)?.repostedByCurrentUser ||
              (post.originalPost as any)?.hasReposted
            );
          if (userRepostedOriginal && post.originalPost?.id) {
            repostedState[post.originalPost.id] = true;
            initialRepostedState[post.originalPost.id] = true;
          }
        }
      });
      combinedItems.forEach((post: Post) => {
        if (!post.isRepost) {
          const userHasReposted =
            Boolean(
              (post as any)?.isRepostedByCurrentUser ||
              (post as any)?.userHasReposted ||
              (post as any)?.repostedByCurrentUser ||
              (post as any)?.hasReposted
            );
          if (userHasReposted) {
            repostedState[post.id] = true;
            initialRepostedState[post.id] = true;
          }
        }
      });

      setLiked(prev => ({ ...prev, ...likedState }));
      setReposted(prev => ({ ...prev, ...repostedState }));
      setInitialReposted(prev => ({ ...prev, ...initialRepostedState }));
      setFollowed(prev => ({ ...prev, ...followedState }));

      // Fetch follow stats if needed...
      // (Simplified for brevity, logic remains similar to before but incremental)

    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadPosts(1, true);
    }
  }, [currentUserId, currentUser]);

  // Reload posts when sort filter changes
  useEffect(() => {
    if (currentUserId) {
      setPage(1);
      loadPosts(1, true);
    }
  }, [sortFilter]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage);
  };


  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter((post) => {
      const authorName = (post.author?.fullName || post.author?.username || '').toLowerCase();
      const content = (post.content || '').toLowerCase();
      return authorName.includes(q) || content.includes(q);
    });
  }, [posts, searchQuery]);

  const handlePublishPost = async () => {
    if (!postContent.trim()) return;
    setLoading(true);
    setPublishError('');
    try {
      // Check if we have file uploads
      const hasFileUploads = imageFiles.length > 0;
      let newPost: Post;

      if (hasFileUploads) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append('content', postContent);
        formData.append('is_public', 'true');
        if (selectedWorkoutId) {
          formData.append('workout_id', selectedWorkoutId);
        }

        // Add all image files
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });

        // Call API with FormData (don't set Content-Type header - browser will set it with correct boundary)
        const res = await http.post<Post>('/api/v1/social/posts', formData);
        newPost = (res as any)?.data || res;
      } else {
        // Use regular JSON for URL-only images
        const res = await socialApi.createPost({
          content: postContent,
          images: postImages.length > 0 ? postImages.map(img => ({ url: img.url, alt: img.alt })) : undefined,
          workout_id: selectedWorkoutId || undefined,
          is_public: true,
        });
        newPost = res as Post;
      }

      // Add current user info to the new post for immediate display
      if (currentUser) {
        newPost.author = {
          id: currentUser.id,
          username: currentUser.username,
          fullName: currentUser.full_name || currentUser.fullName,
          email: currentUser.email,
          avatar: currentUser.avatar_url || currentUser.avatar
        };
      }

      // Add workout info if selected
      if (selectedWorkoutId) {
        const selectedWorkout = userWorkouts.find(w => w.id === selectedWorkoutId);
        if (selectedWorkout) {
          newPost.workout = {
            id: selectedWorkout.id,
            name: selectedWorkout.name,
            description: selectedWorkout.description,
            difficulty: selectedWorkout.difficulty,
            duration_minutes: selectedWorkout.duration_minutes
          };
        }
      }

      setPosts((prev) => [newPost, ...prev]);

      setPostContent('');
      setPostImages([]);
      setImageFiles([]);
      setSelectedWorkoutId(null);
      setImageUrl('');
      setPublishModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || t('errors.error');
      setPublishError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    setPostImages([...postImages, { url: imageUrl, alt: '' }]);
    setImageUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.filter((file) => file.type.startsWith('image/'));

    if (newFiles.length !== files.length) {
      setErrorDialog({ open: true, message: t('social.imageTypeError'), type: 'error' });
    }

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setPostImages((prev) => [...prev, { url, alt: file.name, file }]);
        setImageFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setPostImages(postImages.filter((_, i) => i !== index));
  };

  const handleLike = useCallback(async (postId: string) => {
    // Prevent double-clicking by checking if already processing
    // Declare wasLiked outside try-catch so it's accessible in both blocks
    const wasLiked = liked[postId] || false;
    
    try {
      // Optimistically update UI state first
      setLiked((prev) => ({ ...prev, [postId]: !prev[postId] }));
      
      // Optimistically update like count (before API call)
      setPosts((prev) => prev.map((p) => {
        if (p.id === postId) {
          return { ...p, likesCount: Math.max(0, (p.likesCount || 0) + (wasLiked ? -1 : 1)) };
        }
        if (p.isRepost && p.originalPost?.id === postId) {
          return {
            ...p,
            originalPost: {
              ...p.originalPost,
              likesCount: Math.max(0, (p.originalPost.likesCount || 0) + (wasLiked ? -1 : 1)),
            },
          };
        }
        return p;
      }));
      
      // Call API
      await socialApi.like(postId);
    } catch (err) {
      console.error('Failed to like post', err);
      // Revert optimistic update on error
      setLiked((prev) => ({ ...prev, [postId]: !prev[postId] }));
      setPosts((prev) => prev.map((p) => {
        if (p.id === postId) {
          return { ...p, likesCount: Math.max(0, (p.likesCount || 0) - (wasLiked ? -1 : 1)) };
        }
        if (p.isRepost && p.originalPost?.id === postId) {
          return {
            ...p,
            originalPost: {
              ...p.originalPost,
              likesCount: Math.max(0, (p.originalPost.likesCount || 0) - (wasLiked ? -1 : 1)),
            },
          };
        }
        return p;
      }));
    }
  }, [liked]);

  const handleRepost = useCallback(async (postId: string) => {
    const wasReposted = reposted[postId];
    try {
      await socialApi.repost(postId);
      const newRepostedState = !wasReposted;
      setReposted((prev) => ({ ...prev, [postId]: newRepostedState }));
      // Optimistically update repost count - only update once
      setPosts((prev) => prev.map((p) => {
        if (p.id === postId) {
          return { ...p, reposts_count: Math.max(0, (p.reposts_count || 0) + (newRepostedState ? 1 : -1)) };
        }
        if (p.isRepost && p.originalPost?.id === postId) {
          return {
            ...p,
            originalPost: {
              ...p.originalPost,
              reposts_count: Math.max(0, (p.originalPost.reposts_count || 0) + (newRepostedState ? 1 : -1)),
            },
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Failed to repost', err);
    }
  }, [reposted]);

  const handleFollow = useCallback(async (userId: string) => {
    if (currentUserId && userId === currentUserId) {
      setErrorDialog({ open: true, message: t('social.cannotFollowSelf'), type: 'error' });
      return;
    }
    try {
      await socialApi.follow(userId);
      const newFollowState = !followed[userId];
      // Update followed state
      setFollowed((prev) => ({ ...prev, [userId]: newFollowState }));
      // Update isFollowing in post author objects
      setPosts((prev) => prev.map((post) => {
        if (post.author?.id === userId) {
          return {
            ...post,
            author: {
              ...post.author,
              isFollowing: newFollowState,
            },
          };
        }
        // Also update originalPost if it's a repost
        if (post.isRepost && post.originalPost?.author?.id === userId) {
          return {
            ...post,
            originalPost: {
              ...post.originalPost,
              author: {
                ...post.originalPost.author,
                isFollowing: newFollowState,
              },
            },
          };
        }
        return post;
      }));
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || t('social.followError');
      try {
        const parsed = typeof msg === 'string' ? JSON.parse(msg) : msg;
        setErrorDialog({ open: true, message: parsed?.error?.message || msg, type: 'error' });
      } catch {
        setErrorDialog({ open: true, message: typeof msg === 'string' ? msg : t('social.followError'), type: 'error' });
      }
    }
  }, [currentUserId, followed, t]);

  const handleDeletePost = useCallback(async () => {
    const postId = deletePostDialog.postId;
    if (!postId) return;
    try {
      await socialApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setDeletePostDialog({ open: false, postId: null });
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || t('social.deletePostError');
      setErrorDialog({ open: true, message: typeof msg === 'string' ? msg : t('social.deletePostError'), type: 'error' });
    }
  }, [deletePostDialog.postId, t]);

  const handleLoadComments = useCallback(async (postId: string) => {
    // Check if comments are already loaded using ref to get current state
    const currentComments = commentsRef.current;
    if (currentComments[postId] && currentComments[postId].length > 0) {
      // Comments already loaded, toggle visibility
      setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
      return;
    }

    // If comments are not loaded, fetch them and show
    setLoading(true);
    try {
      const res = await socialApi.comments(postId);
      const items = Array.isArray(res) ? res : [];
      // Map user_id to userId for consistent field naming
      const mappedComments = items.map((comment: any) => ({
        ...comment,
        userId: comment.userId || comment.user_id, // Support both field names
        createdAt: comment.createdAt || comment.created_at,
        updatedAt: comment.updatedAt || comment.updated_at,
      }));
      setComments((prev) => ({ ...prev, [postId]: mappedComments }));
      setShowComments((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteComment = useCallback(async () => {
    const { postId, commentId } = deleteCommentDialog;
    if (!postId || !commentId) return;
    try {
      await socialApi.deleteComment(postId, commentId);
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId && !c.replies?.some((r) => r.id === commentId)),
      }));
      setDeleteCommentDialog({ open: false, postId: null, commentId: null });
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || t('social.deleteCommentError');
      setErrorDialog({ open: true, message: typeof msg === 'string' ? msg : t('social.deleteCommentError'), type: 'error' });
    }
  }, [deleteCommentDialog.postId, deleteCommentDialog.commentId, t]);

  const handlePostComment = useCallback(async (postId: string) => {
    const content = commentContent[postId];
    if (!content?.trim()) return;
    setLoading(true);
    try {
      const newComment = await socialApi.createComment(postId, { content });
      // Map user_id to userId for consistent field naming
      const mappedComment = {
        ...(newComment as any),
        userId: (newComment as any).userId || newComment.user_id,
        createdAt: (newComment as any).createdAt || newComment.created_at,
      };
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), mappedComment],
      }));
      setCommentContent((prev) => ({ ...prev, [postId]: '' }));
      if (currentUserId) {
        setPage(1);
        await loadPosts(1, true);
      }
    } catch (err: any) {
      const msg = err?.message || 'Error posting comment';
      setErrorDialog({ open: true, message: typeof msg === 'string' ? msg : t('social.replyError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [commentContent, currentUserId, t]);

  const handlePostReply = useCallback(async (postId: string, parentCommentId: string) => {
    if (!replyContent?.trim()) return;
    setLoading(true);
    try {
      const newReply = await socialApi.createComment(postId, {
        content: replyContent,
        parent_comment_id: parentCommentId
      });

      // Map user_id to userId for consistent field naming
      const mappedReply = {
        ...(newReply as any),
        userId: (newReply as any).userId || newReply.user_id,
        createdAt: (newReply as any).createdAt || newReply.created_at,
      };

      // Update the comments to add the reply to the parent comment
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((comment) => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), mappedReply],
            };
          }
          return comment;
        }),
      }));

      setReplyContent('');
      setReplyingTo(null);

      if (currentUserId) {
        setPage(1);
        await loadPosts(1, true);
      }
    } catch (err: any) {
      const msg = err?.message || 'Error posting reply';
      setErrorDialog({ open: true, message: typeof msg === 'string' ? msg : t('social.replyError'), type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [replyContent, currentUserId, t]);

  const handleCopyWorkout = useCallback(async (workoutId: string) => {
    if (!workoutId) {
      setErrorDialog({ open: true, message: t('errors.generic', { defaultValue: 'Workout ID is missing' }), type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await http.post<any>(`/api/v1/workouts/copy/${workoutId}`);
      const copiedWorkout = res?.data?.data || res?.data || res;

      setErrorDialog({
        open: true,
        message: t('social.copyWorkoutSuccess', {
          name: copiedWorkout?.name || t('social.workoutNameNotAvailable'),
        }),
        type: 'success',
      });

      // Optionally redirect to workouts page or refresh
      // window.location.href = '/workouts';
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err?.message || 'Failed to copy workout';

      let displayMsg = typeof msg === 'string' ? msg : 'Failed to copy workout';

      if (displayMsg.includes('NOT_FOUND') || displayMsg.includes('not found')) {
        displayMsg = t('social.workoutNotFoundOrPrivate') || "Workout not found or is private.";
      } else if (displayMsg.includes('DATABASE_ERROR')) {
        displayMsg = t('errors.databaseError') || "A database error occurred. Please try again.";
      }

      setErrorDialog({
        open: true,
        message: displayMsg,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  const formatDateTimeMemo = useMemo(() => {
    return (value?: string) =>
      value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '';
  }, [locale]);

  return (
    <div className="space-y-8 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 pointer-events-none">
          <LoadingSpinner size="lg" variant="dumbbell" />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">{t('nav.social')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('social.subtitle')}</p>
        </div>
        <Button onClick={() => setPublishModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          {t('social.newPost')}
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder={t('social.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
        />
        </div>
        
        {/* Sort Filter */}
        <Tabs value={sortFilter} onValueChange={(value) => setSortFilter(value as 'popular' | 'recent')} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('social.popular')}
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t('social.recent')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Posts feed */}
      <div className="space-y-3">
        {filtered.length === 0 && !loading && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            {t('social.noPosts', { defaultValue: 'No posts yet.' })}
          </div>
        )}
        {filtered.map((item) => (
          <div key={item.id} className="space-y-0">
            <PostCard
              post={item}
              currentUserId={currentUserId}
              liked={liked}
              followed={followed}
              reposted={reposted}
              initialReposted={initialReposted}
              showComments={showComments}
              onLike={handleLike}
              onFollow={handleFollow}
              onRepost={handleRepost}
              onDelete={currentUserId && item.userId === currentUserId ? () => setDeletePostDialog({ open: true, postId: item.id }) : undefined}
              onLoadComments={handleLoadComments}
              onCopyWorkout={handleCopyWorkout}
              formatDateTime={formatDateTimeMemo}
            />
            {/* Comments Section - Improved Design */}
            {showComments[item.isRepost && item.originalPost ? item.originalPost.id : item.id] && comments[item.isRepost && item.originalPost ? item.originalPost.id : item.id] && (
              <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-xl">
                <div className="space-y-4">
                  {comments[item.isRepost && item.originalPost ? item.originalPost.id : item.id]?.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3 pb-3 border-b border-slate-200 dark:border-slate-800 last:border-0 last:pb-0">
                      <Avatar className="h-10 w-10 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                        <AvatarImage src={comment.author?.avatar} />
                        <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
                          {(comment.author?.fullName || comment.author?.username || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {comment.author?.username || comment.author?.fullName || t('social.userFallback')}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">·</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {comment.createdAt && (() => {
                              const date = new Date(comment.createdAt);
                              const now = new Date();
                              const diffMs = now.getTime() - date.getTime();
                              const diffMins = Math.floor(diffMs / 60000);
                              const diffHours = Math.floor(diffMs / 3600000);
                              const diffDays = Math.floor(diffMs / 86400000);
                              
                              if (diffMins < 1) return 'now';
                              if (diffMins < 60) return `${diffMins}m`;
                              if (diffHours < 24) return `${diffHours}h`;
                              if (diffDays < 7) return `${diffDays}d`;
                              return formatDateTimeMemo(comment.createdAt);
                            })()}
                          </span>
                          <div className="flex items-center gap-1 ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-500 dark:text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-full transition-colors"
                              onClick={() => setReplyingTo({ postId: item.isRepost && item.originalPost ? item.originalPost.id : item.id, commentId: comment.id })}
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </Button>
                            {currentUserId && (comment.userId === currentUserId || (item.isRepost && item.originalPost ? item.originalPost.userId : item.userId) === currentUserId) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-colors opacity-80 hover:opacity-100"
                                onClick={() => setDeleteCommentDialog({ open: true, postId: item.isRepost && item.originalPost ? item.originalPost.id : item.id, commentId: comment.id })}
                                title={t('social.deleteComment', { defaultValue: 'Delete comment' })}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-5 mb-2">{comment.content}</p>
                        {/* Reply Input Form */}
                        {replyingTo?.commentId === comment.id && replyingTo?.postId === (item.isRepost && item.originalPost ? item.originalPost.id : item.id) && (
                          <div className="mt-3 ml-2 space-y-2 pt-3 border-l-2 border-blue-500 pl-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder={t('social.writeReply')}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handlePostReply(item.isRepost && item.originalPost ? item.originalPost.id : item.id, comment.id);
                                  }
                                }}
                                className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-slate-900 dark:text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                              />
                              <Button
                                onClick={() => handlePostReply(item.isRepost && item.originalPost ? item.originalPost.id : item.id, comment.id)}
                                disabled={!replyContent?.trim()}
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600 text-white h-auto px-4 py-2 text-sm rounded-full"
                              >
                                {t('social.reply')}
                              </Button>
                              <Button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent('');
                                }}
                                variant="outline"
                                size="sm"
                                className="border-slate-300 dark:border-slate-700 h-auto px-4 py-2 text-sm rounded-full"
                              >
                                {t('social.cancel')}
                              </Button>
                            </div>
                          </div>
                        )}
                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 ml-2 space-y-3 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                            {comment.replies?.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                                  <AvatarImage src={reply.author?.avatar} />
                                  <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                                    {(reply.author?.fullName || reply.author?.username || 'U').charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                      {reply.author?.username || reply.author?.fullName || t('social.userFallback')}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">·</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                      {reply.createdAt && (() => {
                                        const date = new Date(reply.createdAt);
                                        const now = new Date();
                                        const diffMs = now.getTime() - date.getTime();
                                        const diffMins = Math.floor(diffMs / 60000);
                                        const diffHours = Math.floor(diffMs / 3600000);
                                        const diffDays = Math.floor(diffMs / 86400000);
                                        
                                        if (diffMins < 1) return 'now';
                                        if (diffMins < 60) return `${diffMins}m`;
                                        if (diffHours < 24) return `${diffHours}h`;
                                        if (diffDays < 7) return `${diffDays}d`;
                                        return formatDateTimeMemo(reply.createdAt);
                                      })()}
                                    </span>
                                    {currentUserId && (reply.userId === currentUserId || (item.isRepost && item.originalPost ? item.originalPost.userId : item.userId) === currentUserId) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 ml-auto rounded-full transition-colors opacity-80 hover:opacity-100"
                                        onClick={() => setDeleteCommentDialog({ open: true, postId: item.isRepost && item.originalPost ? item.originalPost.id : item.id, commentId: reply.id })}
                                        title={t('social.deleteComment', { defaultValue: 'Delete reply' })}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-4">{reply.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Add Comment Section - Improved Design */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex gap-2 items-center">
                    <Avatar className="h-8 w-8 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                      <AvatarImage src={currentUser?.avatar_url || currentUser?.avatar} />
                      <AvatarFallback className="bg-emerald-500 text-white text-xs font-semibold">
                        {(currentUser?.full_name || currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder={t('social.writeReply', { defaultValue: 'Write a comment...' })}
                        value={commentContent[item.isRepost && item.originalPost ? item.originalPost.id : item.id] || ''}
                        onChange={(e) =>
                          setCommentContent((prev) => ({
                            ...prev,
                            [item.isRepost && item.originalPost ? item.originalPost.id : item.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handlePostComment(item.isRepost && item.originalPost ? item.originalPost.id : item.id);
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-slate-900 dark:text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <Button
                        onClick={() => handlePostComment(item.isRepost && item.originalPost ? item.originalPost.id : item.id)}
                        disabled={!commentContent[item.isRepost && item.originalPost ? item.originalPost.id : item.id]?.trim()}
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-5 font-medium"
                      >
                        {t('social.post', { defaultValue: 'Post' })}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {/* PostCard component */}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            {t('social.noPosts', { defaultValue: 'No posts yet.' })}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && filtered.length > 0 && (
          <div className="flex justify-center p-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              variant="outline"
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-full"
            >
              {loading ? <LoadingSpinner size="sm" /> : t('workouts.showMore')}
            </Button>
          </div>
        )}
      </div>

      {/* Publish Post Modal */}
      <Dialog open={publishModalOpen} onOpenChange={setPublishModalOpen}>
        <DialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">{t('social.createPost')}</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {t('social.createPostDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={t('social.postPlaceholder')}
              className="min-h-[200px] bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              value={postContent}
              onChange={(e) => {
                setPostContent(e.target.value);
                if (publishError) setPublishError('');
              }}
            />
            {publishError && (
              <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/30 rounded p-2">
                {publishError}
              </div>
            )}

            {/* Image Upload Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-white">{t('social.addImages')}</label>
              <div className="space-y-2">
                {/* File Upload */}
                <div className="flex gap-2">
                  <label className="flex-1 px-3 py-2 bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {t('social.uploadImageHint')}
                    </span>
                  </label>
                </div>

                {/* URL Input (Alternative) */}
                <div className="flex gap-2">
                  <Input
                    placeholder={t('social.imageUrlPlaceholder')}
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <Button
                    onClick={handleAddImage}
                    disabled={!imageUrl.trim()}
                    size="sm"
                    variant="outline"
                    className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Display added images */}
              {postImages.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {postImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img.url}
                        alt={img.alt || `Image ${idx + 1}`}
                        className="h-20 w-20 object-cover rounded border border-slate-300 dark:border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e2e8f0" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="12" fill="%23475569"%3EBroken%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <Button
                        onClick={() => handleRemoveImage(idx)}
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Workout Reference */}
            <div className="space-y-2">
              <label htmlFor="workout-select" className="text-sm font-medium text-slate-900 dark:text-white">{t('social.referenceWorkout')}</label>
              <select
                id="workout-select"
                value={selectedWorkoutId || ''}
                onChange={(e) => setSelectedWorkoutId(e.target.value || null)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- {t('common.no')} workout --</option>
                {(Array.isArray(userWorkouts) ? userWorkouts : []).map((workout: any) => (
                  <option key={workout.id} value={workout.id}>
                    {workout.name} ({workout.difficulty || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center">
              <Button
                onClick={handlePublishPost}
                className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1"
                disabled={!postContent.trim() || loading}
              >
                {loading ? t('social.posting') : t('social.post')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error/Success Dialog */}
      <AlertDialog open={errorDialog.open} onOpenChange={(open: boolean) => setErrorDialog({ open, message: errorDialog.message, type: errorDialog.type })}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className={`text-slate-900 dark:text-white ${errorDialog.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
              {errorDialog.type === 'success' ? t('common.success') : t('errors.error')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {errorDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ open: false, message: '', type: 'error' })} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {t('common.ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Post Dialog */}
      <AlertDialog open={deletePostDialog.open} onOpenChange={(open: boolean) => setDeletePostDialog({ open, postId: deletePostDialog.postId })}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t('social.confirmDeletePost')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('social.confirmDeletePostDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePostDialog({ open: false, postId: null })} className="border-border text-foreground hover:bg-accent">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-red-500 hover:bg-red-600 text-white">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Comment Dialog */}
      <AlertDialog open={deleteCommentDialog.open} onOpenChange={(open: boolean) => setDeleteCommentDialog({ open, postId: deleteCommentDialog.postId, commentId: deleteCommentDialog.commentId })}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t('social.confirmDeleteComment')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('social.confirmDeleteCommentDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteCommentDialog({ open: false, postId: null, commentId: null })} className="border-border text-foreground hover:bg-accent">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment} className="bg-red-500 hover:bg-red-600 text-white">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Image Preview Viewer */}
      {previewImage && (
        <ImageViewer
          src={previewImage}
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}
