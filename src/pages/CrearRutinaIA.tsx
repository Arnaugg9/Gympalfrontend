import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';

export default function CrearRutinaIA() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({ goal: '', level: '', days: '', description: '' });

  const handleGenerate = () => {
    // TODO: Generate routine via AI - POST /api/ai/generate-routine
    console.log('Generating routine with AI:', preferences);
    navigate('/rutinas');
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div>
          <h1 className="text-white mb-2 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            Generar Rutina con IA
          </h1>
          <p className="text-slate-400">Deja que la IA cree la rutina perfecta para ti</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Preferencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Objetivo</Label>
                <Select value={preferences.goal} onValueChange={(value) => setPreferences({ ...preferences, goal: value })}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strength">Ganar fuerza</SelectItem>
                    <SelectItem value="muscle">Ganar músculo</SelectItem>
                    <SelectItem value="endurance">Resistencia</SelectItem>
                    <SelectItem value="loss">Pérdida de grasa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Nivel</Label>
                <Select value={preferences.level} onValueChange={(value) => setPreferences({ ...preferences, level: value })}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Principiante</SelectItem>
                    <SelectItem value="intermediate">Intermedio</SelectItem>
                    <SelectItem value="advanced">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Días por semana</Label>
              <Select value={preferences.days} onValueChange={(value) => setPreferences({ ...preferences, days: value })}>
                <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 días</SelectItem>
                  <SelectItem value="4">4 días</SelectItem>
                  <SelectItem value="5">5 días</SelectItem>
                  <SelectItem value="6">6 días</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Detalles adicionales (opcional)</Label>
              <Textarea
                placeholder="Ej: Tengo una lesión en la rodilla, prefiero ejercicios con mancuernas..."
                className="bg-slate-900/50 border-slate-700 text-white"
                value={preferences.description}
                onChange={(e) => setPreferences({ ...preferences, description: e.target.value })}
              />
            </div>

            <Button onClick={handleGenerate} className="w-full bg-purple-500 hover:bg-purple-600 text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              Generar Rutina
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
