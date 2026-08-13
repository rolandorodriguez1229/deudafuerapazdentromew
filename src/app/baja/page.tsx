import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';
import { unsubscribeLead } from '@/lib/leads';

export const metadata: Metadata = {
  title: 'Darse de baja',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * Baja en un clic, sin login y sin preguntas.
 *
 * GDPR pide que retirar el consentimiento sea tan fácil como darlo, y CAN-SPAM
 * que se procese sin poner obstáculos. Por eso la baja ocurre al cargar la
 * página: no hay formulario de confirmación ni "¿seguro que quieres irte?".
 *
 * El token no caduca — CASL exige que el enlace de un correo ya enviado siga
 * funcionando 60 días después.
 */
export default async function BajaPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const resultado = t ? await unsubscribeLead(t) : null;

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 sm:p-10 text-center">
        {resultado ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-8 w-8 text-green-600" aria-hidden />
            </div>
            <h1 className="heading-md text-neutral-900 mb-3">Listo, no te escribo más</h1>
            <p className="text-neutral-600 mb-2">
              Diste de baja <strong>{resultado.email}</strong>. El cambio ya está hecho, no hay nada
              más que hacer.
            </p>
            <p className="text-sm text-neutral-500 mb-6">
              El GPS Anti-Deuda sigue siendo tuyo y gratis: darte de baja del correo no te quita el
              acceso.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/diagnostico" className="btn-secondary">
                Ir al GPS
              </Link>
              <Link href="/" className="btn-secondary">
                Volver al inicio
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle className="h-8 w-8 text-amber-600" aria-hidden />
            </div>
            <h1 className="heading-md text-neutral-900 mb-3">No reconocimos este enlace</h1>
            <p className="text-neutral-600 mb-6">
              Puede que ya te hayas dado de baja. Si sigues recibiendo correos, responde a
              cualquiera de ellos y lo arreglo a mano.
            </p>
            <Link href="/" className="btn-secondary">
              Volver al inicio
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
