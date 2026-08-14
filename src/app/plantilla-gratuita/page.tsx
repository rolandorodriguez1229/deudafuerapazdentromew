'use client';

import { useState } from 'react';
import Link from 'next/link';
import Countdown from '@/components/Countdown';
import { CheckCircle, Download, Clock, Shield, Calculator, ArrowRight } from 'lucide-react';
import { trackLead } from '@/lib/track';

export default function PlantillaGratuita() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, source: 'plantilla' }),
      });
      if (!res.ok) throw new Error('subscribe_failed');
      trackLead(formData.email);
      setIsSubmitted(true);
    } catch {
      setErrorMsg('Hubo un problema al enviar tus datos. Intenta de nuevo en un momento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    "Calcula tu Índice de Presión de Deuda (IPD) automáticamente",
    "Descubre en cuál de las cuatro fases estás: Déficit, Oxígeno, Bola de Nieve o Avalancha",
    "Te dice con qué criterio pagar en tu fase, y por qué ese y no otro",
    "Diagnostica deuda por deuda: cuál te está asfixiando y cuál conviene renegociar",
    "Obtén la misma claridad que me ayudó a eliminar $90,000 en deudas",
    "Sin descargar nada ni pelearte con fórmulas: funciona en el navegador"
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 to-primary-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-2xl p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="heading-lg text-neutral-900 mb-3">
              Revisa tu correo
            </h1>
            <p className="text-neutral-600 mb-2">
              Te mandé un correo con un botón de confirmación. Un clic y quedas dentro.
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              Lo pido para asegurarme de que el correo es tuyo y de que lo que te mande te llegue de
              verdad. Si no aparece en unos minutos, mira en spam.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/diagnostico" className="btn-primary inline-flex items-center justify-center">
                Mientras tanto, entra al GPS
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/" className="btn-secondary">
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-primary-50">
      <div className="section-container py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Paso 1 de 2</div>
            <div className="w-32 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-2 bg-accent-500 w-1/2"></div>
            </div>
          </div>
          <Countdown durationSeconds={15 * 60} size="sm" />
        </div>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-accent-500 text-white px-4 py-2 rounded-full mb-6">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Herramienta Gratuita</span>
            </div>
            
            <h1 className="heading-xl text-neutral-900 mb-6 text-balance">
              Descubre en 15 Minutos Qué Estrategia Usar para{' '}
              <span className="text-accent-500">Eliminar tus Deudas</span>
            </h1>
            
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              (Aunque sientas que no te alcanza el dinero)
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Benefits */}
            <div className="space-y-8">
              <div>
                <h2 className="heading-md text-neutral-900 mb-6">
                  Con la herramienta podrás:
                </h2>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-accent-500 mt-1 flex-shrink-0" />
                      <span className="text-neutral-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center">
                  <Calculator className="h-5 w-5 text-accent-500 mr-2" />
                  Lo que vas a ver
                </h3>
                <div className="space-y-3">
                  <div className="bg-neutral-50 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tu IPD®:</span>
                      <span className="text-accent-500 font-bold">Se calcula automáticamente</span>
                    </div>
                  </div>
                  <div className="bg-primary-50 p-3 rounded">
                    <div className="text-sm">
                      <strong>Estrategia recomendada:</strong> Bola de Nieve
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-sm">
                      <strong>Tiempo estimado:</strong> 18 meses libre de deudas
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-500">15</div>
                  <div className="text-xs text-neutral-600">Minutos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-500">100%</div>
                  <div className="text-xs text-neutral-600">Gratis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-500">30 días</div>
                  <div className="text-xs text-neutral-600">Garantía</div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  Entra Gratis Ahora
                </h3>
                <p className="text-neutral-600">
                  Acceso inmediato • Sin spam • 100% gratuita
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                    Tu Nombre *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200"
                    placeholder="Escribe tu nombre"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Tu Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200"
                    placeholder="tu@email.com"
                  />
                </div>

                {errorMsg ? (
                  <p role="alert" className="text-sm text-red-600 -mt-2">{errorMsg}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      ¡Quiero calcular mi IPD!
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Security & Privacy */}
              <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-neutral-600">
                    <p className="font-medium text-neutral-900 mb-1">Tu privacidad está protegida</p>
                    <p>Acepto recibir correos de Deuda Fuera, Paz Dentro. No compartimos tu información y puedes darte de baja cuando quieras. <a href="/privacidad" className="underline">Política de privacidad</a>.</p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500 mb-3">
                  <Clock className="h-4 w-4" />
                  <span>Acceso inmediato · Sin spam</span>
                </div>
                                 <p className="text-xs text-neutral-400">
                   &quot;Por fin entiendo mis deudas. En 15 minutos tuve claridad total.&quot; - Ana M.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 