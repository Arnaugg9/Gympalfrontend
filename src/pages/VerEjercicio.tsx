import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Dumbbell, Target, AlertCircle, Play } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function VerEjercicio() {
  const navigate = useNavigate();
  const { id } = useParams();

  // TODO: Fetch exercise details from API - GET /api/exercises/:id
  const mockExercise = {
    id: Number(id),
    name: 'Press de Banca',
    category: 'Pecho',
    difficulty: 'Intermedio',
    equipment: 'Barra, Banco',
    description: 'El press de banca es un ejercicio compuesto fundamental para el desarrollo del pecho, hombros y tríceps.',
    instructions: [
      'Acuéstate en el banco con los pies apoyados en el suelo',
      'Agarra la barra con un agarre ligeramente más ancho que los hombros',
      'Baja la barra de forma controlada hasta el pecho',
      'Empuja la barra hacia arriba hasta la posición inicial',
      'Mantén los omóplatos retraídos durante todo el movimiento',
    ],
    tips: [
      'Mantén los codos en un ángulo de 45 grados',
      'No arquees excesivamente la espalda baja',
      'Controla el movimiento en ambas fases',
    ],
    muscles: ['Pectoral mayor', 'Deltoides anterior', 'Tríceps'],
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
            <h1 className="text-white mb-2">{mockExercise.name}</h1>
            <p className="text-slate-400">{mockExercise.category} • {mockExercise.difficulty}</p>
          </div>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Play className="h-4 w-4 mr-2" />
            Registrar Serie
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-orange-500" />
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">{mockExercise.description}</p>
                <div>
                  <p className="text-white mb-2">Equipamiento necesario:</p>
                  <p className="text-slate-400">{mockExercise.equipment}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  Instrucciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {mockExercise.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="bg-emerald-500/10 text-emerald-500 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                        {index + 1}
                      </span>
                      <span className="text-slate-300">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Consejos Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockExercise.tips.map((tip, index) => (
                    <li key={index} className="flex gap-2 text-slate-300">
                      <span className="text-yellow-500">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/50">
              <CardHeader>
                <CardTitle className="text-white">Músculos Trabajados</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockExercise.muscles.map((muscle, index) => (
                    <li key={index} className="flex items-center gap-2 text-white">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      {muscle}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Tu Progreso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Récord Personal</p>
                  <p className="text-white text-2xl">80 kg</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Última sesión</p>
                  <p className="text-white">4 × 12 @ 70 kg</p>
                </div>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                  Ver Historial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
