'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, ArrowRight } from 'lucide-react';

export default function GuiaEstrategias() {
  const [formData, setFormData] = useState({ name: '', email: '' });
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

  if (isSubmitted) {
    return (
      <main>
        <section className="min-h-screen bg-gradient-to-br from-accent-50 to-primary-50 flex items-center">
          <div className="section-container py-12 max-w-3xl">
            <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="heading-lg text-neutral-900 mb-2">¡Listo! Descarga tu Guía</h1>
              <p className="text-neutral-600 mb-6">Te enviamos un email de confirmación. Mientras tanto, puedes descargar la guía ahora.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/downloads/guia-estrategias.pdf" className="btn-primary" download>
                  Descargar Guía PDF
                </a>
                <Link href="/comprar" className="btn-urgent">
                  Ver Paquete Completo <ArrowRight className="ml-2 h-5 w-5" />
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
              <span className="text-sm font-medium">Guía PDF</span>
            </div>
            <h1 className="heading-lg text-neutral-900 mb-3">Guía de Estrategias: Oxígeno, Nieve y Avalancha</h1>
            <p className="text-neutral-600">Descarga un resumen práctico para saber qué hacer según tu IPD y cuándo cambiar de estrategia.</p>
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
            <button type="submit" disabled={isSubmitting} className="mt-6 w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Enviando...' : 'Quiero la Guía PDF'}
            </button>
            <p className="text-xs text-neutral-500 mt-3 text-center">Recibirás la guía por email. Puedes cancelar la suscripción cuando quieras.</p>
          </form>
        </div>
      </section>
    </main>
  );
}


