import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export default function RutinaDia() {
  const navigate = useNavigate();
  const { fecha } = useParams();

  // TODO: Fetch workout for specific date - GET /api/calendar/workout/:fecha
  const mockWorkout = {
    date: fecha,
    routine: 'Push - Pecho y Hombros',
    exercises: [
      { id: 1, name: 'Press de Banca', sets: 4, reps: '8-12', completed: [false, false, false, false] },
      { id: 2, name: 'Press Militar', sets: 3, reps: '10-12', completed: [false, false, false] },
      { id: 3, name: 'Aperturas', sets: 3, reps: '12-15', completed: [false, false, false] },
    ],
  };

  const handleComplete = () => {
    // TODO: Mark workout as complete - POST /api/calendar/workout/:fecha/complete
    console.log('Completing workout for:', fecha);
    navigate('/calendario');
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div>
          <h1 className="text-white mb-2">Rutina del Día - {fecha}</h1>
          <p className="text-slate-400">{mockWorkout.routine}</p>
        </div>

        <div className="space-y-4">
          {mockWorkout.exercises.map((exercise) => (
            <Card key={exercise.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">{exercise.name}</CardTitle>
                <p className="text-slate-400">{exercise.sets} series × {exercise.reps} reps</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exercise.completed.map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-white">Serie {index + 1}</span>
                      <Input placeholder="Peso (kg)" className="w-24 bg-slate-800 border-slate-700 text-white" />
                      <Input placeholder="Reps" className="w-20 bg-slate-800 border-slate-700 text-white" />
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-emerald-500">
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={handleComplete} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
          Completar Entrenamiento
        </Button>
      </div>
    </AppLayout>
  );
}
