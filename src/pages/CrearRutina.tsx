import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function CrearRutina() {
  const navigate = useNavigate();
  const [routineName, setRoutineName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);

  const handleSubmit = () => {
    // TODO: Create routine via API - POST /api/routines
    console.log('Creating routine:', { name: routineName, exercises: selectedExercises });
    navigate('/rutinas');
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

        <div>
          <h1 className="text-white mb-2">Crear Nueva Rutina</h1>
          <p className="text-slate-400">Configura tu rutina personalizada</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nombre de la Rutina</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Push Pull Legs"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Frecuencia</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3x por semana</SelectItem>
                        <SelectItem value="4">4x por semana</SelectItem>
                        <SelectItem value="5">5x por semana</SelectItem>
                        <SelectItem value="6">6x por semana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Nivel</Label>
                    <Select>
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Principiante</SelectItem>
                        <SelectItem value="intermediate">Intermedio</SelectItem>
                        <SelectItem value="advanced">Avanzado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Ejercicios Seleccionados
                  <Button
                    onClick={() => navigate('/rutinas/anadir-ejercicios')}
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Ejercicios
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedExercises.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No hay ejercicios añadidos. Haz clic en "Añadir Ejercicios" para comenzar.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedExercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-white">{exercise.name}</span>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/50 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Ejercicios totales</p>
                  <p className="text-white text-2xl">{selectedExercises.length}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Duración estimada</p>
                  <p className="text-white text-2xl">{selectedExercises.length * 8} min</p>
                </div>
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  disabled={!routineName || selectedExercises.length === 0}
                >
                  Guardar Rutina
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
