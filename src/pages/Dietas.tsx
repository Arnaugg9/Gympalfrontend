import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Utensils, Plus, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Dietas() {
  // TODO: Fetch diets from API - GET /api/diets
  const mockDiets = [
    { id: 1, name: 'Dieta Definición', calories: 2000, meals: 5, type: 'Pérdida de grasa' },
    { id: 2, name: 'Dieta Volumen', calories: 3000, meals: 6, type: 'Ganancia muscular' },
    { id: 3, name: 'Dieta Mantenimiento', calories: 2500, meals: 4, type: 'Mantenimiento' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">Gestión de Dietas</h1>
            <p className="text-slate-600 dark:text-slate-400">Planifica y administra tus planes de nutrición</p>
          </div>
          <Link to="/dietas/crear">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Dieta
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/dietas/ver">
            <Card className="glass-card border-emerald-200 dark:border-emerald-500/30 card-gradient-emerald hover-lift shadow-lg cursor-pointer group">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-slate-900 dark:text-white mb-1">Ver Dietas</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Ver comida de dietas (popup)</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dietas/crear">
            <Card className="glass-card border-emerald-200 dark:border-emerald-500/30 card-gradient-emerald hover-lift shadow-lg cursor-pointer group">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-teal-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-slate-900 dark:text-white mb-1">Crear Dieta</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Lista de ejercicios (popup)</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/chat-ia/crear-dieta">
            <Card className="glass-card border-purple-200 dark:border-purple-500/30 card-gradient-purple hover-lift shadow-lg cursor-pointer group">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Utensils className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-slate-900 dark:text-white mb-1">IA: Crear Dieta</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Generación de dieta por IA</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Diets List */}
        <div>
          <h2 className="text-slate-900 dark:text-white mb-4">Mis Planes de Nutrición</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockDiets.map((diet) => (
              <Card key={diet.id} className="glass-card border-emerald-200 dark:border-emerald-500/30 card-gradient-emerald hover-lift shadow-lg group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <CardHeader className="relative">
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg shadow-md">
                      <Utensils className="h-4 w-4 text-white" />
                    </div>
                    {diet.name}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {diet.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 relative">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Calorías/día</span>
                    <span className="text-slate-900 dark:text-white">{diet.calories} kcal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Comidas</span>
                    <span className="text-slate-900 dark:text-white">{diet.meals} al día</span>
                  </div>
                  <Link to={`/dietas/ver`} className="block">
                    <Button variant="outline" className="w-full border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                      Ver Detalles
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
