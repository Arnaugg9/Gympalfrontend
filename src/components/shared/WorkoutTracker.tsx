'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, X, Check, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { workoutsApi } from '@/features/workouts/api/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ExerciseSet {
  set_number: number;
  weight_kg?: number;
  reps_completed?: number;
  completed: boolean;
  rpe?: number;
  rir?: number;
  failure: boolean;
  rest_seconds?: number;
  notes?: string;
}

interface ExerciseData {
  exercise_id: string;
  exercise_name: string;
  planned_sets: number;
  planned_reps: number;
  sets: ExerciseSet[];
}

interface WorkoutTrackerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  durationMinutes: number;
  workoutName?: string;
  workoutId?: string;
  scheduledWorkoutId?: string;
  exercises: Array<{
    exercise_id?: string;
    id?: string;
    exercise?: { name: string; id?: string };
    name?: string;
    sets: number;
    reps: number;
  }>;
}

/**
 * WorkoutTracker Component
 * 
 * Comprehensive workout tracking component with:
 * - Timer functionality
 * - Exercise set tracking (weight, reps, RPE, RIR, failure, rest time)
 * - Progress saving
 */
type TimerPersistState = {
  mode: 'running' | 'paused';
  endTime?: number;
  remainingSeconds?: number;
};

export function WorkoutTracker({
  open,
  onOpenChange,
  durationMinutes,
  workoutName,
  workoutId,
  scheduledWorkoutId,
  exercises,
}: WorkoutTrackerProps) {
  const { t } = useTranslation();
  const baseDuration = Math.max(0, durationMinutes * 60);
  const [timeRemaining, setTimeRemaining] = useState(baseDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseData, setExerciseData] = useState<ExerciseData[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [workoutSessionId, setWorkoutSessionId] = useState<string | null>(null);
  const restTimerRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const restStartTimes = useRef<Record<string, number>>({});
  const [activeEndTime, setActiveEndTime] = useState<number | null>(null);
  const [hasInitializedData, setHasInitializedData] = useState(false);

  const timerStorageKey = useMemo(() => {
    const identifier = scheduledWorkoutId || workoutId || workoutName || 'custom';
    return identifier ? `workout_timer_${identifier}` : null;
  }, [scheduledWorkoutId, workoutId, workoutName]);

  const persistTimerState = (state?: TimerPersistState) => {
    if (typeof window === 'undefined' || !timerStorageKey) return;
    if (!state) {
      localStorage.removeItem(timerStorageKey);
      return;
    }
    localStorage.setItem(timerStorageKey, JSON.stringify(state));
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !timerStorageKey) {
      setTimeRemaining(baseDuration);
      setIsRunning(false);
      setIsPaused(false);
      setActiveEndTime(null);
      return;
    }

    try {
      const stored = localStorage.getItem(timerStorageKey);
      if (stored) {
        const data = JSON.parse(stored) as TimerPersistState & { remainingSeconds?: number };
        if (data.mode === 'running' && data.endTime) {
          const remaining = Math.max(0, Math.round((data.endTime - Date.now()) / 1000));
          if (remaining > 0) {
            setTimeRemaining(remaining);
            setIsRunning(true);
            setIsPaused(false);
            setActiveEndTime(data.endTime);
            return;
          }
        } else if (data.mode === 'paused' && typeof data.remainingSeconds === 'number') {
          setTimeRemaining(Math.max(0, data.remainingSeconds));
          setIsRunning(false);
          setIsPaused(true);
          setActiveEndTime(null);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to restore workout timer state', error);
    }

    if (timerStorageKey) {
      localStorage.removeItem(timerStorageKey);
    }
    setTimeRemaining(baseDuration);
    setIsRunning(false);
    setIsPaused(false);
    setActiveEndTime(null);
  }, [timerStorageKey, baseDuration]);

  useEffect(() => {
    if (!activeEndTime || !isRunning) return;
    const tick = () => {
      const remaining = Math.max(0, Math.round((activeEndTime - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        setIsRunning(false);
        setIsPaused(false);
        setActiveEndTime(null);
        persistTimerState();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeEndTime, isRunning]);

  useEffect(() => {
    setHasInitializedData(false);
  }, [workoutId, scheduledWorkoutId]);

  // Initialize exercise data
  useEffect(() => {
    if (!open || hasInitializedData) return;
    if (exercises && exercises.length > 0) {
      const data: ExerciseData[] = exercises.map((ex, idx) => {
        const exerciseId = ex.exercise_id || ex.id || ex.exercise?.id || '';
        const exerciseName = ex.exercise?.name || ex.name || `Exercise ${idx + 1}`;
        const setsCount = ex.sets || 3;
        const repsCount = ex.reps || 10;

        return {
          exercise_id: exerciseId,
          exercise_name: exerciseName,
          planned_sets: setsCount,
          planned_reps: repsCount,
          sets: Array.from({ length: setsCount }, (_, i) => ({
            set_number: i + 1,
            completed: false,
            failure: false,
          })),
        };
      });
      setExerciseData(data);
      setCurrentExerciseIndex(0);
    } else {
      setExerciseData([]);
    }
    setHasInitializedData(true);
  }, [open, exercises, hasInitializedData]);

  const handlePlay = () => {
    if (baseDuration === 0) return;
    const currentRemaining = timeRemaining === 0 ? baseDuration : timeRemaining;
    setTimeRemaining(currentRemaining);
    setIsRunning(true);
    setIsPaused(false);
    const newEndTime = Date.now() + currentRemaining * 1000;
    setActiveEndTime(newEndTime);
    persistTimerState({ mode: 'running', endTime: newEndTime });
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
    setActiveEndTime(null);
    persistTimerState({ mode: 'paused', remainingSeconds: timeRemaining });
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeRemaining(baseDuration);
    setActiveEndTime(null);
    persistTimerState();
  };

  const updateSet = (exerciseIdx: number, setIdx: number, updates: Partial<ExerciseSet>) => {
    setExerciseData((prev) => {
      const newData = [...prev];
      const exercise = newData[exerciseIdx];
      if (exercise && exercise.sets[setIdx]) {
        exercise.sets[setIdx] = {
          ...exercise.sets[setIdx],
          ...updates,
        };
      }
      return newData;
    });
  };

  const startRestTimer = (exerciseIdx: number, setIdx: number) => {
    const key = `${exerciseIdx}-${setIdx}`;
    restStartTimes.current[key] = Date.now();
    
    if (restTimerRefs.current[key]) {
      clearInterval(restTimerRefs.current[key]);
    }

    restTimerRefs.current[key] = setInterval(() => {
      const startTime = restStartTimes.current[key];
      if (startTime !== undefined) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        updateSet(exerciseIdx, setIdx, { rest_seconds: elapsed });
      }
    }, 1000);
  };

  const stopRestTimer = (exerciseIdx: number, setIdx: number) => {
    const key = `${exerciseIdx}-${setIdx}`;
    if (restTimerRefs.current[key]) {
      clearInterval(restTimerRefs.current[key]);
      delete restTimerRefs.current[key];
    }
  };

  const handleCompleteSet = async (exerciseIdx: number, setIdx: number) => {
    const exercise = exerciseData[exerciseIdx];
    if (!exercise) return;
    
    const set = exercise.sets[setIdx];
    if (!set) return;
    
    updateSet(exerciseIdx, setIdx, { completed: true });
    stopRestTimer(exerciseIdx, setIdx);

    // Start rest timer for next set
    if (setIdx < exercise.sets.length - 1) {
      startRestTimer(exerciseIdx, setIdx + 1);
    }
  };

  const handleFinishWorkout = async () => {
    setIsSaving(true);
    try {
      // Create workout session if not exists
      let sessionId = workoutSessionId;
      if (!sessionId && workoutId) {
        // TODO: Create workout session via API
        // For now, we'll use scheduled_workout_id if available
      }

      // Prepare logs
      const logs: any[] = [];
      exerciseData.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (set.completed) {
            logs.push({
              workout_session_id: sessionId || undefined,
              scheduled_workout_id: scheduledWorkoutId || undefined,
              exercise_id: exercise.exercise_id,
              set_number: set.set_number,
              weight_kg: set.weight_kg,
              reps_completed: set.reps_completed,
              completed: set.completed,
              rpe: set.rpe,
              rir: set.rir,
              failure: set.failure,
              rest_seconds: set.rest_seconds,
              notes: set.notes,
            });
          }
        });
      });

      if (logs.length > 0) {
        await workoutsApi.createSetLogs(logs);
      }

      persistTimerState();
      setActiveEndTime(null);
      setIsRunning(false);
      setIsPaused(false);
      setTimeRemaining(baseDuration);
      setHasInitializedData(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save workout data:', error);
      alert(t('workouts.saveError', { defaultValue: 'Failed to save workout data' }));
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatRestTime = (seconds?: number): string => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (!open) {
    return null;
  }

  const progress = baseDuration > 0 ? ((baseDuration - timeRemaining) / baseDuration) * 100 : 0;
  const currentExercise = exerciseData[currentExerciseIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white text-xl font-bold">
            {workoutName || t('workouts.workout', { defaultValue: 'Workout' })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timer Section */}
          <Card className="bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-500/20 dark:to-cyan-500/20 border-emerald-200 dark:border-emerald-500/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {Math.round(progress)}% {t('workouts.complete', { defaultValue: 'Complete' })}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!isRunning && !isPaused && (
                    <Button onClick={handlePlay} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                      <Play className="h-4 w-4 mr-2" />
                      {t('workouts.start', { defaultValue: 'Start' })}
                    </Button>
                  )}
                  {isRunning && (
                    <Button onClick={handlePause} size="sm" variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      {t('workouts.pause', { defaultValue: 'Pause' })}
                    </Button>
                  )}
                  {isPaused && (
                    <>
                      <Button onClick={handlePlay} size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                        <Play className="h-4 w-4 mr-2" />
                        {t('workouts.resume', { defaultValue: 'Resume' })}
                      </Button>
                      <Button onClick={handleReset} size="sm" variant="outline">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {t('workouts.reset', { defaultValue: 'Reset' })}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercise Navigation */}
          {exerciseData.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {exerciseData.map((ex, idx) => (
                <Button
                  key={idx}
                  variant={currentExerciseIndex === idx ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentExerciseIndex(idx)}
                  className={currentExerciseIndex === idx ? 'bg-emerald-500' : ''}
                >
                  {idx + 1}. {ex.exercise_name}
                </Button>
              ))}
            </div>
          )}

          {/* Current Exercise Sets */}
          {exerciseData.length > 0 && currentExercise ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">
                  {currentExercise.exercise_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentExercise.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className={`p-4 rounded-lg border-2 ${
                      set.completed
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {t('workouts.set', { defaultValue: 'Set' })} {set.set_number}
                      </h4>
                      {set.rest_seconds !== undefined && set.rest_seconds > 0 && (
                        <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          {formatRestTime(set.rest_seconds)}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400">
                          {t('workouts.weight', { defaultValue: 'Weight' })} (kg)
                        </Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={set.weight_kg || ''}
                          onChange={(e) =>
                            updateSet(currentExerciseIndex, setIdx, {
                              weight_kg: parseFloat(e.target.value) || undefined,
                            })
                          }
                          disabled={set.completed}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400">
                          {t('workouts.reps', { defaultValue: 'Reps' })}
                        </Label>
                        <Input
                          type="number"
                          value={set.reps_completed || ''}
                          onChange={(e) =>
                            updateSet(currentExerciseIndex, setIdx, {
                              reps_completed: parseInt(e.target.value) || undefined,
                            })
                          }
                          disabled={set.completed}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400">RPE (1-10)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={set.rpe || ''}
                          onChange={(e) =>
                            updateSet(currentExerciseIndex, setIdx, {
                              rpe: parseInt(e.target.value) || undefined,
                            })
                          }
                          disabled={set.completed}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-slate-600 dark:text-slate-400">RIR</Label>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          value={set.rir || ''}
                          onChange={(e) =>
                            updateSet(currentExerciseIndex, setIdx, {
                              rir: parseInt(e.target.value) || undefined,
                            })
                          }
                          disabled={set.completed}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={set.failure}
                          onCheckedChange={(checked) =>
                            updateSet(currentExerciseIndex, setIdx, { failure: checked })
                          }
                          disabled={set.completed}
                        />
                        <Label className="text-sm text-slate-700 dark:text-slate-300">
                          {t('workouts.failure', { defaultValue: 'Failure' })}
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={set.completed}
                          onCheckedChange={(checked) => {
                            updateSet(currentExerciseIndex, setIdx, { completed: checked });
                            if (checked) {
                              handleCompleteSet(currentExerciseIndex, setIdx);
                            }
                          }}
                        />
                        <Label className="text-sm text-slate-700 dark:text-slate-300">
                          {t('workouts.completed', { defaultValue: 'Completed' })}
                        </Label>
                      </div>
                    </div>

                    {set.completed && (
                      <div className="mt-3">
                        <Label className="text-xs text-slate-600 dark:text-slate-400">
                          {t('workouts.notes', { defaultValue: 'Notes' })}
                        </Label>
                        <Textarea
                          value={set.notes || ''}
                          onChange={(e) =>
                            updateSet(currentExerciseIndex, setIdx, { notes: e.target.value })
                          }
                          placeholder={t('workouts.notesPlaceholder', { defaultValue: 'Add notes...' })}
                          className="mt-1 text-sm"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {/* Navigation and Finish */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (currentExerciseIndex > 0) {
                  setCurrentExerciseIndex(currentExerciseIndex - 1);
                }
              }}
              disabled={currentExerciseIndex === 0}
            >
              {t('common.previous', { defaultValue: 'Previous' })}
            </Button>

            {currentExerciseIndex < exerciseData.length - 1 ? (
              <Button
                onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {t('common.next', { defaultValue: 'Next' })} {t('workouts.exercise', { defaultValue: 'Exercise' })}
              </Button>
            ) : (
              <Button
                onClick={handleFinishWorkout}
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" variant="dumbbell" className="mr-2" />
                    {t('workouts.saving', { defaultValue: 'Saving...' })}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t('workouts.finishWorkout', { defaultValue: 'Finish Workout' })}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
