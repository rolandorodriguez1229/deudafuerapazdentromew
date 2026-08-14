import { CheckCircle } from 'lucide-react';

export default function ForWhoSection() {
  // Icono de lucide en vez de ✔️: el emoji se dibuja distinto en cada
  // sistema y es la misma lista de comprobación que el resto del sitio.
  const bullets = [
    'Estás pagando mínimos y sientes que no avanzas.',
    'Tu deuda te roba el sueño y la paz mental.',
    'Ya intentaste métodos como Bola de Nieve o Avalancha sin éxito.',
    'Quieres un plan simple, probado y paso a paso.',
  ];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="section-container max-w-4xl">
        <h2 className="heading-lg text-neutral-900 mb-6">Esto es para ti si…</h2>
        <div className="grid gap-3">
          {bullets.map((b) => (
            <div key={b} className="bg-white border border-neutral-200 rounded-xl p-4 text-neutral-800 flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


