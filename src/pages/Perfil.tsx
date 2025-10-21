import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { User, Edit, Settings, Award, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Perfil() {
  // TODO: Fetch user profile from API - GET /api/user/profile
  const [mockUser, setMockUser] = useState({
    name: 'Juan Pérez',
    email: 'juan@email.com',
    avatar: null,
    memberSince: 'Enero 2025',
    currentGoal: 'Perder peso',
    stats: {
      weight: 80.2,
      height: 175,
      age: 28,
      totalWorkouts: 156,
      totalDays: 120,
      streak: 7,
    },
    achievements: [
      { id: 1, name: 'Primera semana', description: 'Completaste tu primera semana', icon: '🎯' },
      { id: 2, name: '50 entrenamientos', description: 'Alcanzaste 50 entrenamientos', icon: '💪' },
      { id: 3, name: 'Racha de 7 días', description: 'Entrenaste 7 días seguidos', icon: '🔥' },
    ],
  });

  const [isEditStatsDialogOpen, setIsEditStatsDialogOpen] = useState(false);
  const [editedStats, setEditedStats] = useState({
    weight: mockUser.stats.weight,
    height: mockUser.stats.height,
    age: mockUser.stats.age,
  });

  const calculateBMI = (weight: number, height: number) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const handleSaveStats = () => {
    // TODO: Save updated stats to API - PUT /api/user/stats
    setMockUser({
      ...mockUser,
      stats: {
        ...mockUser.stats,
        weight: editedStats.weight,
        height: editedStats.height,
        age: editedStats.age,
      },
    });
    setIsEditStatsDialogOpen(false);
  };

  const handleOpenEditStats = () => {
    setEditedStats({
      weight: mockUser.stats.weight,
      height: mockUser.stats.height,
      age: mockUser.stats.age,
    });
    setIsEditStatsDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">Perfil Personal</h1>
            <p className="text-slate-600 dark:text-slate-400">Gestiona tu información y preferencias</p>
          </div>
          <div className="flex gap-2">
            <Link to="/perfil/editar">
              <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </Link>
            <Link to="/perfil/configuracion">
              <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={mockUser.avatar || undefined} />
                <AvatarFallback className="bg-emerald-500 text-white text-2xl">
                  {mockUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-slate-900 dark:text-white text-2xl mb-1">{mockUser.name}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{mockUser.email}</p>
                <div className="flex gap-4">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Miembro desde</p>
                    <p className="text-slate-900 dark:text-white">{mockUser.memberSince}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Objetivo actual</p>
                    <p className="text-slate-900 dark:text-white">{mockUser.currentGoal}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Estadísticas Físicas
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenEditStats}
                  className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Peso</span>
                <span className="text-slate-900 dark:text-white">{mockUser.stats.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Altura</span>
                <span className="text-slate-900 dark:text-white">{mockUser.stats.height} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Edad</span>
                <span className="text-slate-900 dark:text-white">{mockUser.stats.age} años</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">IMC</span>
                <span className="text-slate-900 dark:text-white">
                  {calculateBMI(mockUser.stats.weight, mockUser.stats.height)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Actividad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total entrenamientos</span>
                <span className="text-slate-900 dark:text-white">{mockUser.stats.totalWorkouts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Días activos</span>
                <span className="text-slate-900 dark:text-white">{mockUser.stats.totalDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Racha actual</span>
                <span className="text-slate-900 dark:text-white">{mockUser.stats.streak} días</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Consistencia</span>
                <span className="text-slate-900 dark:text-white">85%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Nivel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-900 dark:text-white">Nivel 12</span>
                  <span className="text-slate-600 dark:text-slate-400">2,450 / 3,000 XP</span>
                </div>
                <Progress value={81.6} className="h-2" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                ¡550 XP más para alcanzar el nivel 13!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Logros Desbloqueados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {mockUser.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-yellow-500/20"
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h3 className="text-slate-900 dark:text-white mb-1">{achievement.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{achievement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Stats Dialog */}
      <Dialog open={isEditStatsDialogOpen} onOpenChange={setIsEditStatsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Actualizar Estadísticas Físicas</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Actualiza tus datos físicos para un seguimiento más preciso
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-foreground">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={editedStats.weight}
                onChange={(e) => setEditedStats({ ...editedStats, weight: parseFloat(e.target.value) || 0 })}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-foreground">Altura (cm)</Label>
              <Input
                id="height"
                type="number"
                value={editedStats.height}
                onChange={(e) => setEditedStats({ ...editedStats, height: parseInt(e.target.value) || 0 })}
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-foreground">Edad (años)</Label>
              <Input
                id="age"
                type="number"
                value={editedStats.age}
                onChange={(e) => setEditedStats({ ...editedStats, age: parseInt(e.target.value) || 0 })}
                className="bg-background border-border text-foreground"
              />
            </div>

            {editedStats.weight > 0 && editedStats.height > 0 && (
              <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <p className="text-sm text-muted-foreground mb-1">IMC calculado</p>
                <p className="text-2xl text-foreground">
                  {calculateBMI(editedStats.weight, editedStats.height)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditStatsDialogOpen(false)}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveStats}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
