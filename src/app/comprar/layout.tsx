import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comprar el libro — eBook + bonos',
  description:
    'Obtén Deuda Fuera, Paz Dentro por $7.99: eBook + Plantilla IPD 360°, Checklist 30-60-90 y Scripts para negociar. Garantía de 30 días.',
  alternates: { canonical: '/comprar' },
  openGraph: {
    title: 'Comprar Deuda Fuera, Paz Dentro — eBook + bonos',
    description:
      'eBook + 3 bonos ($74.97 de valor) por solo $7.99 en oferta de lanzamiento. Pago seguro con Stripe.',
    url: '/comprar',
    type: 'website',
  },
};

export default function ComprarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
