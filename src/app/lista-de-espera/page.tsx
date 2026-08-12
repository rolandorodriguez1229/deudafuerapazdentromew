'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle, Compass } from 'lucide-react';
import { trackLead } from '@/lib/track';

export default function ListaDeEspera() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, source: 'lista-espera' }),
      });
      if (!res.ok) throw new Error('subscribe_failed');
      trackLead(form.email);
      setDone(true);
    } catch {
      setError('Hubo un problema al guardar tu correo. Intenta de nuevo en un momento.');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 sm:p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-8 w-8 text-green-600" aria-hidden />
          </div>
          <h1 className="heading-md text-neutral-900 mb-3">Quedaste en la lista</h1>
          <p className="text-neutral-600 mb-6">
            Te escribo en cuanto el libro esté listo. Mientras tanto, la herramienta del libro ya
            funciona y es gratis — es el mismo método, sin esperar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/diagnostico" className="btn-primary inline-flex items-center justify-center">
              Calcular mi IPD gratis
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Link>
            <Link href="/" className="btn-secondary">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 py-14 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary-700 bg-primary-50 rounded-full px-3 py-1 mb-5">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            El libro está en preparación
          </div>

          <h1 className="heading-md text-neutral-900 mb-3">
            Deuda Fuera, Paz Dentro sale pronto
          </h1>
          <p className="text-neutral-600 mb-2">
            El manuscrito está terminado. Ahora lo estoy preparando en formato digital, y no quiero
            venderlo hasta que la entrega esté a la altura del libro.
          </p>
          <p className="text-neutral-600 mb-7">
            Déjame tu correo y te aviso el día que salga. Quienes están en la lista lo reciben
            primero.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-neutral-700 mb-1">
                Tu nombre
              </label>
              <input
                id="nombre"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                placeholder="María"
              />
            </div>
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-neutral-700 mb-1">
                Tu correo
              </label>
              <input
                id="correo"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                placeholder="maria@correo.com"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={sending} className="btn-primary w-full disabled:opacity-60">
              {sending ? 'Guardando…' : 'Avísame cuando salga'}
            </button>
            <p className="text-xs text-neutral-500 text-center">
              Solo para avisarte del lanzamiento. Puedes darte de baja cuando quieras.{' '}
              <Link href="/privacidad" className="underline">
                Política de privacidad
              </Link>
              .
            </p>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7">
          <div className="flex items-start gap-3">
            <Compass className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
            <div>
              <h2 className="font-semibold text-neutral-900 mb-1">
                No tienes que esperar al libro para empezar
              </h2>
              <p className="text-sm text-neutral-600 mb-4">
                El GPS Anti-Deuda ya está funcionando y es gratis. Calcula tu Índice de Presión de
                Deuda, te dice en cuál de las cuatro fases estás y con qué criterio pagar en cada
                una. Es el método del libro, en 15 minutos.
              </p>
              <Link href="/diagnostico" className="btn-secondary inline-flex items-center">
                Calcular mi IPD gratis
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
