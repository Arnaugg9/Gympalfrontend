'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboard, getDashboardStats } from '@/features/dashboard/api/api';
import { http } from '@/lib/http';
import { Calendar, Activity, TrendingDown } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { workoutsApi } from '@/features/workouts/api/api';
import { useAuthStore } from '@/lib/store/auth.store';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * ProgressPage Component
 * 
 * Displays user progress and statistics.
 * Features:
 * - Current weight tracking
 * - Workout frequency stats (monthly/weekly)
 * - Total workout history
 * - Detailed breakdown of activity
 */
export default function ProgressPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [statsAll, setStatsAll] = useState<any>(null);
  const [weightData, setWeightData] = useState<any>(null);
  const [statsWeek, setStatsWeek] = useState<any>(null);
  const [statsMonth, setStatsMonth] = useState<any>(null);
  const [statsYear, setStatsYear] = useState<any>(null);
  const [workoutCount, setWorkoutCount] = useState<number>(0);
  const [completedWeek, setCompletedWeek] = useState<number>(0);
  const [completedMonth, setCompletedMonth] = useState<number>(0);
  const [completedYear, setCompletedYear] = useState<number>(0);
  const [completedAll, setCompletedAll] = useState<number>(0);
  const [exerciseCountWeek, setExerciseCountWeek] = useState<number>(0);
  const [exerciseCountMonth, setExerciseCountMonth] = useState<number>(0);
  const [exerciseCountYear, setExerciseCountYear] = useState<number>(0);
  const [exerciseCountAll, setExerciseCountAll] = useState<number>(0);
  const [progressStats, setProgressStats] = useState<any>(null);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');

  /**
   * Fetch all progress data on mount
   * Loads multiple data points in parallel for better performance
   */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dateStr = new Date().toISOString().split('T')[0];
        // Fetch data from various endpoints
        const [ov, stAll, weight, weekStats, monthStats, yearStats, count, weekCount, monthCount, yearCount, allCount, exWeek, exMonth, exYear, exAll, progress] = await Promise.all([
          getDashboard().catch(() => null),
          getDashboardStats('all').catch(() => null),
          http.get<any>('/api/v1/personal/info').catch(() => null),
          getDashboardStats('week').catch(() => null),
          getDashboardStats('month').catch(() => null),
          getDashboardStats('year').catch(() => null),
          user?.id ? workoutsApi.getWorkoutCount(user.id).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedWorkoutCount(user.id, 'week', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedWorkoutCount(user.id, 'month', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedWorkoutCount(user.id, 'year', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedWorkoutCount(user.id, 'all', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedExerciseCount(user.id, 'week', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedExerciseCount(user.id, 'month', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedExerciseCount(user.id, 'year', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedExerciseCount(user.id, 'all', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getProgressStats('month').catch(() => null) : Promise.resolve(null),
        ]);
        
        if (!mounted) return;
        
        setOverview(ov);
        setStatsAll(stAll);
        setWeightData(weight);
        setStatsWeek(weekStats);
        setStatsMonth(monthStats);
        setStatsYear(yearStats);
        setWorkoutCount(count || 0);
        setCompletedWeek(weekCount || 0);
        setCompletedMonth(monthCount || 0);
        setCompletedYear(yearCount || 0);
        setCompletedAll(allCount || 0);
        setExerciseCountWeek(exWeek || 0);
        setExerciseCountMonth(exMonth || 0);
        setExerciseCountYear(exYear || 0);
        setExerciseCountAll(exAll || 0);
        setProgressStats(progress?.data || null);
      } catch (err) {
        // Error handling logic here
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  // Fetch progress stats when period changes
  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    setProgressStats(null); // Clear previous stats immediately when period changes
    (async () => {
      try {
        const response = await workoutsApi.getProgressStats(chartPeriod);
        if (!mounted) return;
        // Handle both direct data and wrapped response
        const stats = response?.data || response;
        console.log('Progress stats received:', stats); // Debug
        console.log('Workouts by period:', stats?.workoutsByPeriod); // Debug
        if (mounted) {
          setProgressStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch progress stats:', error);
        if (!mounted) return;
        setProgressStats(null);
      }
    })();
    return () => { mounted = false; };
  }, [user?.id, chartPeriod]);

  const statsAllData = statsAll?.data || {};
  const weekStatsData = statsWeek?.data || {};
  const monthStatsData = statsMonth?.data || {};
  const yearStatsData = statsYear?.data || {};
  const weightDataResponse = weightData?.data || {};
  
  // Use completed workout counts from state (fetched via workoutsApi.getCompletedWorkoutCount) as primary source
  const workoutsThisMonth = completedMonth;
  const workoutsThisWeek = completedWeek;
  const workoutsThisYear = completedYear;
  
  // Personal info returns: { weight_kg, height_cm, age, ... }
  const currentWeight = weightDataResponse.weight_kg || null;

  const exerciseTrendData = [
    { label: t('progress.week', { defaultValue: 'Week' }), value: exerciseCountWeek },
    { label: t('progress.month', { defaultValue: 'Month' }), value: exerciseCountMonth },
    { label: t('progress.year', { defaultValue: 'Year' }), value: exerciseCountYear },
    { label: t('progress.all', { defaultValue: 'All' }), value: exerciseCountAll },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <LoadingSpinner size="lg" variant="dumbbell" />
        <p className="text-slate-400 text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl xl:max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('progress.title')}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">{t('progress.subtitle')}</p>
      </div>

      {/* Charts Section */}
      <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">
        {/* Workouts Over Time Chart */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white">
                {t('progress.workoutsOverTime', { defaultValue: 'Workouts Over Time' })}
              </CardTitle>
              <Select value={chartPeriod} onValueChange={(value: any) => {
                setChartPeriod(value);
                setProgressStats(null); // Reset stats to show loading state
              }}>
                <SelectTrigger className="w-[120px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                  <SelectItem value="week" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800">
                    {t('progress.week', { defaultValue: 'Week' })}
                  </SelectItem>
                  <SelectItem value="month" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800">
                    {t('progress.month', { defaultValue: 'Month' })}
                  </SelectItem>
                  <SelectItem value="year" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800">
                    {t('progress.year', { defaultValue: 'Year' })}
                  </SelectItem>
                  <SelectItem value="all" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-slate-100 dark:focus:bg-slate-800">
                    {t('progress.all', { defaultValue: 'All' })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {progressStats?.workoutsByPeriod && Array.isArray(progressStats.workoutsByPeriod) && progressStats.workoutsByPeriod.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressStats.workoutsByPeriod.sort((a: any, b: any) => a.date.localeCompare(b.date))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    className="text-xs"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    className="text-xs"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                <p>{t('progress.noData', { defaultValue: 'No workout data available' })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weight Progression Chart */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              {t('progress.weightProgression', { defaultValue: 'Weight Progression' })}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('progress.weightProgressionDesc', { defaultValue: 'Track your strength gains over time' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {progressStats?.weightProgression && Object.keys(progressStats.weightProgression).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    className="text-xs"
                  />
                  <YAxis 
                    stroke="#6b7280"
                    className="text-xs"
                    label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  {Object.entries(progressStats.weightProgression).map(([exercise, data]: [string, any]) => (
                    <Line
                      key={exercise}
                      type="monotone"
                      dataKey="weight"
                      data={data}
                      name={exercise}
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
                <p>{t('progress.noWeightData', { defaultValue: 'No weight progression data available' })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercises Trend Chart */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              {t('progress.exerciseTrend', { defaultValue: 'Exercises Completed' })}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('progress.exerciseTrendDesc', { defaultValue: 'Compare your exercise volume across different periods' })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={exerciseTrendData}>
                <defs>
                  <linearGradient id="exerciseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="label" stroke="#6b7280" className="text-xs" />
                <YAxis stroke="#6b7280" className="text-xs" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#exerciseGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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

        {/* Total Workouts (Completed) */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-600 dark:text-slate-400">{t('progress.totalWorkouts')}</CardTitle>
                <Activity className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{completedAll}</p>
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

        {/* This Year */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-600 dark:text-slate-400">{t('progress.thisYear', { defaultValue: 'This Year' })}</CardTitle>
                <Calendar className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{workoutsThisYear}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">{t('progress.workouts')}</p>
            </CardContent>
        </Card>
      </div>

      {/* Statistics Tables - 2 per row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Workouts Statistics Table */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">{t('progress.workouts', { defaultValue: 'Workouts' })}</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">{t('progress.workoutStatistics', { defaultValue: 'Workout statistics by period' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.totalWorkouts')}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.allTime')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{completedAll}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.thisYear', { defaultValue: 'This Year' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workouts')} {t('progress.thisYear', { defaultValue: 'this year' }).toLowerCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{workoutsThisYear}</p>
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

        {/* Exercises Statistics Table */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">{t('progress.exercises', { defaultValue: 'Exercises' })}</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">{t('progress.exerciseStatistics', { defaultValue: 'Exercise statistics by period' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.totalExercises', { defaultValue: 'Total Exercises' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.allTime')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{exerciseCountAll}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.thisYear', { defaultValue: 'This Year' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.exercises', { defaultValue: 'Exercises' })} {t('progress.thisYear', { defaultValue: 'this year' }).toLowerCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{exerciseCountYear}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.thisMonth')}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.exercises', { defaultValue: 'Exercises' })} {t('progress.thisMonth').toLowerCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{exerciseCountMonth}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.thisWeek')}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.exercises', { defaultValue: 'Exercises' })} {t('progress.thisWeek').toLowerCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{exerciseCountWeek}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workout Frequency Table */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">{t('progress.workoutFrequency', { defaultValue: 'Workout Frequency' })}</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">{t('progress.frequencyDescription', { defaultValue: 'Average workouts per period' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.weeklyAverage', { defaultValue: 'Weekly Average' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workoutsPerWeek', { defaultValue: 'Workouts per week' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {workoutsThisMonth > 0 ? (workoutsThisMonth / 4.33).toFixed(1) : '0.0'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.monthlyAverage', { defaultValue: 'Monthly Average' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workoutsPerMonth', { defaultValue: 'Workouts per month' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{workoutsThisMonth}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.yearlyTotal', { defaultValue: 'Yearly Total' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workoutsThisYear', { defaultValue: 'Workouts this year' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{workoutsThisYear}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.totalCreated', { defaultValue: 'Total Created' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workoutRoutines', { defaultValue: 'Workout routines created' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{workoutCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercise Volume Table */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">{t('progress.exerciseVolume', { defaultValue: 'Exercise Volume' })}</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">{t('progress.volumeDescription', { defaultValue: 'Total exercises completed by period' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.weeklyVolume', { defaultValue: 'Weekly Volume' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.exercisesPerWeek', { defaultValue: 'Exercises per week' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {exerciseCountMonth > 0 ? (exerciseCountMonth / 4.33).toFixed(1) : '0.0'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.monthlyVolume', { defaultValue: 'Monthly Volume' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.exercisesPerMonth', { defaultValue: 'Exercises per month' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{exerciseCountMonth}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.yearlyVolume', { defaultValue: 'Yearly Volume' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.exercisesThisYear', { defaultValue: 'Exercises this year' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{exerciseCountYear}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.allTimeVolume', { defaultValue: 'All Time Volume' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.totalExercisesCompleted', { defaultValue: 'Total exercises completed' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{exerciseCountAll}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consistency Table */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">{t('progress.consistency', { defaultValue: 'Consistency' })}</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">{t('progress.consistencyDescription', { defaultValue: 'Your training consistency metrics' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.currentWeek', { defaultValue: 'Current Week' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workoutsCompleted', { defaultValue: 'Workouts completed' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{workoutsThisWeek}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.currentMonth', { defaultValue: 'Current Month' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workoutsCompleted', { defaultValue: 'Workouts completed' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{workoutsThisMonth}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.weekStreak', { defaultValue: 'Week Streak' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.consecutiveWeeks', { defaultValue: 'Consecutive weeks with workouts' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {workoutsThisWeek > 0 ? '1+' : '0'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.completionRate', { defaultValue: 'Completion Rate' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workoutsVsCreated', { defaultValue: 'Completed vs created' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {workoutCount > 0 ? ((completedAll / workoutCount) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics Table */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">{t('progress.performanceMetrics', { defaultValue: 'Performance Metrics' })}</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">{t('progress.metricsDescription', { defaultValue: 'Key performance indicators' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.exercisesPerWorkout', { defaultValue: 'Exercises per Workout' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.averageExerciseCount', { defaultValue: 'Average exercises per workout' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {completedAll > 0 ? (exerciseCountAll / completedAll).toFixed(1) : '0.0'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.monthlyGrowth', { defaultValue: 'Monthly Growth' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workoutIncrease', { defaultValue: 'Workout increase this month' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {workoutsThisMonth > 0 ? '+' : ''}{workoutsThisMonth}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.activityLevel', { defaultValue: 'Activity Level' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.basedOnFrequency', { defaultValue: 'Based on workout frequency' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {workoutsThisMonth >= 12 ? t('progress.veryActive', { defaultValue: 'Very Active' }) :
                     workoutsThisMonth >= 8 ? t('progress.active', { defaultValue: 'Active' }) :
                     workoutsThisMonth >= 4 ? t('progress.moderate', { defaultValue: 'Moderate' }) :
                     t('progress.beginner', { defaultValue: 'Beginner' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-slate-900 dark:text-white font-semibold">{t('progress.totalActivity', { defaultValue: 'Total Activity' })}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.allTimeWorkouts', { defaultValue: 'All time workouts completed' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{completedAll}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section placed at top */}
    </div>
  );
}
