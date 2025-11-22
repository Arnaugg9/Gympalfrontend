'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboard, getDashboardStats } from '@/features/dashboard/api/api';
import { http } from '@/lib/http';
import { Calendar, Activity, TrendingDown } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ProgressPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [weightData, setWeightData] = useState<any>(null);
  const [statsWeek, setStatsWeek] = useState<any>(null);
  const [statsMonth, setStatsMonth] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ov, st, weight, weekStats, monthStats] = await Promise.all([
          getDashboard().catch(() => null),
          getDashboardStats('month').catch(() => null),
          http.get<any>('/api/v1/personal/info').catch(() => null),
          getDashboardStats('week').catch(() => null),
          getDashboardStats('month').catch(() => null),
        ]);
        if (!mounted) return;
        setOverview(ov);
        setStats(st);
        setWeightData(weight);
        setStatsWeek(weekStats);
        setStatsMonth(monthStats);
      } catch (err) {
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const statsData = stats?.data || {};
  const weekStatsData = statsWeek?.data || {};
  const monthStatsData = statsMonth?.data || {};
  const weightDataResponse = weightData?.data || {};
  
  // Dashboard stats returns: { total_workouts, total_exercises, total_duration, average_duration }
  const workoutCount = statsData.total_workouts || 0;
  const workoutsThisMonth = monthStatsData.total_workouts || 0;
  const workoutsThisWeek = weekStatsData.total_workouts || 0;
  
  // Personal info returns: { weight_kg, height_cm, age, ... }
  const currentWeight = weightDataResponse.weight_kg || null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <LoadingSpinner size="lg" variant="dumbbell" />
        <p className="text-slate-400 text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('progress.title')}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">{t('progress.subtitle')}</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Weight */}
        {currentWeight !== null && (
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-600 dark:text-slate-400">{t('progress.currentWeight')}</CardTitle>
                <TrendingDown className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{currentWeight} kg</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.registeredWeight')}</p>
            </CardContent>
          </Card>
        )}

        {/* Workouts This Month */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workouts')}</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{workoutsThisMonth}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">{t('progress.thisMonth')}</p>
            </CardContent>
        </Card>

        {/* Total Workouts */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-600 dark:text-slate-400">{t('progress.totalWorkouts')}</CardTitle>
                <Activity className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{workoutCount}</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{t('progress.allTime')}</p>
            </CardContent>
        </Card>

        {/* This Week */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-600 dark:text-slate-400">{t('progress.thisWeek')}</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{workoutsThisWeek}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">{t('progress.workouts')}</p>
            </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">{t('progress.title')}</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">{t('progress.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">{t('progress.totalWorkouts')}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.allTime')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{workoutCount}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">{t('progress.thisMonth')}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workouts')} {t('progress.thisMonth').toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{workoutsThisMonth}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">{t('progress.thisWeek')}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workouts')} {t('progress.thisWeek').toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{workoutsThisWeek}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
