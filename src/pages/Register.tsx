import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import ThemeToggle from '../components/ThemeToggle';

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with REST API - POST /api/auth/register
    // const response = await fetch('/api/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
    // });
    console.log('Register attempt:', formData);
    
    // Mock registration - redirect to onboarding
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center p-4 relative transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg glow-emerald">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <span className="text-foreground">GymPal</span>
        </div>

        {/* Register Card */}
        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-foreground mb-2">Crear Cuenta</h1>
            <p className="text-muted-foreground">Únete a la comunidad GymPal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  className="pl-10 bg-background/50 dark:bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10 bg-background/50 dark:bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-background/50 dark:bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 bg-background/50 dark:bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input 
                type="checkbox" 
                className="mt-1 rounded border-border bg-background/50 text-emerald-500 focus:ring-emerald-500" 
                required 
              />
              <span className="text-sm text-muted-foreground">
                Acepto los{' '}
                <a href="#" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  términos y condiciones
                </a>{' '}
                y la{' '}
                <a href="#" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  política de privacidad
                </a>
              </span>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-500/50 transition-all"
            >
              Crear Cuenta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
