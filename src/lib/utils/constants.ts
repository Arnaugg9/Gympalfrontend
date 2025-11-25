/**
 * API Constants
 *
 * Configuration values for API client setup
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
                             process.env.NEXT_PUBLIC_API_BASE_URL || 
                             'http://localhost:3001';

export const API_TIMEOUT = 30000; // 30 seconds
