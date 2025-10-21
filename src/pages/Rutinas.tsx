import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dumbbell, Plus, List, ChevronDown, Eye, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

export default function Rutinas() {
  const [visibleRoutines, setVisibleRoutines] = useState(6);
  const [routineToDelete, setRoutineToDelete] = useState<number | null>(null);
  
  // TODO: Fetch routines from API - GET /api/routines
  const mockRoutines = [
    { id: 1, name: 'Fullbody Principiante', exercises: 8, frequency: '3x semana' },
    { id: 2, name: 'Push Pull Legs', exercises: 12, frequency: '6x semana' },
    { id: 3, name: 'Upper Lower Split', exercises: 10, frequency: '4x semana' },
    { id: 4, name: 'Hipertrofia Avanzada', exercises: 15, frequency: '5x semana' },
    { id: 5, name: 'Fuerza 5x5', exercises: 5, frequency: '3x semana' },
    { id: 6, name: 'Cardio HIIT', exercises: 6, frequency: '4x semana' },
    { id: 7, name: 'Movilidad y Flexibilidad', exercises: 10, frequency: '7x semana' },
    { id: 8, name: 'Calistenia Básica', exercises: 8, frequency: '4x semana' },
    { id: 9, name: 'Powerlifting', exercises: 9, frequency: '4x semana' },
    { id: 10, name: 'CrossFit WOD', exercises: 12, frequency: '5x semana' },
    { id: 11, name: 'Entrenamiento Funcional', exercises: 11, frequency: '4x semana' },
    { id: 12, name: 'Torso Pierna', exercises: 14, frequency: '4x semana' },
    { id: 13, name: 'Volumen Alemán', exercises: 6, frequency: '4x semana' },
    { id: 14, name: 'Abdominales Core', exercises: 8, frequency: '6x semana' },
  ];

  const handleShowMore = () => {
    setVisibleRoutines(prev => prev + 6);
  };

  const handleDeleteRoutine = () => {
    if (routineToDelete !== null) {
      // TODO: Delete routine from API - DELETE /api/routines/:id
      console.log('Deleting routine with id:', routineToDelete);
      setRoutineToDelete(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">Gestión de Rutinas</h1>
            <p className="text-slate-600 dark:text-slate-400">Crea y administra tus rutinas de entrenamiento</p>
          </div>
          <Link to="/rutinas/crear">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Rutina
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/rutinas/crear">
            <Card className="glass-card border-orange-200 dark:border-orange-500/30 card-gradient-yellow hover-lift shadow-lg cursor-pointer group">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-slate-900 dark:text-white mb-1">Crear Rutina</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Lista de ejercicios (popup)</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/chat-ia/crear-rutina">
            <Card className="glass-card border-purple-200 dark:border-purple-500/30 card-gradient-purple hover-lift shadow-lg cursor-pointer group">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Dumbbell className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-slate-900 dark:text-white mb-1">IA: Crear Rutina</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Generación de rutina por IA</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Routines List */}
        <div>
          <h2 className="text-slate-900 dark:text-white mb-4">Mis Rutinas</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockRoutines.slice(0, visibleRoutines).map((routine) => (
              <Card key={routine.id} className="glass-card border-orange-200 dark:border-orange-500/30 card-gradient-yellow hover-lift shadow-lg group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                
                {/* Delete Button - Top Right */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRoutineToDelete(routine.id)}
                  className="absolute top-3 right-3 z-10 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <CardHeader className="relative">
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md">
                      <Dumbbell className="h-4 w-4 text-white" />
                    </div>
                    {routine.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {routine.exercises} ejercicios • {routine.frequency}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex gap-2">
                    <Link to={`/rutinas/ver`} className="flex-1">
                      <Button variant="outline" className="w-full border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                        Ver Detalles
                      </Button>
                    </Link>
                    <Button variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Show More Button */}
          {visibleRoutines < mockRoutines.length && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleShowMore}
                variant="outline"
                className="border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover-lift"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Mostrar más ({mockRoutines.length - visibleRoutines} rutinas restantes)
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={routineToDelete !== null} onOpenChange={(open) => !open && setRoutineToDelete(null)}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">¿Eliminar rutina?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Esta acción no se puede deshacer. La rutina será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoutine}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
