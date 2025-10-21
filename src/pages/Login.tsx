import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with REST API - POST /api/auth/login
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });
    console.log('Login attempt:', formData);
    
    // Mock login - redirect to dashboard
    navigate('/dashboard');
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

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-foreground mb-2">Iniciar Sesión</h1>
            <p className="text-muted-foreground">Bienvenido de nuevo a GymPal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded border-border bg-background/50 text-emerald-500 focus:ring-emerald-500" 
                />
                <span className="text-sm text-muted-foreground">Recordarme</span>
              </label>
              <a href="#" className="text-sm text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-500/50 transition-all"
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Regístrate
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
