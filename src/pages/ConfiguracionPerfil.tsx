import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { ArrowLeft, Bell, Lock, Eye, Trash2, Save } from 'lucide-react';
import { Separator } from '../components/ui/separator';

export default function ConfiguracionPerfil() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    notificaciones: true,
    notificacionesEmail: false,
    perfilPublico: true,
    mostrarProgreso: true,
    mostrarEstadisticas: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    // TODO: Update settings - PUT /api/profile/settings
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
          <h1 className="text-white mb-2">Configuración</h1>
          <p className="text-slate-400">Administra tu cuenta y preferencias</p>
        </div>

        {/* Notificaciones */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Notificaciones push</Label>
                <p className="text-sm text-slate-400">Recibe alertas en tu navegador</p>
              </div>
              <Switch
                checked={config.notificaciones}
                onCheckedChange={(checked) => setConfig({ ...config, notificaciones: checked })}
              />
            </div>

            <Separator className="bg-slate-700" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Notificaciones por email</Label>
                <p className="text-sm text-slate-400">Recibe actualizaciones por correo</p>
              </div>
              <Switch
                checked={config.notificacionesEmail}
                onCheckedChange={(checked) => setConfig({ ...config, notificacionesEmail: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacidad */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Eye className="h-5 w-5" />
              Privacidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Perfil público</Label>
                <p className="text-sm text-slate-400">Permite que otros usuarios vean tu perfil</p>
              </div>
              <Switch
                checked={config.perfilPublico}
                onCheckedChange={(checked) => setConfig({ ...config, perfilPublico: checked })}
              />
            </div>

            <Separator className="bg-slate-700" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Mostrar progreso</Label>
                <p className="text-sm text-slate-400">Comparte tu progreso con seguidores</p>
              </div>
              <Switch
                checked={config.mostrarProgreso}
                onCheckedChange={(checked) => setConfig({ ...config, mostrarProgreso: checked })}
              />
            </div>

            <Separator className="bg-slate-700" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-slate-200">Mostrar estadísticas</Label>
                <p className="text-sm text-slate-400">Permite ver tus estadísticas de entrenamiento</p>
              </div>
              <Switch
                checked={config.mostrarEstadisticas}
                onCheckedChange={(checked) => setConfig({ ...config, mostrarEstadisticas: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lock className="h-5 w-5" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 justify-start"
            >
              <Lock className="h-4 w-4 mr-2" />
              Cambiar contraseña
            </Button>
          </CardContent>
        </Card>

        {/* Zona peligrosa */}
        <Card className="bg-slate-800/50 border-red-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              Zona peligrosa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-slate-400 text-sm">
              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.
            </p>
            <Button
              variant="outline"
              className="w-full border-red-900 text-red-400 hover:bg-red-950 justify-start"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar cuenta
            </Button>
          </CardContent>
        </Card>

        {/* Guardar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
