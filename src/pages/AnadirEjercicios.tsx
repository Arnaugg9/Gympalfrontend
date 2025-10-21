import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Search, Plus, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function AnadirEjercicios() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);

  // TODO: Fetch exercises from API - GET /api/exercises
  const mockExercises = {
    pecho: [
      { id: 1, name: 'Press de Banca', difficulty: 'Intermedio' },
      { id: 2, name: 'Press Inclinado', difficulty: 'Intermedio' },
      { id: 3, name: 'Aperturas con Mancuernas', difficulty: 'Principiante' },
      { id: 4, name: 'Fondos en Paralelas', difficulty: 'Intermedio' },
    ],
    espalda: [
      { id: 5, name: 'Dominadas', difficulty: 'Avanzado' },
      { id: 6, name: 'Remo con Barra', difficulty: 'Intermedio' },
      { id: 7, name: 'Peso Muerto', difficulty: 'Avanzado' },
      { id: 8, name: 'Jalón al Pecho', difficulty: 'Principiante' },
    ],
    piernas: [
      { id: 9, name: 'Sentadilla', difficulty: 'Intermedio' },
      { id: 10, name: 'Prensa de Piernas', difficulty: 'Principiante' },
      { id: 11, name: 'Zancadas', difficulty: 'Principiante' },
      { id: 12, name: 'Peso Muerto Rumano', difficulty: 'Intermedio' },
    ],
    hombros: [
      { id: 13, name: 'Press Militar', difficulty: 'Intermedio' },
      { id: 14, name: 'Elevaciones Laterales', difficulty: 'Principiante' },
      { id: 15, name: 'Pájaros', difficulty: 'Principiante' },
      { id: 16, name: 'Press Arnold', difficulty: 'Intermedio' },
    ],
  };

  const toggleExercise = (id: number) => {
    setSelectedExercises(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    // TODO: Add exercises to routine
    console.log('Selected exercises:', selectedExercises);
    navigate(-1);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
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
          <Button
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={selectedExercises.length === 0}
          >
            <Check className="h-4 w-4 mr-2" />
            Añadir ({selectedExercises.length})
          </Button>
        </div>

        <div>
          <h1 className="text-white mb-2">Biblioteca de Ejercicios</h1>
          <p className="text-slate-400">Selecciona los ejercicios para tu rutina</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar ejercicios..."
            className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Exercise Categories */}
        <Tabs defaultValue="pecho" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="pecho">Pecho</TabsTrigger>
            <TabsTrigger value="espalda">Espalda</TabsTrigger>
            <TabsTrigger value="piernas">Piernas</TabsTrigger>
            <TabsTrigger value="hombros">Hombros</TabsTrigger>
          </TabsList>

          {Object.entries(mockExercises).map(([category, exercises]) => (
            <TabsContent key={category} value={category} className="space-y-3">
              {exercises.map((exercise) => {
                const isSelected = selectedExercises.includes(exercise.id);
                return (
                  <Card
                    key={exercise.id}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500'
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => toggleExercise(exercise.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white mb-1">{exercise.name}</h3>
                          <p className="text-slate-400 text-sm">{exercise.difficulty}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                        }`}>
                          {isSelected && <Check className="h-4 w-4 text-white" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
}
