import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { TrendingUp, TrendingDown, Minus, Calendar, Flame, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Progreso() {
  // TODO: Fetch progress data from API - GET /api/progress
  const mockWeightData = [
    { date: 'Sem 1', weight: 82 },
    { date: 'Sem 2', weight: 81.5 },
    { date: 'Sem 3', weight: 81.2 },
    { date: 'Sem 4', weight: 80.8 },
    { date: 'Sem 5', weight: 80.5 },
    { date: 'Sem 6', weight: 80.2 },
  ];

  const mockWorkoutData = [
    { month: 'May', workouts: 12 },
    { month: 'Jun', workouts: 15 },
    { month: 'Jul', workouts: 18 },
    { month: 'Ago', workouts: 16 },
    { month: 'Sep', workouts: 20 },
    { month: 'Oct', workouts: 22 },
  ];

  const mockPersonalRecords = [
    { exercise: 'Sentadilla', weight: '120 kg', date: '15 Oct 2025', change: '+5kg' },
    { exercise: 'Press Banca', weight: '90 kg', date: '12 Oct 2025', change: '+2.5kg' },
    { exercise: 'Peso Muerto', weight: '140 kg', date: '10 Oct 2025', change: '+7.5kg' },
    { exercise: 'Press Militar', weight: '55 kg', date: '08 Oct 2025', change: '+2.5kg' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">Estadísticas y Métrica</h1>
          <p className="text-slate-600 dark:text-slate-400">Visualiza tu progreso y evolución</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="glass-card border-emerald-200 dark:border-emerald-500/30 card-gradient-emerald hover-lift shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-600 dark:text-slate-400">Peso Actual</CardDescription>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg">
                  <TrendingDown className="h-4 w-4 text-white" />
                </div>
                80.2 kg
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-emerald-500">-1.8 kg este mes</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-200 dark:border-blue-500/30 card-gradient-blue hover-lift shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-600 dark:text-slate-400">Entrenamientos</CardDescription>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                22
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-500">Este mes</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-orange-200 dark:border-orange-500/30 card-gradient-yellow hover-lift shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-600 dark:text-slate-400">Racha</CardDescription>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg">
                  <Flame className="h-4 w-4 text-white" />
                </div>
                7 días
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-500">¡Récord personal!</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-cyan-200 dark:border-cyan-500/30 card-gradient-blue hover-lift shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-600 dark:text-slate-400">Calorías Quemadas</CardDescription>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                5,240
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-cyan-500">Esta semana</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="glass-card border-emerald-200 dark:border-emerald-500/30 shadow-xl hover-lift">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg shadow-md">
                  <TrendingDown className="h-4 w-4 text-white" />
                </div>
                Evolución del Peso
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Últimas 6 semanas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mockWeightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" className="dark:stroke-slate-700" />
                  <XAxis dataKey="date" stroke="#64748b" className="dark:stroke-slate-400" />
                  <YAxis stroke="#64748b" className="dark:stroke-slate-400" domain={[79, 83]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}
                    labelStyle={{ color: '#0f172a' }}
                    className="dark:!bg-slate-800 dark:!border-slate-700"
                  />
                  <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card border-blue-200 dark:border-blue-500/30 shadow-xl hover-lift">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-md">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                Entrenamientos por Mes
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockWorkoutData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" className="dark:stroke-slate-700" />
                  <XAxis dataKey="month" stroke="#64748b" className="dark:stroke-slate-400" />
                  <YAxis stroke="#64748b" className="dark:stroke-slate-400" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}
                    labelStyle={{ color: '#0f172a' }}
                    className="dark:!bg-slate-800 dark:!border-slate-700"
                  />
                  <Bar dataKey="workouts" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Personal Records */}
        <Card className="glass-card border-yellow-200 dark:border-yellow-500/30 card-gradient-yellow shadow-xl">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-md">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Récords Personales
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Tus mejores marcas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPersonalRecords.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-4 glass-card border-yellow-100 dark:border-yellow-500/20 rounded-lg hover-lift shadow-md group">
                  <div>
                    <h3 className="text-slate-900 dark:text-white mb-1">{record.exercise}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{record.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-900 dark:text-white text-xl">{record.weight}</p>
                    <p className="text-emerald-500 text-sm flex items-center gap-1 justify-end">
                      <TrendingUp className="h-3 w-3" />
                      {record.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
