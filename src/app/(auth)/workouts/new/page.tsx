'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
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
 * WorkoutCreatePage Component
 * 
 * Form for creating a new workout routine.
 * Features:
 * - Basic info (Name, Description, Difficulty)
 * - Advanced settings (Type, Frequency, Notes)
 * - Exercise selection (persisted via localStorage to survive navigation)
 * - Form validation and submission
 */
export default function WorkoutCreatePage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  // Form State
  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState('');
  const [description, setDescription] = useState('');
  
  // New fields
  const [workoutType, setWorkoutType] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true); // Default to public
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * Load form data from localStorage on mount.
   * This allows users to navigate to the exercise selector and back without losing data.
   * Note: This page is ONLY for creating new workouts. Editing should use /workouts/[id]/edit
   */
  useEffect(() => {
    try {
      // Check if localStorage is available (browser compatibility)
      if (typeof window === 'undefined' || !window.localStorage) {
        setIsInitialized(true);
        return;
      }
      
      // Clear any leftover edit ID from previous sessions
      // This ensures we're always creating a new workout, not editing
      localStorage.removeItem('workoutEditId');
      
      // Load exercises
      const storedExercises = localStorage.getItem('workoutFormExercises');
      if (storedExercises) {
        const exercises = JSON.parse(storedExercises);
        setSelectedExercises(exercises);
      }

      // Load form fields
      const storedRoutineName = localStorage.getItem('workoutFormName');
      if (storedRoutineName) setWorkoutName(storedRoutineName);

      const storedDescription = localStorage.getItem('workoutFormDescription');
      if (storedDescription) setDescription(storedDescription);

      const storedDifficulty = localStorage.getItem('workoutFormDifficulty');
      if (storedDifficulty) setDifficulty(storedDifficulty);

      // Load new fields
      const storedType = localStorage.getItem('workoutFormType');
      if (storedType) setWorkoutType(storedType);
      
      const storedDays = localStorage.getItem('workoutFormDays');
      if (storedDays) setDaysPerWeek(storedDays);
      
      const storedNotes = localStorage.getItem('workoutFormNotes');
      if (storedNotes) setUserNotes(storedNotes);

      const storedIsPublic = localStorage.getItem('workoutFormIsPublic');
      if (storedIsPublic !== null) setIsPublic(storedIsPublic === 'true');

      setIsInitialized(true);
    } catch (err) {
      setIsInitialized(true);
    }
  }, []);

  // --- Persistence Effects: Save form data to localStorage on change ---
  // Safe localStorage helper with error handling for browser compatibility
  const safeSetItem = (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      // localStorage may be disabled or full in some browsers
      console.warn(`Failed to save to localStorage (${key}):`, error);
    }
  };

  useEffect(() => {
    if (isInitialized) safeSetItem('workoutFormName', workoutName);
  }, [workoutName, isInitialized]);

  useEffect(() => {
    if (isInitialized) safeSetItem('workoutFormDescription', description);
  }, [description, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      safeSetItem('workoutFormDifficulty', difficulty);
      safeSetItem('workoutFormType', workoutType);
      safeSetItem('workoutFormDays', daysPerWeek);
      safeSetItem('workoutFormNotes', userNotes);
      safeSetItem('workoutFormIsPublic', isPublic.toString());
    }
  }, [difficulty, workoutType, daysPerWeek, userNotes, isPublic, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      safeSetItem('workoutFormExercises', JSON.stringify(selectedExercises));
    }
  }, [selectedExercises, isInitialized]);

  /**
   * Handle form submission
   * Validates input and calls API to create workout
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

    setLoading(true);
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
        duration_minutes: estimatedDuration || 60, // Use estimated duration or default
        exercises,
      };

      // Add optional fields if provided
      if (difficulty) payload.difficulty = difficulty;
      if (workoutType) payload.type = workoutType;
      if (daysPerWeek) payload.days_per_week = parseInt(daysPerWeek);
      if (userNotes) payload.user_notes = userNotes;
      payload.is_public = isPublic; // Always include visibility setting

      // This page is ONLY for creating new workouts
      // Editing should use /workouts/[id]/edit
      const created = await workoutsApi.create(payload);
      
      // Show success and redirect
      setError('');

      // Clear localStorage data after successful creation
      localStorage.removeItem('workoutFormName');
      localStorage.removeItem('workoutFormDescription');
      localStorage.removeItem('workoutFormDifficulty');
      localStorage.removeItem('workoutFormExercises');
      localStorage.removeItem('workoutFormType');
      localStorage.removeItem('workoutFormDays');
      localStorage.removeItem('workoutFormNotes');
      localStorage.removeItem('workoutFormIsPublic');
      localStorage.removeItem('workoutEditId'); // Ensure edit ID is cleared

      // Redirect to the created workout detail page
      if (created?.id) {
        router.push(`/workouts/${created.id}`);
      } else {
        router.push('/workouts');
      }
    } catch (err: any) {
      let msg = 'Error creating routine';

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
      setLoading(false);
    }
  };

  const estimatedDuration = selectedExercises.length > 0 ? selectedExercises.length * 8 : 0;

  return (
    <div className="space-y-8">
      <Link href="/workouts" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('common.back', { defaultValue: 'Back' })}
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('workouts.createNewRoutine', { defaultValue: 'Create New Routine' })}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('workouts.configureRoutine', { defaultValue: 'Configure your custom routine' })}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-shadow">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">{t('workouts.basicInformation', { defaultValue: 'Basic Information' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-900 dark:text-white">{t('workouts.routineName', { defaultValue: 'Routine Name' })} *</Label>
                <Input
                  id="name"
                  placeholder={t('workouts.routineNamePlaceholder', { defaultValue: 'E.g: Push Pull Legs' })}
                  className="bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500/20"
                    value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-900 dark:text-white">{t('workouts.description', { defaultValue: 'Description' })} ({t('common.optional', { defaultValue: 'Optional' })})</Label>
                <Input
                  id="description"
                  placeholder={t('workouts.descriptionPlaceholder', { defaultValue: 'E.g: My weekly training plan' })}
                  className="bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500/20"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-900 dark:text-white">{t('workouts.difficultyLevel', { defaultValue: 'Difficulty Level' })}</Label>
                  <Select value={difficulty} onValueChange={setDifficulty} disabled={loading}>
                    <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-500">
                      <SelectValue placeholder={t('workouts.selectDifficulty', { defaultValue: 'Select difficulty' })} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-lg">
                      <SelectItem value="beginner">{t('workouts.beginner', { defaultValue: 'Beginner' })}</SelectItem>
                      <SelectItem value="intermediate">{t('workouts.intermediate', { defaultValue: 'Intermediate' })}</SelectItem>
                      <SelectItem value="advanced">{t('workouts.advanced', { defaultValue: 'Advanced' })}</SelectItem>
                      <SelectItem value="expert">{t('workouts.expert', { defaultValue: 'Expert' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 dark:text-white">{t('workouts.workoutType', { defaultValue: 'Workout Type' })}</Label>
                  <Select value={workoutType} onValueChange={setWorkoutType} disabled={loading}>
                    <SelectTrigger className="bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-emerald-500 dark:focus:border-emerald-500">
                      <SelectValue placeholder={t('workouts.selectType', { defaultValue: 'Select type' })} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-lg">
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
                  <Label htmlFor="days" className="text-slate-900 dark:text-white">{t('workouts.frequency', { defaultValue: 'Frequency (Days/Week)' })}</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    max="7"
                    placeholder={t('workouts.frequencyPlaceholder', { defaultValue: 'e.g. 3' })}
                    className="bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500/20"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-slate-900 dark:text-white">{t('workouts.estimatedDuration', { defaultValue: 'Estimated Duration' })}</Label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-400 font-medium">
                    {estimatedDuration > 0 ? `${estimatedDuration} min` : t('workouts.addExercisesFirst', { defaultValue: 'Add exercises first' })}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-slate-900 dark:text-white">{t('workouts.personalNotes', { defaultValue: 'Personal Notes' })}</Label>
                <Textarea
                  id="notes"
                  placeholder={t('workouts.personalNotesPlaceholder', { defaultValue: 'Any specific instructions or reminders...' })}
                  className="bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none h-20 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500/20"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic" className="text-slate-900 dark:text-white font-medium">{t('workouts.makePublic')}</Label>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{t('workouts.makePublicDescription')}</p>
                </div>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Exercises Section */}
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none transition-shadow">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="text-slate-900 dark:text-white flex items-center justify-between">
                {t('workouts.selectedExercises', { defaultValue: 'Selected Exercises' })} *
                <Button
                  onClick={() => router.push('/exercises')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md transition-shadow"
                  disabled={loading}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('workouts.addExercises', { defaultValue: 'Add Exercises' })}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {selectedExercises.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/30">
                  <p className="text-slate-600 dark:text-slate-400 font-medium">{t('workouts.noExercisesSelected', { defaultValue: 'No exercises selected yet' })}</p>
                  <p className="text-xs mt-2 text-slate-500 dark:text-slate-500">{t('workouts.clickAddExercises', { defaultValue: 'Click "Add Exercises" to select exercises for your routine' })}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedExercises.map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-all shadow-sm hover:shadow">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-slate-900 dark:text-white block font-medium">{exercise.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {exercise.sets || 3} {t('workouts.sets', { defaultValue: 'sets' })} × {exercise.reps || 10} {t('workouts.reps', { defaultValue: 'reps' })}
                        </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 ml-2"
                        onClick={() => setSelectedExercises((prev) => prev.filter((_, i) => i !== index))}
                        disabled={loading}
                        title={t('common.remove', { defaultValue: 'Remove' })}
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
          <Card className="bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-cyan-50 dark:from-emerald-500/20 dark:via-emerald-500/20 dark:to-cyan-500/20 border-emerald-200 dark:border-emerald-500/50 shadow-lg dark:shadow-none sticky top-4">
            <CardHeader className="border-b border-emerald-200/50 dark:border-emerald-500/30">
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                {t('workouts.summary', { defaultValue: 'Summary' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="p-4 bg-white/60 dark:bg-slate-800/40 rounded-lg border border-emerald-200/50 dark:border-emerald-500/30">
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">{t('workouts.totalExercises', { defaultValue: 'Total Exercises' })}</p>
                  <p className="text-slate-900 dark:text-white text-3xl font-bold">{selectedExercises.length}</p>
                </div>
                <div className="p-4 bg-white/60 dark:bg-slate-800/40 rounded-lg border border-emerald-200/50 dark:border-emerald-500/30">
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-2">{t('workouts.estimatedDuration', { defaultValue: 'Estimated Duration' })}</p>
                  <p className="text-slate-900 dark:text-white text-3xl font-bold">{estimatedDuration} <span className="text-lg text-slate-600 dark:text-slate-400">min</span></p>
              </div>
              </div>

              {error && (
                <div className="text-red-700 dark:text-red-400 text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 max-h-20 overflow-y-auto">
                  <p className="font-semibold mb-1">{t('common.error', { defaultValue: 'Error' })}:</p>
                  <p className="text-xs">{error}</p>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!workoutName.trim() || selectedExercises.length === 0 || loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" variant="dumbbell" />
                    <span>{t('common.creating', { defaultValue: 'Creating...' })}</span>
                  </div>
                ) : (
                  t('workouts.saveRoutine', { defaultValue: 'Save Routine' })
                )}
              </Button>

              {loading && (
                <div className="flex items-center justify-center py-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400">{t('workouts.processingRoutine', { defaultValue: 'Processing your routine...' })}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
