'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, ArrowRight } from 'lucide-react';
import { trackLead } from '@/lib/track';

export default function GuiaEstrategias() {
  const [formData, setFormData] = useState({ name: '', email: '' });
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
        body: JSON.stringify({ name: formData.name, email: formData.email, source: 'guia-estrategias' }),
      });
      if (!res.ok) throw new Error('subscribe_failed');
      trackLead(formData.email);
      setIsSubmitted(true);
    } catch {
      // Antes esto marcaba éxito igual: el usuario veía "¡Listo!" con su correo
      // perdido y sin forma de saberlo.
      setErrorMsg('Hubo un problema al guardar tu correo. Intenta de nuevo en un momento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main>
        <section className="min-h-screen bg-gradient-to-br from-accent-50 to-primary-50 flex items-center">
          <div className="section-container py-12 max-w-3xl">
            <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="heading-lg text-neutral-900 mb-2">Revisa tu correo</h1>
              <p className="text-neutral-600 mb-2">
                Te mandé un correo con un botón de confirmación. Un clic y quedas dentro.
              </p>
              <p className="text-sm text-neutral-500 mb-6">
                En vez de un PDF que se queda viejo, te doy la herramienta que hace los cálculos por
                ti. Si el correo no aparece en unos minutos, mira en spam.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/diagnostico" className="btn-primary inline-flex items-center justify-center">
                  Mientras tanto, entra al GPS <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="/" className="btn-secondary">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="min-h-screen bg-white">
        <div className="section-container py-16 max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 bg-accent-500 text-white px-4 py-2 rounded-full mb-6">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Guía gratuita</span>
            </div>
            <h1 className="heading-lg text-neutral-900 mb-3">Guía de Estrategias: las cuatro fases del Selector</h1>
            <p className="text-neutral-600">Déficit, Oxígeno, Bola de Nieve y Avalancha: en cuál estás, con qué criterio pagar en cada una y cuándo te toca cambiar.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-2xl p-8 border border-neutral-200">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">Tu Nombre *</label>
                <input id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent" placeholder="Escribe tu nombre" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">Tu Correo *</label>
                <input id="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent" placeholder="tu@email.com" />
              </div>
            </div>
            {errorMsg && (
              <p role="alert" className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {errorMsg}
              </p>
            )}
            <button type="submit" disabled={isSubmitting} className="mt-6 w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Enviando...' : 'Quiero la guía'}
            </button>
            <p className="text-xs text-neutral-500 mt-3 text-center">Acepto recibir correos de Deuda Fuera, Paz Dentro. Puedo darme de baja cuando quiera. <a href="/privacidad" className="underline">Política de privacidad</a>.</p>
          </form>
        </div>
      </section>
    </main>
  );
}


