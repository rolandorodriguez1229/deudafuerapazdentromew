export default function BenefitsSection() {
  const items = [
    'Recuperarás flujo de efectivo en semanas, no en años.',
    'Dormirás tranquilo con un plan claro y realista.',
    'Sabrás exactamente qué deuda pagar primero y por qué.',
    'Evitarás errores que cuestan miles en intereses.',
    'Usarás el dinero como herramienta, no como cadena.',
  ];
  return (
    <section className="py-16 bg-neutral-50">
      <div className="section-container max-w-5xl">
        <h2 className="heading-lg text-neutral-900 mb-8">Beneficios claros</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((t) => (
            <div key={t} className="bg-white rounded-xl p-5 border border-neutral-200">
              <div className="text-green-600 font-semibold mb-1">✅</div>
              <p className="text-neutral-700">{t}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <a href="/comprar" className="btn-primary">Quiero mi copia ahora</a>
        </div>
      </div>
    </section>
  );
}


