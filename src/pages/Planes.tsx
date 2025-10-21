import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CreditCard, Check, Star, Crown, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function Planes() {
  // TODO: Fetch subscription plans from API - GET /api/plans
  const mockPlans = [
    {
      id: 'free',
      name: 'Gratis',
      price: 0,
      period: 'mes',
      icon: Star,
      color: 'slate',
      features: [
        'Rutinas básicas',
        'Seguimiento de progreso',
        'Acceso a comunidad',
        'Calendario básico',
      ],
      limitations: [
        'Máximo 3 rutinas',
        'Sin asistente IA',
        'Soporte por email',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      period: 'mes',
      icon: Zap,
      color: 'emerald',
      popular: true,
      features: [
        'Rutinas ilimitadas',
        'Planes de nutrición personalizados',
        'Asistente IA completo',
        'Análisis avanzado de progreso',
        'Sincronización con dispositivos',
        'Soporte prioritario',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      period: 'mes',
      icon: Crown,
      color: 'yellow',
      features: [
        'Todo lo de Pro',
        'Entrenador personal virtual',
        'Planes 100% personalizados',
        'Videollamadas de consultoría',
        'Recetas personalizadas',
        'Acceso anticipado a nuevas funciones',
        'Soporte VIP 24/7',
      ],
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-slate-900 dark:text-white mb-2">Suscripciones</h1>
          <p className="text-slate-600 dark:text-slate-400">Elige el plan perfecto para tus objetivos</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {mockPlans.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            
            return (
              <Card
                key={plan.id}
                className={`relative hover-lift ${
                  isPopular
                    ? 'glass-card border-emerald-300 dark:border-emerald-500/50 bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 shadow-2xl scale-105'
                    : plan.color === 'yellow'
                    ? 'glass-card border-yellow-200 dark:border-yellow-500/30 card-gradient-yellow shadow-lg'
                    : 'glass-card border-slate-200 dark:border-slate-700 shadow-lg'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg px-4 py-1">
                      ⭐ Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg ${
                    plan.color === 'emerald' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' :
                    plan.color === 'yellow' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                    'bg-gradient-to-br from-slate-400 to-slate-600'
                  }`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-slate-900 dark:text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    <span className="text-slate-900 dark:text-white text-3xl">${plan.price}</span>
                    {plan.price > 0 && <span className="text-slate-600 dark:text-slate-400">/{plan.period}</span>}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations?.map((limitation, index) => (
                      <li key={index} className="flex items-start gap-2 text-slate-500 dark:text-slate-500">
                        <Check className="h-5 w-5 text-slate-400 dark:text-slate-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={plan.price > 0 ? '/planes/pago' : '/planes/actual'}>
                    <Button
                      className={`w-full ${
                        isPopular
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          : 'bg-slate-600 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white'
                      }`}
                    >
                      {plan.price > 0 ? 'Suscribirse' : 'Plan Actual'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-slate-900 dark:text-white mb-2">¿Puedo cambiar de plan en cualquier momento?</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Sí, puedes cambiar tu plan en cualquier momento. El cambio se reflejará en tu próximo ciclo de facturación.
              </p>
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white mb-2">¿Hay garantía de devolución?</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Ofrecemos una garantía de devolución de 30 días si no estás satisfecho con tu suscripción.
              </p>
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white mb-2">¿Qué métodos de pago aceptan?</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Aceptamos tarjetas de crédito/débito, PayPal y transferencias bancarias.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
