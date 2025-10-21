import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Dumbbell } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';

export default function Calendario() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddWorkoutDialogOpen, setIsAddWorkoutDialogOpen] = useState(false);

  // TODO: Fetch calendar data from API - GET /api/calendar
  const mockWorkouts = {
    '2025-10-21': { routine: 'Push', completed: true },
    '2025-10-22': { routine: 'Pull', completed: false },
    '2025-10-23': { routine: 'Legs', completed: false },
    '2025-10-25': { routine: 'Push', completed: false },
  };

  // TODO: Fetch routines from API - GET /api/routines
  const mockRoutines = [
    { id: 1, name: 'Push (Pecho, Hombros, Tríceps)', exercises: 6 },
    { id: 2, name: 'Pull (Espalda, Bíceps)', exercises: 5 },
    { id: 3, name: 'Legs (Piernas)', exercises: 7 },
    { id: 4, name: 'Full Body', exercises: 8 },
    { id: 5, name: 'Upper Body', exercises: 6 },
    { id: 6, name: 'Core & Cardio', exercises: 5 },
  ];

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const handleDayClick = (dateStr: string, hasWorkout: boolean) => {
    if (hasWorkout) {
      // Si tiene entrenamiento, navegar a la página de detalles
      window.location.href = `/calendario/dia/${dateStr}`;
    } else {
      // Si no tiene entrenamiento, abrir el dialog para añadir
      setSelectedDate(dateStr);
      setIsAddWorkoutDialogOpen(true);
    }
  };

  const handleAddWorkout = (routineId: number) => {
    // TODO: Add workout to calendar - POST /api/calendar
    // const response = await fetch('/api/calendar', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ date: selectedDate, routineId })
    // });
    console.log('Adding workout:', { date: selectedDate, routineId });
    setIsAddWorkoutDialogOpen(false);
    setSelectedDate(null);
  };

  const previousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">Planificación de Entrenos</h1>
            <p className="text-slate-600 dark:text-slate-400">Organiza tu calendario de entrenamientos</p>
          </div>
          <Link to="/chat-ia/organizar-calendario">
            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all">
              IA: Organizar Calendario
            </Button>
          </Link>
        </div>

        {/* Calendar */}
        <Card className="glass-card card-gradient-blue border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white capitalize">{monthName}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={previousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  onClick={nextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="text-center text-slate-600 dark:text-slate-400 text-sm py-2">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const workout = mockWorkouts[dateStr];
                const isToday = day === 21;

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(dateStr, !!workout)}
                    className={`aspect-square p-2 rounded-lg border transition-all hover-lift ${
                      isToday
                        ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20'
                        : workout
                        ? workout.completed
                          ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 hover:bg-blue-500/20 dark:hover:bg-blue-500/30'
                          : 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/20 hover:bg-purple-500/20 dark:hover:bg-purple-500/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="text-slate-900 dark:text-white text-sm mb-1">{day}</div>
                    {workout ? (
                      <div className={`text-xs ${workout.completed ? 'text-blue-500' : 'text-purple-500'}`}>
                        {workout.routine}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center mt-1">
                        <Plus className="h-3 w-3 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="glass-card card-gradient-emerald border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500/10" />
                <span className="text-slate-700 dark:text-slate-300 text-sm">Hoy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500/10" />
                <span className="text-slate-700 dark:text-slate-300 text-sm">Completado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-500/10" />
                <span className="text-slate-700 dark:text-slate-300 text-sm">Planificado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-700" />
                <span className="text-slate-700 dark:text-slate-300 text-sm">Vacío</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Workout Dialog */}
      <Dialog open={isAddWorkoutDialogOpen} onOpenChange={setIsAddWorkoutDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Añadir Entrenamiento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Selecciona una rutina para añadir el día{' '}
              {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
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
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddWorkoutDialogOpen(false);
                setSelectedDate(null);
              }}
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
