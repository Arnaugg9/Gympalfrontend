import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Calendar, Dumbbell } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function VerDias() {
  const navigate = useNavigate();

  // TODO: Fetch scheduled workouts - GET /api/calendar/scheduled
  const mockScheduledDays = [
    { date: '2025-10-21', day: 'Lunes', routine: 'Push - Pecho y Hombros', completed: false },
    { date: '2025-10-22', day: 'Martes', routine: 'Pull - Espalda y Bíceps', completed: false },
    { date: '2025-10-23', day: 'Miércoles', routine: 'Legs - Piernas', completed: false },
    { date: '2025-10-25', day: 'Viernes', routine: 'Push - Pecho y Hombros', completed: false },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div>
          <h1 className="text-white mb-2">Días con Entrenamientos Planificados</h1>
          <p className="text-slate-400">Tus entrenamientos de esta semana</p>
        </div>

        <div className="space-y-3">
          {mockScheduledDays.map((day) => (
            <Link key={day.date} to={`/calendario/dia/${day.date}`}>
              <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-white mb-1">{day.day}</h3>
                        <p className="text-slate-400 text-sm flex items-center gap-2">
                          <Dumbbell className="h-4 w-4" />
                          {day.routine}
                        </p>
                      </div>
                    </div>
                    <div className="text-slate-400 text-sm">{day.date}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
