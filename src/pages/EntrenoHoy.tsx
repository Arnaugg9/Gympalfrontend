import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dumbbell, Calendar as CalendarIcon, Plus, Check, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';

export default function EntrenoHoy() {
  const navigate = useNavigate();
  const [isAddWorkoutDialogOpen, setIsAddWorkoutDialogOpen] = useState(false);

  // Get today's date
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayFormatted = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // TODO: Fetch today's workout from API - GET /api/calendar/today
  const mockWorkouts = {
    '2025-10-21': { routine: 'Push', completed: false },
    '2025-10-22': { routine: 'Pull', completed: false },
    '2025-10-23': { routine: 'Legs', completed: false },
    '2025-10-25': { routine: 'Push', completed: false },
  };

  const todayWorkout = mockWorkouts[todayStr];

  // TODO: Fetch routines from API - GET /api/routines
  const mockRoutines = [
    { id: 1, name: 'Push (Pecho, Hombros, Tríceps)', exercises: 6 },
    { id: 2, name: 'Pull (Espalda, Bíceps)', exercises: 5 },
    { id: 3, name: 'Legs (Piernas)', exercises: 7 },
    { id: 4, name: 'Full Body', exercises: 8 },
    { id: 5, name: 'Upper Body', exercises: 6 },
    { id: 6, name: 'Core & Cardio', exercises: 5 },
  ];

  // TODO: Fetch workout details from API - GET /api/calendar/workout/:date
  const getWorkoutDetails = () => {
    if (!todayWorkout) return null;

    return {
      routine: todayWorkout.routine === 'Push' ? 'Push - Pecho y Hombros' : 
               todayWorkout.routine === 'Pull' ? 'Pull - Espalda y Bíceps' :
               todayWorkout.routine === 'Legs' ? 'Legs - Piernas' : todayWorkout.routine,
      completed: todayWorkout.completed,
      exercises: [
        { id: 1, name: 'Press de Banca', sets: 4, reps: '8-12', weight: [], repsCompleted: [] },
        { id: 2, name: 'Press Militar', sets: 3, reps: '10-12', weight: [], repsCompleted: [] },
        { id: 3, name: 'Aperturas', sets: 3, reps: '12-15', weight: [], repsCompleted: [] },
        { id: 4, name: 'Elevaciones Laterales', sets: 3, reps: '12-15', weight: [], repsCompleted: [] },
      ],
    };
  };

  const handleAddWorkout = (routineId: number) => {
    // TODO: Add workout to calendar - POST /api/calendar
    console.log('Adding workout:', { date: todayStr, routineId });
    setIsAddWorkoutDialogOpen(false);
  };

  const handleCompleteWorkout = () => {
    // TODO: Save workout data and mark as complete - POST /api/calendar/workout/:date/complete
    console.log('Completing workout for:', todayStr);
  };

  const handleDeleteWorkout = () => {
    // TODO: Delete workout from calendar - DELETE /api/calendar/workout/:date
    console.log('Deleting workout for:', todayStr);
  };

  const workoutDetails = getWorkoutDetails();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">Entreno de Hoy</h1>
            <p className="text-slate-600 dark:text-slate-400 capitalize">{todayFormatted}</p>
          </div>
          <Link to="/calendario">
            <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Ver Calendario
            </Button>
          </Link>
        </div>

        {/* Today's Workout Card */}
        {todayWorkout ? (
          <div className="space-y-6">
            <Card className="glass-card card-gradient-blue border-slate-200 dark:border-slate-700 shadow-xl">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-white flex items-center gap-3 mb-2">
                      <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                        <Dumbbell className="h-6 w-6 text-white" />
                      </div>
                      {todayWorkout.routine === 'Push' ? 'Push - Pecho y Hombros' : 
                       todayWorkout.routine === 'Pull' ? 'Pull - Espalda y Bíceps' :
                       todayWorkout.routine === 'Legs' ? 'Legs - Piernas' : todayWorkout.routine}
                    </CardTitle>
                    <p className="text-slate-600 dark:text-slate-400 ml-[60px]">
                      {workoutDetails?.exercises.length} ejercicios planificados
                    </p>
                  </div>
                  <Badge 
                    variant={todayWorkout.completed ? "default" : "secondary"}
                    className={todayWorkout.completed ? "bg-blue-500 text-white" : "bg-purple-500 text-white"}
                  >
                    {todayWorkout.completed ? 'Completado' : 'Planificado'}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Exercises List */}
            {workoutDetails && (
              <div className="space-y-4">
                <h2 className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-emerald-500" />
                  Ejercicios
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workoutDetails.exercises.map((exercise) => (
                    <Card key={exercise.id} className="glass-card card-gradient-emerald border-slate-200 dark:border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                          <Dumbbell className="h-5 w-5 text-emerald-500" />
                          {exercise.name}
                        </CardTitle>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          {exercise.sets} series × {exercise.reps} reps
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Array.from({ length: exercise.sets }).map((_, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-background/50 dark:bg-background/80 rounded-lg border border-border">
                              <span className="text-foreground text-sm w-8">S{index + 1}</span>
                              <Input 
                                placeholder="kg" 
                                type="number"
                                className="flex-1 bg-background border-border text-foreground text-sm" 
                              />
                              <Input 
                                placeholder="reps" 
                                type="number"
                                className="flex-1 bg-background border-border text-foreground text-sm" 
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={handleCompleteWorkout}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover-lift"
              >
                <Check className="h-4 w-4 mr-2" />
                Completar Entrenamiento
              </Button>
              {!todayWorkout.completed && (
                <Button
                  onClick={handleDeleteWorkout}
                  variant="outline"
                  className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        ) : (
          <Card className="glass-card card-gradient-yellow border-orange-200 dark:border-orange-500/30 shadow-xl">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-6 shadow-lg mx-auto">
                <CalendarIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-3">
                No hay entrenamiento planificado para hoy
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Añade una rutina para el día de hoy y comienza a entrenar
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  onClick={() => setIsAddWorkoutDialogOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover-lift"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Entrenamiento
                </Button>
                <Link to="/calendario">
                  <Button variant="outline" className="border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Ir al Calendario
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="glass-card card-gradient-emerald border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl shadow-md">
                  <Dumbbell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Esta Semana</p>
                  <p className="text-slate-900 dark:text-white">3 de 5 entrenamientos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card card-gradient-blue border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-md">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Racha Actual</p>
                  <p className="text-slate-900 dark:text-white">7 días consecutivos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card card-gradient-purple border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-md">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Este Mes</p>
                  <p className="text-slate-900 dark:text-white">18 entrenamientos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Workout Dialog */}
      <Dialog open={isAddWorkoutDialogOpen} onOpenChange={setIsAddWorkoutDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Añadir Entrenamiento</DialogTitle>
            <DialogDescription className="text-muted-foreground capitalize">
              Selecciona una rutina para hoy, {todayFormatted}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {mockRoutines.map((routine) => (
                <button
                  key={routine.id}
                  onClick={() => handleAddWorkout(routine.id)}
                  className="w-full text-left p-4 rounded-lg border border-border hover:border-emerald-500 dark:hover:border-emerald-500 bg-card hover:bg-accent transition-all hover-lift group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600" />
                        <h4 className="text-foreground">{routine.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {routine.exercises} ejercicios
                      </p>
                    </div>
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                  </div>
                </button>
              ))}
              
              {/* Nueva Rutina Option */}
              <button
                onClick={() => {
                  setIsAddWorkoutDialogOpen(false);
                  navigate('/rutinas/crear');
                }}
                className="w-full text-left p-4 rounded-lg border-2 border-dashed border-border hover:border-emerald-500 dark:hover:border-emerald-500 bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 hover:from-emerald-500/10 hover:to-emerald-600/10 transition-all hover-lift group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-2 rounded-lg group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30 transition-colors">
                      <Plus className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-foreground">Nueva Rutina</h4>
                      <p className="text-sm text-muted-foreground">Crear una rutina personalizada</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddWorkoutDialogOpen(false)}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
