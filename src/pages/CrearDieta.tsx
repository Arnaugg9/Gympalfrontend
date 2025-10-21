import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function CrearDieta() {
  const navigate = useNavigate();
  const [dietData, setDietData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    meals: '4',
    goal: '',
  });

  const handleSubmit = () => {
    // TODO: Create diet via API - POST /api/diets
    console.log('Creating diet:', dietData);
    navigate('/dietas');
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
          <h1 className="text-white mb-2">Crear Nuevo Plan de Nutrición</h1>
          <p className="text-slate-400">Configura tu plan de alimentación personalizado</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nombre del Plan</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Dieta Definición"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={dietData.name}
                    onChange={(e) => setDietData({ ...dietData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Objetivo</Label>
                    <Select
                      value={dietData.goal}
                      onValueChange={(value) => setDietData({ ...dietData, goal: value })}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loss">Pérdida de grasa</SelectItem>
                        <SelectItem value="gain">Ganancia muscular</SelectItem>
                        <SelectItem value="maintain">Mantenimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Comidas al día</Label>
                    <Select
                      value={dietData.meals}
                      onValueChange={(value) => setDietData({ ...dietData, meals: value })}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 comidas</SelectItem>
                        <SelectItem value="4">4 comidas</SelectItem>
                        <SelectItem value="5">5 comidas</SelectItem>
                        <SelectItem value="6">6 comidas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Objetivos Nutricionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="calories" className="text-white">Calorías Diarias (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="2000"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={dietData.calories}
                    onChange={(e) => setDietData({ ...dietData, calories: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="protein" className="text-white">Proteínas (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      placeholder="150"
                      className="bg-slate-900/50 border-slate-700 text-white"
                      value={dietData.protein}
                      onChange={(e) => setDietData({ ...dietData, protein: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carbs" className="text-white">Carbohidratos (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      placeholder="200"
                      className="bg-slate-900/50 border-slate-700 text-white"
                      value={dietData.carbs}
                      onChange={(e) => setDietData({ ...dietData, carbs: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fat" className="text-white">Grasas (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      placeholder="60"
                      className="bg-slate-900/50 border-slate-700 text-white"
                      value={dietData.fat}
                      onChange={(e) => setDietData({ ...dietData, fat: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-slate-400 text-sm">Calorías totales</p>
                  <p className="text-white text-2xl">{dietData.calories || 0} kcal</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Proteínas</span>
                    <span className="text-white">{dietData.protein || 0}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Carbohidratos</span>
                    <span className="text-white">{dietData.carbs || 0}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-sm">Grasas</span>
                    <span className="text-white">{dietData.fat || 0}g</span>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  disabled={!dietData.name || !dietData.calories}
                >
                  Crear Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
