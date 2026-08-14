import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Download, FileText, XCircle } from 'lucide-react';
import { buscarGrant, firmarEntregables, hasEntregas, registrarDescarga } from '@/lib/entregas';

export const metadata: Metadata = {
  title: 'Tus descargas',
  robots: { index: false, follow: false },
};

// Nunca cachear: cada visita firma URLs nuevas, y una página cacheada serviría
// enlaces vencidos — o peor, los de otra persona.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DescargasPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const grant = t && hasEntregas() ? await buscarGrant(t) : null;
  const archivos = grant ? await firmarEntregables(grant.tipo) : [];
  if (grant) await registrarDescarga(grant.id);

  if (!grant) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-xl p-8 sm:p-10 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle className="h-8 w-8 text-amber-600" aria-hidden />
          </div>
          <h1 className="heading-md text-neutral-900 mb-3">Este enlace no es válido</h1>
          <p className="text-neutral-600 mb-6">
            Puede que haya caducado o que se haya copiado a medias. Busca el correo que te
            enviamos y entra desde ahí — o escríbeme respondiendo a ese correo y lo resuelvo.
          </p>
          <Link href="/" className="btn-secondary">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  const esCompra = grant.tipo === 'compra';

  return (
    <main className="min-h-screen bg-neutral-50 py-14 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary-700 bg-primary-50 rounded-full px-3 py-1 mb-5">
            <Download className="h-3.5 w-3.5" aria-hidden />
            {esCompra ? 'Tu compra' : 'Tu descarga'}
          </div>

          <h1 className="heading-md text-neutral-900 mb-2">
            {esCompra ? 'Aquí está tu libro' : 'Aquí está tu guía'}
          </h1>
          <p className="text-neutral-600 mb-8">
            Enlaces para <strong>{grant.email}</strong>. Vencen en 15 minutos por seguridad; si
            se te pasan, vuelve a abrir esta página y se generan de nuevo.
          </p>

          <ul className="space-y-3">
            {archivos.map((a) => (
              <li
                key={a.ruta}
                className="flex items-start gap-4 border border-neutral-200 rounded-xl p-4"
              >
                <FileText className="h-5 w-5 text-primary-600 shrink-0 mt-1" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-neutral-900">{a.nombre}</div>
                  <p className="text-sm text-neutral-600 mt-0.5">{a.descripcion}</p>
                </div>
                <a
                  href={a.url}
                  download={a.archivo}
                  className="btn-primary shrink-0 py-2 px-4 text-sm"
                >
                  Descargar
                </a>
              </li>
            ))}
          </ul>

          <p className="text-xs text-neutral-500 mt-6">
            Guarda los archivos en tu dispositivo. Este enlace es tuyo: si lo compartes, cualquiera
            con él entra a tus descargas.
          </p>
        </div>

        <div className="mt-6 bg-white rounded-xl border border-neutral-200 p-6 sm:p-7">
          <h2 className="font-semibold text-neutral-900 mb-1">
            {esCompra ? 'Empieza por aquí' : 'La herramienta del libro es gratis'}
          </h2>
          <p className="text-sm text-neutral-600 mb-4">
            {esCompra
              ? 'El Capítulo 3 te pide tus números. El GPS los calcula por ti en 15 minutos, y te dice en cuál de las cuatro fases estás.'
              : 'La guía te dice qué hacer en cada fase. El GPS te dice en cuál estás, con tus propios números.'}
          </p>
          <Link href="/diagnostico" className="btn-secondary inline-flex items-center">
            Calcular mi IPD gratis
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </main>
  );
}
