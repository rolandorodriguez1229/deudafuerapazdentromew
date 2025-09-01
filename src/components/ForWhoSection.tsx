export default function ForWhoSection() {
  const bullets = [
    '✔️ Estás pagando mínimos y sientes que no avanzas.',
    '✔️ Tu deuda te roba el sueño y la paz mental.',
    '✔️ Ya intentaste métodos como Bola de Nieve o Avalancha sin éxito.',
    '✔️ Quieres un plan simple, probado y paso a paso.',
  ];

  return (
    <section className="py-16 bg-neutral-50">
      <div className="section-container max-w-4xl">
        <h2 className="heading-lg text-neutral-900 mb-6">Esto es para ti si…</h2>
        <div className="grid gap-3">
          {bullets.map((b) => (
            <div key={b} className="bg-white border border-neutral-200 rounded-lg p-4 text-neutral-800">
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


