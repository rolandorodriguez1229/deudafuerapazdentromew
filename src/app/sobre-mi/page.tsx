import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthorSection from '@/components/AuthorSection';

export const metadata: Metadata = {
  title: 'Sobre Rolando Rodríguez | Deuda Fuera, Paz Dentro',
  description:
    'Autor del método IPD y del libro Deuda Fuera, Paz Dentro. Cómo salí de $90,000 en deudas y por qué ayudo a familias hispanas a recuperar su paz financiera.',
  alternates: { canonical: '/sobre-mi' },
};

export default function SobreMiPage() {
  return (
    <main>
      <Header />
      <AuthorSection />
      <section className="py-16 bg-white">
        <div className="section-container max-w-3xl text-center">
          <h2 className="heading-md text-neutral-900 mb-4">¿Listo para aplicar el método?</h2>
          <p className="text-neutral-700 mb-6">Descarga la plantilla gratuita o lleva el libro completo con bonos.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/plantilla-gratuita" className="btn-urgent">Plantilla Gratuita</Link>
            <Link href="/comprar" className="btn-primary">Ver el libro</Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
