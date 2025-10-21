import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Sparkles, Calendar, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';

export default function OrganizarCalendarioIA() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    diasSemana: '5',
    duracion: '60',
    preferencias: '',
    objetivos: '',
  });
  const [diasDisponibles, setDiasDisponibles] = useState({
    lunes: true,
    martes: true,
    miercoles: true,
    jueves: true,
    viernes: true,
    sabado: false,
    domingo: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Send to AI API - POST /api/ai/organize-calendar
    setTimeout(() => {
      setLoading(false);
      navigate('/calendario');
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/chat-ia')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-white">IA: Organizar Calendario</h1>
              <p className="text-slate-400">Planifica tus entrenamientos automáticamente</p>
            </div>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="diasSemana" className="text-slate-200">Días de entrenamiento por semana</Label>
                <Select
                  value={formData.diasSemana}
                  onValueChange={(value) => setFormData({ ...formData, diasSemana: value })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="3">3 días</SelectItem>
                    <SelectItem value="4">4 días</SelectItem>
                    <SelectItem value="5">5 días</SelectItem>
                    <SelectItem value="6">6 días</SelectItem>
                    <SelectItem value="7">7 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracion" className="text-slate-200">Duración por sesión (minutos)</Label>
                <Select
                  value={formData.duracion}
                  onValueChange={(value) => setFormData({ ...formData, duracion: value })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                    <SelectItem value="120">120 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-slate-200">Días disponibles</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(diasDisponibles).map(([dia, checked]) => (
                    <div key={dia} className="flex items-center space-x-2">
                      <Checkbox
                        id={dia}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          setDiasDisponibles({ ...diasDisponibles, [dia]: checked as boolean })
                        }
                        className="border-slate-600"
                      />
                      <label
                        htmlFor={dia}
                        className="text-slate-300 capitalize cursor-pointer"
                      >
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objetivos" className="text-slate-200">Objetivos de entrenamiento</Label>
                <Textarea
                  id="objetivos"
                  placeholder="Ej: Aumentar fuerza, mejorar cardio, perder peso..."
                  className="bg-slate-900/50 border-slate-700 text-white min-h-[100px]"
                  value={formData.objetivos}
                  onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferencias" className="text-slate-200">Preferencias y restricciones</Label>
                <Textarea
                  id="preferencias"
                  placeholder="Ej: Prefiero entrenar por la mañana, no puedo los fines de semana..."
                  className="bg-slate-900/50 border-slate-700 text-white min-h-[100px]"
                  value={formData.preferencias}
                  onChange={(e) => setFormData({ ...formData, preferencias: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-500 hover:bg-purple-600 text-white flex-1"
                >
                  {loading ? (
                    <>
                      <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                      Organizando calendario...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Organizar con IA
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
