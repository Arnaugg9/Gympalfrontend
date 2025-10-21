import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Check, Calendar, CreditCard } from 'lucide-react';
import { Progress } from '../components/ui/progress';

export default function VerPlanActual() {
  const navigate = useNavigate();

  // TODO: Fetch current plan - GET /api/subscription/current
  const planActual = {
    nombre: 'Plan Premium',
    precio: 9.99,
    periodo: 'mes',
    fechaInicio: '2025-01-15',
    fechaRenovacion: '2025-02-15',
    diasRestantes: 25,
    caracteristicas: [
      'Rutinas ilimitadas',
      'Dietas personalizadas',
      'Chat con IA',
      'Análisis de progreso avanzado',
      'Calendario inteligente',
      'Comunidad premium',
    ],
  };

  const diasTotales = 31;
  const progreso = ((diasTotales - planActual.diasRestantes) / diasTotales) * 100;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/planes')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div>
          <h1 className="text-white mb-2">Plan Actual</h1>
          <p className="text-slate-400">Detalles de tu suscripción</p>
        </div>

        {/* Plan Info */}
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white mb-2">{planActual.nombre}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl text-white">${planActual.precio}</span>
                  <span className="text-slate-400">/{planActual.periodo}</span>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                Activo
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Período de facturación</span>
                <span className="text-slate-400">{planActual.diasRestantes} días restantes</span>
              </div>
              <Progress value={progreso} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Fecha de inicio</p>
                <p className="text-slate-200">
                  {new Date(planActual.fechaInicio).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Próxima renovación</p>
                <p className="text-slate-200">
                  {new Date(planActual.fechaRenovacion).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Características */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Características incluidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {planActual.caracteristicas.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 rounded-full p-1">
                    <Check className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="text-slate-200">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Gestionar suscripción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 justify-start"
              onClick={() => navigate('/planes/elegir')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Cambiar plan
            </Button>
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 justify-start"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Actualizar método de pago
            </Button>
            <Button
              variant="outline"
              className="w-full border-red-900 text-red-400 hover:bg-red-950 justify-start"
            >
              Cancelar suscripción
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
