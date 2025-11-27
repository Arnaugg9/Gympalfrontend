'use client';

import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { workoutsApi } from '@/features/workouts/api/api';

/**
 * EditWorkoutPage Component
 * 
 * Form for editing an existing workout routine.
 * Similar structure to the create page but pre-filled with existing data.
 * Features:
 * - Basic info (Name, Description, Difficulty)
 * - Advanced settings (Type, Frequency, Notes)
 * - Exercise selection (with current exercises pre-selected)
 * - Form validation and submission
 */
export default function EditWorkoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  
  // Form State
  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState('');
  const [description, setDescription] = useState('');
  
  // New fields
  const [workoutType, setWorkoutType] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * Load workout data on mount
   */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const workoutData = await workoutsApi.get(params.id as string);
        if (!mounted) return;
        
        if (workoutData) {
          setWorkoutName(workoutData.name || '');
          setDescription(workoutData.description || '');
          setDifficulty(workoutData.difficulty || '');
          setWorkoutType(workoutData.type || '');
          setDaysPerWeek(workoutData.days_per_week?.toString() || '');
          setUserNotes(workoutData.user_notes || '');
          setIsPublic(workoutData.is_public !== undefined ? workoutData.is_public : true);
          
          // Map exercises to the format expected by the form
          const exercises = (workoutData.exercises || []).map((ex: any) => ({
            id: ex.exercise_id || ex.exercise?.id || ex.id,
            name: ex.exercise?.name || ex.name || 'Unknown Exercise',
            exercise_id: ex.exercise_id || ex.exercise?.id || ex.id,
            sets: ex.sets || 3,
            reps: ex.reps || 10,
            weight: ex.weight_kg || ex.weight || 0,
          }));
          
          setSelectedExercises(exercises);
          previousExercisesRef.current = exercises;
          
          // Also save to localStorage for persistence when navigating to exercises page
          // Check if localStorage is available (browser compatibility)
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('workoutFormExercises', JSON.stringify(exercises));
          }
        }
      } catch (err: any) {
        console.error('Failed to load workout:', err);
        setError(err?.message || 'Failed to load workout');
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    })();
    return () => { mounted = false; };
  }, [params.id]);

  // Store a ref to track previous exercises for comparison
  const previousExercisesRef = useRef<any[]>([]);

  /**
   * Sync exercises from localStorage when returning from exercises page
   * Uses multiple strategies to ensure reliable synchronization
   */
  useEffect(() => {
    if (!isInitialized) return;
    
    const syncExercises = () => {
      try {
        // Check if localStorage is available (browser compatibility)
        if (typeof window === 'undefined' || !window.localStorage) return;
        
        const editId = localStorage.getItem('workoutEditId');
        // Only sync if we're in edit mode for this workout
        if (editId !== params.id) return;
        
        const storedExercises = localStorage.getItem('workoutFormExercises');
        
        if (storedExercises) {
          const exercises: any[] = JSON.parse(storedExercises);
          
          // Normalize exercise IDs for comparison
          const normalizeExerciseId = (ex: any): string => {
            return String(ex.id || ex.exercise_id || ex.uuid || ex._id || '');
          };
          
          // Get current exercises from ref (to avoid infinite loops)
          const currentExercises = previousExercisesRef.current;
          
          // Create a map of current exercises by ID for quick lookup
          const currentExercisesMap = new Map<string, any>();
          currentExercises.forEach((ex) => {
            const id = normalizeExerciseId(ex);
            if (id) currentExercisesMap.set(id, ex);
          });
          
          // Process stored exercises, preserving sets/reps/weight from current state if they exist
          const updatedExercises = exercises.map((ex: any) => {
            const exerciseId = normalizeExerciseId(ex);
            const existing = exerciseId ? currentExercisesMap.get(exerciseId) : null;
            
            return {
              id: exerciseId || ex.id || ex.exercise_id || ex.uuid || ex._id,
              name: ex.name || 'Unknown Exercise',
              exercise_id: exerciseId || ex.exercise_id || ex.id || ex.uuid || ex._id,
              sets: ex.sets !== undefined ? ex.sets : (existing?.sets !== undefined ? existing.sets : 3),
              reps: ex.reps !== undefined ? ex.reps : (existing?.reps !== undefined ? existing.reps : 10),
              weight: ex.weight !== undefined ? ex.weight : (existing?.weight !== undefined ? existing.weight : 0),
            };
          });
          
          // Simple comparison: check if the number of exercises changed or if IDs are different
          const currentIds = new Set(currentExercises.map((ex: any) => normalizeExerciseId(ex)).filter(Boolean));
          const updatedIds = new Set(updatedExercises.map((ex: any) => normalizeExerciseId(ex)).filter(Boolean));
          
          // Check if exercises were added, removed, or changed
          const lengthChanged = currentExercises.length !== updatedExercises.length;
          
          // Check if any IDs are different (more reliable than checking if all match)
          // This specifically checks for NEW IDs (exercises added)
          const hasNewIds = Array.from(updatedIds).some((id: string) => !currentIds.has(id));
          // This checks for REMOVED IDs (exercises removed)
          const hasRemovedIds = Array.from(currentIds).some((id: string) => !updatedIds.has(id));
          // Check if sizes are different
          const sizeChanged = currentIds.size !== updatedIds.size;
          
          // Always update if we detect ANY change:
          // - Length changed (added or removed exercises)
          // - New IDs found (exercises added)
          // - Removed IDs found (exercises removed)
          // - Size changed (different number of valid IDs)
          if (lengthChanged || hasNewIds || hasRemovedIds || sizeChanged) {
            previousExercisesRef.current = updatedExercises;
            setSelectedExercises(updatedExercises);
            return;
          }
          
          // If same exercises, check if any data changed (sets, reps, weight)
          if (currentExercises.length === updatedExercises.length) {
            const currentMap = new Map<string, any>();
            currentExercises.forEach(ex => {
              const id = normalizeExerciseId(ex);
              if (id) currentMap.set(id, ex);
            });
            
            const updatedMap = new Map<string, any>();
            updatedExercises.forEach(ex => {
              const id = normalizeExerciseId(ex);
              if (id) updatedMap.set(id, ex);
            });
            
            // Check if any exercise data changed
            let dataChanged = false;
            for (const [id, currentEx] of currentMap) {
              const updatedEx = updatedMap.get(id);
              if (updatedEx && (
                currentEx.sets !== updatedEx.sets ||
                currentEx.reps !== updatedEx.reps ||
                currentEx.weight !== updatedEx.weight
              )) {
                dataChanged = true;
                break;
              }
            }
            
            if (dataChanged) {
              previousExercisesRef.current = updatedExercises;
              setSelectedExercises(updatedExercises);
            }
          }
        } else {
          // If localStorage is empty, clear exercises (user removed all)
          if (previousExercisesRef.current.length > 0) {
            previousExercisesRef.current = [];
            setSelectedExercises([]);
          }
        }
      } catch (err) {
        console.error('Failed to load exercises from localStorage:', err);
      }
    };

    // Check immediately
    syncExercises();
    
    // Check periodically while page is active (every 500ms)
    const interval = setInterval(syncExercises, 500);
    
    // Check when page becomes visible (with browser compatibility)
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        syncExercises();
      }
    };
    
    // Check on focus (with browser compatibility)
    const handleFocus = () => {
      if (typeof window !== 'undefined') {
        syncExercises();
      }
    };
    
    // Add event listeners only if available (browser compatibility)
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('focus', handleFocus);
    }
    
    return () => {
      clearInterval(interval);
      if (typeof document !== 'undefined' && document.removeEventListener) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, [isInitialized, params.id]);

  /**
   * Handle form submission
   * Validates input and calls API to update workout
   */
  const handleSubmit = async () => {
    if (!workoutName.trim()) {
      setError('Workout name is required');
      return;
    }
    if (selectedExercises.length === 0) {
      setError('You must add at least one exercise');
      return;
    }

    setSaving(true);
    setError('');
    try {
      // Format exercises according to backend expectations
      const exercises = selectedExercises.map((ex) => {
        // Try multiple possible ID fields
        const exerciseId = ex.id || ex.exercise_id || ex.uuid || ex._id;

        if (!exerciseId) {
          throw new Error(`Exercise "${ex.name}" is missing an ID`);
        }

        const exerciseData: any = {
          exercise_id: exerciseId,
          sets: parseInt(ex.sets) || 3,
          reps: parseInt(ex.reps) || 10,
        };

        // Only include weight if it's provided and greater than 0
        const weight = parseFloat(ex.weight);
        if (weight && weight > 0) {
          exerciseData.weight = weight;
        }

        return exerciseData;
      });

      // Prepare payload
      const payload: any = {
        name: workoutName.trim(),
        description: description.trim() || '',
        duration_minutes: estimatedDuration || 60,
        exercises,
      };

      // Add optional fields if provided
      if (difficulty) payload.difficulty = difficulty;
      if (workoutType) payload.type = workoutType;
      if (daysPerWeek) payload.days_per_week = parseInt(daysPerWeek);
      if (userNotes) payload.user_notes = userNotes;
      payload.is_public = isPublic;

      // Update existing workout
      await workoutsApi.update(params.id as string, payload);
      
      // Clear localStorage after successful update
      localStorage.removeItem('workoutEditId');
      localStorage.removeItem('workoutFormExercises');
      
      // Redirect to workout detail page
      router.push(`/workouts/${params.id}`);
    } catch (err: any) {
      let msg = 'Error updating routine';

      if (err?.response?.data?.error?.message) {
        msg = err.response.data.error.message;
      } else if (err?.response?.data?.details) {
        msg = err.response.data.details;
      } else if (err?.message) {
        msg = err.message;
      } else if (typeof err === 'string') {
        msg = err;
      }

      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  const estimatedDuration = selectedExercises.length > 0 ? selectedExercises.length * 8 : 0;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center text-slate-400">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href={`/workouts/${params.id}`} className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
        </Link>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('workouts.editRoutine', { defaultValue: 'Edit Routine' })}</h1>
        <p className="text-slate-400">{t('workouts.editRoutineDescription', { defaultValue: 'Modify your custom routine' })}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
              <CardTitle className="text-white">{t('workouts.basicInformation', { defaultValue: 'Basic Information' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
                <Label htmlFor="name" className="text-white">{t('workouts.routineName')} *</Label>
            <Input
              id="name"
                  placeholder={t('workouts.routineNamePlaceholder', { defaultValue: 'E.g: Push Pull Legs' })}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-500"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  disabled={saving}
            />
          </div>

          <div className="space-y-2">
                <Label htmlFor="description" className="text-white">{t('workouts.description')} ({t('common.optional', { defaultValue: 'Optional' })})</Label>
                <Input
              id="description"
                  placeholder={t('workouts.descriptionPlaceholder', { defaultValue: 'E.g: My weekly training plan' })}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">{t('workouts.difficultyLevel', { defaultValue: 'Difficulty Level' })}</Label>
                  <Select value={difficulty} onValueChange={setDifficulty} disabled={saving}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue placeholder={t('workouts.selectDifficulty', { defaultValue: 'Select difficulty' })} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="beginner">{t('workouts.beginner', { defaultValue: 'Beginner' })}</SelectItem>
                      <SelectItem value="intermediate">{t('workouts.intermediate', { defaultValue: 'Intermediate' })}</SelectItem>
                      <SelectItem value="advanced">{t('workouts.advanced', { defaultValue: 'Advanced' })}</SelectItem>
                      <SelectItem value="expert">{t('workouts.expert', { defaultValue: 'Expert' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">{t('workouts.workoutType', { defaultValue: 'Workout Type' })}</Label>
                  <Select value={workoutType} onValueChange={setWorkoutType} disabled={saving}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue placeholder={t('workouts.selectType', { defaultValue: 'Select type' })} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="strength">{t('workouts.strengthTraining', { defaultValue: 'Strength Training' })}</SelectItem>
                      <SelectItem value="cardio">{t('workouts.cardio', { defaultValue: 'Cardio' })}</SelectItem>
                      <SelectItem value="hypertrophy">{t('workouts.hypertrophy', { defaultValue: 'Hypertrophy' })}</SelectItem>
                      <SelectItem value="endurance">{t('workouts.endurance', { defaultValue: 'Endurance' })}</SelectItem>
                      <SelectItem value="flexibility">{t('workouts.flexibility', { defaultValue: 'Flexibility' })}</SelectItem>
                      <SelectItem value="hiit">{t('workouts.hiit', { defaultValue: 'HIIT' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="days" className="text-white">{t('workouts.frequency', { defaultValue: 'Frequency (Days/Week)' })}</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    max="7"
                    placeholder={t('workouts.frequencyPlaceholder', { defaultValue: 'e.g. 3' })}
                    className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-500"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(e.target.value)}
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white">{t('workouts.estimatedDuration', { defaultValue: 'Estimated Duration' })}</Label>
                  <div className="p-2 bg-slate-900/50 border border-slate-700 rounded-md text-slate-400">
                    {estimatedDuration > 0 ? `${estimatedDuration} min` : t('workouts.addExercisesFirst', { defaultValue: 'Add exercises first' })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">{t('workouts.personalNotes', { defaultValue: 'Personal Notes' })}</Label>
                <Textarea
                  id="notes"
                  placeholder={t('workouts.personalNotesPlaceholder', { defaultValue: 'Any specific instructions or reminders...' })}
                  className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 resize-none h-20"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic" className="text-white">{t('workouts.makePublic')}</Label>
                  <p className="text-xs text-slate-400">{t('workouts.makePublicDescription')}</p>
                </div>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

          {/* Exercises Section */}
          <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                {t('workouts.selectedExercises')} *
                <Button
                  onClick={() => {
                    // Save current workout ID to localStorage so exercises page knows we're editing
                    localStorage.setItem('workoutEditId', params.id as string);
                    // Save current exercises to localStorage so exercises page can pre-select them
                    localStorage.setItem('workoutFormExercises', JSON.stringify(selectedExercises));
                    router.push('/exercises');
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  disabled={saving}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('workouts.addExercises', { defaultValue: 'Add Exercises' })}
                </Button>
              </CardTitle>
        </CardHeader>
        <CardContent>
              {selectedExercises.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>{t('workouts.noExercisesSelected', { defaultValue: 'No exercises selected yet' })}</p>
                  <p className="text-xs mt-2">{t('workouts.clickAddExercises', { defaultValue: 'Click "Add Exercises" to select exercises for your routine' })}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedExercises.map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex-1">
                        <span className="text-white block font-medium">{exercise.name}</span>
                        <span className="text-xs text-slate-400">
                          {exercise.sets} {t('workouts.sets', { defaultValue: 'sets' })} × {exercise.reps} {t('workouts.reps', { defaultValue: 'reps' })}
                        </span>
                      </div>
                  <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => {
                          const updated = selectedExercises.filter((_, i) => i !== index);
                          setSelectedExercises(updated);
                          previousExercisesRef.current = updated;
                          // Update localStorage to keep in sync
                          localStorage.setItem('workoutFormExercises', JSON.stringify(updated));
                        }}
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                  </Button>
                    </div>
                  ))}
            </div>
          )}
        </CardContent>
      </Card>
        </div>

        {/* Sidebar / Summary */}
        <div>
          <Card className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/50 sticky top-4">
            <CardHeader>
              <CardTitle className="text-white">{t('workouts.summary', { defaultValue: 'Summary' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">{t('workouts.totalExercises', { defaultValue: 'Total Exercises' })}</p>
                <p className="text-white text-2xl font-bold">{selectedExercises.length}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">{t('workouts.estimatedDuration', { defaultValue: 'Estimated Duration' })}</p>
                <p className="text-white text-2xl font-bold">{estimatedDuration} min</p>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded p-3 max-h-20 overflow-y-auto">
                  <p className="font-medium mb-1">{t('common.error', { defaultValue: 'Error' })}:</p>
                  <p>{error}</p>
                </div>
              )}

        <Button 
                onClick={handleSubmit}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                disabled={!workoutName.trim() || selectedExercises.length === 0 || saving}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" variant="dumbbell" />
                    <span>{t('common.saving', { defaultValue: 'Saving...' })}</span>
                  </div>
                ) : (
                  t('common.save', { defaultValue: 'Save Routine' })
                )}
        </Button>

              {saving && (
                <div className="flex items-center justify-center py-2">
                  <p className="text-xs text-slate-400">{t('workouts.processingRoutine', { defaultValue: 'Processing your routine...' })}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
