import Link from 'next/link';
import { CheckCircle, FileText, Download } from 'lucide-react';

export default function GraciasPage() {
  return (
    <main>
      <section className="min-h-screen bg-gradient-to-br from-accent-50 to-primary-50 flex items-center">
        <div className="section-container py-16 max-w-3xl">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="heading-lg text-neutral-900 mb-2">¡Pago confirmado!</h1>
            <p className="text-neutral-600 mb-6">Gracias por tu compra. Te enviamos un correo con tu recibo y enlaces de descarga.</p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <a href="/downloads/guia-estrategias.pdf" className="btn-primary inline-flex items-center justify-center" download>
                <FileText className="mr-2 h-5 w-5" /> Descargar Guía
              </a>
              <a href="/downloads/scripts-negociacion.txt" className="btn-secondary inline-flex items-center justify-center" download>
                <Download className="mr-2 h-5 w-5" /> Scripts de negociación
              </a>
            </div>
            <Link href="/" className="text-primary-600 font-semibold">Volver al inicio</Link>
          </div>
        </div>
      </section>
    </main>
  );
}


