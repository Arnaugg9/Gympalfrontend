import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, CreditCard, Lock, Check } from 'lucide-react';
import { Separator } from '../components/ui/separator';

export default function ProcesoPago() {
  const navigate = useNavigate();
  const location = useLocation();
  const { planId, periodo } = location.state || { planId: 'premium', periodo: 'mensual' };

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  const [processing, setProcessing] = useState(false);

  // TODO: Fetch plan details - GET /api/plans/:id
  const planInfo = {
    nombre: 'Plan Premium',
    precio: periodo === 'mensual' ? 9.99 : 99.99,
    periodo: periodo === 'mensual' ? 'mes' : 'año',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // TODO: Process payment - POST /api/payments/subscribe
    setTimeout(() => {
      setProcessing(false);
      navigate('/planes/actual');
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/planes/elegir')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div>
          <h1 className="text-white mb-2">Proceso de Pago</h1>
          <p className="text-slate-400">Completa tu suscripción de forma segura</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CreditCard className="h-5 w-5" />
                  Información de pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-slate-200">
                      Número de tarjeta
                    </Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="bg-slate-900/50 border-slate-700 text-white"
                      value={paymentData.cardNumber}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, cardNumber: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName" className="text-slate-200">
                      Nombre en la tarjeta
                    </Label>
                    <Input
                      id="cardName"
                      type="text"
                      placeholder="Juan Pérez"
                      className="bg-slate-900/50 border-slate-700 text-white"
                      value={paymentData.cardName}
                      onChange={(e) =>
                        setPaymentData({ ...paymentData, cardName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate" className="text-slate-200">
                        Fecha de expiración
                      </Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        className="bg-slate-900/50 border-slate-700 text-white"
                        value={paymentData.expiryDate}
                        onChange={(e) =>
                          setPaymentData({ ...paymentData, expiryDate: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-slate-200">
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        className="bg-slate-900/50 border-slate-700 text-white"
                        value={paymentData.cvv}
                        onChange={(e) =>
                          setPaymentData({ ...paymentData, cvv: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-4 flex items-start gap-3">
                    <Lock className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="text-slate-200 text-sm">Pago seguro</p>
                      <p className="text-slate-400 text-xs mt-1">
                        Tu información está protegida con encriptación SSL de 256 bits
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    {processing ? (
                      'Procesando...'
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Confirmar pago de ${planInfo.precio}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{planInfo.nombre}</span>
                    <span className="text-white">${planInfo.precio}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Período</span>
                    <span className="text-slate-300">
                      {periodo === 'mensual' ? 'Mensual' : 'Anual'}
                    </span>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="flex justify-between">
                  <span className="text-white">Total</span>
                  <span className="text-white text-xl">
                    ${planInfo.precio}
                    <span className="text-sm text-slate-400">/{planInfo.periodo}</span>
                  </span>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Incluye:</p>
                  {[
                    'Rutinas ilimitadas',
                    'Dietas personalizadas',
                    'Chat con IA',
                    'Análisis avanzado',
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
