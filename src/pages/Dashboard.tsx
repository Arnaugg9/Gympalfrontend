import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dumbbell, Utensils, Users, Calendar, TrendingUp, MessageSquare, Target, Activity, Flame } from 'lucide-react';
import { Progress } from '../components/ui/progress';

export default function Dashboard() {
  // TODO: Fetch user data from API - GET /api/user/dashboard
  const mockUserData = {
    name: 'Juan Pérez',
    streak: 7,
    weeklyGoal: 4,
    completedWorkouts: 3,
    caloriesBurned: 1250,
    nextWorkout: 'Pecho y Tríceps',
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">¡Hola, {mockUserData.name}! 👋</h1>
          <p className="text-slate-600 dark:text-slate-400">Aquí está tu resumen de hoy</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="glass-card border-orange-200 dark:border-orange-500/30 card-gradient-yellow hover-lift shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-600 dark:text-slate-400">Racha actual</CardDescription>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                {mockUserData.streak} días
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">¡Sigue así!</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-200 dark:border-blue-500/30 card-gradient-blue hover-lift shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-600 dark:text-slate-400">Objetivo semanal</CardDescription>
              <CardTitle className="text-slate-900 dark:text-white">
                {mockUserData.completedWorkouts}/{mockUserData.weeklyGoal} entrenamientos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(mockUserData.completedWorkouts / mockUserData.weeklyGoal) * 100} className="h-2" />
            </CardContent>
          </Card>

          <Card className="glass-card border-emerald-200 dark:border-emerald-500/30 card-gradient-emerald hover-lift shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-600 dark:text-slate-400">Calorías quemadas</CardDescription>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                {mockUserData.caloriesBurned} kcal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">Esta semana</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-slate-900 dark:text-white mb-4">Acceso Rápido</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <QuickActionCard
              icon={Dumbbell}
              title="Rutinas"
              description="Gestión de rutinas"
              to="/rutinas"
              color="orange"
            />
            <QuickActionCard
              icon={Utensils}
              title="Dietas"
              description="Gestión de dietas"
              to="/dietas"
              color="green"
            />
            <QuickActionCard
              icon={Users}
              title="Social"
              description="Red social interna"
              to="/social"
              color="pink"
            />
            <QuickActionCard
              icon={Calendar}
              title="Calendario"
              description="Planificación de entrenos"
              to="/calendario"
              color="blue"
            />
            <QuickActionCard
              icon={TrendingUp}
              title="Progreso"
              description="Estadísticas y métrica"
              to="/progreso"
              color="cyan"
            />
            <QuickActionCard
              icon={MessageSquare}
              title="Chat IA"
              description="Asistente inteligente"
              to="/chat-ia"
              color="purple"
            />
          </div>
        </div>

        {/* Next Workout */}
        <Card className="glass-card border-emerald-200 dark:border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 shadow-xl hover-lift relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 dark:from-emerald-500/10 dark:to-cyan-500/10"></div>
          <CardHeader className="relative">
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg shadow-lg">
                <Target className="h-6 w-6 text-white" />
              </div>
              Próximo Entrenamiento
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-slate-900 dark:text-white mb-4">{mockUserData.nextWorkout}</p>
            <div className="flex gap-3">
              <Link to="/rutinas/ver" className="inline-block">
                <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-xl">
                  Ver Rutina
                </button>
              </Link>
              <Link to="/calendario" className="inline-block">
                <button className="bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-5 py-2.5 rounded-lg transition-all border border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg">
                  Ver Calendario
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

interface QuickActionCardProps {
  icon: any;
  title: string;
  description: string;
  to: string;
  color: string;
}

function QuickActionCard({ icon: Icon, title, description, to, color }: QuickActionCardProps) {
  const colorClasses = {
    orange: {
      bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
      border: 'border-orange-200 dark:border-orange-500/30',
      gradient: 'card-gradient-yellow'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-400 to-emerald-600',
      border: 'border-green-200 dark:border-green-500/30',
      gradient: 'card-gradient-emerald'
    },
    pink: {
      bg: 'bg-gradient-to-br from-pink-400 to-rose-600',
      border: 'border-pink-200 dark:border-pink-500/30',
      gradient: 'card-gradient-pink'
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
      border: 'border-blue-200 dark:border-blue-500/30',
      gradient: 'card-gradient-blue'
    },
    cyan: {
      bg: 'bg-gradient-to-br from-cyan-400 to-teal-600',
      border: 'border-cyan-200 dark:border-cyan-500/30',
      gradient: 'card-gradient-blue'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
      border: 'border-purple-200 dark:border-purple-500/30',
      gradient: 'card-gradient-purple'
    },
  };

  const colorConfig = colorClasses[color as keyof typeof colorClasses];

  return (
    <Link to={to}>
      <Card className={`glass-card ${colorConfig.border} ${colorConfig.gradient} hover-lift shadow-lg cursor-pointer overflow-hidden group`}>
        <CardContent className="pt-6 relative">
          <div className={`w-14 h-14 rounded-xl ${colorConfig.bg} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-slate-900 dark:text-white mb-1">{title}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
