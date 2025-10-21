import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Play, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function VerRutinas() {
  const navigate = useNavigate();

  // TODO: Fetch routine details from API - GET /api/routines/:id
  const mockRoutine = {
    id: 1,
    name: 'Push Pull Legs',
    day: 'Día 1 - Push (Pecho, Hombros, Tríceps)',
    exercises: [
      { id: 1, name: 'Press de Banca', sets: 4, reps: '8-12', rest: '90s' },
      { id: 2, name: 'Press Militar', sets: 3, reps: '10-12', rest: '60s' },
      { id: 3, name: 'Aperturas con Mancuernas', sets: 3, reps: '12-15', rest: '60s' },
      { id: 4, name: 'Elevaciones Laterales', sets: 3, reps: '12-15', rest: '45s' },
      { id: 5, name: 'Fondos en Paralelas', sets: 3, reps: '10-12', rest: '60s' },
      { id: 6, name: 'Extensiones de Tríceps', sets: 3, reps: '12-15', rest: '45s' },
    ],
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white mb-2">{mockRoutine.name}</h1>
            <p className="text-slate-400">{mockRoutine.day}</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Play className="h-4 w-4 mr-2" />
              Iniciar Entrenamiento
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="border-slate-600 text-red-400 hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-3">
          {mockRoutine.exercises.map((exercise, index) => (
            <Card key={exercise.id} className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-500/10 w-10 h-10 rounded-lg flex items-center justify-center">
                      <span className="text-orange-500">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-white mb-1">{exercise.name}</h3>
                      <p className="text-slate-400 text-sm">
                        {exercise.sets} series × {exercise.reps} reps • Descanso: {exercise.rest}
                      </p>
                    </div>
                  </div>
                  <Link to={`/rutinas/ejercicio/${exercise.id}`}>
                    <Button variant="ghost" className="text-slate-400 hover:text-white">
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50">
          <CardHeader>
            <CardTitle className="text-white">Resumen del Entrenamiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-400 text-sm mb-1">Ejercicios</p>
                <p className="text-white text-2xl">{mockRoutine.exercises.length}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Series Totales</p>
                <p className="text-white text-2xl">
                  {mockRoutine.exercises.reduce((acc, ex) => acc + ex.sets, 0)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Duración Est.</p>
                <p className="text-white text-2xl">60 min</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
