import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dumbbell, Plus, Eye, List } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Rutinas() {
  // TODO: Fetch routines from API - GET /api/routines
  const mockRoutines = [
    { id: 1, name: 'Fullbody Principiante', exercises: 8, frequency: '3x semana' },
    { id: 2, name: 'Push Pull Legs', exercises: 12, frequency: '6x semana' },
    { id: 3, name: 'Upper Lower Split', exercises: 10, frequency: '4x semana' },
  ];

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
        <div className="grid md:grid-cols-3 gap-4">
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

          <Link to="/rutinas/ver">
            <Card className="glass-card border-orange-200 dark:border-orange-500/30 card-gradient-yellow hover-lift shadow-lg cursor-pointer group">
              <CardContent className="pt-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Eye className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-slate-900 dark:text-white mb-1">Ver Rutinas</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Ver comida de dietas (popup)</p>
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
            {mockRoutines.map((routine) => (
              <Card key={routine.id} className="glass-card border-orange-200 dark:border-orange-500/30 card-gradient-yellow hover-lift shadow-lg group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
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
        </div>
      </div>
    </AppLayout>
  );
}
