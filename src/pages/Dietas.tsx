import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Utensils, Plus, ChevronDown, Trash2 } from 'lucide-react';
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

export default function Dietas() {
  const [visibleDiets, setVisibleDiets] = useState(6);
  const [dietToDelete, setDietToDelete] = useState<number | null>(null);
  
  // TODO: Fetch diets from API - GET /api/diets
  const mockDiets = [
    { id: 1, name: 'Dieta Definición', calories: 2000, meals: 5, type: 'Pérdida de grasa' },
    { id: 2, name: 'Dieta Volumen', calories: 3000, meals: 6, type: 'Ganancia muscular' },
    { id: 3, name: 'Dieta Mantenimiento', calories: 2500, meals: 4, type: 'Mantenimiento' },
    { id: 4, name: 'Dieta Keto', calories: 1800, meals: 3, type: 'Cetogénica' },
    { id: 5, name: 'Dieta Vegetariana', calories: 2200, meals: 5, type: 'Vegetariana' },
    { id: 6, name: 'Dieta Mediterránea', calories: 2400, meals: 4, type: 'Mantenimiento' },
    { id: 7, name: 'Dieta Paleo', calories: 2100, meals: 4, type: 'Pérdida de grasa' },
    { id: 8, name: 'Dieta Alta en Proteína', calories: 2800, meals: 6, type: 'Ganancia muscular' },
    { id: 9, name: 'Dieta Vegana', calories: 2300, meals: 5, type: 'Mantenimiento' },
    { id: 10, name: 'Dieta Flexible (IIFYM)', calories: 2600, meals: 5, type: 'Mantenimiento' },
    { id: 11, name: 'Dieta Baja en Carbohidratos', calories: 1900, meals: 4, type: 'Pérdida de grasa' },
    { id: 12, name: 'Dieta para Deportistas', calories: 3200, meals: 6, type: 'Ganancia muscular' },
    { id: 13, name: 'Dieta Ayuno Intermitente', calories: 2000, meals: 2, type: 'Pérdida de grasa' },
    { id: 14, name: 'Dieta Rica en Fibra', calories: 2300, meals: 5, type: 'Mantenimiento' },
  ];

  const handleShowMore = () => {
    setVisibleDiets(prev => prev + 6);
  };

  const handleDeleteDiet = () => {
    if (dietToDelete !== null) {
      // TODO: Delete diet from API - DELETE /api/diets/:id
      console.log('Deleting diet with id:', dietToDelete);
      setDietToDelete(null);
    }
  };

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
        <div className="grid md:grid-cols-2 gap-4">
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
            {mockDiets.slice(0, visibleDiets).map((diet) => (
              <Card key={diet.id} className="glass-card border-emerald-200 dark:border-emerald-500/30 card-gradient-emerald hover-lift shadow-lg group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                
                {/* Delete Button - Top Right */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDietToDelete(diet.id)}
                  className="absolute top-3 right-3 z-10 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

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

          {/* Show More Button */}
          {visibleDiets < mockDiets.length && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleShowMore}
                variant="outline"
                className="border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover-lift"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Mostrar más ({mockDiets.length - visibleDiets} dietas restantes)
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={dietToDelete !== null} onOpenChange={(open) => !open && setDietToDelete(null)}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">¿Eliminar dieta?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Esta acción no se puede deshacer. La dieta será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDiet}
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
