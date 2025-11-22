"use client";

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { exercisesApi } from '@/features/exercises/api/api';

export default function ExerciseDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [exercise, setExercise] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await exercisesApi.get(params.id);
        if (!mounted) return;
        setExercise(data);
      } catch (err) {
        if (!mounted) return;
        setExercise(null);
      }
    })();
    return () => { mounted = false; };
  }, [params.id]);

  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-slate-400">Loading exercise…</p>
      </div>
    );
  }

  // Extract YouTube ID if present
  const youtubeUrl = exercise.videoUrl || '';
  let youtubeId: string | null = null;
  try {
    const m = youtubeUrl.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    youtubeId = m ? m[1] : null;
  } catch {}

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{exercise.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300">{exercise.description || 'No description provided.'}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                {exercise.instructions || 'No instructions available.'}
              </div>
            </CardContent>
          </Card>

          {youtubeId && (
            <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-white">Video</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video">
                  <iframe
                    title={`exercise-video-${exercise.id}`}
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded"
                  />
                </div>
                {exercise.videoUrl && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Source: <a className="text-emerald-600 dark:text-emerald-400 hover:underline" href={exercise.videoUrl} target="_blank" rel="noreferrer">{exercise.videoUrl}</a></p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900 dark:text-white">Quick Info</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-2 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <dt className="font-medium text-slate-900 dark:text-white">Muscle Group</dt>
                  <dd>{exercise.muscleGroup || (exercise.muscleGroups || []).join(', ') || '—'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900 dark:text-white">Equipment</dt>
                  <dd>{(exercise.equipment || []).length ? (exercise.equipment || []).join(', ') : 'None'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900 dark:text-white">Difficulty</dt>
                  <dd>{exercise.difficulty || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-900 dark:text-white">Tags</dt>
                  <dd>{(exercise.tags || []).join(', ') || '—'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {exercise.imageUrl && (
            <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-white">Image</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={exercise.imageUrl} alt={exercise.name} className="w-full rounded" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
