import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Target, Activity, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    fitnessLevel: '',
    goal: '',
    daysPerWeek: '',
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    // TODO: Integrate with REST API - POST /api/user/onboarding
    // const response = await fetch('/api/user/onboarding', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });
    console.log('Onboarding data:', formData);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Dumbbell className="h-10 w-10 text-emerald-500" />
          <span className="text-white text-2xl">GymPal</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-sm">Paso {step} de 3</span>
            <span className="text-slate-400 text-sm">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Onboarding Card */}
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Target className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-white mb-2">Información Personal</h2>
                <p className="text-slate-400">Cuéntanos un poco sobre ti</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-white">Edad</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-white">Género</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-white">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-white">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Activity className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-white mb-2">Nivel de Fitness</h2>
                <p className="text-slate-400">¿Cuál es tu experiencia actual?</p>
              </div>

              <div className="space-y-3">
                {[
                  { value: 'beginner', label: 'Principiante', desc: 'Poca o ninguna experiencia' },
                  { value: 'intermediate', label: 'Intermedio', desc: 'Entreno regularmente hace algunos meses' },
                  { value: 'advanced', label: 'Avanzado', desc: 'Entreno consistentemente hace más de un año' },
                  { value: 'expert', label: 'Experto', desc: 'Atleta o entrenador profesional' },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setFormData({ ...formData, fitnessLevel: level.value })}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      formData.fitnessLevel === level.value
                        ? 'bg-emerald-500/20 border-emerald-500 text-white'
                        : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-white mb-1">{level.label}</div>
                    <div className="text-sm text-slate-400">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Calendar className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-white mb-2">Objetivos y Frecuencia</h2>
                <p className="text-slate-400">¿Qué quieres lograr?</p>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Objetivo Principal</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'lose', label: 'Perder peso' },
                    { value: 'gain', label: 'Ganar músculo' },
                    { value: 'maintain', label: 'Mantener forma' },
                    { value: 'strength', label: 'Ganar fuerza' },
                  ].map((goal) => (
                    <button
                      key={goal.value}
                      onClick={() => setFormData({ ...formData, goal: goal.value })}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.goal === goal.value
                          ? 'bg-emerald-500/20 border-emerald-500 text-white'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {goal.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Días de entrenamiento por semana</Label>
                <div className="grid grid-cols-4 gap-3">
                  {[3, 4, 5, 6].map((days) => (
                    <button
                      key={days}
                      onClick={() => setFormData({ ...formData, daysPerWeek: String(days) })}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.daysPerWeek === String(days)
                          ? 'bg-emerald-500/20 border-emerald-500 text-white'
                          : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {days}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className="text-slate-400 hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Atrás
            </Button>

            <Button
              onClick={handleNext}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {step === 3 ? 'Finalizar' : 'Siguiente'}
              {step < 3 && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
