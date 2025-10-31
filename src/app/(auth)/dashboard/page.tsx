'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { getDashboard, getDashboardStats } from '@/features/dashboard/api/api';
import { me } from '@/features/auth/api/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dumbbell, Utensils, Users, Calendar as CalIcon, TrendingUp, MessageSquare, Target, Flame, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [overview, setOverview] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ov, st, userRes] = await Promise.all([
          getDashboard().catch(() => null),
          getDashboardStats().catch(() => null),
          me().catch(() => null)
        ]);
        if (!mounted) return;
        setOverview(ov);
        setStats(st);
        
        // Extract user name
        const userData = userRes?.data?.user || userRes?.data || userRes?.user || userRes;
        const fullName = userData?.full_name || userData?.fullName || userData?.username || 'User';
        const nameParts = fullName.split(' ');
        setUserName(nameParts[0] || fullName);
      } catch (err) {
        if (!mounted) return;
        setError(t('errors.loadingError'));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const overviewData = overview?.data || {};
  const statsData = stats?.data || {};
  
  // Dashboard overview returns: { stats: { total_workouts, total_exercises }, recent_workouts: [] }
  const workoutCount = overviewData.stats?.total_workouts || 0;
  const exerciseCount = overviewData.stats?.total_exercises || 0;
  const recentWorkouts = overviewData.recent_workouts || [];
  
  // Dashboard stats returns: { total_workouts, total_exercises, total_duration, average_duration }
  const completedThisWeek = statsData.total_workouts || 0;
  
  // Calculate weekly goal from workout frequency or default to 4
  const weeklyGoal = 4;
  const progressPercent = weeklyGoal > 0 ? Math.min(100, (completedThisWeek / weeklyGoal) * 100) : 0;

  // Get next workout from recent workouts if available
  const nextWorkout = recentWorkouts.length > 0 ? recentWorkouts[0] : null;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-400">{t('common.loading')}</div></div>;
  }

  return (
    <div className="space-y-8">
      {/* Greeting Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('dashboard.greeting', { name: userName })}
        </h1>
        <p className="text-slate-400">{t('dashboard.summary')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Total Entrenamientos */}
        <Card className="glass-card border-orange-200 dark:border-orange-500/30 bg-gradient-to-br from-slate-800/90 to-slate-900/90 hover-lift shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">{workoutCount}</p>
              <p className="text-sm text-slate-400">{t('dashboard.totalWorkouts')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Objetivo semanal */}
        <Card className="glass-card border-blue-200 dark:border-blue-500/30 bg-gradient-to-br from-slate-800/90 to-slate-900/90 hover-lift shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('dashboard.workoutsThisWeek')}</p>
                <p className="text-2xl font-bold text-white">
                  {completedThisWeek}/{weeklyGoal}
                </p>
              </div>
              <Progress 
                value={progressPercent} 
                className="h-2 bg-slate-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* Total Ejercicios */}
        <Card className="glass-card border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-br from-slate-800/90 to-slate-900/90 hover-lift shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-white">{exerciseCount}</p>
              <p className="text-sm text-slate-400">{t('dashboard.totalExercises')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">{t('dashboard.quickAccess')}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <QuickActionCard 
            icon={Dumbbell} 
            title={t('nav.workouts')} 
            description={t('dashboard.quickAccess', { defaultValue: 'Quick Access' })} 
            to="/workouts" 
            color="orange" 
          />
          <QuickActionCard 
            icon={Utensils} 
            title={t('nav.diets')} 
            description={t('dashboard.quickAccess', { defaultValue: 'Quick Access' })} 
            to="/diet" 
            color="green" 
          />
          <QuickActionCard 
            icon={Users} 
            title={t('nav.social')} 
            description={t('dashboard.quickAccess', { defaultValue: 'Quick Access' })} 
            to="/social" 
            color="pink" 
          />
          <QuickActionCard 
            icon={CalIcon} 
            title={t('nav.calendar')} 
            description={t('dashboard.quickAccess', { defaultValue: 'Quick Access' })} 
            to="/calendar" 
            color="blue" 
          />
          <QuickActionCard 
            icon={TrendingUp} 
            title={t('nav.progress')} 
            description={t('dashboard.quickAccess', { defaultValue: 'Quick Access' })} 
            to="/progress" 
            color="cyan" 
          />
          <QuickActionCard 
            icon={MessageSquare} 
            title="AI Chat" 
            description={t('dashboard.quickAccess', { defaultValue: 'Quick Access' })} 
            to="/ai-chat" 
            color="purple" 
          />
        </div>
      </div>

      {/* Next Workout */}
      {nextWorkout && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">{t('dashboard.nextWorkout')}</h2>
          </div>
          <Card className="glass-card border-slate-700 bg-gradient-to-br from-slate-800/90 to-slate-900/90">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-white mb-2">{nextWorkout.name || t('workouts.today', { defaultValue: 'Workout' })}</p>
                  <div className="flex gap-3 mt-4">
                    <Link href={`/workouts/${nextWorkout.id}`}>
                      <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
                        {t('workouts.viewRoutine')}
                      </Button>
                    </Link>
                    <Link href="/workouts">
                      <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                        {t('common.view', { defaultValue: 'View' })} All
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function QuickActionCard({ icon: Icon, title, description, to, color }: { 
  icon: any; 
  title: string; 
  description: string; 
  to: string; 
  color: 'orange'|'green'|'pink'|'blue'|'cyan'|'purple'|'yellow'; 
}) {
  const colorClasses = {
    orange: { bg: 'bg-gradient-to-br from-orange-400 to-orange-600', border: 'border-orange-200 dark:border-orange-500/30' },
    green: { bg: 'bg-gradient-to-br from-green-400 to-emerald-600', border: 'border-green-200 dark:border-green-500/30' },
    pink: { bg: 'bg-gradient-to-br from-pink-400 to-rose-600', border: 'border-pink-200 dark:border-pink-500/30' },
    blue: { bg: 'bg-gradient-to-br from-blue-400 to-blue-600', border: 'border-blue-200 dark:border-blue-500/30' },
    cyan: { bg: 'bg-gradient-to-br from-cyan-400 to-teal-600', border: 'border-cyan-200 dark:border-cyan-500/30' },
    purple: { bg: 'bg-gradient-to-br from-purple-400 to-purple-600', border: 'border-purple-200 dark:border-purple-500/30' },
    yellow: { bg: 'bg-gradient-to-br from-yellow-400 to-amber-600', border: 'border-yellow-200 dark:border-yellow-500/30' },
  } as const;
  const c = colorClasses[color];
  return (
    <Link href={to}>
      <Card className={`glass-card ${c.border} bg-gradient-to-br from-slate-800/90 to-slate-900/90 hover-lift shadow-lg cursor-pointer overflow-hidden group`}>
        <CardContent className="pt-6 relative">
          <div className={`w-14 h-14 rounded-xl ${c.bg} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-white mb-1 font-semibold">{title}</h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
