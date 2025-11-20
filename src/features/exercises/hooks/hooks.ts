import { useQuery } from '@tanstack/react-query';
import { exercisesApi } from '../api/api';

export function useExercises(params?: { page?: number; limit?: number; category?: string; muscleGroup?: string; equipment?: string }) {
  return useQuery({
    queryKey: ['exercises', params],
    queryFn: () => exercisesApi.list(
      params?.page || 1,
      params?.limit || 10,
      {
        category: params?.category,
        muscleGroup: params?.muscleGroup,
        equipment: params?.equipment,
      }
    ),
  });
}

export function useExercise(id: string) {
  return useQuery({ queryKey: ['exercises', id], queryFn: () => exercisesApi.get(id), enabled: !!id });
}

export function useExerciseCategories() {
  return useQuery({ queryKey: ['exercises','categories'], queryFn: () => exercisesApi.categories() });
}


