'use client';

import { useState } from 'react';
import Link from 'next/link';
import Countdown from '@/components/Countdown';
import { CheckCircle, Download, Clock, Shield, Calculator, ArrowRight } from 'lucide-react';

export default function PlantillaGratuita() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });
      if (!res.ok) throw new Error('subscribe_failed');
      setIsSubmitted(true);
    } catch (_err) {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    "Calcula tu Índice de Presión de Deuda (IPD) automáticamente",
    "Descubre al instante si necesitas aplicar la estrategia Oxígeno Rápido, Bola de Nieve o Avalancha",
    "Obtén la misma claridad que me ayudó a eliminar $90,000 en deudas",
    "Plan mes a mes personalizado para tu situación específica",
    "Hojas de seguimiento de progreso incluidas",
    "Fórmulas automáticas que hacen los cálculos por ti"
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 to-primary-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="heading-lg text-neutral-900 mb-3">
              ¡Perfecto! Confirma tu Correo
            </h1>
            <p className="text-neutral-600 mb-6">
              Te enviamos la Plantilla de Diagnóstico 360°. Revisa tu bandeja y confirma tu email.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 inline-flex items-center gap-3">
              <Countdown durationSeconds={10 * 60} size="sm" />
              <span className="text-sm text-yellow-800">Oferta del paquete completo activa mientras dure el contador.</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/comprar" className="btn-urgent">
                Ver Paquete Completo con Descuento
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
              <span className="text-sm font-medium">Descarga Gratuita</span>
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
                  Con esta plantilla podrás:
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
                  Vista Previa de la Plantilla
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
                  <div className="text-2xl font-bold text-accent-500">5,000+</div>
                  <div className="text-xs text-neutral-600">Usuarios</div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  Obtén Tu Plantilla Ahora
                </h3>
                <p className="text-neutral-600">
                  Descarga inmediata • Sin spam • 100% gratuita
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
                      ¡Quiero mi Plantilla Gratis!
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
                    <p>No compartimos tu información. Puedes cancelar la suscripción cuando quieras.</p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500 mb-3">
                  <Clock className="h-4 w-4" />
                  <span>Más de 1,000 descargas esta semana</span>
                </div>
                                 <p className="text-xs text-neutral-400">
                   &quot;Por fin entiendo mis deudas. La plantilla me dio claridad total.&quot; - Ana M.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 