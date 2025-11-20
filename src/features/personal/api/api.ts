import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';
import type * as Unified from '@/lib/types/unified.types';
import * as transformers from '@/lib/transformers';

export type PersonalInfo = {
  age: number;
  weight: number;
  height: number;
  body_fat_percentage?: number;
};

export type FitnessProfile = {
  experience_level: string;
  primary_goal: string;
  secondary_goals?: string[];
  workout_frequency: string;
  preferred_workout_duration: number;
  available_equipment?: string[];
  injury_history?: string;
  medical_restrictions?: string;
};

export type PersonalData = {
  info: PersonalInfo;
  fitness: FitnessProfile;
};

/**
 * Get complete personal data (info + fitness profile)
 */
export async function getPersonalData() {
  apiLogger.info({ endpoint: '/api/v1/personal' }, 'Get personal data request');
  try {
    const wrappedRes = await http.get<ApiResponse<PersonalData>>('/api/v1/personal');
    const data = wrappedRes?.data;
    if (!data) throw new Error('No personal data in response');
    apiLogger.info({}, 'Get personal data success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/personal' });
    throw err;
  }
}

/**
 * Get physical information only
 */
export async function getPersonalInfo() {
  apiLogger.info({ endpoint: '/api/v1/personal/info' }, 'Get personal info request');
  try {
    const wrappedRes = await http.get<ApiResponse<Unified.UserPersonalInfo>>('/api/v1/personal/info');
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No personal info in response');

    // Transform personal info
    const transformed = transformers.userTransformers.transformPersonalInfo(rawData);
    apiLogger.info({}, 'Get personal info success');
    return transformed;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/personal/info' });
    throw err;
  }
}

/**
 * Update personal physical information
 */
export async function updatePersonalInfo(request: Partial<PersonalInfo>) {
  apiLogger.info({ endpoint: '/api/v1/personal/info' }, 'Update personal info request');
  try {
    const wrappedRes = await http.put<ApiResponse<Unified.UserPersonalInfo>>('/api/v1/personal/info', request);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No personal info in response');

    // Transform personal info
    const transformed = transformers.userTransformers.transformPersonalInfo(rawData);
    apiLogger.info({}, 'Update personal info success');
    return transformed;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/personal/info' });
    throw err;
  }
}

/**
 * Get fitness profile
 */
export async function getFitnessProfile() {
  apiLogger.info({ endpoint: '/api/v1/personal/fitness' }, 'Get fitness profile request');
  try {
    const wrappedRes = await http.get<ApiResponse<any>>('/api/v1/personal/fitness');
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No fitness profile in response');

    // Transform fitness profile (using generic transformer)
    const transformed = transformers.transformResponseKeys(rawData);
    apiLogger.info({}, 'Get fitness profile success');
    return transformed;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/personal/fitness' });
    throw err;
  }
}

/**
 * Create or update fitness profile
 */
export async function updateFitnessProfile(request: Partial<FitnessProfile>) {
  apiLogger.info({ endpoint: '/api/v1/personal/fitness' }, 'Update fitness profile request');
  try {
    const wrappedRes = await http.put<ApiResponse<any>>('/api/v1/personal/fitness', request);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No fitness profile in response');

    // Transform fitness profile (using generic transformer)
    const transformed = transformers.transformResponseKeys(rawData);
    apiLogger.info({}, 'Update fitness profile success');
    return transformed;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/personal/fitness' });
    throw err;
  }
}
