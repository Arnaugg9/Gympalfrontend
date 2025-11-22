import { http } from '@/lib/http';
import { endpoints } from '@/lib/api/endpoints';
import type { UserProfile, UpdateProfileRequest } from '../types';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';
import { socialApi } from '@/features/social/api/api';
import { workoutsApi } from '@/features/workouts/api/api';

/**
 * Personal info data interface
 */
export interface PersonalInfoData {
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  body_fat_percentage?: number;
}

/**
 * Fitness profile data interface
 */
export interface FitnessProfileData {
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  primary_goal?: string;
  secondary_goals?: string[];
  workout_frequency?: number;
  preferred_workout_duration?: number;
  available_equipment?: string[];
  workout_preferences?: Record<string, any>;
  injury_history?: string[];
  medical_restrictions?: string[];
  fitness_goals_timeline?: string;
  motivation_level?: number;
}

/**
 * Activity statistics interface
 */
export interface ActivityStats {
  totalWorkouts?: number;
  totalExercises?: number;
  totalPosts?: number;
  followers?: number;
  workout_count?: number;
  exercise_count?: number;
  post_count?: number;
  followers_count?: number;
}

export const profileApi = {
  // Get current user profile
  getProfile: () =>
    http.get<{ data: UserProfile }>(endpoints.auth.me),

  // Update user profile
  updateProfile: (body: UpdateProfileRequest) =>
    http.put<{ data: UserProfile }>(`${endpoints.auth.me}`, body),

  // Update bio
  updateBio: async (bio: string) => {
    const endpoint = '/api/v1/users/profile';
    apiLogger.info({ endpoint }, 'Updating bio');
    try {
      const response = await http.put<ApiResponse<any>>(endpoint, { bio });
      apiLogger.info('Bio updated successfully');
      return response?.data || response;
    } catch (err) {
      logError(err as Error, { endpoint });
      throw err;
    }
  },

  // Get user by ID
  getUserProfile: (userId: string) =>
    http.get<{ data: UserProfile }>(`/api/v1/users/${userId}`),

  // Upload avatar
  uploadAvatar: async (formData: FormData) => {
    const endpoint = '/api/v1/users/avatar';
    apiLogger.info({ endpoint }, 'Uploading avatar');
    try {
      // Don't set Content-Type header - let browser set it with boundary
      const response = await http.post<ApiResponse<UserProfile>>(endpoint, formData);
      apiLogger.info('Avatar uploaded successfully');
      return response?.data || response;
    } catch (err) {
      logError(err as Error, { endpoint });
      throw err;
    }
  },



  // Personal info methods
  updatePersonalInfo: async (data: PersonalInfoData) => {
    const endpoint = '/api/v1/personal/info';
    apiLogger.info({ endpoint }, 'Updating personal info');
    try {
      const response = await http.put<ApiResponse<any>>(endpoint, data);
      apiLogger.info('Personal info updated successfully');
      return response?.data || response;
    } catch (err) {
      logError(err as Error, { endpoint, data });
      throw err;
    }
  },

  getPersonalInfo: async () => {
    const endpoint = '/api/v1/personal/info';
    apiLogger.info({ endpoint }, 'Fetching personal info');
    try {
      const response = await http.get<ApiResponse<any>>(endpoint);
      apiLogger.info('Personal info retrieved successfully');
      return response?.data || response;
    } catch (err) {
      logError(err as Error, { endpoint });
      throw err;
    }
  },

  // Fitness profile methods
  updateFitnessProfile: async (data: FitnessProfileData) => {
    const endpoint = '/api/v1/personal/fitness';
    apiLogger.info({ endpoint }, 'Updating fitness profile');
    try {
      const response = await http.put<ApiResponse<any>>(endpoint, data);
      apiLogger.info('Fitness profile updated successfully');
      return response?.data || response;
    } catch (err) {
      logError(err as Error, { endpoint, data });
      throw err;
    }
  },

  getFitnessProfile: async () => {
    const endpoint = '/api/v1/personal/fitness';
    apiLogger.info({ endpoint }, 'Fetching fitness profile');
    try {
      const response = await http.get<ApiResponse<any>>(endpoint);
      apiLogger.info('Fitness profile retrieved successfully');
      return response?.data || response;
    } catch (err) {
      logError(err as Error, { endpoint });
      throw err;
    }
  },

  // Activity stats
  getActivityStats: async (userId?: string): Promise<ActivityStats> => {
    const endpoint = userId ? `/api/v1/users/${userId}/stats` : '/api/v1/users/stats';
    apiLogger.info({ endpoint }, 'Fetching activity stats');

    let followStats = { followersCount: 0, followingCount: 0, isFollowing: false };
    let postCount = 0;
    let workoutCount = 0;

    // Try to get stats if we have a userId
    if (userId) {
      try {
        const [followRes, postRes, workoutRes] = await Promise.all([
          socialApi.getFollowStats(userId).catch(() => null),
          socialApi.getPostCount(userId).catch(() => 0),
          workoutsApi.getWorkoutCount(userId).catch(() => 0)
        ]);

        if (followRes) {
          followStats = followRes;
        }
        postCount = postRes || 0;
        workoutCount = workoutRes || 0;
      } catch (e) {
        // Ignore error
      }
    }

    try {
      const response = await http.get<ApiResponse<ActivityStats>>(endpoint);
      apiLogger.info('Activity stats retrieved successfully');
      const data = response?.data || response;
      // Ensure we return the correct shape
      return {
        totalWorkouts: workoutCount || (data as any)?.workout_count || (data as any)?.totalWorkouts || 0,
        totalExercises: (data as any)?.exercise_count || (data as any)?.totalExercises || 0,
        totalPosts: postCount || (data as any)?.post_count || (data as any)?.totalPosts || 0,
        followers: followStats.followersCount || (data as any)?.followers_count || (data as any)?.followers || 0,
      };
    } catch (err) {
      logError(err as Error, { endpoint });
      return {
        totalWorkouts: workoutCount || 0,
        totalExercises: 0,
        totalPosts: postCount || 0,
        followers: followStats.followersCount || 0,
      };
    }
  },
};
