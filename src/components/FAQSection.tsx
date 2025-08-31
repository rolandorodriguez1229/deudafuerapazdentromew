const faqs = [
  {
    q: '¿Y si no me alcanza el dinero cada mes?',
    a: 'El IPD® primero crea oxígeno financiero. No requiere aumentar tus ingresos para empezar a ver resultados.'
  },
  {
    q: '¿Cuánto tiempo me tomará salir de deudas?',
    a: 'Depende de tu IPD y tus saldos actuales. La mayoría ve progreso en el primer mes y claridad total en 90 días.'
  },
  {
    q: '¿Esto funciona si tengo muchas deudas diferentes?',
    a: 'Sí. El sistema prioriza inteligentemente tus pagos según tu IPD y tu contexto.'
  },
  {
    q: '¿Necesito ser “bueno con los números”?',
    a: 'No. La plantilla hace los cálculos automáticamente y te dice exactamente qué hacer.'
  },
];

export default function FAQSection() {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="heading-lg text-neutral-900 mb-4">Preguntas Frecuentes</h2>
          <p className="text-neutral-600">Resolvamos tus dudas antes de comprar</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group bg-white rounded-lg border border-neutral-200 p-6">
              <summary className="cursor-pointer font-semibold text-neutral-900 marker:hidden flex items-center justify-between">
                {f.q}
                <span className="text-primary-600 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="mt-2 text-neutral-700">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}


