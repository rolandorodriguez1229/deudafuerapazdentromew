import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plantilla IPD Gratuita — calcula tu estrategia en 15 min',
  description:
    'Descarga gratis la Plantilla de Diagnóstico 360°. Calcula tu IPD y descubre si te conviene Oxígeno Rápido, Bola de Nieve o Avalancha.',
  alternates: { canonical: '/plantilla-gratuita' },
  openGraph: {
    title: 'Plantilla IPD Gratuita | Deuda Fuera, Paz Dentro',
    description: 'Calcula tu IPD y tu estrategia ideal en 15 minutos. 100% gratis.',
    url: '/plantilla-gratuita',
    type: 'website',
  },
};

export default function PlantillaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
