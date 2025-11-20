import { useQuery } from '@tanstack/react-query';
import { getDashboard, getDashboardStats } from '../api/api';

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard','root'], queryFn: () => getDashboard() });
}

export function useDashboardStats(params?: { period?: 'week' | 'month' | 'year' | 'all'; include_social?: boolean }) {
  return useQuery({
    queryKey: ['dashboard','stats', params],
    queryFn: () => getDashboardStats(params?.period || 'all', params?.include_social !== false)
  });
}


