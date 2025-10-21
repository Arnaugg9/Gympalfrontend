import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';

export default function ElegirPlan() {
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<'mensual' | 'anual'>('mensual');

  // TODO: Fetch available plans - GET /api/plans
  const planes = [
    {
      id: 'basico',
      nombre: 'Básico',
      descripcion: 'Perfecto para empezar',
      precioMensual: 0,
      precioAnual: 0,
      caracteristicas: [
        'Rutinas básicas',
        'Seguimiento de progreso',
        'Calendario simple',
        'Comunidad',
      ],
      limitaciones: [
        'Máximo 3 rutinas',
        'Sin IA',
        'Sin dietas personalizadas',
      ],
      destacado: false,
    },
    {
      id: 'premium',
      nombre: 'Premium',
      descripcion: 'Lo más popular',
      precioMensual: 9.99,
      precioAnual: 99.99,
      caracteristicas: [
        'Rutinas ilimitadas',
        'Dietas personalizadas',
        'Chat con IA',
        'Análisis avanzado',
        'Calendario inteligente',
        'Comunidad premium',
      ],
      limitaciones: [],
      destacado: true,
    },
    {
      id: 'pro',
      nombre: 'Pro',
      descripcion: 'Para profesionales',
      precioMensual: 19.99,
      precioAnual: 199.99,
      caracteristicas: [
        'Todo lo de Premium',
        'Planes de entrenamiento avanzados',
        'Asesoría personalizada',
        'Análisis biomecánico',
        'API para integraciones',
        'Soporte prioritario',
      ],
      limitaciones: [],
      destacado: false,
    },
  ];

  const handleSelectPlan = (planId: string) => {
    if (planId === 'basico') {
      // Free plan - no payment needed
      navigate('/dashboard');
    } else {
      navigate('/planes/pago', { state: { planId, periodo } });
    }
  };

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

        <div className="text-center">
          <h1 className="text-white mb-2">Elige tu Plan</h1>
          <p className="text-slate-400 mb-6">
            Selecciona el plan que mejor se adapte a tus necesidades
          </p>

          {/* Period Toggle */}
          <div className="inline-flex items-center gap-3 bg-slate-800/50 p-1 rounded-lg">
            <button
              onClick={() => setPeriodo('mensual')}
              className={`px-4 py-2 rounded-md transition-colors ${
                periodo === 'mensual'
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setPeriodo('anual')}
              className={`px-4 py-2 rounded-md transition-colors ${
                periodo === 'anual'
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Anual
              <Badge className="ml-2 bg-emerald-500/20 text-emerald-400 border-0">
                Ahorra 17%
              </Badge>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {planes.map((plan) => {
            const precio = periodo === 'mensual' ? plan.precioMensual : plan.precioAnual;
            const precioPorMes = periodo === 'anual' ? (plan.precioAnual / 12).toFixed(2) : precio;

            return (
              <Card
                key={plan.id}
                className={`${
                  plan.destacado
                    ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-500'
                    : 'bg-slate-800/50 border-slate-700'
                } relative`}
              >
                {plan.destacado && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white border-0 shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Más popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-white">{plan.nombre}</CardTitle>
                  <p className="text-slate-400 text-sm">{plan.descripcion}</p>
                  <div className="pt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl text-white">${precioPorMes}</span>
                      <span className="text-slate-400">/mes</span>
                    </div>
                    {periodo === 'anual' && precio > 0 && (
                      <p className="text-sm text-slate-500 mt-1">
                        Facturado ${precio} anualmente
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full ${
                      plan.destacado
                        ? 'bg-purple-500 hover:bg-purple-600'
                        : 'bg-slate-700 hover:bg-slate-600'
                    } text-white`}
                  >
                    {plan.precioMensual === 0 ? 'Comenzar gratis' : 'Seleccionar plan'}
                  </Button>

                  <div className="space-y-3">
                    {plan.caracteristicas.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-emerald-500/10 rounded-full p-1 mt-0.5">
                          <Check className="h-3 w-3 text-emerald-500" />
                        </div>
                        <span className="text-slate-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
