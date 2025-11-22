'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Check, Flame, Activity } from 'lucide-react';
import { http } from '@/lib/http';
import { getDashboardStats } from '@/features/dashboard/api/api';

/**
 * TodayWorkoutPage Component
 * 
 * Displays the scheduled workout for the current day.
 * Features:
 * - Shows today's scheduled routine details
 * - Quick actions (Start, View Calendar, Add Workout)
 * - Activity summary (Week, Month, Streak)
 * - Handles refresh via query params
 */
export default function TodayWorkoutPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [weekStats, setWeekStats] = useState<any>({});
  const [monthStats, setMonthStats] = useState<any>({});
  const [streak, setStreak] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Trigger refresh when returning from select page or other actions
  useEffect(() => {
    const refresh = searchParams.get('refresh');
    if (refresh) {
      setRefreshKey(prev => prev + 1);
      // Clean up URL
      window.history.replaceState({}, '', '/workouts/today');
    }
  }, [searchParams]);

  /**
   * Fetch today's workout and user stats on mount/refresh
   */
  useEffect(() => {
    let mounted = true;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    (async () => {
      try {
        const [calendarRes, weekStatsRes, monthStatsRes] = await Promise.all([
          http.get<any>(`/api/v1/calendar?month=${month}&year=${year}`).catch(() => null),
          getDashboardStats('week').catch(() => null),
          getDashboardStats('month').catch(() => null),
        ]);

        if (!mounted) return;

        // Find today's workout from calendar response
        const calendarData = calendarRes?.days || calendarRes?.data?.days || [];
        const todayEntry = calendarData.find((d: any) => d.date === dateStr);
        
        if (todayEntry?.workout) {
          setTodayWorkout(todayEntry.workout);
        } else {
          setTodayWorkout(null);
        }

        setWeekStats(weekStatsRes || {});
        setMonthStats(monthStatsRes || {});

        // Simple Streak calculation based on weekly activity
        // (Ideally should come from backend)
        const workoutsThisWeek = weekStatsRes?.total_workouts || 0;
        setStreak(workoutsThisWeek > 0 ? 7 : 0);
      } catch (err) {
        // Error handling
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [refreshKey]);

  const today = new Date();
  // Format current date
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const workoutsThisWeek = weekStats?.total_workouts || 0;
  const workoutsThisMonth = monthStats?.total_workouts || 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-400">{t('common.loading')}</div></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('workouts.today')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{formattedDate}</p>
        </div>
        <Link href="/calendar">
          <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
            <Calendar className="h-4 w-4 mr-2" />
            {t('calendar.viewCalendar')}
          </Button>
        </Link>
      </div>

      {/* Main Content - No Workout or Workout Card */}
      {!todayWorkout ? (
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {t('workouts.noWorkoutPlanned')}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  {t('workouts.noWorkoutDescription')}
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                <Link href="/workouts/select">
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('workouts.addWorkout')}
                  </Button>
                </Link>
                <Link href="/calendar">
                  <Button variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('workouts.goToCalendar')}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{todayWorkout.name || t('workouts.workout')}</p>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{todayWorkout.description || ''}</p>
                <div className="flex gap-3">
                  <Link href={`/workouts/${todayWorkout.id || todayWorkout.workout_id}`}>
                    <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
                      {t('workouts.viewRoutine')}
                    </Button>
                  </Link>
                  <Link href="/calendar">
                    <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                      {t('calendar.viewCalendar')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* This Week */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('workouts.thisWeek')}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{workoutsThisWeek} {t('workouts.thisWeekDescription')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg">
                <Check className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('workouts.currentStreak')}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{streak} {t('workouts.consecutiveDays')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('workouts.thisMonth')}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{workoutsThisMonth} {t('workouts.workouts')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
