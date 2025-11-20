'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dumbbell, Plus, ArrowLeft, Check } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { workoutsApi } from '@/features/workouts/api/api';

export default function SelectWorkoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setLoading(true);
        const list = await workoutsApi.list();

        // Handle different response formats
        let items = [];
        if (list?.data && Array.isArray(list.data)) {
          items = list.data;
        } else if (Array.isArray(list)) {
          items = list;
        }

        setWorkouts(items);
      } catch (err) {
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();
  }, []);

  const handleSelectWorkout = (workoutId: string) => {
    const newSelected = new Set(selectedWorkouts);
    if (newSelected.has(workoutId)) {
      newSelected.delete(workoutId);
    } else {
      newSelected.add(workoutId);
    }
    setSelectedWorkouts(newSelected);
  };

  const handleConfirm = async () => {
    if (selectedWorkouts.size === 0) {
      alert(t('workouts.selectAtLeastOne') || 'Please select at least one workout');
      return;
    }

    setConfirming(true);
    setConfirmMessage('');

    try {
      // Add all selected workouts to today
      const workoutIds = Array.from(selectedWorkouts);

      // Add each workout to today
      for (const workoutId of workoutIds) {
        await workoutsApi.addToday(workoutId);
      }

      setConfirmMessage(`✓ ${workoutIds.length} ${t('workouts.workouts') || 'workouts'} added successfully!`);

      // Navigate back to today's workout page after 1 second
      setTimeout(() => {
        router.push('/workouts/today?refresh=true');
      }, 1000);
    } catch (err) {
      setConfirmMessage('Error adding workouts. Please try again.');
      setConfirming(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => router.back()}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              {t('workouts.selectWorkout') || 'Select Workout'}
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 ml-10">
            {t('workouts.selectWorkoutDescription') || 'Choose one or more workouts to add to today'}
          </p>
        </div>
      </div>

      {/* Workouts List */}
      {workouts.length === 0 ? (
        <Card className="glass-card border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t('workouts.noRoutines') || 'No workouts available'}
            </p>
            <Link href="/workouts/new">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                {t('workouts.createNew') || 'Create New'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Workouts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((workout: any) => {
              const id = String(workout.id || workout.uuid || workout._id);
              const isSelected = selectedWorkouts.has(id);

              return (
                <Card
                  key={id}
                  className={`glass-card border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/10 dark:bg-emerald-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600'
                  }`}
                  onClick={() => handleSelectWorkout(id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg">
                            <Dumbbell className="h-4 w-4 text-white" />
                          </div>
                          {workout.name || 'Workout'}
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                          {(workout.exercises?.length ?? 0)} {t('workouts.totalExercises') || 'exercises'}
                        </CardDescription>
                      </div>
                      <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                  </CardHeader>
                  {workout.description && (
                    <CardContent>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {workout.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Create New Option */}
          <Card className="glass-card border-dashed border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all">
            <CardContent className="pt-6 pb-6">
              <Link href="/workouts/new" className="block text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {t('workouts.createNew') || 'Create New Workout'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t('workouts.createNewDescription') || 'Design a custom workout for today'}
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Success Message */}
          {confirmMessage && (
            <div className={`p-4 rounded-lg text-center font-semibold ${
              confirmMessage.startsWith('✓')
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                : 'bg-red-500/20 text-red-400 border border-red-500/50'
            }`}>
              {confirmMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={confirming}
              className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedWorkouts.size === 0 || confirming}
              className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4 mr-2" />
              {confirming ? 'Adding...' : (t('common.confirm') || 'Confirm')} ({selectedWorkouts.size})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
