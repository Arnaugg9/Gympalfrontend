/**
 * API TRANSFORMATION LAYER
 *
 * Converts between backend (snake_case) and frontend (camelCase) representations.
 * This layer ensures consistency across the application while respecting
 * backend schema naming conventions.
 */

import type * as Unified from './types/unified.types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert snake_case string to camelCase
 */
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Recursively convert all object keys from snake_case to camelCase
 */
function transformKeysToCamel<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (Array.isArray(obj)) {
    return obj.map(v => (v !== null && typeof v === 'object' ? transformKeysToCamel(v) : v));
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = snakeToCamel(key);
      const value = obj[key];
      acc[camelKey] = value !== null && typeof value === 'object' ? transformKeysToCamel(value) : value;
      return acc;
    }, {} as Record<string, any>);
  }

  return obj;
}

// ============================================================================
// AUTH TRANSFORMERS
// ============================================================================

export const authTransformers = {
  /**
   * Transform backend AuthUser to frontend format
   */
  transformUser(user: Unified.AuthUser): any {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      emailVerified: user.email_verified,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  },

  /**
   * Transform backend AuthResponse to frontend format
   */
  transformAuthResponse(response: Unified.AuthResponse): any {
    return {
      user: this.transformUser(response.user),
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      tokenType: response.token_type,
    };
  },

  /**
   * Transform frontend LoginRequest to backend format
   */
  transformLoginRequest(request: any): Unified.LoginRequest {
    return {
      email: request.email,
      password: request.password,
    };
  },

  /**
   * Transform frontend RegisterRequest to backend format
   */
  transformRegisterRequest(request: any): Unified.RegisterRequest {
    return {
      email: request.email,
      password: request.password,
      username: request.username,
      full_name: request.fullName,
    };
  },
};

// ============================================================================
// USER/PROFILE TRANSFORMERS
// ============================================================================

export const userTransformers = {
  /**
   * Transform backend UserProfile to frontend format
   */
  transformProfile(profile: Unified.UserProfile): any {
    return {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      dateOfBirth: profile.date_of_birth,
      gender: profile.gender,
      fitnessLevel: profile.fitness_level,
      timezone: profile.timezone,
      language: profile.language,
      isActive: profile.is_active,
      emailVerified: profile.email_verified,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  },

  /**
   * Transform backend UserPersonalInfo to frontend format
   */
  transformPersonalInfo(info: Unified.UserPersonalInfo): any {
    return {
      id: info.id,
      userId: info.user_id,
      age: info.age,
      weightKg: info.weight_kg,
      heightCm: info.height_cm,
      bmi: info.bmi,
      bodyFatPercentage: info.body_fat_percentage,
      createdAt: info.created_at,
      updatedAt: info.updated_at,
    };
  },

  /**
   * Transform frontend UpdateProfileRequest to backend format
   */
  transformUpdateRequest(request: any): Unified.UpdateProfileRequest {
    return {
      full_name: request.fullName,
      avatar_url: request.avatarUrl,
      bio: request.bio,
      date_of_birth: request.dateOfBirth,
      gender: request.gender,
      fitness_level: request.fitnessLevel,
      timezone: request.timezone,
      language: request.language,
    };
  },
};

// ============================================================================
// EXERCISE TRANSFORMERS
// ============================================================================

export const exerciseTransformers = {
  /**
   * Transform backend Exercise to frontend format
   */
  transformExercise(exercise: Unified.Exercise): any {
    return {
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      muscleGroup: exercise.muscle_group,
      muscleGroups: exercise.muscle_groups,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      instructions: exercise.instructions,
      videoUrl: exercise.video_url,
      imageUrl: exercise.image_url,
      tags: exercise.tags,
      isPublic: exercise.is_public,
      createdBy: exercise.created_by,
      createdAt: exercise.created_at,
      updatedAt: exercise.updated_at,
    };
  },

  /**
   * Transform backend Exercise[] to frontend format
   */
  transformExercises(exercises: Unified.Exercise[]): any[] {
    return exercises.map(e => this.transformExercise(e));
  },

  /**
   * Transform frontend CreateExerciseRequest to backend format
   */
  transformCreateRequest(request: any): Unified.CreateExerciseRequest {
    return {
      name: request.name,
      description: request.description,
      muscle_group: request.muscleGroup,
      equipment: request.equipment,
      difficulty: request.difficulty,
      instructions: request.instructions,
      video_url: request.videoUrl,
      image_url: request.imageUrl,
      tags: request.tags,
      is_public: request.isPublic ?? true,
    };
  },
};

// ============================================================================
// WORKOUT TRANSFORMERS
// ============================================================================

export const workoutTransformers = {
  /**
   * Transform backend WorkoutExercise to frontend format
   */
  transformWorkoutExercise(ex: Unified.WorkoutExercise): any {
    return {
      id: ex.id,
      workoutId: ex.workout_id,
      exerciseId: ex.exercise_id,
      orderIndex: ex.order_index,
      sets: ex.sets,
      reps: ex.reps,
      weightKg: ex.weight_kg,
      restSeconds: ex.rest_seconds,
      notes: ex.notes,
      exercise: ex.exercise ? exerciseTransformers.transformExercise(ex.exercise) : undefined,
    };
  },

  /**
   * Transform backend Workout to frontend format
   */
  transformWorkout(workout: Unified.Workout): any {
    return {
      id: workout.id,
      userId: workout.user_id,
      name: workout.name,
      description: workout.description,
      type: workout.type,
      difficulty: workout.difficulty,
      durationMinutes: workout.duration_minutes,
      isTemplate: workout.is_template,
      isPublic: workout.is_public,
      isShared: workout.is_shared,
      targetGoal: workout.target_goal,
      targetLevel: workout.target_level,
      daysPerWeek: workout.days_per_week,
      equipmentRequired: workout.equipment_required,
      userNotes: workout.user_notes,
      tags: workout.tags,
      shareCount: workout.share_count,
      likeCount: workout.like_count,
      createdAt: workout.created_at,
      updatedAt: workout.updated_at,
      exercises: workout.exercises?.map(e => this.transformWorkoutExercise(e)),
    };
  },

  /**
   * Transform backend Workout[] to frontend format
   */
  transformWorkouts(workouts: Unified.Workout[]): any[] {
    return workouts.map(w => this.transformWorkout(w));
  },

  /**
   * Transform frontend CreateWorkoutRequest to backend format
   */
  transformCreateRequest(request: any): Unified.CreateWorkoutRequest {
    return {
      name: request.name,
      description: request.description,
      type: request.type,
      difficulty: request.difficulty,
      duration_minutes: request.durationMinutes,
      is_template: request.isTemplate ?? false,
      is_public: request.isPublic ?? false,
      target_goal: request.targetGoal,
      target_level: request.targetLevel,
      days_per_week: request.daysPerWeek,
      equipment_required: request.equipmentRequired,
      user_notes: request.userNotes,
      tags: request.tags,
    };
  },
};

// ============================================================================
// POST/SOCIAL TRANSFORMERS
// ============================================================================

export const postTransformers = {
  /**
   * Transform backend PostAuthor to frontend format
   */
  transformAuthor(author: Unified.PostAuthor): any {
    return {
      id: author.id,
      username: author.username,
      fullName: author.full_name,
      avatarUrl: author.avatar_url,
    };
  },

  /**
   * Transform backend Post to frontend format
   */
  transformPost(post: Unified.Post): any {
    return {
      id: post.id,
      userId: post.user_id,
      content: post.content,
      postType: post.post_type,
      workoutId: post.workout_id,
      imageUrls: post.image_urls,
      videoUrl: post.video_url,
      hashtags: post.hashtags,
      likesCount: post.likes_count,
      commentsCount: post.comments_count,
      sharesCount: post.shares_count,
      repostsCount: post.reposts_count,
      isPublic: post.is_public,
      isOriginal: post.is_original,
      originalPostId: post.original_post_id,
      sharedFromUserId: post.shared_from_user_id,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      author: post.author ? this.transformAuthor(post.author) : undefined,
      isLiked: post.is_liked,
    };
  },

  /**
   * Transform backend Post[] to frontend format
   */
  transformPosts(posts: Unified.Post[]): any[] {
    return posts.map(p => this.transformPost(p));
  },

  /**
   * Transform frontend CreatePostRequest to backend format
   */
  transformCreateRequest(request: any): Unified.CreatePostRequest {
    return {
      content: request.content,
      post_type: request.postType,
      workout_id: request.workoutId,
      image_urls: request.imageUrls,
      video_url: request.videoUrl,
      hashtags: request.hashtags,
      is_public: request.isPublic ?? true,
    };
  },

  /**
   * Transform backend PostComment to frontend format
   */
  transformComment(comment: Unified.PostComment): any {
    return {
      id: comment.id,
      postId: comment.post_id,
      userId: comment.user_id,
      content: comment.content,
      parentCommentId: comment.parent_comment_id,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author: comment.author ? this.transformAuthor(comment.author) : undefined,
      replies: comment.replies?.map(r => this.transformComment(r)),
    };
  },

  /**
   * Transform backend PostComment[] to frontend format
   */
  transformComments(comments: Unified.PostComment[]): any[] {
    return comments.map(c => this.transformComment(c));
  },

  /**
   * Transform frontend CreateCommentRequest to backend format
   */
  transformCreateCommentRequest(request: any): Unified.CreateCommentRequest {
    return {
      content: request.content,
      parent_comment_id: request.parentCommentId,
    };
  },
};

// ============================================================================
// PAGINATED LIST TRANSFORMERS
// ============================================================================

export const listTransformers = {
  /**
   * Transform paginated list with custom transformer
   */
  transformPaginatedList<T, U>(
    list: Unified.PaginatedList<T>,
    itemTransformer: (item: T) => U
  ): any {
    return {
      data: list.data.map(itemTransformer),
      pagination: {
        page: list.pagination.page,
        limit: list.pagination.limit,
        total: list.pagination.total,
        totalPages: list.pagination.total_pages,
        hasNext: list.pagination.has_next,
        hasPrev: list.pagination.has_prev,
      },
    };
  },

  /**
   * Transform paginated exercises
   */
  transformPaginatedExercises(list: Unified.PaginatedList<Unified.Exercise>): any {
    return this.transformPaginatedList(list, (ex) => exerciseTransformers.transformExercise(ex));
  },

  /**
   * Transform paginated workouts
   */
  transformPaginatedWorkouts(list: Unified.PaginatedList<Unified.Workout>): any {
    return this.transformPaginatedList(list, (w) => workoutTransformers.transformWorkout(w));
  },

  /**
   * Transform paginated posts
   */
  transformPaginatedPosts(list: Unified.PaginatedList<Unified.Post>): any {
    return this.transformPaginatedList(list, (p) => postTransformers.transformPost(p));
  },
};

// ============================================================================
// GENERIC FALLBACK TRANSFORMER
// ============================================================================

/**
 * Generic fallback transformer for new types that don't have specific transformers yet.
 * Applies key transformation but preserves data structure.
 */
export function transformResponseKeys<T>(data: T): Record<string, any> {
  if (Array.isArray(data)) {
    return data.map(item => (item !== null && typeof item === 'object' ? transformKeysToCamel(item) : item));
  }

  if (data !== null && typeof data === 'object') {
    return transformKeysToCamel(data as Record<string, any>);
  }

  return data as any;
}
