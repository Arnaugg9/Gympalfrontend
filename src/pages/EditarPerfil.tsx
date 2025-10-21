import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ArrowLeft, Camera, Save } from 'lucide-react';

export default function EditarPerfil() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: 'Juan Pérez',
    usuario: '@juanperez',
    email: 'juan@email.com',
    bio: 'Entusiasta del fitness y la vida saludable 💪',
    altura: '175',
    peso: '75',
    edad: '28',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // TODO: Update profile - PUT /api/profile
    setTimeout(() => {
      setSaving(false);
      navigate('/perfil');
    }, 1000);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/perfil')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div>
          <h1 className="text-white mb-2">Editar Perfil</h1>
          <p className="text-slate-400">Actualiza tu información personal</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-emerald-500 text-white text-2xl">
                    JP
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Cambiar foto
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="text-slate-200">Nombre completo</Label>
                  <Input
                    id="nombre"
                    type="text"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usuario" className="text-slate-200">Nombre de usuario</Label>
                  <Input
                    id="usuario"
                    type="text"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={formData.usuario}
                    onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edad" className="text-slate-200">Edad</Label>
                  <Input
                    id="edad"
                    type="number"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={formData.edad}
                    onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altura" className="text-slate-200">Altura (cm)</Label>
                  <Input
                    id="altura"
                    type="number"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={formData.altura}
                    onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peso" className="text-slate-200">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    className="bg-slate-900/50 border-slate-700 text-white"
                    value={formData.peso}
                    onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-200">Biografía</Label>
                <Textarea
                  id="bio"
                  placeholder="Cuéntanos sobre ti..."
                  className="bg-slate-900/50 border-slate-700 text-white min-h-[100px]"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/perfil')}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
