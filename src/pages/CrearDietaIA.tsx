import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Sparkles, Utensils, ArrowLeft } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function CrearDietaIA() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    objetivo: '',
    calorias: '',
    preferencias: '',
    restricciones: '',
    comidas: '3',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Send to AI API - POST /api/ai/create-diet
    setTimeout(() => {
      setLoading(false);
      navigate('/dietas/ver');
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
              <h1 className="text-white">IA: Crear Dieta</h1>
              <p className="text-slate-400">Genera una dieta personalizada con inteligencia artificial</p>
            </div>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="objetivo" className="text-slate-200">Objetivo</Label>
                <Select
                  value={formData.objetivo}
                  onValueChange={(value) => setFormData({ ...formData, objetivo: value })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue placeholder="Selecciona tu objetivo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="perder-peso">Perder peso</SelectItem>
                    <SelectItem value="ganar-musculo">Ganar músculo</SelectItem>
                    <SelectItem value="mantener">Mantener peso</SelectItem>
                    <SelectItem value="definir">Definir</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calorias" className="text-slate-200">Calorías diarias objetivo</Label>
                <Input
                  id="calorias"
                  type="number"
                  placeholder="Ej: 2000"
                  className="bg-slate-900/50 border-slate-700 text-white"
                  value={formData.calorias}
                  onChange={(e) => setFormData({ ...formData, calorias: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comidas" className="text-slate-200">Número de comidas al día</Label>
                <Select
                  value={formData.comidas}
                  onValueChange={(value) => setFormData({ ...formData, comidas: value })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="3">3 comidas</SelectItem>
                    <SelectItem value="4">4 comidas</SelectItem>
                    <SelectItem value="5">5 comidas</SelectItem>
                    <SelectItem value="6">6 comidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferencias" className="text-slate-200">Preferencias alimentarias</Label>
                <Textarea
                  id="preferencias"
                  placeholder="Ej: Me gustan las proteínas magras, verduras al vapor..."
                  className="bg-slate-900/50 border-slate-700 text-white min-h-[100px]"
                  value={formData.preferencias}
                  onChange={(e) => setFormData({ ...formData, preferencias: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restricciones" className="text-slate-200">Restricciones o alergias</Label>
                <Textarea
                  id="restricciones"
                  placeholder="Ej: Intolerante a la lactosa, alérgico a los frutos secos..."
                  className="bg-slate-900/50 border-slate-700 text-white min-h-[100px]"
                  value={formData.restricciones}
                  onChange={(e) => setFormData({ ...formData, restricciones: e.target.value })}
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
                      Generando dieta...
                    </>
                  ) : (
                    <>
                      <Utensils className="h-4 w-4 mr-2" />
                      Generar Dieta con IA
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
