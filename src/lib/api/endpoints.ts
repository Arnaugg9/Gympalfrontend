/**
 * API Endpoints
 * Define all API endpoints here for easy management
 */

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    me: '/api/v1/auth/me',
    verifyEmail: '/api/v1/auth/verify-email',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
    changePassword: '/api/v1/auth/change-password',
  },

  // Users
  users: {
    getProfile: '/api/v1/users/profile',
    updateProfile: '/api/v1/users/profile',
    getById: (id: string) => `/api/v1/users/${id}`,
    search: '/api/v1/users/search',
  },

  // Workouts
  workouts: {
    list: '/api/v1/workouts',
    create: '/api/v1/workouts',
    getById: (id: string) => `/api/v1/workouts/${id}`,
    update: (id: string) => `/api/v1/workouts/${id}`,
    delete: (id: string) => `/api/v1/workouts/${id}`,
  },

  // Exercises
  exercises: {
    list: '/api/v1/exercises',
    getById: (id: string) => `/api/v1/exercises/${id}`,
    getByCategory: (category: string) => `/api/v1/exercises/category/${category}`,
  },

  // Progress
  progress: {
    list: '/api/v1/progress',
    create: '/api/v1/progress',
    getById: (id: string) => `/api/v1/progress/${id}`,
    update: (id: string) => `/api/v1/progress/${id}`,
  },

  // Diet
  diet: {
    list: '/api/v1/diet',
    create: '/api/v1/diet',
    getById: (id: string) => `/api/v1/diet/${id}`,
    update: (id: string) => `/api/v1/diet/${id}`,
  },

  // Social
  social: {
    users: '/api/v1/social/users',
    getUser: (userId: string) => `/api/v1/social/users/${userId}`,
    follow: '/api/v1/social/follow',
    unfollow: '/api/v1/social/unfollow',
  },
};

// Export lowercase version for backward compatibility
export const endpoints = API_ENDPOINTS;
