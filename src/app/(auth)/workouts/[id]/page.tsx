'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { workoutsApi } from '@/features/workouts/api/api';
import { exercisesApi } from '@/features/exercises/api/api';

/**
 * WorkoutDetailPage Component
 * 
 * Displays detailed information about a specific workout routine.
 * Features:
 * - Workout title and description
 * - List of exercises with sets/reps
 * - Action buttons (Start, Edit, Delete)
 * - Workout summary statistics (Total sets, estimated duration)
 */
export default function WorkoutDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [workout, setWorkout] = useState<any>(null);

  /**
   * Fetch workout details on mount
   * Handles fetching additional exercise data if not fully populated
   */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await workoutsApi.get(params.id);
        if (!mounted) return;
        
        // If workout exercises were returned only as ids or without nested exercise objects,
        // fetch exercise details for each missing exercise to display names/details.
        const exercises = data?.exercises || [];
        const needFetch = exercises
          .filter((e: any) => !e.exercise || !e.exercise.name)
          .map((e: any) => e.exerciseId || e.exerciseId || e.exercise_id || e.exercise?.id || e.id);

        if (needFetch.length > 0) {
          try {
            // Deduplicate IDs to fetch
            const uniqueIds = Array.from(new Set(needFetch.filter(Boolean)));
            const fetched = await Promise.all(uniqueIds.map((id) => exercisesApi.get(String(id)).catch(() => null)));
            
            // Map fetched exercises by ID
            const fetchedById: Record<string, any> = {};
            fetched.forEach((f) => { if (f?.id) fetchedById[f.id] = f; });
            
            // Merge fetched exercise objects back into workout exercises
            data.exercises = exercises.map((ex: any) => {
              const exId = ex.exerciseId || ex.exercise_id || ex.exercise?.id || ex.id;
              const full = fetchedById[exId] || ex.exercise || null;
              return {
                ...ex,
                exercise: full ?? ex.exercise,
                id: ex.id ?? exId,
              };
            });
          } catch (err) {
            // ignore fetch errors and continue with whatever data we have
          }
        }

        setWorkout(data);
      } catch {
        if (!mounted) return;
        setWorkout(null);
      }
    })();
    return () => { mounted = false; };
  }, [params.id]);

  const exercises = workout?.exercises || [];

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white mb-2">{workout?.name || 'Rutina'}</h1>
          <p className="text-slate-400">{workout?.description || ''}</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Play className="h-4 w-4 mr-2" />
            Iniciar Entrenamiento
          </Button>
          <Link href={`/workouts/${params.id}/edit`}>
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" className="border-slate-600 text-red-400 hover:bg-red-500/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-3">
        {exercises.map((exercise: any, index: number) => (
          <Card key={exercise.id || index} className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-500/10 w-10 h-10 rounded-lg flex items-center justify-center">
                    <span className="text-orange-500">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-white mb-1">{exercise.exercise?.name || exercise.name}</h3>
                    <p className="text-slate-400 text-sm">
                      {exercise.sets ?? '-'} series × {exercise.reps ?? '-'} reps
                    </p>
                  </div>
                </div>
                <Link href={`/exercises/${exercise.exercise?.id || exercise.id || ''}`}>
                  <Button variant="ghost" className="text-slate-400 hover:text-white">
                    Ver Detalles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Statistics */}
      <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50">
        <CardHeader>
          <CardTitle className="text-white">Resumen del Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-slate-400 text-sm mb-1">Ejercicios</p>
              <p className="text-white text-2xl">{exercises.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Series Totales</p>
              <p className="text-white text-2xl">
                {exercises.reduce((acc: number, ex: any) => acc + (ex.sets || 0), 0)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Duración Est.</p>
              <p className="text-white text-2xl">{exercises.length * 8} min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
