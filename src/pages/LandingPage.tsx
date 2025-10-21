import { Link } from 'react-router-dom';
import { Dumbbell, Utensils, Users, Calendar, TrendingUp, MessageSquare, Zap, Target, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import ThemeToggle from '../components/ThemeToggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg glow-emerald">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <span className="text-foreground">GymPal</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="ghost" className="text-foreground hover:text-emerald-500 transition-colors">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-500/50 transition-all">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 gradient-mesh">
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1756115484694-009466dbaa67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBmaXRuZXNzJTIwd29ya291dHxlbnwxfHx8fDE3NjEwMzAyMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Gym fitness"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card mb-6">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-foreground">Tu transformación comienza aquí</span>
              </div>
              <h1 className="text-foreground mb-6">
                Tu compañero definitivo<br />
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                  para el fitness
                </span>
              </h1>
              <p className="text-muted-foreground mb-8 max-w-lg">
                Genera rutinas personalizadas, planes de nutrición y conecta con una
                comunidad que comparte tus objetivos. Todo en un solo lugar con el poder de la IA.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-6 shadow-xl hover:shadow-emerald-500/50 transition-all hover-lift">
                    <Dumbbell className="h-5 w-5 mr-2" />
                    Comenzar Gratis
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-border hover:bg-accent px-8 py-6 hover-lift">
                    Ver Demo
                  </Button>
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <StatCard number="10K+" label="Usuarios Activos" />
                <StatCard number="50K+" label="Rutinas Creadas" />
                <StatCard number="98%" label="Satisfacción" />
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl hover-lift">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758875569352-9df9dc6537bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRpYyUyMHRyYWluaW5nJTIwc3Ryb25nfGVufDF8fHx8MTc2MTA2NDMwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Athletic training"
                  className="w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              </div>
              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Objetivo Semanal</p>
                    <p className="text-foreground">5/5 días completos</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 glass-card p-4 rounded-xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-500 p-2 rounded-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Racha Actual</p>
                    <p className="text-foreground">28 días 🔥</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        <div className="text-center mb-16">
          <h2 className="text-foreground mb-4">
            Todo lo que necesitas para alcanzar tus metas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Herramientas profesionales y tecnología de IA para transformar tu fitness
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={Dumbbell}
            title="Rutinas Personalizadas"
            description="Crea y gestiona rutinas de ejercicios adaptadas a tus objetivos y nivel con IA."
            gradient="emerald"
          />
          <FeatureCard
            icon={Utensils}
            title="Planes de Nutrición"
            description="Diseña dietas balanceadas con seguimiento de macros y calorías automático."
            gradient="pink"
          />
          <FeatureCard
            icon={Users}
            title="Red Social"
            description="Conecta con otros usuarios, comparte tu progreso y motívate mutuamente."
            gradient="blue"
          />
          <FeatureCard
            icon={Calendar}
            title="Calendario Inteligente"
            description="Planifica tus entrenamientos y recibe recordatorios automáticos."
            gradient="purple"
          />
          <FeatureCard
            icon={TrendingUp}
            title="Seguimiento de Progreso"
            description="Visualiza tu evolución con gráficas y estadísticas detalladas en tiempo real."
            gradient="yellow"
          />
          <FeatureCard
            icon={MessageSquare}
            title="Asistente IA"
            description="Obtén recomendaciones personalizadas con nuestro asistente inteligente 24/7."
            gradient="emerald"
          />
        </div>
      </div>

      {/* Nutrition Section */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/20 dark:to-emerald-600/10 py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl hover-lift">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1670164745494-30747c120652?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwbnV0cml0aW9uJTIwZm9vZHxlbnwxfHx8fDE3NjA5NDkxMjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Healthy nutrition"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card mb-6">
                <Utensils className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-foreground">Nutrición Inteligente</span>
              </div>
              <h2 className="text-foreground mb-6">
                Planes de nutrición<br />
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                  diseñados para ti
                </span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Nuestra IA crea planes de alimentación personalizados basados en tus objetivos,
                preferencias alimenticias y estilo de vida. Seguimiento automático de macros
                y ajustes inteligentes según tu progreso.
              </p>
              
              <div className="space-y-4">
                <BenefitItem text="Cálculo automático de macros y calorías" />
                <BenefitItem text="Recetas personalizadas y planes de comidas" />
                <BenefitItem text="Ajustes dinámicos según tu progreso" />
                <BenefitItem text="Compatible con cualquier dieta (vegana, keto, etc.)" />
              </div>
              
              <Link to="/register" className="inline-block mt-8">
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-500/50 transition-all hover-lift">
                  Crear Plan de Nutrición
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative">
          <h2 className="text-foreground mb-6">
            ¿Listo para transformar tu fitness?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya están alcanzando sus objetivos con GymPal.
            Comienza gratis hoy y descubre todo lo que puedes lograr.
          </p>
          <Link to="/register">
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-6 shadow-xl hover:shadow-emerald-500/50 transition-all hover-lift">
              <Dumbbell className="h-5 w-5 mr-2" />
              Comenzar Gratis Ahora
            </Button>
          </Link>
          
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span>Acceso completo gratuito</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span>Cancela cuando quieras</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="text-foreground">GymPal</span>
            </div>
            <p className="text-center text-muted-foreground text-sm">
              © 2025 GymPal. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-foreground mb-1">{number}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  gradient = 'emerald'
}: { 
  icon: any; 
  title: string; 
  description: string;
  gradient?: 'emerald' | 'pink' | 'blue' | 'purple' | 'yellow';
}) {
  const gradientClasses = {
    emerald: 'card-gradient-emerald',
    pink: 'card-gradient-pink',
    blue: 'card-gradient-blue',
    purple: 'card-gradient-purple',
    yellow: 'card-gradient-yellow',
  };

  const glowClasses = {
    emerald: 'glow-emerald',
    pink: 'glow-pink',
    blue: 'glow-blue',
    purple: 'glow-purple',
    yellow: 'glow-emerald',
  };

  const iconColors = {
    emerald: 'text-emerald-500',
    pink: 'text-pink-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    yellow: 'text-yellow-500',
  };

  return (
    <div className={`${gradientClasses[gradient]} glass-card rounded-xl p-6 hover-lift transition-all duration-300 group`}>
      <div className={`bg-background/50 dark:bg-background/80 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:${glowClasses[gradient]} transition-all`}>
        <Icon className={`h-6 w-6 ${iconColors[gradient]}`} />
      </div>
      <h3 className="text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-1 rounded-full mt-0.5">
        <div className="bg-emerald-500 w-2 h-2 rounded-full"></div>
      </div>
      <p className="text-foreground">{text}</p>
    </div>
  );
}
