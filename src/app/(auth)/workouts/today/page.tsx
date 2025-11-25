'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Check, Flame, Activity, Play } from 'lucide-react';
import { http } from '@/lib/http';
import { getDashboardStats } from '@/features/dashboard/api/api';
import { workoutsApi } from '@/features/workouts/api/api';
import { useAuthStore } from '@/lib/store/auth.store';
import { WorkoutTracker } from '@/components/shared/WorkoutTracker';

const resolveLocale = (lang: string) => {
  if (lang?.startsWith('es')) return 'es-ES';
  if (lang?.startsWith('ca')) return 'ca-ES';
  if (lang?.startsWith('fr')) return 'fr-FR';
  return 'en-US';
};

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
  const { t, i18n } = useTranslation();
  const locale = resolveLocale(i18n.language);
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState<number>(0);
  const [workoutsThisMonth, setWorkoutsThisMonth] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showTracker, setShowTracker] = useState(false);
  const [workoutDetails, setWorkoutDetails] = useState<any>(null);
  const [scheduledWorkoutId, setScheduledWorkoutId] = useState<string | null>(null);

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
        const dateStr = new Date().toISOString().split('T')[0];
        const [calendarRes, weekCount, monthCount, streakCount] = await Promise.all([
          http.get<any>(`/api/v1/calendar?month=${month}&year=${year}`).catch(() => null),
          user?.id ? workoutsApi.getCompletedWorkoutCount(user.id, 'week', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedWorkoutCount(user.id, 'month', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCurrentStreak(user.id, dateStr).catch(() => 0) : Promise.resolve(0),
        ]);

        if (!mounted) return;

        // Find today's workout from calendar response
        const calendarData = calendarRes?.days || calendarRes?.data?.days || [];
        const todayEntry = calendarData.find((d: any) => d.date === dateStr);
        
        if (todayEntry?.workout) {
          setTodayWorkout(todayEntry.workout);
          setScheduledWorkoutId(todayEntry.scheduled_workout_id || null);
          
          // Fetch full workout details if we have workout_id
          if (todayEntry.workout.id || todayEntry.workout.workout_id) {
            try {
              const workoutId = todayEntry.workout.id || todayEntry.workout.workout_id;
              const details = await workoutsApi.get(workoutId);
              if (!mounted) return;
              setWorkoutDetails(details.data?.workout || details.data);
            } catch (err) {
              console.error('Failed to fetch workout details:', err);
            }
          }
        } else {
          setTodayWorkout(null);
          setWorkoutDetails(null);
          setScheduledWorkoutId(null);
        }

        setWorkoutsThisWeek(weekCount || 0);
        setWorkoutsThisMonth(monthCount || 0);
        setStreak(streakCount || 0);
      } catch (err) {
        // Error handling
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [refreshKey, user?.id]);

  const today = new Date();
  const formattedDateRaw = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(today);
  const formattedDate = formattedDateRaw.charAt(0).toUpperCase() + formattedDateRaw.slice(1);

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
                  <Button 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                    onClick={async () => {
                      // Load workout details if not already loaded
                      if (!workoutDetails && (todayWorkout.id || todayWorkout.workout_id)) {
                        try {
                          const workoutId = todayWorkout.id || todayWorkout.workout_id;
                          const details = await workoutsApi.get(workoutId);
                          setWorkoutDetails(details.data?.workout || details.data);
                          setShowTracker(true);
                        } catch (err) {
                          console.error('Failed to load workout details:', err);
                          alert(t('workouts.loadError', { defaultValue: 'Failed to load workout details' }));
                        }
                      } else {
                        setShowTracker(true);
                      }
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {t('workouts.startWorkout', { defaultValue: 'Start Workout' })}
                  </Button>
                  <Link href={`/workouts/${todayWorkout.id || todayWorkout.workout_id}`}>
                    <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
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

      {/* Workout Tracker */}
      <WorkoutTracker
        open={showTracker}
        onOpenChange={(open) => {
          setShowTracker(open);
          if (!open) {
            // Optionally reload data when tracker closes
            setWorkoutDetails(null);
          }
        }}
        durationMinutes={workoutDetails?.duration_minutes || todayWorkout?.duration_minutes || 60}
        workoutName={workoutDetails?.name || todayWorkout?.name}
        workoutId={workoutDetails?.id || todayWorkout?.id || todayWorkout?.workout_id}
        scheduledWorkoutId={scheduledWorkoutId || undefined}
        exercises={(workoutDetails?.exercises || todayWorkout?.exercises || []).map((ex: any) => ({
          exercise_id: ex.exercise_id || ex.exercise?.id || ex.id,
          exercise: ex.exercise,
          name: ex.exercise?.name || ex.name,
          sets: ex.sets || 3,
          reps: ex.reps || 10,
        }))}
      />

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
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{workoutsThisWeek} {t('workouts.workouts')}</p>
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
