'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, Check, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exercisesApi } from '@/features/exercises/api/api';

const MUSCLE_GROUPS = [
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'legs', label: 'Legs' },
  { value: 'arms', label: 'Arms' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'abs', label: 'Abs' },
  { value: 'core', label: 'Core' },
  { value: 'full_body', label: 'Full Body' },
  { value: 'cardio', label: 'Cardio' },
];

export default function ExercisesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [persistedExerciseMap, setPersistedExerciseMap] = useState<Record<string, any>>({});

  const getExerciseId = (exercise: any): string => {
    const rawId = exercise?.id ?? exercise?.uuid ?? exercise?._id ?? exercise?.exercise_id;
    return rawId ? String(rawId) : '';
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('workoutFormExercises');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const map: Record<string, any> = {};
          const ids: string[] = [];
          parsed.forEach((exercise: any) => {
            const id = getExerciseId(exercise);
            if (id) {
              map[id] = exercise;
              ids.push(id);
            }
          });
          setPersistedExerciseMap(map);
          setSelectedExercises(ids);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Pass muscle group filter to API if selected
        const filters: any = {};
        if (selectedMuscleGroup !== 'all') filters.muscleGroup = selectedMuscleGroup;
        
        const response = await exercisesApi.list(1, 100, filters); // Increase limit to show more exercises
        if (!mounted) return;

        // Handle different response formats from backend
        let items: any[] = [];
        const responseAny = response as any;
        if (responseAny?.data && Array.isArray(responseAny.data)) {
          items = responseAny.data;
        } else if (responseAny?.exercises && Array.isArray(responseAny.exercises)) {
          items = responseAny.exercises;
        } else if (Array.isArray(responseAny)) {
          items = responseAny;
        }

        setExercises(items);
      } catch (err) {
        if (!mounted) return;
        setExercises([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedMuscleGroup]); // Re-fetch when muscle group changes

  // Filter exercises by tag locally (since API doesn't support tag filtering yet)
  const filteredExercises = useMemo(() => {
    if (selectedTag === 'all') return exercises;
    
    return exercises.filter(ex => {
      // Check tags array
      if (Array.isArray(ex.tags) && ex.tags.includes(selectedTag)) return true;
      
      // Check if tags is a string that contains the tag
      if (typeof ex.tags === 'string' && ex.tags.includes(selectedTag)) return true;
      
      return false;
    });
  }, [exercises, selectedTag]);

  // Group exercises by difficulty level - keep full exercise data
  const byDifficulty = useMemo(() => {
    const map: Record<string, any[]> = {};
    const difficultyOrder = ['beginner', 'intermediate', 'advanced', 'expert'];

    for (const e of filteredExercises) {
      const difficulty = (e.difficulty || 'intermediate').toString().toLowerCase();
      if (!map[difficulty]) map[difficulty] = [];
      // Store full exercise object, not just { id, name, difficulty }
      map[difficulty].push(e);
    }

    // Sort by difficulty order
    const ordered: Record<string, any[]> = {};
    for (const level of difficultyOrder) {
      if (map[level]) {
        ordered[level] = map[level];
      }
    }
    // Add any other difficulties
    for (const key in map) {
      if (!ordered[key]) {
        ordered[key] = map[key] || [];
      }
    }
    return ordered;
  }, [exercises]);

  const difficulties = Object.keys(byDifficulty).length ? Object.keys(byDifficulty) : [];

  const toggleExercise = (id: string) => {
    setSelectedExercises((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const handleSave = () => {
    // Save selected exercises to localStorage so they persist across navigation
    if (selectedExercises.length > 0) {
      const selectedExerciseData: any[] = [];

      selectedExercises.forEach((selectedId) => {
        const exercise =
          exercises.find((ex) => getExerciseId(ex) === selectedId) ||
          persistedExerciseMap[selectedId];

        if (exercise) {
          selectedExerciseData.push(exercise);
        }
      });

      localStorage.setItem('workoutFormExercises', JSON.stringify(selectedExerciseData));
    } else {
      localStorage.removeItem('workoutFormExercises');
    }
    router.back();
  };

  const passesSearch = (name: string) => name.toLowerCase().includes(searchQuery.trim().toLowerCase());

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Button
          onClick={handleSave}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
          disabled={selectedExercises.length === 0}
        >
          <Check className="h-4 w-4 mr-2" />
          Add ({selectedExercises.length})
        </Button>
      </div>

      <div>
        <h1 className="text-white mb-2">Exercise Library</h1>
        <p className="text-slate-400">Select exercises for your routine</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search exercises..."
            className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder="All Muscles" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">All Muscles</SelectItem>
              {MUSCLE_GROUPS.map((group) => (
                <SelectItem key={group.value} value={group.value}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="all">All Tags</SelectItem>
              <SelectItem value="dumbbells">Dumbbells</SelectItem>
              <SelectItem value="barbell">Barbell</SelectItem>
              <SelectItem value="bodyweight">Bodyweight</SelectItem>
              <SelectItem value="machine">Machine</SelectItem>
              <SelectItem value="cable">Cable</SelectItem>
              <SelectItem value="kettlebell">Kettlebell</SelectItem>
              <SelectItem value="bench">Bench</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">Loading exercises...</div>
        </div>
      )}

      {/* No Exercises Message */}
      {!loading && exercises.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-slate-400">No exercises found</p>
            <p className="text-slate-500 text-sm mt-2">Try reloading the page or contact support</p>
          </div>
        </div>
      )}

      {/* Exercise Difficulties */}
      {!loading && exercises.length > 0 && difficulties.length > 0 && (
        <Tabs defaultValue={difficulties[0]} className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            {difficulties.map((d) => (
              <TabsTrigger key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</TabsTrigger>
            ))}
          </TabsList>

          {difficulties.map((difficulty) => (
            <TabsContent key={difficulty} value={difficulty} className="space-y-3">
              {(byDifficulty[difficulty] || []).filter((e) => passesSearch(e.name)).map((exercise: any) => {
                const exerciseId = String(exercise.id || exercise.uuid || exercise._id);
                const isSelected = selectedExercises.includes(exerciseId);
                const videoUrl = exercise?.videoUrl || exercise?.video_url;
                return (
                  <Card
                    key={exerciseId}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => toggleExercise(exerciseId)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white mb-1">{exercise.name}</h3>
                          <p className="text-slate-400 text-sm">{exercise.difficulty}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                            className="text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                              router.push(`/exercises/${exerciseId}`);
                              }}
                            title="Ver detalles"
                            >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver detalles
                            </Button>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                          }`}>
                            {isSelected && <Check className="h-4 w-4 text-white" />}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {(byDifficulty[difficulty] || []).filter((e) => passesSearch(e.name)).length === 0 && (
                <div className="text-slate-500 text-center py-8">
                  No exercises in this difficulty level
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}


